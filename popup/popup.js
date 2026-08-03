/* popup.js - toggle settings + GitHub button + version display */
const ids = ['highlight', 'label', 'collapse'];
const keys = { highlight: 'highlightEnabled', label: 'labelEnabled', collapse: 'collapseAds' };

// Show version from manifest
const manifest = chrome.runtime.getManifest();
const verEl = document.getElementById('versionBadge');
if (verEl && manifest.version) verEl.textContent = 'v' + manifest.version;

chrome.storage.local.get(ids.map(i => keys[i]), (cfg) => {
  ids.forEach(id => {
    document.getElementById(id).checked = cfg[keys[id]] !== false;
  });
});

ids.forEach(id => {
  document.getElementById(id).addEventListener('change', (e) => {
    const obj = {}; obj[keys[id]] = e.target.checked;
    chrome.storage.local.set(obj);
  });
});

document.getElementById('openOptions').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

document.getElementById('openGitHub').addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://github.com/rainbowcrr-sys/search-enhancer' });
});
