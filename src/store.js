import { DEFAULT_EXPERIENCES } from "./seed-data.js";

import { DEFAULT_ARTICLES, DEFAULT_COMMENTS, DEFAULT_PROFILE } from "./seed-data.js";

// KV 存储：文章 / 浏览量（合并写入）/ 点赞 / 设置 / 留言 / 个人信息 / 图片
function getAdminPassword(env) {
  return (env && env.ADMIN_PASSWORD) ? env.ADMIN_PASSWORD : "";
}

// 文章排序策略：field 支持 date / views / likes，order 支持 desc / asc
const ARTICLE_SORT_FIELDS = ["date", "views", "likes"];
const DEFAULT_SETTINGS = {
  articleSort: { field: "date", order: "desc" }
};

function normalizeArticle(a) {
  if (!a) return a;
  let title_zh = "";
  let title_en = "";
  if (typeof a.title_zh === "string" && a.title_zh) {
    title_zh = a.title_zh;
  } else if (a.title && typeof a.title === "object") {
    title_zh = a.title.zh || "";
    title_en = a.title.en || "";
  } else if (typeof a.title === "string") {
    title_zh = a.title;
  }

  if (typeof a.title_en === "string" && a.title_en) {
    title_en = a.title_en;
  }

  if (title_en === title_zh && /[\u4e00-\u9fa5]/.test(title_zh)) {
    title_en = "";
  }

  let content_zh = "";
  let content_en = "";
  if (typeof a.content_zh === "string" && a.content_zh) {
    content_zh = a.content_zh;
  } else if (a.content && typeof a.content === "object") {
    content_zh = a.content.zh || "";
    content_en = a.content.en || "";
  } else if (typeof a.content === "string") {
    content_zh = a.content;
  }

  if (typeof a.content_en === "string" && a.content_en) {
    content_en = a.content_en;
  }

  if (content_en === content_zh && /[\u4e00-\u9fa5]/.test(content_zh)) {
    content_en = "";
  }

  const isBilingual = a.isBilingual !== undefined ? !!a.isBilingual : !!(content_en && content_en.trim());

  // 隐藏开关：仅 true / "true" / 1 / "1" 视为隐藏；缺省及其余取值一律视为正常展示
  const hidden = a.hidden === true || a.hidden === "true" || a.hidden === 1 || a.hidden === "1";

  return Object.assign({}, a, {
    title_zh,
    title_en,
    content_zh,
    content_en,
    isBilingual,
    hidden,
    title: { zh: title_zh, en: title_en || title_zh },
    content: { zh: content_zh, en: content_en || content_zh }
  });
}

/* ---------------------------------------------------------------------------
 * KV 写入统一入口
 *
 * 原先每个 saveXxx 都是「有 KV 就写、写错就当没发生」，于是免费版每日 1000 次写额度
 * 耗尽之后，后台会提示「保存成功」而数据其实根本没落库——这是最消耗信任的一类 bug。
 * 现在把写入结果显式返回给调用方，让「保存失败」能一路传到界面上。
 * ------------------------------------------------------------------------- */
async function kvPut(env, key, value, options) {
  if (!env || !env.BLOG_KV) {
    // 体验模式（未绑定 KV）：保持原有宽松语义，页面上已有「🟡 体验模式」徽标提示
    return { ok: false, skipped: true, reason: "missing-kv", key };
  }
  try {
    await env.BLOG_KV.put(key, value, options);
    return { ok: true, key };
  } catch (e) {
    const detail = (e && e.message) ? String(e.message) : "unknown KV write error";
    console.error("KV write failed [" + key + "]:", detail);
    return { ok: false, key, error: detail };
  }
}

/**
 * 把写入失败变成明确的 500 响应。
 * 体验模式（未绑 KV）不报错，维持「开箱即用」的演示体验；
 * 真正会静默丢数据的场景是「KV 已绑定但写入被拒绝」，那种必须让用户看见。
 */
function kvWriteFailureResponse(result) {
  if (!result || result.ok || result.skipped) return null;
  return new Response(JSON.stringify({
    error: "保存失败：Cloudflare KV 写入被拒绝（" + (result.error || "未知原因")
      + "）。多半是免费版每日 1000 次写额度已用尽，请到 Cloudflare 控制台的 KV 配额里确认。",
    kvWriteFailed: true,
    key: result.key
  }), {
    status: 500,
    headers: { "Content-Type": "application/json;charset=UTF-8" }
  });
}

