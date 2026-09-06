/**
 * ═════════════════════════════════════════════════════════════════════════════
 * 项目名称: TianAi (天艾) — AI Researcher & Technical Leader 个人主页与博客系统
 * 运行环境: Cloudflare Workers + Cloudflare KV (零服务器成本 · 全球毫秒级分发)
 * 开源协议: MIT License
 * 官方网站: https://drvittoria.de5.net
 * GitHub: https://github.com/velosovittoria545-oss
 * ═════════════════════════════════════════════════════════════════════════════
 * 
 * 🛠️ 快速配置说明 (CONFIG):
 * 1. 管理员账号与密码：
 *    - 默认账号: "admin"
 *    - 密码设置方式 1 (推荐)：在 Cloudflare 后台设置环境变量 ADMIN_PASSWORD，云端加密，最安全。
 *    - 密码设置方式 2 (直观)：直接在下方 CONFIG.adminPassword 中填入您自定义的密码。
 * 2. 数据库说明：
 *    - 若在 Cloudflare 绑定了 KV 命名空间 "BLOG_KV"，文章更改将永久同步至全球边缘节点。
 *    - 若尚未绑定，系统会自动进入开箱体验模式（加载下方默认的优质文章），100% 不报错。
 * ═════════════════════════════════════════════════════════════════════════════
 */

const CONFIG = {
  name: "Vittoria",
  email: "velosovittoria545@gmail.com",
  github: "https://github.com/velosovittoria545-oss",
  siteDomain: "drvittoria.de5.net",
  adminUsername: "admin",
  adminPassword: "vittoria2026!", // 请在此修改为您自己的初始后台登录密码（或在 Cloudflare 环境变量中配置 ADMIN_PASSWORD）
  statusBadgeZh: "🟢 开放企业 AI 架构咨询与前沿技术共创",
  statusBadgeEn: "🟢 Open to Enterprise AI Advisory & Frontier R&D"
};

// 预置默认精选文章（即便未连接数据库，前台与后台也能即刻呈现高质内容）
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
        "<pre><code>// 核心 Agent 执行环路伪代码 (LangGraph / StateMachine)\nasync function executeAgentTurn(state, input) {\n    const memory = await MemoryStore.retrieveClientContext(state.clientId);\n    const plan = await Planner.think(input, memory);\n    \n    for (const action of plan.actions) {\n        if (!ToolRegistry.isAuthorized(action.tool, state.role)) {\n            throw new SecurityException('Unauthorized tool access');\n        }\n        const result = await ToolExecutor.call(action.tool, action.params);\n        state.appendObservation(result);\n    }\n    return Formatter.synthesize(state);\n}</code></pre>",
        "<h3>3. 生产环境的 3 大最佳实践</h3>",
        "<p><strong>① 句子级反幻觉验证：</strong> 在模型给出回答后，利用轻量级校验模型对关键实体（金额、库存量、订单号）做交叉比对。<br><strong>② 异步事务与回滚机制：</strong> 严禁智能体直接写入主交易库，必须通过事件驱动管道（Event-Driven Queue）先写预备日志，再经由校验服务确认入库。<br><strong>③ 人机协同（Human-in-the-Loop）：</strong> 当决策置信度低于 85% 时，平滑切换为工单推送由人工复核介入，确保业务安全。</p>"
      ].join(""),
      en: [
        "<p>In enterprise production environments, simple single-turn LLM pipelines cannot sustain complex multi-step workflows. The essence of an Agent lies in the closed loop: <strong>Think → Act → Observe</strong>.</p>",
        "<h3>1. The Ceiling of Pure RAG</h3>",
        "<p>Traditional RAG architectures only solve recall for static knowledge, failing at dynamic multi-step decision-making and cross-system state mutation. When interfacing with ERP, reconciliation, and omnichannel routing, deterministic state machines become imperative.</p>",
        "<blockquote>\"In industrial deployment, the bottleneck is rarely context length, but the granularity of state isolation and defensive fallback design.\"</blockquote>",
        "<h3>2. Three-Tier Architectural Guardrails</h3>",
        "<pre><code>// Pseudocode for State-Driven Agent Execution Loop\nasync function executeAgentTurn(state, input) {\n    const memory = await MemoryStore.retrieveClientContext(state.clientId);\n    const plan = await Planner.think(input, memory);\n    \n    for (const action of plan.actions) {\n        if (!ToolRegistry.isAuthorized(action.tool, state.role)) {\n            throw new SecurityException('Unauthorized tool access');\n        }\n        const result = await ToolExecutor.call(action.tool, action.params);\n        state.appendObservation(result);\n    }\n    return Formatter.synthesize(state);\n}</code></pre>",
        "<h3>3. Key Takeaways from 10+ Enterprise Deployments</h3>",
        "<p><strong>1. Sentence-level anti-hallucination verification:</strong> Cross-validate dynamic entities (e.g. inventory numbers, pricing) against database SSOT before streaming.<br><strong>2. Event-driven queue execution:</strong> Decouple write operations through staging pipelines rather than direct transactional mutations.<br><strong>3. Human-in-the-Loop (HITL):</strong> Gracefully delegate to human operators when decision confidence dips below acceptable thresholds.</p>"
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
        "<p>在传统的注意力机制实现中，KV Cache 需要连续显存分配。这导致严重的显存碎片率（高达 60%-80%）。vLLM 通过借鉴操作系统虚拟内存分页设计的 <strong>PagedAttention</strong>，将 KV Cache 离散存储在固定大小的 Block 中，彻底消除了显存内部碎片。</p>",
        "<h3>2. 显存吞吐与 Batching 权衡矩阵</h3>",
        "<p>• <strong>实时智能客服场景：</strong> 优先追求首字延迟（TTFT < 300ms），需开启连续批处理（Continuous Batching）并保持适度的并行度。<br>• <strong>离线长文档抽取与会议分析：</strong> 追求最大吞吐（Tokens/Sec/GPU），调大 Block Size 并充分利用张量并行（Tensor Parallelism）。</p>"
      ].join(""),
      en: [
        "<p>As enterprise AI moves beyond POCs into production scale, GPU serving costs and end-to-end latency (TTFT & ITL) become make-or-break factors.</p>",
        "<h3>1. The KV Cache Memory Challenge</h3>",
        "<p>Traditional transformer implementations allocate contiguous virtual memory for KV cache, incurring up to 60-80% memory fragmentation. vLLM's PagedAttention brings OS paging mechanisms into GPU memory management to achieve near-zero wastage.</p>"
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
        "<p>不论 AI 算法如何演进，坚固的后端底座与分布式系统韧性永远是承载商业运转的地基。99.99% SLA 意味着全年不可用时间必须压减在 52 分钟以内。</p>",
        "<h3>1. 分布式幂等与防止资损</h3>",
        "<p>在峰值破万 QPS 的支付与转账场景中，网络抖动与客户端重试是常态。我们采用三级防护：前端防重 Token、网关级 Redis 分布式防重锁以及底层数据库唯一联合约束索引，彻底杜绝单笔交易重复扣款风险。</p>",
        "<h3>2. 灰度发布与秒级故障自愈</h3>",
        "<p>依托 Prometheus 核心指标采集与动态熔断器（Sentinel），建立基于错误率波动的自动化降级旁路，确保在极端拥堵情况下核心收银台链路依然高可用。</p>"
      ].join(""),
      en: [
        "<p>Regardless of how rapidly AI evolves, rock-solid distributed backend foundations remain the cornerstone of enterprise execution. Achieving a 99.99% SLA leaves less than 52 minutes of total downtime per year.</p>"
      ].join("")
    }
  }
];

/**
 * ═════════════════════════════════════════════════════════════════════════════
 * 辅助函数：获取有效管理员密码与文章持久化
 * ═════════════════════════════════════════════════════════════════════════════
 */
function getAdminPassword(env) {
  return (env && env.ADMIN_PASSWORD) ? env.ADMIN_PASSWORD : CONFIG.adminPassword;
}

// 从 KV 读取或获取默认文章列表
async function getArticles(env) {
  if (env && env.BLOG_KV) {
    try {
      const data = await env.BLOG_KV.get("ARTICLES_DATA", "json");
      if (data && Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch (e) {
      console.error("KV Read Error:", e);
    }
  }
  return DEFAULT_ARTICLES;
}

// 写入文章列表到 KV
async function saveArticles(env, articles) {
  if (env && env.BLOG_KV) {
    await env.BLOG_KV.put("ARTICLES_DATA", JSON.stringify(articles));
    return true;
  }
  return false;
}

// 简单高效的边缘签名 Session 鉴权（无需第三方库）
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
    const token = match[1];
    return token === generateAuthToken(env);
  }
  const authHeader = request.headers.get("Authorization") || "";
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7) === generateAuthToken(env);
  }
  return false;
}

