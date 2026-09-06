/**
 * 项目名称: TianAi (天艾) — 维托里奥 崔 (Vittorio Cui) 个人主页与文章系统
 * 架构规范: 李新野 (Sinya Lee) 极简风格 + Cloudflare Workers + KV 边缘持久化
 * 核心规范:
 *   - 首页：极简排版，不显示文章，仅保留“关于我”与“经历”
 *   - 核心领域：AI, 软件开发, 系统设计, 团队管理
 *   - 技术栈：Python, Java (Spring Boot), Go, C++, vLLM, LangGraph, MCP, Redis, PostgreSQL, Docker
 *   - 经历：Hightouch 21个月主导落地 14 个 AI Agent 与研发赋能项目
 *   - 头部：仅保留“文章”与“Email”，右上角中英文切换
 *   - 文章：点击“文章”跳转独立文章列表页面 (/articles)
 *   - 留言板：文章末尾增加读者留言区，记录称呼与时间，经管理员审核后公开展示
 *   - 管理后台：右下角入口，点击跳转独立登录页面 (/admin)，支持文章管理与留言审核
 */

const CONFIG = {
  nameZh: "维托里奥 崔",
  nameEn: "Vittorio Cui",
  email: "velosovittoria545@gmail.com",
  adminUsername: "admin",
  adminPassword: "vittoria2026!",
  avatarBase64: "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"
};

const DEFAULT_ARTICLES = [
  {
    "id": "enterprise-agent-architecture",
    "title": {
      "zh": "从零搭建企业级 Multi-Agent 系统：反思、工具调用与长程状态机治理",
      "en": "Building Enterprise Multi-Agent Systems from Scratch: Reflection, Tool Calling & State Governance"
    },
    "tag": "Agent Architecture",
    "date": "2025.02",
    "readTime": "8 min read",
    "views": "182,400+ views",
    "summary": {
      "zh": "探讨如何从单次 Prompt 工程演进到工业级多智能体协同网络，解决句子级反幻觉校验、Memory 持久化及确定性业务流控制的核心技术难点。",
      "en": "Exploring the architectural shift from simple prompt pipelines to industrial multi-agent orchestration, addressing sentence-level hallucination evaluation, state persistence, and deterministic business routing."
    },
    "content": {
      "zh": "<p>在企业级落地场景中，单一的 LLM 调用往往难以支撑长链路、多步骤的复杂业务逻辑。Agent 的本质是：<strong>思考（Think）- 行动（Act）- 观察（Observe）</strong>的闭环回路。</p><h3>1. 为什么单纯的 RAG 走向瓶颈？</h3><p>传统的 RAG 架构仅解决了静态知识检索的召回率问题，但无法应对动态决策与跨系统状态变更。当涉及企业 ERP、财务对账与客服多渠道系统时，我们必须引入状态机驱动的 Agent 调度引擎。</p><blockquote>\"在工业落地中，决定 Agent 成功率的往往不是底座模型的上下文长度，而是状态隔离粒度与异常回退（Fallback）的防御性设计。\"</blockquote><h3>2. 核心架构设计：三层防御与状态隔离</h3><pre><code>// 核心 Agent 执行环路伪代码 (LangGraph / StateMachine)\nasync function executeAgentTurn(state, input) {\n    const memory = await MemoryStore.retrieveClientContext(state.clientId);\n    const plan = await Planner.think(input, memory);\n    for (const action of plan.actions) {\n        if (!ToolRegistry.isAuthorized(action.tool, state.role)) {\n            throw new SecurityException('Unauthorized tool access');\n        }\n        const result = await ToolExecutor.call(action.tool, action.params);\n        state.appendObservation(result);\n    }\n    return Formatter.synthesize(state);\n}</code></pre><h3>3. 生产环境的 3 大最佳实践</h3><p><strong>① 句子级反幻觉验证：</strong> 在模型给出回答后，利用轻量级校验模型对关键实体（金额、库存量、订单号）做交叉比对。<br><strong>② 异步事务与回滚机制：</strong> 严禁智能体直接写入主交易库，必须通过事件驱动管道（Event-Driven Queue）先写预备日志，再经由校验服务确认入库。<br><strong>③ 人机协同（Human-in-the-Loop）：</strong> 当决策置信度低于 85% 时，平滑切换为工单推送由人工复核介入，确保业务安全。</p>",
      "en": "<p>In enterprise production environments, simple single-turn LLM pipelines cannot sustain complex multi-step workflows. The essence of an Agent lies in the closed loop: <strong>Think → Act → Observe</strong>.</p><h3>1. The Ceiling of Pure RAG</h3><p>Traditional RAG architectures only solve recall for static knowledge, failing at dynamic multi-step decision-making and cross-system state mutation. When interfacing with ERP, reconciliation, and omnichannel routing, deterministic state machines become imperative.</p><blockquote>\"In industrial deployment, the bottleneck is rarely context length, but the granularity of state isolation and defensive fallback design.\"</blockquote>"
    }
  },
  {
    "id": "vllm-inference-optimization",
    "title": {
      "zh": "vLLM 底层推理加速实战：PagedAttention、量化与千万级并发压测经验",
      "en": "Deep-Dive into vLLM Inference: PagedAttention, Quantization & High-Throughput Benchmarking"
    },
    "tag": "LLM Infrastructure",
    "date": "2024.11",
    "readTime": "10 min read",
    "views": "245,100+ views",
    "summary": {
      "zh": "剖析大模型自建集群中的推理吞吐优化策略，包括 KV Cache 显存碎片消除、AWQ/GPTQ 权衡，以及如何将单位推理成本降低 60% 以上。",
      "en": "Dissecting throughput optimization in proprietary LLM serving clusters: eliminating KV Cache memory fragmentation, AWQ vs GPTQ trade-offs, and slashing inference costs by over 60%."
    },
    "content": {
      "zh": "<p>当大模型应用从小规模 POC 迈向大规模日活阶段，GPU 推理成本和端到端延迟（TTFT 与 ITL）便成为决定商业闭环的关键命脉。</p><h3>1. KV Cache 显存碎片的根本挑战</h3><p>在传统的注意力机制实现中，KV Cache 需要连续显存分配。这导致严重的显存碎片率（高达 60%-80%）。vLLM 通过借鉴操作系统虚拟内存分页设计的 <strong>PagedAttention</strong>，将 KV Cache 离散存储在固定大小的 Block 中，彻底消除了显存内部碎片。</p><h3>2. 量化方案的选择考量</h3><p>在千万级 Token 吞吐的生产负载下，我们对 AWQ 4-bit、GPTQ 及 FP8 进行了详尽的延迟与 PPL（困惑度）基准测试。对于绝大部分文本生成与摘要任务，FP8 与 AWQ 能够在保留 99% 原始精度的同时，将每张 GPU 的并发承载能力提升 2.4 倍。</p>",
      "en": "<p>As enterprise AI moves beyond POCs into production scale, GPU serving costs and end-to-end latency (TTFT & ITL) become make-or-break factors.</p>"
    }
  },
  {
    "id": "high-concurrency-microservices",
    "title": {
      "zh": "万级 QPS 金融结算系统微服务改造纪实：SLA 99.99% 的高可用底盘",
      "en": "Refactoring High-Concurrency Payment Infrastructure: Engineering a 99.99% SLA Architecture"
    },
    "tag": "Backend & Concurrency",
    "date": "2024.06",
    "readTime": "7 min read",
    "views": "310,000+ views",
    "summary": {
      "zh": "分享在快手核心交易系统期间，如何主导数十个微服务治理、防资损幂等设计以及 Prometheus + ELK 全链路监控告警体系落地。",
      "en": "Lessons from managing extreme payment transaction volumes (10k+ QPS): idempotency safeguards, zero financial-loss distributed locking, and resilient observability."
    },
    "content": {
      "zh": "<p>不论 AI 算法如何演进，坚固的后端底座与分布式系统韧性永远是承载商业运转的地基。99.99% SLA 意味着全年不可用时间必须压减在 52 分钟以内。</p><h3>1. 交易链路防资损幂等原则</h3><p>在海量并发的分布式事务中，网络抖动与超时重试是常态。核心支付订单必须具备全局唯一的业务流水号，利用 Redis + MySQL 分布式悲观锁配合状态机版本号（Optimistic Locking with Versioning），杜绝一切重复出金与双重记账风险。</p>",
      "en": "<p>Regardless of how rapidly AI evolves, rock-solid distributed backend foundations remain the cornerstone of enterprise execution.</p>"
    }
  },
  {
    "id": "ai-product-trends-2025",
    "title": {
      "zh": "洞察 2025：国内外 AI 技术与产品演进趋势深度解析",
      "en": "Insights 2025: Global Trends in AI Technology & Product Architecture"
    },
    "tag": "AI Trends",
    "date": "2025.01",
    "readTime": "6 min read",
    "views": "98,000+ views",
    "summary": {
      "zh": "深度剖析中美大模型从模型层到应用层的分化与融合，结合 Agent 落地实践，探讨未来 3 年企业级 AI 产品的杀手级形态与架构演进。",
      "en": "Deep analysis of the divergence and convergence of foundation models and application layers globally, exploring the next-generation enterprise AI product paradigms."
    },
    "content": {
      "zh": "<p>大模型的竞争正在从单纯的参数规模竞赛转向<strong>工程化效率、推理加速比与复杂 Agent 工作流的闭环能力</strong>。</p><p>国内产品在场景渗透、垂类流程与高并发工程底座上有极强纵深；而北美生态在基础架构创新与端到端 Agent 协议上有敏锐的前瞻性。两者的交汇点，正是大模型从“对话框”走向“无人值守系统”的核心拐点。</p>",
      "en": "<p>Competition in foundation models is transitioning from pure parameter scale to engineering efficiency, inference cost ratio, and closed-loop agentic workflows.</p>"
    }
  }
];
const DEFAULT_COMMENTS = [
  {
    "id": "comm-1",
    "articleId": "post-llm-evolution",
    "articleTitle": "大模型下半场：从模型中心到 Agent 协同工程的思考",
    "author": "分布式老兵",
    "content": "非常赞同崔老师文中的观点，特别是关于推理加速和 Agent 协议闭环的分析，受益匪浅！期待更多深度文章。",
    "createdAt": "2026-03-02 10:24",
    "status": "approved"
  },
  {
    "id": "comm-2",
    "articleId": "post-agent-mcp",
    "articleTitle": "构建可落地的企业级 MCP 架构：从工具协议到生产系统",
    "author": "AI 探索者",
    "content": "请教一下崔老师，在企业专属云端环境下打通 CircleCI 和 MCP 遇到权限与密钥隔离问题，一般最佳实践是怎么解？",
    "createdAt": "2026-03-05 16:40",
    "status": "approved"
  },
  {
    "id": "comm-3",
    "articleId": "post-llm-evolution",
    "articleTitle": "大模型下半场：从模型中心到 Agent 协同工程的思考",
    "author": "李工",
    "content": "老师讲得很接地气，想请教下在实际做 vLLM 推理优化时，PagedAttention 面对超长 Prompt 吞吐瓶颈的主要调优方向？",
    "createdAt": "2026-03-06 09:15",
    "status": "pending"
  },
  {
    "id": "comm-gb-1",
    "articleId": "guestbook",
    "articleTitle": "全站公开留言板",
    "author": "云原生架构师",
    "content": "崔老师的主页风格太纯粹了，李新野式的极简排版看着非常舒服！祝博客越办越好！",
    "createdAt": "2026-03-01 15:30",
    "status": "approved"
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
  }
}