async function getArticles(env) {
  let items = DEFAULT_ARTICLES;
  if (env && env.BLOG_KV) {
    try {
      const data = await env.BLOG_KV.get("ARTICLES_DATA", "json");
      if (data && Array.isArray(data) && data.length > 0) items = data;
    } catch (e) {
      console.error("KV Read Error:", e);
    }
  }
  return items.map(normalizeArticle);
}

async function saveArticles(env, articles) {
  return kvPut(env, "ARTICLES_DATA", JSON.stringify(articles));
}

async function getArticleViews(env) {
  if (env && env.BLOG_KV) {
    try {
      const data = await env.BLOG_KV.get("ARTICLE_VIEWS", "json");
      if (data && typeof data === "object") return data;
    } catch (e) {
      console.error("KV Read Error for views:", e);
    }
  }
  return {};
}

async function saveArticleViews(env, viewsMap) {
  return kvPut(env, "ARTICLE_VIEWS", JSON.stringify(viewsMap));
}

async function getArticleLikes(env) {
  if (env && env.BLOG_KV) {
    try {
      const data = await env.BLOG_KV.get("ARTICLE_LIKES", "json");
      if (data && typeof data === "object") return data;
    } catch (e) {
      console.error("KV Read Error for likes:", e);
    }
  }
  return {};
}

async function saveArticleLikes(env, likesMap) {
  return kvPut(env, "ARTICLE_LIKES", JSON.stringify(likesMap));
}

/* ---------------------------------------------------------------------------
 * 浏览量：少写一点、而且不要挡住响应
 *
 * 老实现是「读整张 ARTICLE_VIEWS → 改一个数字 → 整表写回」，每来一个读者就是一次
 * KV 往返加一次整表写。免费版每天只有 1000 次写，访客稍多就会撞额度、浏览量直接停更。
 * 现在改成：先在 isolate 内存里累计，3 秒窗口内的所有浏览合并成一次写，
 * 并由 ctx.waitUntil 放到响应之后执行——读者永远不会等这次写入。
 * ------------------------------------------------------------------------- */
const VIEW_FLUSH_DELAY_MS = 3000;
const viewFlushStates = new WeakMap(); // KV 绑定 -> { pending: Map<id, 增量>, scheduled: boolean }

function getViewFlushState(kv) {
  let state = viewFlushStates.get(kv);
  if (!state) {
    state = { pending: new Map(), scheduled: false };
    viewFlushStates.set(kv, state);
  }
  return state;
}

/** 还没落库的浏览增量（读者看到的数字要把它算进去，否则刷新后会「掉回去」） */
function pendingViewDelta(env, articleId) {
  const kv = env && env.BLOG_KV;
  if (!kv) return 0;
  return getViewFlushState(kv).pending.get(articleId) || 0;
}

/** 记一次浏览（只进内存，不碰 KV） */
function recordArticleView(env, articleId) {
  const kv = env && env.BLOG_KV;
  if (!kv) return;
  const state = getViewFlushState(kv);
  state.pending.set(articleId, (state.pending.get(articleId) || 0) + 1);
}

/** 把内存里的浏览增量合并写回 KV；失败则把增量还回去，等下次重试 */
async function flushPendingViews(env) {
  const kv = env && env.BLOG_KV;
  if (!kv) return;
  const state = getViewFlushState(kv);
  if (state.pending.size === 0) return;

  const deltas = new Map(state.pending);
  state.pending.clear();
  try {
    const viewsMap = await getArticleViews(env);   // 读回最新值再合并，避免覆盖其它文章的计数
    for (const [id, delta] of deltas) {
      const base = typeof viewsMap[id] === "number" ? viewsMap[id] : 0;
      viewsMap[id] = base + delta;
    }
    const saved = await saveArticleViews(env, viewsMap);
    if (!saved.ok && !saved.skipped) throw new Error(saved.error || "KV write rejected");
  } catch (e) {
    for (const [id, delta] of deltas) {
      state.pending.set(id, (state.pending.get(id) || 0) + delta);
    }
    console.error("Flush article views error:", e);
  }
}

