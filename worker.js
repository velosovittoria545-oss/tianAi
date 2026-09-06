/**
 * ═════════════════════════════════════════════════════════════════════════════
 * 项目名称: TianAi (天艾) — Vittorio Cui 个人主页与文章系统
 * 设计哲学: 经典学术/工程极简主义 (致敬李新野风格，左侧肖像 + 右侧精炼定位 + 结构化档案表)
 * 配色体系: 暖纸底色 (#FAF8F5) + 陶土红点缀 (#CC785C) + 碳黑文字 (#191919)
 * 运行环境: Cloudflare Workers + Cloudflare KV (零服务器成本 · 全球毫秒级分发)
 * 官方域名: https://drvittoria.de5.net
 * ═════════════════════════════════════════════════════════════════════════════
 */

const CONFIG = {
  name: "Vittorio Cui",
  email: "velosovittoria545@gmail.com",
  github: "https://github.com/velosovittoria545-oss",
  siteDomain: "drvittoria.de5.net",
  adminUsername: "admin",
  adminPassword: "vittoria2026!", // 后台登录密码，也可在 Cloudflare 环境变量中配置 ADMIN_PASSWORD
  avatarBase64: "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"
};

// 默认初始文章（标题一律为“文章”，无多余修饰）
const DEFAULT_ARTICLES = [
  {
    id: "enterprise-agent-architecture",
    title: {
      zh: "从零搭建企业级 Multi-Agent 系统：反思、工具调用与长程状态机治理",
      en: "Building Enterprise Multi-Agent Systems from Scratch: Reflection, Tool Calling & State Governance"
    },
    tag: "Agent Architecture",
    date: "2025.02",
    readTime: "8 min read",
    views: "182,400+ views",
    summary: {
      zh: "探讨如何从单次 Prompt 工程演进到工业级多智能体协同网络，解决句子级反幻觉校验、Memory 持久化及确定性业务流控制的核心技术难点。",
      en: "Exploring the architectural shift from simple prompt pipelines to industrial multi-agent orchestration, addressing sentence-level hallucination evaluation, state persistence, and deterministic business routing."
    },
    content: {
      zh: [
        "<p>在企业级落地场景中，单一的 LLM 调用往往难以支撑长链路、多步骤的复杂业务逻辑。Agent 的本质是：<strong>思考（Think）- 行动（Act）- 观察（Observe）</strong>的闭环回路。</p>",
        "<h3>1. 为什么单纯的 RAG 走向瓶颈？</h3>",
        "<p>传统的 RAG 架构仅解决了静态知识检索的召回率问题，但无法应对动态决策与跨系统状态变更。当涉及企业 ERP、财务对账与客服多渠道系统时，我们必须引入状态机驱动的 Agent 调度引擎。</p>",
        "<blockquote>\"在工业落地中，决定 Agent 成功率的往往不是底座模型的上下文长度，而是状态隔离粒度与异常回退（Fallback）的防御性设计。\"</blockquote>",
        "<h3>2. 核心架构设计：三层防御与状态隔离</h3>",
        "<pre><code>// 核心 Agent 执行环路伪代码 (LangGraph / StateMachine)\nasync function executeAgentTurn(state, input) {\n    const memory = await MemoryStore.retrieveClientContext(state.clientId);\n    const plan = await Planner.think(input, memory);\n    for (const action of plan.actions) {\n        if (!ToolRegistry.isAuthorized(action.tool, state.role)) {\n            throw new SecurityException('Unauthorized tool access');\n        }\n        const result = await ToolExecutor.call(action.tool, action.params);\n        state.appendObservation(result);\n    }\n    return Formatter.synthesize(state);\n}</code></pre>",
        "<h3>3. 生产环境的 3 大最佳实践</h3>",
        "<p><strong>① 句子级反幻觉验证：</strong> 在模型给出回答后，利用轻量级校验模型对关键实体（金额、库存量、订单号）做交叉比对。<br><strong>② 异步事务与回滚机制：</strong> 严禁智能体直接写入主交易库，必须通过事件驱动管道（Event-Driven Queue）先写预备日志，再经由校验服务确认入库。<br><strong>③ 人机协同（Human-in-the-Loop）：</strong> 当决策置信度低于 85% 时，平滑切换为工单推送由人工复核介入，确保业务安全。</p>"
      ].join(""),
      en: [
        "<p>In enterprise production environments, simple single-turn LLM pipelines cannot sustain complex multi-step workflows. The essence of an Agent lies in the closed loop: <strong>Think → Act → Observe</strong>.</p>",
        "<h3>1. The Ceiling of Pure RAG</h3>",
        "<p>Traditional RAG architectures only solve recall for static knowledge, failing at dynamic multi-step decision-making and cross-system state mutation. When interfacing with ERP, reconciliation, and omnichannel routing, deterministic state machines become imperative.</p>",
        "<blockquote>\"In industrial deployment, the bottleneck is rarely context length, but the granularity of state isolation and defensive fallback design.\"</blockquote>"
      ].join("")
    }
  },
  {
    id: "vllm-inference-optimization",
    title: {
      zh: "vLLM 底层推理加速实战：PagedAttention、量化与千万级并发压测经验",
      en: "Deep-Dive into vLLM Inference: PagedAttention, Quantization & High-Throughput Benchmarking"
    },
    tag: "LLM Infrastructure",
    date: "2024.11",
    readTime: "10 min read",
    views: "245,100+ views",
    summary: {
      zh: "剖析大模型自建集群中的推理吞吐优化策略，包括 KV Cache 显存碎片消除、AWQ/GPTQ 权衡，以及如何将单位推理成本降低 60% 以上。",
      en: "Dissecting throughput optimization in proprietary LLM serving clusters: eliminating KV Cache memory fragmentation, AWQ vs GPTQ trade-offs, and slashing inference costs by over 60%."
    },
    content: {
      zh: [
        "<p>当大模型应用从小规模 POC 迈向大规模日活阶段，GPU 推理成本和端到端延迟（TTFT 与 ITL）便成为决定商业闭环的关键命脉。</p>",
        "<h3>1. KV Cache 显存碎片的根本挑战</h3>",
        "<p>在传统的注意力机制实现中，KV Cache 需要连续显存分配。这导致严重的显存碎片率（高达 60%-80%）。vLLM 通过借鉴操作系统虚拟内存分页设计的 <strong>PagedAttention</strong>，将 KV Cache 离散存储在固定大小的 Block 中，彻底消除了显存内部碎片。</p>"
      ].join(""),
      en: [
        "<p>As enterprise AI moves beyond POCs into production scale, GPU serving costs and end-to-end latency (TTFT & ITL) become make-or-break factors.</p>"
      ].join("")
    }
  },
  {
    id: "high-concurrency-microservices",
    title: {
      zh: "万级 QPS 金融结算系统微服务改造纪实：SLA 99.99% 的高可用底盘",
      en: "Refactoring High-Concurrency Payment Infrastructure: Engineering a 99.99% SLA Architecture"
    },
    tag: "Backend & Concurrency",
    date: "2024.06",
    readTime: "7 min read",
    views: "310,000+ views",
    summary: {
      zh: "分享在快手核心交易系统期间，如何主导数十个微服务治理、防资损幂等设计以及 Prometheus + ELK 全链路监控告警体系落地。",
      en: "Lessons from managing extreme payment transaction volumes (10k+ QPS): idempotency safeguards, zero financial-loss distributed locking, and resilient observability."
    },
    content: {
      zh: [
        "<p>不论 AI 算法如何演进，坚固的后端底座与分布式系统韧性永远是承载商业运转的地基。99.99% SLA 意味着全年不可用时间必须压减在 52 分钟以内。</p>"
      ].join(""),
      en: [
        "<p>Regardless of how rapidly AI evolves, rock-solid distributed backend foundations remain the cornerstone of enterprise execution.</p>"
      ].join("")
    }
  }
];

