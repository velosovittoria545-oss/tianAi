import { parseArticleDateMs } from "../store.js";

import { COMMON_CSS } from "./common.js";
import { escapeHtml } from "../util.js";

import { CONFIG } from "../config.js";

// GET /admin（登录后的 CMS 主界面）
function renderAdminCmsHtml(articlesJson, commentsJson, profileJson, hasKv, settingsJson = '{}') {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>网站控制台 — 维托里奥 崔</title>
    <style>
        ${COMMON_CSS}
        body { padding: 30px 20px; }
        .cms-container { max-width: 840px; margin: 0 auto; }
        .top-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 16px;
            border-bottom: 1px solid var(--border);
            flex-wrap: wrap;
            gap: 12px;
        }
        .btn {
            padding: 7px 14px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.88rem;
            font-weight: 500;
            border: 1px solid transparent;
            transition: all 0.15s;
        }
        .btn-primary { background: var(--accent); color: white; }
        .btn-primary:hover { background: var(--accent-hover); }
        .btn-outline { background: transparent; border-color: var(--border); color: var(--text-muted); }
        .btn-outline:hover { border-color: var(--accent); color: var(--accent); }
        .btn-danger { background: #dc3545; color: white; }
        .btn-danger:hover { background: #c82333; }
        .tabs-bar {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            border-bottom: 1px solid var(--border);
            padding-bottom: 12px;
        }
        .content-tabs {
            display: flex;
            gap: 6px;
            margin-bottom: 8px;
            border-bottom: 1px solid var(--border);
        }
        .tab-btn {
            padding: 5px 12px;
            background: transparent;
            border: none;
            border-bottom: 2px solid transparent;
            cursor: pointer;
            font-size: 0.88rem;
            color: var(--text-muted);
            font-weight: 500;
        }
        .tab-btn.active {
            border-bottom-color: var(--accent);
            color: var(--accent);
            font-weight: 600;
        }
        .tab-content { display: none; }
        .tab-content.active { display: block; }
        .item-card {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 6px;
            padding: 16px 20px;
            margin-bottom: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.02);
        }
        .exp-editor-card {
            background: var(--bg-page);
            border: 1px solid var(--border);
            border-radius: 6px;
            padding: 16px;
            margin-bottom: 12px;
            position: relative;
            box-shadow: 0 1px 4px rgba(0,0,0,0.03);
        }
        .exp-editor-card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px dashed var(--border);
            flex-wrap: wrap;
            gap: 8px;
        }
        .exp-editor-title {
            font-weight: 600;
            font-size: 0.95rem;
            color: var(--accent);
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .exp-editor-actions {
            display: flex;
            gap: 6px;
        }
        .btn-sm {
            padding: 4px 8px;
            font-size: 0.8rem;
            border-radius: 3px;
        }
        .modal-mask {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.5);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            padding: 20px;
        }
        .modal-card {
            background: var(--bg-page);
            border: 1px solid var(--border);
            border-radius: 8px;
            width: 100%;
            max-width: 680px;
            max-height: 90vh;
            overflow-y: auto;
            padding: 24px 28px;
            box-shadow: 0 8px 30px rgba(0,0,0,0.15);
        }
        .form-group { margin-bottom: 14px; }
        .form-label { display: block; font-size: 0.88rem; font-weight: 500; margin-bottom: 5px; }
        .form-input, .form-textarea {
            width: 100%;
            padding: 8px 10px;
            border: 1px solid var(--border);
            border-radius: 4px;
            background: var(--bg-card);
            font-family: var(--font-sans);
            font-size: 0.9rem;
            color: var(--text-main);
        }
    </style>
