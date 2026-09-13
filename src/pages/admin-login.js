import { COMMON_CSS } from "./common.js";

import { CONFIG } from "../config.js";

// GET /admin（未登录）
function renderAdminLoginHtml() {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>管理员登录 — 维托里奥 崔</title>
    <style>
        ${COMMON_CSS}
        .login-card {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 6px;
            padding: 36px 40px;
            max-width: 420px;
            margin: 70px auto;
            box-shadow: 0 4px 16px rgba(0,0,0,0.04);
            position: relative;
        }
        .lang-switch-btn {
            position: absolute;
            top: 24px;
            right: 28px;
            font-size: 0.82rem;
            color: var(--accent);
            cursor: pointer;
            text-decoration: underline;
            font-weight: 500;
        }
        .input-box {
            width: 100%;
            padding: 10px 12px;
            margin: 8px 0 16px 0;
            border: 1px solid var(--border);
            border-radius: 4px;
            background: var(--bg-page);
            font-family: var(--font-sans);
            font-size: 0.95rem;
        }
        .btn {
            width: 100%;
            padding: 10px;
            background: var(--accent);
            color: white;
            border: none;
            border-radius: 4px;
            font-weight: 500;
            cursor: pointer;
            font-size: 0.95rem;
        }
        .btn:hover { background: var(--accent-hover); }
    </style>
</head>
<body>
    <div class="login-card">
        <span class="lang-switch-btn" id="admin-lang-toggle" onclick="toggleAdminLang()">English</span>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <h2 id="admin-title" style="font-family:var(--font-serif); font-size:1.65rem; margin:0; color:var(--text-main);">管理员登录</h2>
            <span style="font-size:0.75rem; color:#15803d; background:#f0fdf4; padding:2px 8px; border-radius:12px; border:1px solid #bbf7d0;">🟢 数据库已连通</span>
        </div>
        <p id="admin-subtitle" style="font-size:0.86rem; color:var(--text-light); margin-bottom:22px;">维托里奥 崔 · 个人博客发布系统</p>
        <form id="login-form" onsubmit="handleLogin(event)">
            <label id="lbl-username" style="font-size:0.88rem; color:var(--text-muted);">用户名 / 邮箱 (Username / Email)</label>
            <input type="text" id="username" class="input-box" value="${CONFIG.adminUsername}" autocapitalize="none" autocorrect="off" spellcheck="false" autocomplete="username" required />
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px; margin-bottom:4px;">
                <label id="lbl-password" style="font-size:0.88rem; color:var(--text-muted);">密码 (Password)</label>
                <label style="font-size:0.8rem; color:var(--text-light); cursor:pointer; user-select:none; display:flex; align-items:center; gap:4px;">
                    <input type="checkbox" id="toggle-pwd-chk" onchange="togglePasswordVisibility()" style="cursor:pointer;" />
                    <span id="lbl-show-pwd">显示密码</span>
                </label>
            </div>
            <div style="position:relative; margin-bottom:16px;">
                <input type="password" id="password" class="input-box" style="margin:0; padding-right:42px;" placeholder="请输入管理员密码" autocapitalize="none" autocorrect="off" spellcheck="false" autocomplete="current-password" required />
                <button type="button" onclick="togglePasswordVisibility()" id="btn-toggle-eye" style="position:absolute; right:10px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; font-size:1.1rem; padding:4px; color:var(--text-light); line-height:1;" title="显示/隐藏密码">👁️</button>
            </div>
            <div id="login-err" style="color:#d9534f; font-size:0.85rem; margin-bottom:12px; display:none;"></div>
            <button type="submit" class="btn" id="login-btn">登录后台</button>
            <div style="margin-top:18px; text-align:center;">
                <a href="/" id="link-back-home" style="font-size:0.85rem; color:var(--text-light);">← 返回主页</a>
            </div>
        </form>
    </div>
    <script>
        let adminLang = 'zh';
        const adminI18n = {
            zh: {
                title: "管理员登录",
                pageTitle: "管理员登录 — 维托里奥 崔",
                subtitle: "维托里奥 崔 · 个人博客发布系统",
                lblUser: "用户名 (Username)",
                lblPass: "密码 (Password)",
                showPass: "显示密码",
                passPlaceholder: "请输入管理员密码",
                btnText: "登录后台",
                btnVerifying: "正在验证...",
                backText: "← 返回主页",
                errAuth: "用户名或密码错误，请重试",
                errNet: "网络请求失败：",
                langToggle: "English"
            },
            en: {
                title: "Administrator Login",
                pageTitle: "Admin Login — Vittorio Cui",
                subtitle: "Vittorio Cui · Personal Publishing System",
                lblUser: "Username",
                lblPass: "Password",
                showPass: "Show Password",
                passPlaceholder: "Enter admin password",
                btnText: "Sign In",
                btnVerifying: "Verifying...",
                backText: "← Back to Home",
                errAuth: "Invalid username or password. Please try again.",
                errNet: "Network error: ",
                langToggle: "中文"
            }
        };

        function togglePasswordVisibility() {
            const input = document.getElementById('password');
            const chk = document.getElementById('toggle-pwd-chk');
            const eye = document.getElementById('btn-toggle-eye');
            const isPass = input.type === 'password';
            input.type = isPass ? 'text' : 'password';
            if (chk) chk.checked = isPass;
            if (eye) eye.innerText = isPass ? '🙈' : '👁️';
        }

        function toggleAdminLang() {
            applyAdminLang(adminLang === 'zh' ? 'en' : 'zh');
        }

        function applyAdminLang(lang) {
            adminLang = lang;
            try {
                localStorage.setItem('preferredLang', lang);
                localStorage.setItem('site_lang', lang);
            } catch(e) {}
            document.cookie = "preferredLang=" + lang + "; Path=/; Max-Age=31536000; SameSite=Lax";

            const d = adminI18n[lang] || adminI18n.zh;
            document.title = d.pageTitle;
            const titleEl = document.getElementById('admin-title');
            if (titleEl) titleEl.innerText = d.title;
            const subTitleEl = document.getElementById('admin-subtitle');
            if (subTitleEl) subTitleEl.innerText = d.subtitle;
            const lblUser = document.getElementById('lbl-username');
            if (lblUser) lblUser.innerText = d.lblUser;
            const lblPass = document.getElementById('lbl-password');
            if (lblPass) lblPass.innerText = d.lblPass;
            const lblShowPwd = document.getElementById('lbl-show-pwd');
            if (lblShowPwd) lblShowPwd.innerText = d.showPass;
            const btnEye = document.getElementById('btn-toggle-eye');
            if (btnEye) btnEye.title = d.showPass;
            const pwdInput = document.getElementById('password');
            if (pwdInput) pwdInput.placeholder = d.passPlaceholder;
            const loginBtn = document.getElementById('login-btn');
            if (loginBtn) loginBtn.innerText = d.btnText;
            const backHome = document.getElementById('link-back-home');
            if (backHome) backHome.innerText = d.backText;
            const toggleBtn = document.getElementById('admin-lang-toggle');
            if (toggleBtn) toggleBtn.innerText = d.langToggle;
        }

        window.addEventListener('DOMContentLoaded', () => {
            let savedLang = 'zh';
            try {
                savedLang = localStorage.getItem('preferredLang') || (document.cookie.match(/preferredLang=([^;]+)/) ? RegExp.$1 : 'zh');
            } catch(e) {}
            if (savedLang !== 'zh' && savedLang !== 'en') savedLang = 'zh';
            applyAdminLang(savedLang);
        });

        async function handleLogin(e) {
            e.preventDefault();
            const u = document.getElementById('username').value;
            const p = document.getElementById('password').value.trim();
            const btn = document.getElementById('login-btn');
            const err = document.getElementById('login-err');
            const d = adminI18n[adminLang];
            btn.disabled = true;
            btn.innerText = d.btnVerifying;
            try {
                const res = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: u, password: p })
                });
                const data = await res.json();
                if (data.success) {
                    // 令牌已由服务端写入 HttpOnly cookie，前端不接触它，直接跳转即可
                    window.location.href = '/admin';
                } else {
                    err.style.display = 'block';
                    err.innerText = d.errAuth;
                    btn.disabled = false;
                    btn.innerText = d.btnText;
                }
            } catch(ex) {
                err.style.display = 'block';
                err.innerText = d.errNet + ex.message;
                btn.disabled = false;
                btn.innerText = d.btnText;
            }
        }

        // 登录页主动清理历史遗留的本地令牌（旧版本会把 token 存在这两个地方）
        try {
            localStorage.removeItem('tianai_token');
            sessionStorage.removeItem('tianai_token');
        } catch(e) {}
    </script>
</body>
</html>`;
}

/**
 * 5. 管理后台 CMS 主界面 HTML (/admin 登录后)
 */
export { renderAdminLoginHtml };