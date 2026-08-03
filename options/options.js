/* options.js - custom rules persistence + i18n */
const taSel = document.getElementById('selectors');
const taKey = document.getElementById('keywords');
const status = document.getElementById('status');
const saveBtn = document.getElementById('save');

function split(s) { return s.split('\n').map(x => x.trim()).filter(Boolean); }

// Apply i18n to elements with data-i18n
document.querySelectorAll('[data-i18n]').forEach(el => {
  const k = el.getAttribute('data-i18n');
  const m = (chrome.i18n && chrome.i18n.getMessage(k)) || el.textContent;
  el.textContent = m;
});

// Set page title
document.title = ((chrome.i18n && chrome.i18n.getMessage('openOptions')) || 'Custom Rules') + ' · Search Enhancer';

// Show version from manifest
const manifest = chrome.runtime.getManifest();
const verEl = document.getElementById('versionBadge');
if (verEl && manifest.version) verEl.textContent = 'v' + manifest.version;

chrome.storage.local.get(['customSelectors', 'customKeywords'], (cfg) => {
  taSel.value = (cfg.customSelectors || []).join('\n');
  taKey.value = (cfg.customKeywords  || []).join('\n');
});

saveBtn.addEventListener('click', () => {
  chrome.storage.local.set({
    customSelectors: split(taSel.value),
    customKeywords:  split(taKey.value),
  }, () => {
    const savedText = (chrome.i18n && chrome.i18n.getMessage('saved')) || 'Saved';
    status.textContent = savedText + ' ✓';
    setTimeout(() => status.textContent = '', 1500);
  });
});