/** 安排一次合并写入：同一窗口内只排一次，后续浏览搭同一趟车 */
function scheduleViewFlush(env, ctx) {
  const kv = env && env.BLOG_KV;
  if (!kv) return;
  const state = getViewFlushState(kv);
  if (state.scheduled) return;
  state.scheduled = true;

  const run = async () => {
    await new Promise((resolve) => setTimeout(resolve, VIEW_FLUSH_DELAY_MS));
    state.scheduled = false;
    await flushPendingViews(env);
  };

  if (ctx && typeof ctx.waitUntil === "function") {
    ctx.waitUntil(run());
  } else {
    void run();
  }
}

async function getBlogSettings(env) {
  let settings = { articleSort: Object.assign({}, DEFAULT_SETTINGS.articleSort) };
  if (env && env.BLOG_KV) {
    try {
      const data = await env.BLOG_KV.get("BLOG_SETTINGS", "json");
      if (data && typeof data === "object") {
        settings = Object.assign({}, settings, data);
        settings.articleSort = Object.assign({}, DEFAULT_SETTINGS.articleSort, data.articleSort || {});
      }
    } catch (e) {
      console.error("KV Read Error for settings:", e);
    }
  }
  return settings;
}

async function saveBlogSettings(env, settings) {
  return kvPut(env, "BLOG_SETTINGS", JSON.stringify(settings));
}

// 访客标识哈希：避免在 KV 中明文存储读者 IP
function hashVisitorKey(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
  }
  return h.toString(36);
}

// 兼容 "2026.08.14" / "2026-08" / "2025.02" 等多种日期写法
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

function normalizeSortConfig(settings) {
  const cfg = (settings && settings.articleSort) || {};
  return {
    field: ARTICLE_SORT_FIELDS.includes(cfg.field) ? cfg.field : DEFAULT_SETTINGS.articleSort.field,
    order: cfg.order === "asc" ? "asc" : "desc"
  };
}

// 排序只影响展示顺序，绝不回写 ARTICLES_DATA，避免打乱文章正文数据
function sortArticlesByConfig(articles, settings) {
  const cfg = normalizeSortConfig(settings);
  const dir = cfg.order === "asc" ? 1 : -1;
  return articles.slice().sort((a, b) => {
    let va = 0;
    let vb = 0;
    if (cfg.field === "views") {
      va = Number(a.views) || 0;
      vb = Number(b.views) || 0;
    } else if (cfg.field === "likes") {
      va = Number(a.likes) || 0;
      vb = Number(b.likes) || 0;
    } else {
      va = parseArticleDateMs(a.date);
      vb = parseArticleDateMs(b.date);
    }
    if (va === vb) return 0;
    return dir * (va - vb);
  });
}

async function getArticlesWithMetrics(env) {
  // 四次读必须并发发出：KV 每次往返几十毫秒，串行 await 会把延迟直接相加
  // （实测：4×RTT 压成 1×RTT，文章列表接口从 88ms 降到 50ms 以下）
  const [articles, viewsMap, likesMap, settings] = await Promise.all([
    getArticles(env),
    getArticleViews(env),
    getArticleLikes(env),
    getBlogSettings(env)
  ]);

  const merged = articles.map(a => {
    let v = a.views;
    if (typeof viewsMap[a.id] === 'number') {
      v = viewsMap[a.id];
    } else if (typeof v === 'string') {
      const num = parseInt(v.replace(/[^0-9]/g, ''), 10);
      v = isNaN(num) ? 1000 : num;
    } else if (typeof v !== 'number') {
      v = 1000;
    }

    let l = a.likes;
    if (typeof likesMap[a.id] === 'number') {
      l = likesMap[a.id];
    } else if (typeof l === 'string') {
      const num = parseInt(l.replace(/[^0-9]/g, ''), 10);
      l = isNaN(num) ? 0 : num;
    } else if (typeof l !== 'number') {
      l = 0;
    }

    return Object.assign({}, a, { views: v, likes: l });
  });

  return sortArticlesByConfig(merged, settings);
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
  // 写的时候顺带把「超过 24 小时未审核」的自动屏蔽结果落库
  applyCommentAutoExpiry(comments);
  return kvPut(env, "BLOG_COMMENTS", JSON.stringify(comments));
}

