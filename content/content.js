/* ============================================================
   Search Enhancer - content.js v0.1.5
   - Keyword highlighting + Pop animation
   - Result type labeling (official / baijiahao / ad / forum / video / scholar)
   - Ad detection: engine markers + keyword fallback + user custom rules
   - Ad collapsing with summary row
   - Custom dot size & colors (from chrome.storage)
   - Keyword Pop: search terms get a bounce/pop animation + glow border
   - UNIVERSAL MODE (v0.1.5): works on ANY site with search params
   - IN-PAGE SEARCH OVERLAY (v0.1.6): Ctrl+Shift+F → filter page + highlight + navigate
   搜索增强器 - 内容脚本
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

  /* ---------- Search param keys to detect query ---------- */
  const SEARCH_PARAMS = ['q', 'query', 'search', 's', 'wd', 'keyword', 'k', 'p', 'term', 'keywords'];

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

  /* ---------- Extract query from URL ---------- */
  function getQueryFromUrl() {
    const params = new URLSearchParams(location.search);
    for (const key of SEARCH_PARAMS) {
      const val = params.get(key);
      if (val && val.trim().length >= 2) return val.trim();
    }
    return '';
  }

  function getQuery() {
    if (engine === 'google') return new URLSearchParams(location.search).get('q') || '';
    if (engine === 'bing')   return new URLSearchParams(location.search).get('q') || '';
    if (engine === 'baidu')  return new URLSearchParams(location.search).get('wd') || '';
    return getQueryFromUrl();
  }

  function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  /* ---------- Keyword highlight with Pop animation ---------- */
  function highlightNode(node, terms, enablePop) {
    if (!node || !terms.length) return;
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, {
      acceptNode(n) { return /^\s*$/.test(n.nodeValue) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; }
    });
    const targets = [];
    let n; while ((n = walker.nextNode())) targets.push(n);
    const re = new RegExp(`(${terms.map(escapeRe).join('|')})`, 'gi');
    targets.forEach(tn => {
      if (tn.parentElement && tn.parentElement.closest('.se-mark, se-mark, .se-overlay-mark')) return;
      const html = tn.nodeValue.replace(re, '<se-mark class="se-mark' + (enablePop ? ' se-mark--pop' : '') + '">$1</se-mark>');
      if (html !== tn.nodeValue) {
        const span = document.createElement('span');
        span.innerHTML = html;
        tn.replaceWith(...span.childNodes);
      }
    });
  }

  /* ---------- Universal highlight ---------- */
  function universalHighlight(terms, enablePop) {
    const selectors = 'p, h1, h2, h3, h4, a, span, li, td, div';
    const elements = document.querySelectorAll(selectors);
    let count = 0;
    elements.forEach(el => {
      if (el.dataset.seDone || el.tagName === 'SCRIPT' || el.tagName === 'STYLE') return;
      const text = el.textContent || '';
      if (text.trim().length < 2) return;
      if (el.closest('.se-mark, .se-overlay-mark, .se-overlay')) return;
      const directText = Array.from(el.childNodes).filter(n => n.nodeType === Node.TEXT_NODE && n.nodeValue.trim()).join(' ');
      if (directText.length < 2) return;

      const re = new RegExp(`(${terms.map(escapeRe).join('|')})`, 'gi');
      let hasMatch = false;
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
        acceptNode(n) {
          if (n.parentElement && n.parentElement.closest('.se-mark, se-mark, .se-overlay-mark')) return NodeFilter.FILTER_REJECT;
          return /^\s*$/.test(n.nodeValue) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
        }
      });
      const targets = [];
      let tn; while ((tn = walker.nextNode())) { targets.push(tn); hasMatch = true; }
      if (!hasMatch) return;

      targets.forEach(tn => {
        const html = tn.nodeValue.replace(re, '<se-mark class="se-mark' + (enablePop ? ' se-mark--pop' : '') + '">$1</se-mark>');
        if (html !== tn.nodeValue) {
          const span = document.createElement('span');
          span.innerHTML = html;
          tn.replaceWith(...span.childNodes);
          count++;
        }
      });
      el.dataset.seDone = '1';
    });
    return count;
  }

  /* ---------- Ad detection ---------- */
  function isAdBySelector(el) {
    return AD_SELECTORS[engine] && AD_SELECTORS[engine].some(sel => el.matches && el.matches(sel)) ||
           el.querySelector && AD_SELECTORS[engine] && AD_SELECTORS[engine].some(sel => el.querySelector(sel));
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

  /* ---------- Apply custom styles ---------- */
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

      se-mark, .se-mark {
        background: ${c.highlight || '#fff7c2'} !important;
        color: #3b2f00 !important;
        border-radius: 3px;
        padding: 0 2px;
        box-shadow: inset 0 -1px 0 ${c.highlightShadow || '#fde68a'};
        transition: transform .25s cubic-bezier(.34,1.56,.64,1), box-shadow .25s ease, background .2s;
      }

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
        0%   { transform: scale(0.7); opacity: 0; }
        60%  { transform: scale(1.15); opacity: 1; }
        100% { transform: scale(1); opacity: 1; }
      }

      ${popEnabled ? '' : '.se-mark--pop { animation: none !important; box-shadow: none !important; font-weight: normal !important; }'}

      .se-universal-badge {
        display: inline-block;
        background: #eef2ff;
        color: #6366f1;
        font-size: 11px;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 4px;
        margin-left: 8px;
      }

      /* ===== In-Page Search Overlay (v0.1.6) ===== */
      .se-overlay {
        position: fixed !important;
        top: 20px !important;
        right: 20px !important;
        z-index: 2147483640 !important;
        width: 380px !important;
        max-height: 70vh !important;
        background: #ffffff !important;
        border: 1px solid #e2e8f0 !important;
        border-radius: 12px !important;
        box-shadow: 0 8px 30px rgba(0,0,0,.18), 0 2px 8px rgba(0,0,0,.08) !important;
        font-family: -apple-system, "Segoe UI", "WenQuanYi Micro Hei", sans-serif !important;
        font-size: 13px !important;
        color: #0f172a !important;
        overflow: hidden !important;
        display: flex !important;
        flex-direction: column !important;
      }
      .se-overlay * { box-sizing: border-box !important; }
      .se-overlay-header {
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
        padding: 10px 14px !important;
        border-bottom: 1px solid #f1f5f9 !important;
        background: #f8fafc !important;
      }
      .se-overlay-header .se-logo {
        width: 22px !important;
        height: 22px !important;
        border-radius: 6px !important;
        background: linear-gradient(135deg, #2563eb, #6366f1) !important;
        color: #fff !important;
        font-weight: 800 !important;
        font-size: 10px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      }
      .se-overlay-header input {
        flex: 1 !important;
        border: 1px solid #cbd5e1 !important;
        border-radius: 6px !important;
        padding: 6px 10px !important;
        font-size: 13px !important;
        outline: none !important;
        background: #fff !important;
        color: #0f172a !important;
      }
      .se-overlay-header input:focus { border-color: #6366f1 !important; box-shadow: 0 0 0 2px #eef2ff !important; }
      .se-overlay-header .se-close {
        background: none !important;
        border: none !important;
        font-size: 18px !important;
        cursor: pointer !important;
        color: #94a3b8 !important;
        padding: 0 4px !important;
        line-height: 1 !important;
      }
      .se-overlay-header .se-close:hover { color: #334155 !important; }
      .se-overlay-stats {
        padding: 6px 14px !important;
        font-size: 11px !important;
        color: #64748b !important;
        border-bottom: 1px solid #f1f5f9 !important;
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
      }
      .se-overlay-stats .se-nav-btns { display: flex !important; gap: 4px !important; }
      .se-overlay-stats button {
        border: 1px solid #e2e8f0 !important;
        background: #fff !important;
        border-radius: 4px !important;
        padding: 2px 8px !important;
        font-size: 11px !important;
        cursor: pointer !important;
        color: #475569 !important;
      }
      .se-overlay-stats button:hover { background: #f1f5f9 !important; }
      .se-overlay-list {
        overflow-y: auto !important;
        flex: 1 !important;
        padding: 4px 0 !important;
        max-height: 50vh !important;
      }
      .se-overlay-list::-webkit-scrollbar { width: 6px; }
      .se-overlay-list::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
      .se-overlay-item {
        padding: 8px 14px !important;
        cursor: pointer !important;
        border-left: 3px solid transparent !important;
        line-height: 1.5 !important;
        transition: background .12s !important;
      }
      .se-overlay-item:hover { background: #f8fafc !important; }
      .se-overlay-item.se-active {
        background: #eef2ff !important;
        border-left-color: #6366f1 !important;
      }
      .se-overlay-item .se-item-title {
        font-weight: 600 !important;
        font-size: 13px !important;
        color: #0f172a !important;
        margin-bottom: 2px !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        white-space: nowrap !important;
      }
      .se-overlay-item .se-item-snippet {
        font-size: 11px !important;
        color: #64748b !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        display: -webkit-box !important;
        -webkit-line-clamp: 2 !important;
        -webkit-box-orient: vertical !important;
      }
      .se-overlay-item .se-item-url {
        font-size: 10px !important;
        color: #94a3b8 !important;
        margin-top: 2px !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        white-space: nowrap !important;
      }
      .se-overlay-item .se-overlay-mark {
        background: ${c.highlight || '#fff7c2'} !important;
        color: #3b2f00 !important;
        font-weight: 700 !important;
        padding: 0 2px !important;
        border-radius: 2px !important;
      }
      .se-overlay-empty {
        padding: 20px 14px !important;
        text-align: center !important;
        color: #94a3b8 !important;
        font-size: 12px !important;
      }
      .se-overlay-footer {
        padding: 6px 14px !important;
        font-size: 10px !important;
        color: #94a3b8 !important;
        border-top: 1px solid #f1f5f9 !important;
        display: flex !important;
        justify-content: space-between !important;
      }
      .se-overlay-footer kbd {
        background: #f1f5f9 !important;
        border: 1px solid #e2e8f0 !important;
        border-radius: 3px !important;
        padding: 0 4px !important;
        font-size: 10px !important;
        font-family: ui-monospace, monospace !important;
      }
    `;
  }

  /* ============================================================
     IN-PAGE SEARCH OVERLAY (v0.1.6)
     ============================================================ */

  let overlayState = null; // { items, activeIndex, query }

  function clearOverlayHighlights() {
    // Remove all .se-overlay-mark spans, restore text
    document.querySelectorAll('.se-overlay-mark').forEach(el => {
      const parent = el.parentNode;
      if (parent) parent.replaceChild(document.createTextNode(el.textContent), el);
      parent.normalize();
    });
  }

  function getSearchableElements() {
    // Collect text-bearing elements that are visible
    const selectors = 'p, h1, h2, h3, h4, h5, a, li, td, div, span, button, label';
    const all = document.querySelectorAll(selectors);
    const results = [];
    all.forEach(el => {
      if (el.closest('.se-overlay')) return; // skip overlay itself
      if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') return;
      const text = el.textContent || '';
      if (text.trim().length < 3) return;
      // Must have direct text (not just children's text)
      const directText = Array.from(el.childNodes).filter(n => n.nodeType === Node.TEXT_NODE && n.nodeValue.trim()).join(' ');
      if (directText.trim().length < 3) return;
      // Check visibility
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      // Don't go too deep
      if (el.querySelectorAll('*').length > 50) return;
      results.push(el);
    });
    return results;
  }

  function highlightInElement(el, query) {
    if (!el || !query) return 0;
    const re = new RegExp(`(${escapeRe(query)})`, 'gi');
    let count = 0;
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        if (n.parentElement && n.parentElement.closest('.se-overlay-mark, .se-overlay')) return NodeFilter.FILTER_REJECT;
        return /^\s*$/.test(n.nodeValue) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      }
    });
    const targets = [];
    let tn; while ((tn = walker.nextNode())) { targets.push(tn); }
    targets.forEach(tn => {
      const html = tn.nodeValue.replace(re, '<span class="se-overlay-mark">$1</span>');
      if (html !== tn.nodeValue) {
        const span = document.createElement('span');
        span.innerHTML = html;
        tn.replaceWith(...span.childNodes);
        count++;
      }
    });
    return count;
  }

  function buildSnippet(el, query) {
    const text = (el.textContent || '').trim();
    const lower = text.toLowerCase();
    const idx = lower.indexOf(query.toLowerCase());
    if (idx === -1) return text.substring(0, 120);
    const start = Math.max(0, idx - 40);
    const end = Math.min(text.length, idx + query.length + 40);
    let snippet = text.substring(start, end);
    if (start > 0) snippet = '…' + snippet;
    if (end < text.length) snippet = snippet + '…';
    return snippet;
  }

  function buildOverlayDOM() {
    const overlay = document.createElement('div');
    overlay.className = 'se-overlay';
    overlay.innerHTML = `
      <div class="se-overlay-header">
        <span class="se-logo">SE</span>
        <input type="text" placeholder="Search this page… (type to filter)" autocomplete="off" spellcheck="false" />
        <button class="se-close" title="Close (Esc)">×</button>
      </div>
      <div class="se-overlay-stats">
        <span class="se-stats-text">Press / to start typing</span>
        <div class="se-nav-btns">
          <button class="se-prev" title="Previous (↑)">↑</button>
          <button class="se-next" title="Next (↓)">↓</button>
        </div>
      </div>
      <div class="se-overlay-list"></div>
      <div class="se-overlay-footer">
        <span><kbd>↑</kbd><kbd>↓</kbd> navigate · <kbd>Enter</kbd> jump · <kbd>Esc</kbd> close</span>
        <span>Search Enhancer</span>
      </div>
    `;
    document.body.appendChild(overlay);
    return overlay;
  }

  function openSearchOverlay() {
    // Close existing
    closeSearchOverlay();

    const overlay = buildOverlayDOM();
    const input = overlay.querySelector('input');
    const list = overlay.querySelector('.se-overlay-list');
    const statsText = overlay.querySelector('.se-stats-text');

    overlayState = { items: [], activeIndex: -1, query: '' };

    // Focus input
    setTimeout(() => input.focus(), 50);

    function performSearch() {
      const query = input.value.trim();
      overlayState.query = query;
      overlayState.activeIndex = -1;

      // Clear old highlights
      clearOverlayHighlights();

      if (!query || query.length < 1) {
        list.innerHTML = '<div class="se-overlay-empty">Type to search this page…</div>';
        statsText.textContent = 'Start typing…';
        overlayState.items = [];
        return;
      }

      // Get all searchable elements
      const elements = getSearchableElements();
      const matched = [];

      elements.forEach(el => {
        const text = (el.textContent || '').toLowerCase();
        if (text.includes(query.toLowerCase())) {
          // Highlight matches within this element
          highlightInElement(el, query);
          // Build item for list
          const title = (el.textContent || '').trim().substring(0, 80);
          const snippet = buildSnippet(el, query);
          const url = el.closest('a') ? el.closest('a').href : '';
          matched.push({ el, title, snippet, url });
        }
      });

      overlayState.items = matched;

      // Render list
      if (matched.length === 0) {
        list.innerHTML = '<div class="se-overlay-empty">No matches found</div>';
      } else {
        list.innerHTML = matched.map((item, i) => {
          const titleHtml = item.title.replace(new RegExp(`(${escapeRe(query)})`, 'gi'), '<span class="se-overlay-mark">$1</span>');
          const snippetHtml = item.snippet.replace(new RegExp(`(${escapeRe(query)})`, 'gi'), '<span class="se-overlay-mark">$1</span>');
          return `
            <div class="se-overlay-item" data-idx="${i}">
              <div class="se-item-title">${titleHtml}</div>
              <div class="se-item-snippet">${snippetHtml}</div>
              ${item.url ? `<div class="se-item-url">${item.url.substring(0, 80)}</div>` : ''}
            </div>
          `;
        }).join('');

        // Click handler
        list.querySelectorAll('.se-overlay-item').forEach(itemEl => {
          itemEl.addEventListener('click', () => {
            const idx = parseInt(itemEl.dataset.idx, 10);
            jumpToItem(idx);
          });
          itemEl.addEventListener('mouseenter', () => {
            setActive(parseInt(itemEl.dataset.idx, 10));
          });
        });
      }

      statsText.textContent = `${matched.length} match${matched.length === 1 ? '' : 'es'}`;
    }

    function setActive(idx) {
      if (!overlayState.items.length) return;
      overlayState.activeIndex = Math.max(0, Math.min(idx, overlayState.items.length - 1));
      list.querySelectorAll('.se-overlay-item').forEach((el, i) => {
        el.classList.toggle('se-active', i === overlayState.activeIndex);
      });
      // Scroll into view
      const activeEl = list.querySelector('.se-overlay-item.se-active');
      if (activeEl) activeEl.scrollIntoView({ block: 'nearest' });
    }

    function jumpToItem(idx) {
      if (!overlayState.items[idx]) return;
      const target = overlayState.items[idx].el;
      // Scroll page to element
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Flash effect
      const oldBg = target.style.backgroundColor;
      target.style.backgroundColor = '#eef2ff';
      target.style.transition = 'background-color .3s';
      setTimeout(() => { target.style.backgroundColor = oldBg; }, 800);
      // Close overlay after jump
      setTimeout(() => closeSearchOverlay(), 300);
    }

    // Input event
    input.addEventListener('input', performSearch);

    // Keyboard navigation
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { closeSearchOverlay(); return; }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActive(overlayState.activeIndex + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActive(overlayState.activeIndex - 1);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (overlayState.activeIndex >= 0) {
          jumpToItem(overlayState.activeIndex);
        } else if (overlayState.items.length > 0) {
          jumpToItem(0);
        }
      }
    });

    // Prev/Next buttons
    overlay.querySelector('.se-prev').addEventListener('click', () => setActive(overlayState.activeIndex - 1));
    overlay.querySelector('.se-next').addEventListener('click', () => setActive(overlayState.activeIndex + 1));

    // Close button
    overlay.querySelector('.se-close').addEventListener('click', closeSearchOverlay);

    // Initial state
    list.innerHTML = '<div class="se-overlay-empty">Type to search this page…</div>';
  }

  function closeSearchOverlay() {
    clearOverlayHighlights();
    const existing = document.querySelector('.se-overlay');
    if (existing) existing.remove();
    overlayState = null;
  }

  /* ---------- Per-result processors (search engine mode) ---------- */
  function getResultContainers() {
    if (engine === 'google') return Array.from(document.querySelectorAll('div.g, div[data-hveid]'));
    if (engine === 'bing')   return Array.from(document.querySelectorAll('li.b_algo'));
    if (engine === 'baidu')  return Array.from(document.querySelectorAll('#content_left .result, #content_left .result-op'));
    return [];
  }

  /* ---------- Toolbar ---------- */
  let adsHidden = true;
  function buildToolbar(universalMode) {
    const bar = document.createElement('div');
    bar.className = 'se-toolbar';
    const badge = universalMode ? '<span class="se-universal-badge">Universal Mode</span>' : '';
    bar.innerHTML = `
      <strong style="color:#0f172a">Search Enhancer ${badge}</strong>
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
        'dotSize', 'colors', 'keywordPop', 'universalMode',
      ]);
      const colors = cfg.colors || {};
      return {
        selectors: Array.isArray(cfg.customSelectors) ? cfg.customSelectors : [],
        keywords:  Array.isArray(cfg.customKeywords)  ? cfg.customKeywords  : [],
        highlight: cfg.highlightEnabled !== false,
        label:     cfg.labelEnabled     !== false,
        collapse:  cfg.collapseAds     !== false,
        dotSize:   (typeof cfg.dotSize === 'number') ? cfg.dotSize : 8,
        keywordPop: cfg.keywordPop !== false,
        universal: cfg.universalMode === true,
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
        dotSize: 8, keywordPop: true, universal: false,
        colors: { official:'#22c55e', baijiahao:'#f97316', ad:'#ef4444', forum:'#9ca3af',
                  video:'#a855f7', scholar:'#0ea5e9', unknown:'#d1d5db', highlight:'#fff7c2' }
      };
    }
  }

  /* ---------- Process results (search engine mode) ---------- */
  function processResults(cfg) {
    applyCustomStyles(cfg);

    const query = getQuery();
    const terms = query ? query.split(/\s+/).filter(w => w.length >= 2) : [];
    let adCount = 0;

    if (cfg.universal || engine === 'unknown') {
      const count = universalHighlight(terms, cfg.keywordPop);
      return { adCount: 0, universalCount: count || 0 };
    }

    const results = getResultContainers();
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

    return { adCount, universalCount: 0 };
  }

  /* ---------- Result type detection ---------- */
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

  /* ---------- Init ---------- */
  let currentCfg = null;

  async function init() {
    currentCfg = await loadCustomRules();
    applyCustomStyles(currentCfg);

    const query = getQuery();
    const isUniversal = currentCfg.universal || engine === 'unknown';
    const terms = query ? query.split(/\s+/).filter(w => w.length >= 2) : [];

    // Build toolbar
    const bar = buildToolbar(isUniversal);
    let anchor = null;
    if (engine === 'google') anchor = document.getElementById('rcnt') || document.getElementById('search');
    if (engine === 'bing')   anchor = document.getElementById('b_results');
    if (engine === 'baidu')  anchor = document.getElementById('content_left');
    if (!anchor && isUniversal) {
      anchor = document.querySelector('main, #main, #content, #results, .content, body');
    }
    if (anchor && !anchor.dataset.seBar) {
      anchor.dataset.seBar = '1';
      anchor.prepend(bar);
    }

    const result = processResults(currentCfg);

    // Update stat text
    const statEl = bar.querySelector('[data-stat]');
    if (statEl) {
      const lang = (navigator.language || 'en').toLowerCase().startsWith('zh') ? 'zh' : 'en';
      if (isUniversal) {
        statEl.textContent = lang === 'zh'
          ? `全站通用模式：高亮 ${result.universalCount} 处`
          : `Universal mode: ${result.universalCount} highlights`;
      } else {
        statEl.textContent = lang === 'zh'
          ? `共处理 ${getResultContainers().length} 条，广告 ${result.adCount}`
          : `Processed ${getResultContainers().length} results, ads ${result.adCount}`;
      }
    }

    // Also do universal highlight if terms exist
    if (isUniversal && terms.length && result.universalCount === 0) {
      universalHighlight(terms, currentCfg.keywordPop);
    }

    // Watch for URL changes (SPA navigation) and DOM mutations
    let lastUrl = location.href;
    let debounceTimer = null;
    new MutationObserver(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          if (!currentCfg) return;
          loadCustomRules().then(cfg => {
            currentCfg = cfg;
            // Clear old highlights
            document.querySelectorAll('.se-mark').forEach(el => {
              const parent = el.parentNode;
              if (parent) parent.replaceChild(document.createTextNode(el.textContent), el);
              parent.normalize();
            });
            document.querySelectorAll('[data-seDone]').forEach(el => { el.removeAttribute('data-seDone'); });
            processResults(cfg);
          });
        }, 600);
      }
    }).observe(document.body, { childList: true, subtree: true });

    // Also observe for new content in universal mode
    if (isUniversal) {
      new MutationObserver(() => {
        if (!currentCfg) return;
        const q = getQuery();
        const ts = q ? q.split(/\s+/).filter(w => w.length >= 2) : [];
        if (ts.length) universalHighlight(ts, currentCfg.keywordPop);
      }).observe(document.body, { childList: true, subtree: true });
    }
  }

  // Listen for messages from background.js (keyboard shortcut)
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'openSearchOverlay') {
      openSearchOverlay();
      sendResponse({ ok: true });
    }
    return true;
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