async function getComments(env) {
  if (env && env.BLOG_KV) {
    try {
      const data = await env.BLOG_KV.get("BLOG_COMMENTS", "json");
      if (data && Array.isArray(data)) return data;
    } catch (e) {
      console.error("KV Read Error for comments:", e);
    }
  }
  return DEFAULT_COMMENTS;
}

async function saveComments(env, comments) {
  if (env && env.BLOG_KV) {
    await env.BLOG_KV.put("BLOG_COMMENTS", JSON.stringify(comments));
  }
}

function checkAuth(request, env) {
  const cookie = request.headers.get("Cookie") || "";
  const token = generateAuthToken(env);
  return cookie.includes("tianai_session=" + token);
}

function generateAuthToken(env) {
  const pass = getAdminPassword(env);
  let hash = 0;
  for (let i = 0; i < pass.length; i++) {
    hash = ((hash << 5) - hash) + pass.charCodeAt(i);
    hash |= 0;
  }
  return "token_" + Math.abs(hash) + "_vittorio";
}

// 通用极简 CSS
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
`;

/**
 * 1. 独立文章列表页面 HTML (GET /articles)
 */
function renderArticlesPageHtml(articlesJson) {
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
            <a href="/" class="back-btn">← 返回主页</a>
            <div style="display: flex; gap: 16px; align-items: center;">
                <a href="/guestbook" style="font-size: 0.88rem; color: var(--accent); text-decoration: underline;">留言板</a>
                <a href="/admin" class="admin-link">[管理后台]</a>
            </div>
        </div>

        <header class="page-header">
            <h1 class="page-title">文章</h1>
            <p class="page-subtitle">维托里奥 崔的技术随笔、架构实践与前沿思考</p>
        </header>

        <!-- 单篇阅读器 -->
        <div id="reader-view">
            <span class="reader-close-btn" onclick="closeReader()">← 返回文章列表</span>
            <h1 class="reader-article-title" id="reader-title"></h1>
            <div class="reader-meta-bar" id="reader-meta"></div>
            <div class="reader-content-body" id="reader-content"></div>

            <!-- 读者留言板 -->
            <div id="comments-section" style="margin-top: 36px; padding-top: 24px; border-top: 1px dashed var(--border);">
                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 16px;">
                    <h3 style="font-family: var(--font-serif); font-size: 1.25rem; font-weight: 500; color: var(--text-main);">💬 读者留言 (<span id="comments-count">0</span>)</h3>
                    <span style="font-size: 0.78rem; color: var(--text-light);">审核通过后公开展示</span>
                </div>

                <!-- 审核通过留言列表 -->
                <div id="comments-display-list" style="margin-bottom: 24px;"></div>

                <!-- 读者留言表单 -->
                <div style="background: var(--bg-subtle); border: 1px solid var(--border); border-radius: 6px; padding: 18px 20px;">
                    <div style="font-size: 0.9rem; font-weight: 500; margin-bottom: 12px; color: var(--text-main);">发表留言</div>
                    <form id="comment-form" onsubmit="handleCommentSubmit(event)">
                        <input type="hidden" id="comment-article-id" />
                        <input type="hidden" id="comment-article-title" />
                        <div style="margin-bottom: 10px; display: flex; gap: 8px; align-items: center;">
                            <label style="font-size: 0.82rem; color: var(--text-muted); white-space: nowrap;">您的称呼:</label>
                            <input type="text" id="comment-author" placeholder="例如: 某技术同行 (可自定义，默认匿名读者)" style="flex: 1; padding: 7px 10px; font-size: 0.85rem; border: 1px solid var(--border); border-radius: 4px; background: var(--bg-card); color: var(--text-main);" />
                        </div>
                        <div style="margin-bottom: 10px;">
                            <textarea id="comment-content" required rows="3" placeholder="写下您的技术探讨、阅读感受或问题交流...（留言需经管理员审核后公开展示）" style="width: 100%; box-sizing: border-box; padding: 8px 10px; font-size: 0.88rem; border: 1px solid var(--border); border-radius: 4px; background: var(--bg-card); color: var(--text-main); font-family: var(--font-sans); resize: vertical;"></textarea>
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
            <span>© 2026 维托里奥 崔 · All Rights Reserved</span>
            <a href="/admin" class="admin-link">[管理后台]</a>
        </footer>
    </div>

    <script>
        const ARTICLES = ${articlesJson};

        function escapeHtml(str) {
            if (!str) return '';
            return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        }

        function renderList() {
            const box = document.getElementById('articles-list-box');
            box.innerHTML = ARTICLES.map(art => {
                const title = (art.title && (art.title.zh || art.title.en)) || art.id;
                return '<div class="article-row" onclick="openArticle(\'' + art.id + '\')">' +
                    '<span class="article-title-text">' + title + '</span>' +
                    '<span class="article-date-badge">' + art.date + '</span>' +
                '</div>';
            }).join('');
        }

        function openArticle(id) {
            const art = ARTICLES.find(a => a.id === id);
            if (!art) return;
            const title = (art.title && art.title.zh) || '';
            document.getElementById('reader-title').innerText = title;
            document.getElementById('reader-meta').innerText = art.date + ' · ' + (art.readTime || '') + ' · ' + (art.tag || '');
            document.getElementById('reader-content').innerHTML = (art.content && art.content.zh) || '';
            
            document.getElementById('comment-article-id').value = art.id;
            document.getElementById('comment-article-title').value = title;
            document.getElementById('comment-status-msg').innerText = '';
            
            loadArticleComments(art.id);

            const reader = document.getElementById('reader-view');
            reader.style.display = 'block';
            reader.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        async function loadArticleComments(articleId) {
            const listEl = document.getElementById('comments-display-list');
            const countEl = document.getElementById('comments-count');
            listEl.innerHTML = '<div style="font-size:0.82rem; color:var(--text-light); font-style:italic;">加载留言中...</div>';
            try {
                const res = await fetch('/api/comments?articleId=' + encodeURIComponent(articleId));
                const data = await res.json();
                const approved = Array.isArray(data) ? data : [];
                countEl.innerText = approved.length;
                if (approved.length === 0) {
                    listEl.innerHTML = '<div style="font-size:0.84rem; color:var(--text-light); font-style:italic; padding:12px 0;">暂无留言，欢迎成为第一个交流的读者。</div>';
                    return;
                }
                listEl.innerHTML = approved.map(c => 
                    '<div style="padding: 12px 0; border-bottom: 1px dashed var(--border);">' +
                        '<div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">' +
                            '<strong style="font-size: 0.88rem; color: var(--accent);">' + escapeHtml(c.author || '匿名读者') + '</strong>' +
                            '<span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-light);">' + escapeHtml(c.createdAt || '') + '</span>' +
                        '</div>' +
                        '<div style="font-size: 0.86rem; color: var(--text-main); line-height: 1.6; white-space: pre-wrap;">' + escapeHtml(c.content || '') + '</div>' +
                    '</div>'
                ).join('');
            } catch (e) {
                listEl.innerHTML = '<div style="font-size:0.82rem; color:var(--text-light);">加载留言失败</div>';
            }
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
            
            try {
                const res = await fetch('/api/comments', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ articleId, articleTitle, author, content })
                });
                const result = await res.json();
                if (result.success) {
                    document.getElementById('comment-content').value = '';
                    statusMsg.style.color = '#28a745';
                    statusMsg.innerText = '✓ 留言已成功提交，待管理员审核通过后公开展示。';
                } else {
                    statusMsg.style.color = '#dc3545';
                    statusMsg.innerText = '提交失败，请稍后重试。';
                }
            } catch (err) {
                statusMsg.style.color = '#dc3545';
                statusMsg.innerText = '网络异常，提交失败。';
            } finally {
                btn.disabled = false;
                btn.innerText = '提交留言';
            }
        }

        function closeReader() {
            document.getElementById('reader-view').style.display = 'none';
        }

        renderList();
    </script>
</body>
</html>`;
}