function getAdminPassword(env) {
  return (env && env.ADMIN_PASSWORD) ? env.ADMIN_PASSWORD : CONFIG.adminPassword;
}

async function getArticles(env) {
  if (env && env.BLOG_KV) {
    try {
      const data = await env.BLOG_KV.get("ARTICLES_DATA", "json");
      if (data && Array.isArray(data) && data.length > 0) return data;
    } catch (e) {
      console.error("KV Read Error:", e);
    }
  }
  return DEFAULT_ARTICLES;
}

async function saveArticles(env, articles) {
  if (env && env.BLOG_KV) {
    await env.BLOG_KV.put("ARTICLES_DATA", JSON.stringify(articles));
    return true;
  }
  return false;
}

function generateAuthToken(env) {
  const pass = getAdminPassword(env);
  const raw = "tianai:" + pass + ":" + new Date().toDateString();
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) - hash) + raw.charCodeAt(i);
    hash |= 0;
  }
  return "auth_" + Math.abs(hash).toString(36);
}

function checkAuth(request, env) {
  const cookieHeader = request.headers.get("Cookie") || "";
  const match = cookieHeader.match(/tianai_session=([^;]+)/);
  if (match) {
    return match[1] === generateAuthToken(env);
  }
  const authHeader = request.headers.get("Authorization") || "";
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7) === generateAuthToken(env);
  }
  return false;
}

/**
 * ═════════════════════════════════════════════════════════════════════════════
 * HTML 模板：前台展示页面 (李新野风格：极简紧凑，左肖像右简介，结构化表格)
 * ═════════════════════════════════════════════════════════════════════════════
 */
