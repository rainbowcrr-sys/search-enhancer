/* popup.js v0.1.4 - toggle settings + GitHub + dot size/color + keyword pop */
const ids = ['highlight', 'label', 'collapse', 'keywordPop'];
const keys = {
  highlight: 'highlightEnabled',
  label: 'labelEnabled',
  collapse: 'collapseAds',
  keywordPop: 'keywordPop',
};

// Show version from manifest
const manifest = chrome.runtime.getManifest();
const verEl = document.getElementById('versionBadge');
if (verEl && manifest.version) verEl.textContent = 'v' + manifest.version;

// Default dot colors
const DEFAULT_COLORS = {
  official:  '#22c55e',
  baijiahao: '#f97316',
  ad:       '#ef4444',
  forum:    '#9ca3af',
  video:    '#a855f7',
  scholar:  '#0ea5e9',
  unknown:  '#d1d5db',
  highlight: '#fff7c2',
};
const COLOR_LABELS_EN = {
  official:'Official', baijiahao:'Baijiahao', ad:'Ad',
  forum:'Forum', video:'Video', scholar:'Scholar', unknown:'Page', highlight:'Highlight',
};
const COLOR_LABELS_ZH = {
  official:'官网', baijiahao:'百家号', ad:'广告',
  forum:'论坛', video:'视频', scholar:'学术', unknown:'网页', highlight:'高亮',
};
const isZh = (navigator.language || 'en').toLowerCase().startsWith('zh');
const COLOR_LABELS = isZh ? COLOR_LABELS_ZH : COLOR_LABELS_EN;

// Load saved settings
chrome.storage.local.get(
  ['dotSize', 'dotColors', ...ids.map(i => keys[i])],
  (cfg) => {
    // Toggles
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.checked = cfg[keys[id]] !== false; // keywordPop default ON
    });
    // Dot size
    const size = parseInt(cfg.dotSize, 10);
    const curSize = (!isNaN(size) && size >= 4 && size <= 24) ? size : 8;
    const slider = document.getElementById('dotSize');
    slider.value = curSize;
    document.getElementById('dotSizeVal').textContent = curSize + 'px';
    // Colors
    const colors = Object.assign({}, DEFAULT_COLORS, cfg.dotColors || {});
    renderColorRows(colors);
  }
);

// Toggles change
ids.forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener('change', (e) => {
      const obj = {}; obj[keys[id]] = e.target.checked;
      chrome.storage.local.set(obj);
    });
  }
});

// Dot size slider
const slider = document.getElementById('dotSize');
slider.addEventListener('input', () => {
  const v = parseInt(slider.value, 10);
  document.getElementById('dotSizeVal').textContent = v + 'px';
});
slider.addEventListener('change', () => {
  chrome.storage.local.set({ dotSize: parseInt(slider.value, 10) });
});

// Render color pickers
function renderColorRows(colors) {
  const container = document.getElementById('colorRows');
  container.innerHTML = '';
  Object.keys(DEFAULT_COLORS).forEach(key => {
    const row = document.createElement('div');
    row.className = 'color-row';
    const swatch = document.createElement('span');
    swatch.className = 'swatch';
    swatch.style.background = colors[key];
    const label = document.createElement('span');
    label.textContent = COLOR_LABELS[key] || key;
    const picker = document.createElement('input');
    picker.type = 'color';
    picker.value = colors[key];
    picker.addEventListener('input', () => {
      swatch.style.background = picker.value;
    });
    picker.addEventListener('change', () => {
      chrome.storage.local.get('dotColors', (cfg) => {
        const cur = Object.assign({}, cfg.dotColors || {});
        cur[key] = picker.value;
        chrome.storage.local.set({ dotColors: cur });
      });
    });
    row.appendChild(swatch);
    row.appendChild(label);
    row.appendChild(picker);
    container.appendChild(row);
  });
}

// Reset colors
document.getElementById('resetColors').addEventListener('click', () => {
  chrome.storage.local.remove('dotColors', () => {
    renderColorRows(DEFAULT_COLORS);
    document.querySelectorAll('.color-row .swatch').forEach((el, i) => {
      const keys = Object.keys(DEFAULT_COLORS);
      el.style.background = DEFAULT_COLORS[keys[i]];
    });
    document.querySelectorAll('.color-row input[type=color]').forEach((el, i) => {
      const keys = Object.keys(DEFAULT_COLORS);
      el.value = DEFAULT_COLORS[keys[i]];
    });
  });
});

// Open options page
document.getElementById('openOptions').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

// Open GitHub
document.getElementById('openGitHub').addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://github.com/rainbowcrr-sys/search-enhancer' });
});