</head>
<body>
    <div class="cms-container">
        <div class="top-bar">
            <div>
                <span id="cms-title" style="font-family:var(--font-serif); font-size:1.6rem; font-weight:500;">网站控制台</span>
                <span id="cms-kv-badge" style="font-size:0.8rem; color:var(--text-light); margin-left:10px;">${hasKv ? '🟢 Cloudflare KV 实时持久化' : '🟡 体验模式'}</span>
            </div>
            <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
                <span id="inactivity-indicator" style="font-size:0.75rem; color:var(--text-light); border:1px solid var(--border); padding:3px 8px; border-radius:12px; background:var(--bg-subtle);" title="为了保障安全，若无操作将在2分钟后自动登出">⏱️ 2分钟无操作自动登出保护中</span>
                <button class="btn btn-primary" id="btn-create-post" onclick="openCreateModal()">➕ 发布新文章</button>
                <button class="btn btn-outline" id="btn-change-pwd" onclick="openPasswordModal()">🔑 修改密码</button>
                <a href="/articles" class="btn btn-outline" id="link-cms-articles" style="text-decoration:none;">文章列表</a>
                <a href="/" class="btn btn-outline" id="link-cms-home" style="text-decoration:none;">主页</a>
                <button class="btn btn-outline" id="btn-cms-logout" style="border-color:#dc3545; color:#dc3545;" onclick="handleLogout()">登出</button>
                <button type="button" class="lang-switch-btn" onclick="toggleCmsLang()" id="btn-cms-lang-toggle">English</button>
            </div>
        </div>

        <!-- 待审核新留言醒目通知卡片 -->
        <div id="pending-alert-banner" style="background:#fffbeb; border:1px solid #fde68a; border-radius:6px; padding:12px 18px; margin-bottom:16px; display:none; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
            <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-size:1.2rem;">🔔</span>
                <span style="font-size:0.9rem; color:#92400e; font-weight:500;">
                    系统收到 <span id="banner-pending-count" style="font-weight:bold; color:#b45309; text-decoration:underline;">0</span> 条读者新留言等待审核！
                </span>
            </div>
            <button class="btn btn-primary" id="btn-banner-review" style="background:#d97706; padding:6px 16px; font-size:0.85rem;" onclick="switchAdminTab('comments')">👉 立即前往审核</button>
        </div>

        <!-- 功能选项卡 -->
        <div class="tabs-bar">
            <button id="tab-btn-posts" class="btn btn-primary" onclick="switchAdminTab('posts')"><span id="tab-text-posts">📝 文章管理</span> (<span id="cnt-articles">0</span>)</button>
            <button id="tab-btn-comments" class="btn btn-outline" onclick="switchAdminTab('comments')"><span id="tab-text-comments">💬 留言审核</span> (<span id="cnt-pending" style="font-weight:bold; color:var(--accent);">0</span> <span id="tab-text-pending">待审</span>)</button>
            <button id="tab-btn-profile" class="btn btn-outline" onclick="switchAdminTab('profile')"><span id="tab-text-profile">👤 简历与打赏设置</span></button>
        </div>

        <!-- 1. 文章管理视图 -->
        <div id="view-posts">
            <div style="background:var(--bg-card); border:1px solid var(--border); border-radius:8px; padding:14px 18px; margin-bottom:16px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
                <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
                    <span id="sort-label-text" style="font-size:0.85rem; color:var(--text-muted);">文章排序方式：</span>
                    <select id="sort-field-select" class="form-input" style="width:auto; padding:6px 10px; font-size:0.85rem;" onchange="handleSortChange()">
                        <option value="date" id="sort-opt-date">按发布时间</option>
                        <option value="views" id="sort-opt-views">按浏览量</option>
                        <option value="likes" id="sort-opt-likes">按点赞数</option>
                    </select>
                    <select id="sort-order-select" class="form-input" style="width:auto; padding:6px 10px; font-size:0.85rem;" onchange="handleSortChange()">
                        <option value="desc" id="sort-opt-desc">降序（高 → 低）</option>
                        <option value="asc" id="sort-opt-asc">升序（低 → 高）</option>
                    </select>
                </div>
                <span id="sort-hint-text" style="font-size:0.78rem; color:var(--text-light);">保存后文章列表页即时按此顺序展示</span>
            </div>
            <div id="items-list"></div>
        </div>

        <!-- 2. 留言审核视图 -->
        <div id="view-comments" style="display:none;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:10px;">
                <div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center;">
                    <button type="button" id="pill-filter-pending" class="btn btn-primary" style="font-size:0.82rem; padding:4px 12px;" onclick="setAdminCommentFilter('pending')">🟡 待审核 (<span id="filter-cnt-pending">0</span>)</button>
                    <button type="button" id="pill-filter-approved" class="btn btn-outline" style="font-size:0.82rem; padding:4px 12px;" onclick="setAdminCommentFilter('approved')">🟢 已通过展示 (<span id="filter-cnt-approved">0</span>)</button>
                    <button type="button" id="pill-filter-rejected" class="btn btn-outline" style="font-size:0.82rem; padding:4px 12px;" onclick="setAdminCommentFilter('rejected')">🔴 超过24h/已驳回 (<span id="filter-cnt-rejected">0</span>)</button>
                    <button type="button" id="pill-filter-all" class="btn btn-outline" style="font-size:0.82rem; padding:4px 12px;" onclick="setAdminCommentFilter('all')">全部留言 (<span id="filter-cnt-all">0</span>)</button>
                </div>
                <div style="display:flex; gap:10px; align-items:center;">
                    <button class="btn btn-outline" style="font-size:0.82rem; padding:4px 12px;" onclick="refreshAdminComments()">🔄 刷新最新留言</button>
                    <span style="font-size:0.82rem; color:var(--text-light);">审核通过的留言将在对应文章末尾即时公开展示</span>
                </div>
            </div>
            <div id="comments-admin-list"></div>
        </div>

        <!-- 3. 个人简历与打赏收款码视图 -->
        <div id="view-profile" style="display:none;">
            <div style="background:var(--bg-card); border:1px solid var(--border); border-radius:8px; padding:24px; margin-bottom:20px;">
                <h3 style="font-family:var(--font-serif); font-size:1.3rem; margin-bottom:12px; color:var(--text-main);">💰 读者打赏微信收款码</h3>
                <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:16px;">
                    读者阅读文章后点击文末【打赏作者】时展示该二维码。您可以随时上传替换为自己的真实微信/支付宝收款码。
                </p>
                <div style="display:flex; align-items:center; gap:24px; flex-wrap:wrap;">
                    <div>
                        <img id="preview-reward-qr" src="" style="width:140px; height:140px; object-fit:contain; border:1px solid var(--border); border-radius:6px; background:#fff; padding:4px;" alt="打赏收款码" />
                    </div>
                    <div style="display:flex; flex-direction:column; gap:10px;">
                        <input type="file" id="upload-reward-qr-input" accept="image/*" style="display:none;" onchange="handleRewardQrUpload(event)" />
                        <button type="button" class="btn btn-primary" onclick="document.getElementById('upload-reward-qr-input').click()">📤 上传替换收款码</button>
                        <button type="button" class="btn btn-outline" onclick="resetRewardQrToDefault()">↺ 恢复默认收款码</button>
                        <span id="qr-upload-status" style="font-size:0.82rem; color:var(--text-light);">支持 JPG / PNG 格式</span>
                    </div>
                </div>
            </div>

            <form id="profile-edit-form" onsubmit="handleSaveProfile(event)">
                <div style="background:var(--bg-card); border:1px solid var(--border); border-radius:8px; padding:24px; margin-bottom:20px;">
                    <h3 style="font-family:var(--font-serif); font-size:1.3rem; margin-bottom:16px; color:var(--text-main);">👤 个人基础信息与简介</h3>
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
                        <div class="form-group">
                            <label class="form-label">中文姓名 (Chinese Name)</label>
                            <input type="text" id="prof-nameZh" class="form-input" required />
                        </div>
                        <div class="form-group">
                            <label class="form-label">英文姓名 (English Name)</label>
                            <input type="text" id="prof-nameEn" class="form-input" required />
                        </div>
                    </div>
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
                        <div class="form-group">
                            <label class="form-label">职位名称 (中文)</label>
                            <input type="text" id="prof-posZh" class="form-input" required />
                        </div>
                        <div class="form-group">
                            <label class="form-label">职位名称 (英文)</label>
                            <input type="text" id="prof-posEn" class="form-input" required />
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">联系邮箱 (Email)</label>
                        <input type="email" id="prof-email" class="form-input" required />
                    </div>
                    <div class="form-group">
                        <label class="form-label">个人简介/自我介绍 (中文 Bio)</label>
                        <textarea id="prof-introZh" class="form-textarea" rows="3" required></textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">个人简介/自我介绍 (英文 Bio)</label>
                        <textarea id="prof-introEn" class="form-textarea" rows="3" required></textarea>
                    </div>
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
                        <div class="form-group">
                            <label class="form-label">核心领域 (中文 Focus)</label>
                            <input type="text" id="prof-focusZh" class="form-input" required />
                        </div>
                        <div class="form-group">
                            <label class="form-label">核心领域 (英文 Focus)</label>
                            <input type="text" id="prof-focusEn" class="form-input" required />
                        </div>
                    </div>
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
                        <div class="form-group">
                            <label class="form-label">技术栈 (中文 Tech Stack)</label>
                            <input type="text" id="prof-techZh" class="form-input" required />
                        </div>
                        <div class="form-group">
                            <label class="form-label">技术栈 (英文 Tech Stack)</label>
                            <input type="text" id="prof-techEn" class="form-input" required />
                        </div>
                    </div>
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
                        <div class="form-group">
                            <label class="form-label">教育背景 (中文 Education)</label>
                            <input type="text" id="prof-eduZh" class="form-input" required />
                        </div>
                        <div class="form-group">
                            <label class="form-label">教育背景 (英文 Education)</label>
                            <input type="text" id="prof-eduEn" class="form-input" required />
                        </div>
                    </div>
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
                        <div class="form-group">
                            <label class="form-label">日常语言 (中文 Languages)</label>
                            <input type="text" id="prof-langZh" class="form-input" required />
                        </div>
                        <div class="form-group">
                            <label class="form-label">日常语言 (英文 Languages)</label>
                            <input type="text" id="prof-langEn" class="form-input" required />
                        </div>
                    </div>
                </div>

                <div style="background:var(--bg-card); border:1px solid var(--border); border-radius:8px; padding:24px; margin-bottom:24px;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px; flex-wrap:wrap; gap:12px;">
                        <div>
                            <h3 style="font-family:var(--font-serif); font-size:1.3rem; margin-bottom:6px; color:var(--text-main);">💼 详尽工作经历与工程履历 (支持自由添加/删除/排序)</h3>
                            <p style="font-size:0.85rem; color:var(--text-muted); margin:0; line-height:1.5;">
                                提示：可自由添加任意多段工作经历，支持「⬆️ 上移」「⬇️ 下移」「🗑️ 删除」。以 <code>- </code> 或 <code>* </code> 开头的行自动渲染为列表项，支持 <code>**加粗**</code> 语法。
                            </p>
                        </div>
                        <button type="button" class="btn btn-primary" onclick="addExperienceCard()" style="white-space:nowrap; padding:8px 16px; font-size:0.9rem;">
                            ➕ 添加新工作经历
                        </button>
                    </div>

                    <!-- 动态经历卡片容器 -->
                    <div id="experiences-editor-container" style="display:flex; flex-direction:column; gap:16px;">
                        <!-- JS 动态渲染各公司经历卡片 -->
                    </div>

                    <div style="margin-top:16px; text-align:center;">
                        <button type="button" class="btn" onclick="addExperienceCard()" style="border:1px dashed var(--accent); color:var(--accent); background:transparent; font-size:0.88rem; padding:8px 24px; border-radius:6px; cursor:pointer;">
                            ➕ 添加另一段工作经历
                        </button>
                    </div>

                    <div style="border-top:1px dashed var(--border); margin:24px 0 20px 0;"></div>

                    <!-- 战略级客户服务履历 -->
                    <div class="form-group">
                        <label class="form-label" style="font-weight:600; color:var(--accent);">🏛️ 战略级重要客户与机构服务赋能 (中文)</label>
                        <textarea id="prof-clientsZh" class="form-textarea" rows="3" required></textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Strategic Clients & Organizations (英文)</label>
                        <textarea id="prof-clientsEn" class="form-textarea" rows="2"></textarea>
                    </div>
                </div>

                <div style="position:sticky; bottom:20px; background:var(--bg-card); padding:16px 20px; border-radius:8px; border:1px solid var(--border); box-shadow:0 4px 16px rgba(0,0,0,0.08); display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:0.88rem; color:var(--text-muted);">保存后主页、工作经历页面及文章打赏码将即时生效</span>
                    <button type="submit" class="btn btn-primary" id="btn-save-profile" style="padding:10px 24px; font-size:0.95rem;">💾 保存简历与收款码</button>
                </div>
            </form>
        </div>
    </div>

    <!-- 新建/编辑文章 Modal -->
    <div id="modal" class="modal-mask">
        <div class="modal-card" style="max-width:760px; width:95%;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                <h3 id="modal-title" style="font-family:var(--font-serif); font-size:1.4rem; margin:0;">编辑文章</h3>
                <div style="display:flex; gap:8px;">
                    <input type="file" id="article-md-file" accept=".md,.markdown,.txt" style="display:none;" onchange="handleArticleMdImport(event)" />
                    <button type="button" class="btn btn-outline" style="font-size:0.8rem; padding:4px 10px;" onclick="document.getElementById('article-md-file').click()" title="支持从微信公众号、知乎、Notion、Obsidian 等导出的 Markdown 文件一键导入">📥 导入 .md 外部文章</button>
                </div>
            </div>
            <form id="post-form" onsubmit="handleSave(event)">
                <input type="hidden" id="item-id" />
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
                    <div class="form-group">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                            <label class="form-label" style="margin-bottom:0;">标题（中文）</label>
                            <button type="button" class="btn btn-outline" id="btn-translate-title-to-zh" style="font-size:0.75rem; padding:2px 8px; border-radius:4px;" onclick="handleTranslateTitle('en', 'zh')" title="将英文标题通过AI翻译为中文">🤖 从英文翻译标题</button>
                        </div>
                        <input type="text" id="item-title" class="form-input" placeholder="文章中文标题" required />
                    </div>
                    <div class="form-group">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                            <label class="form-label" style="margin-bottom:0;">Title (English)</label>
                            <button type="button" class="btn btn-primary" id="btn-translate-title-to-en" style="font-size:0.75rem; padding:2px 8px; border-radius:4px; background:var(--accent);" onclick="handleTranslateTitle('zh', 'en')" title="将中文标题通过AI翻译为英文">🤖 AI生成英文标题</button>
                        </div>
                        <input type="text" id="item-title-en" class="form-input" placeholder="Article Title (English)" />
                    </div>
                </div>
                <div style="display:grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap:12px;">
                    <div class="form-group">
                        <label class="form-label">自定义发布时间 (Date)</label>
                        <input type="text" id="item-date" class="form-input" placeholder="2025.02" required />
                    </div>
                    <div class="form-group">
                        <label class="form-label">分类标签 (Tag)</label>
                        <input type="text" id="item-tag" class="form-input" placeholder="LLM, Agent" required />
                    </div>
                    <div class="form-group">
                        <label class="form-label">文章浏览量 (Views)</label>
                        <input type="number" id="item-views" class="form-input" min="0" placeholder="1000" required />
                    </div>
                    <div class="form-group">
                        <label class="form-label">文章点赞数 (Likes)</label>
                        <input type="number" id="item-likes" class="form-input" min="0" placeholder="0" required />
                    </div>
                </div>
                <div class="form-group">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; flex-wrap:wrap; gap:8px;">
                        <div class="content-tabs">
                            <button type="button" class="tab-btn active" id="admin-tab-zh-btn" onclick="switchAdminEditorTab('zh')">中文内容</button>
                            <button type="button" class="tab-btn" id="admin-tab-en-btn" onclick="switchAdminEditorTab('en')">English Content</button>
                        </div>
                        <div style="display:flex; gap:6px; flex-wrap:wrap;">
                            <button type="button" class="btn btn-outline" style="font-size:0.75rem; padding:3px 8px;" onclick="convertContentMarkdownToHtml()" title="若在下方粘贴了 Markdown 语法，点击一键转为标准 HTML">🔄 MD 转 HTML</button>
                            <input type="file" id="article-img-file" accept="image/*" style="display:none;" onchange="handleArticleImageUpload(event)" />
                            <button type="button" class="btn btn-outline" style="font-size:0.75rem; padding:3px 8px;" onclick="document.getElementById('article-img-file').click()" title="支持智能轻度压缩并上传，不消耗 Worker 内存">📁 上传本地插图</button>
                            <button type="button" class="btn btn-outline" style="font-size:0.75rem; padding:3px 8px;" onclick="insertArticleExternalImg()">🔗 插入外链图片</button>
                        </div>
                    </div>

                    <div id="admin-tab-content-zh" class="tab-content active">
                        <textarea id="item-content" class="form-textarea" rows="10" placeholder="<p>中文正文段落内容...</p>" required></textarea>
                        <div style="margin-top:6px; display:flex; justify-content:flex-end;">
                            <button type="button" id="translateToEn" class="btn btn-primary" style="font-size:0.8rem; padding:5px 12px; background:var(--accent);" onclick="handleTranslateAI('zh', 'en')">🤖 AI生成英文版</button>
                        </div>
                    </div>

                    <div id="admin-tab-content-en" class="tab-content">
                        <div style="padding:6px 10px; background:#fff3cd; color:#856404; border-left:3px solid var(--accent); margin-bottom:8px; font-size:0.82rem; border-radius:4px;">
                            ⚠️ AI生成内容，请人工审核后再发布
                        </div>
                        <textarea id="item-content-en" class="form-textarea" rows="10" placeholder="<p>English article content...</p>"></textarea>
                        <div style="margin-top:6px; display:flex; justify-content:flex-end;">
                            <button type="button" id="translateToZh" class="btn btn-primary" style="font-size:0.8rem; padding:5px 12px; background:var(--accent);" onclick="handleTranslateAI('en', 'zh')">🤖 AI生成中文版</button>
                        </div>
                    </div>
                </div>

                <div style="margin-top: 10px; margin-bottom: 14px;">
                    <label style="font-size: 0.88rem; color: var(--text-main); cursor: pointer; display: flex; align-items: center; gap: 6px;">
                        <input type="checkbox" id="item-is-bilingual" style="accent-color: var(--accent);" />
                        <span>标记为双语文章（前端将显示语言切换按钮）</span>
                    </label>
                </div>

                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:16px;">
                    <span style="font-size:0.78rem; color:var(--text-light);">💡 浏览量 / 点赞数均可自由自定义，读者互动时会在此数值基础上累加递增</span>
                    <div style="display:flex; gap:10px;">
                        <button type="button" class="btn btn-outline" onclick="closeModal()">取消</button>
                        <button type="submit" class="btn btn-primary">保存发布</button>
                    </div>
                </div>
            </form>
        </div>
    </div>

    <!-- 修改密码说明 / 安全设置 Modal -->
    <div id="password-modal" class="modal-mask" style="display:none;">
        <div class="modal-card" style="max-width:580px; width:95%;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                <h3 style="font-family:var(--font-serif); font-size:1.3rem; margin:0;">🔑 管理员密码修改指南</h3>
                <button type="button" class="btn btn-outline" style="padding:4px 10px;" onclick="closePasswordModal()">✕ 关闭</button>
            </div>
            <div style="font-size:0.9rem; line-height:1.7; color:var(--text-main);">
                <p style="margin-top:0; color:var(--text-muted); font-size:0.88rem;">
                    甜爱网站运行在 <strong>Cloudflare 全球边缘网络</strong> 上，密码由环境变量或加密机密保护。您可以选择以下任一方式修改：
                </p>

                <div style="background:var(--bg-subtle); border-radius:6px; padding:14px; margin-bottom:14px; border:1px solid var(--border);">
                    <div style="font-weight:600; color:var(--text-main); margin-bottom:8px;">
                        ⚡ 方式一：Cloudflare 仪表盘直接修改（推荐 · 5秒全球生效）
                    </div>
                    <ol style="margin:0; padding-left:20px; font-size:0.85rem; color:var(--text-muted); display:flex; flex-direction:column; gap:4px;">
                        <li>打开 <a href="https://dash.cloudflare.com/" target="_blank" style="color:var(--accent); text-decoration:underline;">Cloudflare 仪表盘 (dash.cloudflare.com)</a></li>
                        <li>进入 <strong>Workers 和 Pages</strong> &rarr; 点击 <strong>tianai</strong></li>
                        <li>点击上方 <strong>设置 (Settings)</strong> 标签页 &rarr; <strong>变量和机密 (Variables and Secrets)</strong></li>
                        <li>找到 <code>ADMIN_PASSWORD</code> 变量点击编辑（或点击添加加密机密 Secret）</li>
                        <li>输入新密码，点击 <strong>保存并部署 (Save and Deploy)</strong> 即可！</li>
                    </ol>
                </div>

                <div style="background:var(--bg-subtle); border-radius:6px; padding:14px; margin-bottom:16px; border:1px solid var(--border);">
                    <div style="font-weight:600; color:var(--text-main); margin-bottom:8px;">
                        🛠️ 方式二：在代码仓库修改（Git 自动部署）
                    </div>
                    <ol style="margin:0; padding-left:20px; font-size:0.85rem; color:var(--text-muted); display:flex; flex-direction:column; gap:4px;">
                        <li>打开本地项目中的 <code>wrangler.toml</code> 文件</li>
                        <li>修改 <code>ADMIN_PASSWORD = "新密码"</code></li>
                        <li>提交并推送到 GitHub 仓库即可自动触发部署</li>
                    </ol>
                </div>

                <div style="display:flex; justify-content:flex-end;">
                    <button type="button" class="btn btn-primary" onclick="closePasswordModal()">我知道了</button>
                </div>
            </div>
        </div>
    </div>

    <script>
        // 1. 会话凭据只存在于 HttpOnly cookie 里，前端既拿不到也不需要拿到。
        //    刷新页面后由服务端 checkAuth 判定是否仍处于登录态。

        // 2. 无操作自动安全登出（与服务端 30 分钟绝对有效期配套，作为第二道保险）
        let inactivityTimer = null;
        const INACTIVITY_MS = 30 * 60 * 1000; // 30 分钟

        function onUserInteraction() {
            resetInactivityTimer();
        }

        function resetInactivityTimer() {
            if (inactivityTimer) clearTimeout(inactivityTimer);
            inactivityTimer = setTimeout(async () => {
                alert('您已超过 30 分钟未进行任何操作，系统已自动安全登出以保障账户安全。');
                await handleLogout();
            }, INACTIVITY_MS);
        }

        ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'].forEach(evt => {
            window.addEventListener(evt, onUserInteraction, { passive: true });
        });
        resetInactivityTimer();

        // 3. 通用安全请求封装（凭据由浏览器自动携带 cookie，无需附加任何自定义头）
        async function adminFetch(url, options = {}) {
            resetInactivityTimer();
            options.credentials = 'include';
            const res = await fetch(url, options);
            if (res.status === 401) {
                alert('管理员登录凭证失效或已超时，请重新登录。');
                await handleLogout();
                throw new Error('Unauthorized');
            }
            return res;
        }

        // 失败时把服务端的真实原因摊开给管理员看。以前只提示「操作失败」，
        // 让人误以为是隐藏按钮坏了，其实常常是 KV 每日写入配额耗尽。
        function describeAdminError(err, prefix) {
            const t = cmsI18n[currentCmsLang] || cmsI18n.zh;
            const fallback = currentCmsLang === 'en' ? 'Operation failed, please retry' : '操作失败，请重试';
            const detail = (err && err.error) ? String(err.error) : '';
            let msg = (prefix ? prefix + '：' : '✗ ') + (detail || fallback);
            if (/limit exceeded|usage limit|10048/i.test(detail)) {
                msg += '\\n\\n' + t.kvQuotaHint;
            }
            return msg;
        }

        let articles = ${articlesJson};
        let comments = ${commentsJson};
        let currentProfile = ${profileJson};
        let currentSettings = ${settingsJson};
        let currentAdminTab = 'posts';

        function escapeHtml(str) {
            if (!str) return '';
            return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        }

        let activeCommentFilter = 'pending';

        function setAdminCommentFilter(filter) {
            activeCommentFilter = filter;
            ['pending', 'approved', 'rejected', 'all'].forEach(f => {
                const el = document.getElementById('pill-filter-' + f);
                if (el) {
                    el.className = f === filter ? 'btn btn-primary' : 'btn btn-outline';
                }
            });
            renderAdminCommentsList();
        }

        function updateCounts() {
            document.getElementById('cnt-articles').innerText = articles.length;
            const pendingCount = comments.filter(c => c.status === 'pending').length;
            const approvedCount = comments.filter(c => c.status === 'approved').length;
            const rejectedCount = comments.filter(c => c.status === 'rejected').length;
            const totalCount = comments.length;

            document.getElementById('cnt-pending').innerText = pendingCount;
            const elP = document.getElementById('filter-cnt-pending'); if (elP) elP.innerText = pendingCount;
            const elA = document.getElementById('filter-cnt-approved'); if (elA) elA.innerText = approvedCount;
            const elR = document.getElementById('filter-cnt-rejected'); if (elR) elR.innerText = rejectedCount;
            const elT = document.getElementById('filter-cnt-all'); if (elT) elT.innerText = totalCount;

            const banner = document.getElementById('pending-alert-banner');
            const bannerCnt = document.getElementById('banner-pending-count');
            if (banner && bannerCnt) {
                if (pendingCount > 0) {
                    banner.style.display = 'flex';
                    bannerCnt.innerText = pendingCount;
                } else {
                    banner.style.display = 'none';
                }
            }
        }

        // 后台静默轮询：每15秒拉取一次最新留言，实时感知新留言
        setInterval(() => {
            refreshAdminComments();
        }, 15000);

        async function switchAdminTab(tab) {
            currentAdminTab = tab;
            const btnPosts = document.getElementById('tab-btn-posts');
            const btnComments = document.getElementById('tab-btn-comments');
            const btnProfile = document.getElementById('tab-btn-profile');
            const viewPosts = document.getElementById('view-posts');
            const viewComments = document.getElementById('view-comments');
            const viewProfile = document.getElementById('view-profile');
            
            btnPosts.className = tab === 'posts' ? 'btn btn-primary' : 'btn btn-outline';
            btnComments.className = tab === 'comments' ? 'btn btn-primary' : 'btn btn-outline';
            btnProfile.className = tab === 'profile' ? 'btn btn-primary' : 'btn btn-outline';

            viewPosts.style.display = tab === 'posts' ? 'block' : 'none';
            viewComments.style.display = tab === 'comments' ? 'block' : 'none';
            viewProfile.style.display = tab === 'profile' ? 'block' : 'none';

            if (tab === 'posts') renderAdminList();
            if (tab === 'comments') await refreshAdminComments();
            if (tab === 'profile') populateProfileForm();
        }

        let currentCmsLang = 'zh';

        const cmsI18n = {
            zh: {
                cmsTitle: "网站控制台",
                inactivity: "⏱️ 2分钟无操作自动登出保护中",
                createPost: "➕ 发布新文章",
                changePwd: "🔑 修改密码",
                navArticles: "文章列表",
                navHome: "主页",
                logout: "登出",
                bannerReview: "👉 立即前往审核",
                tabPosts: "📝 文章管理",
                tabComments: "💬 留言审核",
                tabPending: "待审",
                tabProfile: "👤 简历与打赏设置",
                filterPending: "🟡 待审核",
                filterApproved: "🟢 已通过展示",
                filterRejected: "🔴 超过24h/已驳回",
                filterAll: "全部留言",
                toggleText: "English",
                btnEdit: "编辑",
                btnDelete: "删除",
                badgeBilingual: "🌐 双语",
                badgeZhOnly: "🔸 仅中文",
                sortLabel: "文章排序方式：",
                sortOptDate: "按发布时间",
                sortOptViews: "按浏览量",
                sortOptLikes: "按点赞数",
                sortOptDesc: "降序（高 → 低）",
                sortOptAsc: "升序（低 → 高）",
                sortHint: "保存后文章列表页即时按此顺序展示",
                likesSuffix: " 赞",
                btnHide: "隐藏",
                btnShow: "显示",
                badgeHidden: "🙈 已隐藏",
                badgeVisible: "👁 展示中",
                hideConfirm: "确定要隐藏这篇文章吗？隐藏后公开列表页不再展示，访客也无法通过链接打开。",
                showConfirm: "确定要恢复展示这篇文章吗？",
                hideDone: "✓ 文章已隐藏，公开列表不再展示",
                showDone: "✓ 文章已恢复展示",
                kvQuotaHint: "原因：云端 KV 的每日写入配额已用尽（免费版 1000 次/天），所有保存类操作都会失败。请等配额重置（UTC 00:00，即太平洋时间 17:00）后再试；本站只有在写文章、切隐藏、审核留言时才写 KV，重置后不会立即再次耗尽。"
            },
            en: {
                cmsTitle: "Website Console",
                inactivity: "⏱️ Protected by 2min auto-logout",
                createPost: "➕ New Article",
                changePwd: "🔑 Password",
                navArticles: "Articles",
                navHome: "Home",
                logout: "Sign Out",
                bannerReview: "👉 Review Now",
                tabPosts: "📝 Articles",
                tabComments: "💬 Comments",
                tabPending: "pending",
                tabProfile: "👤 Profile & Settings",
                filterPending: "🟡 Pending",
                filterApproved: "🟢 Approved",
                filterRejected: "🔴 Over 24h / Rejected",
                filterAll: "All Comments",
                toggleText: "中文",
                btnEdit: "Edit",
                btnDelete: "Delete",
                badgeBilingual: "🌐 Bilingual",
                badgeZhOnly: "🔸 Chinese only",
                sortLabel: "Sort articles by:",
                sortOptDate: "Publish date",
                sortOptViews: "Views",
                sortOptLikes: "Likes",
                sortOptDesc: "Descending (high → low)",
                sortOptAsc: "Ascending (low → high)",
                sortHint: "The public article list follows this order immediately",
                likesSuffix: " likes",
                btnHide: "Hide",
                btnShow: "Show",
                badgeHidden: "🙈 Hidden",
                badgeVisible: "👁 Visible",
                hideConfirm: "Hide this article? It will no longer appear in the public list, and visitors will not be able to open it via a direct link.",
                showConfirm: "Restore this article to public view?",
                hideDone: "✓ Article hidden from the public list",
                showDone: "✓ Article is public again",
                kvQuotaHint: "Cause: the daily Cloudflare KV write quota (1,000/day on the free plan) is used up, so every save-style action fails. Please retry after the quota resets at 00:00 UTC. This site only writes to KV when publishing, toggling visibility, or moderating comments, so it should not run out again immediately."
            }
        };

        function toggleCmsLang() {
            applyCmsLang(currentCmsLang === 'zh' ? 'en' : 'zh');
        }

        function applyCmsLang(lang) {
            currentCmsLang = lang;
            try {
                localStorage.setItem('preferredLang', lang);
                localStorage.setItem('site_lang', lang);
            } catch(e) {}
            document.cookie = "preferredLang=" + lang + "; Path=/; Max-Age=31536000; SameSite=Lax";

            const t = cmsI18n[lang] || cmsI18n.zh;
            const toggleBtn = document.getElementById('btn-cms-lang-toggle');
            if (toggleBtn) toggleBtn.innerText = t.toggleText;

            const titleEl = document.getElementById('cms-title');
            if (titleEl) titleEl.innerText = t.cmsTitle;
            const inactEl = document.getElementById('inactivity-indicator');
            if (inactEl) inactEl.innerText = t.inactivity;
            const btnCreate = document.getElementById('btn-create-post');
            if (btnCreate) btnCreate.innerText = t.createPost;
            const btnPwd = document.getElementById('btn-change-pwd');
            if (btnPwd) btnPwd.innerText = t.changePwd;
            const linkArticles = document.getElementById('link-cms-articles');
            if (linkArticles) linkArticles.innerText = t.navArticles;
            const linkHome = document.getElementById('link-cms-home');
            if (linkHome) linkHome.innerText = t.navHome;
            const btnLogout = document.getElementById('btn-cms-logout');
            if (btnLogout) btnLogout.innerText = t.logout;

            const tabPosts = document.getElementById('tab-text-posts');
            if (tabPosts) tabPosts.innerText = t.tabPosts;
            const tabComments = document.getElementById('tab-text-comments');
            if (tabComments) tabComments.innerText = t.tabComments;
            const tabPending = document.getElementById('tab-text-pending');
            if (tabPending) tabPending.innerText = t.tabPending;
            const tabProfile = document.getElementById('tab-text-profile');
            if (tabProfile) tabProfile.innerText = t.tabProfile;
            const btnBanner = document.getElementById('btn-banner-review');
            if (btnBanner) btnBanner.innerText = t.bannerReview;

            const sortLabel = document.getElementById('sort-label-text');
            if (sortLabel) sortLabel.innerText = t.sortLabel;
            const sortOptDate = document.getElementById('sort-opt-date');
            if (sortOptDate) sortOptDate.innerText = t.sortOptDate;
            const sortOptViews = document.getElementById('sort-opt-views');
            if (sortOptViews) sortOptViews.innerText = t.sortOptViews;
            const sortOptLikes = document.getElementById('sort-opt-likes');
            if (sortOptLikes) sortOptLikes.innerText = t.sortOptLikes;
            const sortOptDesc = document.getElementById('sort-opt-desc');
            if (sortOptDesc) sortOptDesc.innerText = t.sortOptDesc;
            const sortOptAsc = document.getElementById('sort-opt-asc');
            if (sortOptAsc) sortOptAsc.innerText = t.sortOptAsc;
            const sortHint = document.getElementById('sort-hint-text');
            if (sortHint) sortHint.innerText = t.sortHint;

            renderAdminList();
        }

        function parseArticleDateMs(dateStr) {
            if (!dateStr) return 0;
            const raw = String(dateStr).trim();
            const m = raw.match(/(\d{4})\D+(\d{1,2})(?:\D+(\d{1,2}))?/);
            if (!m) {
                const y = raw.match(/(\d{4})/);
                return y ? Date.UTC(parseInt(y[1], 10), 0, 1) : 0;
            }
            const year = parseInt(m[1], 10);
            const month = Math.min(Math.max(parseInt(m[2], 10), 1), 12);
            const day = m[3] ? Math.min(Math.max(parseInt(m[3], 10), 1), 31) : 1;
            return Date.UTC(year, month - 1, day);
        }

        function getSortConfig() {
            const cfg = (currentSettings && currentSettings.articleSort) || { field: 'date', order: 'desc' };
            return {
                field: ['date', 'views', 'likes'].includes(cfg.field) ? cfg.field : 'date',
                order: cfg.order === 'asc' ? 'asc' : 'desc'
            };
        }

        function applySortToLocalList() {
            const cfg = getSortConfig();
            const dir = cfg.order === 'asc' ? 1 : -1;
            articles.sort((a, b) => {
                let va = 0;
                let vb = 0;
                if (cfg.field === 'views') { va = Number(a.views) || 0; vb = Number(b.views) || 0; }
                else if (cfg.field === 'likes') { va = Number(a.likes) || 0; vb = Number(b.likes) || 0; }
                else { va = parseArticleDateMs(a.date); vb = parseArticleDateMs(b.date); }
                if (va === vb) return 0;
                return dir * (va - vb);
            });
        }

        function populateSortControls() {
            const cfg = getSortConfig();
            const fieldSel = document.getElementById('sort-field-select');
            const orderSel = document.getElementById('sort-order-select');
            if (fieldSel) fieldSel.value = cfg.field;
            if (orderSel) orderSel.value = cfg.order;
        }

        async function handleSortChange() {
            resetInactivityTimer();
            const fieldSel = document.getElementById('sort-field-select');
            const orderSel = document.getElementById('sort-order-select');
            const articleSort = {
                field: fieldSel ? fieldSel.value : 'date',
                order: orderSel ? orderSel.value : 'desc'
            };
            const previous = getSortConfig();

            currentSettings = Object.assign({}, currentSettings, { articleSort: articleSort });
            applySortToLocalList();
            renderAdminList();

            try {
                const res = await adminFetch('/api/settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ articleSort: articleSort })
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.settings) {
                        currentSettings = data.settings;
                        applySortToLocalList();
                        renderAdminList();
                    }
                } else {
                    currentSettings = Object.assign({}, currentSettings, { articleSort: previous });
                    applySortToLocalList();
                    populateSortControls();
                    renderAdminList();
                    alert('排序设置保存失败，请重新登录后再试。');
                }
            } catch (e) {
                console.error('Save sort settings error:', e);
                currentSettings = Object.assign({}, currentSettings, { articleSort: previous });
                applySortToLocalList();
                populateSortControls();
                renderAdminList();
            }
        }

        async function refreshAdminArticles() {
            try {
                // 带时间戳绕过 15 秒公开缓存，确保后台看到的是刚保存的最新数据
                const res = await adminFetch('/api/articles?ts=' + Date.now());
                if (!res.ok) return;
                const data = await res.json();
                if (Array.isArray(data)) {
                    articles = data;
                    renderAdminList();
                }
            } catch (e) {
                console.error('Refresh articles error:', e);
            }
        }

        function renderAdminList() {
            updateCounts();
            const list = document.getElementById('items-list');
            const isEn = currentCmsLang === 'en';
            const t = cmsI18n[currentCmsLang] || cmsI18n.zh;
            list.innerHTML = articles.map(a => {
                const titleZh = a.title_zh || (a.title && (a.title.zh || a.title.en)) || (typeof a.title === 'string' ? a.title : a.id);
                const titleEn = a.title_en || (a.title && a.title.en) || '';
                const displayTitle = (isEn && titleEn) ? titleEn : (titleZh || titleEn || a.id);
                const hasEn = !!(a.content_en && a.content_en.trim()) || !!(a.content && a.content.en && a.content.en.trim());
                const isBilingual = a.isBilingual !== undefined ? !!a.isBilingual : hasEn;
                const badge = (isBilingual && hasEn)
                    ? (' <span style="background:var(--bg-subtle); border:1px solid var(--accent); color:var(--accent); font-size:0.7rem; padding:1px 6px; border-radius:10px;">' + t.badgeBilingual + '</span>')
                    : (' <span style="background:var(--bg-subtle); border:1px solid var(--border); color:var(--text-light); font-size:0.7rem; padding:1px 6px; border-radius:10px;">' + t.badgeZhOnly + '</span>');

                const hideBadge = a.hidden
                    ? (' <span style="background:#f8d7da; border:1px solid #f5c6cb; color:#721c24; font-size:0.7rem; padding:1px 6px; border-radius:10px;">' + t.badgeHidden + '</span>')
                    : (' <span style="background:#d4edda; border:1px solid #c3e6cb; color:#155724; font-size:0.7rem; padding:1px 6px; border-radius:10px;">' + t.badgeVisible + '</span>');

                return '<div class="item-card"' + (a.hidden ? ' style="opacity:0.72;"' : '') + '>' +
                    '<div>' +
                        '<strong>' + escapeHtml(displayTitle) + '</strong>' + badge + hideBadge +
                        '<div style="font-size:0.8rem; color:var(--text-light); margin-top:4px;">' +
                            (isEn ? 'Date: ' : '发布时间: ') + '<span style="color:var(--accent); font-family:var(--font-mono);">' + a.date + '</span> · ' + (a.tag || '') + ' · <span style="color:var(--accent);">👁️ ' + ((typeof a.views === 'number') ? a.views.toLocaleString() : (a.views || '0')) + (isEn ? ' views' : ' 浏览') + '</span>' +
                            ' · <span style="color:var(--accent);">👍 ' + ((typeof a.likes === 'number') ? a.likes.toLocaleString() : (parseInt(a.likes, 10) || 0)) + t.likesSuffix + '</span>' +
                        '</div>' +
                    '</div>' +
                    '<div style="display:flex; gap:8px;">' +
                        '<button class="btn btn-outline" data-id="' + a.id + '" data-hidden="' + (a.hidden ? '1' : '0') + '" onclick="toggleArticleHidden(this.dataset.id, this.dataset.hidden)">' + (a.hidden ? t.btnShow : t.btnHide) + '</button>' +
                        '<button class="btn btn-outline" data-id="' + a.id + '" onclick="openEditModal(this.dataset.id)">' + t.btnEdit + '</button>' +
                        '<button class="btn btn-danger" data-id="' + a.id + '" onclick="deleteArticle(this.dataset.id)">' + t.btnDelete + '</button>' +
                    '</div>' +
                '</div>';
            }).join('');
        }

        function renderAdminCommentsList() {
            updateCounts();
            const container = document.getElementById('comments-admin-list');
            if (!container) return;
            
            let filtered = comments;
            if (activeCommentFilter !== 'all') {
                filtered = comments.filter(c => c.status === activeCommentFilter);
            }
            
            if (filtered.length === 0) {
                container.innerHTML = '<div style="background:var(--bg-card); border:1px dashed var(--border); border-radius:6px; padding:32px; text-align:center; color:var(--text-light); font-size:0.88rem;">当前分类下暂无留言</div>';
                return;
            }
            
            container.innerHTML = filtered.map(c => {
                let badge = '<span style="background:#fff3cd; color:#856404; padding:2px 8px; border-radius:10px; font-size:0.75rem; font-weight:500;">🟡 待审核</span>';
                if (c.status === 'approved') badge = '<span style="background:#d4edda; color:#155724; padding:2px 8px; border-radius:10px; font-size:0.75rem; font-weight:500;">🟢 已展示</span>';
                else if (c.autoBlocked) badge = '<span style="background:#f8d7da; color:#721c24; padding:2px 8px; border-radius:10px; font-size:0.75rem; font-weight:500;" title="超24小时未审核自动屏蔽">🔴 已超24h自动屏蔽</span>';
                else if (c.status === 'rejected') badge = '<span style="background:#f8d7da; color:#721c24; padding:2px 8px; border-radius:10px; font-size:0.75rem; font-weight:500;">🔴 已驳回</span>';
                
                const artTitle = c.articleTitle || ('文章 ID: ' + c.articleId);
                
                return '<div class="item-card" style="flex-direction:column; align-items:stretch; gap:12px;">' +
                    '<div style="display:flex; justify-content:space-between; align-items:baseline; flex-wrap:wrap; gap:8px;">' +
                        '<div>' +
                            '<span style="font-size:0.8rem; color:var(--accent); font-weight:500;">所属文章: ' + escapeHtml(artTitle) + '</span>' +
                            '<div style="font-size:0.92rem; margin-top:2px;"><strong>' + escapeHtml(c.author || '匿名读者') + '</strong> <span style="font-size:0.75rem; color:var(--text-light); font-family:var(--font-mono); margin-left:8px;">' + (c.createdAt || '') + '</span></div>' +
                        '</div>' +
                        '<div>' + badge + '</div>' +
                    '</div>' +
                    '<div style="background:var(--bg-subtle); padding:10px 14px; border-radius:4px; font-size:0.88rem; color:var(--text-main); line-height:1.6; border-left:3px solid var(--accent); white-space:pre-wrap;">' + escapeHtml(c.content || '') + '</div>' +
                    '<div style="display:flex; justify-content:flex-end; gap:8px; align-items:center;">' +
                        (c.status !== 'approved' ? '<button class="btn btn-primary" style="background:#28a745; font-size:0.8rem; padding:4px 10px;" data-id="' + c.id + '" data-status="approved" onclick="moderateComment(this.dataset.id, this.dataset.status)">✓ 通过展示</button>' : '') +
                        (c.status !== 'rejected' ? '<button class="btn btn-outline" style="font-size:0.8rem; padding:4px 10px;" data-id="' + c.id + '" data-status="rejected" onclick="moderateComment(this.dataset.id, this.dataset.status)">✗ 驳回隐藏</button>' : '') +
                        '<button class="btn btn-danger" style="font-size:0.8rem; padding:4px 10px;" data-id="' + c.id + '" onclick="deleteComment(this.dataset.id)">删除</button>' +
                    '</div>' +
                '</div>';
            }).join('');
        }

        async function refreshAdminComments() {
            resetInactivityTimer();
            try {
                const res = await adminFetch('/api/admin/comments');
                if (res.ok) {
                    comments = await res.json();
                    renderAdminCommentsList();
                }
            } catch(e) {
                console.error(e);
            }
        }

        async function moderateComment(id, status) {
            resetInactivityTimer();
            try {
                const res = await adminFetch('/api/admin/comments', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, status })
                });
                if (res.ok) {
                    const target = comments.find(c => c.id === id);
                    if (target) {
                        target.status = status;
                        if (status === 'approved') target.autoBlocked = false;
                    }
                    renderAdminCommentsList();
                } else {
                    const err = await res.json().catch(() => ({}));
                    alert('审核操作失败：' + (err.error || '权限或网络错误'));
                }
            } catch(e) {
                console.error(e);
            }
        }

        async function deleteComment(id) {
            resetInactivityTimer();
            if (!confirm('确定要彻底删除该留言吗？')) return;
            try {
                const res = await adminFetch('/api/admin/comments?id=' + encodeURIComponent(id), { method: 'DELETE' });
                if (res.ok) {
                    comments = comments.filter(c => c.id !== id);
                    renderAdminCommentsList();
                    alert('✓ 留言已彻底删除');
                } else {
                    alert('删除失败');
                }
            } catch(e) {
                console.error(e);
            }
        }

        function autoSaveArticleDraft() {
            const id = document.getElementById('item-id').value;
            if (id && id.startsWith('post-')) {
                try {
                    const draft = {
                        title: document.getElementById('item-title').value,
                        title_en: document.getElementById('item-title-en').value,
                        date: document.getElementById('item-date').value,
                        tag: document.getElementById('item-tag').value,
                        views: document.getElementById('item-views').value,
                        likes: document.getElementById('item-likes').value,
                        content: document.getElementById('item-content').value,
                        content_en: document.getElementById('item-content-en').value,
                        isBilingual: document.getElementById('item-is-bilingual').checked
                    };
                    localStorage.setItem('article_editor_draft', JSON.stringify(draft));
                } catch(e) {}
            }
        }

        function switchAdminEditorTab(tab) {
            const btnZh = document.getElementById('admin-tab-zh-btn');
            const btnEn = document.getElementById('admin-tab-en-btn');
            const contentZh = document.getElementById('admin-tab-content-zh');
            const contentEn = document.getElementById('admin-tab-content-en');
            if (tab === 'en') {
                if (btnZh) btnZh.classList.remove('active');
                if (btnEn) btnEn.classList.add('active');
                if (contentZh) { contentZh.classList.remove('active'); contentZh.style.display = 'none'; }
                if (contentEn) { contentEn.classList.add('active'); contentEn.style.display = 'block'; }
            } else {
                if (btnEn) btnEn.classList.remove('active');
                if (btnZh) btnZh.classList.add('active');
                if (contentEn) { contentEn.classList.remove('active'); contentEn.style.display = 'none'; }
                if (contentZh) { contentZh.classList.add('active'); contentZh.style.display = 'block'; }
            }
        }

        async function handleTranslateTitle(from, to) {
            resetInactivityTimer();
            const srcInput = from === 'zh' ? document.getElementById('item-title') : document.getElementById('item-title-en');
            const targetInput = to === 'en' ? document.getElementById('item-title-en') : document.getElementById('item-title');
            const btn = to === 'en' ? document.getElementById('btn-translate-title-to-en') : document.getElementById('btn-translate-title-to-zh');
            
            const srcText = srcInput ? srcInput.value.trim() : '';
            if (!srcText) {
                alert(from === 'zh' ? '请先输入中文标题' : 'Please enter English title first');
                if (srcInput) srcInput.focus();
                return;
            }

            const origText = btn ? btn.textContent : '';
            if (btn) {
                btn.disabled = true;
                btn.textContent = '翻译中...';
            }

            try {
                const res = await adminFetch('/api/translate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text: srcText,
                        from: from,
                        to: to
                    })
                });

                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.error || ('HTTP ' + res.status));
                }

                const data = await res.json();
                if (!data.translatedText) {
                    throw new Error('未收到有效翻译文本');
                }

                targetInput.value = data.translatedText;
                const chk = document.getElementById('item-is-bilingual');
                if (chk) chk.checked = true;

                // 若当前为已保存的文章，自动同步保存到 KV 并刷新列表
                const id = document.getElementById('item-id').value;
                if (id) {
                    const curTitleZh = document.getElementById('item-title').value.trim() || '未命名文章';
                    const curTitleEn = document.getElementById('item-title-en').value.trim() || curTitleZh;
                    const curCustomDate = document.getElementById('item-date').value.trim() || new Date().toISOString().slice(0,7).replace('-', '.');
                    const curTag = document.getElementById('item-tag').value.trim() || 'AI';
                    const curViewsRaw = document.getElementById('item-views').value.trim();
                    const curCustomViews = parseInt(curViewsRaw, 10);
                    const curLikesRaw = document.getElementById('item-likes').value.trim();
                    const curCustomLikes = parseInt(curLikesRaw, 10);
                    const curContentZh = document.getElementById('item-content').value;
                    const curContentEn = document.getElementById('item-content-en').value;

                    const existing = articles.find(x => x.id === id) || {};
                    const autoPayload = {
                        id: id,
                        // 自动保存同样保留隐藏状态，翻译不会让文章「偷偷上线」
                        hidden: existing.hidden === true,
                        title_zh: curTitleZh,
                        title_en: curTitleEn,
                        content_zh: curContentZh,
                        content_en: curContentEn,
                        isBilingual: !!(curContentEn && curContentEn.trim()) || !!(curTitleEn && curTitleEn !== curTitleZh),
                        title: { zh: curTitleZh, en: curTitleEn },
                        content: { zh: curContentZh, en: curContentEn },
                        tag: curTag,
                        date: curCustomDate,
                        readTime: existing.readTime || '5 min read',
                        views: isNaN(curCustomViews) ? (typeof existing.views === 'number' ? existing.views : 1000) : curCustomViews,
                        likes: isNaN(curCustomLikes) ? (typeof existing.likes === 'number' ? existing.likes : 0) : curCustomLikes,
                        summary: { zh: curTitleZh, en: curTitleEn }
                    };

                    const saveRes = await adminFetch('/api/articles', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(autoPayload)
                    });

                    if (saveRes.ok) {
                        try { localStorage.removeItem('article_editor_draft'); } catch(e) {}
                        await refreshAdminArticles();
                        alert('✓ 标题翻译成功并已自动保存！');
                    } else {
                        alert('标题翻译成功已填入！自动保存失败，请稍后点击【保存发布】。');
                    }
                } else {
                    if (typeof autoSaveArticleDraft === 'function') autoSaveArticleDraft();
                    alert('✓ 标题翻译成功！已填入输入框。');
                }
            } catch (error) {
                alert('标题翻译失败：' + error.message);
            } finally {
                if (btn) {
                    btn.disabled = false;
                    btn.textContent = origText;
                }
            }
        }

        async function handleTranslateAI(from, to) {
            resetInactivityTimer();
            const sourceElId = from === 'zh' ? 'item-content' : 'item-content-en';
            const targetElId = to === 'en' ? 'item-content-en' : 'item-content';
            const btnId = from === 'zh' ? 'translateToEn' : 'translateToZh';
            
            const sourceContent = document.getElementById(sourceElId).value;
            const sourceTitle = from === 'zh' ? document.getElementById('item-title').value.trim() : document.getElementById('item-title-en').value.trim();
            const targetTitleInput = to === 'en' ? document.getElementById('item-title-en') : document.getElementById('item-title');

            if ((!sourceContent || !sourceContent.trim()) && !sourceTitle) {
                alert(from === 'zh' ? '请先输入中文标题或正文内容' : 'Please enter English title or content first');
                return;
            }

            const btn = document.getElementById(btnId);
            const origText = btn ? btn.textContent : '';
            if (btn) {
                btn.disabled = true;
                btn.textContent = from === 'zh' ? '正在翻译并自动保存...' : 'Translating & auto-saving...';
            }

            try {
                // 1. 翻译标题
                if (sourceTitle && targetTitleInput) {
                    const targetVal = targetTitleInput.value.trim();
                    const shouldTranslateTitle = !targetVal || targetVal === sourceTitle || (to === 'en' && /[\u4e00-\u9fa5]/.test(targetVal));
                    if (shouldTranslateTitle) {
                        try {
                            const resTitle = await adminFetch('/api/translate', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ text: sourceTitle, from: from, to: to })
                            });
                            if (resTitle.ok) {
                                const titleData = await resTitle.json();
                                if (titleData && titleData.translatedText) {
                                    targetTitleInput.value = titleData.translatedText;
                                }
                            }
                        } catch (e) {
                            console.error('Title translation error in handleTranslateAI:', e);
                        }
                    }
                }

                // 2. 翻译正文
                if (sourceContent && sourceContent.trim()) {
                    const res = await adminFetch('/api/translate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            text: sourceContent,
                            from: from,
                            to: to
                        })
                    });

                    if (!res.ok) {
                        const err = await res.json().catch(() => ({}));
                        throw new Error(err.error || ('HTTP ' + res.status));
                    }

                    const data = await res.json();
                    if (!data.translatedText) {
                        throw new Error('未收到有效正文翻译');
                    }

                    document.getElementById(targetElId).value = data.translatedText;
                }

                // 3. 自动勾选双语标记
                const chk = document.getElementById('item-is-bilingual');
                if (chk) chk.checked = true;

                // 4. 切换 Tab 以供查看
                switchAdminEditorTab(to);

                // 5. 核心要求：翻译后文章自动保存并加载入系统
                const id = document.getElementById('item-id').value;
                const curTitleZh = document.getElementById('item-title').value.trim() || '未命名文章';
                const curTitleEn = document.getElementById('item-title-en').value.trim() || curTitleZh;
                const curCustomDate = document.getElementById('item-date').value.trim() || new Date().toISOString().slice(0,7).replace('-', '.');
                const curTag = document.getElementById('item-tag').value.trim() || 'AI';
                const curViewsRaw = document.getElementById('item-views').value.trim();
                const curCustomViews = parseInt(curViewsRaw, 10);
                const curLikesRaw = document.getElementById('item-likes').value.trim();
                const curCustomLikes = parseInt(curLikesRaw, 10);
                const curContentZh = document.getElementById('item-content').value;
                const curContentEn = document.getElementById('item-content-en').value;

                const existing = articles.find(x => x.id === id) || {};
                const autoPayload = {
                    id: id,
                    title_zh: curTitleZh,
                    title_en: curTitleEn,
                    content_zh: curContentZh,
                    content_en: curContentEn,
                    isBilingual: true,
                    title: { zh: curTitleZh, en: curTitleEn },
                    content: { zh: curContentZh, en: curContentEn },
                    tag: curTag,
                    date: curCustomDate,
                    readTime: existing.readTime || '5 min read',
                    views: isNaN(curCustomViews) ? (typeof existing.views === 'number' ? existing.views : 1000) : curCustomViews,
                    likes: isNaN(curCustomLikes) ? (typeof existing.likes === 'number' ? existing.likes : 0) : curCustomLikes,
                    summary: { zh: curTitleZh, en: curTitleEn }
                };

                const saveRes = await adminFetch('/api/articles', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(autoPayload)
                });

                if (saveRes.ok) {
                    try { localStorage.removeItem('article_editor_draft'); } catch(e) {}
                    await refreshAdminArticles();
                    alert('✓ AI 翻译成功！文章（含标题与正文）已自动保存并重新加载到列表中。');
                } else {
                    alert('AI 翻译完成，但自动保存失败，请检查后手动点击【保存发布】。');
                }

            } catch (error) {
                alert('翻译失败：' + error.message);
            } finally {
                if (btn) {
                    btn.disabled = false;
                    btn.textContent = origText;
                }
            }
        }

        function openCreateModal() {
            resetInactivityTimer();
            document.getElementById('modal-title').innerText = '新建文章';
            document.getElementById('item-id').value = 'post-' + Date.now();
            switchAdminEditorTab('zh');
            
            document.getElementById('item-title').value = '';
            document.getElementById('item-title-en').value = '';
            document.getElementById('item-date').value = new Date().toISOString().slice(0,7).replace('-', '.');
            document.getElementById('item-tag').value = 'AI Architecture';
            document.getElementById('item-views').value = '1000';
            document.getElementById('item-likes').value = '0';
            document.getElementById('item-content').value = '<p>在这里撰写正文内容...</p>';
            document.getElementById('item-content-en').value = '';
            document.getElementById('item-is-bilingual').checked = false;

            document.getElementById('modal').style.display = 'flex';
        }

        function openEditModal(id) {
            resetInactivityTimer();
            const a = articles.find(x => x.id === id);
            if (!a) return;
            document.getElementById('modal-title').innerText = '编辑文章';
            document.getElementById('item-id').value = a.id;
            
            const titleZh = a.title_zh || (a.title && a.title.zh) || (typeof a.title === 'string' ? a.title : '');
            let titleEn = a.title_en || (a.title && a.title.en) || '';
            if (titleEn === titleZh || /[\u4e00-\u9fa5]/.test(titleEn)) {
                titleEn = '';
            }
            const contentZh = a.content_zh || (a.content && a.content.zh) || (typeof a.content === 'string' ? a.content : '');
            let contentEn = a.content_en || (a.content && a.content.en) || '';
            if (contentEn === contentZh) {
                contentEn = '';
            }
            const isBilingual = a.isBilingual !== undefined ? !!a.isBilingual : !!(contentEn && contentEn.trim());

            document.getElementById('item-title').value = titleZh;
            document.getElementById('item-title-en').value = titleEn;
            document.getElementById('item-date').value = a.date || '';
            document.getElementById('item-tag').value = a.tag || '';
            document.getElementById('item-views').value = typeof a.views === 'number' ? a.views : (parseInt(a.views) || 0);
            document.getElementById('item-likes').value = typeof a.likes === 'number' ? a.likes : (parseInt(a.likes) || 0);
            document.getElementById('item-content').value = contentZh;
            document.getElementById('item-content-en').value = contentEn;
            document.getElementById('item-is-bilingual').checked = isBilingual;

            switchAdminEditorTab('zh');
            document.getElementById('modal').style.display = 'flex';
        }

        function closeModal() {
            document.getElementById('modal').style.display = 'none';
        }

        function openPasswordModal() {
            resetInactivityTimer();
            document.getElementById('password-modal').style.display = 'flex';
        }

        function closePasswordModal() {
            document.getElementById('password-modal').style.display = 'none';
        }

        async function handleSave(e) {
            e.preventDefault();
            resetInactivityTimer();
            const id = document.getElementById('item-id').value;
            const titleZh = document.getElementById('item-title').value.trim();
            const titleEn = document.getElementById('item-title-en').value.trim();
            const customDate = document.getElementById('item-date').value.trim();
            const tag = document.getElementById('item-tag').value.trim();
            const customViewsRaw = document.getElementById('item-views').value.trim();
            const customViews = parseInt(customViewsRaw, 10);
            const customLikesRaw = document.getElementById('item-likes').value.trim();
            const customLikes = parseInt(customLikesRaw, 10);
            const contentZh = document.getElementById('item-content').value;
            const contentEn = document.getElementById('item-content-en').value;
            const isBilingual = document.getElementById('item-is-bilingual').checked;

            if (!titleZh) { alert('请输入文章中文标题'); return; }

            const existing = articles.find(x => x.id === id) || {};
            const payload = {
                id: id,
                // 编辑表单里没有隐藏开关，但必须原样带回，否则保存会把隐藏文章重新公开
                hidden: existing.hidden === true,
                title_zh: titleZh,
                title_en: titleEn,
                content_zh: contentZh,
                content_en: contentEn,
                isBilingual: isBilingual,
                title: { zh: titleZh, en: titleEn || titleZh },
                content: { zh: contentZh, en: contentEn || contentZh },
                tag: tag || 'AI',
                date: customDate || new Date().toISOString().slice(0,7).replace('-', '.'),
                readTime: existing.readTime || '5 min read',
                views: isNaN(customViews) ? (typeof existing.views === 'number' ? existing.views : 1000) : customViews,
                likes: isNaN(customLikes) ? (typeof existing.likes === 'number' ? existing.likes : 0) : customLikes,
                summary: { zh: titleZh, en: titleEn || titleZh }
            };

            try {
                const res = await adminFetch('/api/articles', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (res.ok) {
                    try { localStorage.removeItem('article_editor_draft'); } catch(e) {}
                    closeModal();
                    alert('✓ 文章保存并发布成功！');
                    await refreshAdminArticles();
                } else {
                    const err = await res.json().catch(() => ({}));
                    alert(describeAdminError(err, currentCmsLang === 'en' ? 'Save failed' : '保存发布失败'));
                }
            } catch(ex) {
                console.error(ex);
            }
        }

        async function deleteArticle(id) {
            resetInactivityTimer();
            if (!confirm('确定要彻底删除该文章吗？此操作不可撤销。')) return;
            try {
                const res = await adminFetch('/api/articles?id=' + encodeURIComponent(id), { method: 'DELETE' });
                if (res.ok) {
                    articles = articles.filter(x => x.id !== id);
                    renderAdminList();
                    alert('✓ 文章已彻底删除');
                } else {
                    alert('删除失败');
                }
            } catch(e) {
                console.error(e);
            }
        }

        async function toggleArticleHidden(id, currentlyHidden) {
            resetInactivityTimer();
            const isHidden = currentlyHidden === '1' || currentlyHidden === 1 || currentlyHidden === true;
            const nextHidden = !isHidden;
            const t = cmsI18n[currentCmsLang] || cmsI18n.zh;

            if (!confirm(nextHidden ? t.hideConfirm : t.showConfirm)) return;

            try {
                const res = await adminFetch('/api/articles/hide?id=' + encodeURIComponent(id), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ hidden: nextHidden })
                });
                if (res.ok) {
                    // 与文章保存一致：重新拉取列表而不是本地打补丁，避免前后端状态漂移
                    await refreshAdminArticles();
                    alert(nextHidden ? t.hideDone : t.showDone);
                } else {
                    let err = null;
                    try { err = await res.json(); } catch(e) {}
                    alert(describeAdminError(err));
                }
            } catch(e) {
                console.error(e);
            }
        }

        async function handleLogout() {
            if (inactivityTimer) clearTimeout(inactivityTimer);

            try {
                // 由服务端下发清除 cookie 的响应头；前端无法也不该直接改会话 cookie
                await fetch('/api/logout', { method: 'POST', credentials: 'include' });
            } catch(e) {
                console.error("Logout error:", e);
            }

            try { localStorage.removeItem('tianai_token'); } catch(e) {}
            try { sessionStorage.removeItem('tianai_token'); } catch(e) {}
            window.location.replace('/admin');
        }

        let localExperiences = [];

        function renderExperienceEditorCards() {
            const container = document.getElementById('experiences-editor-container');
            if (!container) return;
            if (localExperiences.length === 0) {
                container.innerHTML = '<div style="text-align:center; padding:24px; color:var(--text-muted); background:var(--bg-page); border:1px dashed var(--border); border-radius:6px; font-size:0.9rem;">暂无工作经历，请点击「➕ 添加新工作经历」按钮添加。</div>';
                return;
            }
            container.innerHTML = localExperiences.map(function(exp, idx) {
                const compName = exp.company || ('经历 #' + (idx + 1));
                const canMoveUp = idx > 0;
                const canMoveDown = idx < localExperiences.length - 1;
                return '<div class="exp-editor-card" data-idx="' + idx + '">' +
                    '<div class="exp-editor-card-header">' +
                        '<div class="exp-editor-title">' +
                            '<span>💼</span>' +
                            '<span id="exp-title-preview-' + idx + '" style="font-weight:600;">' + escapeHtml(compName) + '</span>' +
                            '<span style="font-size:0.8rem; color:var(--text-light); font-weight:normal;">(#' + (idx + 1) + ')</span>' +
                        '</div>' +
                        '<div class="exp-editor-actions">' +
                            '<button type="button" class="btn btn-outline btn-sm" onclick="moveExperienceCard(' + idx + ', -1)" ' + (canMoveUp ? '' : 'disabled') + ' title="上移">⬆️ 上移</button>' +
                            '<button type="button" class="btn btn-outline btn-sm" onclick="moveExperienceCard(' + idx + ', 1)" ' + (canMoveDown ? '' : 'disabled') + ' title="下移">⬇️ 下移</button>' +
                            '<button type="button" class="btn btn-danger btn-sm" onclick="deleteExperienceCard(' + idx + ')" title="删除此经历" style="margin-left:4px;">🗑️ 删除</button>' +
                        '</div>' +
                    '</div>' +
                    '<div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:12px; margin-bottom:12px;">' +
                        '<div>' +
                            '<label class="form-label" style="font-weight:600;">公司名称 (Company) <span style="color:red;">*</span></label>' +
                            '<input type="text" class="form-input exp-input-company" value="' + escapeHtml(exp.company || '') + '" placeholder="例如: Hightouch" oninput="updateExpTitlePreview(' + idx + ', this.value)" required>' +
                        '</div>' +
                        '<div>' +
                            '<label class="form-label" style="font-weight:600;">职位头衔 (Role)</label>' +
                            '<input type="text" class="form-input exp-input-role" value="' + escapeHtml(exp.role || '') + '" placeholder="例如: AI 项目负责人">' +
                        '</div>' +
                        '<div>' +
                            '<label class="form-label" style="font-weight:600;">在职时间 (Period)</label>' +
                            '<input type="text" class="form-input exp-input-period" value="' + escapeHtml(exp.period || '') + '" placeholder="例如: 2024 — Present">' +
                        '</div>' +
                    '</div>' +
                    '<div style="margin-bottom:12px;">' +
                        '<label class="form-label" style="font-weight:600;">详细职责与成果 (中文) <span style="color:red;">*</span></label>' +
                        '<textarea class="form-textarea exp-input-details" rows="5" placeholder="支持 Markdown 列表 (- 项目) 和加粗 (**加粗文本**)">' + escapeHtml(exp.details || '') + '</textarea>' +
                    '</div>' +
                    '<div>' +
                        '<label class="form-label">Work Experience Details (英文，选填)</label>' +
                        '<textarea class="form-textarea exp-input-details-en" rows="3" placeholder="English details (Optional)">' + escapeHtml(exp.detailsEn || '') + '</textarea>' +
                    '</div>' +
                '</div>';
            }).join('');
        }

        function updateExpTitlePreview(idx, val) {
            const el = document.getElementById('exp-title-preview-' + idx);
            if (el) el.innerText = val.trim() || ('经历 #' + (idx + 1));
        }

        function syncExperiencesFromDom() {
            const container = document.getElementById('experiences-editor-container');
            if (!container) return;
            const cards = container.querySelectorAll('.exp-editor-card');
            const updated = [];
            cards.forEach((card, i) => {
                const orig = localExperiences[i] || {};
                const compInput = card.querySelector('.exp-input-company');
                const roleInput = card.querySelector('.exp-input-role');
                const periodInput = card.querySelector('.exp-input-period');
                const detailsInput = card.querySelector('.exp-input-details');
                const detailsEnInput = card.querySelector('.exp-input-details-en');
                updated.push({
                    id: orig.id || ('exp-' + Date.now() + '-' + i),
                    company: compInput ? compInput.value.trim() : '',
                    role: roleInput ? roleInput.value.trim() : '',
                    roleEn: orig.roleEn || '',
                    period: periodInput ? periodInput.value.trim() : '',
                    details: detailsInput ? detailsInput.value.trim() : '',
                    detailsEn: detailsEnInput ? detailsEnInput.value.trim() : ''
                });
            });
            localExperiences = updated;
        }

        function addExperienceCard() {
            syncExperiencesFromDom();
            localExperiences.unshift({
                id: 'exp-' + Date.now(),
                company: '',
                role: '',
                roleEn: '',
                period: '',
                details: '',
                detailsEn: ''
            });
            renderExperienceEditorCards();
            setTimeout(() => {
                const firstInput = document.querySelector('.exp-input-company');
                if (firstInput) {
                    firstInput.focus();
                    firstInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 50);
        }

        function deleteExperienceCard(idx) {
            syncExperiencesFromDom();
            const compName = (localExperiences[idx] && localExperiences[idx].company) || ('经历 #' + (idx + 1));
            if (!confirm('确定要删除【' + compName + '】这条工作经历吗？')) {
                return;
            }
            localExperiences.splice(idx, 1);
            renderExperienceEditorCards();
        }

        function moveExperienceCard(idx, delta) {
            syncExperiencesFromDom();
            const targetIdx = idx + delta;
            if (targetIdx < 0 || targetIdx >= localExperiences.length) return;
            const temp = localExperiences[idx];
            localExperiences[idx] = localExperiences[targetIdx];
            localExperiences[targetIdx] = temp;
            renderExperienceEditorCards();
        }

        function populateProfileForm() {
            const p = currentProfile || {};
            document.getElementById('prof-nameZh').value = p.nameZh || '';
            document.getElementById('prof-nameEn').value = p.nameEn || '';
            document.getElementById('prof-posZh').value = p.positionZh || '';
            document.getElementById('prof-posEn').value = p.positionEn || '';
            document.getElementById('prof-email').value = p.email || '';
            document.getElementById('prof-introZh').value = p.introZh || '';
            document.getElementById('prof-introEn').value = p.introEn || '';
            document.getElementById('prof-focusZh').value = p.focusZh || '';
            document.getElementById('prof-focusEn').value = p.focusEn || '';
            document.getElementById('prof-techZh').value = p.techZh || '';
            document.getElementById('prof-techEn').value = p.techEn || '';
            document.getElementById('prof-eduZh').value = p.eduZh || '';
            document.getElementById('prof-eduEn').value = p.eduEn || '';
            document.getElementById('prof-langZh').value = p.langZh || '';
            document.getElementById('prof-langEn').value = p.langEn || '';
            document.getElementById('prof-clientsZh').value = p.clientsZh || '';
            document.getElementById('prof-clientsEn').value = p.clientsEn || '';
            localExperiences = (p.experiences && Array.isArray(p.experiences))
                ? JSON.parse(JSON.stringify(p.experiences))
                : [];
            renderExperienceEditorCards();
            
            const qrImg = document.getElementById('preview-reward-qr');
            if (p.rewardQrCode) {
                qrImg.src = p.rewardQrCode;
            } else {
                qrImg.src = "data:image/jpeg;base64," + CONFIG.rewardQrBase64;
            }
        }

        function compressImage(file, maxWidth, quality) {
            maxWidth = maxWidth || 1920;
            quality = quality || 0.85;
            return new Promise(function(resolve) {
                if (!file || !file.type || !file.type.match(/image.*/)) {
                    resolve(null);
                    return;
                }
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = new Image();
                    img.onload = function() {
                        let w = img.width;
                        let h = img.height;
                        if (w > maxWidth) {
                            h = Math.round((h * maxWidth) / w);
                            w = maxWidth;
                        }
                        const canvas = document.createElement('canvas');
                        canvas.width = w;
                        canvas.height = h;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, w, h);
                        const outType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
                        const compressedData = canvas.toDataURL(outType, quality);
                        resolve(compressedData);
                    };
                    img.onerror = function() {
                        resolve(e.target.result);
                    };
                    img.src = e.target.result;
                };
                reader.onerror = function() {
                    resolve(null);
                };
                reader.readAsDataURL(file);
            });
        }

        function parseMarkdownToHtml(md) {
            if (!md) return { frontmatter: {}, html: '' };
            const rawLines = md.replace(/\\r/g, '').split('\\n');
            let frontmatter = {};
            let startIndex = 0;
            if (rawLines[0] && rawLines[0].trim() === '---') {
                for (let i = 1; i < rawLines.length; i++) {
                    if (rawLines[i].trim() === '---') {
                        startIndex = i + 1;
                        break;
                    }
                    const colonIdx = rawLines[i].indexOf(':');
                    if (colonIdx > 0) {
                        const k = rawLines[i].substring(0, colonIdx).trim().toLowerCase();
                        const v = rawLines[i].substring(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
                        frontmatter[k] = v;
                    }
                }
            }
            const contentLines = rawLines.slice(startIndex);
            let inCode = false;
            let codeLang = '';
            let codeContent = [];
            let inList = false;
            let out = [];

            for (let line of contentLines) {
                if (line.trim().startsWith(String.fromCharCode(96, 96, 96))) {
                    if (!inCode) {
                        inCode = true;
                        codeLang = line.trim().slice(3).trim();
                        codeContent = [];
                    } else {
                        inCode = false;
                        out.push('<pre style="background:var(--bg-subtle); padding:1rem; border-radius:6px; overflow-x:auto; font-family:var(--font-mono); font-size:0.88rem; border:1px solid var(--border); margin:1.5rem 0;"><code class="language-' + (codeLang || 'text') + '">' + escapeHtml(codeContent.join('\\n')) + '</code></pre>');
                    }
                    continue;
                }
                if (inCode) {
                    codeContent.push(line);
                    continue;
                }
                let l = line.trim();
                if (!l) {
                    if (inList) { out.push('</ul>'); inList = false; }
                    continue;
                }
                if (l.startsWith('# ')) {
                    out.push('<h2 style="font-family:var(--font-serif); margin-top:2rem; margin-bottom:0.8rem;">' + escapeHtml(l.slice(2)) + '</h2>');
                } else if (l.startsWith('## ')) {
                    out.push('<h2 style="font-family:var(--font-serif); margin-top:2rem; margin-bottom:0.8rem;">' + escapeHtml(l.slice(3)) + '</h2>');
                } else if (l.startsWith('### ')) {
                    out.push('<h3 style="font-family:var(--font-serif); margin-top:1.8rem; margin-bottom:0.6rem;">' + escapeHtml(l.slice(4)) + '</h3>');
                } else if (l.startsWith('#### ')) {
                    out.push('<h4 style="font-family:var(--font-serif); margin-top:1.5rem; margin-bottom:0.5rem;">' + escapeHtml(l.slice(5)) + '</h4>');
                } else if (l.startsWith('> ')) {
                    out.push('<blockquote style="border-left:3px solid var(--accent); margin:1.2rem 0; padding:0.6rem 1.2rem; color:var(--fg-subtle); background:var(--bg-subtle); font-style:italic;">' + escapeHtml(l.slice(2)) + '</blockquote>');
                } else if (l.startsWith('- ') || l.startsWith('* ')) {
                    if (!inList) { out.push('<ul style="margin:1rem 0 1rem 1.5rem; line-height:1.8;">'); inList = true; }
                    out.push('<li>' + escapeHtml(l.slice(2)) + '</li>');
                } else {
                    if (inList) { out.push('</ul>'); inList = false; }
                    out.push('<p style="margin-bottom:1.2rem; line-height:1.8;">' + escapeHtml(l) + '</p>');
                }
            }
            if (inList) out.push('</ul>');
            return { frontmatter: frontmatter, html: out.join('\\n') };
        }

        function handleArticleMdImport(event) {
            const file = event.target.files && event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(e) {
                const text = e.target.result;
                const result = parseMarkdownToHtml(text);
                const fm = result.frontmatter;
                
                // 1. Title
                let title = fm.title;
                if (!title) {
                    const titleMatch = text.match(/^#\\s+(.+)$/m);
                    if (titleMatch) title = titleMatch[1].trim();
                    else title = file.name.replace(/\\.(md|markdown|txt)$/i, '');
                }
                if (title) document.getElementById('item-title').value = title;
                
                // 2. Date
                if (fm.date) {
                    document.getElementById('item-date').value = fm.date;
                }
                
                // 3. Tag
                if (fm.tag || fm.tags || fm.categories) {
                    document.getElementById('item-tag').value = fm.tag || fm.tags || fm.categories;
                }
                
                // 4. Views
                if (fm.views) {
                    document.getElementById('item-views').value = fm.views;
                }

                // 4.5 Likes
                if (fm.likes) {
                    document.getElementById('item-likes').value = fm.likes;
                }

                // 5. Content
                document.getElementById('item-content').value = result.html;
                alert('🎉 外部文章【' + (title || file.name) + '】导入成功！已自动转换为标准排版格式。');
                event.target.value = '';
            };
            reader.readAsText(file);
        }

        function convertContentMarkdownToHtml() {
            const val = document.getElementById('item-content').value;
            if (!val || !val.trim()) {
                alert('正文输入框中没有内容');
                return;
            }
            const res = parseMarkdownToHtml(val);
            document.getElementById('item-content').value = res.html;
            alert('✅ 已将 Markdown 语法一键转换为标准 HTML 格式！');
        }

        async function handleRewardQrUpload(event) {
            const file = event.target.files && event.target.files[0];
            if (!file) return;
            const statusEl = document.getElementById('qr-upload-status');
            statusEl.innerText = '正在智能压缩并上传收款码...';
            
            const base64Data = await compressImage(file, 800, 0.90);
            if (!base64Data) {
                statusEl.innerText = '⚠️ 图片格式不支持';
                return;
            }

            try {
                const res = await adminFetch('/api/upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image: base64Data, filename: file.name })
                });
                const data = await res.json();
                if (data.success && data.url) {
                    currentProfile.rewardQrCode = data.url;
                    document.getElementById('preview-reward-qr').src = data.url;
                    statusEl.innerText = '✅ 收款码已上传并优化，请点击下方【保存简历与收款码】';
                } else {
                    currentProfile.rewardQrCode = base64Data;
                    document.getElementById('preview-reward-qr').src = base64Data;
                    statusEl.innerText = '✅ 收款码已暂存，请点击下方【保存简历与收款码】';
                }
            } catch (err) {
                currentProfile.rewardQrCode = base64Data;
                document.getElementById('preview-reward-qr').src = base64Data;
                statusEl.innerText = '✅ 收款码已暂存，请点击下方【保存简历与收款码】';
            }
        }

        function resetRewardQrToDefault() {
            currentProfile.rewardQrCode = "";
            document.getElementById('preview-reward-qr').src = "data:image/jpeg;base64," + CONFIG.rewardQrBase64;
            document.getElementById('qr-upload-status').innerText = '已恢复为默认收款码，请点击下方保存';
        }

        async function handleSaveProfile(event) {
            if (event) event.preventDefault();
            const btn = document.getElementById('btn-save-profile');
            btn.disabled = true;
            btn.innerText = '正在保存...';

            const payload = Object.assign({}, currentProfile, {
                nameZh: document.getElementById('prof-nameZh').value.trim(),
                nameEn: document.getElementById('prof-nameEn').value.trim(),
                positionZh: document.getElementById('prof-posZh').value.trim(),
                positionEn: document.getElementById('prof-posEn').value.trim(),
                email: document.getElementById('prof-email').value.trim(),
                introZh: document.getElementById('prof-introZh').value.trim(),
                introEn: document.getElementById('prof-introEn').value.trim(),
                focusZh: document.getElementById('prof-focusZh').value.trim(),
                focusEn: document.getElementById('prof-focusEn').value.trim(),
                techZh: document.getElementById('prof-techZh').value.trim(),
                techEn: document.getElementById('prof-techEn').value.trim(),
                eduZh: document.getElementById('prof-eduZh').value.trim(),
                eduEn: document.getElementById('prof-eduEn').value.trim(),
                langZh: document.getElementById('prof-langZh').value.trim(),
                langEn: document.getElementById('prof-langEn').value.trim(),
                experiences: (function() {
                    syncExperiencesFromDom();
                    return localExperiences.filter(e => e.company || e.role || e.details);
                })(),
                clientsZh: document.getElementById('prof-clientsZh').value.trim(),
                clientsEn: document.getElementById('prof-clientsEn').value.trim(),
                rewardQrCode: currentProfile.rewardQrCode || ""
            });

            // Backward compatibility for legacy readers
            if (payload.experiences && payload.experiences.length > 0) {
                payload.expHightouchZh = payload.experiences[0].details || '';
                payload.expHightouchEn = payload.experiences[0].detailsEn || '';
            }
            if (payload.experiences && payload.experiences.length > 1) {
                payload.expEbayZh = payload.experiences[1].details || '';
                payload.expEbayEn = payload.experiences[1].detailsEn || '';
            }
            if (payload.experiences && payload.experiences.length > 2) {
                payload.expKuaishouZh = payload.experiences[2].details || '';
                payload.expKuaishouEn = payload.experiences[2].detailsEn || '';
            }

            try {
                const res = await adminFetch('/api/profile', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (res.ok) {
                    currentProfile = payload;
                    alert('🎉 简历履历与打赏收款码保存成功！已实时生效。');
                } else {
                    alert('保存失败，请检查网络或登录状态');
                }
            } catch (err) {
                alert('网络请求出错：' + err.message);
            } finally {
                btn.disabled = false;
                btn.innerText = '💾 保存简历与收款码';
            }
        }

        function insertTextToContentArea(text) {
            const textarea = document.getElementById('item-content');
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const val = textarea.value;
            textarea.value = val.substring(0, start) + text + val.substring(end);
            textarea.focus();
            textarea.selectionStart = textarea.selectionEnd = start + text.length;
        }

        async function handleArticleImageUpload(event) {
            const file = event.target.files && event.target.files[0];
            if (!file) return;
            const base64Data = await compressImage(file, 1920, 0.85);
            if (!base64Data) return;
            
            try {
                const res = await adminFetch('/api/upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image: base64Data, filename: file.name })
                });
                const data = await res.json();
                let url = data.url;
                if (!url) url = base64Data;
                const imgSnippet = '\\n<figure style="margin:1.5rem 0; text-align:center;">\\n  <img src="' + url + '" alt="' + escapeHtml(file.name) + '" style="max-width:100%; border-radius:4px; border:1px solid var(--border);" />\\n  <figcaption style="font-size:0.82rem; color:var(--fg-subtle); margin-top:0.5rem; font-style:italic;">' + escapeHtml(file.name) + '</figcaption>\\n</figure>\\n';
                insertTextToContentArea(imgSnippet);
            } catch (err) {
                const imgSnippet = '\\n<figure style="margin:1.5rem 0; text-align:center;">\\n  <img src="' + base64Data + '" alt="插图" style="max-width:100%; border-radius:4px; border:1px solid var(--border);" />\\n  <figcaption style="font-size:0.82rem; color:var(--fg-subtle); margin-top:0.5rem; font-style:italic;">插图说明</figcaption>\\n</figure>\\n';
                insertTextToContentArea(imgSnippet);
            }
            event.target.value = '';
        }

        function insertArticleExternalImg() {
            const url = prompt('请输入图片网络外链地址 (例如 https://...):');
            if (url && url.trim()) {
                const caption = prompt('请输入图片说明文字 (可选):') || '图片插图';
                const imgSnippet = '\\n<figure style="margin:1.5rem 0; text-align:center;">\\n  <img src="' + url.trim() + '" alt="' + escapeHtml(caption) + '" style="max-width:100%; border-radius:4px; border:1px solid var(--border);" />\\n  <figcaption style="font-size:0.82rem; color:var(--fg-subtle); margin-top:0.5rem; font-style:italic;">' + escapeHtml(caption) + '</figcaption>\\n</figure>\\n';
                insertTextToContentArea(imgSnippet);
            }
        }

        ['item-title', 'item-date', 'item-tag', 'item-views', 'item-likes', 'item-content'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', autoSaveArticleDraft);
        });

                if (sessionStorage.getItem('open_create') === '1') {
            sessionStorage.removeItem('open_create');
            setTimeout(openCreateModal, 200);
        }

        applySortToLocalList();
        populateSortControls();
        renderAdminList();
        renderAdminCommentsList();
        populateProfileForm();
        updateCounts();

        let savedCmsLang = 'zh';
        try {
            savedCmsLang = localStorage.getItem('preferredLang') || (document.cookie.match(/preferredLang=([^;]+)/) ? RegExp.$1 : 'zh');
        } catch(e) {}
        if (savedCmsLang !== 'zh' && savedCmsLang !== 'en') savedCmsLang = 'zh';
        applyCmsLang(savedCmsLang);
    </script>
</body>
</html>`;
}
export { renderAdminCmsHtml };