# Search Enhancer

> Keyword Pop highlighting, result-type labels, and ad hiding for Google / Bing / Baidu.
> 在 Google / Bing / 百度上弹跳高亮关键词、标注结果类型、隐藏广告。

[English](#english) | [中文](#中文)

---

## English

### ✨ Features

| Icon | Feature | Description |
|---|---|---|
| 🎯 | **Keyword Pop** | Search terms get a bounce/pop animation + glow border — instantly eye-catching |
| 🎯 | **Keyword Highlighting** | Your search terms are wrapped in `<se-mark>` for visual scanning |
| 🔖 | **Result Type Labels** | A colored dot beside each result tells you what it is at a glance |
| 🚫 | **Ad Detection & Collapse** | Built-in selectors + keyword fallback + your own custom rules |
| 🔘 | **Custom Dot Size** | Slider from 4 px to 24 px, live preview in options page |
| 🎨 | **Custom Colors** | Pick any color for each label type, saved locally |
| 🌐 | **Multi-engine** | Google, Bing, Baidu |
| 🔄 | **SPA-aware** | Works with Google/Bing single-page navigation |
| 🌍 | **Bilingual** | English default, auto-switches to Chinese |

### 🎯 Keyword Pop (v0.1.4)

Your search terms don't just get a flat yellow background — they **pop**:

- **Soft pastel highlight** — uses `#fff7c2` (light pastel yellow), gentle on the eyes while keeping text fully readable
- **Bounce animation** — each match scales from 70% → 115% → 100% with a spring easing curve
- **Glow border** — a soft halo (`box-shadow`) makes the word stand out from the page
- **Bold weight** — matched text becomes `font-weight: 600` for extra emphasis
- **Hover effect** — mouse-over scales it to 112% with a stronger glow
- **Toggle on/off** — popup has a `Keyword Pop` switch; options page has a checkbox
- **Color-sync** — the glow uses your custom highlight color, so it always matches

> Think of it as a "target lock" effect — the moment results load, your eyes snap to the answer.
> The highlight uses a carefully chosen pastel yellow (`#fff7c2`) — bright enough to find instantly, soft enough to read comfortably.

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

### 🎨 Default Label Colors

| Label | Default Hex | Preview | Meaning |
|---|---|---|---|
| 🟢 **Official** | `#22c55e` | 🟢 | Likely an official site (HTTPS + short path) |
| 🟠 **Baijiahao** | `#f97316` | 🟠 | Baidu self-media / content farm |
| 🔴 **Ad** | `#ef4444` | 🔴 | Sponsored / paid placement |
| 🟣 **Video** | `#a855f7` | 🟣 | Video platform result |
| 🔵 **Scholar** | `#0ea5e9` | 🔵 | Academic / paper source |
| ⚪ **Forum** | `#9ca3af` | ⚪ | Community / Q&A site |
| ⬜ **Unknown** | `#d1d5db` | ⬜ | Does not match any category |
| 🟡 **Highlight** | `#fff7c2` | 🟡 | Soft pastel yellow — easy on the eyes, text stays readable |

You can override **every** color in the options page. Changes apply immediately.

### 📋 Default Ad-Detection Rules

Baked-in selectors (your custom rules are checked **first**):

| Engine | Selector | Match type |
|---|---|---|
| Google | `div[aria-label="Ads"]` | Aria-label |
| Google | `div[data-text-ad]` | Data attr |
| Google | `div[role="region"][aria-label*="ad" i]` | Aria role |
| Bing | `li[data-advertisement]` | Data attr |
| Bing | `div.ad_carousel` | Class |
| Bing | `div[id^="ad_"]` | ID prefix |
| Baidu | `#content_left .result-op[class*="ec-"]` | Class contains |
| Baidu | `#content_left .result .c-icon-pay` | Child selector |
| Baidu | `#content_left .result-op[data-isad="1"]` | Data attr |

Keyword fallback (case-insensitive): `广告`, `推广`, `sponsored`, `ad ·`, `广告 ·`

### 🔢 Version Management

Uses [Semantic Versioning](https://semver.org/) (`MAJOR.MINOR.PATCH`).

| Level | When | Example |
|---|---|---|
| PATCH | Bug fixes, small tweaks | 0.1.3 → 0.1.4 |
| MINOR | New features | 0.1.3 → 0.2.0 |
| MAJOR | Breaking changes | 0.2.0 → 1.0.0 |

```bash
node scripts/bump-version.js patch   # bump + commit + tag
git push && git push --tags         # trigger GitHub Actions release
```

### 🛡️ Permissions

- `storage` — saves settings and custom rules **locally only**. No remote code, no tracking, no `host_permissions`.

### Credits

- Maintainer: [@rainbowcrr-sys](https://github.com/rainbowcrr-sys)
- Co-author: [@malerror-w](https://github.com/malerror-w)
- License: MIT

---

## 中文

### ✨ 功能特性

| 图标 | 功能 | 说明 |
|---|---|---|
| 🎯 | **关键词弹跳 (Keyword Pop)** | 搜索词带弹跳动画 + 发光描边，一眼锁定答案 |
| 🎯 | **关键词高亮** | 搜索词自动包成 `<se-mark>`，方便视觉扫描 |
| 🔖 | **结果类型标注** | 每条结果旁一个彩色圆点，一眼看出是什么 |
| 🚫 | **广告识别与折叠** | 内置选择器 + 关键词兜底 + 你自己的自定义规则 |
| 🔘 | **自定义圆点大小** | 4–24 px 滑块，选项页实时预览 |
| 🎨 | **自定义颜色** | 每种标签都能改颜色，本地保存 |
| 🌐 | **多搜索引擎** | Google、Bing、百度 |
| 🔄 | **SPA 兼容** | 支持 Google/Bing 单页导航无刷新切换 |
| 🌍 | **中英双语** | 默认英文，浏览器语言为中文时自动切换 |

### 🎯 关键词弹跳突出 (v0.1.4)

搜索词不再只是黄底——它们会**弹跳**：

- **浅黄高亮** — 使用 `#fff7c2`（柔和浅黄），不刺眼，文字清晰可读
- **弹跳动画** — 每个命中词从 70% → 115% → 100% 弹簧曲线缩放
- **发光描边** — 柔和浅黄光晕 (`box-shadow`) 让词从页面中"跳"出来
- **加粗** — 命中文字变成 `font-weight: 600`，更醒目
- **悬停放大** — 鼠标移上去放大到 112% + 更强光晕
- **可开关** — 弹出面板有 `Keyword Pop` 开关；选项页有复选框
- **颜色同步** — 光晕自动用你自定义的高亮色，始终一致

> 就像"靶心锁定"效果——结果一加载，眼睛立刻锁定答案。
> 高亮色经过精心挑选（`#fff7c2` 浅黄），足够醒目又不伤眼，长时间搜索也不累。

### 📦 安装（开发版）

1. 从 [Releases](https://github.com/rainbowcrr-sys/search-enhancer/releases) 下载最新 `search-enhancer-vX.Y.Z.zip`
2. 解压文件夹
3. 打开 `chrome://extensions`（或 `edge://extensions`）
4. 开启右上角 **开发者模式**
5. 点击 **加载已解压的扩展程序** → 选择解压后的文件夹

### 🔘 自定义圆点大小

选项页里有 **Dot Size（4–24 px）** 滑块：

- 拖动滑块，紫色预览圆点实时变化
- 点 **Save** → Google/Bing/Baidu 上所有搜索结果圆点立刻变大小
- 默认 **8 px**；Reset 按钮恢复所有默认值

### 🎨 默认标签颜色

| 标签 | 默认色值 | 含义 |
|---|---|---|
| 🟢 **Official 官网** | `#22c55e` | 大概率是官网（HTTPS + 短路径） |
| 🟠 **Baijiahao 百家号** | `#f97316` | 百度自媒体 / 内容农场 |
| 🔴 **Ad 广告** | `#ef4444` | 赞助 / 付费推广位 |
| 🟣 **Video 视频** | `#a855f7` | 视频平台结果 |
| 🔵 **Scholar 学术** | `#0ea5e9` | 学术 / 论文来源 |
| ⚪ **Forum 论坛** | `#9ca3af` | 社区 / 问答站点 |
| ⬜ **Unknown 未知** | `#d1d5db` | 不匹配任何分类 |
| 🟡 **Highlight 高亮** | `#fff7c2` | 浅黄柔和底色，不刺眼，文字清晰可读 |

每种颜色都能在选项页里覆盖修改，即时生效。

### 📋 默认广告识别规则

以下规则已内置。**你的自定义规则优先检查**。

| 引擎 | 选择器 | 匹配方式 |
|---|---|---|
| Google | `div[aria-label="Ads"]` | Aria-label |
| Google | `div[data-text-ad]` | Data 属性 |
| Google | `div[role="region"][aria-label*="ad" i]` | Aria 角色 |
| Bing | `li[data-advertisement]` | Data 属性 |
| Bing | `div.ad_carousel` | 类名 |
| Bing | `div[id^="ad_"]` | ID 前缀 |
| 百度 | `#content_left .result-op[class*="ec-"]` | 类名包含 |
| 百度 | `#content_left .result .c-icon-pay` | 子选择器 |
| 百度 | `#content_left .result-op[data-isad="1"]` | Data 属性 |

关键词兜底（不区分大小写）：`广告`、`推广`、`sponsored`、`ad ·`、`广告 ·`

### 🔢 版本管理

采用 [语义化版本](https://semver.org/lang/zh-CN/)（`主版本.次版本.修订号`）。

| 级别 | 什么时候升 | 示例 |
|---|---|---|
| PATCH | Bug 修复、小调整 | 0.1.3 → 0.1.4 |
| MINOR | 新功能 | 0.1.3 → 0.2.0 |
| MAJOR | 破坏性变更 | 0.2.0 → 1.0.0 |

```bash
node scripts/bump-version.js patch   # 升版本 + 提交 + 打 tag
git push && git push --tags         # 触发 GitHub Actions 自动发版
```

### 🛡️ 权限说明

- `storage` — 仅本地保存设置和自定义规则。**无远程代码、无追踪、无 host_permissions**。

### 致谢

- 维护者：[@rainbowcrr-sys](https://github.com/rainbowcrr-sys)
- 合作者：[@malerror-w](https://github.com/malerror-w)
- 协议：MIT
