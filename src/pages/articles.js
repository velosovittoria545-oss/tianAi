import { COMMON_CSS } from "./common.js";
import { recordArticleView } from "../store.js";

import { escapeHtml } from "../util.js";

// GET /articles
function renderArticlesPageHtml(articlesJson, rewardQrSrc) {
  // 管理员若上传过自定义赞赏码就用它，否则用内置那张（走独立图片路由，不再内联 base64）
  const activeRewardQr = rewardQrSrc || "/assets/reward-qr";
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>文章列表 — 维托里奥 崔</title>
    <style>
        ${COMMON_CSS}
        .top-nav-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
        }
        .back-btn {
            font-size: 0.92rem;
            color: var(--accent);
            text-decoration: underline;
            cursor: pointer;
            font-weight: 500;
        }
        .page-header { margin-bottom: 28px; }
        .page-title {
            font-family: var(--font-serif);
            font-size: 2.1rem;
            font-weight: 500;
            margin-bottom: 6px;
            color: var(--text-main);
        }
        .page-subtitle {
            color: var(--text-muted);
            font-size: 0.94rem;
        }
        .article-row {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            padding: 12px 0;
            border-bottom: 1px dashed var(--border);
            cursor: pointer;
            gap: 16px;
        }
        .article-row:last-child { border-bottom: none; }
        .article-title-text {
            font-family: var(--font-serif);
            font-size: 1.15rem;
            font-weight: 500;
            color: var(--text-main);
            text-decoration: none;
            transition: color 0.15s;
        }
        .article-row:hover .article-title-text {
            color: var(--accent);
            text-decoration: underline;
        }
        .article-date-badge {
            font-family: var(--font-mono);
            font-size: 0.82rem;
            color: var(--text-light);
            white-space: nowrap;
        }
        #reader-view {
            display: none;
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 6px;
            padding: 24px 28px;
            margin-bottom: 24px;
            box-shadow: 0 4px 14px rgba(0,0,0,0.03);
        }
        .article-lang-switch {
            display: flex;
            gap: 8px;
            margin: 12px 0 16px 0;
        }
        .lang-btn {
            padding: 4px 14px;
            background: transparent;
            border: 1px solid var(--accent);
            border-radius: 999px;
            cursor: pointer;
            font-size: 0.84rem;
            color: var(--text-main);
            transition: all 0.2s;
            font-weight: 500;
        }
        .lang-btn.active {
            background: var(--accent);
            color: #ffffff;
        }
        .lang-btn:hover:not(.active) {
            background: rgba(204, 120, 92, 0.1);
        }
        .reader-close-btn {
            display: inline-block;
            font-size: 0.84rem;
            color: var(--accent);
            cursor: pointer;
            text-decoration: underline;
            margin-bottom: 16px;
        }
        .reader-article-title {
            font-family: var(--font-serif);
            font-size: 1.75rem;
            font-weight: 500;
            line-height: 1.35;
            margin-bottom: 8px;
            color: var(--text-main);
        }
        .reader-meta-bar {
            font-family: var(--font-mono);
            font-size: 0.8rem;
            color: var(--text-light);
            padding-bottom: 12px;
            margin-bottom: 18px;
            border-bottom: 1px solid var(--border);
        }
        .reader-content-body {
            font-size: 0.95rem;
            line-height: 1.75;
            color: var(--text-main);
        }
        .reader-content-body p { margin-bottom: 16px; }
        .reader-content-body h3 {
            font-family: var(--font-serif);
            font-size: 1.25rem;
            margin: 20px 0 10px 0;
            color: var(--text-main);
        }
        .reader-content-body blockquote {
            border-left: 3px solid var(--accent);
            padding: 8px 12px;
            font-style: italic;
            color: var(--text-muted);
            margin: 16px 0;
            background: var(--bg-subtle);
            border-radius: 0 4px 4px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="top-nav-bar">
            <a href="/" class="back-btn" id="art-back-btn">← 返回主页</a>
            <div style="display: flex; gap: 14px; align-items: center;">
                <a href="/guestbook" id="art-nav-guestbook" style="font-size: 0.88rem; color: var(--accent); text-decoration: underline;">留言板</a>
                <a href="/admin" id="art-nav-admin" class="admin-link">[管理员登录]</a>
                <button type="button" class="lang-switch-btn" onclick="toggleGlobalLang()" id="btn-lang-toggle">English</button>
            </div>
        </div>

        <header class="page-header">
            <h1 class="page-title" id="art-page-title">文章</h1>
            <p class="page-subtitle" id="art-page-subtitle">维托里奥 崔的技术随笔、架构实践与前沿思考</p>
        </header>

        <!-- 单篇阅读器 -->
        <div id="reader-view">
            <span class="reader-close-btn" id="art-close-reader-btn" onclick="closeReader()">← 返回文章列表</span>
            <h1 class="reader-article-title" id="reader-title"></h1>
            <div id="article-lang-switcher" class="article-lang-switch" style="display:none;">
                <button type="button" id="lang-btn-zh" class="lang-btn active" onclick="switchArticleLang('zh')">中文</button>
                <button type="button" id="lang-btn-en" class="lang-btn" onclick="switchArticleLang('en')">English</button>
            </div>
            <div class="reader-meta-bar" id="reader-meta">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                    <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                        <span id="reader-meta-info"></span>
                        <span id="reader-meta-views" style="color:var(--accent); font-weight:500;"></span>
                    </div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <button type="button" onclick="toggleArticleLike()" id="btn-article-like" style="font-family:var(--font-sans); font-size:0.78rem; background:var(--bg-subtle); border:1px solid var(--border); color:var(--accent); padding:4px 12px; border-radius:4px; cursor:pointer; font-weight:500; display:flex; align-items:center; gap:4px; transition:all 0.15s;">
                            <span>👍</span> <span id="btn-article-like-text">点赞</span> (<span id="article-like-count">0</span>)
                        </button>
                        <button type="button" onclick="copyShareLink()" id="btn-share-link" style="font-family:var(--font-sans); font-size:0.78rem; background:var(--bg-subtle); border:1px solid var(--border); color:var(--accent); padding:4px 12px; border-radius:4px; cursor:pointer; font-weight:500; display:flex; align-items:center; gap:4px; transition:all 0.15s;">
                            <span>🔗</span> 生成分享链接
                        </button>
                        <span id="share-copied-toast" style="font-size:0.78rem; color:#28a745; font-weight:500; display:none;">✓ 已复制分享链接!</span>
                    </div>
                </div>
            </div>
            <div class="reader-content-body" id="reader-content"></div>

            <!-- 读者赞赏打赏区域 -->
            <div id="reward-section" style="margin-top: 36px; padding: 22px 20px; background: var(--bg-subtle); border: 1px dashed var(--border); border-radius: 6px; text-align: center;">
                <div id="reward-title-text" style="font-family: var(--font-serif); font-size: 1.15rem; font-weight: 500; color: var(--text-main); margin-bottom: 6px;">
                    ☕ 觉得有启发？欢迎打赏支持作者
                </div>
                <div id="reward-sub-text" style="font-size: 0.84rem; color: var(--text-light); margin-bottom: 16px;">
                    如果本文对您的架构设计或工程实践有所帮助，欢迎微信扫码赞赏，感谢您的支持与鼓励！
                </div>
                <div style="display: inline-block; padding: 12px; background: #ffffff; border: 1px solid var(--border); border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
                    <img src="${activeRewardQr}" alt="微信赞赏码 / Reward QR Code" style="width: 175px; height: 175px; display: block; object-fit: contain; border-radius: 4px;" />
                    <div id="reward-scan-text" style="font-family: var(--font-mono); font-size: 0.78rem; color: var(--text-muted); margin-top: 8px;">微信扫一扫 · 赞赏码</div>
                </div>
            </div>

            <!-- 读者留言板 -->
            <div id="comments-section" style="margin-top: 36px; padding-top: 24px; border-top: 1px dashed var(--border);">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 16px; border-bottom: 1px solid var(--border); padding-bottom: 10px;">
                    <h3 style="font-family: var(--font-serif); font-size: 1.25rem; font-weight: 500; color: var(--text-main); margin: 0;"><span id="comments-head-title">💬 读者留言</span> (<span id="comments-count">0</span>)</h3>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span id="art-sort-label" style="font-size: 0.78rem; color: var(--text-light);">排序：</span>
                        <button type="button" id="art-sort-desc-btn" class="sort-tab-btn active" onclick="switchArtSortOrder('desc')">▼ 最新优先</button>
                        <button type="button" id="art-sort-asc-btn" class="sort-tab-btn" onclick="switchArtSortOrder('asc')">▲ 最早优先</button>
                    </div>
                </div>

                <!-- 审核通过留言列表 -->
                <div id="comments-display-list" style="margin-bottom: 24px;"></div>

                <!-- 读者留言表单 -->
                <div style="background: var(--bg-subtle); border: 1px solid var(--border); border-radius: 6px; padding: 18px 20px;">
                    <div id="leave-comment-title" style="font-size: 0.9rem; font-weight: 500; margin-bottom: 12px; color: var(--text-main);">发表留言</div>
                    <form id="comment-form" onsubmit="handleCommentSubmit(event)">
                        <input type="hidden" id="comment-article-id" />
                        <input type="hidden" id="comment-article-title" />
                        <div style="margin-bottom: 10px; display: flex; gap: 8px; align-items: center;">
                            <label id="lbl-author-name" style="font-size: 0.82rem; color: var(--text-muted); white-space: nowrap;">您的称呼:</label>
                            <input type="text" id="comment-author" placeholder="例如: 某技术同行 (可自定义，默认匿名读者)" style="flex: 1; padding: 7px 10px; font-size: 0.85rem; border: 1px solid var(--border); border-radius: 4px; background: var(--bg-card); color: var(--text-main);" />
                        </div>
                        <div style="margin-bottom: 6px;">
                            <textarea id="comment-content" required rows="3" placeholder="写下您的技术探讨、阅读感受或问题交流...（中文字数 ≤ 140字，英文 ≤ 200词；留言需经管理员审核后公开展示）" style="width: 100%; box-sizing: border-box; padding: 8px 10px; font-size: 0.88rem; border: 1px solid var(--border); border-radius: 4px; background: var(--bg-card); color: var(--text-main); font-family: var(--font-sans); resize: vertical;"></textarea>
                        </div>
                        <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--text-light); margin-bottom:10px;">
                            <span id="char-limit-hint">字数限制：中文 ≤ 140字 / 英文 ≤ 200词</span>
                            <span id="comment-char-counter">已输入: 0 汉字, 0 单词</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                            <span id="comment-status-msg" style="font-size: 0.82rem;"></span>
                            <button type="submit" id="comment-btn-submit" style="background: var(--accent); color: white; border: none; border-radius: 4px; padding: 7px 18px; font-size: 0.85rem; font-weight: 500; cursor: pointer;">提交留言</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- 文章列表 -->
        <div id="articles-list-box"></div>

        <footer>
            <span id="art-footer-copy">© 2026 维托里奥 崔 · All Rights Reserved</span>
            <a href="/admin" id="art-footer-admin" class="admin-link">[管理员登录]</a>
        </footer>
    </div>

    <script>
        const ARTICLES = ${articlesJson};
        let currentArticleId = '';

        function escapeHtml(str) {
            if (!str) return '';
            return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        }

        function formatViews(v) {
            if (typeof v === 'number') return v.toLocaleString();
            if (typeof v === 'string') {
                const n = parseInt(v.replace(/[^0-9]/g, ''), 10);
                if (!isNaN(n)) return n.toLocaleString();
                return v;
            }
            return '0';
        }

        let currentGlobalLang = 'zh';

        const articlesI18n = {
            zh: {
                pageTitle: "文章",
                pageSubtitle: "维托里奥 崔的技术随笔、架构实践与前沿思考",
                backHome: "← 返回主页",
                navGuestbook: "留言板",
                navAdmin: "[管理员登录]",
                backToList: "← 返回文章列表",
                shareBtn: "<span>🔗</span> 生成分享链接",
                shareToast: "✓ 已复制分享链接!",
                rewardTitle: "☕ 觉得有启发？欢迎打赏支持作者",
                rewardSubtitle: "如果本文对您的架构设计或工程实践有所帮助，欢迎微信扫码赞赏，感谢您的支持与鼓励！",
                rewardWeChat: "微信扫一扫 · 赞赏码",
                commentsTitle: "💬 读者留言",
                sortLabel: "排序：",
                sortDesc: "▼ 最新优先",
                sortAsc: "▲ 最早优先",
                leaveComment: "发表留言",
                yourName: "您的称呼:",
                namePlaceholder: "例如: 某技术同行 (可自定义，默认匿名读者)",
                contentPlaceholder: "写下您的技术探讨、阅读感受或问题交流...（中文字数 ≤ 140字，英文 ≤ 200词；留言需经管理员审核后公开展示）",
                charLimit: "字数限制：中文 ≤ 140字 / 英文 ≤ 200词",
                submitComment: "提交留言",
                copyright: "© 2026 维托里奥 崔 · All Rights Reserved",
                viewsSuffix: " 次浏览",
                badgeBilingual: "🌐 双语",
                badgeZhOnly: "🔸 仅中文",
                likesSuffix: " 赞",
                likeText: "点赞",
                likedText: "已点赞",
                likeAlready: "您已经为这篇文章点过赞啦，感谢支持！",
                toggleText: "English"
            },
            en: {
                pageTitle: "Articles",
                pageSubtitle: "Technical essays, architecture practices & thoughts by Vittorio Cui",
                backHome: "← Back to Home",
                navGuestbook: "Guestbook",
                navAdmin: "[Admin Login]",
                backToList: "← Back to Articles",
                shareBtn: "<span>🔗</span> Share Link",
                shareToast: "✓ Link copied!",
                rewardTitle: "☕ Found this helpful? Support the author",
                rewardSubtitle: "If this article helped with your architecture or practices, feel free to support via WeChat Pay. Thank you!",
                rewardWeChat: "Scan with WeChat · Reward Code",
                commentsTitle: "💬 Reader Comments",
                sortLabel: "Sort:",
                sortDesc: "▼ Newest first",
                sortAsc: "▲ Oldest first",
                leaveComment: "Leave a Comment",
                yourName: "Your Name:",
                namePlaceholder: "e.g. Peer Engineer (Anonymous by default)",
                contentPlaceholder: "Write your thoughts, questions, or comments... (Chinese ≤ 140 chars, English ≤ 200 words; published upon review)",
                charLimit: "Length: Chinese ≤ 140 chars / English ≤ 200 words",
                submitComment: "Submit Comment",
                copyright: "© 2026 Vittorio Cui · All Rights Reserved",
                viewsSuffix: " views",
                badgeBilingual: "🌐 Bilingual",
                badgeZhOnly: "🔸 Chinese only",
                likesSuffix: " likes",
                likeText: "Like",
                likedText: "Liked",
                likeAlready: "You have already liked this article. Thank you for the support!",
                toggleText: "中文"
            }
        };

        function toggleGlobalLang() {
            setGlobalLang(currentGlobalLang === 'zh' ? 'en' : 'zh');
        }

        function setGlobalLang(lang) {
            currentGlobalLang = lang;
            try {
                localStorage.setItem('preferredLang', lang);
                localStorage.setItem('site_lang', lang);
            } catch(e) {}
            document.cookie = "preferredLang=" + lang + "; Path=/; Max-Age=31536000; SameSite=Lax";

            const t = articlesI18n[lang] || articlesI18n.zh;
            const toggleBtn = document.getElementById('btn-lang-toggle');
            if (toggleBtn) toggleBtn.innerText = t.toggleText;

            const backBtn = document.getElementById('art-back-btn');
            if (backBtn) backBtn.innerText = t.backHome;
            const navGb = document.getElementById('art-nav-guestbook');
            if (navGb) navGb.innerText = t.navGuestbook;
            const navAdmin = document.getElementById('art-nav-admin');
            if (navAdmin) navAdmin.innerText = t.navAdmin;
            const pageTitle = document.getElementById('art-page-title');
            if (pageTitle) pageTitle.innerText = t.pageTitle;
            const pageSub = document.getElementById('art-page-subtitle');
            if (pageSub) pageSub.innerText = t.pageSubtitle;
            const closeReaderBtn = document.getElementById('art-close-reader-btn');
            if (closeReaderBtn) closeReaderBtn.innerText = t.backToList;
            const shareBtn = document.getElementById('btn-share-link');
            if (shareBtn) shareBtn.innerHTML = t.shareBtn;
            const rewardTitle = document.getElementById('reward-title-text');
            if (rewardTitle) rewardTitle.innerText = t.rewardTitle;
            const rewardSub = document.getElementById('reward-sub-text');
            if (rewardSub) rewardSub.innerText = t.rewardSubtitle;
            const rewardScan = document.getElementById('reward-scan-text');
            if (rewardScan) rewardScan.innerText = t.rewardWeChat;
            const commentsHead = document.getElementById('comments-head-title');
            if (commentsHead) commentsHead.innerText = t.commentsTitle;
            const sortLabel = document.getElementById('art-sort-label');
            if (sortLabel) sortLabel.innerText = t.sortLabel;
            const sortDescBtn = document.getElementById('art-sort-desc-btn');
            if (sortDescBtn) sortDescBtn.innerText = t.sortDesc;
            const sortAscBtn = document.getElementById('art-sort-asc-btn');
            if (sortAscBtn) sortAscBtn.innerText = t.sortAsc;
            const leaveCommTitle = document.getElementById('leave-comment-title');
            if (leaveCommTitle) leaveCommTitle.innerText = t.leaveComment;
            const lblAuthor = document.getElementById('lbl-author-name');
            if (lblAuthor) lblAuthor.innerText = t.yourName;
            const inputAuthor = document.getElementById('comment-author');
            if (inputAuthor) inputAuthor.placeholder = t.namePlaceholder;
            const inputContent = document.getElementById('comment-content');
            if (inputContent) inputContent.placeholder = t.contentPlaceholder;
            const charLimitEl = document.getElementById('char-limit-hint');
            if (charLimitEl) charLimitEl.innerText = t.charLimit;
            const submitBtn = document.getElementById('comment-btn-submit');
            if (submitBtn) submitBtn.innerText = t.submitComment;
            const footerCopy = document.getElementById('art-footer-copy');
            if (footerCopy) footerCopy.innerText = t.copyright;

            updateArticleLikeUI();
            renderList();

            if (currentArticleId) {
                const art = ARTICLES.find(a => a.id === currentArticleId);
                if (art) {
                    updateReaderContent(art, lang);
                }
            }
        }

        function switchArticleLang(lang) {
            setGlobalLang(lang);
        }

        function updateReaderContent(art, lang) {
            let title = '';
            let content = '';
            if (lang === 'en') {
                title = art.title_en || (art.title && art.title.en) || art.title_zh || (art.title && art.title.zh) || '';
                content = art.content_en || (art.content && art.content.en) || art.content_zh || (art.content && art.content.zh) || '';
            } else {
                title = art.title_zh || (art.title && art.title.zh) || (typeof art.title === 'string' ? art.title : '');
                content = art.content_zh || (art.content && art.content.zh) || (typeof art.content === 'string' ? art.content : '');
            }
            document.getElementById('reader-title').innerText = title;
            document.getElementById('reader-content').innerHTML = content;

            const btnZh = document.getElementById('lang-btn-zh');
            const btnEn = document.getElementById('lang-btn-en');
            if (btnZh && btnEn) {
                if (lang === 'en') {
                    btnZh.classList.remove('active');
                    btnEn.classList.add('active');
                } else {
                    btnEn.classList.remove('active');
                    btnZh.classList.add('active');
                }
            }
        }

        function renderList() {
            const box = document.getElementById('articles-list-box');
            if (!box) return;
            const t = articlesI18n[currentGlobalLang] || articlesI18n.zh;
            // 防御性过滤：即使数据源未过滤，被隐藏的文章也不进入公开列表
            box.innerHTML = ARTICLES.filter(art => !art.hidden).map(art => {
                const title_zh = art.title_zh || (art.title && (art.title.zh || art.title.en)) || (typeof art.title === 'string' ? art.title : art.id);
                const title_en = art.title_en || (art.title && art.title.en) || '';
                const displayTitle = (currentGlobalLang === 'en' && title_en) ? title_en : (title_zh || title_en || art.id);
                const hasEnContent = !!(art.content_en && art.content_en.trim()) || !!(art.content && art.content.en && art.content.en.trim());
                const isBilingual = art.isBilingual !== undefined ? !!art.isBilingual : hasEnContent;

                let langBadge = '';
                if (isBilingual && hasEnContent) {
                    langBadge = '<span class="badge badge-bilingual" style="background:var(--bg-subtle); border:1px solid var(--accent); color:var(--accent); font-size:0.72rem; padding:1px 6px; border-radius:10px; margin-left:6px; font-weight:normal;">' + t.badgeBilingual + '</span>';
                } else {
                    langBadge = '<span class="badge badge-zh-only" style="background:var(--bg-subtle); border:1px solid var(--border); color:var(--text-light); font-size:0.72rem; padding:1px 6px; border-radius:10px; margin-left:6px; font-weight:normal;">' + t.badgeZhOnly + '</span>';
                }

                const viewsFormatted = formatViews(art.views);
                const likesFormatted = formatViews(typeof art.likes === 'number' ? art.likes : (parseInt(art.likes, 10) || 0));
                return '<div class="article-row" data-id="' + art.id + '" onclick="openArticle(this.dataset.id)">' +
                    '<div>' +
                        '<div class="article-title-text">' + escapeHtml(displayTitle) + langBadge + '</div>' +
                        '<div style="font-family:var(--font-mono); font-size:0.75rem; color:var(--text-light); margin-top:4px;">' +
                            art.date + ' · ' + (art.readTime || '') + ' · <span style="color:var(--accent);">👁️ ' + viewsFormatted + (currentGlobalLang === 'en' ? ' views' : ' 浏览') + '</span>' +
                            ' · <span style="color:var(--accent);">👍 ' + likesFormatted + t.likesSuffix + '</span>' +
                        '</div>' +
                    '</div>' +
                    '<span class="article-date-badge">' + art.date + '</span>' +
                '</div>';
            }).join('');
        }

        function openArticle(id, updateHistory = true) {
            const art = ARTICLES.find(a => a.id === id);
            if (!art) return;
            currentArticleId = id;

            document.getElementById('reader-meta-info').innerText = art.date + ' · ' + (art.readTime || '') + ' · ' + (art.tag || '');
            document.getElementById('reader-meta-views').innerText = '👁️ ' + formatViews(art.views) + (currentGlobalLang === 'en' ? ' views' : ' 次浏览');

            currentArticleLikeCount = typeof art.likes === 'number' ? art.likes : (parseInt(art.likes, 10) || 0);
            currentArticleLiked = isArticleLiked(art.id);
            updateArticleLikeUI();

            const hasEnContent = !!(art.content_en && art.content_en.trim()) || !!(art.content && art.content.en && art.content.en.trim());
            const isBilingual = art.isBilingual !== undefined ? !!art.isBilingual : hasEnContent;
            const switcher = document.getElementById('article-lang-switcher');

            if (isBilingual && hasEnContent) {
                if (switcher) switcher.style.display = 'flex';
                updateReaderContent(art, currentGlobalLang);
            } else {
                if (switcher) switcher.style.display = 'none';
                updateReaderContent(art, 'zh');
            }
            
            document.getElementById('comment-article-id').value = art.id;
            document.getElementById('comment-article-title').value = art.title_zh || (art.title && art.title.zh) || '';
            document.getElementById('comment-status-msg').innerText = '';
            
            // 自动累加浏览量（会话去重防刷）
            recordArticleView(art);

            loadArticleComments(art.id);

            const reader = document.getElementById('reader-view');
            reader.style.display = 'block';

            if (updateHistory && window.history && window.history.pushState) {
                const newUrl = window.location.pathname + '?id=' + encodeURIComponent(id);
                window.history.pushState({ articleId: id }, '', newUrl);
            }

            reader.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        async function recordArticleView(art) {
            const storageKey = 'viewed_art_' + art.id;
            if (sessionStorage.getItem(storageKey)) {
                return;
            }
            sessionStorage.setItem(storageKey, '1');

            if (typeof art.views === 'number') {
                art.views += 1;
            } else {
                art.views = (parseInt(String(art.views).replace(/[^0-9]/g, ''), 10) || 0) + 1;
            }
            const viewsEl = document.getElementById('reader-meta-views');
            if (viewsEl) viewsEl.innerText = '👁️ ' + formatViews(art.views) + ' 次浏览';

            try {
                const res = await fetch('/api/articles/view?id=' + encodeURIComponent(art.id), { method: 'POST' });
                const data = await res.json();
                if (data && typeof data.views === 'number') {
                    art.views = data.views;
                    if (viewsEl) viewsEl.innerText = '👁️ ' + formatViews(art.views) + ' 次浏览';
                }
            } catch (e) {
                console.warn('View count update error:', e);
            }
        }

        let currentArticleLikeCount = 0;
        let currentArticleLiked = false;

        function isArticleLiked(id) {
            try {
                const arr = JSON.parse(localStorage.getItem('my_liked_articles') || '[]');
                return arr.includes(id);
            } catch(e) { return false; }
        }

        function markArticleLiked(id) {
            try {
                const arr = JSON.parse(localStorage.getItem('my_liked_articles') || '[]');
                if (!arr.includes(id)) {
                    arr.push(id);
                    localStorage.setItem('my_liked_articles', JSON.stringify(arr));
                }
            } catch(e) {}
        }

        function updateArticleLikeUI() {
            const t = articlesI18n[currentGlobalLang] || articlesI18n.zh;
            const countEl = document.getElementById('article-like-count');
            const textEl = document.getElementById('btn-article-like-text');
            const btn = document.getElementById('btn-article-like');
            if (countEl) countEl.innerText = (currentArticleLikeCount || 0).toLocaleString();
            if (textEl) textEl.innerText = currentArticleLiked ? t.likedText : t.likeText;
            if (btn) {
                if (currentArticleLiked) {
                    btn.style.background = 'var(--accent)';
                    btn.style.color = '#ffffff';
                    btn.style.borderColor = 'var(--accent)';
                    btn.style.cursor = 'default';
                } else {
                    btn.style.background = 'var(--bg-subtle)';
                    btn.style.color = 'var(--accent)';
                    btn.style.borderColor = 'var(--border)';
                    btn.style.cursor = 'pointer';
                }
            }
        }

        async function toggleArticleLike() {
            if (!currentArticleId) return;
            const t = articlesI18n[currentGlobalLang] || articlesI18n.zh;

            if (currentArticleLiked || isArticleLiked(currentArticleId)) {
                currentArticleLiked = true;
                updateArticleLikeUI();
                alert(t.likeAlready);
                return;
            }

            currentArticleLiked = true;
            currentArticleLikeCount = (currentArticleLikeCount || 0) + 1;
            markArticleLiked(currentArticleId);
            updateArticleLikeUI();

            const art = ARTICLES.find(a => a.id === currentArticleId);
            if (art) art.likes = currentArticleLikeCount;
            renderList();

            try {
                const res = await fetch('/api/articles/like?id=' + encodeURIComponent(currentArticleId), { method: 'POST' });
                const data = await res.json();
                if (data && typeof data.likes === 'number') {
                    currentArticleLikeCount = data.likes;
                    if (art) art.likes = data.likes;
                }
                if (data && data.alreadyLiked) {
                    currentArticleLiked = true;
                }
                updateArticleLikeUI();
                renderList();
            } catch (e) {
                console.warn('Article like error:', e);
            }
        }

        function copyShareLink() {
            if (!currentArticleId) return;
            const shareUrl = window.location.origin + '/articles?id=' + encodeURIComponent(currentArticleId);
            const toast = document.getElementById('share-copied-toast');

            const showToast = () => {
                if (toast) {
                    toast.innerText = '✓ 分享链接已复制！可直接发送或转发给读者';
                    toast.style.display = 'inline';
                    setTimeout(() => { toast.style.display = 'none'; }, 3500);
                }
            };

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(shareUrl).then(showToast).catch(() => fallbackCopy(shareUrl));
            } else {
                fallbackCopy(shareUrl);
            }

            function fallbackCopy(text) {
                const ta = document.createElement('textarea');
                ta.value = text;
                ta.style.position = 'fixed';
                ta.style.opacity = '0';
                document.body.appendChild(ta);
                ta.select();
                try {
                    document.execCommand('copy');
                    showToast();
                } catch (err) {
                    prompt('请手动复制文章分享链接：', text);
                }
                document.body.removeChild(ta);
            }
        }

        let currentArtComments = [];
        let currentArtSort = 'desc';
        let currentLoadedArticleId = '';

        function switchArtSortOrder(order) {
            currentArtSort = order;
            const descBtn = document.getElementById('art-sort-desc-btn');
            const ascBtn = document.getElementById('art-sort-asc-btn');
            if (descBtn) descBtn.className = 'sort-tab-btn' + (order === 'desc' ? ' active' : '');
            if (ascBtn) ascBtn.className = 'sort-tab-btn' + (order === 'asc' ? ' active' : '');
            renderArticleComments();
        }

        function getSortedArtList(arr) {
            const list = arr.slice();
            list.sort((a, b) => {
                const tA = a.createdTimestamp || (a.createdAt ? new Date(a.createdAt.replace(' ', 'T') + ':00+08:00').getTime() : 0);
                const tB = b.createdTimestamp || (b.createdAt ? new Date(b.createdAt.replace(' ', 'T') + ':00+08:00').getTime() : 0);
                return currentArtSort === 'desc' ? (tB - tA) : (tA - tB);
            });
            return list;
        }

        function isArtLiked(id) {
            try {
                const arr = JSON.parse(localStorage.getItem('my_liked_comments') || '[]');
                return arr.includes(id);
            } catch(e) { return false; }
        }

        async function toggleArtLike(cid, rid) {
            const targetId = rid || cid;
            if (isArtLiked(targetId)) {
                alert('您已经点赞过该条内容啦！');
                return;
            }
            try {
                const arr = JSON.parse(localStorage.getItem('my_liked_comments') || '[]');
                arr.push(targetId);
                localStorage.setItem('my_liked_comments', JSON.stringify(arr));
            } catch(e) {}

            const countEl = document.getElementById('art-like-' + targetId);
            if (countEl) {
                const cur = parseInt(countEl.innerText, 10) || 0;
                countEl.innerText = cur + 1;
                const btn = countEl.closest('button');
                if (btn) btn.classList.add('liked');
            }

            try {
                await fetch('/api/comments/like', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ commentId: cid, replyId: rid })
                });
            } catch(e) {}
        }

        function toggleArtReplyForm(cid) {
            const form = document.getElementById('art-rep-form-' + cid);
            if (!form) return;
            form.style.display = (form.style.display === 'none' || !form.style.display) ? 'block' : 'none';
        }

        async function submitArtReply(cid) {
            const authorInput = document.getElementById('art-rep-author-' + cid);
            const contentInput = document.getElementById('art-rep-content-' + cid);
            const statusEl = document.getElementById('art-rep-status-' + cid);
            const btn = document.getElementById('art-rep-btn-' + cid);

            const author = (authorInput && authorInput.value.trim()) || '匿名读者';
            const content = (contentInput && contentInput.value.trim()) || '';
            if (!content) {
                alert('请输入回复内容');
                return;
            }

            const zhMatches = content.match(/[一-龥]/g) || [];
            const zhCnt = zhMatches.length;
            const wordsList = content.replace(/[一-龥]/g, ' ').match(/[a-zA-Z0-9_\-]+/g) || [];
            const enCnt = wordsList.length;

            if (zhCnt > 140) {
                statusEl.style.color = '#dc3545';
                statusEl.innerText = '中文字数超限：最多支持 140 个汉字';
                return;
            }
            if (enCnt > 200) {
                statusEl.style.color = '#dc3545';
                statusEl.innerText = '英文字数超限：最多支持 200 个单词';
                return;
            }

            btn.disabled = true;
            btn.innerText = '发送中...';
            statusEl.style.color = 'var(--text-light)';
            statusEl.innerText = '正在提交...';

            try {
                const res = await fetch('/api/comments/reply', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ parentId: cid, author, content })
                });
                const result = await res.json();
                if (result.success && result.reply) {
                    const target = currentArtComments.find(c => c.id === cid);
                    if (target) {
                        if (!target.replies) target.replies = [];
                        target.replies.push(result.reply);
                    }
                    renderArticleComments();
                } else {
                    statusEl.style.color = '#dc3545';
                    statusEl.innerText = result.error || '提交失败';
                    btn.disabled = false;
                    btn.innerText = '发表回复';
                }
            } catch(e) {
                statusEl.style.color = '#dc3545';
                statusEl.innerText = '网络异常，提交失败';
                btn.disabled = false;
                btn.innerText = '发表回复';
            }
        }

        function renderArticleComments() {
            const listEl = document.getElementById('comments-display-list');
            const countEl = document.getElementById('comments-count');
            countEl.innerText = currentArtComments.length;

            let localPending = [];
            try {
                const raw = localStorage.getItem('my_pending_comments');
                if (raw) {
                    let arr = JSON.parse(raw);
                    const beforeLen = arr.length;
                    arr = arr.filter(x => {
                        if (!x || !x.content) return false;
                        if (x.content.includes('333333') || x.content.includes('围观围观') || x.author === 'B6') return false;
                        return true;
                    });
                    if (arr.length !== beforeLen) {
                        localStorage.setItem('my_pending_comments', JSON.stringify(arr));
                    }
                    localPending = arr.filter(x => x.articleId === currentLoadedArticleId && !currentArtComments.some(a => a.content === x.content));
                }
            } catch(e) {}

            let html = '';
            if (localPending.length > 0) {
                html += localPending.map((c, i) => 
                    '<div style="background:#fffbeb; border:1px dashed #f59e0b; padding:10px 14px; border-radius:6px; margin-bottom:12px;">' +
                        '<div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:4px;">' +
                            '<div style="display:flex; align-items:center; gap:6px;">' +
                                '<strong style="font-size:0.86rem; color:#b45309;">' + escapeHtml(c.author || '我') + '</strong>' +
                                '<span style="font-size:0.75rem; font-weight:normal; background:#fef3c7; color:#92400e; padding:1px 6px; border-radius:4px;">🟡 待审核（已成功接收）</span>' +
                                '<button type="button" onclick="removePendingArtComment(' + i + ')" style="font-size:0.72rem; background:transparent; border:1px solid #d97706; color:#b45309; border-radius:4px; padding:1px 6px; cursor:pointer;" title="从本地移除此待审核留言">🗑️ 移除</button>' +
                            '</div>' +
                            '<span style="font-family:var(--font-mono); font-size:0.75rem; color:#b45309;">' + escapeHtml(c.createdAt || '') + '</span>' +
                        '</div>' +
                        '<div style="font-size:0.86rem; color:var(--text-main); line-height:1.6; white-space:pre-wrap;">' + escapeHtml(c.content || '') + '</div>' +
                    '</div>'
                ).join('');
            }

            const sorted = getSortedArtList(currentArtComments);
            if (sorted.length === 0 && localPending.length === 0) {
                listEl.innerHTML = '<div style="font-size:0.84rem; color:var(--text-light); font-style:italic; padding:12px 0;">暂无公开留言，欢迎成为第一个交流的读者。</div>';
                return;
            }

            html += sorted.map(c => {
                const replies = Array.isArray(c.replies) ? c.replies : [];
                const repCount = replies.length;
                const isCapped = repCount >= 5;
                const cLiked = isArtLiked(c.id);

                let repliesHtml = '';
                if (repCount > 0) {
                    repliesHtml += '<div class="reply-box">';
                    repliesHtml += replies.map(r => {
                        const isAuthor = (r.author === '维托里奥 崔' || r.author === 'Vittorio Cui');
                        const rLiked = isArtLiked(r.id);
                        return '<div class="reply-item">' +
                            '<div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:4px;">' +
                                '<div>' +
                                    '<strong style="color:var(--text-main); font-size:0.85rem;">' + escapeHtml(r.author || '匿名读者') + '</strong>' +
                                    (isAuthor ? '<span class="author-tag">博主</span>' : '') +
                                '</div>' +
                                '<span class="msg-date">' + escapeHtml(r.createdAt || '') + '</span>' +
                            '</div>' +
                            '<div style="font-size:0.86rem; color:var(--text-main); line-height:1.6; white-space:pre-wrap; margin-bottom:6px;">' + escapeHtml(r.content || '') + '</div>' +
                            '<div style="display:flex; justify-content:flex-end;">' +
                                '<button type="button" class="action-btn' + (rLiked ? ' liked' : '') + '" onclick="toggleArtLike(\\'' + c.id + '\\', \\'' + r.id + '\\')">' +
                                    '👍 <span id="art-like-' + r.id + '">' + (r.likes || 0) + '</span>' +
                                '</button>' +
                            '</div>' +
                        '</div>';
                    }).join('');
                    repliesHtml += '</div>';
                }

                let replyBtn = '';
                if (isCapped) {
                    replyBtn = '<button type="button" class="action-btn disabled" title="该留言回复已达5条上限" onclick="alert(\\'该条留言回复已达 5 条上限，无法继续添加新回复。\\')">💬 回复已满 (5/5)</button>';
                } else {
                    replyBtn = '<button type="button" class="action-btn" onclick="toggleArtReplyForm(\\'' + c.id + '\\')">💬 回复 (' + repCount + '/5)</button>';
                }

                const repForm = '<div id="art-rep-form-' + c.id + '" class="reply-input-panel" style="display:none;">' +
                    '<div style="margin-bottom:8px;">' +
                        '<input type="text" id="art-rep-author-' + c.id + '" placeholder="您的称呼 (选填，默认: 匿名读者)" style="width:100%; box-sizing:border-box; padding:6px 10px; font-size:0.84rem; border:1px solid var(--border); border-radius:4px; background:var(--bg-page); color:var(--text-main);" />' +
                    '</div>' +
                    '<div style="margin-bottom:6px;">' +
                        '<textarea id="art-rep-content-' + c.id + '" rows="2" placeholder="写下您的回复...（中文 ≤ 140字 / 英文 ≤ 200词）" style="width:100%; box-sizing:border-box; padding:8px 10px; font-size:0.86rem; border:1px solid var(--border); border-radius:4px; background:var(--bg-page); color:var(--text-main); font-family:var(--font-sans); resize:vertical;"></textarea>' +
                    '</div>' +
                    '<div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">' +
                        '<span id="art-rep-status-' + c.id + '" style="font-size:0.78rem;"></span>' +
                        '<div style="display:flex; gap:8px;">' +
                            '<button type="button" onclick="toggleArtReplyForm(\\'' + c.id + '\\')" class="action-btn">取消</button>' +
                            '<button type="button" id="art-rep-btn-' + c.id + '" onclick="submitArtReply(\\'' + c.id + '\\')" style="background:var(--accent); color:white; border:none; border-radius:4px; padding:4px 14px; font-size:0.82rem; font-weight:500; cursor:pointer;">发表回复</button>' +
                        '</div>' +
                    '</div>' +
                '</div>';

                return '<div style="padding: 14px 0; border-bottom: 1px dashed var(--border);">' +
                    '<div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">' +
                        '<strong style="font-size: 0.88rem; color: var(--accent);">' + escapeHtml(c.author || '匿名读者') + '</strong>' +
                        '<span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-light);">' + escapeHtml(c.createdAt || '') + '</span>' +
                    '</div>' +
                    '<div style="font-size: 0.86rem; color: var(--text-main); line-height: 1.6; white-space: pre-wrap;">' + escapeHtml(c.content || '') + '</div>' +
                    repliesHtml +
                    '<div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">' +
                        '<div style="display:flex; gap:8px; align-items:center;">' +
                            '<button type="button" class="action-btn' + (cLiked ? ' liked' : '') + '" onclick="toggleArtLike(\\'' + c.id + '\\')">' +
                                '👍 赞同 (<span id="art-like-' + c.id + '">' + (c.likes || 0) + '</span>)' +
                            '</button>' +
                            replyBtn +
                        '</div>' +
                    '</div>' +
                    repForm +
                '</div>';
            }).join('');

            listEl.innerHTML = html;
        }

        async function loadArticleComments(articleId) {
            currentLoadedArticleId = articleId;
            const listEl = document.getElementById('comments-display-list');
            listEl.innerHTML = '<div style="font-size:0.82rem; color:var(--text-light); font-style:italic;">加载留言中...</div>';
            try {
                const res = await fetch('/api/comments?articleId=' + encodeURIComponent(articleId));
                const data = await res.json();
                currentArtComments = Array.isArray(data) ? data : [];
                renderArticleComments();
            } catch (e) {
                listEl.innerHTML = '<div style="font-size:0.82rem; color:var(--text-light);">加载留言失败</div>';
            }
        }

        function removePendingArtComment(idx) {
            try {
                let raw = localStorage.getItem('my_pending_comments');
                if (raw) {
                    let arr = JSON.parse(raw);
                    let artPending = arr.filter(x => x.articleId === currentLoadedArticleId && !currentArtComments.some(a => a.content === x.content));
                    const target = artPending[idx];
                    if (target) {
                        arr = arr.filter(x => x !== target && x.content !== target.content);
                        localStorage.setItem('my_pending_comments', JSON.stringify(arr));
                    }
                    renderArticleComments();
                }
            } catch(e) {}
        }

        async function handleCommentSubmit(e) {
            e.preventDefault();
            const articleId = document.getElementById('comment-article-id').value;
            const articleTitle = document.getElementById('comment-article-title').value;
            const author = document.getElementById('comment-author').value.trim() || '匿名读者';
            const content = document.getElementById('comment-content').value.trim();
            const statusMsg = document.getElementById('comment-status-msg');
            const btn = document.getElementById('comment-btn-submit');
            
            if (!content) return;
            btn.disabled = true;
            btn.innerText = '提交中...';
            statusMsg.style.color = 'var(--text-light)';
            statusMsg.innerText = '正在提交...';
            
            const zhMatches = content.match(/[一-龥]/g) || [];
            const zhCnt = zhMatches.length;
            const wordsList = content.replace(/[一-龥]/g, ' ').match(/[a-zA-Z0-9_\-]+/g) || [];
            const enCnt = wordsList.length;
            if (zhCnt > 140) {
                statusMsg.style.color = '#dc3545';
                statusMsg.innerText = '中文字数超限：最多支持 140 个汉字（当前为 ' + zhCnt + ' 字）';
                btn.disabled = false;
                btn.innerText = '提交留言';
                return;
            }
            if (enCnt > 200) {
                statusMsg.style.color = '#dc3545';
                statusMsg.innerText = '英文字数超限：最多支持 200 个单词（当前为 ' + enCnt + ' 词）';
                btn.disabled = false;
                btn.innerText = '提交留言';
                return;
            }

            try {
                const res = await fetch('/api/comments', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ articleId, articleTitle, author, content })
                });
                const result = await res.json();
                if (result.success) {
                    try {
                        const raw = localStorage.getItem('my_pending_comments') || '[]';
                        const arr = JSON.parse(raw);
                        arr.unshift({
                            articleId: articleId,
                            author: author,
                            content: content,
                            createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
                        });
                        localStorage.setItem('my_pending_comments', JSON.stringify(arr.slice(0, 20)));
                    } catch(e) {}
                    document.getElementById('comment-content').value = '';
                    const counter = document.getElementById('comment-char-counter');
                    if (counter) counter.innerText = '已输入: 0 汉字, 0 单词';
                    statusMsg.style.color = '#28a745';
                    statusMsg.innerText = '✓ ' + (result.message || '留言已成功提交，待管理员审核通过后公开展示。');
                    loadArticleComments(articleId);
                } else {
                    statusMsg.style.color = '#dc3545';
                    statusMsg.innerText = result.error || '提交失败，请稍后重试。';
                }
            } catch (err) {
                statusMsg.style.color = '#dc3545';
                statusMsg.innerText = '网络异常，提交失败。';
            } finally {
                btn.disabled = false;
                btn.innerText = '提交留言';
            }
        }

        // 实时字数监控
        const commTextarea = document.getElementById('comment-content');
        if (commTextarea) {
            commTextarea.addEventListener('input', function() {
                const val = this.value;
                const zh = (val.match(/[一-龥]/g) || []).length;
                const en = (val.replace(/[一-龥]/g, ' ').match(/[a-zA-Z0-9_\-]+/g) || []).length;
                const counter = document.getElementById('comment-char-counter');
                if (counter) {
                    counter.innerText = '已输入: ' + zh + ' 汉字, ' + en + ' 单词';
                    if (zh > 140 || en > 200 || val.length > 500) {
                        counter.style.color = '#dc3545';
                        counter.style.fontWeight = 'bold';
                    } else {
                        counter.style.color = 'var(--text-light)';
                        counter.style.fontWeight = 'normal';
                    }
                }
            });
        }

        function closeReader() {
            document.getElementById('reader-view').style.display = 'none';
            if (window.history && window.history.pushState) {
                window.history.pushState({}, '', window.location.pathname);
            }
            renderList();
        }

        window.addEventListener('DOMContentLoaded', () => {
            let savedLang = 'zh';
            try {
                savedLang = localStorage.getItem('preferredLang') || (document.cookie.match(/preferredLang=([^;]+)/) ? RegExp.$1 : 'zh');
            } catch(e) {}
            if (savedLang !== 'zh' && savedLang !== 'en') savedLang = 'zh';
            setGlobalLang(savedLang);

            const params = new URLSearchParams(window.location.search);
            const targetId = params.get('id');
            if (targetId) {
                openArticle(targetId, false);
            }
        });

        window.addEventListener('popstate', () => {
            const params = new URLSearchParams(window.location.search);
            const targetId = params.get('id');
            if (targetId) {
                openArticle(targetId, false);
            } else {
                document.getElementById('reader-view').style.display = 'none';
                renderList();
            }
        });
    </script>
    <script>
        (function() {
            // 会话 cookie 是 HttpOnly，JS 读不到；改用不含任何凭据的标记 cookie 判断是否显示管理浮标
            const isAdmin = document.cookie.split('; ').indexOf('tianai_admin=1') !== -1;
            if (isAdmin) {
                const bar = document.createElement('div');
                bar.id = 'admin-floating-badge';
                bar.style.cssText = 'position:fixed; bottom:24px; right:24px; background:#191919; color:#ffffff; padding:8px 16px; border-radius:30px; font-size:0.84rem; box-shadow:0 4px 20px rgba(0,0,0,0.25); z-index:9999; display:flex; align-items:center; gap:12px; font-family:var(--font-sans); border:1px solid rgba(255,255,255,0.15);';
                bar.innerHTML = '<span style="color:#4ade80;">●</span> <span style="font-weight:500;">管理员</span><a href="/admin" style="color:#fff; text-decoration:underline;">控制台</a><a href="/admin" onclick="sessionStorage.setItem(&#39;open_create&#39;, &#39;1&#39;)" style="color:#fdba74; text-decoration:underline; font-weight:500;">➕ 发布新文章</a><a href="javascript:void(0)" onclick="quickLogout()" style="color:#fca5a5; text-decoration:underline;">登出</a>';
                document.body.appendChild(bar);
            }
        })();

        async function quickLogout() {
            try {
                await fetch('/api/logout', { method: 'POST', credentials: 'include' });
            } catch(e) {}
            try { localStorage.removeItem('tianai_token'); } catch(e) {}
            try { sessionStorage.removeItem('tianai_token'); } catch(e) {}
            document.cookie = "tianai_admin=; Path=/; Max-Age=0; Secure; SameSite=Strict";
            window.location.reload();
        }
    </script>
</body>
</html>`;
}

/**
 * 1.5 独立留言板页面 HTML (GET /guestbook 或 /messages)
 */
export { renderArticlesPageHtml };