/**
 * ═════════════════════════════════════════════════════════════════════════════
 * HTML 模板：前台展示页面
 * ═════════════════════════════════════════════════════════════════════════════
 */
function renderPublicHtml(articlesJson) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${CONFIG.name} — AI Researcher & Technical Leader</title>
    <meta name="description" content="Vittoria - AI Researcher & Technical Leader. Ph.D. Abide University, BUPT Software Engineering. Agent/RAG Architecture, vLLM Inference Optimization, High-Concurrency Backend.">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-page: #FAF8F5;
            --bg-card: #FFFFFF;
            --bg-subtle: #F3EFEA;
            --bg-pill: #ECE6DE;
            --text-main: #191919;
            --text-muted: #5C5852;
            --text-light: #8C867E;
            --accent-terracotta: #CC785C;
            --accent-terracotta-hover: #b86448;
            --accent-terracotta-bg: #F8ECE7;
            --border-color: #E6E0D6;
            --border-subtle: #EFEAE3;
            --font-serif: 'Newsreader', Georgia, serif;
            --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            --font-mono: 'JetBrains Mono', monospace;
            --radius-sm: 8px;
            --radius-md: 14px;
            --radius-lg: 20px;
            --shadow-subtle: 0 1px 3px rgba(0,0,0,0.02), 0 4px 12px rgba(0,0,0,0.03);
            --shadow-hover: 0 6px 20px rgba(204, 120, 92, 0.08), 0 2px 6px rgba(0,0,0,0.04);
            --transition-smooth: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body {
            font-family: var(--font-sans);
            background-color: var(--bg-page);
            color: var(--text-main);
            line-height: 1.7;
            -webkit-font-smoothing: antialiased;
        }
        .container { max-width: 900px; margin: 0 auto; padding: 40px 24px 100px; }
        .top-nav {
            display: flex; justify-content: space-between; align-items: center;
            margin-bottom: 50px; padding-bottom: 20px; border-bottom: 1px solid var(--border-color);
            position: sticky; top: 0; background: rgba(250, 248, 245, 0.94);
            backdrop-filter: blur(10px); z-index: 100;
        }
        .brand-signature {
            font-family: var(--font-serif); font-size: 1.5rem; font-weight: 500;
            color: var(--text-main); text-decoration: none; display: flex; align-items: center; gap: 8px;
        }
        .brand-dot { width: 8px; height: 8px; background-color: var(--accent-terracotta); border-radius: 50%; }
        .nav-links { display: flex; gap: 20px; align-items: center; }
        .nav-link { font-size: 0.9rem; color: var(--text-muted); text-decoration: none; transition: var(--transition-smooth); }
        .nav-link:hover { color: var(--accent-terracotta); }
        .nav-actions { display: flex; align-items: center; gap: 10px; }
        .icon-btn {
            display: inline-flex; align-items: center; gap: 6px; font-size: 0.84rem;
            color: var(--text-muted); text-decoration: none; padding: 6px 14px;
            border-radius: 9999px; border: 1px solid var(--border-color); background: var(--bg-card);
            transition: var(--transition-smooth); cursor: pointer;
        }
        .icon-btn:hover {
            color: var(--accent-terracotta); border-color: var(--accent-terracotta);
            background: var(--accent-terracotta-bg); transform: translateY(-1px);
        }
        .icon-btn svg { width: 15px; height: 15px; fill: currentColor; }
        .lang-btn {
            background: var(--text-main); color: var(--bg-page); border: none;
            padding: 6px 14px; border-radius: 9999px; font-size: 0.8rem;
            font-family: var(--font-mono); cursor: pointer; transition: var(--transition-smooth);
        }
        .hero { margin-bottom: 60px; }
        .hero-status {
            display: inline-flex; align-items: center; gap: 6px; font-family: var(--font-mono);
            font-size: 0.78rem; color: #2e6930; background: #EBF5EC; border: 1px solid #D2E7D4;
            padding: 4px 12px; border-radius: 9999px; margin-bottom: 18px;
        }
        .hero h1 {
            font-family: var(--font-serif); font-size: 3.5rem; font-weight: 400;
            letter-spacing: -0.03em; line-height: 1.15; color: var(--text-main); margin-bottom: 10px;
        }
        .hero-role {
            font-family: var(--font-mono); font-size: 0.95rem; color: var(--accent-terracotta);
            background: var(--accent-terracotta-bg); display: inline-block; padding: 4px 14px;
            border-radius: 9999px; margin-bottom: 24px; font-weight: 500;
        }
        .hero-intro {
            font-size: 1.12rem; line-height: 1.85; color: var(--text-muted); background: var(--bg-card);
            padding: 34px 38px; border-radius: var(--radius-lg); border: 1px solid var(--border-color);
            box-shadow: var(--shadow-subtle);
        }
        .hero-intro strong { color: var(--text-main); font-weight: 600; }
        .hero-action-bar { display: flex; gap: 12px; margin-top: 24px; flex-wrap: wrap; }
        section { margin-bottom: 65px; }
        .section-header {
            display: flex; align-items: baseline; justify-content: space-between;
            margin-bottom: 22px; padding-bottom: 12px; border-bottom: 1px solid var(--border-color);
        }
        h2 { font-family: var(--font-serif); font-size: 1.85rem; font-weight: 400; color: var(--text-main); }
        .section-label { font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.06em; }
        
        .system-card {
            background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg);
            padding: 36px; box-shadow: var(--shadow-subtle); position: relative; overflow: hidden;
        }
        .system-card::before { content: ''; position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: var(--accent-terracotta); }
        .system-pill { font-family: var(--font-mono); font-size: 0.78rem; color: var(--accent-terracotta); text-transform: uppercase; margin-bottom: 10px; }
        .system-title { font-family: var(--font-serif); font-size: 1.8rem; font-weight: 500; margin-bottom: 12px; }
        .system-desc { font-size: 1.02rem; color: var(--text-muted); margin-bottom: 26px; }
        .metrics-bar { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 30px; }
        .metric-item { background: var(--bg-subtle); border-radius: var(--radius-md); padding: 16px 18px; text-align: center; border: 1px solid var(--border-subtle); }
        .metric-val { font-family: var(--font-serif); font-size: 2.1rem; color: var(--accent-terracotta); line-height: 1.1; }
        .metric-title { font-size: 0.84rem; color: var(--text-muted); margin-top: 6px; }
        .features-grid { list-style: none; display: grid; grid-template-columns: 1fr 1fr; gap: 14px 20px; }
        .features-grid li { position: relative; padding-left: 20px; font-size: 0.94rem; color: var(--text-main); }
        .features-grid li::before { content: '•'; position: absolute; left: 0; color: var(--accent-terracotta); font-size: 1.2rem; }
        .tech-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border-subtle); }
        .tech-tag { font-family: var(--font-mono); font-size: 0.76rem; padding: 4px 10px; background: var(--bg-subtle); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-muted); }

        .blog-list { display: flex; flex-direction: column; gap: 16px; }
        .blog-card {
            background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md);
            padding: 24px 28px; box-shadow: var(--shadow-subtle); cursor: pointer; transition: var(--transition-smooth);
        }
        .blog-card:hover { border-color: var(--accent-terracotta); transform: translateY(-2px); box-shadow: var(--shadow-hover); }
        .blog-meta { display: flex; gap: 14px; font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-light); margin-bottom: 8px; }
        .blog-tag { background: var(--accent-terracotta-bg); color: var(--accent-terracotta); padding: 2px 8px; border-radius: 4px; }
        .blog-title { font-family: var(--font-serif); font-size: 1.45rem; color: var(--text-main); margin-bottom: 8px; }
        .blog-snippet { font-size: 0.94rem; color: var(--text-muted); margin-bottom: 12px; }
        .blog-footer { display: flex; justify-content: space-between; font-size: 0.84rem; color: var(--text-light); }
        .read-more-link { color: var(--accent-terracotta); font-weight: 500; }

        #article-reader {
            display: none; background: var(--bg-card); border: 1px solid var(--border-color);
            border-radius: var(--radius-lg); padding: 40px; margin-bottom: 40px; box-shadow: var(--shadow-subtle);
        }
        .reader-back-btn {
            display: inline-flex; align-items: center; gap: 6px; background: var(--bg-subtle);
            border: 1px solid var(--border-color); color: var(--text-muted); padding: 8px 16px;
            border-radius: 9999px; cursor: pointer; font-size: 0.86rem; margin-bottom: 24px;
        }
        .reader-title { font-family: var(--font-serif); font-size: 2.2rem; margin-bottom: 14px; }
        .reader-meta { display: flex; gap: 16px; padding-bottom: 20px; margin-bottom: 28px; border-bottom: 1px solid var(--border-subtle); font-family: var(--font-mono); font-size: 0.84rem; color: var(--text-light); }
        .reader-body { font-size: 1.05rem; line-height: 1.85; color: var(--text-main); }
        .reader-body h3 { font-family: var(--font-serif); font-size: 1.5rem; margin: 32px 0 14px; }
        .reader-body p { margin-bottom: 18px; }
        .reader-body pre { background: #21201D; color: #FAF8F5; padding: 18px 22px; border-radius: var(--radius-md); overflow-x: auto; font-family: var(--font-mono); font-size: 0.88rem; margin: 20px 0; }
        .reader-body code { font-family: var(--font-mono); background: var(--bg-subtle); padding: 2px 6px; border-radius: 4px; color: var(--accent-terracotta); }
        .reader-body pre code { background: transparent; color: inherit; padding: 0; }
        .reader-body blockquote { border-left: 3px solid var(--accent-terracotta); padding: 8px 20px; background: var(--bg-subtle); margin: 20px 0; font-style: italic; }

        .clients-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 14px; }
        .client-box { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 22px 24px; box-shadow: var(--shadow-subtle); }
        .client-name { font-weight: 600; font-size: 1.05rem; display: flex; justify-content: space-between; margin-bottom: 6px; }
        .client-tag { font-family: var(--font-mono); font-size: 0.72rem; color: var(--accent-terracotta); background: var(--accent-terracotta-bg); padding: 2px 8px; border-radius: 4px; }
        .client-desc { font-size: 0.88rem; color: var(--text-muted); }

        .skills-list { display: flex; flex-direction: column; gap: 12px; }
        .skill-item { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 20px 24px; box-shadow: var(--shadow-subtle); }
        .skill-item strong { color: var(--accent-terracotta); margin-right: 6px; }

        .method-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; }
        .method-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 22px; box-shadow: var(--shadow-subtle); }
        .method-card-num { font-family: var(--font-mono); font-size: 0.75rem; color: var(--accent-terracotta); font-weight: 600; margin-bottom: 8px; }
        .method-card-title { font-weight: 600; margin-bottom: 8px; }
        .method-card-desc { font-size: 0.88rem; color: var(--text-muted); }

        .exp-list { display: flex; flex-direction: column; gap: 14px; }
        .exp-block { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); overflow: hidden; box-shadow: var(--shadow-subtle); }
        .exp-head { display: flex; justify-content: space-between; align-items: center; padding: 22px 26px; cursor: pointer; user-select: none; }
        .exp-title-text { font-size: 1.15rem; font-weight: 600; }
        .exp-period { font-family: var(--font-mono); font-size: 0.84rem; color: var(--text-light); margin-top: 4px; }
        .exp-toggle-icon { color: var(--accent-terracotta); font-family: var(--font-mono); font-size: 1.3rem; margin-left: 16px; }
        .exp-details { max-height: 0; opacity: 0; overflow: hidden; transition: all 0.35s ease; padding: 0 26px; background: #FCFAF8; }
        .exp-details.active { padding: 0 26px 26px; border-top: 1px solid var(--border-subtle); }
        .exp-focus { font-size: 0.96rem; font-style: italic; color: var(--accent-terracotta); margin: 16px 0 12px; }
        .exp-bullets-list { list-style: none; }
        .exp-bullets-list li { position: relative; padding-left: 20px; font-size: 0.94rem; color: var(--text-muted); margin-bottom: 10px; }
        .exp-bullets-list li::before { content: '—'; position: absolute; left: 0; color: var(--accent-terracotta); }

        .edu-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .edu-box { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 22px 24px; box-shadow: var(--shadow-subtle); }
        .edu-degree { font-family: var(--font-serif); font-size: 1.25rem; font-weight: 500; }
        .edu-school { font-size: 0.92rem; color: var(--text-muted); margin-top: 4px; }

        .hobbies-tags { display: flex; gap: 10px; flex-wrap: wrap; }
        .hobby-tag { background: var(--bg-subtle); border: 1px solid var(--border-color); padding: 6px 18px; border-radius: 9999px; font-size: 0.9rem; color: var(--text-muted); }

        #toast {
            position: fixed; bottom: 30px; right: 30px; background: #191919; color: #FAF8F5;
            padding: 12px 20px; border-radius: 9999px; font-size: 0.88rem; box-shadow: 0 8px 24px rgba(0,0,0,0.15);
            display: flex; align-items: center; gap: 8px; opacity: 0; transform: translateY(15px);
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); z-index: 9999; pointer-events: none;
        }
        #toast.show { opacity: 1; transform: translateY(0); }

        footer {
            margin-top: 80px; padding-top: 30px; border-top: 1px solid var(--border-color);
            display: flex; justify-content: space-between; font-size: 0.86rem; color: var(--text-light);
            font-family: var(--font-mono); flex-wrap: wrap; gap: 14px;
        }
        .footer-links { display: flex; gap: 16px; }
        .footer-link { color: var(--text-light); text-decoration: none; }
        .footer-link:hover { color: var(--accent-terracotta); }

        @media (max-width: 768px) {
            .container { padding: 25px 18px 60px; }
            .hero h1 { font-size: 2.6rem; }
            .metrics-bar, .features-grid, .edu-grid { grid-template-columns: 1fr; }
            .top-nav { flex-direction: column; align-items: flex-start; gap: 16px; position: static; }
        }
    </style>
