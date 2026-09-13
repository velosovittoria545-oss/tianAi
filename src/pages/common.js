import { CONFIG } from "../config.js";

// 页面共用 CSS
const COMMON_CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;0,6..72,500;1,6..72,400&display=swap');

    :root {
        --bg-page: #FAF8F5;
        --bg-card: #FFFFFF;
        --bg-subtle: #F3EFEA;
        --text-main: #191919;
        --text-muted: #4A4640;
        --text-light: #7A746C;
        --accent: #CC785C;
        --accent-hover: #b86448;
        --border: #E0D9CE;
        --font-serif: 'Newsreader', Georgia, 'Times New Roman', serif;
        --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        --font-mono: 'JetBrains Mono', Menlo, Monaco, Consolas, monospace;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
        background-color: var(--bg-page);
        color: var(--text-main);
        font-family: var(--font-sans);
        font-size: 15px;
        line-height: 1.68;
        -webkit-font-smoothing: antialiased;
        padding: 36px 20px 80px 20px;
    }
    a { color: var(--accent); text-decoration: underline; transition: color 0.15s; }
    a:hover { color: var(--accent-hover); }
    .container { max-width: 680px; margin: 0 auto; position: relative; }
    hr { border: none; border-top: 1px solid var(--border); margin: 28px 0; }
    .sec-title {
        font-family: var(--font-serif);
        font-size: 1.35rem;
        font-weight: 500;
        color: var(--text-main);
        margin-bottom: 14px;
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        flex-wrap: wrap;
        gap: 8px;
    }
    .sec-title a.more-link {
        font-family: var(--font-sans);
        font-size: 0.85rem;
        font-weight: 400;
        color: var(--accent);
        text-decoration: underline;
    }
    footer {
        margin-top: 48px;
        padding-top: 18px;
        border-top: 1px solid var(--border);
        font-size: 0.82rem;
        color: var(--text-light);
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px;
    }
    .admin-link {
        color: var(--text-light);
        text-decoration: none;
        font-size: 0.82rem;
    }
    .admin-link:hover {
        color: var(--accent);
        text-decoration: underline;
    }
    .reader-content-body img {
        max-width: 100%;
        height: auto;
        border-radius: 6px;
        display: block;
        margin: 18px auto;
        box-shadow: 0 3px 12px rgba(0,0,0,0.05);
    }
    .reader-content-body figure {
        margin: 20px 0;
        text-align: center;
    }
    .reader-content-body figcaption {
        font-family: var(--font-mono);
        font-size: 0.8rem;
        color: var(--text-light);
        margin-top: 6px;
    }

    /* 留言与互动组件样式 (Sorting, Likes & Threaded Replies) */
    .sort-tab-btn {
        background: transparent;
        border: 1px solid var(--border);
        color: var(--text-muted);
        padding: 3px 10px;
        font-size: 0.78rem;
        border-radius: 14px;
        cursor: pointer;
        transition: all 0.15s;
    }
    .sort-tab-btn:hover {
        border-color: var(--accent);
        color: var(--accent);
    }
    .sort-tab-btn.active {
        background: var(--accent);
        color: #ffffff;
        border-color: var(--accent);
        font-weight: 500;
    }
    .action-btn {
        background: transparent;
        border: 1px solid var(--border);
        color: var(--text-muted);
        padding: 3px 9px;
        font-size: 0.78rem;
        border-radius: 4px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        transition: all 0.15s;
    }
    .action-btn:hover {
        border-color: var(--accent);
        color: var(--accent);
    }
    .action-btn.liked {
        background: rgba(204, 120, 92, 0.1);
        border-color: var(--accent);
        color: var(--accent);
        font-weight: 500;
    }
    .action-btn.disabled {
        opacity: 0.6;
        cursor: not-allowed;
        background: var(--bg-subtle);
        border-color: var(--border);
        color: var(--text-light);
    }
    .reply-box {
        margin-top: 10px;
        padding-left: 12px;
        border-left: 2px solid var(--border);
    }
    .reply-item {
        background: var(--bg-subtle);
        border: 1px solid var(--border);
        border-radius: 4px;
        padding: 8px 12px;
        margin-top: 8px;
        font-size: 0.85rem;
    }
    .author-tag {
        background: var(--accent);
        color: #fff;
        font-size: 0.7rem;
        padding: 1px 5px;
        border-radius: 3px;
        margin-left: 6px;
        font-weight: 500;
    }
    .reply-input-panel {
        background: var(--bg-subtle);
        border: 1px dashed var(--border);
        border-radius: 4px;
        padding: 10px 12px;
        margin-top: 10px;
    }
    .top-actions-bar {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        margin-bottom: 16px;
    }
    .lang-switch-btn {
        background: transparent;
        border: 1px solid var(--border);
        color: var(--text-muted);
        padding: 4px 14px;
        border-radius: 999px;
        cursor: pointer;
        font-size: 0.84rem;
        font-family: var(--font-sans);
        font-weight: 500;
        transition: all 0.2s;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 6px;
    }
    .lang-switch-btn:hover {
        border-color: var(--accent);
        color: var(--accent);
        background: rgba(204, 120, 92, 0.06);
    }
`;

/**
 * 1. 独立文章列表页面 HTML (GET /articles)
 */
export { COMMON_CSS };