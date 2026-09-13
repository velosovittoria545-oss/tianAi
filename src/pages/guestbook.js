import { COMMON_CSS } from "./common.js";

import { CONFIG } from "../config.js";
import { escapeHtml } from "../util.js";

// GET /guestbook（/messages）
function renderGuestbookHtml(initialJson) {
  let gbInitialTotal = 0;
  if (initialJson) {
    try {
      gbInitialTotal = JSON.parse(initialJson).total || 0;
    } catch (e) {}
  }
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>留言板 — 维托里奥 崔</title>
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
            font-size: 0.92rem;
            color: var(--text-muted);
            line-height: 1.6;
        }
        .guestbook-form-box {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 6px;
            padding: 22px 24px;
            margin-bottom: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.02);
        }
        .msg-card {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 6px;
            padding: 18px 20px;
            margin-bottom: 14px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.02);
        }
        .msg-head {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 6px;
        }
        .msg-author {
            font-weight: 600;
            font-size: 0.95rem;
            color: var(--accent);
        }
        .msg-date {
            font-family: var(--font-mono);
            font-size: 0.78rem;
            color: var(--text-light);
        }
        .msg-content {
            font-size: 0.9rem;
            color: var(--text-main);
            line-height: 1.68;
            white-space: pre-wrap;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="top-nav-bar">
            <a href="/" class="back-btn" id="gb-back-btn">← 返回主页</a>
            <div style="display:flex; gap:14px; align-items:center;">
                <a href="/articles" id="gb-nav-articles" style="font-size:0.88rem; color:var(--accent); text-decoration:underline;">文章列表</a>
                <a href="/experience" id="gb-nav-experience" style="font-size:0.88rem; color:var(--accent); text-decoration:underline;">工作经历</a>
                <a href="/admin" id="gb-nav-admin" class="admin-link">[管理员登录]</a>
                <button type="button" class="lang-switch-btn" onclick="toggleGbLang()" id="btn-gb-lang-toggle">English</button>
            </div>
        </div>

        <header class="page-header">
            <h1 class="page-title" id="gb-page-title">留言板</h1>
            <p class="page-subtitle" id="gb-page-subtitle">欢迎在此交流探讨、留下您的想法或建议（留言经管理员审核后公开展示）</p>
        </header>

        <!-- 发表留言表单 -->
        <div class="guestbook-form-box">
            <h3 style="font-family:var(--font-serif); font-size:1.15rem; font-weight:500; margin-bottom:14px; color:var(--text-main);" id="gb-form-title">发表留言</h3>
            <form onsubmit="handleGuestbookSubmit(event)">
                <div style="margin-bottom:12px; display:flex; gap:10px; align-items:center;">
                    <label style="font-size:0.85rem; color:var(--text-muted); white-space:nowrap;" id="gb-lbl-author">您的称呼:</label>
                    <input type="text" id="gb-author" placeholder="例如: 某技术同行 (可自定义，默认: 匿名读者)" style="flex:1; padding:8px 12px; font-size:0.88rem; border:1px solid var(--border); border-radius:4px; background:var(--bg-page); color:var(--text-main);" />
                </div>
                <div style="margin-bottom:6px;">
                    <textarea id="gb-content" required rows="4" placeholder="写下您的技术探讨、阅读感受或问题交流...（中文字数 ≤ 140字，英文 ≤ 200词；留言将在管理员审核通过后公开展示）" style="width:100%; box-sizing:border-box; padding:10px 12px; font-size:0.9rem; border:1px solid var(--border); border-radius:4px; background:var(--bg-page); color:var(--text-main); font-family:var(--font-sans); resize:vertical;"></textarea>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:0.78rem; color:var(--text-light); margin-bottom:12px;">
                    <span id="gb-limit-hint">字数限制：中文 ≤ 140字 / 英文 ≤ 200词</span>
                    <span id="gb-counter">已输入: 0 汉字, 0 单词</span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                    <span id="gb-status-msg" style="font-size:0.84rem;"></span>
                    <button type="submit" id="gb-submit-btn" style="background:var(--accent); color:white; border:none; border-radius:4px; padding:8px 22px; font-size:0.88rem; font-weight:500; cursor:pointer;">提交留言</button>
                </div>
            </form>
        </div>

        <!-- 留言列表标题与排序切换栏 -->
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:16px; border-bottom: 1px solid var(--border); padding-bottom: 12px;">
            <div>
                <h3 style="font-family:var(--font-serif); font-size:1.2rem; font-weight:500; color:var(--text-main); margin:0;"><span id="gb-title">💬 全部公开留言</span> (<span id="gb-count">${gbInitialTotal}</span>)</h3>
                <div id="gb-hint" style="font-size:0.78rem; color:var(--text-light); margin-top:2px;"></div>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
                <span id="gb-sort-label" style="font-size:0.78rem; color:var(--text-light);">排序：</span>
                <button type="button" id="sort-desc-btn" class="sort-tab-btn active" onclick="switchSortOrder('desc')">▼ 最新优先</button>
                <button type="button" id="sort-asc-btn" class="sort-tab-btn" onclick="switchSortOrder('asc')">▲ 最早优先</button>
            </div>
        </div>

        <!-- 按周查找工具栏 -->
        <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:16px; background:var(--bg-card); border:1px solid var(--border); border-radius:6px; padding:10px 14px;">
            <span id="gb-search-label" style="font-size:0.85rem; color:var(--text-muted);">🔍 按周查找（固定 7 天区间，最多显示 20 条）：</span>
            <input type="date" id="gb-week-from" style="padding:6px 10px; font-size:0.85rem; border:1px solid var(--border); border-radius:4px; background:var(--bg-page); color:var(--text-main);" />
            <button type="button" class="action-btn" id="gb-btn-search" onclick="searchByWeek()">查找</button>
            <button type="button" class="action-btn" id="gb-btn-prev" onclick="shiftWeek(-1)">◀ 上一周</button>
            <button type="button" class="action-btn" id="gb-btn-next" onclick="shiftWeek(1)">下一周 ▶</button>
            <button type="button" class="action-btn" id="gb-clear-btn" onclick="clearWeekSearch()" style="display:none;">✕ 清除查找</button>
            <span id="gb-search-status" style="font-size:0.8rem; color:var(--text-light);"></span>
        </div>

        <!-- 留言列表展示 -->
        <div id="gb-messages-list">
            <div style="font-size:0.85rem; color:var(--text-light); font-style:italic; padding:20px 0;">加载留言中...</div>
        </div>

        <footer>
            <span id="gb-footer-copy">© 2026 维托里奥 崔 · All Rights Reserved</span>
            <a href="/admin" class="admin-link" id="gb-footer-admin">[管理员登录]</a>
        </footer>
    </div>

    <script>
        function escapeHtml(str) {
            if (!str) return '';
            return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        }

        window.__INITIAL_GUESTBOOK__ = ${initialJson};

        let currentGbLang = 'zh';

        const gbI18n = {
            zh: {
                docTitle: "留言板 — 维托里奥 崔",
                pageTitle: "留言板",
                pageSubtitle: "欢迎在此交流探讨、留下您的想法或建议（留言经管理员审核后公开展示）",
                formTitle: "发表留言",
                lblAuthor: "您的称呼:",
                authorPlaceholder: "例如: 某技术同行 (可自定义，默认: 匿名读者)",
                contentPlaceholder: "写下您的技术探讨、阅读感受或问题交流...（中文字数 ≤ 140字，英文 ≤ 200词；留言将在管理员审核通过后公开展示）",
                limitHint: "字数限制：中文 ≤ 140字 / 英文 ≤ 200词",
                submitBtn: "提交留言",
                listTitle: "💬 全部公开留言",
                searchTitlePrefix: "📅 按周查找：",
                sortLabel: "排序：",
                sortDesc: "▼ 最新优先",
                sortAsc: "▲ 最早优先",
                searchLabel: "🔍 按周查找（固定 7 天区间，最多显示 20 条）：",
                btnSearch: "查找",
                btnPrev: "◀ 上一周",
                btnNext: "下一周 ▶",
                btnClear: "✕ 清除查找",
                backHome: "← 返回主页",
                navArticles: "文章列表",
                navExperience: "工作经历",
                navAdmin: "[管理员登录]",
                copyright: "© 2026 维托里奥 崔 · All Rights Reserved",
                hintCapped: "共 {total} 条公开留言，仅展示最新 10 条 · 可用'按周查找'浏览更多",
                hintWeekCapped: "该周共 {total} 条留言，仅显示前 20 条",
                toggleText: "English"
            },
            en: {
                docTitle: "Guestbook — Vittorio Cui",
                pageTitle: "Guestbook",
                pageSubtitle: "Welcome to share your thoughts, questions, or ideas (published upon admin review)",
                formTitle: "Leave a Message",
                lblAuthor: "Your Name:",
                authorPlaceholder: "e.g. Peer Engineer (Anonymous by default)",
                contentPlaceholder: "Write your thoughts, questions, or comments... (Chinese ≤ 140 chars, English ≤ 200 words; published upon review)",
                limitHint: "Word limit: Chinese ≤ 140 chars / English ≤ 200 words",
                submitBtn: "Submit Message",
                listTitle: "💬 Public Messages",
                searchTitlePrefix: "📅 Search by Week: ",
                sortLabel: "Sort:",
                sortDesc: "▼ Newest first",
                sortAsc: "▲ Oldest first",
                searchLabel: "🔍 Search by Week (7-day window, max 20):",
                btnSearch: "Search",
                btnPrev: "◀ Prev Week",
                btnNext: "Next Week ▶",
                btnClear: "✕ Clear",
                backHome: "← Back to Home",
                navArticles: "Articles",
                navExperience: "Experience",
                navAdmin: "[Admin Login]",
                copyright: "© 2026 Vittorio Cui · All Rights Reserved",
                hintCapped: "{total} public comments in total, showing top 10 · Use week search to browse more",
                hintWeekCapped: "{total} comments this week, showing top 20",
                toggleText: "中文"
            }
        };

        function toggleGbLang() {
            applyGbLang(currentGbLang === 'zh' ? 'en' : 'zh');
        }

        function applyGbLang(lang) {
            currentGbLang = lang;
            try {
                localStorage.setItem('preferredLang', lang);
                localStorage.setItem('site_lang', lang);
            } catch(e) {}
            document.cookie = "preferredLang=" + lang + "; Path=/; Max-Age=31536000; SameSite=Lax";

            const t = gbI18n[lang] || gbI18n.zh;
            document.title = t.docTitle;

            const toggleBtn = document.getElementById('btn-gb-lang-toggle');
            if (toggleBtn) toggleBtn.innerText = t.toggleText;

            const backBtn = document.getElementById('gb-back-btn');
            if (backBtn) backBtn.innerText = t.backHome;
            const navArticles = document.getElementById('gb-nav-articles');
            if (navArticles) navArticles.innerText = t.navArticles;
            const navExp = document.getElementById('gb-nav-experience');
            if (navExp) navExp.innerText = t.navExperience;
            const navAdmin = document.getElementById('gb-nav-admin');
            if (navAdmin) navAdmin.innerText = t.navAdmin;
            const footerAdmin = document.getElementById('gb-footer-admin');
            if (footerAdmin) footerAdmin.innerText = t.navAdmin;

            const pageTitle = document.getElementById('gb-page-title');
            if (pageTitle) pageTitle.innerText = t.pageTitle;
            const pageSub = document.getElementById('gb-page-subtitle');
            if (pageSub) pageSub.innerText = t.pageSubtitle;

            const formTitle = document.getElementById('gb-form-title');
            if (formTitle) formTitle.innerText = t.formTitle;
            const lblAuthor = document.getElementById('gb-lbl-author');
            if (lblAuthor) lblAuthor.innerText = t.lblAuthor;
            const inputAuthor = document.getElementById('gb-author');
            if (inputAuthor) inputAuthor.placeholder = t.authorPlaceholder;
            const inputContent = document.getElementById('gb-content');
            if (inputContent) inputContent.placeholder = t.contentPlaceholder;
            const limitHint = document.getElementById('gb-limit-hint');
            if (limitHint) limitHint.innerText = t.limitHint;
            const submitBtn = document.getElementById('gb-submit-btn');
            if (submitBtn) submitBtn.innerText = t.submitBtn;

            const sortLabel = document.getElementById('gb-sort-label');
            if (sortLabel) sortLabel.innerText = t.sortLabel;
            const sortDescBtn = document.getElementById('sort-desc-btn');
            if (sortDescBtn) sortDescBtn.innerText = t.sortDesc;
            const sortAscBtn = document.getElementById('sort-asc-btn');
            if (sortAscBtn) sortAscBtn.innerText = t.sortAsc;

            const searchLabel = document.getElementById('gb-search-label');
            if (searchLabel) searchLabel.innerText = t.searchLabel;
            const btnSearch = document.getElementById('gb-btn-search');
            if (btnSearch) btnSearch.innerText = t.btnSearch;
            const btnPrev = document.getElementById('gb-btn-prev');
            if (btnPrev) btnPrev.innerText = t.btnPrev;
            const btnNext = document.getElementById('gb-btn-next');
            if (btnNext) btnNext.innerText = t.btnNext;
            const btnClear = document.getElementById('gb-clear-btn');
            if (btnClear) btnClear.innerText = t.btnClear;

            const footerCopy = document.getElementById('gb-footer-copy');
            if (footerCopy) footerCopy.innerText = t.copyright;

            renderGuestbookList();
        }

        let allApprovedComments = [];
        let currentSort = 'desc';
        let gbTotal = 0;
        let currentFrom = null;
        let currentCapped = false;

        function switchSortOrder(order) {
            currentSort = order;
            const descBtn = document.getElementById('sort-desc-btn');
            const ascBtn = document.getElementById('sort-asc-btn');
            if (descBtn) descBtn.className = 'sort-tab-btn' + (order === 'desc' ? ' active' : '');
            if (ascBtn) ascBtn.className = 'sort-tab-btn' + (order === 'asc' ? ' active' : '');
            renderGuestbookList();
        }

        function getSortedList(arr) {
            const list = arr.slice();
            list.sort((a, b) => {
                const tA = a.createdTimestamp || (a.createdAt ? new Date(a.createdAt.replace(' ', 'T') + ':00+08:00').getTime() : 0);
                const tB = b.createdTimestamp || (b.createdAt ? new Date(b.createdAt.replace(' ', 'T') + ':00+08:00').getTime() : 0);
                return currentSort === 'desc' ? (tB - tA) : (tA - tB);
            });
            return list;
        }

        function isLiked(id) {
            try {
                const arr = JSON.parse(localStorage.getItem('my_liked_comments') || '[]');
                return arr.includes(id);
            } catch(e) { return false; }
        }

        async function toggleLike(cid, rid) {
            const targetId = rid || cid;
            if (isLiked(targetId)) {
                alert('您已经点赞过该条内容啦！');
                return;
            }
            try {
                const arr = JSON.parse(localStorage.getItem('my_liked_comments') || '[]');
                arr.push(targetId);
                localStorage.setItem('my_liked_comments', JSON.stringify(arr));
            } catch(e) {}

            const countEl = document.getElementById('like-' + targetId);
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

        function toggleReplyForm(cid) {
            const form = document.getElementById('rep-form-' + cid);
            if (!form) return;
            form.style.display = (form.style.display === 'none' || !form.style.display) ? 'block' : 'none';
        }

        async function submitReply(cid) {
            const authorInput = document.getElementById('rep-author-' + cid);
            const contentInput = document.getElementById('rep-content-' + cid);
            const statusEl = document.getElementById('rep-status-' + cid);
            const btn = document.getElementById('rep-btn-' + cid);

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
                    const target = allApprovedComments.find(c => c.id === cid);
                    if (target) {
                        if (!target.replies) target.replies = [];
                        target.replies.push(result.reply);
                    }
                    renderGuestbookList();
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

        function renderGuestbookList() {
            const listEl = document.getElementById('gb-messages-list');
            const countEl = document.getElementById('gb-count');
            const titleEl = document.getElementById('gb-title');
            const hintEl = document.getElementById('gb-hint');
            const t = gbI18n[currentGbLang] || gbI18n.zh;
            const clearBtn = document.getElementById('gb-clear-btn');
            if (clearBtn) clearBtn.style.display = currentFrom ? '' : 'none';
            if (titleEl) {
                if (currentFrom) {
                    const startMs = new Date(currentFrom + 'T00:00:00+08:00').getTime();
                    const endD = new Date(startMs + 7 * 24 * 60 * 60 * 1000);
                    const endStr = endD.getFullYear() + '-' + String(endD.getMonth() + 1).padStart(2, '0') + '-' + String(endD.getDate()).padStart(2, '0');
                    titleEl.textContent = t.searchTitlePrefix + currentFrom + ' ~ ' + endStr;
                } else {
                    titleEl.textContent = t.listTitle;
                }
            }
            if (countEl) countEl.innerText = gbTotal;
            if (hintEl) {
                hintEl.textContent = currentFrom
                    ? (currentCapped ? t.hintWeekCapped.replace('{total}', gbTotal) : '')
                    : (currentCapped ? t.hintCapped.replace('{total}', gbTotal) : '');
            }

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
                    localPending = arr.filter(x => x.articleId === 'guestbook' && !allApprovedComments.some(a => a.content === x.content));
                }
            } catch(e) {}

            let html = '';
            if (localPending.length > 0) {
                html += localPending.map((c, i) => 
                    '<div class="msg-card" style="background:#fffbeb; border:1px dashed #f59e0b;">' +
                        '<div class="msg-head">' +
                            '<div style="display:flex; align-items:center; gap:8px;">' +
                                '<span class="msg-author" style="color:#b45309;">' + escapeHtml(c.author || '我') + '</span>' +
                                '<span style="font-size:0.75rem; background:#fef3c7; color:#92400e; padding:1px 6px; border-radius:4px;">🟡 待审核（已成功接收）</span>' +
                                '<button type="button" onclick="removePendingComment(' + i + ')" style="font-size:0.72rem; background:transparent; border:1px solid #d97706; color:#b45309; border-radius:4px; padding:1px 6px; cursor:pointer;" title="从本地移除此待审核留言">🗑️ 移除</button>' +
                            '</div>' +
                            '<span class="msg-date" style="color:#b45309;">' + escapeHtml(c.createdAt || '') + '</span>' +
                        '</div>' +
                        '<div class="msg-content">' + escapeHtml(c.content || '') + '</div>' +
                    '</div>'
                ).join('');
            }

            const sorted = getSortedList(allApprovedComments);
            if (sorted.length === 0 && localPending.length === 0) {
                const emptyMsg = currentFrom ? '该时间段内暂无公开留言，可尝试查找其他日期。' : '暂无公开留言，欢迎成为第一个交流的读者。';
                listEl.innerHTML = '<div style="background:var(--bg-card); border:1px dashed var(--border); border-radius:6px; padding:32px; text-align:center; color:var(--text-light); font-size:0.88rem;">' + emptyMsg + '</div>';
                return;
            }

            html += sorted.map(c => {
                const replies = Array.isArray(c.replies) ? c.replies : [];
                const repCount = replies.length;
                const isCapped = repCount >= 5;
                const cLiked = isLiked(c.id);

                let repliesHtml = '';
                if (repCount > 0) {
                    repliesHtml += '<div class="reply-box">';
                    repliesHtml += replies.map(r => {
                        const isAuthor = (r.author === '维托里奥 崔' || r.author === 'Vittorio Cui');
                        const rLiked = isLiked(r.id);
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
                                '<button type="button" class="action-btn' + (rLiked ? ' liked' : '') + '" onclick="toggleLike(\\'' + c.id + '\\', \\'' + r.id + '\\')">' +
                                    '👍 <span id="like-' + r.id + '">' + (r.likes || 0) + '</span>' +
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
                    replyBtn = '<button type="button" class="action-btn" onclick="toggleReplyForm(\\'' + c.id + '\\')">💬 回复 (' + repCount + '/5)</button>';
                }

                const repForm = '<div id="rep-form-' + c.id + '" class="reply-input-panel" style="display:none;">' +
                    '<div style="margin-bottom:8px;">' +
                        '<input type="text" id="rep-author-' + c.id + '" placeholder="您的称呼 (选填，默认: 匿名读者)" style="width:100%; box-sizing:border-box; padding:6px 10px; font-size:0.84rem; border:1px solid var(--border); border-radius:4px; background:var(--bg-page); color:var(--text-main);" />' +
                    '</div>' +
                    '<div style="margin-bottom:6px;">' +
                        '<textarea id="rep-content-' + c.id + '" rows="2" placeholder="写下您的回复...（中文 ≤ 140字 / 英文 ≤ 200词）" style="width:100%; box-sizing:border-box; padding:8px 10px; font-size:0.86rem; border:1px solid var(--border); border-radius:4px; background:var(--bg-page); color:var(--text-main); font-family:var(--font-sans); resize:vertical;"></textarea>' +
                    '</div>' +
                    '<div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">' +
                        '<span id="rep-status-' + c.id + '" style="font-size:0.78rem;"></span>' +
                        '<div style="display:flex; gap:8px;">' +
                            '<button type="button" onclick="toggleReplyForm(\\'' + c.id + '\\')" class="action-btn">取消</button>' +
                            '<button type="button" id="rep-btn-' + c.id + '" onclick="submitReply(\\'' + c.id + '\\')" style="background:var(--accent); color:white; border:none; border-radius:4px; padding:4px 14px; font-size:0.82rem; font-weight:500; cursor:pointer;">发表回复</button>' +
                        '</div>' +
                    '</div>' +
                '</div>';

                return '<div class="msg-card">' +
                    '<div class="msg-head">' +
                        '<div>' +
                            '<span class="msg-author">' + escapeHtml(c.author || '匿名读者') + '</span>' +
                            (c.articleTitle ? '<span style="font-size:0.75rem; color:var(--text-light); margin-left:8px;">(' + escapeHtml(c.articleTitle) + ')</span>' : '') +
                        '</div>' +
                        '<span class="msg-date">' + escapeHtml(c.createdAt || '') + '</span>' +
                    '</div>' +
                    '<div class="msg-content">' + escapeHtml(c.content || '') + '</div>' +
                    repliesHtml +
                    '<div style="display:flex; justify-content:space-between; align-items:center; margin-top:12px; padding-top:8px; border-top:1px dashed var(--border);">' +
                        '<div style="display:flex; gap:10px; align-items:center;">' +
                            '<button type="button" class="action-btn' + (cLiked ? ' liked' : '') + '" onclick="toggleLike(\\'' + c.id + '\\')">' +
                                '👍 赞同 (<span id="like-' + c.id + '">' + (c.likes || 0) + '</span>)' +
                            '</button>' +
                            replyBtn +
                        '</div>' +
                    '</div>' +
                    repForm +
                '</div>';
            }).join('');

            listEl.innerHTML = html;
        }

        async function searchByWeek() {
            const input = document.getElementById('gb-week-from');
            const status = document.getElementById('gb-search-status');
            const val = input && input.value;
            if (!val) {
                if (status) {
                    status.style.color = '#dc3545';
                    status.innerText = '请先选择起始日期';
                }
                return;
            }
            if (status) {
                status.style.color = 'var(--text-light)';
                status.innerText = '查找中...';
            }
            currentFrom = val;
            await loadGuestbookMessages();
            if (status) status.innerText = '';
        }

        function clearWeekSearch() {
            currentFrom = null;
            const input = document.getElementById('gb-week-from');
            if (input) input.value = '';
            loadGuestbookMessages();
        }

        function shiftWeek(dir) {
            const input = document.getElementById('gb-week-from');
            if (!input) return;
            const base = currentFrom || input.value || new Date().toISOString().slice(0, 10);
            const ms = new Date(base + 'T00:00:00+08:00').getTime() + dir * 7 * 24 * 60 * 60 * 1000;
            const d = new Date(ms);
            input.value = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
            searchByWeek();
        }

        function removePendingComment(idx) {
            try {
                let raw = localStorage.getItem('my_pending_comments');
                if (raw) {
                    let arr = JSON.parse(raw);
                    let guestbookPending = arr.filter(x => x.articleId === 'guestbook' && !allApprovedComments.some(a => a.content === x.content));
                    const target = guestbookPending[idx];
                    if (target) {
                        arr = arr.filter(x => x !== target && x.content !== target.content);
                        localStorage.setItem('my_pending_comments', JSON.stringify(arr));
                    }
                    renderComments();
                }
            } catch(e) {}
        }

        async function handleGuestbookSubmit(e) {
            e.preventDefault();
            const authorInput = document.getElementById('gb-author');
            const contentInput = document.getElementById('gb-content');
            const statusMsg = document.getElementById('gb-status-msg');
            const btn = document.getElementById('gb-submit-btn');

            const author = (authorInput && authorInput.value.trim()) || '匿名读者';
            const content = (contentInput && contentInput.value.trim()) || '';
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
                    body: JSON.stringify({
                        articleId: 'guestbook',
                        articleTitle: '全站公开留言板',
                        author: author,
                        content: content
                    })
                });
                const result = await res.json();
                if (result.success) {
                    try {
                        const raw = localStorage.getItem('my_pending_comments') || '[]';
                        const arr = JSON.parse(raw);
                        arr.unshift({
                            articleId: 'guestbook',
                            author: author,
                            content: content,
                            createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
                        });
                        localStorage.setItem('my_pending_comments', JSON.stringify(arr.slice(0, 20)));
                    } catch(e) {}
                    contentInput.value = '';
                    const counter = document.getElementById('gb-counter');
                    if (counter) counter.innerText = '已输入: 0 汉字, 0 单词';
                    statusMsg.style.color = '#28a745';
                    statusMsg.innerText = '✓ ' + (result.message || '留言已成功提交，待管理员审核通过后公开展示。');
                    loadGuestbookMessages();
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

        const gbContentEl = document.getElementById('gb-content');
        if (gbContentEl) {
            gbContentEl.addEventListener('input', function() {
                const val = this.value;
                const zh = (val.match(/[一-龥]/g) || []).length;
                const en = (val.replace(/[一-龥]/g, ' ').match(/[a-zA-Z0-9_\-]+/g) || []).length;
                const counter = document.getElementById('gb-counter');
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

        async function loadGuestbookMessages() {
            const listEl = document.getElementById('gb-messages-list');
            try {
                let url = '/api/comments';
                if (currentFrom) url += '?from=' + encodeURIComponent(currentFrom);
                const res = await fetch(url);
                const data = await res.json();
                if (Array.isArray(data)) {
                    allApprovedComments = data;
                    gbTotal = data.length;
                    currentCapped = false;
                } else {
                    allApprovedComments = Array.isArray(data.items) ? data.items : [];
                    gbTotal = (typeof data.total === 'number') ? data.total : allApprovedComments.length;
                    currentFrom = data.from || null;
                    currentCapped = !!data.capped;
                }
                renderGuestbookList();
            } catch (e) {
                listEl.innerHTML = '<div style="font-size:0.85rem; color:var(--text-light);">加载留言失败，请刷新重试</div>';
            }
        }

        (function initGuestbook() {
            let savedLang = 'zh';
            try {
                savedLang = localStorage.getItem('preferredLang') || (document.cookie.match(/preferredLang=([^;]+)/) ? RegExp.$1 : 'zh');
            } catch(e) {}
            if (savedLang !== 'zh' && savedLang !== 'en') savedLang = 'zh';
            applyGbLang(savedLang);

            const initial = window.__INITIAL_GUESTBOOK__;
            if (initial && Array.isArray(initial.items)) {
                allApprovedComments = initial.items;
                gbTotal = (typeof initial.total === 'number') ? initial.total : initial.items.length;
                currentCapped = !!initial.capped;
                renderGuestbookList();
            } else {
                loadGuestbookMessages();
            }
        })();
    </script>
</body>
</html>`;
}

/**
 * 2. 独立工作经历页面 HTML (GET /experience)
 */
export { renderGuestbookHtml };