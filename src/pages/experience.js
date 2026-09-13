import { COMMON_CSS } from "./common.js";
import { DEFAULT_EXPERIENCES, DEFAULT_PROFILE } from "../seed-data.js";

import { CONFIG } from "../config.js";
import { escapeHtml, formatExpText } from "../util.js";

// GET /experience
function renderExperienceHtml(profile) {
  profile = profile || DEFAULT_PROFILE;
  const exps = (profile.experiences && Array.isArray(profile.experiences) && profile.experiences.length > 0)
    ? profile.experiences
    : DEFAULT_EXPERIENCES;

  const expDataJson = JSON.stringify(exps.map((e, idx) => ({
    id: idx,
    company: e.company || '',
    roleZh: e.role ? ('· ' + e.role) : '',
    roleEn: (e.roleEn || e.role) ? ('· ' + (e.roleEn || e.role)) : '',
    period: e.period || '',
    detailsZh: formatExpText(e.details || ''),
    detailsEn: formatExpText(e.detailsEn || e.details || '')
  })));

  const expCardsHtml = exps.map((exp, idx) => `
        <div class="exp-card">
            <div class="exp-card-header">
                <div>
                    <span class="exp-company">${escapeHtml(exp.company || '')}</span>
                    <span class="exp-role-title" id="exp-card-role-${idx}">${exp.role ? ('· ' + escapeHtml(exp.role)) : ''}</span>
                </div>
                <span class="exp-period">${escapeHtml(exp.period || '')}</span>
            </div>
            <div class="exp-detail-text" id="exp-card-desc-${idx}">
                ${formatExpText(exp.details || '')}
            </div>
        </div>
  `).join('\n');

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>工作经历 (Work Experience) — ${escapeHtml(profile.nameZh)}</title>
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
        .page-header { margin-bottom: 30px; }
        .page-title {
            font-family: var(--font-serif);
            font-size: 2.1rem;
            font-weight: 500;
            margin-bottom: 8px;
            color: var(--text-main);
        }
        .page-subtitle {
            color: var(--text-muted);
            font-size: 0.96rem;
            line-height: 1.65;
        }
        .exp-card {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 6px;
            padding: 22px 24px;
            margin-bottom: 20px;
        }
        .exp-card-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 6px;
            flex-wrap: wrap;
            gap: 8px;
        }
        .exp-company {
            font-size: 1.15rem;
            font-weight: 600;
            color: var(--text-main);
        }
        .exp-role-title {
            font-weight: 500;
            color: var(--accent);
            margin-left: 6px;
        }
        .exp-period {
            font-family: var(--font-mono);
            font-size: 0.85rem;
            color: var(--text-light);
        }
        .exp-detail-text {
            font-size: 0.92rem;
            line-height: 1.7;
            color: var(--text-main);
        }
        .exp-detail-text p { margin-bottom: 8px; }
        .exp-detail-text ul { padding-left: 18px; list-style: disc; }
        .exp-detail-text li { margin-bottom: 6px; }
        .clients-box {
            background: var(--bg-subtle);
            border: 1px solid var(--border);
            border-radius: 6px;
            padding: 18px 20px;
            margin-top: 24px;
        }
        .clients-title {
            font-weight: 600;
            font-size: 0.95rem;
            margin-bottom: 8px;
            color: var(--text-main);
        }
        .edu-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.92rem;
            margin-top: 10px;
        }
        .edu-table td { padding: 6px 0; }
        .edu-label { width: 130px; color: var(--text-muted); font-style: italic; }
    </style>