function renderPublicHtml(articlesJson) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${CONFIG.name} — AI Researcher & Technical Leader</title>
    <meta name="description" content="Vittorio Cui - AI Researcher & Technical Leader. Ph.D. Abide University, BUPT Software Engineering. Agent/RAG Architecture, vLLM Inference Optimization, High-Concurrency Backend.">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&display=swap" rel="stylesheet">
    <style>
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
            --font-serif: 'Newsreader', Georgia, serif;
            --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            --font-mono: 'JetBrains Mono', Menlo, Consolas, monospace;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body {
            font-family: var(--font-sans);
            background-color: var(--bg-page);
            color: var(--text-main);
            line-height: 1.68;
            -webkit-font-smoothing: antialiased;
        }
        .container {
            max-width: 760px;
            margin: 0 auto;
            padding: 50px 20px 90px;
        }

        /* 顶部两栏 Header (李新野风格) */
        .header-box {
            display: flex;
            gap: 28px;
            align-items: flex-start;
            margin-bottom: 28px;
        }
        .avatar-img {
            width: 135px;
            height: 175px;
            object-fit: cover;
            border-radius: 4px;
            border: 1px solid var(--border);
            flex-shrink: 0;
            box-shadow: 0 1px 4px rgba(0,0,0,0.05);
        }
        .header-content {
            flex: 1;
        }
        .header-title-row {
            display: flex;
            align-items: baseline;
            gap: 12px;
            margin-bottom: 12px;
            flex-wrap: wrap;
        }
        .name-en {
            font-family: var(--font-serif);
            font-size: 2.2rem;
            font-weight: 500;
            color: var(--text-main);
            line-height: 1.15;
            letter-spacing: -0.01em;
        }
        .name-zh {
            font-family: var(--font-serif);
            font-size: 1.5rem;
            font-weight: 400;
            color: var(--text-muted);
        }
        .header-intro {
            font-size: 0.98rem;
            color: var(--text-muted);
            margin-bottom: 16px;
            line-height: 1.65;
        }
        .header-intro strong {
            color: var(--text-main);
        }
        .header-links {
            display: flex;
            gap: 16px;
            align-items: center;
            font-size: 0.92rem;
            flex-wrap: wrap;
        }
        .header-link {
            color: var(--accent);
            text-decoration: underline;
            text-underline-offset: 3px;
            font-weight: 500;
            cursor: pointer;
            transition: color 0.15s ease;
        }
        .header-link:hover {
            color: var(--accent-hover);
        }

        /* 纯净细分割线 */
        hr {
            border: none;
            border-top: 1px solid var(--border);
            margin: 28px 0;
        }

        /* 章节通用标题 */
        h2.sec-title {
            font-family: var(--font-serif);
            font-size: 1.45rem;
            font-weight: 500;
            color: var(--text-main);
            margin-bottom: 16px;
        }

        /* About Me 结构化档案表 (李新野经典两列对齐排版) */
        .info-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.93rem;
            line-height: 1.7;
        }
        .info-table tr td {
            padding: 4px 0;
            vertical-align: top;
        }
        .info-label {
            width: 165px;
            font-style: italic;
            color: var(--text-muted);
            padding-right: 14px !important;
            flex-shrink: 0;
        }
        .info-value {
            color: var(--text-main);
        }
        .info-value a {
            color: var(--accent);
            text-decoration: underline;
            text-underline-offset: 2px;
        }

        /* Work Experience 经典时间线列表 */
        .exp-row {
            display: grid;
            grid-template-columns: 105px 1fr;
            gap: 16px;
            margin-bottom: 16px;
            font-size: 0.93rem;
            line-height: 1.6;
        }
        .exp-years {
            font-family: var(--font-mono);
            font-size: 0.86rem;
            color: var(--text-light);
            padding-top: 2px;
        }
        .exp-main strong {
            color: var(--text-main);
            font-weight: 600;
        }
        .exp-role {
            color: var(--text-muted);
        }
        .exp-detail-text {
            font-size: 0.88rem;
            color: var(--text-muted);
            margin-top: 4px;
        }

        /* 专项架构卡片 */
        .arch-box {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 6px;
            padding: 18px 20px;
            margin-bottom: 24px;
            font-size: 0.92rem;
        }
        .arch-title {
            font-weight: 600;
            color: var(--text-main);
            font-size: 1rem;
            margin-bottom: 6px;
        }
        .metrics-inline {
            display: flex;
            gap: 20px;
            margin: 10px 0;
            font-family: var(--font-mono);
            font-size: 0.86rem;
        }
        .metric-bold {
            color: var(--accent);
            font-weight: 600;
        }

        /* 文章 (Articles / Essays) 列表 */
        .article-item {
            margin-bottom: 18px;
            padding-bottom: 14px;
            border-bottom: 1px dashed var(--border);
            cursor: pointer;
        }
        .article-item:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }
        .article-row-head {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            gap: 10px;
        }
        .article-link-title {
            font-family: var(--font-serif);
            font-size: 1.15rem;
            font-weight: 500;
            color: var(--text-main);
            text-decoration: underline;
            text-underline-offset: 3px;
            transition: color 0.15s ease;
        }
        .article-item:hover .article-link-title {
            color: var(--accent);
        }
        .article-date-tag {
            font-family: var(--font-mono);
            font-size: 0.8rem;
            color: var(--text-light);
            flex-shrink: 0;
        }
        .article-summary-text {
            font-size: 0.88rem;
            color: var(--text-muted);
            margin-top: 4px;
            line-height: 1.6;
        }

        /* 内嵌文章阅读器 */
        #article-reader-view {
            display: none;
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 28px 32px;
            margin: 20px 0 28px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.03);
        }
        .reader-close-btn {
            display: inline-block;
            color: var(--accent);
            text-decoration: underline;
            font-size: 0.88rem;
            cursor: pointer;
            margin-bottom: 16px;
            font-weight: 500;
        }
        .reader-article-title {
            font-family: var(--font-serif);
            font-size: 1.85rem;
            line-height: 1.25;
            margin-bottom: 10px;
            color: var(--text-main);
        }
        .reader-meta-bar {
            font-family: var(--font-mono);
            font-size: 0.82rem;
            color: var(--text-light);
            padding-bottom: 14px;
            margin-bottom: 20px;
            border-bottom: 1px solid var(--border);
        }
        .reader-content-body {
            font-size: 0.98rem;
            line-height: 1.8;
            color: var(--text-main);
        }
        .reader-content-body h3 {
            font-family: var(--font-serif);
            font-size: 1.35rem;
            margin: 26px 0 10px;
        }
        .reader-content-body p {
            margin-bottom: 14px;
            color: #2b2824;
        }
        .reader-content-body pre {
            background: #21201D;
            color: #FAF8F5;
            padding: 14px 18px;
            border-radius: 6px;
            font-family: var(--font-mono);
            font-size: 0.84rem;
            overflow-x: auto;
            margin: 16px 0;
            line-height: 1.55;
        }
        .reader-content-body code {
            font-family: var(--font-mono);
            background: var(--bg-subtle);
            padding: 2px 6px;
            border-radius: 4px;
            color: var(--accent);
            font-size: 0.9em;
        }
        .reader-content-body pre code {
            background: transparent;
            color: inherit;
            padding: 0;
        }
        .reader-content-body blockquote {
            border-left: 3px solid var(--accent);
            padding: 6px 16px;
            background: var(--bg-subtle);
            margin: 16px 0;
            font-style: italic;
            color: var(--text-muted);
        }

        /* 极简页脚 */
        footer {
            margin-top: 60px;
            padding-top: 20px;
            border-top: 1px solid var(--border);
            display: flex;
            justify-content: space-between;
            font-size: 0.84rem;
            color: var(--text-light);
            flex-wrap: wrap;
            gap: 10px;
        }
        footer a {
            color: var(--text-light);
            text-decoration: underline;
        }
        footer a:hover {
            color: var(--accent);
        }

        /* 移动端适配 */
        @media (max-width: 600px) {
            .header-box { flex-direction: column; align-items: flex-start; gap: 18px; }
            .avatar-img { width: 110px; height: 145px; }
            .exp-row { grid-template-columns: 1fr; gap: 4px; }
            .info-label { width: 120px; }
            .metrics-inline { flex-direction: column; gap: 6px; }
        }
    </style>