</head>
<body>
    <div class="container">
        <nav class="top-nav">
            <a href="#overview" class="brand-signature">
                <span>${CONFIG.name}</span>
                <span class="brand-dot"></span>
            </a>
            <div class="nav-links">
                <a href="#overview" class="nav-link" id="nav-overview">概览</a>
                <a href="#project" class="nav-link" id="nav-project">专项架构</a>
                <a href="#blog" class="nav-link" id="nav-blog">技术随笔</a>
                <a href="#experience" class="nav-link" id="nav-experience">履历</a>
            </div>
            <div class="nav-actions">
                <a class="icon-btn" href="${CONFIG.github}" target="_blank" rel="noopener noreferrer">
                    <svg viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                    <span>GitHub</span>
                </a>
                <button class="icon-btn" id="btn-nav-copy-email">
                    <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                    <span>${CONFIG.email}</span>
                </button>
                <button class="lang-btn" id="lang-btn">EN / 中文</button>
            </div>
        </nav>

        <div class="hero" id="overview">
            <div class="hero-status" id="hero-status">${CONFIG.statusBadgeZh}</div>
            <h1>${CONFIG.name}</h1>
            <div class="hero-role" id="role">AI 研究员 // 技术负责人</div>
            <div class="hero-intro" id="about-text">
                北邮软件工程科班出身，<strong>Abide大学博士</strong>，拥有极强的AI前沿技术研发与落地能力。早期深耕后端架构，<strong>技术管理经验丰富</strong>，具备卓越的技术视野与团队领导力。自<strong>2021年起全面转型AI领域</strong>，熟悉Agent/RAG架构及vLLM底层推理优化。拥有QPS破万、SLA 99.99%的高并发工程底盘，能将复杂大模型技术深度融合业务场景，主导智能体落地。此外，持续输出具有行业影响力的技术随笔，<strong>累计阅读量近百万</strong>，赋能CXO级方案共创，保障百万级项目的高质量交付与商业闭环。
            </div>
            <div class="hero-action-bar">
                <a href="${CONFIG.github}" target="_blank" rel="noopener noreferrer" class="icon-btn">
                    <svg viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                    <span id="hero-github-btn">查看 GitHub 仓库</span>
                </a>
                <button class="icon-btn" id="btn-hero-copy-email">
                    <svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
                    <span id="hero-email-btn">一键复制邮箱 (${CONFIG.email})</span>
                </button>
                <button class="icon-btn" onclick="window.print()">
                    <svg viewBox="0 0 24 24"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>
                    <span id="hero-print-btn">打印 / 保存 PDF 简历</span>
                </button>
            </div>
        </div>

        <section id="project">
            <div class="section-header">
                <h2 id="project-title">专项研发项目与架构设计</h2>
                <span class="section-label">Architecture Deep-Dive</span>
            </div>
            <div class="system-card">
                <div class="system-pill" id="project-tag">独立全栈架构与开发 (Solo Architecture)</div>
                <div class="system-title" id="project-name">基于 AI-Agent 的企业业务操作系统 (Enterprise Business OS)</div>
                <div class="system-desc" id="project-desc">
                    独立全栈设计与落地：单一数据源（Single Source of Truth）驱动所有系统，协同前端网站门户、AI 智能体集群、大模型推理中枢、全渠道通信与无人值守运营。
                </div>
                <div class="metrics-bar">
                    <div class="metric-item">
                        <div class="metric-val">+4,300</div>
                        <div class="metric-title" id="metric-1-lbl">数据字段架构</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-val">9</div>
                        <div class="metric-title" id="metric-2-lbl">核心系统底座连接</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-val">+150h</div>
                        <div class="metric-title" id="metric-3-lbl">每月自动化节省工时</div>
                    </div>
                </div>
                <div style="margin-top:20px; padding-top:20px; border-top: 1px dashed var(--border-color);">
                    <ul class="features-grid" id="project-features">
                        <li>功能齐备的 ERP 架构：包含 496 个核心字段与 50+ 自动校验链路</li>
                        <li>集成游戏化 CRM 与通信：整合 Aircall、铜牌至白金会员流转</li>
                        <li>无头 CMS 与智能库存：全自动同步网站并实现最低库存采购触发</li>
                        <li>全渠道自动化沟通：短信、WhatsApp、邮件多智能体协同与自动回复</li>
                        <li>自动化财务与对账：银行对账、发票开具与费用自动流转</li>
                        <li>智能预约与即时库存：动态核验预约日程并自动触发紧急采购工单</li>
                    </ul>
                </div>
                <div class="tech-tags">
                    <span class="tech-tag">vLLM Inference</span>
                    <span class="tech-tag">Multi-Agent Workflow</span>
                    <span class="tech-tag">Python & FastAPI</span>
                    <span class="tech-tag">Redis Vector Cache</span>
                    <span class="tech-tag">Cloudflare Workers KV</span>
                    <span class="tech-tag">PostgreSQL SSOT</span>
                </div>
            </div>
        </section>

        <section id="blog">
            <div class="section-header">
                <h2 id="blog-title">精选技术随笔与深度洞察</h2>
                <span class="section-label" id="blog-badge">近 1,000,000+ 阅读影响</span>
            </div>
            <div id="article-reader">
                <button class="reader-back-btn" id="reader-back-btn">
                    <span>←</span>
                    <span id="reader-back-text">返回随笔列表</span>
                </button>
                <div class="reader-meta" id="reader-meta"></div>
                <h1 class="reader-title" id="reader-title"></h1>
                <div class="reader-body" id="reader-content"></div>
            </div>
            <div class="blog-list" id="blog-container"></div>
        </section>

        <section>
            <div class="section-header">
                <h2 id="clients-title">对接过的核心企业客户</h2>
                <span class="section-label">Enterprise Footprint</span>
            </div>
            <div class="clients-grid" id="clients-container"></div>
        </section>

        <section>
            <div class="section-header">
                <h2 id="skills-title">核心专业能力</h2>
                <span class="section-label">Capabilities</span>
            </div>
            <div class="skills-list" id="skills-container"></div>
        </section>

        <section>
            <div class="section-header">
                <h2 id="framework-title">AI 落地方法论</h2>
                <span class="section-label">Methodology</span>
            </div>
            <div class="method-grid" id="framework-container"></div>
        </section>

        <section id="experience">
            <div class="section-header">
                <h2 id="exp-title">工作经历</h2>
                <span class="section-label">Career</span>
            </div>
            <div class="exp-list" id="experience-container"></div>
        </section>

        <section>
            <div class="section-header">
                <h2 id="edu-title">教育背景</h2>
                <span class="section-label">Academic</span>
            </div>
            <div class="edu-grid" id="education-container"></div>
        </section>

        <section>
            <div class="section-header">
                <h2 id="hobbies-title">闲暇偏好</h2>
                <span class="section-label">Off-Duty</span>
            </div>
            <div class="hobbies-tags" id="hobbies-container"></div>
        </section>

        <footer>
            <span>© 2026 ${CONFIG.name} · All Rights Reserved</span>
            <div class="footer-links">
                <a href="${CONFIG.github}" class="footer-link" target="_blank" rel="noopener noreferrer">GitHub</a>
                <a href="mailto:${CONFIG.email}" class="footer-link">Email</a>
                <a href="/admin" class="footer-link" style="color:var(--accent-terracotta);">后台登录 (Admin)</a>
                <a href="#overview" class="footer-link">回到顶部 ↑</a>
            </div>
            <span>Powered by Cloudflare Workers</span>
        </footer>
    </div>

    <div id="toast">
        <svg style="width:16px;height:16px;fill:#68D391" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
        <span id="toast-text">已复制到剪贴板</span>
    </div>

    <script>
        const CURRENT_ARTICLES = ${articlesJson};
        let currentLang = 'zh';

        const i18n = {
            zh: {
                statusBadge: "${CONFIG.statusBadgeZh}",
                navOverview: "概览", navProject: "专项架构", navBlog: "技术随笔", navExperience: "履历",
                heroGithubBtn: "查看 GitHub 仓库", heroEmailBtn: "一键复制邮箱 (${CONFIG.email})", heroPrintBtn: "打印 / 保存 PDF 简历",
                role: "AI 研究员 // 技术负责人",
                aboutText: "北邮软件工程科班出身，<strong>Abide大学博士</strong>，拥有极强的AI前沿技术研发与落地能力。早期深耕后端架构，<strong>技术管理经验丰富</strong>，具备卓越的技术视野与团队领导力。自<strong>2021年起全面转型AI领域</strong>，熟悉Agent/RAG架构及vLLM底层推理优化。拥有QPS破万、SLA 99.99%的高并发工程底盘，能将复杂大模型技术深度融合业务场景，主导智能体落地。此外，持续输出具有行业影响力的技术随笔，<strong>累计阅读量近百万</strong>，赋能CXO级方案共创，保障百万级项目的高质量交付与商业闭环。",
                projectTitle: "专项研发项目与架构设计", projectTag: "独立全栈架构与开发 (Solo Architecture)",
                projectName: "基于 AI-Agent 的企业业务操作系统 (Enterprise Business OS)",
                projectDesc: "独立全栈设计与落地：单一数据源（Single Source of Truth）驱动所有系统，协同前端网站门户、AI 智能体集群、大模型推理中枢、全渠道通信与无人值守运营。",
                metricLabels: ["数据字段架构", "核心系统底座连接", "每月自动化节省工时"],
                blogTitle: "精选技术随笔与深度洞察", blogBadge: "近 1,000,000+ 阅读影响", readerBackText: "返回随笔列表", readMore: "阅读全文 →",
                clientsTitle: "对接过的核心企业客户",
                clients: [
                    { name: "亿贝 (eBay)", tag: "前雇主", sub: "全球电商 AI 平台基座建设与多智能体客户服务生态" },
                    { name: "海洋网联船务 (ONE)", tag: "海运物流", sub: "全球远洋海运 · AI 自动驾驶避让导航与智能调度中心" },
                    { name: "IBM", tag: "企业服务", sub: "企业级 AI 架构解决方案 · 平台级系统共建与落地" },
                    { name: "特鲁斯特银行 (Truist)", tag: "金融科技", sub: "金融高并发 SLA 保障 · 智能体与客户全流程服务" },
                    { name: "阿霍德德尔海兹 (Ahold)", tag: "全球零售", sub: "全渠道零售知识图谱整合与智能采购运营引擎" }
                ],
                skillsTitle: "核心专业能力",
                skills: [
                    "<strong>[AI 与大模型应用]</strong> 有 Agent、大模型应用、RAG 项目落地经验；深刻理解 Agent 工作机制（思考-行动-观察）；熟悉向量数据库、提示词工程 (Prompt Engineering)、工具调用 (Tool Calling)、多轮记忆等相关技术。",
                    "<strong>[架构设计与后端]</strong> 具备出色的架构设计能力，能进行复杂的模块拆解与技术方案输出；熟悉 SpringBoot、SpringCloud，懂微服务架构体系及高并发治理。",
                    "<strong>[综合协同能力]</strong> 拥有良好的沟通协作能力，能够高效对接算法与业务部门，强力推动复杂项目的落地与商业闭环。"
                ],
                frameworkTitle: "AI 落地方法论",
                frameworkCards: [
                    { num: "01", title: "人工智能产品发现", desc: "问题定义、AI 需求说明书 (PRD)、技术路线图制定与价值优先级评估" },
                    { num: "02", title: "企业解决方案架构", desc: "跨部门端到端系统架构设计、API/Webhook 数据流拓扑与标准化 OpenAPI 规范" },
                    { num: "03", title: "智能体工作流落地", desc: "LLM Agents 编排、确定性工具调用、人机协同 (HITL) 机制与多模态消息网关" },
                    { num: "04", title: "LLMOps 与 AI 治理", desc: "端到端可观测性、防幻觉评估基座、容错重试机制、延迟与推理成本最优化" },
                    { num: "05", title: "前沿部署与高效交付", desc: "利益相关者业务梳理、端到端自动化映射、敏捷高保真原型验证与落地" },
                    { num: "06", title: "AI 赋能与思想领导力", desc: "高阶架构研讨、百万级阅读技术深度随笔输出、企业内训与技术布道" }
                ],
                expTitle: "工作经历",
                experiences: [
                    {
                        company: "Hightouch", role: "AI 研究员 (AI Researcher)", date: "2024.12 — 至今",
                        intro: "核心攻坚：在公司范围内构建横向 AI 层，落地多智能体系统与前沿部署 (FDE) 体系。",
                        bullets: [
                            "前沿部署 (FDE) 落地：将多智能体 AI 系统直接交付海内外大客户；提炼定义可复制的 FDE 操作手册（范围界定、交付工具流）。",
                            "实现 1 人支持 10+ 客户的高效架构：生产环境上线客户专属内存层（涵盖自提档案、句子级反幻觉评估），基于平台原生助手设计可组合微模板配置。",
                            "大模型全链路预训练与后训练：主导大模型预训练 (Pre-training) 与后训练 (SFT/RLHF) 研发；深度优化 lm-evaluation-harness 评测底座。",
                            "会议智能系统与事件驱动集成层：自研两步 LLM 提取器取代商业 SaaS，实现细粒度任务映射；连接 CRM、支付和转录，实现无人值守操作。"
                        ]
                    },
                    {
                        company: "亿贝 (eBay)", role: "AI 技术专家", date: "2022.09 — 2024.12",
                        intro: "核心攻坚：统筹搭建 eBay 国际电商业务的 AI 平台基座，推动大模型在客服场景的深度应用。",
                        bullets: [
                            "主导 eBay 全局 AI Platform 基础建设，为各业务线提供底层能力支撑。",
                            "为电商平台构建基于大语言模型的智能客服与 Agent 智能体系统。",
                            "深度服务国际用户在搜索、下单、支付、售后等核心环节的复杂咨询需求，显著提升客诉解决效率。"
                        ]
                    },
                    {
                        company: "快手", role: "高级后端工程师 / 技术经理", date: "2016.06 — 2022.09",
                        intro: "核心攻坚：夯实高并发工程底盘，主导微服务化架构演进与技术团队管理。",
                        bullets: [
                            "直面极限流量，支撑 QPS 1w+ 的海量支付交易核心场景。",
                            "主导建设全链路 ELK + Prometheus 监控告警体系，实现故障自动恢复流程闭环。",
                            "负责庞大支付结算系统的微服务化转型与重构。",
                            "带领后端工程团队，以硬核技术保障核心交易链路 SLA 达到 99.99%。"
                        ]
                    }
                ],
                eduTitle: "教育背景",
                education: [
                    { degree: "博士学位 (Ph.D.)", school: "Abide 大学" },
                    { degree: "软件工程 学士", school: "北京邮电大学 (BUPT)" }
                ],
                hobbiesTitle: "闲暇偏好",
                hobbies: ["散步漫游 (Walking & Urban Strolling)", "正念冥想 (Mindfulness Meditation)"]
            },
            en: {
                statusBadge: "${CONFIG.statusBadgeEn}",
                navOverview: "Overview", navProject: "Architecture", navBlog: "Essays & Blog", navExperience: "Experience",
                heroGithubBtn: "Explore GitHub Repo", heroEmailBtn: "Copy Email (${CONFIG.email})", heroPrintBtn: "Print / Save PDF Resume",
                role: "AI Researcher & Technical Leader",
                aboutText: "With a solid academic foundation (<strong>Ph.D. from Abide University</strong> and <strong>Software Engineering at BUPT</strong>), I bring profound capability to cutting-edge AI R&D and enterprise deployment. My engineering background started with high-concurrency backend architecture and advanced into <strong>extensive technical management</strong>. Since 2021, I have dedicated myself fully to the AI field, mastering Agent/RAG architectures and vLLM low-level inference optimization. Grounded in extreme engineering standards (10k+ QPS, 99.99% SLA), I excel at bridging complex LLM mechanics with commercial business engines and deploying autonomous marketing agents. Furthermore, my technical essays have accumulated <strong>nearly 1 million views</strong>, exerting lasting influence and enabling high-reliability project delivery.",
                projectTitle: "Featured System Architecture", projectTag: "Solo Architecture & Full-Stack",
                projectName: "AI-Agent Driven Enterprise Business Operating System",
                projectDesc: "Independently designed and deployed: A Single Source of Truth (SSOT) operating engine powering dynamic portals, multi-agent clusters, LLM pipelines, and unattended operations.",
                metricLabels: ["Dynamic Fields", "Core Connectors", "Automated / Month"],
                blogTitle: "Selected Technical Essays & Insights", blogBadge: "Nearly 1,000,000+ Readers Reached", readerBackText: "Back to Essays", readMore: "Read Full Article →",
                clientsTitle: "Collaborated Enterprise Clients",
                clients: [
                    { name: "eBay", tag: "Former Employer", sub: "Global E-commerce AI Platform Infrastructure & Intelligent Agent Ecosystem" },
                    { name: "Ocean Network Express (ONE)", tag: "Maritime", sub: "Global Maritime Logistics · Autonomous AI Navigation & Intelligent Dispatching" },
                    { name: "IBM", tag: "Enterprise", sub: "Enterprise AI Architectural Solutions · Platform Co-construction" },
                    { name: "Truist Bank", tag: "Fintech", sub: "High-SLA Financial Concurrency · Agentic Customer Journeys & Support" },
                    { name: "Royal Ahold Delhaize", tag: "Retail", sub: "Omnichannel Knowledge Integration & Smart Replenishment Engine" }
                ],
                skillsTitle: "Core Competencies",
                skills: [
                    "<strong>[AI & LLM Applications]</strong> Proven track record landing Agent, LLM, and RAG systems. Deep understanding of Agent mechanics (Think-Act-Observe), Vector Databases, Prompt Engineering, Tool Calling, and Multi-turn Memory architectures.",
                    "<strong>[Backend & Architecture]</strong> Elite architectural design capabilities; skilled in granular module decomposition and technical roadmapping. Proficient in SpringBoot, SpringCloud, microservices governance, and high-concurrency resilience.",
                    "<strong>[Cross-Functional Leadership]</strong> Exceptional communication and technical evangelism, seamlessly bridging algorithm researchers, business stakeholders, and engineering squads to achieve commercial closure."
                ],
                frameworkTitle: "AI Deployment Methodology",
                frameworkCards: [
                    { num: "01", title: "AI Product Discovery", desc: "Problem Definition, AI PRDs, Technical Roadmaps & Value Prioritization" },
                    { num: "02", title: "Enterprise Solution Architecture", desc: "Cross-functional E2E System Design, API/Webhook, Dataflow Topology, OpenAPI" },
                    { num: "03", title: "Agent Workflows", desc: "LLM Agents, Tool Calling, Human-in-the-Loop (HITL), Voice + Messaging Integration" },
                    { num: "04", title: "LLMOps & AI Governance", desc: "Observability, Anti-Hallucination Evaluation, Fallback Handling, Latency/Cost Optimization" },
                    { num: "05", title: "Frontier Deployment & Delivery", desc: "Stakeholder Workshops, Workflow Mapping, Rapid Prototyping & Reliable Rollouts" },
                    { num: "06", title: "AI Enablement & Thought Leadership", desc: "Executive Workshops, High-Impact Technical Writing, PM Bootcamp Teaching Fellow" }
                ],
                expTitle: "Experience",
                experiences: [
                    {
                        company: "Hightouch", role: "AI Researcher", date: "Dec 2024 — Present",
                        intro: "Core focus: Orchestrating the evolution of LLM capabilities and forward-deployed AI architectures from the ground up.",
                        bullets: [
                            "Forward Deployed Engineering (FDE) & Playbook: Delivered multi-agent AI systems directly to enterprise clients; defined the standardized FDE playbook (scoping, tooling, delivery).",
                            "Scaled Parallel Client Operations: Enabled 1 engineer to support 10+ clients concurrently; built client-specific production memory layers with sentence-level anti-hallucination verification.",
                            "Full-Lifecycle LLM Pre & Post-Training: Led Pre-training and Post-training (SFT/RLHF) stages, optimizing vertical domain models.",
                            "Meeting Intelligence & Event-Driven Engine: Replaced commercial SaaS with a custom 2-step LLM extractor for fine-grained task mapping, real-time ingestion, and automated operations."
                        ]
                    },
                    {
                        company: "eBay", role: "AI Tech Expert", date: "Sep 2022 — Dec 2024",
                        intro: "Core focus: Leading the AI Platform infrastructure and transforming global E-commerce user experience via LLMs.",
                        bullets: [
                            "Led the construction of the eBay AI Platform, building scalable infrastructure for the entire organization.",
                            "Built LLM-based smart customer service and Agent systems for global users.",
                            "Served international users' complex inquiry needs across search, order placement, payment, and after-sales scenarios, improving resolution efficiency significantly."
                        ]
                    },
                    {
                        company: "Kuaishou", role: "Senior Backend Engineer / Tech Manager", date: "Jun 2016 — Sep 2022",
                        intro: "Core focus: Building rock-solid backend infrastructure, mastering high concurrency, and leading technical teams.",
                        bullets: [
                            "Supported extreme high-concurrency payment transaction scenarios with peak traffic of 10k+ QPS.",
                            "Constructed comprehensive ELK + Prometheus monitoring systems, achieving a closed-loop automatic fault recovery mechanism.",
                            "Led the massive microservices transformation of the legacy payment settlement system.",
                            "Successfully managed the engineering team and ensured 99.99% SLA for core financial transactions."
                        ]
                    }
                ],
                eduTitle: "Education",
                education: [
                    { degree: "Ph.D. / Doctor of Philosophy", school: "Abide University" },
                    { degree: "B.E. in Software Engineering", school: "Beijing Univ. of Posts and Telecommunications (BUPT)" }
                ],
                hobbiesTitle: "Mindfulness & Leisure",
                hobbies: ["Walking & Urban Strolling", "Mindfulness Meditation"]
            }
        };

        function toggleExp(index) {
            const content = document.getElementById('exp-content-' + index);
            const icon = document.getElementById('exp-icon-' + index);
            if (!content) return;
            if (content.classList.contains('active')) {
                content.classList.remove('active');
                content.style.maxHeight = null;
                content.style.opacity = 0;
                if (icon) icon.innerText = '+';
            } else {
                content.classList.add('active');
                content.style.maxHeight = (content.scrollHeight + 80) + "px";
                content.style.opacity = 1;
                if (icon) icon.innerText = '−';
            }
        }

        function copyEmail() {
            const email = "${CONFIG.email}";
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(email).then(() => {
                    showToast(currentLang === 'zh' ? '邮箱已复制: ' + email : 'Copied: ' + email);
                }).catch(() => promptCopy(email));
            } else {
                promptCopy(email);
            }
        }

        function promptCopy(text) {
            const input = document.createElement('input');
            input.value = text;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            showToast(currentLang === 'zh' ? '邮箱已复制: ' + text : 'Copied: ' + text);
        }

        function showToast(msg) {
            const toast = document.getElementById('toast');
            document.getElementById('toast-text').innerText = msg;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 2500);
        }

        function openArticle(articleId) {
            const article = CURRENT_ARTICLES.find(a => a.id === articleId);
            if (!article) return;
            const reader = document.getElementById('article-reader');
            document.getElementById('reader-title').innerText = article.title[currentLang] || article.title.zh;
            document.getElementById('reader-meta').innerHTML = '<span>' + article.date + '</span> · <span>' + article.readTime + '</span> · <span class="blog-tag">' + article.tag + '</span> · <span>' + article.views + '</span>';
            document.getElementById('reader-content').innerHTML = article.content[currentLang] || article.content.zh;
            reader.style.display = 'block';
            reader.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        function closeReader() {
            document.getElementById('article-reader').style.display = 'none';
            document.getElementById('blog').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        function render() {
            const data = i18n[currentLang];
            document.getElementById('hero-status').innerText = data.statusBadge;
            document.getElementById('nav-overview').innerText = data.navOverview;
            document.getElementById('nav-project').innerText = data.navProject;
            document.getElementById('nav-blog').innerText = data.navBlog;
            document.getElementById('nav-experience').innerText = data.navExperience;
            document.getElementById('hero-github-btn').innerText = data.heroGithubBtn;
            document.getElementById('hero-email-btn').innerText = data.heroEmailBtn;
            document.getElementById('hero-print-btn').innerText = data.heroPrintBtn;
            document.getElementById('role').innerText = data.role;
            document.getElementById('about-text').innerHTML = data.aboutText;
            document.getElementById('project-title').innerText = data.projectTitle;
            document.getElementById('project-tag').innerText = data.projectTag;
            document.getElementById('project-name').innerText = data.projectName;
            document.getElementById('project-desc').innerText = data.projectDesc;
            document.getElementById('metric-1-lbl').innerText = data.metricLabels[0];
            document.getElementById('metric-2-lbl').innerText = data.metricLabels[1];
            document.getElementById('metric-3-lbl').innerText = data.metricLabels[2];

            document.getElementById('blog-title').innerText = data.blogTitle;
            document.getElementById('blog-badge').innerText = data.blogBadge;
            document.getElementById('reader-back-text').innerText = data.readerBackText;

            const blogContainer = document.getElementById('blog-container');
            blogContainer.innerHTML = CURRENT_ARTICLES.map(art => {
                const title = art.title[currentLang] || art.title.zh;
                const summary = art.summary[currentLang] || art.summary.zh;
                return '<div class="blog-card" data-id="' + art.id + '">' +
                    '<div class="blog-meta"><span class="blog-tag">' + art.tag + '</span><span>' + art.date + '</span> · <span>' + art.readTime + '</span></div>' +
                    '<div class="blog-title">' + title + '</div>' +
                    '<div class="blog-snippet">' + summary + '</div>' +
                    '<div class="blog-footer"><span>' + art.views + '</span><span class="read-more-link">' + data.readMore + '</span></div>' +
                '</div>';
            }).join('');

            blogContainer.querySelectorAll('.blog-card').forEach(card => {
                card.addEventListener('click', () => openArticle(card.dataset.id));
            });

            document.getElementById('clients-title').innerText = data.clientsTitle;
            document.getElementById('clients-container').innerHTML = data.clients.map(c => {
                return '<div class="client-box"><div class="client-name"><span>' + c.name + '</span><span class="client-tag">' + c.tag + '</span></div><div class="client-desc">' + c.sub + '</div></div>';
            }).join('');

            document.getElementById('skills-title').innerText = data.skillsTitle;
            document.getElementById('skills-container').innerHTML = data.skills.map(s => '<div class="skill-item">' + s + '</div>').join('');

            document.getElementById('framework-title').innerText = data.frameworkTitle;
            document.getElementById('framework-container').innerHTML = data.frameworkCards.map(c => {
                return '<div class="method-card"><div class="method-card-num">' + c.num + '</div><div class="method-card-title">' + c.title + '</div><div class="method-card-desc">' + c.desc + '</div></div>';
            }).join('');

            document.getElementById('exp-title').innerText = data.expTitle;
            const expContainer = document.getElementById('experience-container');
            expContainer.innerHTML = '';
            data.experiences.forEach((exp, index) => {
                const bullets = exp.bullets.map(b => '<li>' + b + '</li>').join('');
                const isActive = index === 0 ? 'active' : '';
                const maxHeight = index === 0 ? 'max-height: 1000px; opacity: 1;' : '';
                const icon = index === 0 ? '−' : '+';
                expContainer.innerHTML += '<div class="exp-block">' +
                    '<div class="exp-head" data-index="' + index + '"><div><div class="exp-title-text">' + exp.company + ' <span>· ' + exp.role + '</span></div><div class="exp-period">' + exp.date + '</div></div><div class="exp-toggle-icon" id="exp-icon-' + index + '">' + icon + '</div></div>' +
                    '<div class="exp-details ' + isActive + '" id="exp-content-' + index + '" style="' + maxHeight + '"><div class="exp-focus">' + exp.intro + '</div><ul class="exp-bullets-list">' + bullets + '</ul></div>' +
                '</div>';
            });
            expContainer.querySelectorAll('.exp-head').forEach(head => {
                head.addEventListener('click', () => toggleExp(parseInt(head.dataset.index, 10)));
            });

            document.getElementById('edu-title').innerText = data.eduTitle;
            document.getElementById('education-container').innerHTML = data.education.map(edu => '<div class="edu-box"><div class="edu-degree">' + edu.degree + '</div><div class="edu-school">' + edu.school + '</div></div>').join('');

            document.getElementById('hobbies-title').innerText = data.hobbiesTitle;
            document.getElementById('hobbies-container').innerHTML = data.hobbies.map(h => '<div class="hobby-tag">' + h + '</div>').join('');
        }

        function toggleLanguage() {
            currentLang = currentLang === 'zh' ? 'en' : 'zh';
            render();
            const reader = document.getElementById('article-reader');
            if (reader.style.display === 'block') {
                const curTitle = document.getElementById('reader-title').innerText;
                const match = CURRENT_ARTICLES.find(a => a.title.zh === curTitle || a.title.en === curTitle);
                if (match) openArticle(match.id);
            }
        }

        document.getElementById('lang-btn').addEventListener('click', toggleLanguage);
        document.getElementById('btn-nav-copy-email').addEventListener('click', copyEmail);
        document.getElementById('btn-hero-copy-email').addEventListener('click', copyEmail);
        document.getElementById('reader-back-btn').addEventListener('click', closeReader);
        render();
    </script>
</body>
</html>`;
}

/**
 * ═════════════════════════════════════════════════════════════════════════════
 * HTML 模板：管理后台登录与博客 CMS 面板 (/admin)
 * ═════════════════════════════════════════════════════════════════════════════
 */
function renderAdminHtml(isLoggedIn, articlesJson, hasKv) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>管理后台 — ${CONFIG.name} Blog CMS</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-page: #FAF8F5; --bg-card: #FFFFFF; --bg-subtle: #F3EFEA;
            --text-main: #191919; --text-muted: #5C5852; --text-light: #8C867E;
            --accent: #CC785C; --accent-hover: #b86448; --accent-bg: #F8ECE7;
            --border: #E6E0D6; --radius-md: 12px; --radius-lg: 16px;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; background: var(--bg-page); color: var(--text-main); line-height: 1.6; }
        .admin-wrap { max-width: 960px; margin: 0 auto; padding: 40px 20px 80px; }
        .nav-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; padding-bottom: 16px; border-bottom: 1px solid var(--border); }
        .logo { font-family: 'Newsreader', serif; font-size: 1.4rem; font-weight: 500; text-decoration: none; color: var(--text-main); }
        .btn { padding: 8px 16px; border-radius: 9999px; border: 1px solid var(--border); background: var(--bg-card); cursor: pointer; font-size: 0.88rem; transition: all 0.2s ease; text-decoration: none; color: var(--text-main); }
        .btn:hover { border-color: var(--accent); color: var(--accent); }
        .btn-primary { background: var(--accent); color: #fff; border-color: var(--accent); }
        .btn-primary:hover { background: var(--accent-hover); color: #fff; }
        .btn-danger { background: #FFF5F5; color: #E53E3E; border-color: #FEB2B2; }
        .btn-danger:hover { background: #FED7D7; }
        
        /* 登录卡片 */
        .login-box { max-width: 420px; margin: 80px auto; background: var(--bg-card); padding: 36px; border-radius: var(--radius-lg); border: 1px solid var(--border); box-shadow: 0 4px 20px rgba(0,0,0,0.04); }
        .login-title { font-family: 'Newsreader', serif; font-size: 1.8rem; margin-bottom: 8px; }
        .form-group { margin-bottom: 18px; }
        label { display: block; font-size: 0.86rem; color: var(--text-muted); margin-bottom: 6px; font-weight: 500; }
        input[type="text"], input[type="password"], textarea, select {
            width: 100%; padding: 10px 14px; border: 1px solid var(--border); border-radius: 8px; font-size: 0.92rem; background: var(--bg-page); color: var(--text-main); font-family: inherit;
        }
        input:focus, textarea:focus { outline: none; border-color: var(--accent); background: #fff; }

        /* 文章管理面板 */
        .kv-alert { padding: 12px 18px; border-radius: 8px; margin-bottom: 24px; font-size: 0.88rem; display: flex; justify-content: space-between; align-items: center; }
        .kv-ok { background: #EBF5EC; border: 1px solid #D2E7D4; color: #2e6930; }
        .kv-warn { background: #FFFDF0; border: 1px solid #F6E05E; color: #975A16; }
        .dashboard-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .article-table { width: 100%; border-collapse: collapse; background: var(--bg-card); border-radius: var(--radius-md); border: 1px solid var(--border); overflow: hidden; }
        .article-table th, .article-table td { padding: 14px 18px; text-align: left; border-bottom: 1px solid var(--border); font-size: 0.9rem; }
        .article-table th { background: var(--bg-subtle); color: var(--text-muted); font-weight: 500; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 0.76rem; font-family: 'JetBrains Mono', monospace; background: var(--accent-bg); color: var(--accent); }

        /* 编辑弹窗 */
        #edit-modal { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); z-index: 999; overflow-y: auto; padding: 40px 20px; }
        .modal-body { max-width: 780px; margin: 0 auto; background: var(--bg-card); padding: 32px; border-radius: var(--radius-lg); border: 1px solid var(--border); box-shadow: 0 10px 40px rgba(0,0,0,0.15); }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .tab-btn-group { display: flex; gap: 8px; margin-bottom: 16px; }
        .tab-btn { padding: 6px 14px; border-radius: 6px; border: 1px solid var(--border); background: var(--bg-subtle); cursor: pointer; font-size: 0.84rem; }
        .tab-btn.active { background: var(--accent); color: #fff; border-color: var(--accent); }
    </style>
</head>
<body>
    <div class="admin-wrap">
        <div class="nav-bar">
            <a href="/" class="logo">← 返回公开个人主页</a>
            <div>
                ${isLoggedIn ? '<button class="btn" onclick="handleLogout()">退出登录</button>' : '<a href="/" class="btn">访问首页</a>'}
            </div>
        </div>

        ${!isLoggedIn ? `
        <!-- 未登录：展示登录框 -->
        <div class="login-box">
            <h1 class="login-title">管理后台登录</h1>
            <p style="color:var(--text-muted); font-size:0.86rem; margin-bottom:20px;">请输入您的管理员账号与自定义密码</p>
            <form onsubmit="handleLogin(event)">
                <div class="form-group">
                    <label>管理员账号 (Username)</label>
                    <input type="text" id="username" value="${CONFIG.adminUsername}" required />
                </div>
                <div class="form-group">
                    <label>管理密码 (Password)</label>
                    <input type="password" id="password" placeholder="请输入密码" required autofocus />
                </div>
                <button type="submit" class="btn btn-primary" style="width:100%; padding:10px;">立即登录</button>
            </form>
            <div id="login-error" style="color:#E53E3E; font-size:0.86rem; margin-top:12px; display:none;">账号或密码错误，请重试</div>
        </div>
        ` : `
        <!-- 已登录：展示文章管理面板 -->
        <div class="${hasKv ? 'kv-alert kv-ok' : 'kv-alert kv-warn'}">
            <span>${hasKv ? '🟢 Cloudflare KV 数据库已连接：修改将实时全球同步永久保存！' : '🟡 提示：当前处于代码默认模式。绑定 Cloudflare KV (BLOG_KV) 即可开启云端永久持久化保存。'}</span>
            <a href="https://dash.cloudflare.com" target="_blank" class="btn" style="padding:4px 10px; font-size:0.8rem;">Cloudflare 控制台</a>
        </div>

        <div class="dashboard-header">
            <div>
                <h1 style="font-family:'Newsreader', serif; font-size:1.8rem;">博客文章管理中心</h1>
                <p style="font-size:0.88rem; color:var(--text-muted);">在此在线编写、修改、删除文章，保存后即刻呈现在前台</p>
            </div>
            <button class="btn btn-primary" onclick="openCreateModal()">➕ 发布新文章</button>
        </div>

        <table class="article-table">
            <thead>
                <tr>
                    <th>文章标题 (Title)</th>
                    <th>分类标签</th>
                    <th>发布日期</th>
                    <th>阅读量</th>
                    <th style="text-align:right;">操作</th>
                </tr>
            </thead>
            <tbody id="article-list-tbody"></tbody>
        </table>
        `}
    </div>

    <!-- 新建/编辑弹窗 -->
    <div id="edit-modal">
        <div class="modal-body">
            <div class="modal-header">
                <h2 id="modal-title" style="font-family:'Newsreader', serif; font-size:1.4rem;">编辑文章</h2>
                <button class="btn" onclick="closeModal()">✕</button>
            </div>
            <form onsubmit="handleSaveArticle(event)">
                <input type="hidden" id="edit-id" />
                <div class="grid-2">
                    <div class="form-group">
                        <label>文章标识 (Slug / ID)</label>
                        <input type="text" id="edit-slug" placeholder="例如：my-new-post" required />
                    </div>
                    <div class="form-group">
                        <label>分类标签 (Tag)</label>
                        <input type="text" id="edit-tag" placeholder="例如：Agent Architecture" required />
                    </div>
                </div>
                <div class="grid-2">
                    <div class="form-group">
                        <label>发布日期 (Date)</label>
                        <input type="text" id="edit-date" placeholder="例如：2025.03" required />
                    </div>
                    <div class="form-group">
                        <label>预估阅读时间 (Read Time)</label>
                        <input type="text" id="edit-readtime" placeholder="例如：6 min read" required />
                    </div>
                </div>
                <div class="form-group">
                    <label>阅读量显示 (Views)</label>
                    <input type="text" id="edit-views" placeholder="例如：52,000+ views" required />
                </div>

                <!-- 语言切换编辑 -->
                <div class="tab-btn-group">
                    <button type="button" class="tab-btn active" id="tab-zh" onclick="switchLangTab('zh')">🇨🇳 中文内容 (Chinese)</button>
                    <button type="button" class="tab-btn" id="tab-en" onclick="switchLangTab('en')">🇺🇸 英文内容 (English)</button>
                </div>

                <div id="section-zh">
                    <div class="form-group">
                        <label>中文标题</label>
                        <input type="text" id="edit-title-zh" required />
                    </div>
                    <div class="form-group">
                        <label>中文摘要 (Summary)</label>
                        <textarea id="edit-summary-zh" rows="2" required></textarea>
                    </div>
                    <div class="form-group">
                        <label>中文正文 (支持 HTML & 代码块)</label>
                        <textarea id="edit-content-zh" rows="8" placeholder="<p>正文内容...</p><h3>标题</h3>" required></textarea>
                    </div>
                </div>

                <div id="section-en" style="display:none;">
                    <div class="form-group">
                        <label>English Title</label>
                        <input type="text" id="edit-title-en" />
                    </div>
                    <div class="form-group">
                        <label>English Summary</label>
                        <textarea id="edit-summary-en" rows="2"></textarea>
                    </div>
                    <div class="form-group">
                        <label>English Content (HTML / Markdown)</label>
                        <textarea id="edit-content-en" rows="8" placeholder="<p>Article body...</p>"></textarea>
                    </div>
                </div>

                <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
                    <button type="button" class="btn" onclick="closeModal()">取消</button>
                    <button type="submit" class="btn btn-primary">💾 保存并全网发布</button>
                </div>
            </form>
        </div>
    </div>

    <script>
        let articles = ${articlesJson || '[]'};
        let activeLangTab = 'zh';

        function handleLogin(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            }).then(res => {
                if (res.ok) {
                    window.location.reload();
                } else {
                    document.getElementById('login-error').style.display = 'block';
                }
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
                    '<td><strong>' + (art.title.zh || art.title.en) + '</strong><div style="font-size:0.78rem; color:var(--text-light); font-family:monospace;">ID: ' + art.id + '</div></td>' +
                    '<td><span class="badge">' + art.tag + '</span></td>' +
                    '<td>' + art.date + '</td>' +
                    '<td>' + art.views + '</td>' +
                    '<td style="text-align:right;">' +
                        '<button class="btn" style="padding:4px 10px; font-size:0.8rem; margin-right:6px;" onclick="openEditModal(\\'' + art.id + '\\')">编辑</button>' +
                        '<button class="btn btn-danger" style="padding:4px 10px; font-size:0.8rem;" onclick="handleDelete(\\'' + art.id + '\\')">删除</button>' +
                    '</td>' +
                '</tr>';
            }).join('');
        }

        function openCreateModal() {
            document.getElementById('modal-title').innerText = '新建文章';
            document.getElementById('edit-id').value = '';
            document.getElementById('edit-slug').value = 'post-' + Date.now().toString(36);
            document.getElementById('edit-slug').removeAttribute('readonly');
            document.getElementById('edit-tag').value = 'AI Architecture';
            document.getElementById('edit-date').value = new Date().toISOString().slice(0, 7).replace('-', '.');
            document.getElementById('edit-readtime').value = '5 min read';
            document.getElementById('edit-views').value = '1,000+ views';
            document.getElementById('edit-title-zh').value = '';
            document.getElementById('edit-summary-zh').value = '';
            document.getElementById('edit-content-zh').value = '<p>在这里撰写您的新博客内容...</p>';
            document.getElementById('edit-title-en').value = '';
            document.getElementById('edit-summary-en').value = '';
            document.getElementById('edit-content-en').value = '';
            document.getElementById('edit-modal').style.display = 'block';
        }

        function openEditModal(id) {
            const art = articles.find(a => a.id === id);
            if (!art) return;
            document.getElementById('modal-title').innerText = '编辑文章: ' + id;
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
            document.getElementById('edit-title-en').value = art.title.en || '';
            document.getElementById('edit-summary-en').value = art.summary.en || '';
            document.getElementById('edit-content-en').value = art.content.en || '';
            document.getElementById('edit-modal').style.display = 'block';
        }

        function closeModal() {
            document.getElementById('edit-modal').style.display = 'none';
        }

        function switchLangTab(lang) {
            activeLangTab = lang;
            document.getElementById('tab-zh').classList.toggle('active', lang === 'zh');
            document.getElementById('tab-en').classList.toggle('active', lang === 'en');
            document.getElementById('section-zh').style.display = lang === 'zh' ? 'block' : 'none';
            document.getElementById('section-en').style.display = lang === 'en' ? 'block' : 'none';
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
                title: {
                    zh: document.getElementById('edit-title-zh').value.trim(),
                    en: document.getElementById('edit-title-en').value.trim() || document.getElementById('edit-title-zh').value.trim()
                },
                summary: {
                    zh: document.getElementById('edit-summary-zh').value.trim(),
                    en: document.getElementById('edit-summary-en').value.trim() || document.getElementById('edit-summary-zh').value.trim()
                },
                content: {
                    zh: document.getElementById('edit-content-zh').value.trim(),
                    en: document.getElementById('edit-content-en').value.trim() || document.getElementById('edit-content-zh').value.trim()
                }
            };

            fetch('/api/articles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(articleData)
            }).then(res => res.json()).then(data => {
                if (data.success) {
                    alert('保存成功！前台已实时更新。');
                    window.location.reload();
                } else {
                    alert('保存失败: ' + (data.error || '未知错误'));
                }
            });
        }

        function handleDelete(id) {
            if (!confirm('确定要删除文章 [' + id + '] 吗？此操作不可逆。')) return;
            fetch('/api/articles?id=' + encodeURIComponent(id), {
                method: 'DELETE'
            }).then(res => res.json()).then(data => {
                if (data.success) {
                    alert('删除成功！');
                    window.location.reload();
                } else {
                    alert('删除失败');
                }
            });
        }

        renderArticleTable();
    </script>
</body>
</html>`;
}

/**
 * ═════════════════════════════════════════════════════════════════════════════
 * Cloudflare Workers 核心事件分发与 API 路由
 * ═════════════════════════════════════════════════════════════════════════════
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // 1. API: 登录接口 POST /api/login
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

    // 2. API: 退出登录 POST /api/logout
    if (path === "/api/logout" && method === "POST") {
      return new Response(JSON.stringify({ success: true }), {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          "Set-Cookie": "tianai_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0"
        }
      });
    }

    // 3. API: 获取文章列表 GET /api/articles 或 /articles.json
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

    // 4. API: 【需要鉴权】新增或修改文章 POST /api/articles
    if (path === "/api/articles" && method === "POST") {
      if (!checkAuth(request, env)) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
      }
      try {
        const newArt = await request.json();
        if (!newArt.id || !newArt.title) {
          return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
        }
        let articles = await getArticles(env);
        const idx = articles.findIndex(a => a.id === newArt.id);
        if (idx >= 0) {
          articles[idx] = newArt; // 更新已有文章
        } else {
          articles.unshift(newArt); // 新增在最前面
        }
        await saveArticles(env, articles);
        return new Response(JSON.stringify({ success: true, article: newArt }), {
          headers: { "Content-Type": "application/json;charset=UTF-8" }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
      }
    }

    // 5. API: 【需要鉴权】删除文章 DELETE /api/articles
    if (path === "/api/articles" && method === "DELETE") {
      if (!checkAuth(request, env)) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
      }
      const deleteId = url.searchParams.get("id");
      if (!deleteId) {
        return new Response(JSON.stringify({ error: "Missing id" }), { status: 400 });
      }
      let articles = await getArticles(env);
      articles = articles.filter(a => a.id !== deleteId);
      await saveArticles(env, articles);
      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json;charset=UTF-8" }
      });
    }

    // 6. 页面路由: 管理后台 /admin
    if (path === "/admin") {
      const isAuthed = checkAuth(request, env);
      const articles = await getArticles(env);
      const hasKv = Boolean(env && env.BLOG_KV);
      return new Response(renderAdminHtml(isAuthed, JSON.stringify(articles), hasKv), {
        headers: { "Content-Type": "text/html;charset=UTF-8" }
      });
    }

    // 7. 页面路由: 根路径公开展示页面 /
    const articles = await getArticles(env);
    return new Response(renderPublicHtml(JSON.stringify(articles)), {
      headers: {
        "Content-Type": "text/html;charset=UTF-8",
        "Cache-Control": "public, max-age=120"
      }
    });
  }
};
