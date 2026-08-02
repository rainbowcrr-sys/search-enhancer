/* ============================================================
   Search Enhancer - content.js
   - Keyword highlighting
   - Result type labeling (official / baijiahao / ad / forum / video / scholar)
   - Ad detection: engine markers + keyword fallback + user custom rules
   - Ad collapsing with summary row
   搜索增强器 - 内容脚本
   - 关键词高亮
   - 结果类型标注
   - 广告识别：引擎标记 + 关键词 + 用户自定义
   - 广告折叠 + 摘要行
   ============================================================ */

(() => {
  'use strict';

  /* ---------- i18n strings ---------- */
  const I18N = {
    en: {
      official: 'Official',
      baijiahao: 'Baijiahao',
      ad: 'Ad',
      forum: 'Forum',
      video: 'Video',
      scholar: 'Scholar',
      unknown: 'Page',
      hiddenAds: 'Hidden {n} ad(s). Click to show.',
      showAds: 'Show ads',
      hideAds: 'Hide ads',
      toggle: 'SE',
    },
    zh: {
      official: '官网',
      baijiahao: '百家号',
      ad: '广告',
      forum: '论坛',
      video: '视频',
      scholar: '学术',
      unknown: '网页',
      hiddenAds: '已隐藏 {n} 条广告，点击展开。',
      showAds: '显示广告',
      hideAds: '隐藏广告',
      toggle: '增强',
    },
  };
  const lang = (navigator.language || 'en').toLowerCase().startsWith('zh') ? 'zh' : 'en';
  const t = (k) => (I18N[lang][k] || k);

  /* ---------- Detect engine ---------- */
  const host = location.hostname;
  const engine = host.includes('baidu.com') ? 'baidu'
    : host.includes('bing.com') ? 'bing'
    : host.includes('google.') ? 'google' : 'unknown';

  /* ---------- Default ad selectors per engine ---------- */
  const AD_SELECTORS = {
    google: [
      'div[aria-label="Ads"]',                       // modern
      'div[data-text-ad]',
      'div[data-ads-dv]',
      'div[tcu-data-ved][data-ved*="0:0"]',          // rough heuristic
      'div[role="region"][aria-label*="ad" i]',
    ],
    bing: [
      'li[data-advertisement]',
      'ol#b_results > li[data-advertisement]',
      'div.ad_carousel',
      'div[id^="ad_"]',
    ],
    baidu: [
      '#content_left .result-op[class*="ec-"]',
      '#content_left .result[class*="c-ad"]',
      '#content_left .result-op .ec-tuition',
      '#content_left .result .c-icon-pay',
      '#content_left .result-op[data-isad="1"]',
      '#content_left .result .c-ad',
    ],
  };

  /* ---------- Ad keyword fallback (case-insensitive) ---------- */
  const AD_KEYWORDS = [
    '广告', '推广', 'sponsored', 'sponsored ad', 'ad ·', '广告 ·',
  ];

  /* ---------- Result-type heuristics (non-ad) ---------- */
  function detectType(el) {
    const html = el.innerHTML || '';
    const text = el.textContent || '';
    const href = (el.querySelector('a[href]')?.href || '').toLowerCase();

    // Baidu baijiahao
    if (engine === 'baidu' && /baijiahao|百家号/.test(html + text)) return 'baijiahao';
    // Video
    if (/\/video\/|youtube\.com\/watch|v\.qq\.com|bilibili\.com|youku\.com|iqiyi\.com/.test(href)) return 'video';
    // Forum / community
    if (/tieba\.baidu\.com|zhihu\.com|reddit\.com|stackoverflow\.com|v2ex\.com|douban\.com/.test(href)) return 'forum';
    // Scholar
    if (/scholar\.google\.|xueshu\.baidu\.com|sciencedirect|springer|ieee\.org/.test(href)) return 'scholar';
    // Official guess: HTTPS + short path + brand-ish title
    if (href.startsWith('https://') && !/blog|forum|tieba|zhihu|reddit/.test(href)) {
      // crude official: hostname length < 22 and no path nesting
      try {
        const u = new URL(href);
        if (u.hostname.length < 22 && u.pathname.split('/').filter(Boolean).length <= 2) return 'official';
      } catch {}
    }
    return 'unknown';
  }

  /* ---------- Keyword highlight ---------- */
  function getQuery() {
    if (engine === 'google') return new URLSearchParams(location.search).get('q') || '';
    if (engine === 'bing')   return new URLSearchParams(location.search).get('q') || '';
    if (engine === 'baidu')  return new URLSearchParams(location.search).get('wd') || '';
    return '';
  }
  function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function highlight(text, terms) {
    if (!terms.length) return text;
    const re = new RegExp(`(${terms.map(escapeRe).join('|')})`, 'gi');
    return text.replace(re, '<se-mark class="se-mark">$1</se-mark>');
  }
  function highlightNode(node, terms) {
    if (!node || !terms.length) return;
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, {
      acceptNode(n) { return /^\s*$/.test(n.nodeValue) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; }
    });
    const targets = [];
    let n; while ((n = walker.nextNode())) targets.push(n);
    const re = new RegExp(`(${terms.map(escapeRe).join('|')})`, 'gi');
    targets.forEach(tn => {
      if (tn.parentElement && tn.parentElement.closest('.se-mark, se-mark')) return;
      const html = tn.nodeValue.replace(re, '<se-mark class="se-mark">$1</se-mark>');
      if (html !== tn.nodeValue) {
        const span = document.createElement('span');
        span.innerHTML = html;
        tn.replaceWith(...span.childNodes);
      }
    });
  }

  /* ---------- Ad detection ---------- */
  function isAdBySelector(el) {
    return AD_SELECTORS[engine].some(sel => el.matches && el.matches(sel)) ||
           el.querySelector && AD_SELECTORS[engine].some(sel => el.querySelector(sel));
  }
  function isAdByKeyword(el) {
    const txt = (el.textContent || '').toLowerCase();
    return AD_KEYWORDS.some(k => txt.includes(k.toLowerCase()));
  }
  function isAdByCustom(el, customSelectors) {
    return customSelectors.some(sel => {
      try { return el.matches(sel) || (el.querySelector && el.querySelector(sel)); }
      catch { return false; }
    });
  }

  /* ---------- Build label dot ---------- */
  function makeLabel(type) {
    const span = document.createElement('span');
    span.className = `se-label se-label--${type}`;
    span.title = t(type);
    return span;
  }

  /* ---------- Per-result processors ---------- */
  function getResultContainers() {
    if (engine === 'google') return Array.from(document.querySelectorAll('div.g, div[data-hveid]'));
    if (engine === 'bing')   return Array.from(document.querySelectorAll('li.b_algo'));
    if (engine === 'baidu')  return Array.from(document.querySelectorAll('#content_left .result, #content_left .result-op'));
    return [];
  }

  /* ---------- Toolbar ---------- */
  let adsHidden = true;
  let hiddenCount = 0;
  function buildToolbar() {
    const bar = document.createElement('div');
    bar.className = 'se-toolbar';
    bar.innerHTML = `
      <strong style="color:#0f172a">Search Enhancer</strong>
      <span class="se-stat" data-stat></span>
      <button data-act="toggleAds">${t('showAds')}</button>
    `;
    bar.querySelector('[data-act="toggleAds"]').addEventListener('click', () => {
      adsHidden = !adsHidden;
      document.querySelectorAll('.se-ad-collapsed').forEach(el => {
        el.classList.toggle('se-ad-collapsed', adsHidden);
      });
      bar.querySelector('[data-act="toggleAds"]').textContent = adsHidden ? t('showAds') : t('hideAds');
    });
    return bar;
  }

  /* ---------- Main run ---------- */
  async function loadCustomRules() {
    try {
      const cfg = await chrome.storage.local.get(['customSelectors', 'customKeywords', 'highlightEnabled', 'labelEnabled', 'collapseAds']);
      return {
        selectors: Array.isArray(cfg.customSelectors) ? cfg.customSelectors : [],
        keywords:  Array.isArray(cfg.customKeywords)  ? cfg.customKeywords  : [],
        highlight: cfg.highlightEnabled !== false,
        label:     cfg.labelEnabled     !== false,
        collapse:  cfg.collapseAds     !== false,
      };
    } catch { return { selectors: [], keywords: [], highlight: true, label: true, collapse: true }; }
  }

  function processResults(cfg) {
    const query = getQuery();
    const terms = query ? query.split(/\s+/).filter(w => w.length >= 2) : [];
    const results = getResultContainers();
    let adCount = 0;

    results.forEach(el => {
      if (el.dataset.seDone) return;
      el.dataset.seDone = '1';

      const isAd = isAdBySelector(el) || isAdByKeyword(el) || isAdByCustom(el, cfg.selectors);
      if (isAd) {
        el.classList.add('se-ad');
        adCount++;
        if (cfg.collapse) el.classList.add('se-ad-collapsed');
      }

      // Label
      if (cfg.label && !isAd) {
        const type = detectType(el);
        const label = makeLabel(type);
        // prepend to first link or to container
        const target = el.querySelector('a[href]') || el.firstElementChild || el;
        if (target.parentNode) {
          const wrap = document.createElement('div');
          wrap.className = 'se-row';
          target.parentNode.insertBefore(wrap, target);
          wrap.appendChild(label);
          wrap.appendChild(target);
        } else {
          el.prepend(label);
        }
      }

      // Highlight query terms in title + snippet
      if (cfg.highlight && terms.length) {
        const titleEl = el.querySelector('h3, .t, .b_algo h2, .r') || el;
        const snippetEl = el.querySelector('.a, .c-abstract, .b_caption, div[data-content-feature]') || null;
        highlightNode(titleEl, terms);
        if (snippetEl) highlightNode(snippetEl, terms);
      }
    });

    return adCount;
  }

  /* ---------- Init ---------- */
  async function init() {
    const cfg = await loadCustomRules();
    const bar = buildToolbar();
    // Insert toolbar near top of results
    let anchor = null;
    if (engine === 'google') anchor = document.getElementById('rcnt') || document.getElementById('search');
    if (engine === 'bing')   anchor = document.getElementById('b_results');
    if (engine === 'baidu')  anchor = document.getElementById('content_left');
    if (anchor && !anchor.dataset.seBar) {
      anchor.dataset.seBar = '1';
      anchor.prepend(bar);
    }

    const adCount = processResults(cfg);
    hiddenCount = adCount;
    if (bar.querySelector('[data-stat]')) {
      bar.querySelector('[data-stat]').textContent =
        (lang === 'zh' ? `共处理 ${getResultContainers().length} 条，广告 ${adCount}` : `Processed ${getResultContainers().length} results, ads ${adCount}`);
    }

    // Re-run on SPA navigation (Google/Bing are SPAs)
    let lastUrl = location.href;
    new MutationObserver(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        setTimeout(() => { const n = processResults(cfg); hiddenCount = n; }, 600);
      }
    }).observe(document.body, { childList: true, subtree: true });
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