</head>
<body>
    <div class="container">

        <!-- 1. 顶部两栏 Header (李新野风格) -->
        <header class="header-box">
            <img class="avatar-img" src="data:image/jpeg;base64,${CONFIG.avatarBase64}" alt="${CONFIG.name}" />
            
            <div class="header-content">
                <div class="header-title-row">
                    <span class="name-en" id="author-name-en">Vittorio Cui</span>
                    <span class="name-zh" id="author-name-zh">崔</span>
                </div>
                
                <p class="header-intro" id="header-intro-text">
                    欢迎访问我的主页。我是 <strong>AI 研究员与技术负责人</strong>，专注于大模型 Agent/RAG 架构、vLLM 底层推理优化以及万级 QPS、99.99% SLA 的高可用微服务底座建设。曾深度服务 eBay、海洋网联船务 (ONE)、IBM 等全球大客户落地智能体系统。
                </p>

                <div class="header-links">
                    <a class="header-link" href="#articles-section" id="link-essays">文章</a>
                    <a class="header-link" href="${CONFIG.github}" target="_blank" rel="noopener noreferrer">GitHub</a>
                    <a class="header-link" href="mailto:${CONFIG.email}">Email</a>
                    <a class="header-link" href="javascript:void(0)" onclick="toggleLanguage()" id="link-lang">English / 中文</a>
                    <a class="header-link" href="/admin" style="color:var(--text-light); text-decoration:none;">[后台]</a>
                </div>
            </div>
        </header>

        <hr />

        <!-- 2. 个人档案表 (About Me) -->
        <section>
            <h2 class="sec-title" id="title-about">About Me</h2>
            <table class="info-table">
                <tbody>
                    <tr>
                        <td class="info-label">Position:</td>
                        <td class="info-value" id="val-position">AI Researcher & Technical Leader</td>
                    </tr>
                    <tr>
                        <td class="info-label">Education:</td>
                        <td class="info-value" id="val-education">Ph.D., Abide University | B.E. in Software Engineering, BUPT (北京邮电大学)</td>
                    </tr>
                    <tr>
                        <td class="info-label">Core Focus:</td>
                        <td class="info-value" id="val-focus">Agent/RAG Systems, vLLM Inference Optimization, High-Concurrency Distributed Systems (10k+ QPS, 99.99% SLA)</td>
                    </tr>
                    <tr>
                        <td class="info-label">Tech Stack:</td>
                        <td class="info-value">Python, Java (SpringBoot/Cloud), C/C++, vLLM, LangGraph, Redis, PostgreSQL, Cloudflare Workers, Docker</td>
                    </tr>
                    <tr>
                        <td class="info-label">Human Languages:</td>
                        <td class="info-value" id="val-languages">Mandarin (Native), English (Fluent)</td>
                    </tr>
                    <tr>
                        <td class="info-label">Email:</td>
                        <td class="info-value"><a href="mailto:${CONFIG.email}">${CONFIG.email}</a></td>
                    </tr>
                    <tr>
                        <td class="info-label">GitHub:</td>
                        <td class="info-value"><a href="${CONFIG.github}" target="_blank" rel="noopener noreferrer">github.com/velosovittoria545-oss</a></td>
                    </tr>
                </tbody>
            </table>
        </section>

        <hr />

        <!-- 3. 工作经历 (Work Experience) -->
        <section>
            <h2 class="sec-title" id="title-experience">Work Experience</h2>
            <div id="experience-list-container">
                <div class="exp-row">
                    <div class="exp-years">2024–Present</div>
                    <div class="exp-main">
                        <strong>Hightouch</strong>, AI Researcher
                        <div class="exp-role">前沿部署工程 (FDE) 体系建设、多智能体协作网络、大模型预训练/SFT/RLHF 评测优化</div>
                    </div>
                </div>
                <div class="exp-row">
                    <div class="exp-years">2022–2024</div>
                    <div class="exp-main">
                        <strong>eBay (亿贝)</strong>, AI Tech Expert
                        <div class="exp-role">主导全局电商 AI Platform 基础底座建设，落地大语言模型智能客服与 Agent 智能体系统</div>
                    </div>
                </div>
                <div class="exp-row">
                    <div class="exp-years">2016–2022</div>
                    <div class="exp-main">
                        <strong>Kuaishou (快手)</strong>, Senior Backend Engineer / Tech Manager
                        <div class="exp-role">支撑 QPS 10k+ 极限海量支付交易核心场景，主导支付结算微服务重构，保障核心 SLA 99.99%</div>
                    </div>
                </div>
            </div>
        </section>

        <hr />

        <!-- 4. 专项独立项目与架构 (Independent Projects & Architecture) -->
        <section>
            <h2 class="sec-title" id="title-project">Featured Architecture</h2>
            <div class="arch-box">
                <div class="arch-title" id="project-name">基于 AI-Agent 的企业业务操作系统 (Enterprise Business OS)</div>
                <p style="color:var(--text-muted); margin-bottom: 8px;" id="project-desc">
                    独立全栈设计与落地：单一数据源（Single Source of Truth）驱动所有系统，协同前端网站门户、AI 智能体集群、大模型推理中枢、全渠道通信与无人值守运营。
                </p>
                <div class="metrics-inline">
                    <span>数据字段架构: <span class="metric-bold">+4,300</span></span>
                    <span>核心系统连接: <span class="metric-bold">9</span></span>
                    <span>月自动化节省: <span class="metric-bold">+150h</span></span>
                </div>
                <div style="font-size:0.86rem; color:var(--text-light); margin-top:8px;">
                    模块包含：全功能 ERP 架构 (496个核心字段与50+校验链路)、游戏化 CRM 与通信流转、无头 CMS 与最低库存自动采购、全渠道 (SMS/WhatsApp/邮件) 多智能体无人值守回复。
                </div>
            </div>
        </section>

        <hr />

        <!-- 5. 文章 (Articles / Essays) - 遵照指示：直接叫“文章” -->
        <section id="articles-section">
            <h2 class="sec-title" id="title-articles">文章</h2>

            <!-- 内嵌阅读器 -->
            <div id="article-reader-view">
                <span class="reader-close-btn" onclick="closeArticleReader()">← 返回文章列表</span>
                <h1 class="reader-article-title" id="reader-title"></h1>
                <div class="reader-meta-bar" id="reader-meta"></div>
                <div class="reader-content-body" id="reader-content"></div>
            </div>

            <!-- 文章列表 -->
            <div id="articles-list-container"></div>
        </section>

        <!-- 页脚 -->
        <footer>
            <span>© 2026 ${CONFIG.name} · All Rights Reserved</span>
            <div style="display:flex; gap:14px;">
                <a href="${CONFIG.github}" target="_blank" rel="noopener noreferrer">GitHub</a>
                <a href="mailto:${CONFIG.email}">Email</a>
                <a href="/admin">后台登录</a>
                <a href="#author-name-en">Top ↑</a>
            </div>
        </footer>

    </div>

    <script>
        const ARTICLES = ${articlesJson};
        let currentLang = 'zh';

        const i18n = {
            zh: {
                nameZh: "崔",
                intro: "欢迎访问我的主页。我是 <strong>AI 研究员与技术负责人</strong>，专注于大模型 Agent/RAG 架构、vLLM 底层推理优化以及万级 QPS、99.99% SLA 的高可用微服务底座建设。曾深度服务 eBay、海洋网联船务 (ONE)、IBM 等全球大客户落地智能体系统。",
                linkEssays: "文章",
                titleAbout: "About Me",
                titleExperience: "Work Experience",
                titleProject: "Featured Architecture",
                titleArticles: "文章",
                valPosition: "AI 研究员 // 技术负责人",
                valEducation: "博士 (Ph.D.), Abide 大学 | 软件工程学士, 北京邮电大学 (BUPT)",
                valFocus: "大模型 Agent/RAG 架构、vLLM 底层推理加速、高并发分布式系统 (10k+ QPS, 99.99% SLA)",
                valLanguages: "中文 (母语), 英文 (流利)",
                projectName: "基于 AI-Agent 的企业业务操作系统 (Enterprise Business OS)",
                projectDesc: "独立全栈设计与落地：单一数据源（Single Source of Truth）驱动所有系统，协同前端网站门户、AI 智能体集群、大模型推理中枢、全渠道通信与无人值守运营。",
                expHightouch: "前沿部署工程 (FDE) 体系建设、多智能体协作网络、大模型预训练/SFT/RLHF 评测优化",
                expEbay: "主导全局电商 AI Platform 基础底座建设，落地大语言模型智能客服与 Agent 智能体系统",
                expKuaishou: "支撑 QPS 10k+ 极限海量支付交易核心场景，主导支付结算微服务重构，保障核心 SLA 99.99%"
            },
            en: {
                nameZh: "",
                intro: "Welcome to my homepage. I am an <strong>AI Researcher & Technical Leader</strong> dedicated to cutting-edge AI R&D, Agent/RAG architectures, vLLM low-level inference optimization, and high-concurrency systems (10k+ QPS, 99.99% SLA). Partnered with global enterprise clients including eBay, Ocean Network Express (ONE), and IBM.",
                linkEssays: "Essays",
                titleAbout: "About Me",
                titleExperience: "Work Experience",
                titleProject: "Featured Architecture",
                titleArticles: "Essays",
                valPosition: "AI Researcher & Technical Leader",
                valEducation: "Ph.D., Abide University | B.E. in Software Engineering, BUPT",
                valFocus: "Agent/RAG Systems, vLLM Inference Optimization, High-Concurrency (10k+ QPS, 99.99% SLA)",
                valLanguages: "Mandarin (Native), English (Fluent)",
                projectName: "AI-Agent Driven Enterprise Business Operating System",
                projectDesc: "Independently designed and deployed: A Single Source of Truth (SSOT) operating engine powering dynamic portals, multi-agent clusters, LLM pipelines, and unattended operations.",
                expHightouch: "Forward Deployed Engineering (FDE) playbook, multi-agent networks, full-lifecycle LLM Pre/Post-training & evaluation.",
                expEbay: "Built organization-wide AI Platform infrastructure; deployed LLM-based intelligent customer support agents for global e-commerce users.",
                expKuaishou: "Scaled core financial payment pipelines (10k+ peak QPS, 99.99% SLA), automated failover & monitoring architectures."
            }
        };

        function renderArticles() {
            const container = document.getElementById('articles-list-container');
            container.innerHTML = ARTICLES.map(art => {
                const title = art.title[currentLang] || art.title.zh;
                const summary = art.summary[currentLang] || art.summary.zh;
                return '<div class="article-item" onclick="openArticle(\\'' + art.id + '\\')">' +
                    '<div class="article-row-head">' +
                        '<span class="article-link-title">' + title + '</span>' +
                        '<span class="article-date-tag">' + art.date + '</span>' +
                    '</div>' +
                    '<div class="article-summary-text">' + summary + '</div>' +
                '</div>';
            }).join('');
        }

        function openArticle(id) {
            const art = ARTICLES.find(a => a.id === id);
            if (!art) return;
            const reader = document.getElementById('article-reader-view');
            document.getElementById('reader-title').innerText = art.title[currentLang] || art.title.zh;
            document.getElementById('reader-meta').innerText = art.date + ' · ' + art.readTime + ' · ' + art.tag + ' · ' + art.views;
            document.getElementById('reader-content').innerHTML = art.content[currentLang] || art.content.zh;
            reader.style.display = 'block';
            reader.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        function closeArticleReader() {
            document.getElementById('article-reader-view').style.display = 'none';
            document.getElementById('articles-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        function toggleLanguage() {
            currentLang = currentLang === 'zh' ? 'en' : 'zh';
            const data = i18n[currentLang];
            document.getElementById('author-name-zh').innerText = data.nameZh;
            document.getElementById('header-intro-text').innerHTML = data.intro;
            document.getElementById('link-essays').innerText = data.linkEssays;
            document.getElementById('title-about').innerText = data.titleAbout;
            document.getElementById('title-experience').innerText = data.titleExperience;
            document.getElementById('title-project').innerText = data.titleProject;
            document.getElementById('title-articles').innerText = data.titleArticles;
            document.getElementById('val-position').innerText = data.valPosition;
            document.getElementById('val-education').innerText = data.valEducation;
            document.getElementById('val-focus').innerText = data.valFocus;
            document.getElementById('val-languages').innerText = data.valLanguages;
            document.getElementById('project-name').innerText = data.projectName;
            document.getElementById('project-desc').innerText = data.projectDesc;
            renderArticles();
        }

        renderArticles();
    </script>
</body>
</html>`;
}

/**
 * ═════════════════════════════════════════════════════════════════════════════
 * HTML 模板：管理后台登录与文章管理 CMS (/admin)
 * ═════════════════════════════════════════════════════════════════════════════
 */
function renderAdminHtml(isLoggedIn, articlesJson, hasKv) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>文章管理后台 — ${CONFIG.name}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-page: #FAF8F5; --bg-card: #FFFFFF; --bg-subtle: #F3EFEA;
            --text-main: #191919; --text-muted: #5C5852; --text-light: #8C867E;
            --accent: #CC785C; --accent-hover: #b86448; --accent-bg: #F8ECE7;
            --border: #E0D9CE; --radius: 6px;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; background: var(--bg-page); color: var(--text-main); line-height: 1.6; }
        .admin-wrap { max-width: 820px; margin: 0 auto; padding: 40px 20px 80px; }
        .nav-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 14px; border-bottom: 1px solid var(--border); }
        .logo { font-family: 'Newsreader', serif; font-size: 1.3rem; text-decoration: underline; color: var(--text-main); }
        .btn { padding: 6px 14px; border-radius: 4px; border: 1px solid var(--border); background: var(--bg-card); cursor: pointer; font-size: 0.88rem; text-decoration: none; color: var(--text-main); }
        .btn:hover { border-color: var(--accent); color: var(--accent); }
        .btn-primary { background: var(--accent); color: #fff; border-color: var(--accent); }
        .btn-primary:hover { background: var(--accent-hover); color: #fff; }
        .btn-danger { background: #FFF5F5; color: #E53E3E; border-color: #FEB2B2; }

        .login-box { max-width: 380px; margin: 60px auto; background: var(--bg-card); padding: 32px; border-radius: 8px; border: 1px solid var(--border); box-shadow: 0 2px 10px rgba(0,0,0,0.03); }
        .login-title { font-family: 'Newsreader', serif; font-size: 1.6rem; margin-bottom: 6px; }
        .form-group { margin-bottom: 16px; }
        label { display: block; font-size: 0.84rem; color: var(--text-muted); margin-bottom: 5px; font-weight: 500; }
        input[type="text"], input[type="password"], textarea {
            width: 100%; padding: 8px 12px; border: 1px solid var(--border); border-radius: 4px; font-size: 0.9rem; background: var(--bg-page); color: var(--text-main); font-family: inherit;
        }
        input:focus, textarea:focus { outline: none; border-color: var(--accent); background: #fff; }

        .kv-banner { padding: 10px 14px; border-radius: 4px; margin-bottom: 20px; font-size: 0.84rem; display: flex; justify-content: space-between; align-items: center; }
        .kv-ok { background: #EBF5EC; border: 1px solid #D2E7D4; color: #2e6930; }
        .kv-warn { background: #FFFDF0; border: 1px solid #F6E05E; color: #975A16; }

        .article-table { width: 100%; border-collapse: collapse; background: var(--bg-card); border-radius: 6px; border: 1px solid var(--border); }
        .article-table th, .article-table td { padding: 12px 14px; text-align: left; border-bottom: 1px solid var(--border); font-size: 0.88rem; }
        .article-table th { background: var(--bg-subtle); color: var(--text-muted); font-weight: 500; }

        #edit-modal { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 999; overflow-y: auto; padding: 40px 20px; }
        .modal-body { max-width: 720px; margin: 0 auto; background: var(--bg-card); padding: 28px; border-radius: 8px; border: 1px solid var(--border); }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    </style>
</head>
<body>
    <div class="admin-wrap">
        <div class="nav-bar">
            <a href="/" class="logo">← 返回主页</a>
            <div>
                ${isLoggedIn ? '<button class="btn" onclick="handleLogout()">退出登录</button>' : '<a href="/" class="btn">主页</a>'}
            </div>
        </div>

        ${!isLoggedIn ? `
        <div class="login-box">
            <h1 class="login-title">后台登录</h1>
            <p style="color:var(--text-muted); font-size:0.84rem; margin-bottom:18px;">请输入管理员账号与自定义密码</p>
            <form onsubmit="handleLogin(event)">
                <div class="form-group">
                    <label>账号</label>
                    <input type="text" id="username" value="${CONFIG.adminUsername}" required />
                </div>
                <div class="form-group">
                    <label>密码</label>
                    <input type="password" id="password" placeholder="请输入密码" required autofocus />
                </div>
                <button type="submit" class="btn btn-primary" style="width:100%; padding:8px;">登录</button>
            </form>
            <div id="login-error" style="color:#E53E3E; font-size:0.84rem; margin-top:10px; display:none;">账号或密码错误</div>
        </div>
        ` : `
        <div class="${hasKv ? 'kv-banner kv-ok' : 'kv-banner kv-warn'}">
            <span>${hasKv ? '🟢 Cloudflare KV 已连接：文章实时全球持久化！' : '🟡 提示：当前处于体验模式。在 Cloudflare 绑定 KV (BLOG_KV) 即可开启云端永久保存。'}</span>
            <a href="https://dash.cloudflare.com" target="_blank" class="btn" style="padding:2px 8px; font-size:0.78rem;">CF 控制台</a>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px;">
            <h1 style="font-family:'Newsreader', serif; font-size:1.6rem;">文章管理</h1>
            <button class="btn btn-primary" onclick="openCreateModal()">➕ 发布新文章</button>
        </div>

        <table class="article-table">
            <thead>
                <tr>
                    <th>标题</th>
                    <th>分类</th>
                    <th>日期</th>
                    <th style="text-align:right;">操作</th>
                </tr>
            </thead>
            <tbody id="article-list-tbody"></tbody>
        </table>
        `}
    </div>

    <!-- 编辑/新建文章弹窗 -->
    <div id="edit-modal">
        <div class="modal-body">
            <div style="display:flex; justify-content:space-between; margin-bottom:16px;">
                <h2 id="modal-title" style="font-family:'Newsreader', serif; font-size:1.3rem;">编辑文章</h2>
                <button class="btn" onclick="closeModal()">✕</button>
            </div>
            <form onsubmit="handleSaveArticle(event)">
                <input type="hidden" id="edit-id" />
                <div class="grid-2">
                    <div class="form-group">
                        <label>标识 (Slug / ID)</label>
                        <input type="text" id="edit-slug" required />
                    </div>
                    <div class="form-group">
                        <label>分类 (Tag)</label>
                        <input type="text" id="edit-tag" required />
                    </div>
                </div>
                <div class="grid-2">
                    <div class="form-group">
                        <label>日期 (Date)</label>
                        <input type="text" id="edit-date" required />
                    </div>
                    <div class="form-group">
                        <label>阅读时间 (Read Time)</label>
                        <input type="text" id="edit-readtime" required />
                    </div>
                </div>
                <div class="form-group">
                    <label>阅读量 (Views)</label>
                    <input type="text" id="edit-views" required />
                </div>
                <div class="form-group">
                    <label>中文标题</label>
                    <input type="text" id="edit-title-zh" required />
                </div>
                <div class="form-group">
                    <label>中文摘要</label>
                    <textarea id="edit-summary-zh" rows="2" required></textarea>
                </div>
                <div class="form-group">
                    <label>中文正文 (HTML / Markdown 格式)</label>
                    <textarea id="edit-content-zh" rows="8" required></textarea>
                </div>

                <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:16px;">
                    <button type="button" class="btn" onclick="closeModal()">取消</button>
                    <button type="submit" class="btn btn-primary">保存文章</button>
                </div>
            </form>
        </div>
    </div>

    <script>
        let articles = ${articlesJson || '[]'};

        function handleLogin(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            }).then(res => {
                if (res.ok) window.location.reload();
                else document.getElementById('login-error').style.display = 'block';
            });
        }

        function handleLogout() {
            fetch('/api/logout', { method: 'POST' }).then(() => window.location.reload());
        }

        function renderArticleTable() {
            const tbody = document.getElementById('article-list-tbody');
            if (!tbody) return;
            tbody.innerHTML = articles.map(art => {
                return '<tr>' +
                    '<td><strong>' + (art.title.zh || art.title.en) + '</strong></td>' +
                    '<td>' + art.tag + '</td>' +
                    '<td>' + art.date + '</td>' +
                    '<td style="text-align:right;">' +
                        '<button class="btn" style="padding:2px 8px; margin-right:4px;" onclick="openEditModal(\\'' + art.id + '\\')">编辑</button>' +
                        '<button class="btn btn-danger" style="padding:2px 8px;" onclick="handleDelete(\\'' + art.id + '\\')">删除</button>' +
                    '</td>' +
                '</tr>';
            }).join('');
        }

        function openCreateModal() {
            document.getElementById('modal-title').innerText = '新建文章';
            document.getElementById('edit-id').value = '';
            document.getElementById('edit-slug').value = 'post-' + Date.now().toString(36);
            document.getElementById('edit-slug').removeAttribute('readonly');
            document.getElementById('edit-tag').value = 'AI';
            document.getElementById('edit-date').value = new Date().toISOString().slice(0, 7).replace('-', '.');
            document.getElementById('edit-readtime').value = '5 min read';
            document.getElementById('edit-views').value = '1,000+ views';
            document.getElementById('edit-title-zh').value = '';
            document.getElementById('edit-summary-zh').value = '';
            document.getElementById('edit-content-zh').value = '<p>正文内容...</p>';
            document.getElementById('edit-modal').style.display = 'block';
        }

        function openEditModal(id) {
            const art = articles.find(a => a.id === id);
            if (!art) return;
            document.getElementById('modal-title').innerText = '编辑文章';
            document.getElementById('edit-id').value = art.id;
            document.getElementById('edit-slug').value = art.id;
            document.getElementById('edit-slug').setAttribute('readonly', 'true');
            document.getElementById('edit-tag').value = art.tag;
            document.getElementById('edit-date').value = art.date;
            document.getElementById('edit-readtime').value = art.readTime;
            document.getElementById('edit-views').value = art.views;
            document.getElementById('edit-title-zh').value = art.title.zh || '';
            document.getElementById('edit-summary-zh').value = art.summary.zh || '';
            document.getElementById('edit-content-zh').value = art.content.zh || '';
            document.getElementById('edit-modal').style.display = 'block';
        }

        function closeModal() {
            document.getElementById('edit-modal').style.display = 'none';
        }

        function handleSaveArticle(e) {
            e.preventDefault();
            const id = document.getElementById('edit-slug').value.trim();
            const articleData = {
                id: id,
                tag: document.getElementById('edit-tag').value.trim(),
                date: document.getElementById('edit-date').value.trim(),
                readTime: document.getElementById('edit-readtime').value.trim(),
                views: document.getElementById('edit-views').value.trim(),
                title: { zh: document.getElementById('edit-title-zh').value.trim(), en: document.getElementById('edit-title-zh').value.trim() },
                summary: { zh: document.getElementById('edit-summary-zh').value.trim(), en: document.getElementById('edit-summary-zh').value.trim() },
                content: { zh: document.getElementById('edit-content-zh').value.trim(), en: document.getElementById('edit-content-zh').value.trim() }
            };

            fetch('/api/articles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(articleData)
            }).then(res => res.json()).then(data => {
                if (data.success) {
                    alert('保存成功！');
                    window.location.reload();
                } else {
                    alert('保存失败');
                }
            });
        }

        function handleDelete(id) {
            if (!confirm('确定要删除文章吗？')) return;
            fetch('/api/articles?id=' + encodeURIComponent(id), { method: 'DELETE' })
                .then(res => res.json())
                .then(data => {
                    if (data.success) window.location.reload();
                    else alert('删除失败');
                });
        }

        renderArticleTable();
    </script>
</body>
</html>`;
}

/**
 * ═════════════════════════════════════════════════════════════════════════════
 * Cloudflare Workers 核心 Fetch 事件路由
 * ═════════════════════════════════════════════════════════════════════════════
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // 1. API: 登录 POST /api/login
    if (path === "/api/login" && method === "POST") {
      try {
        const body = await request.json();
        const configuredPass = getAdminPassword(env);
        if (body.username === CONFIG.adminUsername && body.password === configuredPass) {
          const token = generateAuthToken(env);
          return new Response(JSON.stringify({ success: true, token }), {
            headers: {
              "Content-Type": "application/json;charset=UTF-8",
              "Set-Cookie": "tianai_session=" + token + "; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800"
            }
          });
        }
        return new Response(JSON.stringify({ success: false, error: "Invalid credentials" }), {
          status: 401,
          headers: { "Content-Type": "application/json;charset=UTF-8" }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 400 });
      }
    }

    // 2. API: 登出 POST /api/logout
    if (path === "/api/logout" && method === "POST") {
      return new Response(JSON.stringify({ success: true }), {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          "Set-Cookie": "tianai_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0"
        }
      });
    }

    // 3. API: 文章列表 GET /api/articles 或 /articles.json
    if ((path === "/api/articles" || path === "/articles.json") && method === "GET") {
      const articles = await getArticles(env);
      return new Response(JSON.stringify(articles, null, 2), {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=60"
        }
      });
    }

    // 4. API: 保存/更新文章 POST /api/articles
    if (path === "/api/articles" && method === "POST") {
      if (!checkAuth(request, env)) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
      }
      try {
        const newArt = await request.json();
        let articles = await getArticles(env);
        const idx = articles.findIndex(a => a.id === newArt.id);
        if (idx >= 0) articles[idx] = newArt;
        else articles.unshift(newArt);
        await saveArticles(env, articles);
        return new Response(JSON.stringify({ success: true }), {
          headers: { "Content-Type": "application/json;charset=UTF-8" }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
      }
    }

    // 5. API: 删除文章 DELETE /api/articles
    if (path === "/api/articles" && method === "DELETE") {
      if (!checkAuth(request, env)) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
      }
      const deleteId = url.searchParams.get("id");
      let articles = await getArticles(env);
      articles = articles.filter(a => a.id !== deleteId);
      await saveArticles(env, articles);
      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json;charset=UTF-8" }
      });
    }

    // 6. 管理后台路由 GET /admin
    if (path === "/admin") {
      const isAuthed = checkAuth(request, env);
      const articles = await getArticles(env);
      const hasKv = Boolean(env && env.BLOG_KV);
      return new Response(renderAdminHtml(isAuthed, JSON.stringify(articles), hasKv), {
        headers: { "Content-Type": "text/html;charset=UTF-8" }
      });
    }

    // 7. 公开主页 GET /
    const articles = await getArticles(env);
    return new Response(renderPublicHtml(JSON.stringify(articles)), {
      headers: {
        "Content-Type": "text/html;charset=UTF-8",
        "Cache-Control": "public, max-age=120"
      }
    });
  }
};