/**
 * 1.5 独立留言板页面 HTML (GET /guestbook 或 /messages)
 */
function renderGuestbookHtml() {
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
            <a href="/" class="back-btn">← 返回主页</a>
            <div style="display:flex; gap:16px; align-items:center;">
                <a href="/articles" style="font-size:0.88rem; color:var(--accent); text-decoration:underline;">文章列表</a>
                <a href="/admin" class="admin-link">[管理后台]</a>
            </div>
        </div>

        <header class="page-header">
            <h1 class="page-title">留言板</h1>
            <p class="page-subtitle">欢迎在此交流探讨、留下您的想法或建议（留言经管理员审核后公开展示）</p>
        </header>

        <!-- 发表留言表单 -->
        <div class="guestbook-form-box">
            <h3 style="font-family:var(--font-serif); font-size:1.15rem; font-weight:500; margin-bottom:14px; color:var(--text-main);">发表留言</h3>
            <form onsubmit="handleGuestbookSubmit(event)">
                <div style="margin-bottom:12px; display:flex; gap:10px; align-items:center;">
                    <label style="font-size:0.85rem; color:var(--text-muted); white-space:nowrap;">您的称呼:</label>
                    <input type="text" id="gb-author" placeholder="例如: 某技术同行 (可自定义，默认: 匿名读者)" style="flex:1; padding:8px 12px; font-size:0.88rem; border:1px solid var(--border); border-radius:4px; background:var(--bg-page); color:var(--text-main);" />
                </div>
                <div style="margin-bottom:12px;">
                    <textarea id="gb-content" required rows="4" placeholder="写下您的技术探讨、阅读感受或问题交流...（留言将在管理员审核通过后公开展示）" style="width:100%; box-sizing:border-box; padding:10px 12px; font-size:0.9rem; border:1px solid var(--border); border-radius:4px; background:var(--bg-page); color:var(--text-main); font-family:var(--font-sans); resize:vertical;"></textarea>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                    <span id="gb-status-msg" style="font-size:0.84rem;"></span>
                    <button type="submit" id="gb-submit-btn" style="background:var(--accent); color:white; border:none; border-radius:4px; padding:8px 22px; font-size:0.88rem; font-weight:500; cursor:pointer;">提交留言</button>
                </div>
            </form>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:16px;">
            <h3 style="font-family:var(--font-serif); font-size:1.2rem; font-weight:500; color:var(--text-main);">💬 全部公开留言 (<span id="gb-count">0</span>)</h3>
            <span style="font-size:0.78rem; color:var(--text-light);">已审核通过的公开留言</span>
        </div>

        <!-- 留言列表展示 -->
        <div id="gb-messages-list">
            <div style="font-size:0.85rem; color:var(--text-light); font-style:italic; padding:20px 0;">加载留言中...</div>
        </div>

        <footer>
            <span>© 2026 维托里奥 崔 · All Rights Reserved</span>
            <a href="/admin" class="admin-link">[管理后台]</a>
        </footer>
    </div>

    <script>
        function escapeHtml(str) {
            if (!str) return '';
            return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        }

        async function loadGuestbookMessages() {
            const listEl = document.getElementById('gb-messages-list');
            const countEl = document.getElementById('gb-count');
            try {
                const res = await fetch('/api/comments');
                const data = await res.json();
                const approved = Array.isArray(data) ? data : [];
                countEl.innerText = approved.length;
                if (approved.length === 0) {
                    listEl.innerHTML = '<div style="background:var(--bg-card); border:1px dashed var(--border); border-radius:6px; padding:32px; text-align:center; color:var(--text-light); font-size:0.88rem;">暂无公开留言，欢迎成为第一个交流的读者。</div>';
                    return;
                }
                listEl.innerHTML = approved.map(c => 
                    '<div class="msg-card">' +
                        '<div class="msg-head">' +
                            '<div>' +
                                '<span class="msg-author">' + escapeHtml(c.author || '匿名读者') + '</span>' +
                                (c.articleTitle ? '<span style="font-size:0.75rem; color:var(--text-light); margin-left:8px;">(' + escapeHtml(c.articleTitle) + ')</span>' : '') +
                            '</div>' +
                            '<span class="msg-date">' + escapeHtml(c.createdAt || '') + '</span>' +
                        '</div>' +
                        '<div class="msg-content">' + escapeHtml(c.content || '') + '</div>' +
                    '</div>'
                ).join('');
            } catch (e) {
                listEl.innerHTML = '<div style="font-size:0.85rem; color:var(--text-light);">加载留言失败，请刷新重试</div>';
            }
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
                    contentInput.value = '';
                    statusMsg.style.color = '#28a745';
                    statusMsg.innerText = '✓ 留言已成功提交，待管理员审核通过后公开展示。';
                } else {
                    statusMsg.style.color = '#dc3545';
                    statusMsg.innerText = '提交失败，请稍后重试。';
                }
            } catch (err) {
                statusMsg.style.color = '#dc3545';
                statusMsg.innerText = '网络异常，提交失败。';
            } finally {
                btn.disabled = false;
                btn.innerText = '提交留言';
            }
        }

        loadGuestbookMessages();
    </script>
