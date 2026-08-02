/* options.js - custom rules persistence */
const taSel = document.getElementById('selectors');
const taKey = document.getElementById('keywords');
const status = document.getElementById('status');

function split(s) { return s.split('\n').map(x => x.trim()).filter(Boolean); }

chrome.storage.local.get(['customSelectors', 'customKeywords'], (cfg) => {
  taSel.value  = (cfg.customSelectors || []).join('\n');
  taKey.value  = (cfg.customKeywords  || []).join('\n');
});

document.getElementById('save').addEventListener('click', () => {
  chrome.storage.local.set({
    customSelectors: split(taSel.value),
    customKeywords:  split(taKey.value),
  }, () => {
    status.textContent = 'Saved / 已保存';
    setTimeout(() => status.textContent = '', 1500);
  });
});
