import { COMMON_CSS } from "./common.js";
import { DEFAULT_EXPERIENCES, DEFAULT_PROFILE } from "../seed-data.js";

import { CONFIG } from "../config.js";
import { escapeHtml, formatExpText, safeJsonForScript } from "../util.js";

// GET /
function renderPublicHtml(profile) {
  profile = profile || DEFAULT_PROFILE;
  const exps = (profile.experiences && Array.isArray(profile.experiences) && profile.experiences.length > 0)
    ? profile.experiences
    : DEFAULT_EXPERIENCES;

  const homeExpCardsHtml = exps.map((exp, idx) => `
                <div class="exp-item" id="exp-item-${idx}">
                    <div class="exp-head">
                        <div>
                            <span class="exp-company" id="exp-company-${idx}">${escapeHtml(exp.company || '')}</span>
                            <span class="exp-role-badge" id="exp-role-${idx}">${exp.role ? ('· ' + escapeHtml(exp.role)) : ''}</span>
                        </div>
                        <span class="exp-date" id="exp-period-${idx}">${escapeHtml(exp.period || '')}</span>
                    </div>
                    <div class="exp-desc" id="exp-desc-${idx}">
                        ${formatExpText(exp.details || '')}
                    </div>
                </div>
  `).join('\n');

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(profile.nameZh)} — ${escapeHtml(profile.positionZh)}</title>
    <style>
        ${COMMON_CSS}

        /* 顶部右上角语言切换栏 */
        .top-actions-bar {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            margin-bottom: 18px;
        }
        .lang-switch-btn {
            font-size: 0.85rem;
            color: var(--accent);
            text-decoration: underline;
            cursor: pointer;
            font-weight: 500;
            background: none;
            border: none;
            font-family: var(--font-sans);
        }
        .lang-switch-btn:hover {
            color: var(--accent-hover);
        }

        /* Header 头部双栏布局 */
        .header-box {
            display: flex;
            align-items: flex-start;
            gap: 28px;
            margin-bottom: 24px;
        }
        .avatar-img {
            width: 130px;
            height: 170px;
            object-fit: cover;
            border-radius: 4px;
            border: 1px solid var(--border);
            box-shadow: 0 2px 6px rgba(0,0,0,0.04);
            flex-shrink: 0;
        }
        .header-content {
            flex: 1;
        }
        .header-title-row {
            margin-bottom: 10px;
        }
        .author-name {
            font-family: var(--font-serif);
            font-size: 2.2rem;
            font-weight: 500;
            letter-spacing: -0.02em;
            color: var(--text-main);
        }
        .header-intro {
            font-size: 0.95rem;
            color: var(--text-muted);
            line-height: 1.68;
            margin-bottom: 14px;
        }
        .header-links {
            display: flex;
            align-items: center;
            gap: 18px;
            font-size: 0.95rem;
        }
        .header-link {
            color: var(--accent);
            text-decoration: underline;
            font-weight: 500;
            cursor: pointer;
        }
        .header-link:hover {
            color: var(--accent-hover);
        }

        /* 关于我 Key-Value 表格 */
        .info-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.92rem;
        }
        .info-table tr td {
            padding: 5px 0;
            vertical-align: top;
        }
        .info-label {
            width: 135px;
            font-style: italic;
            color: var(--text-muted);
            white-space: nowrap;
        }
        .info-value {
            color: var(--text-main);
        }

        /* 经历项 */
        .exp-item {
            margin-bottom: 22px;
            padding-bottom: 18px;
            border-bottom: 1px dashed var(--border);
        }
        .exp-item:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }
        .exp-head {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            flex-wrap: wrap;
            gap: 6px;
            margin-bottom: 4px;
        }
        .exp-company {
            font-weight: 600;
            font-size: 1.02rem;
            color: var(--text-main);
        }
        .exp-role-badge {
            color: var(--accent);
            font-weight: 500;
            font-size: 0.9rem;
            margin-left: 6px;
        }
        .exp-date {
            font-family: var(--font-mono);
            font-size: 0.8rem;
            color: var(--text-light);
        }
        .exp-desc {
            font-size: 0.88rem;
            color: var(--text-muted);
            line-height: 1.68;
            margin-top: 6px;
        }
        .exp-desc p { margin-bottom: 6px; }
        .exp-desc ul { padding-left: 18px; list-style: disc; }
        .exp-desc li { margin-bottom: 5px; }

        @media (max-width: 600px) {
            .header-box { flex-direction: column; align-items: flex-start; gap: 16px; }
            .avatar-img { width: 110px; height: 145px; }
            .info-label { width: 115px; }
        }
    </style>
