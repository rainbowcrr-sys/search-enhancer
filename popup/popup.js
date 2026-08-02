/* popup.js - toggle settings + GitHub button */
const ids = ['highlight', 'label', 'collapse'];
const keys = { highlight: 'highlightEnabled', label: 'labelEnabled', collapse: 'collapseAds' };

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