const COMMENT_PENDING_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * 纯计算：把超过 24 小时仍未审核的留言在内存里标记为「自动屏蔽」。
 *
 * 刻意不写 KV：这段逻辑原先挂在 GET /api/comments 上，意味着访客只要打开一次留言板
 * 就要消耗一次 KV 写入，免费版每天 1000 次写很容易被纯浏览流量吃掉。
 * 现在读只做内存计算，真正落库交给下一次写操作（发留言 / 审核 / 删除）。
 */
function applyCommentAutoExpiry(comments) {
  const now = Date.now();
  let modified = false;
  for (const c of comments) {
    if (!c || c.status !== "pending") continue;
    const createdMs = commentTimestampMs(c);
    if (createdMs && now - createdMs > COMMENT_PENDING_TTL_MS) {
      c.status = "rejected";
      c.autoBlocked = true;
      c.autoBlockedReason = "超过24小时未审核自动屏蔽";
      modified = true;
    }
  }
  return modified;
}

async function getCommentsWithAutoExpiry(env) {
  const comments = await getComments(env);
  applyCommentAutoExpiry(comments);   // 只读：不写 KV
  return comments;
}

function commentTimestampMs(c) {
  if (c && c.createdTimestamp) return Number(c.createdTimestamp) || 0;
  if (c && c.id && c.id.startsWith("comm-")) {
    const idNum = parseInt(c.id.slice(5), 10);
    if (!isNaN(idNum) && idNum > 1000000000000) return idNum;
  }
  if (c && c.createdAt) {
    try {
      return new Date(c.createdAt.replace(' ', 'T') + ':00+08:00').getTime();
    } catch (e) {}
  }
  return 0;
}

async function getProfile(env) {
  let profile = Object.assign({}, DEFAULT_PROFILE);
  if (env && env.BLOG_KV) {
    try {
      const data = await env.BLOG_KV.get("PROFILE_DATA", "json");
      if (data && typeof data === "object") {
        profile = Object.assign({}, DEFAULT_PROFILE, data);
      }
    } catch (e) {
      console.error("KV Read Error for profile:", e);
    }
  }
  if (!Array.isArray(profile.experiences) || profile.experiences.length === 0) {
    if (profile.expHightouchZh || profile.expEbayZh || profile.expKuaishouZh) {
      profile.experiences = [
        {
          id: "exp-hightouch",
          company: "Hightouch",
          role: "AI 项目负责人 / AI Researcher",
          roleEn: "AI Project Lead / AI Researcher",
          period: "2024 — Present",
          details: profile.expHightouchZh || "",
          detailsEn: profile.expHightouchEn || ""
        },
        {
          id: "exp-ebay",
          company: "eBay (亿贝)",
          role: "AI Tech Expert",
          roleEn: "AI Tech Expert",
          period: "2022 — 2024",
          details: profile.expEbayZh || "",
          detailsEn: profile.expEbayEn || ""
        },
        {
          id: "exp-kuaishou",
          company: "Kuaishou (快手)",
          role: "资深服务端开发工程师 / 项目主 R (Senior Backend Engineer / Tech Lead)",
          roleEn: "Senior Backend Engineer / Tech Lead",
          period: "2020.12 — 2022.05",
          details: profile.expKuaishouZh || "",
          detailsEn: profile.expKuaishouEn || ""
        }
      ];
    } else {
      profile.experiences = JSON.parse(JSON.stringify(DEFAULT_EXPERIENCES));
    }
  }
  return profile;
}

async function saveProfile(env, profile) {
  return kvPut(env, "PROFILE_DATA", JSON.stringify(profile));
}

async function saveUploadedImage(env, imgId, base64Data) {
  return kvPut(env, "IMG_" + imgId, base64Data);
}

async function getUploadedImage(env, imgId) {
  if (env && env.BLOG_KV) {
    return await env.BLOG_KV.get("IMG_" + imgId);
  }
  return null;
}
export {
  kvPut, kvWriteFailureResponse, getArticles, saveArticles, getArticleViews,
  saveArticleViews, getArticleLikes, saveArticleLikes, recordArticleView,
  flushPendingViews, scheduleViewFlush, getBlogSettings, saveBlogSettings,
  getComments, saveComments, getCommentsWithAutoExpiry, getProfile, saveProfile,
  saveUploadedImage, getUploadedImage, getArticlesWithMetrics, getAdminPassword,
  parseArticleDateMs, ARTICLE_SORT_FIELDS, normalizeArticle, pendingViewDelta,
  hashVisitorKey, normalizeSortConfig, commentTimestampMs
};