</head>
<body>
    <div class="container">

        <!-- 0. 右上角：中英文切换 -->
        <div class="top-actions-bar">
            <button class="lang-switch-btn" onclick="toggleLanguage()" id="btn-lang-toggle">English / 中文</button>
        </div>

        <!-- 1. 顶部 Header -->
        <header class="header-box">
            <img class="avatar-img" src="data:image/jpeg;base64,${CONFIG.avatarBase64}" alt="维托里奥 崔" />
            
            <div class="header-content">
                <div class="header-title-row">
                    <h1 class="author-name" id="author-display-name">${escapeHtml(profile.nameZh)}</h1>
                </div>
                
                <p class="header-intro" id="header-intro-text">
                    ${escapeHtml(profile.introZh)}
                </p>

                <!-- 导航：文章、Email 与 留言板 -->
                <div class="header-links">
                    <a class="header-link" href="/articles" id="link-articles">文章</a>
                    <a class="header-link" href="mailto:${escapeHtml(profile.email)}" id="link-email">Email</a>
                    <a class="header-link" href="/guestbook" id="link-guestbook">留言板</a>
                </div>
            </div>
        </header>

        <hr />

        <!-- 2. 先是：关于我 (About Me) -->
        <section id="about-section">
            <h2 class="sec-title" id="title-about">关于我</h2>
            <table class="info-table">
                <tbody>
                    <tr>
                        <td class="info-label" id="lbl-pos">职位:</td>
                        <td class="info-value" id="val-position">${escapeHtml(profile.positionZh)}</td>
                    </tr>
                    <tr>
                        <td class="info-label" id="lbl-focus">核心领域:</td>
                        <td class="info-value" id="val-focus" style="font-weight:500;">${escapeHtml(profile.focusZh)}</td>
                    </tr>
                    <tr>
                        <td class="info-label" id="lbl-tech">技术栈:</td>
                        <td class="info-value" id="val-tech">${escapeHtml(profile.techZh)}</td>
                    </tr>
                    <tr>
                        <td class="info-label" id="lbl-edu">教育背景:</td>
                        <td class="info-value" id="val-education">${escapeHtml(profile.eduZh)}</td>
                    </tr>
                    <tr>
                        <td class="info-label" id="lbl-lang">日常语言:</td>
                        <td class="info-value" id="val-languages">${escapeHtml(profile.langZh)}</td>
                    </tr>
                    <tr>
                        <td class="info-label" id="lbl-email">联系邮箱:</td>
                        <td class="info-value"><a href="mailto:${escapeHtml(profile.email)}" id="val-email-link">${escapeHtml(profile.email)}</a></td>
                    </tr>
                </tbody>
            </table>
        </section>

        <hr />

        <!-- 3. 再是：经历 (Experience) -->
        <section id="experience-section">
            <h2 class="sec-title">
                <span id="title-experience">经历</span>
                <a href="/experience" class="more-link" id="link-full-exp">完整工作履历与客户详情 →</a>
            </h2>
            <div id="experience-list">