</head>
<body>
    <div class="container">
        <div class="top-nav-bar">
            <a href="/" class="back-btn" id="exp-back-btn">← 返回主页</a>
            <div style="display:flex; gap:14px; align-items:center;">
                <a href="/articles" id="exp-nav-articles" style="font-size:0.88rem; color:var(--accent); text-decoration:underline;">文章</a>
                <a href="/guestbook" id="exp-nav-guestbook" style="font-size:0.88rem; color:var(--accent); text-decoration:underline;">留言板</a>
                <a href="/admin" id="exp-nav-admin" class="admin-link">[管理员登录]</a>
                <button type="button" class="lang-switch-btn" onclick="toggleExpLang()" id="btn-exp-lang-toggle">English</button>
            </div>
        </div>

        <header class="page-header">
            <h1 class="page-title" id="exp-page-title">工作经历与工程履历</h1>
            <p class="page-subtitle" id="exp-page-subtitle">
                <strong>${escapeHtml(profile.nameZh)} (${escapeHtml(profile.nameEn)})</strong> · ${escapeHtml(profile.positionZh)}。<br>
                ${escapeHtml(profile.introZh)}
            </p>
        </header>

        ${expCardsHtml}

        <!-- 战略级客户服务履历 -->
        <div class="clients-box">
            <div class="clients-title" id="exp-clients-title">🏛️ 深度赋能的重要机构与客户</div>
            <p style="font-size:0.9rem; color:var(--text-muted); line-height:1.6;" id="exp-clients-desc">
                ${escapeHtml(profile.clientsZh)}
            </p>
        </div>

        <hr />

        <!-- 教育背景 -->
        <section>
            <h2 class="sec-title" id="exp-edu-title">教育背景 (Education)</h2>
            <div style="font-size:0.92rem; color:var(--text-main); margin-top:10px; line-height:1.8;" id="exp-edu-desc">
                <strong>${escapeHtml(profile.eduZh)}</strong>
            </div>
        </section>

        <footer>
            <a href="/" class="back-btn" id="exp-footer-back">← 返回主页</a>
            <a href="/admin" class="admin-link" id="exp-footer-admin">[管理员登录]</a>
        </footer>
    </div>

    <script>
        const EXPS = ${expDataJson};
        let currentExpLang = 'zh';

        const expI18n = {
            zh: {
                pageTitle: "工作经历与工程履历",
                docTitle: "工作经历 (Work Experience) — " + ${JSON.stringify(profile.nameZh)},
                subtitleHtml: "<strong>" + ${JSON.stringify(profile.nameZh)} + " (" + ${JSON.stringify(profile.nameEn)} + ")</strong> · " + ${JSON.stringify(profile.positionZh)} + "。<br>" + ${JSON.stringify(profile.introZh)},
                clientsTitle: "🏛️ 深度赋能的重要机构与客户",
                clientsDesc: ${JSON.stringify(profile.clientsZh)},
                eduTitle: "教育背景 (Education)",
                eduDesc: "<strong>" + ${JSON.stringify(profile.eduZh)} + "</strong>",
                backHome: "← 返回主页",
                navArticles: "文章",
                navGuestbook: "留言板",
                navAdmin: "[管理员登录]",
                toggleText: "English"
            },
            en: {
                pageTitle: "Work Experience & Engineering Track Record",
                docTitle: "Work Experience — " + ${JSON.stringify(profile.nameEn)},
                subtitleHtml: "<strong>" + ${JSON.stringify(profile.nameEn)} + " (" + ${JSON.stringify(profile.nameZh)} + ")</strong> · " + ${JSON.stringify(profile.positionEn)} + "。<br>" + ${JSON.stringify(profile.introEn)},
                clientsTitle: "🏛️ Key Institutions & Strategic Clients Empowered",
                clientsDesc: ${JSON.stringify(profile.clientsEn)},
                eduTitle: "Education Background",
                eduDesc: "<strong>" + ${JSON.stringify(profile.eduEn)} + "</strong>",
                backHome: "← Back to Home",
                navArticles: "Articles",
                navGuestbook: "Guestbook",
                navAdmin: "[Admin Login]",
                toggleText: "中文"
            }
        };

        function toggleExpLang() {
            applyExpLang(currentExpLang === 'zh' ? 'en' : 'zh');
        }

        function applyExpLang(lang) {
            currentExpLang = lang;
            try {
                localStorage.setItem('preferredLang', lang);
                localStorage.setItem('site_lang', lang);
            } catch(e) {}
            document.cookie = "preferredLang=" + lang + "; Path=/; Max-Age=31536000; SameSite=Lax";

            const t = expI18n[lang] || expI18n.zh;
            document.title = t.docTitle;
            const btn = document.getElementById('btn-exp-lang-toggle');
            if (btn) btn.innerText = t.toggleText;

            const pageTitleEl = document.getElementById('exp-page-title');
            if (pageTitleEl) pageTitleEl.innerText = t.pageTitle;
            const subTitleEl = document.getElementById('exp-page-subtitle');
            if (subTitleEl) subTitleEl.innerHTML = t.subtitleHtml;

            const clientsTitleEl = document.getElementById('exp-clients-title');
            if (clientsTitleEl) clientsTitleEl.innerText = t.clientsTitle;
            const clientsDescEl = document.getElementById('exp-clients-desc');
            if (clientsDescEl) clientsDescEl.innerText = t.clientsDesc;

            const eduTitleEl = document.getElementById('exp-edu-title');
            if (eduTitleEl) eduTitleEl.innerText = t.eduTitle;
            const eduDescEl = document.getElementById('exp-edu-desc');
            if (eduDescEl) eduDescEl.innerHTML = t.eduDesc;

            const backBtn = document.getElementById('exp-back-btn');
            if (backBtn) backBtn.innerText = t.backHome;
            const footerBack = document.getElementById('exp-footer-back');
            if (footerBack) footerBack.innerText = t.backHome;

            const navArt = document.getElementById('exp-nav-articles');
            if (navArt) navArt.innerText = t.navArticles;
            const navGb = document.getElementById('exp-nav-guestbook');
            if (navGb) navGb.innerText = t.navGuestbook;
            const navAdm = document.getElementById('exp-nav-admin');
            if (navAdm) navAdm.innerText = t.navAdmin;
            const footerAdm = document.getElementById('exp-footer-admin');
            if (footerAdm) footerAdm.innerText = t.navAdmin;

            EXPS.forEach(exp => {
                const roleEl = document.getElementById('exp-card-role-' + exp.id);
                if (roleEl) roleEl.innerText = lang === 'en' ? exp.roleEn : exp.roleZh;
                const descEl = document.getElementById('exp-card-desc-' + exp.id);
                if (descEl) descEl.innerHTML = lang === 'en' ? exp.detailsEn : exp.detailsZh;
            });
        }

        window.addEventListener('DOMContentLoaded', () => {
            let savedLang = 'zh';
            try {
                savedLang = localStorage.getItem('preferredLang') || (document.cookie.match(/preferredLang=([^;]+)/) ? RegExp.$1 : 'zh');
            } catch(e) {}
            if (savedLang !== 'zh' && savedLang !== 'en') savedLang = 'zh';
            applyExpLang(savedLang);
        });
    </script>
</body>
</html>`;
}

/**
 * 3. 极简主页 HTML (GET /)
 * 首页不显示文章，仅展示“关于我”与“经历”
 */
export { renderExperienceHtml };