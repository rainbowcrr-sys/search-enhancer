# Search Enhancer

> Highlight keywords, label result types, and hide ads on Google / Bing / Baidu.
> 在 Google / Bing / 百度上高亮关键词、标注结果类型、隐藏广告。

A tiny browser extension (Manifest V3) that makes search results easier to scan.

一个轻量浏览器扩展（Manifest V3），让搜索结果一目了然。

---

## Features · 功能

- 🎨 **Keyword highlight** — search terms are wrapped in `<se-mark>` so you spot the answer fast.
  **关键词高亮** — 把搜索词标黄，一眼定位答案。
- 🔖 **Result-type label** — a small colored dot marks each result as Official / Baijiahao / Forum / Video / Scholar / Ad.
  **结果类型标注** — 小圆点区分官网、百家号、论坛、视频、学术、广告。
- 🚫 **Ad detection & collapse** — built-in selectors + keyword fallback + your own custom rules.
  **广告识别与折叠** — 内置规则 + 关键词兜底 + 自定义规则。
- ⚙️ **Custom rules** — add your own CSS selectors or keywords in the options page.
  **自定义规则** — 在选项页添加自己的选择器或关键词。

## Install · 安装

1. Download / clone this repo.
   下载或克隆本仓库。
2. Open `chrome://extensions` (or `edge://extensions`), enable **Developer mode**.
   打开 `chrome://extensions`，开启「开发者模式」。
3. Click **Load unpacked** and select this folder.
   点击「加载已解压的扩展程序」，选择本文件夹。

## Permissions · 权限

- `storage` — save your toggle settings and custom rules locally.
  本地保存开关与自定义规则，不上传任何数据。

No `host_permissions`, no remote code, no tracking.
不使用 host 权限，不加载远程代码，不追踪。

## Credits · 作者

- [@rainbowcrr-sys](https://github.com/rainbowcrr-sys) (owner)
- [@malerror-w](https://github.com/malerror-w) (co-author)

## License · 协议

MIT