${homeExpCardsHtml}
            </div>
        </section>

        <!-- 4. 页脚：左侧版权，右下角管理员登录入口 -->
        <footer>
            <span id="footer-copyright">© 2026 ${escapeHtml(profile.nameZh)} · All Rights Reserved</span>
            <a href="/admin" class="admin-link" id="link-admin-login">[管理员登录]</a>
        </footer>

    </div>

    <script>
        let currentLang = 'zh';

        const i18n = {
            zh: {
                displayName: ${safeJsonForScript(profile.nameZh)},
                intro: ${safeJsonForScript(profile.introZh)},
                linkArticles: "文章",
                linkGuestbook: "留言板",
                linkAdmin: "[管理员登录]",
                titleAbout: "关于我",
                lblPos: "职位:",
                lblFocus: "核心领域:",
                lblTech: "技术栈:",
                lblEdu: "教育背景:",
                lblLang: "日常语言:",
                lblEmail: "联系邮箱:",
                titleExperience: "经历",
                linkFullExp: "完整工作履历与客户详情 →",
                valPosition: ${safeJsonForScript(profile.positionZh)},
                valFocus: ${safeJsonForScript(profile.focusZh)},
                valTech: ${safeJsonForScript(profile.techZh)},
                valEducation: ${safeJsonForScript(profile.eduZh)},
                valLanguages: ${safeJsonForScript(profile.langZh)},
                experiences: ${safeJsonForScript(exps.map(e => ({
                  role: e.role ? ('· ' + e.role) : '',
                  detailsHtml: formatExpText(e.details || '')
                })))},
                footerCopyright: "© 2026 " + ${safeJsonForScript(profile.nameZh)} + " · All Rights Reserved"
            },
            en: {
                displayName: ${safeJsonForScript(profile.nameEn)},
                intro: ${safeJsonForScript(profile.introEn)},
                linkArticles: "Articles",
                linkGuestbook: "Guestbook",
                linkAdmin: "[Admin Login]",
                titleAbout: "About Me",
                lblPos: "Position:",
                lblFocus: "Core Focus:",
                lblTech: "Tech Stack:",
                lblEdu: "Education:",
                lblLang: "Languages:",
                lblEmail: "Email:",
                titleExperience: "Experience",
                linkFullExp: "Full work experience & client record →",
                valPosition: ${safeJsonForScript(profile.positionEn)},
                valFocus: ${safeJsonForScript(profile.focusEn)},
                valTech: ${safeJsonForScript(profile.techEn)},
                valEducation: ${safeJsonForScript(profile.eduEn)},
                valLanguages: ${safeJsonForScript(profile.langEn)},
                experiences: ${safeJsonForScript(exps.map(e => ({
                  role: (e.roleEn || e.role) ? ('· ' + (e.roleEn || e.role)) : '',
                  detailsHtml: formatExpText(e.detailsEn || e.details || '')
                })))},
                footerCopyright: "© 2026 " + ${safeJsonForScript(profile.nameEn)} + " · All Rights Reserved"
            }
        };

        function toggleLanguage() {
            applyLanguage(currentLang === 'zh' ? 'en' : 'zh');
        }

        function applyLanguage(lang) {
            currentLang = lang;
            try {
                localStorage.setItem('preferredLang', lang);
                localStorage.setItem('site_lang', lang);
            } catch(e) {}
            document.cookie = "preferredLang=" + lang + "; Path=/; Max-Age=31536000; SameSite=Lax";
            const toggleBtn = document.getElementById('btn-lang-toggle');
            if (toggleBtn) toggleBtn.innerText = lang === 'zh' ? 'English' : '中文';

            const data = i18n[currentLang];
            if (!data) return;
            document.getElementById('author-display-name').innerText = data.displayName;
            document.getElementById('header-intro-text').innerText = data.intro;
            document.getElementById('link-articles').innerText = data.linkArticles;
            document.getElementById('link-guestbook').innerText = data.linkGuestbook;
            document.getElementById('link-admin-login').innerText = data.linkAdmin;
            document.getElementById('title-about').innerText = data.titleAbout;
            document.getElementById('lbl-pos').innerText = data.lblPos;
            document.getElementById('lbl-focus').innerText = data.lblFocus;
            document.getElementById('lbl-tech').innerText = data.lblTech;
            document.getElementById('lbl-edu').innerText = data.lblEdu;
            document.getElementById('lbl-lang').innerText = data.lblLang;
            document.getElementById('lbl-email').innerText = data.lblEmail;
            document.getElementById('title-experience').innerText = data.titleExperience;
            document.getElementById('link-full-exp').innerText = data.linkFullExp;
            document.getElementById('val-position').innerText = data.valPosition;
            document.getElementById('val-focus').innerText = data.valFocus;
            document.getElementById('val-tech').innerText = data.valTech;
            document.getElementById('val-education').innerText = data.valEducation;
            document.getElementById('val-languages').innerText = data.valLanguages;
            if (data.experiences && Array.isArray(data.experiences)) {
                data.experiences.forEach((expItem, idx) => {
                    const roleEl = document.getElementById('exp-role-' + idx);
                    const descEl = document.getElementById('exp-desc-' + idx);
                    if (roleEl) roleEl.innerText = expItem.role || '';
                    if (descEl && expItem.detailsHtml) descEl.innerHTML = expItem.detailsHtml;
                });
            }
            document.getElementById('footer-copyright').innerText = data.footerCopyright;
        }

        window.addEventListener('DOMContentLoaded', () => {
            let savedLang = 'zh';
            try {
                savedLang = localStorage.getItem('preferredLang') || localStorage.getItem('site_lang') || (document.cookie.match(/preferredLang=([^;]+)/) ? RegExp.$1 : 'zh');
            } catch(e) {}
            if (savedLang !== 'zh' && savedLang !== 'en') savedLang = 'zh';
            applyLanguage(savedLang);
        });
    </script>
</body>
</html>`;
}

/**
 * 4. 管理后台登录页面 HTML (/admin)
 */
export { renderPublicHtml };