</body>
</html>`;
}

/**
 * 2. 独立工作经历页面 HTML (GET /experience)
 */
function renderExperienceHtml() {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>工作经历 (Work Experience) — 维托里奥 崔</title>
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
            <a href="/" class="back-btn">← 返回主页</a>
            <a href="/admin" class="admin-link">[管理后台]</a>
        </div>

        <header class="page-header">
            <h1 class="page-title">工作经历与工程履历</h1>
            <p class="page-subtitle">
                <strong>维托里奥 崔 (Vittorio Cui)</strong> · AI 研究员。<br>
                目前致力于实现 AGI，对国内外 AI 技术与产品发展趋势非常了解。深耕大模型部署 (vLLM / 推理加速)、Agent 系统设计与万级 QPS、99.99% SLA 的高可用微服务底盘工程。
            </p>
        </header>

        <!-- 1. Hightouch 详尽履历 -->
        <div class="exp-card">
            <div class="exp-card-header">
                <div>
                    <span class="exp-company">Hightouch</span>
                    <span class="exp-role-title">· AI 项目负责人 / AI Researcher</span>
                </div>
                <span class="exp-period">2024 — Present</span>
            </div>
            <div class="exp-detail-text">
                <p>过去21个月，作为AI项目负责人，我成功主导落地了14个AI Agent与研发赋能项目，全面驱动了公司的跨部门智能化升级：</p>
                <ul>
                    <li>迅速让团队掌握主流AI研发工具（Claude Code, OpenCode, n8n, Codex等），具备将前沿AI研发效能工具转化为团队生产力的能力。</li>
                    <li>在技术与效能方面，从零搭建AI Agent专属云端环境，基于MCP架构打通Github、Slack、CircleCI等核心系统，实现自动化测试与部署闭环，使整体研发效能提升了40%。同时，通过完善核心知识库（agents.md）与开发可视化管理工具，成功赋能非技术团队独立操作，大幅降低了跨团队的沟通与协作成本。</li>
                    <li>在项目管理与业务交付方面，我严格把控需求落地与质量。14个核心项目均实现了100%按期高质量交付，有效解决了工程师的底层痛点，业务部门（客户）满意度极高。通过持续引入前沿技术，在实现降本增效的同时，确保了团队的AI生产力始终保持行业领先标准。</li>
                </ul>
            </div>
        </div>

        <!-- 2. eBay -->
        <div class="exp-card">
            <div class="exp-card-header">
                <div>
                    <span class="exp-company">eBay (亿贝)</span>
                    <span class="exp-role-title">· AI Tech Expert</span>
                </div>
                <span class="exp-period">2022 — 2024</span>
            </div>
            <div class="exp-detail-text">
                <ul>
                    <li>主导 eBay 全局 AI 基础平台底座建设与向量检索引擎优化，支持海量跨境电商 SKU 的精准多模态检索与语义召回。</li>
                    <li>设计与落地千万级用户规模的客服智能体系统，实现多轮意图辨析、订单追踪与退换货业务流全自动闭环。</li>
                    <li>搭建高可用 RAG 混合召回通道，建立生产级 LLM 安全护栏 (Guardrails) 与延迟敏感型模型服务降级熔断策略。</li>
                </ul>
            </div>
        </div>

        <!-- 3. 快手 -->
        <div class="exp-card">
            <div class="exp-card-header">
                <div>
                    <span class="exp-company">Kuaishou (快手)</span>
                    <span class="exp-role-title">· 资深服务端开发工程师 / 项目主 R (Senior Backend Engineer / Tech Lead)</span>
                </div>
                <span class="exp-period">2020.12 — 2022.05</span>
            </div>
            <div class="exp-detail-text">
                <ul>
                    <li><strong>电商“理想家”创新房产业务（0 到 1 架构与高并发）：</strong>负责楼盘、线索等核心模块设计与研发。采用 DDD（领域驱动设计）理念与微服务拆分架构，主导多个独立微服务从 0 到 1 的项目搭建、研发与稳定上线，通过深层链路优化将楼盘落地页峰值承载能力提升至 QPS 10,000+。</li>
                    <li><strong>本地生活平台建设（项目主 R 与跨团队协同）：</strong>深度参与快手面向本地商家的 O2O 闭环平台建设，作为项目主 R（Tech Owner）统筹负责本地商品、交易结算、营销中心等核心服务模块；跨部门协调多团队高效协同开发，保障复杂需求的高质量交付。</li>
                    <li><strong>工程全生命周期质量把控与团队培养：</strong>建立严密的研发全生命周期工程质量机制（需求前严格技术方案评审、开发中追求高内聚低耦合的代码扩展性与可维护性、上线前主导组内 Code Review、上线后完善高可用监控告警覆盖及全链路运行数据看板复盘）；负责团队新人带教指导，帮助新人快速融入业务开发与敏捷交付。</li>
                </ul>
            </div>
        </div>

        <!-- 战略级客户服务履历 -->
        <div class="clients-box">
            <div class="clients-title">🏛️ 深度赋能的重要机构与客户</div>
            <p style="font-size:0.9rem; color:var(--text-muted);">
                深度服务包括 <strong>海洋网联船务 (Ocean Network Express, ONE)</strong> 智能航运海关单证自动化 Agent 系统、<strong>IBM</strong> 云原生多智能体平台协同，以及多家出海跨境贸易与金融科技核心系统的架构设计与交付。
            </p>
        </div>

        <hr />

        <!-- 教育背景 -->
        <section>
            <h2 class="sec-title">教育背景 (Education)</h2>
            <table class="edu-table">
                <tr>
                    <td class="edu-label">Ph.D. (博士):</td>
                    <td><strong>Abide 大学</strong> · 计算机与前沿系统研究方向</td>
                </tr>
                <tr>
                    <td class="edu-label">B.E. (学士):</td>
                    <td><strong>北京邮电大学 (BUPT)</strong> · 软件工程学士</td>
                </tr>
            </table>
        </section>

        <footer>
            <a href="/" class="back-btn">← 返回主页</a>
            <a href="/admin" class="admin-link">[管理后台]</a>
        </footer>
    </div>
</body>
</html>`;
}

