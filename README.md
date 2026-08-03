# Search Enhancer

> Highlight keywords, label result types, and hide ads on Google / Bing / Baidu.
> 在 Google / Bing / 百度上高亮关键词、标注结果类型、隐藏广告。

[English](#english) | [中文](#中文)

---

## English

### Features

- 🎯 **Keyword Highlighting** — automatically highlights your search terms in titles and snippets
- 🔖 **Result Type Labels** — color-coded dots for Official / Baijiahao / Ad / Forum / Video / Scholar
- 🚫 **Ad Detection & Collapse** — built-in selectors + keyword fallback + your custom rules
- 🌐 **Multi-engine** — Google, Bing, Baidu (more coming)
- 🔄 **SPA-aware** — works with Google/Bing single-page navigation
- 🌍 **Bilingual** — English default, auto-switches to Chinese

### Install (Development)

1. Download the latest `search-enhancer-vX.Y.Z.zip` from [Releases](https://github.com/rainbowcrr-sys/search-enhancer/releases)
2. Unzip the folder
3. Open `chrome://extensions` (or `edge://extensions`)
4. Enable **Developer Mode**
5. Click **Load unpacked** → select the unzipped folder

### Version Management

This project uses [Semantic Versioning](https://semver.org/) (`MAJOR.MINOR.PATCH`).

| Level  | When to bump              | Example              |
|--------|---------------------------|----------------------|
| PATCH  | Bug fixes, small tweaks    | 0.1.1 → 0.1.2       |
| MINOR  | New features, new engines  | 0.1.2 → 0.2.0       |
| MAJOR  | Breaking changes          | 0.2.0 → 1.0.0       |

#### Bump version (automated)

```bash
# After making changes:
node scripts/bump-version.js patch   # 0.1.2 → 0.1.3
node scripts/bump-version.js minor   # 0.1.2 → 0.2.0
node scripts/bump-version.js major   # 0.1.2 → 1.0.0
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

No manual zip creation needed — just bump, push, and the Release appears.

### Credits

- Maintainer: [@rainbowcrr-sys](https://github.com/rainbowcrr-sys)
- Co-author: [@malerror-w](https://github.com/malerror-w)
- License: MIT

---

## 中文

### 功能特性

- 🎯 **关键词高亮** — 自动在标题和摘要中标亮你搜的词
- 🔖 **结果类型标注** — 彩色圆点区分官网 / 百家号 / 广告 / 论坛 / 视频 / 学术
- 🚫 **广告识别与折叠** — 内置选择器 + 关键词兜底 + 自定义规则
- 🌐 **多搜索引擎** — Google、Bing、百度（持续增加中）
- 🔄 **SPA 兼容** — 支持 Google/Bing 单页导航无刷新切换
- 🌍 **中英双语** — 默认英文，浏览器语言为中文时自动切换

### 安装（开发版）

1. 从 [Releases](https://github.com/rainbowcrr-sys/search-enhancer/releases) 下载最新的 `search-enhancer-vX.Y.Z.zip`
2. 解压文件夹
3. 打开 `chrome://extensions`（或 `edge://extensions`）
4. 开启右上角 **开发者模式**
5. 点击 **加载已解压的扩展程序** → 选择解压后的文件夹

### 版本管理

项目采用 [语义化版本](https://semver.org/lang/zh-CN/)（`主版本.次版本.修订号`）。

| 级别  | 什么时候升              | 示例                |
|--------|--------------------------|---------------------|
| PATCH  | Bug 修复、小调整         | 0.1.1 → 0.1.2      |
| MINOR  | 新功能、新引擎支持       | 0.1.2 → 0.2.0      |
| MAJOR  | 破坏性变更               | 0.2.0 → 1.0.0      |

#### 升级版本号（自动化）

```bash
# 改完代码后执行：
node scripts/bump-version.js patch   # 0.1.2 → 0.1.3
node scripts/bump-version.js minor   # 0.1.2 → 0.2.0
node scripts/bump-version.js major   # 0.1.2 → 1.0.0
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

不用手动打 zip——bump、push，Release 自动出现。

### 致谢

- 维护者：[@rainbowcrr-sys](https://github.com/rainbowcrr-sys)
- 合作者：[@malerror-w](https://github.com/malerror-w)
- 协议：MIT
