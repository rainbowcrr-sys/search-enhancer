# Search Enhancer

> Highlight keywords, label result types, and hide ads on Google / Bing / Baidu.
> 在 Google / Bing / 百度上高亮关键词、标注结果类型、隐藏广告。

[English](#english) | [中文](#中文)

---

## English

### ✨ Features

| Icon | Feature | Description |
|---|---|---|
| 🎯 | **Keyword Highlighting** | Automatically wraps your search terms in `<se-mark>` for instant visual scanning |
| 🔖 | **Result Type Labels** | A colored dot beside each result tells you what it is at a glance |
| 🚫 | **Ad Detection & Collapse** | Built-in selectors + keyword fallback + your own custom rules |
| 🔘 | **Custom Dot Size** | Slider from 4 px to 24 px, live preview in options page |
| 🎨 | **Custom Colors** | Pick any color for each label type, saved locally |
| 🌐 | **Multi-engine** | Google, Bing, Baidu (more coming) |
| 🔄 | **SPA-aware** | Works with Google/Bing single-page navigation |
| 🌍 | **Bilingual** | English default, auto-switches to Chinese |

### 📦 Install (Development)

1. Download the latest `search-enhancer-vX.Y.Z.zip` from [Releases](https://github.com/rainbowcrr-sys/search-enhancer/releases)
2. Unzip the folder
3. Open `chrome://extensions` (or `edge://extensions`)
4. Enable **Developer Mode**
5. Click **Load unpacked** → select the unzipped folder

### 🔘 Custom Dot Size

In the options page you'll find a slider **Dot Size (4–24 px)**:

- Drag it, see the purple preview dot change in real time
- Click **Save** → all search-result dots on Google/Bing/Baidu resize instantly
- Default is **8 px**; reset button restores all defaults

The dot's right-margin scales with its size (`0.6×`) so labels never crowd the text.

### 🎨 Default Label Colors

| Label | Default Hex | Preview | Meaning |
|---|---|---|---|
| 🟢 **Official** | `#22c55e` | ![#22c55e](https://placehold.co/14x14/22c55e/22c55e.png) | Likely an official site (HTTPS + short path) |
| 🟠 **Baijiahao** | `#f97316` | ![#f97316](https://placehold.co/14x14/f97316/f97316.png) | Baidu self-media / content farm |
| 🔴 **Ad** | `#ef4444` | ![#ef4444](https://placehold.co/14x14/ef4444/ef4444.png) | Sponsored / paid placement |
| 🟣 **Video** | `#a855f7` | ![#a855f7](https://placehold.co/14x14/a855f7/a855f7.png) | Video platform result |
| 🔵 **Scholar** | `#0ea5e9` | ![#0ea5e9](https://placehold.co/14x14/0ea5e9/0ea5e9.png) | Academic / paper source |
| ⚪ **Forum** | `#9ca3af` | ![#9ca3af](https://placehold.co/14x14/9ca3af/9ca3af.png) | Community / Q&A site |
| ⬜ **Unknown** | `#d1d5db` | ![#d1d5db](https://placehold.co/14x14/d1d5db/d1d5db.png) | Does not match any category |
| 🟡 **Highlight** | `#fde047` | ![#fde047](https://placehold.co/14x14/fde047/fde047.png) | Background color for keyword hits |

You can override **every** color in the options page. Changes apply immediately and persist in `chrome.storage.local`.

### 📋 Default Ad-Detection Rules

These are baked into the extension. **Your custom rules are checked first**, then these.

#### Selectors (per engine)

| Engine | Selector | Match type |
|---|---|---|
| Google | `div[aria-label="Ads"]` | Aria-label attribute |
| Google | `div[data-text-ad]` | Data attribute |
| Google | `div[role="region"][aria-label*="ad" i]` | Aria role + label |
| Bing | `li[data-advertisement]` | Data attribute |
| Bing | `div.ad_carousel` | Class name |
| Bing | `div[id^="ad_"]` | ID prefix |
| Baidu | `#content_left .result-op[class*="ec-"]` | Class contains |
| Baidu | `#content_left .result .c-icon-pay` | Child selector |
| Baidu | `#content_left .result-op[data-isad="1"]` | Data attribute |

#### Keyword fallback (case-insensitive)

If a result's text contains any of these, it's flagged as an ad:

| Keyword | Language | Applies to |
|---|---|---|
| `广告` | 中文 | All engines |
| `推广` | 中文 | All engines |
| `sponsored` | English | All engines |
| `sponsored ad` | English | All engines |
| `ad ·` | English | Google |
| `广告 ·` | 中文 | Baidu |

### 🔢 Version Management

This project uses [Semantic Versioning](https://semver.org/) (`MAJOR.MINOR.PATCH`).

| Level  | When to bump              | Example              |
|--------|---------------------------|----------------------|
| PATCH  | Bug fixes, small tweaks    | 0.1.2 → 0.1.3       |
| MINOR  | New features, new engines  | 0.1.2 → 0.2.0       |
| MAJOR  | Breaking changes          | 0.2.0 → 1.0.0       |

#### Bump version (automated)

```bash
node scripts/bump-version.js patch   # 0.1.3 → 0.1.4
node scripts/bump-version.js minor   # 0.1.3 → 0.2.0
node scripts/bump-version.js major   # 0.1.3 → 1.0.0
```

This script will:
1. Update `version` in `package.json` and `manifest.json`
2. Create a git commit `chore: bump version to X.Y.Z`
3. Create a git tag `vX.Y.Z`

Then push:
```bash
git push && git push --tags
```

#### Automatic Build & Release

Pushing a tag (`v*.*.*`) automatically triggers GitHub Actions:
1. Reads the version from `package.json`
2. Builds the extension into `dist/search-enhancer-vX.Y.Z.zip`
3. Creates a GitHub Release with the zip attached
4. Generates release notes automatically

### 🛡️ Permissions

- `storage` — saves your settings and custom rules **locally only**. No remote code, no tracking, no `host_permissions`.

### Credits

- Maintainer: [@rainbowcrr-sys](https://github.com/rainbowcrr-sys)
- Co-author: [@malerror-w](https://github.com/malerror-w)
- License: MIT

---

## 中文

### ✨ 功能特性

| 图标 | 功能 | 说明 |
|---|---|---|
| 🎯 | **关键词高亮** | 把搜索词自动包成 `<se-mark>`，一眼定位答案 |
| 🔖 | **结果类型标注** | 每条结果旁一个彩色圆点，一眼看出是什么 |
| 🚫 | **广告识别与折叠** | 内置选择器 + 关键词兜底 + 你自己的自定义规则 |
| 🔘 | **自定义圆点大小** | 4–24 px 滑块，选项页实时预览 |
| 🎨 | **自定义颜色** | 每种标签都能改颜色，本地保存 |
| 🌐 | **多搜索引擎** | Google、Bing、百度（持续增加中） |
| 🔄 | **SPA 兼容** | 支持 Google/Bing 单页导航无刷新切换 |
| 🌍 | **中英双语** | 默认英文，浏览器语言为中文时自动切换 |

### 📦 安装（开发版）

1. 从 [Releases](https://github.com/rainbowcrr-sys/search-enhancer/releases) 下载最新的 `search-enhancer-vX.Y.Z.zip`
2. 解压文件夹
3. 打开 `chrome://extensions`（或 `edge://extensions`）
4. 开启右上角 **开发者模式**
5. 点击 **加载已解压的扩展程序** → 选择解压后的文件夹

### 🔘 自定义圆点大小

选项页里有一个 **Dot Size（4–24 px）** 滑块：

- 拖动滑块，紫色预览圆点实时变化
- 点 **Save** → Google/Bing/Baidu 上所有搜索结果圆点立刻变大小
- 默认 **8 px**；Reset 按钮恢复所有默认值

圆点右边的间距会按 `0.6×` 比例自动跟随，不会挤到文字。

### 🎨 默认标签颜色

| 标签 | 默认色值 | 预览 | 含义 |
|---|---|---|---|
| 🟢 **Official 官网** | `#22c55e` | ![#22c55e](https://placehold.co/14x14/22c55e/22c55e.png) | 大概率是官网（HTTPS + 短路径） |
| 🟠 **Baijiahao 百家号** | `#f97316` | ![#f97316](https://placehold.co/14x14/f97316/f97316.png) | 百度自媒体 / 内容农场 |
| 🔴 **Ad 广告** | `#ef4444` | ![#ef4444](https://placehold.co/14x14/ef4444/ef4444.png) | 赞助 / 付费推广位 |
| 🟣 **Video 视频** | `#a855f7` | ![#a855f7](https://placehold.co/14x14/a855f7/a855f7.png) | 视频平台结果 |
| 🔵 **Scholar 学术** | `#0ea5e9` | ![#0ea5e9](https://placehold.co/14x14/0ea5e9/0ea5e9.png) | 学术 / 论文来源 |
| ⚪ **Forum 论坛** | `#9ca3af` | ![#9ca3af](https://placehold.co/14x14/9ca3af/9ca3af.png) | 社区 / 问答站点 |
| ⬜ **Unknown 未知** | `#d1d5db` | ![#d1d5db](https://placehold.co/14x14/d1d5db/d1d5db.png) | 不匹配任何分类 |
| 🟡 **Highlight 高亮** | `#fde047` | ![#fde047](https://placehold.co/14x14/fde047/fde047.png) | 关键词命中的背景色 |

每一种颜色都能在选项页里**覆盖修改**，改动即时生效，保存在 `chrome.storage.local`。

### 📋 默认广告识别规则

以下规则已内置。**你的自定义规则优先检查**，然后再跑这些。

#### 选择器（按引擎）

| 引擎 | 选择器 | 匹配方式 |
|---|---|---|
| Google | `div[aria-label="Ads"]` | Aria-label 属性 |
| Google | `div[data-text-ad]` | Data 属性 |
| Google | `div[role="region"][aria-label*="ad" i]` | Aria 角色 + 标签 |
| Bing | `li[data-advertisement]` | Data 属性 |
| Bing | `div.ad_carousel` | 类名 |
| Bing | `div[id^="ad_"]` | ID 前缀 |
| 百度 | `#content_left .result-op[class*="ec-"]` | 类名包含 |
| 百度 | `#content_left .result .c-icon-pay` | 子选择器 |
| 百度 | `#content_left .result-op[data-isad="1"]` | Data 属性 |

#### 关键词兜底（不区分大小写）

如果结果文本包含以下任一关键词，就会被标为广告：

| 关键词 | 语言 | 适用引擎 |
|---|---|---|
| `广告` | 中文 | 全部 |
| `推广` | 中文 | 全部 |
| `sponsored` | 英文 | 全部 |
| `sponsored ad` | 英文 | 全部 |
| `ad ·` | 英文 | Google |
| `广告 ·` | 中文 | 百度 |

### 🔢 版本管理

项目采用 [语义化版本](https://semver.org/lang/zh-CN/)（`主版本.次版本.修订号`）。

| 级别  | 什么时候升              | 示例                |
|--------|--------------------------|---------------------|
| PATCH  | Bug 修复、小调整         | 0.1.3 → 0.1.4      |
| MINOR  | 新功能、新引擎支持       | 0.1.3 → 0.2.0      |
| MAJOR  | 破坏性变更               | 0.2.0 → 1.0.0      |

#### 升级版本号（自动化）

```bash
node scripts/bump-version.js patch   # 0.1.3 → 0.1.4
node scripts/bump-version.js minor   # 0.1.3 → 0.2.0
node scripts/bump-version.js major   # 0.1.3 → 1.0.0
```

脚本会自动：
1. 同步更新 `package.json` 和 `manifest.json` 里的版本号
2. 创建 git commit `chore: bump version to X.Y.Z`
3. 打 git tag `vX.Y.Z`

然后推送：
```bash
git push && git push --tags
```

#### 自动构建 & 发版

只要 push 一个 tag（格式 `v*.*.*`），GitHub Actions 就会自动：
1. 读取 `package.json` 里的版本号
2. 把插件打包成 `dist/search-enhancer-vX.Y.Z.zip`
3. 创建 GitHub Release 并附上 zip
4. 自动生成 Release Notes

### 🛡️ 权限说明

- `storage` — 仅本地保存你的设置和自定义规则。**无远程代码、无追踪、无 host_permissions**。

### 致谢

- 维护者：[@rainbowcrr-sys](https://github.com/rainbowcrr-sys)
- 合作者：[@malerror-w](https://github.com/malerror-w)
- 协议：MIT