/**
 * 3. 极简主页 HTML (GET /)
 * 首页不显示文章，仅展示“关于我”与“经历”
 */
function renderPublicHtml() {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>维托里奥 崔 — AI 研究员</title>
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
                    <h1 class="author-name" id="author-display-name">维托里奥 崔</h1>
                </div>
                
                <p class="header-intro" id="header-intro-text">
                    你好，我目前是一名 AI 研究员。我文笔干练优美、风趣幽默，发布的多篇文章深受海内外读者喜爱。目前致力于实现 AGI，对国内外AI技术发展趋势以及产品发展趋势非常了解。曾深度服务 eBay、海洋网联船务 (ONE)、IBM 等全球大客户落地智能体系统。
                </p>

                <!-- 导航：文章、Email 与 留言板 -->
                <div class="header-links">
                    <a class="header-link" href="/articles" id="link-articles">文章</a>
                    <a class="header-link" href="mailto:${CONFIG.email}" id="link-email">Email</a>
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
                        <td class="info-value" id="val-position">AI 研究员</td>
                    </tr>
                    <tr>
                        <td class="info-label" id="lbl-focus">核心领域:</td>
                        <td class="info-value" id="val-focus" style="font-weight:500;">AI, 软件开发, 系统设计, 团队管理</td>
                    </tr>
                    <tr>
                        <td class="info-label" id="lbl-tech">技术栈:</td>
                        <td class="info-value" id="val-tech">Python, Java (Spring Boot), Go, C++, vLLM, LangGraph, MCP, Redis, PostgreSQL, Docker</td>
                    </tr>
                    <tr>
                        <td class="info-label" id="lbl-edu">教育背景:</td>
                        <td class="info-value" id="val-education">博士 (Ph.D.), Abide 大学 | 软件工程学士, 北京邮电大学 (BUPT)</td>
                    </tr>
                    <tr>
                        <td class="info-label" id="lbl-lang">日常语言:</td>
                        <td class="info-value" id="val-languages">中文 (母语), 英文 (流利)</td>
                    </tr>
                    <tr>
                        <td class="info-label" id="lbl-email">联系邮箱:</td>
                        <td class="info-value"><a href="mailto:${CONFIG.email}">${CONFIG.email}</a></td>
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
                <!-- Hightouch 核心成就（14个AI Agent项目） -->
                <div class="exp-item">
                    <div class="exp-head">
                        <div>
                            <span class="exp-company">Hightouch</span>
                            <span class="exp-role-badge">· AI 项目负责人 / AI Researcher</span>
                        </div>
                        <span class="exp-date">2024 — Present</span>
                    </div>
                    <div class="exp-desc" id="exp-desc-hightouch">
                        <p>过去21个月，作为AI项目负责人，我成功主导落地了14个AI Agent与研发赋能项目，全面驱动了公司的跨部门智能化升级：</p>
                        <ul>
                            <li>迅速让团队掌握主流AI研发工具（Claude Code, OpenCode, n8n, Codex等），具备将前沿AI研发效能工具转化为团队生产力的能力。</li>
                            <li>在技术与效能方面，从零搭建AI Agent专属云端环境，基于MCP架构打通Github、Slack、CircleCI等核心系统，实现自动化测试与部署闭环，使整体研发效能提升了40%。同时，通过完善核心知识库（agents.md）与开发可视化管理工具，成功赋能非技术团队独立操作，大幅降低了跨团队的沟通与协作成本。</li>
                            <li>在项目管理与业务交付方面，我严格把控需求落地与质量。14个核心项目均实现了100%按期高质量交付，有效解决了工程师的底层痛点，业务部门（客户）满意度极高。通过持续引入前沿技术，在实现降本增效的同时，确保了团队的AI生产力始终保持行业领先标准。</li>
                        </ul>
                    </div>
                </div>

                <!-- eBay -->
                <div class="exp-item">
                    <div class="exp-head">
                        <div>
                            <span class="exp-company">eBay (亿贝)</span>
                            <span class="exp-role-badge">· AI Tech Expert</span>
                        </div>
                        <span class="exp-date">2022 — 2024</span>
                    </div>
                    <div class="exp-desc" id="exp-desc-ebay">
                        主导全局电商 AI Platform 基础底座建设，搭建多模态向量检索与高可用 RAG，落地千万级用户规模的客服智能体中枢。
                    </div>
                </div>

                <!-- 快手 -->
                <div class="exp-item">
                    <div class="exp-head">
                        <div>
                            <span class="exp-company">Kuaishou (快手)</span>
                            <span class="exp-role-badge">· Senior Backend / Tech Lead</span>
                        </div>
                        <span class="exp-date">2020 — 2022</span>
                    </div>
                    <div class="exp-desc" id="exp-desc-kuaishou">
                        负责本地生活与电商“理想家”创新房产业务。基于 DDD 微服务从 0 到 1 搭建楼盘与线索系统，支撑落地页 QPS 10,000+；担任本地生活核心模块项目主 R，统筹商品/交易/营销跨团队协同与高可用工程闭环。
                    </div>
                </div>
            </div>
        </section>

        <!-- 4. 页脚：左侧版权，右下角管理后台入口 -->
        <footer>
            <span id="footer-copyright">© 2026 维托里奥 崔 · All Rights Reserved</span>
            <a href="/admin" class="admin-link">[管理后台]</a>
        </footer>

    </div>

    <script>
        let currentLang = 'zh';

        const i18n = {
            zh: {
                displayName: "维托里奥 崔",
                intro: "你好，我目前是一名 AI 研究员。我文笔干练优美、风趣幽默，发布的多篇文章深受海内外读者喜爱。目前致力于实现 AGI，对国内外AI技术发展趋势以及产品发展趋势非常了解。曾深度服务 eBay、海洋网联船务 (ONE)、IBM 等全球大客户落地智能体系统。",
                linkArticles: "文章",
                linkGuestbook: "留言板",
                titleAbout: "关于我",
                lblPos: "职位:",
                lblFocus: "核心领域:",
                lblTech: "技术栈:",
                lblEdu: "教育背景:",
                lblLang: "日常语言:",
                lblEmail: "联系邮箱:",
                titleExperience: "经历",
                linkFullExp: "完整工作履历与客户详情 →",
                valPosition: "AI 研究员",
                valFocus: "AI, 软件开发, 系统设计, 团队管理",
                valTech: "Python, Java (Spring Boot), Go, C++, vLLM, LangGraph, MCP, Redis, PostgreSQL, Docker",
                valEducation: "博士 (Ph.D.), Abide 大学 | 软件工程学士, 北京邮电大学 (BUPT)",
                valLanguages: "中文 (母语), 英文 (流利)",
                expEbay: "主导全局电商 AI Platform 基础底座建设，搭建多模态向量检索与高可用 RAG，落地千万级用户规模的客服智能体中枢。",
                expKuaishou: "负责本地生活与电商“理想家”创新房产业务。基于 DDD 微服务从 0 到 1 搭建楼盘与线索系统，支撑落地页 QPS 10,000+；担任本地生活核心模块项目主 R，统筹商品/交易/营销跨团队协同与高可用工程闭环。",
                footerCopyright: "© 2026 维托里奥 崔 · All Rights Reserved"
            },
            en: {
                displayName: "Vittorio Cui",
                intro: "Hello, I am currently an AI Researcher. Known for my crisp, elegant, and witty writing style, my published essays are widely enjoyed by readers globally. Currently dedicated to realizing AGI, with a profound understanding of global AI technological and product trends. Previously partnered with world-class clients including eBay, Ocean Network Express (ONE), and IBM to deploy enterprise agentic systems.",
                linkArticles: "Articles",
                linkGuestbook: "Guestbook",
                titleAbout: "About Me",
                lblPos: "Position:",
                lblFocus: "Core Focus:",
                lblTech: "Tech Stack:",
                lblEdu: "Education:",
                lblLang: "Languages:",
                lblEmail: "Email:",
                titleExperience: "Experience",
                linkFullExp: "Full work experience & client record →",
                valPosition: "AI Researcher",
                valFocus: "AI, Software Development, System Design, Team Management",
                valTech: "Python, Java (Spring Boot), Go, C++, vLLM, LangGraph, MCP, Redis, PostgreSQL, Docker",
                valEducation: "Ph.D., Abide University | B.E. in Software Engineering, BUPT",
                valLanguages: "Mandarin (Native), English (Fluent)",
                expEbay: "Built organization-wide AI Platform infrastructure; deployed LLM-based intelligent customer support agents for global e-commerce users.",
                expKuaishou: "Engineered backend services for Kuaishou Local Life and 'Ideal Home' (innovative e-commerce real estate). Architected property and lead services from 0 to 1 with DDD microservices (10,000+ peak QPS); served as Tech Owner (Project Lead) orchestrating cross-functional teams across products, transactions, and marketing systems.",
                footerCopyright: "© 2026 Vittorio Cui · All Rights Reserved"
            }
        };

        function toggleLanguage() {
            currentLang = currentLang === 'zh' ? 'en' : 'zh';
            const data = i18n[currentLang];
            document.getElementById('author-display-name').innerText = data.displayName;
            document.getElementById('header-intro-text').innerText = data.intro;
            document.getElementById('link-articles').innerText = data.linkArticles;
            document.getElementById('link-guestbook').innerText = data.linkGuestbook;
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
            document.getElementById('exp-desc-ebay').innerText = data.expEbay;
            document.getElementById('exp-desc-kuaishou').innerText = data.expKuaishou;
            document.getElementById('footer-copyright').innerText = data.footerCopyright;
        }
    </script>
</body>
</html>`;
}

/**
 * 4. 管理后台登录页面 HTML (/admin)
 */
function renderAdminLoginHtml() {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>管理登录 — 维托里奥 崔</title>
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
        <h2 style="font-family:var(--font-serif); font-size:1.65rem; margin-bottom:6px; color:var(--text-main);">文章管理后台登录</h2>
        <p style="font-size:0.86rem; color:var(--text-light); margin-bottom:22px;">维托里奥 崔 · 个人博客发布系统</p>
        <form id="login-form" onsubmit="handleLogin(event)">
            <label style="font-size:0.88rem; color:var(--text-muted);">用户名 (Username)</label>
            <input type="text" id="username" class="input-box" value="${CONFIG.adminUsername}" required />
            <label style="font-size:0.88rem; color:var(--text-muted);">密码 (Password)</label>
            <input type="password" id="password" class="input-box" placeholder="请输入管理员密码" required />
            <div id="login-err" style="color:#d9534f; font-size:0.85rem; margin-bottom:12px; display:none;"></div>
            <button type="submit" class="btn" id="login-btn">登录后台</button>
            <div style="margin-top:18px; text-align:center;">
                <a href="/" style="font-size:0.85rem; color:var(--text-light);">← 返回主页</a>
            </div>
        </form>
    </div>
    <script>
        async function handleLogin(e) {
            e.preventDefault();
            const u = document.getElementById('username').value;
            const p = document.getElementById('password').value;
            const btn = document.getElementById('login-btn');
            const err = document.getElementById('login-err');
            btn.disabled = true;
            btn.innerText = '正在验证...';
            try {
                const res = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: u, password: p })
                });
                const data = await res.json();
                if (data.success) {
                    window.location.reload();
                } else {
                    err.style.display = 'block';
                    err.innerText = '用户名或密码错误，请重试';
                    btn.disabled = false;
                    btn.innerText = '登录后台';
                }
            } catch(ex) {
                err.style.display = 'block';
                err.innerText = '网络请求失败：' + ex.message;
                btn.disabled = false;
                btn.innerText = '登录后台';
            }
        }
    </script>
</body>
</html>`;
}

