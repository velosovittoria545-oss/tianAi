<div align="center">

# TianAi (天艾)
### Minimalist Editorial Portfolio & Serverless Publishing CMS
### 极简文人质感个人主页与 Serverless 技术博客系统

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Cloudflare Workers](https://img.shields.io/badge/Runtime-Cloudflare%20Workers-F38020?logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![Cloudflare KV](https://img.shields.io/badge/Storage-Cloudflare%20KV-brightgreen)](https://developers.cloudflare.com/kv/)

[English](#english) | [简体中文](#简体中文)

</div>

---

<a name="english"></a>
## 🇬🇧 English

### Overview

**TianAi** is an all-in-one, ultra-fast personal portfolio, resume, and blogging CMS tailored for AI researchers, architects, and engineering leaders. Built entirely upon **Cloudflare Workers** and **Cloudflare KV**, TianAi runs directly on the global edge with **zero server cost, sub-50ms latency, zero egress fees**, and an editorial minimalist design inspired by academic publications.

Everything—frontend pages, an interactive guestbook, an authenticated bilingual Admin CMS (`/admin`), and RESTful APIs—is neatly compiled into a single lightweight Worker file (`worker.js`).

---

### ✨ Key Features

- **🎨 Academic & Editorial Aesthetics**:
  - Warm paper tone (`#FAF8F5`), clay accent (`#CC785C`), and balanced typography combining classical serif (`Newsreader`) with monospace (`JetBrains Mono`).
  - Seamless dark mode / light mode support.
- **🌐 100% Bilingual Everywhere (EN / ZH)**:
  - Instant toggle between English and Chinese across all public pages, the resume/career timeline, individual articles, and even the Admin Login card.
- **📝 Immersive Article & Publishing System**:
  - Independent articles view (`/articles`) and interactive article reader.
  - Automatic view counts tracking (`👁️ Views`) with live increments.
  - **Editable View Counts**: Admins can freely set or adjust baseline view counts in the editor.
  - **1-Click Shareable Link**: Generates an instant share link copied to clipboard.
- **📥 Cross-Platform Article Import**:
  - One-click import for external `.md` (Markdown) files from **WeChat Official Account, Zhihu, Obsidian, Notion, GitHub**.
  - Automatic frontmatter extraction (`title`, `date`, `tags`, `views`).
  - Built-in **"🔄 MD to HTML"** converter for direct copy-pasted content.
- **🖼️ Article Illustration & Smart Image Compression**:
  - Local image file uploader embedded directly into the article modal.
  - **Client-Side Canvas Compression**: Automatically downsizes high-resolution camera/phone photos to max 1920px at 85% JPEG quality (~200 KB), reducing storage footprints by over 90%!
  - Semantic `<figure>` and `<figcaption>` styling with zoomable preview.
  - Support for external image URLs (compatible with Cloudflare R2, PicGo, Telegraph-Image, etc.).
- **☕ WeChat Tipping & Reward QR Box**:
  - Embedded appreciative tipping QR code at the end of each article.
  - Admin can upload and update their personal payment QR code in real-time from the CMS.
- **💬 Interactive Guestbook & Comment Moderation**:
  - Public guestbook (`/guestbook`) allowing readers to leave feedback with custom names.
  - Admin moderation pipeline: comments require approval in `/admin` before appearing publicly, with one-click approve, reject, or delete actions.
- **👤 Live Resume & Profile Editor**:
  - Admin CMS tab: `👤 Profile & Reward Settings`.
  - Live editing of names, titles, email, status tags, focus areas, tech stacks, education, and detailed career milestones (Hightouch, eBay, Kuaishou, and Strategic Enterprise Clients).
  - Immediate persistence to Cloudflare KV.
- **⚡ Serverless & Free Tier Friendly**:
  - Cloudflare free tier offers **1 GB KV Storage** (enough for 5,000+ optimized blog images), **1,000 daily writes**, and **100,000 daily reads** at zero cost.
  - Global edge CDN caching (`Cache-Control: public, max-age=31536000, immutable`).

---

### 🚀 Quick Start & Deployment

#### Method 1: Web Dashboard (No Node.js required)
1. Sign in to [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Create or navigate to a Worker (e.g., `tianai`).
3. Click **Edit code**, copy the contents of `worker.js`, and paste it into the editor.
4. Click **Deploy**. Your website is live immediately!

#### Method 2: Wrangler CLI
```bash
# 1. Clone the repository
git clone https://github.com/velosovittoria545-oss/tianAi.git
cd tianAi

# 2. Install dependencies
npm install

# 3. Local development server
npm run dev

# 4. Deploy to Cloudflare Workers
npm run deploy
```

---

### 🔐 Admin Authentication

- **Default URL**: `https://your-domain.com/admin`
- **Default Username**: `admin`
- **Password Configuration**:
  - **Option A (Recommended)**: Set an encrypted environment variable `ADMIN_PASSWORD` in Cloudflare Dashboard (`Settings` -> `Variables and Secrets`).
  - **Option B**: Modify `CONFIG.adminPassword` in `worker.js`.

---

### 💾 Enabling Persistent Storage (Cloudflare KV)

> **Note**: Even without KV configured, TianAi automatically operates in an out-of-the-box demo mode with initial sample articles and profile data. To enable permanent storage:

1. In Cloudflare Dashboard, go to **Storage & Databases** -> **KV**.
2. Click **Create Namespace**, name it `BLOG_KV`.
3. Go to your Worker's **Settings** -> **Variables and Secrets** -> **KV Namespace Bindings**.
4. Add a binding with Variable name `BLOG_KV` pointing to the `BLOG_KV` namespace.

---

<a name="简体中文"></a>
## 🇨🇳 简体中文

### 项目简介

**TianAi（天艾）** 是一款专为 AI 研究员、算法科学家、系统架构师及技术主管打造的极简文人质感个人主页与技术博客系统。基于 **Cloudflare Workers** 与 **Cloudflare KV** 纯 Serverless 架构构建，部署在全球边缘节点上，拥有**零服务器账单、毫秒级首屏加载、无出口流量费**等特点，排版设计融合了学术期刊的衬线美学与现代工程师的终端极简质感。

前端静态渲染、前台文章阅读器、读者留言板、全功能中英双语管理后台（`/admin`）以及后端 RESTful API 全部浓缩在单个轻量级 `worker.js` 文件中，开箱即用。

---

### ✨ 核心特性

- **🎨 东方文人与学术工程美学**：
  - 精心调配的微暖宣纸底色（`#FAF8F5`）、赤陶红高亮（`#CC785C`），完美融合古典衬线字体（`Newsreader`）与等宽终端字体（`JetBrains Mono`）。
  - 支持深色模式 / 浅色模式自适应。
- **🌐 全站中英双语即时切换 (i18n)**：
  - 无论在主页、详细经历页、独立文章列表、还是管理员登录卡片，均可一键中英无缝切换。
- **📝 沉浸式文章与阅读体验**：
  - 独立文章索引页（`/articles`）与单篇沉浸阅读模式。
  - **真实阅读量统计（Views）**：读者阅读自动递增。
  - **自由修改浏览量**：管理员发布或编辑文章时，可自由设定初始基数或修正浏览量。
  - **一键分享链接**：一键生成分发链接并复制到剪贴板。
- **📥 跨平台文章一键导入**：
  - 支持从 **微信公众号、知乎、Obsidian、Notion、掘金、GitHub** 导出的 `.md`（Markdown）文件一键导入。
  - 自动解析 Frontmatter（标题、时间、分类标签、浏览量）。
  - 内置 **"🔄 MD 转 HTML"** 工具，直接粘贴 Markdown 文本毫秒级转换规范网页排版。
- **🖼️ 本地插图上传与智能微损压缩**：
  - 文章编辑器内置本地图片上传控件。
  - **浏览器 Canvas 智能压缩**：自动将手机/相机拍摄的几 MB 超大原图无损等比缩放至最大 1920px、85% JPEG 质量（~200 KB），节省 90% 以上空间！
  - 自动生成符合学术规范的居中 `<figure>` 和 `<figcaption>` 排版。
  - 支持直接插入外部图床链接（可与 Cloudflare R2、PicGo、Telegraph-Image 等无缝联动）。
- **☕ 读者打赏与微信收款码**：
  - 每篇文章末尾内嵌优雅的读者打赏致谢卡片。
  - 管理员可在后台自主上传更换微信赞赏收款码，全站文章即时自动同步。
- **💬 读者互动留言板与审核体系**：
  - 独立留言板页面（`/guestbook`），读者可自定义昵称提交留言。
  - 管理员控制台提供完善的审核流：通过展示、驳回隐藏、彻底删除。
- **👤 简历履历在线可视化编辑**：
  - 后台提供「👤 简历与打赏设置」独立面板。
  - 可在线修改姓名、头衔、邮箱、状态、专注领域、技术栈、教育背景以及 Hightouch、eBay、快手、战略级大客户的具体履历与项目实绩。
  - 修改后一键保存，直接持久化存入 Cloudflare KV。
- **⚡ 纯 Serverless 永久免费体验**：
  - 充分利用 Cloudflare 免费配额：**1 GB KV 存储空间**（足以存储 5,000+ 张压缩后的高清插图）、**每天 1,000 次免费写入**、**每天 100,000 次免费读取**。
  - 全球 CDN 节点强缓存，零出口流量费。

---

### 🚀 快速开始与部署

#### 方式一：网页端控制台极速部署（推荐，无需本地开发环境）
1. 登录 [Cloudflare 控制台](https://dash.cloudflare.com/)。
2. 创建或进入一个 Worker（例如 `tianai`）。
3. 点击 **「编辑代码」**（Edit code），将本项目中的 `worker.js` 内容全部复制粘贴进去。
4. 点击右下角 **「部署」**（Deploy）即可秒级上线！

#### 方式二：命令行部署 (Wrangler CLI)
```bash
# 1. 克隆代码仓库
git clone https://github.com/velosovittoria545-oss/tianAi.git
cd tianAi

# 2. 安装依赖
npm install

# 3. 本地预览开发
npm run dev

# 4. 部署至 Cloudflare Workers
npm run deploy
```

---

### 🔐 管理后台配置

- **登录地址**：`https://你的域名/admin`
- **默认用户名**：`admin`
- **修改密码**：
  - **推荐方式**：在 Cloudflare 控制台 -> 该 Worker 的 **Settings** -> **Variables and Secrets** 中添加加密变量 `ADMIN_PASSWORD`。
  - **代码方式**：直接修改 `worker.js` 顶部的 `CONFIG.adminPassword`。

---

### 💾 绑定云端持久化存储 (Cloudflare KV)

> **说明**：即便尚未绑定 KV，系统也会以**内置体验模式**完美运行，自带演示博文与简历。如需永久保存后台修改的数据，请绑定 KV：

1. 在 Cloudflare 控制台左侧进入 **Storage & Databases** -> **KV**。
2. 点击 **Create Namespace**，命名为 `BLOG_KV`。
3. 进入该 Worker 的 **Settings** -> **Variables and Secrets** -> **KV Namespace Bindings**。
4. 添加变量名 `BLOG_KV`，并绑定刚才创建的 `BLOG_KV` 命名空间。

---

### 📁 项目结构 (Project Structure)

```text
tianAi/
├── worker.js              # 核心服务代码（前台页面 + /admin 后台 + 留言审核 + 边缘 API）
├── wrangler.toml          # Cloudflare Workers 官方配置文件
├── package.json           # 项目元数据与运行脚本
├── avatar.jpg             # 默认头像资产
├── LICENSE                # MIT 开源授权协议
├── .gitignore             # Git 忽略配置
└── README.md              # 中英文双语开源文档
```

---

### 📄 开源许可 (License)

本项目采用 [MIT License](LICENSE) 授权开源，欢迎自由 Fork、二次开发与定制部署。
