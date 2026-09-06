# TianAi (天艾) — Minimalist Editorial Portfolio & Blog CMS

> 针对 AI 研究员、算法专家与技术负责人的高颜值个人主页与技术博客系统。  
> 运行于 **Cloudflare Workers + Cloudflare KV**，零服务器费用、全球毫秒级秒开、自带登录后台与文章管理。

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Demo](https://img.shields.io/badge/Live-Demo-CC785C)](https://drvittoria.de5.net)

---

## 🌟 核心特性 (Features)

* 🎨 **高质感学术与工程美学**：精心调校的暖纸底色（`#FAF8F5`）、优雅陶土红（`#CC785C`）、`Newsreader` 古典衬线与现代无衬线字体混排。
* 📝 **内嵌沉浸式博客系统**：支持 Markdown/HTML 文章排版、深色终端代码高亮、引用卡片与阅读时长/阅读量统计。
* 🔐 **专属管理后台 (`/admin`)**：自带安全登录鉴权，支持在线撰写、修改、删除文章，无需触碰代码。
* 🔑 **密码自由设置**：管理员默认账号为 `admin`，密码可随时在 Cloudflare 环境变量 `ADMIN_PASSWORD` 或代码中自定义。
* ⚡ **纯 Serverless 零成本**：基于 Cloudflare Workers + KV 边缘数据库构建，免运维、无服务器账单、天然抗 DDoS。
* 🌐 **全站中英双语 (i18n)**：前台展示、博客文章与架构解构均支持中英双语无缝即时切换。
* 🖨️ **一键打印 / 导出 PDF 简历**：专为招聘与合作伙伴打造的 `@media print` 样式，一键导出纯净无瑕的高管履历。

---

## 🚀 快速开始与部署 (Quick Start)

### 方式一：纯网页极速部署（最推荐，无需本地安装 Node）

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)。
2. 创建或进入一个 Worker（例如 `tianai`）。
3. 点击 **「编辑代码」**（Edit code），将本项目中的 `worker.js` 内容全选复制粘贴进去。
4. 点击右下角 **「部署」**（Deploy）即可立即上线！

---

### 方式二：命令行部署 (Wrangler CLI)

```bash
# 1. 克隆本项目
git clone https://github.com/velosovittoria545-oss/tianAi.git
cd tianAi

# 2. 安装依赖
npm install

# 3. 本地预览运行
npm run dev

# 4. 发布上线到 Cloudflare
npm run deploy
```

---

## 🔐 管理后台与密码配置 (Admin Setup)

1. **访问后台**：在浏览器打开 `https://你的域名/admin`。
2. **默认账号**：`admin`
3. **设置您自己的密码**：
   - **方式 A（最安全，推荐）**：在 Cloudflare 控制台 -> 该 Worker 的 **设置 (Settings)** -> **变量与机密 (Variables and Secrets)** 中添加加密变量 `ADMIN_PASSWORD`，填入您的密码即可。
   - **方式 B（直接在代码中修改）**：打开 `worker.js`，修改顶部 `CONFIG.adminPassword`。

---

## 💾 开启云端持久化存储 (Cloudflare KV)

> 提示：即便未绑定 KV，本系统也会自动以**开箱体验模式**运行（内置优质初始博文，绝不报错）。若要让后台新增的文章永久存储并全球同步，请绑定 KV：

1. 登录 Cloudflare 控制台，点击左侧菜单 **Storage & Databases (存储与数据库)** -> **KV**。
2. 点击 **Create Namespace**，名称填 `BLOG_KV`。
3. 进入该 Worker 的 **Settings** -> **Variables and Secrets** -> 找到 **KV Namespace Bindings**。
4. 点击添加绑定：变量名称填 `BLOG_KV`，命名空间选择刚才创建的 `BLOG_KV` 即可！

---

## 📁 项目结构 (Directory Structure)

```
tianAi/
├── worker.js              # 核心服务代码（前台展示 + /admin 后台 + 边缘 API）
├── wrangler.toml          # Cloudflare Workers 官方配置文件
├── package.json           # 项目包定义与部署脚本
├── LICENSE                # MIT 开源协议
├── .gitignore             # Git 忽略文件
└── README.md              # 开源说明文档
```

---

## 📄 开源许可 (License)

本项目采用 [MIT License](LICENSE) 授权开源，欢迎自由 Fork、修改和部署。