/**
 * 5. 管理后台 CMS 主界面 HTML (/admin 登录后)
 */
function renderAdminCmsHtml(articlesJson, commentsJson, hasKv) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>文章与留言管理后台 — 维托里奥 崔</title>
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
                <span style="font-family:var(--font-serif); font-size:1.6rem; font-weight:500;">博客管理控制台</span>
                <span style="font-size:0.8rem; color:var(--text-light); margin-left:10px;">${hasKv ? '🟢 Cloudflare KV 实时持久化' : '🟡 体验模式'}</span>
            </div>
            <div style="display:flex; gap:10px; align-items:center;">
                <button class="btn btn-primary" onclick="openCreateModal()">➕ 发布新文章</button>
                <a href="/articles" class="btn btn-outline" style="text-decoration:none;">文章列表</a>
                <a href="/" class="btn btn-outline" style="text-decoration:none;">主页</a>
                <button class="btn btn-outline" onclick="handleLogout()">登出</button>
            </div>
        </div>

        <!-- 功能选项卡 -->
        <div class="tabs-bar">
            <button id="tab-btn-posts" class="btn btn-primary" onclick="switchAdminTab('posts')">📝 文章管理 (<span id="cnt-articles">0</span>)</button>
            <button id="tab-btn-comments" class="btn btn-outline" onclick="switchAdminTab('comments')">💬 留言审核 (<span id="cnt-pending" style="font-weight:bold; color:var(--accent);">0</span> 待审)</button>
        </div>

        <!-- 1. 文章管理视图 -->
        <div id="view-posts">
            <div id="items-list"></div>
        </div>

        <!-- 2. 留言审核视图 -->
        <div id="view-comments" style="display:none;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:10px;">
                <div style="font-size:0.88rem; color:var(--text-muted);">
                    状态筛选: 
                    <select id="comment-filter" onchange="renderAdminCommentsList()" style="padding:4px 8px; border:1px solid var(--border); border-radius:4px; font-size:0.85rem; background:var(--bg-card); color:var(--text-main);">
                        <option value="all">全部留言</option>
                        <option value="pending" selected>🟡 待审核 (Pending)</option>
                        <option value="approved">🟢 已通过展示 (Approved)</option>
                        <option value="rejected">🔴 已驳回隐藏 (Rejected)</option>
                    </select>
                </div>
                <div style="font-size:0.82rem; color:var(--text-light);">
                    审核通过的留言将在对应文章末尾即时公开展示
                </div>
            </div>
            <div id="comments-admin-list"></div>
        </div>
    </div>

    <!-- 新建/编辑文章 Modal -->
    <div id="modal" class="modal-mask">
        <div class="modal-card">
            <h3 id="modal-title" style="font-family:var(--font-serif); font-size:1.4rem; margin-bottom:16px;">编辑文章</h3>
            <form id="post-form" onsubmit="handleSave(event)">
                <input type="hidden" id="item-id" />
                <div class="form-group">
                    <label class="form-label">文章中文标题 (Title)</label>
                    <input type="text" id="item-title" class="form-input" required />
                </div>
                <div class="form-group">
                    <label class="form-label">自定义发布时间 (Publish Date，如 2025.02 或 2025-02-15)</label>
                    <input type="text" id="item-date" class="form-input" placeholder="2025.02" required />
                </div>
                <div class="form-group">
                    <label class="form-label">分类标签 (Tag)</label>
                    <input type="text" id="item-tag" class="form-input" placeholder="例如: LLM, Agent Architecture" required />
                </div>
                <div class="form-group">
                    <label class="form-label">正文内容 HTML (Content)</label>
                    <textarea id="item-content" class="form-textarea" rows="8" placeholder="<p>正文段落内容...</p>" required></textarea>
                </div>
                <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
                    <button type="button" class="btn btn-outline" onclick="closeModal()">取消</button>
                    <button type="submit" class="btn btn-primary">保存发布</button>
                </div>
            </form>
        </div>
    </div>

    <script>
        let articles = ${articlesJson};
        let comments = ${commentsJson};
        let currentAdminTab = 'posts';

        function escapeHtml(str) {
            if (!str) return '';
            return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        }

        function updateCounts() {
            document.getElementById('cnt-articles').innerText = articles.length;
            const pendingCount = comments.filter(c => c.status === 'pending').length;
            document.getElementById('cnt-pending').innerText = pendingCount;
        }

        function switchAdminTab(tab) {
            currentAdminTab = tab;
            const btnPosts = document.getElementById('tab-btn-posts');
            const btnComments = document.getElementById('tab-btn-comments');
            const viewPosts = document.getElementById('view-posts');
            const viewComments = document.getElementById('view-comments');
            
            if (tab === 'posts') {
                btnPosts.className = 'btn btn-primary';
                btnComments.className = 'btn btn-outline';
                viewPosts.style.display = 'block';
                viewComments.style.display = 'none';
            } else {
                btnPosts.className = 'btn btn-outline';
                btnComments.className = 'btn btn-primary';
                viewPosts.style.display = 'none';
                viewComments.style.display = 'block';
                renderAdminCommentsList();
            }
        }

        function renderAdminList() {
            updateCounts();
            const list = document.getElementById('items-list');
            list.innerHTML = articles.map(a => {
                const title = (a.title && (a.title.zh || a.title.en)) || a.id;
                return '<div class="item-card">' +
                    '<div>' +
                        '<strong>' + title + '</strong>' +
                        '<div style="font-size:0.8rem; color:var(--text-light); margin-top:4px;">' +
                            '发布时间: <span style="color:var(--accent); font-family:var(--font-mono);">' + a.date + '</span> · ' + (a.tag || '') +
                        '</div>' +
                    '</div>' +
                    '<div style="display:flex; gap:8px;">' +
                        '<button class="btn btn-outline" onclick="openEditModal(\'' + a.id + '\')">编辑</button>' +
                        '<button class="btn btn-danger" onclick="deleteArticle(\'' + a.id + '\')">删除</button>' +
                    '</div>' +
                '</div>';
            }).join('');
        }

        function renderAdminCommentsList() {
            updateCounts();
            const filter = document.getElementById('comment-filter') ? document.getElementById('comment-filter').value : 'all';
            const container = document.getElementById('comments-admin-list');
            
            let filtered = comments;
            if (filter !== 'all') {
                filtered = comments.filter(c => c.status === filter);
            }
            
            if (filtered.length === 0) {
                container.innerHTML = '<div style="background:var(--bg-card); border:1px dashed var(--border); border-radius:6px; padding:32px; text-align:center; color:var(--text-light); font-size:0.88rem;">当前分类下暂无留言</div>';
                return;
            }
            
            container.innerHTML = filtered.map(c => {
                let badge = '<span style="background:#fff3cd; color:#856404; padding:2px 8px; border-radius:10px; font-size:0.75rem; font-weight:500;">🟡 待审核</span>';
                if (c.status === 'approved') badge = '<span style="background:#d4edda; color:#155724; padding:2px 8px; border-radius:10px; font-size:0.75rem; font-weight:500;">🟢 已展示</span>';
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
                        (c.status !== 'approved' ? '<button class="btn btn-primary" style="background:#28a745; font-size:0.8rem; padding:4px 10px;" onclick="moderateComment(\'' + c.id + '\', \'approved\')">✓ 通过展示</button>' : '') +
                        (c.status !== 'rejected' ? '<button class="btn btn-outline" style="font-size:0.8rem; padding:4px 10px;" onclick="moderateComment(\'' + c.id + '\', \'rejected\')">✗ 驳回隐藏</button>' : '') +
                        '<button class="btn btn-danger" style="font-size:0.8rem; padding:4px 10px;" onclick="deleteComment(\'' + c.id + '\')">删除</button>' +
                    '</div>' +
                '</div>';
            }).join('');
        }

        async function moderateComment(id, status) {
            const res = await fetch('/api/admin/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status })
            });
            if (res.ok) {
                const target = comments.find(c => c.id === id);
                if (target) target.status = status;
                renderAdminCommentsList();
            } else {
                alert('审核操作失败');
            }
        }

        async function deleteComment(id) {
            if (!confirm('确定要彻底删除该留言吗？')) return;
            const res = await fetch('/api/admin/comments?id=' + encodeURIComponent(id), { method: 'DELETE' });
            if (res.ok) {
                comments = comments.filter(c => c.id !== id);
                renderAdminCommentsList();
            } else {
                alert('删除失败');
            }
        }

        function openCreateModal() {
            document.getElementById('modal-title').innerText = '新建文章';
            document.getElementById('item-id').value = 'post-' + Date.now();
            document.getElementById('item-title').value = '';
            document.getElementById('item-date').value = new Date().toISOString().slice(0,7).replace('-', '.');
            document.getElementById('item-tag').value = 'AI Architecture';
            document.getElementById('item-content').value = '<p>在这里撰写正文内容...</p>';
            document.getElementById('modal').style.display = 'flex';
        }

        function openEditModal(id) {
            const a = articles.find(x => x.id === id);
            if (!a) return;
            document.getElementById('modal-title').innerText = '编辑文章';
            document.getElementById('item-id').value = a.id;
            document.getElementById('item-title').value = (a.title && a.title.zh) || '';
            document.getElementById('item-date').value = a.date || '';
            document.getElementById('item-tag').value = a.tag || '';
            document.getElementById('item-content').value = (a.content && a.content.zh) || '';
            document.getElementById('modal').style.display = 'flex';
        }

        function closeModal() {
            document.getElementById('modal').style.display = 'none';
        }

        async function handleSave(e) {
            e.preventDefault();
            const id = document.getElementById('item-id').value;
            const titleZh = document.getElementById('item-title').value;
            const customDate = document.getElementById('item-date').value;
            const tag = document.getElementById('item-tag').value;
            const contentZh = document.getElementById('item-content').value;

            const existing = articles.find(x => x.id === id) || {};
            const payload = {
                id: id,
                title: { zh: titleZh, en: (existing.title && existing.title.en) || titleZh },
                tag: tag,
                date: customDate,
                readTime: existing.readTime || '5 min read',
                views: existing.views || '1,000+ views',
                summary: { zh: titleZh, en: titleZh },
                content: { zh: contentZh, en: (existing.content && existing.content.en) || contentZh }
            };

            const res = await fetch('/api/articles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                const idx = articles.findIndex(x => x.id === id);
                if (idx >= 0) articles[idx] = payload;
                else articles.unshift(payload);
                renderAdminList();
                closeModal();
            } else {
                alert('保存失败，请检查网络或权限');
            }
        }

        async function deleteArticle(id) {
            if (!confirm('确定要删除吗？')) return;
            const res = await fetch('/api/articles?id=' + encodeURIComponent(id), { method: 'DELETE' });
            if (res.ok) {
                articles = articles.filter(x => x.id !== id);
                renderAdminList();
            } else {
                alert('删除失败');
            }
        }

        async function handleLogout() {
            await fetch('/api/logout', { method: 'POST' });
            window.location.reload();
        }

        renderAdminList();
        renderAdminCommentsList();
        updateCounts();
    </script>
