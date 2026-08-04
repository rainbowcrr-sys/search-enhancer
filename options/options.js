/* options.js - all settings: dot size, colors, selectors, keywords + i18n */

const DEFAULTS = {
  dotSize: 8,
  colors: {
    official:  '#22c55e',
    baijiahao: '#f97316',
    ad:        '#ef4444',
    forum:     '#9ca3af',
    video:     '#a855f7',
    scholar:   '#0ea5e9',
    unknown:   '#d1d5db',
    highlight: '#fde047',
  },
  selectors: [],
  keywords:  [],
};

const COLOR_LABELS = {
  en: { official:'Official', baijiahao:'Baijiahao', ad:'Ad', forum:'Forum', video:'Video', scholar:'Scholar', unknown:'Unknown', highlight:'Highlight' },
  zh: { official:'官网',     baijiahao:'百家号',   ad:'广告', forum:'论坛', video:'视频',   scholar:'学术',     unknown:'未知',     highlight:'高亮' },
};

const taSel = document.getElementById('selectors');
const taKey = document.getElementById('keywords');
const status = document.getElementById('status');
const saveBtn = document.getElementById('save');
const resetBtn = document.getElementById('reset');
const dotSlider = document.getElementById('dotSize');
const dotVal = document.getElementById('dotSizeVal');
const dotPreview = document.getElementById('dotPreview');
const colorGrid = document.getElementById('colorGrid');

// ---- i18n ----
const lang = (navigator.language || 'en').toLowerCase().startsWith('zh') ? 'zh' : 'en';
const TL = COLOR_LABELS[lang];

document.querySelectorAll('[data-i18n]').forEach(el => {
  const k = el.getAttribute('data-i18n');
  const m = (chrome.i18n && chrome.i18n.getMessage(k)) || el.textContent;
  el.textContent = m;
});
document.title = ((chrome.i18n && chrome.i18n.getMessage('openOptions')) || 'Settings') + ' · Search Enhancer';

// version badge
const manifest = chrome.runtime.getManifest();
const verEl = document.getElementById('versionBadge');
if (verEl && manifest.version) verEl.textContent = 'v' + manifest.version;

// ---- dot size slider ----
function syncDot(size) {
  dotSlider.value = size;
  dotVal.textContent = size + 'px';
  dotPreview.style.width = size + 'px';
  dotPreview.style.height = size + 'px';
}
dotSlider.addEventListener('input', () => syncDot(parseInt(dotSlider.value, 10)));

// ---- color pickers ----
const COLOR_KEYS = ['official','baijiahao','ad','forum','video','scholar','unknown','highlight'];
function buildColorGrid(colors) {
  colorGrid.innerHTML = '';
  COLOR_KEYS.forEach(key => {
    const item = document.createElement('div');
    item.className = 'color-item';
    const sw = document.createElement('span');
    sw.className = 'swatch';
    sw.style.background = colors[key] || DEFAULTS.colors[key];
    const lab = document.createElement('label');
    lab.textContent = TL[key] || key;
    lab.htmlFor = 'clr_' + key;
    const inp = document.createElement('input');
    inp.type = 'color';
    inp.id = 'clr_' + key;
    inp.value = colors[key] || DEFAULTS.colors[key];
    inp.addEventListener('input', () => { sw.style.background = inp.value; });
    item.appendChild(sw); item.appendChild(lab); item.appendChild(inp);
    colorGrid.appendChild(item);
  });
}
function collectColors() {
  const out = {};
  COLOR_KEYS.forEach(key => {
    const v = document.getElementById('clr_' + key).value;
    if (/^#[0-9a-fA-F]{6}$/.test(v)) out[key] = v;
  });
  return out;
}

// ---- load & save ----
function loadAll() {
  chrome.storage.local.get(['dotSize','colors','customSelectors','customKeywords'], (cfg) => {
    const size = (typeof cfg.dotSize === 'number') ? cfg.dotSize : DEFAULTS.dotSize;
    syncDot(size);
    const colors = Object.assign({}, DEFAULTS.colors, cfg.colors || {});
    buildColorGrid(colors);
    taSel.value = (cfg.customSelectors || []).join('\n');
    taKey.value = (cfg.customKeywords  || []).join('\n');
  });
}
loadAll();

function split(s) { return s.split('\n').map(x => x.trim()).filter(Boolean); }

saveBtn.addEventListener('click', () => {
  const size = parseInt(dotSlider.value, 10);
  const colors = collectColors();
  chrome.storage.local.set({
    dotSize: size,
    colors: colors,
    customSelectors: split(taSel.value),
    customKeywords:  split(taKey.value),
  }, () => {
    const savedText = (chrome.i18n && chrome.i18n.getMessage('saved')) || 'Saved';
    status.textContent = savedText + ' ✓';
    setTimeout(() => status.textContent = '', 1500);
  });
});

resetBtn.addEventListener('click', () => {
  chrome.storage.local.set({
    dotSize: DEFAULTS.dotSize,
    colors: Object.assign({}, DEFAULTS.colors),
    customSelectors: [],
    customKeywords:  [],
  }, () => { loadAll(); status.textContent = '✓ Reset'; setTimeout(()=>status.textContent='',1500); });
});
