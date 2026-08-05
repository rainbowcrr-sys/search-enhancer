/* ============================================================
   Search Enhancer - content.js v0.1.4
   - Keyword highlighting + Pop animation (keyword pop-out effect)
   - Result type labeling (official / baijiahao / ad / forum / video / scholar)
   - Ad detection: engine markers + keyword fallback + user custom rules
   - Ad collapsing with summary row
   - Custom dot size & colors (from chrome.storage)
   - Keyword Pop: search terms get a bounce/pop animation + glow border
   搜索增强器 - 内容脚本
   - 关键词高亮 + 弹跳突出动画
   - 结果类型标注
   - 广告识别：引擎标记 + 关键词 + 用户自定义
   - 广告折叠 + 摘要行
   - 自定义圆点大小与颜色
   - 关键词弹跳：命中词带弹跳动画 + 发光描边
   ============================================================ */

(() => {
  'use strict';

  /* ---------- i18n via chrome.i18n ---------- */
  const t = (k, sub) => {
    let m = (chrome.i18n && chrome.i18n.getMessage(k)) || k;
    if (sub !== undefined) m = m.replace('$N$', sub);
    return m;
  };

  /* ---------- Detect engine ---------- */
  const host = location.hostname;
  const engine = host.includes('baidu.com') ? 'baidu'
    : host.includes('bing.com') ? 'bing'
    : host.includes('google.') ? 'google' : 'unknown';

  /* ---------- Default ad selectors per engine ---------- */
  const AD_SELECTORS = {
    google: [
      'div[aria-label="Ads"]',
      'div[data-text-ad]',
      'div[data-ads-dv]',
      'div[tcu-data-ved][data-ved*="0:0"]',
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

    if (engine === 'baidu' && /baijiahao|百家号/.test(html + text)) return 'baijiahao';
    if (/\/video\/|youtube\.com\/watch|v\.qq\.com|bilibili\.com|youku\.com|iqiyi\.com/.test(href)) return 'video';
    if (/tieba\.baidu\.com|zhihu\.com|reddit\.com|stackoverflow\.com|v2ex\.com|douban\.com/.test(href)) return 'forum';
    if (/scholar\.google\.|xueshu\.baidu\.com|sciencedirect|springer|ieee\.org/.test(href)) return 'scholar';
    if (href.startsWith('https://') && !/blog|forum|tieba|zhihu|reddit/.test(href)) {
      try {
        const u = new URL(href);
        if (u.hostname.length < 22 && u.pathname.split('/').filter(Boolean).length <= 2) return 'official';
      } catch {}
    }
    return 'unknown';
  }

  /* ---------- Keyword highlight with Pop animation ---------- */
  function getQuery() {
    if (engine === 'google') return new URLSearchParams(location.search).get('q') || '';
    if (engine === 'bing')   return new URLSearchParams(location.search).get('q') || '';
    if (engine === 'baidu')  return new URLSearchParams(location.search).get('wd') || '';
    return '';
  }
  function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  function highlightNode(node, terms, enablePop) {
    if (!node || !terms.length) return;
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, {
      acceptNode(n) { return /^\s*$/.test(n.nodeValue) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; }
    });
    const targets = [];
    let n; while ((n = walker.nextNode())) targets.push(n);
    const re = new RegExp(`(${terms.map(escapeRe).join('|')})`, 'gi');
    targets.forEach(tn => {
      if (tn.parentElement && tn.parentElement.closest('.se-mark, se-mark')) return;
      const html = tn.nodeValue.replace(re, '<se-mark class="se-mark' + (enablePop ? ' se-mark--pop' : '') + '">$1</se-mark>');
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

  /* ---------- Apply custom styles (dot size + colors + pop animation) ---------- */
  function applyCustomStyles(cfg) {
    let styleEl = document.getElementById('se-custom-styles');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'se-custom-styles';
      document.head.appendChild(styleEl);
    }
    const c = cfg.colors || {};
    const size = cfg.dotSize || 8;
    const popEnabled = cfg.keywordPop !== false;
    styleEl.textContent = `
      .se-label {
        width: ${size}px !important;
        height: ${size}px !important;
        margin-right: ${Math.max(3, Math.round(size * 0.6))}px !important;
      }
      .se-label--official  { background: ${c.official  || '#22c55e'} !important; }
      .se-label--baijiahao { background: ${c.baijiahao || '#f97316'} !important; }
      .se-label--ad        { background: ${c.ad        || '#ef4444'} !important; }
      .se-label--forum     { background: ${c.forum     || '#9ca3af'} !important; }
      .se-label--video     { background: ${c.video     || '#a855f7'} !important; }
      .se-label--scholar   { background: ${c.scholar   || '#0ea5e9'} !important; }
      .se-label--unknown   { background: ${c.unknown   || '#d1d5db'} !important; }

      /* Keyword highlight - soft pastel yellow, easy on the eyes */
      se-mark, .se-mark {
        background: ${c.highlight || '#fff7c2'} !important;
        color: #3b2f00 !important;
        border-radius: 3px;
        padding: 0 2px;
        box-shadow: inset 0 -1px 0 ${c.highlightShadow || '#fde68a'};
        transition: transform .25s cubic-bezier(.34,1.56,.64,1), box-shadow .25s ease, background .2s;
      }

      /* Keyword Pop animation */
      .se-mark--pop {
        animation: se-pop .5s cubic-bezier(.34,1.56,.64,1) both;
        box-shadow: 0 0 0 2px ${c.highlight || '#fff7c2'}66, 0 1px 4px rgba(0,0,0,.10);
        font-weight: 600;
      }
      .se-mark--pop:hover {
        transform: scale(1.12);
        box-shadow: 0 0 0 3px ${c.highlight || '#fff7c2'}99, 0 2px 8px rgba(0,0,0,.15);
      }
      @keyframes se-pop {
        0%   { transform: scale(0.7); opacity: 0; box-shadow: 0 0 0 0 ${c.highlight || '#fff7c2'}00; }
        60%  { transform: scale(1.15); opacity: 1; }
        100% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 2px ${c.highlight || '#fff7c2'}66; }
      }

      /* Disable pop if user turned it off */
      ${popEnabled ? '' : '.se-mark--pop { animation: none !important; box-shadow: none !important; font-weight: normal !important; }'}
    `;
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

  /* ---------- Load config from storage ---------- */
  async function loadCustomRules() {
    try {
      const cfg = await chrome.storage.local.get([
        'customSelectors', 'customKeywords',
        'highlightEnabled', 'labelEnabled', 'collapseAds',
        'dotSize', 'colors', 'keywordPop',
      ]);
      const colors = cfg.colors || {};
      return {
        selectors: Array.isArray(cfg.customSelectors) ? cfg.customSelectors : [],
        keywords:  Array.isArray(cfg.customKeywords)  ? cfg.customKeywords  : [],
        highlight: cfg.highlightEnabled !== false,
        label:     cfg.labelEnabled     !== false,
        collapse:  cfg.collapseAds     !== false,
        dotSize:   (typeof cfg.dotSize === 'number') ? cfg.dotSize : 8,
        keywordPop: cfg.keywordPop !== false, // default ON
        colors: {
          official:  colors.official  || '#22c55e',
          baijiahao: colors.baijiahao || '#f97316',
          ad:        colors.ad        || '#ef4444',
          forum:     colors.forum     || '#9ca3af',
          video:     colors.video     || '#a855f7',
          scholar:   colors.scholar   || '#0ea5e9',
          unknown:   colors.unknown   || '#d1d5db',
          highlight: colors.highlight || '#fff7c2',
        },
      };
    } catch {
      return {
        selectors: [], keywords: [], highlight: true, label: true, collapse: true,
        dotSize: 8, keywordPop: true,
        colors: { official:'#22c55e', baijiahao:'#f97316', ad:'#ef4444', forum:'#9ca3af',
                  video:'#a855f7', scholar:'#0ea5e9', unknown:'#d1d5db', highlight:'#fff7c2' }
      };
    }
  }

  /* ---------- Process results (main loop) ---------- */
  function processResults(cfg) {
    applyCustomStyles(cfg);

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

      if (cfg.label && !isAd) {
        const type = detectType(el);
        const label = makeLabel(type);
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

      if (cfg.highlight && terms.length) {
        const titleEl = el.querySelector('h3, .t, .b_algo h2, .r') || el;
        const snippetEl = el.querySelector('.a, .c-abstract, .b_caption, div[data-content-feature]') || null;
        highlightNode(titleEl, terms, cfg.keywordPop);
        if (snippetEl) highlightNode(snippetEl, terms, cfg.keywordPop);
      }
    });

    return adCount;
  }

  /* ---------- Init ---------- */
  let currentCfg = null;

  async function init() {
    currentCfg = await loadCustomRules();
    applyCustomStyles(currentCfg);

    const bar = buildToolbar();
    let anchor = null;
    if (engine === 'google') anchor = document.getElementById('rcnt') || document.getElementById('search');
    if (engine === 'bing')   anchor = document.getElementById('b_results');
    if (engine === 'baidu')  anchor = document.getElementById('content_left');
    if (anchor && !anchor.dataset.seBar) {
      anchor.dataset.seBar = '1';
      anchor.prepend(bar);
    }

    const adCount = processResults(currentCfg);

    if (bar.querySelector('[data-stat]')) {
      const lang = (navigator.language || 'en').toLowerCase().startsWith('zh') ? 'zh' : 'en';
      bar.querySelector('[data-stat]').textContent =
        (lang === 'zh' ? `共处理 ${getResultContainers().length} 条，广告 ${adCount}` : `Processed ${getResultContainers().length} results, ads ${adCount}`);
    }

    let lastUrl = location.href;
    new MutationObserver(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        setTimeout(() => {
          if (!currentCfg) return;
          loadCustomRules().then(cfg => { currentCfg = cfg; processResults(cfg); });
        }, 600);
      }
    }).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