</body>
</html>`;
}

export default {
  async fetch(request, env) {
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

    // 3. API: 获取文章列表 GET /api/articles
    if ((path === "/api/articles" || path === "/articles.json") && method === "GET") {
      const items = await getArticles(env);
      return new Response(JSON.stringify(items, null, 2), {
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
        const newItem = await request.json();
        let items = await getArticles(env);
        const idx = items.findIndex(a => a.id === newItem.id);
        if (idx >= 0) items[idx] = newItem;
        else items.unshift(newItem);
        await saveArticles(env, items);
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
      let items = await getArticles(env);
      items = items.filter(a => a.id !== deleteId);
      await saveArticles(env, items);
      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json;charset=UTF-8" }
      });
    }

    // 6. API: 获取审核通过的留言列表 GET /api/comments?articleId=...
    if (path === "/api/comments" && method === "GET") {
      const allComments = await getComments(env);
      const articleId = url.searchParams.get("articleId");
      let filtered = allComments.filter(c => c.status === "approved");
      if (articleId) {
        filtered = filtered.filter(c => c.articleId === articleId);
      }
      return new Response(JSON.stringify(filtered), {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=10"
        }
      });
    }

    // 7. API: 读者提交留言 POST /api/comments
    if (path === "/api/comments" && method === "POST") {
      try {
        const body = await request.json();
        if (!body.content || !body.content.trim()) {
          return new Response(JSON.stringify({ error: "Content is required" }), { status: 400 });
        }
        const newComm = {
          id: "comm-" + Date.now(),
          articleId: body.articleId || "general",
          articleTitle: body.articleTitle || "",
          author: (body.author && body.author.trim()) ? body.author.trim().slice(0, 30) : "匿名读者",
          content: body.content.trim().slice(0, 1000),
          createdAt: new Date(Date.now() + 8 * 3600000).toISOString().replace("T", " ").slice(0, 16),
          status: "pending"
        };
        let allComments = await getComments(env);
        allComments.unshift(newComm);
        await saveComments(env, allComments);
        return new Response(JSON.stringify({ success: true, message: "留言已提交，待管理员审核通过后展示" }), {
          headers: { "Content-Type": "application/json;charset=UTF-8" }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
      }
    }

    // 8. API: 管理员获取全量留言 GET /api/admin/comments
    if (path === "/api/admin/comments" && method === "GET") {
      if (!checkAuth(request, env)) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
      }
      const allComments = await getComments(env);
      return new Response(JSON.stringify(allComments), {
        headers: { "Content-Type": "application/json;charset=UTF-8" }
      });
    }

    // 9. API: 管理员审核留言状态 POST /api/admin/comments
    if (path === "/api/admin/comments" && method === "POST") {
      if (!checkAuth(request, env)) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
      }
      try {
        const body = await request.json();
        let allComments = await getComments(env);
        const target = allComments.find(c => c.id === body.id);
        if (target) {
          target.status = body.status;
          await saveComments(env, allComments);
          return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json;charset=UTF-8" }
          });
        }
        return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
      }
    }

    // 10. API: 管理员删除留言 DELETE /api/admin/comments
    if (path === "/api/admin/comments" && method === "DELETE") {
      if (!checkAuth(request, env)) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
      }
      const deleteId = url.searchParams.get("id");
      let allComments = await getComments(env);
      allComments = allComments.filter(c => c.id !== deleteId);
      await saveComments(env, allComments);
      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json;charset=UTF-8" }
      });
    }

    // 11. 独立文章列表页面 GET /articles 或 /blog
    if (path === "/articles" || path === "/blog") {
      const items = await getArticles(env);
      return new Response(renderArticlesPageHtml(JSON.stringify(items)), {
        headers: {
          "Content-Type": "text/html;charset=UTF-8",
          "Cache-Control": "public, max-age=120"
        }
      });
    }

    // 12. 独立工作经历页面 GET /experience
    if (path === "/experience" || path === "/work-experience") {
      return new Response(renderExperienceHtml(), {
        headers: {
          "Content-Type": "text/html;charset=UTF-8",
          "Cache-Control": "public, max-age=120"
        }
      });
    }

    // 12.5. 独立留言板页面 GET /guestbook 或 /messages
    if (path === "/guestbook" || path === "/messages") {
      return new Response(renderGuestbookHtml(), {
        headers: {
          "Content-Type": "text/html;charset=UTF-8",
          "Cache-Control": "public, max-age=60"
        }
      });
    }

    // 13. 管理后台 GET /admin (未登录显示登录页面，已登录显示 CMS)
    if (path === "/admin") {
      const isAuthed = checkAuth(request, env);
      if (!isAuthed) {
        return new Response(renderAdminLoginHtml(), {
          headers: { "Content-Type": "text/html;charset=UTF-8" }
        });
      }
      const items = await getArticles(env);
      const commentsData = await getComments(env);
      const hasKv = Boolean(env && env.BLOG_KV);
      return new Response(renderAdminCmsHtml(JSON.stringify(items), JSON.stringify(commentsData), hasKv), {
        headers: { "Content-Type": "text/html;charset=UTF-8" }
      });
    }

    // 14. 公开主页 GET / (不显示文章，仅关于我与经历)
    return new Response(renderPublicHtml(), {
      headers: {
        "Content-Type": "text/html;charset=UTF-8",
        "Cache-Control": "public, max-age=120"
      }
    });
  }
};
