/**
 * 离线测试脚手架：内存版 KV + 假的 ctx / AI 绑定。
 *
 * 设计目标：让「一次修复」的验证成本从「部署到 Cloudflare 再手点」降到「本地几秒钟」。
 * 因此这里刻意不依赖 Miniflare / wrangler dev，只依赖 Node 22 内置的
 * Request / Response / crypto.subtle / atob 与 worker.js 的 ESM 导出。
 */

export const BASE_URL = "https://drvittoria.de5.net";

// 测试专用的管理员口令与会话密钥（线上是另一套随机串，见 .dev.vars / Cloudflare Secrets）
export const ADMIN_USER = "admin";
export const ADMIN_PASS = "test-admin-pass";
export const SESSION_SECRET = "test-session-secret";

/** 会话 cookie 名，与 worker.js 中的 SESSION_COOKIE / SESSION_FLAG_COOKIE 保持一致 */
export const SESSION_COOKIE = "tianai_session";
export const SESSION_FLAG_COOKIE = "tianai_admin";

/**
 * 内存版 Cloudflare KV。
 *
 * 除了读写语义，还额外统计两件测试真正关心的事：
 *  - `maxConcurrentReads`：并发峰值，用来断言「串行 await 已改成 Promise.all」；
 *  - `putsByKey` / `puts`：写入次数，用来断言「GET 请求不再写 KV」。
 */
export function createFakeKV({ latencyMs = 0, seed = {}, failWrites = false } = {}) {
  const store = new Map(Object.entries(seed));
  const stats = {
    gets: 0,
    puts: 0,
    deletes: 0,
    inFlightReads: 0,
    maxConcurrentReads: 0,
    putsByKey: [],
    writeFailures: 0
  };

  const wait = () => (latencyMs > 0 ? new Promise((r) => setTimeout(r, latencyMs)) : Promise.resolve());

  const kv = {
    async get(key, type) {
      stats.gets += 1;
      stats.inFlightReads += 1;
      if (stats.inFlightReads > stats.maxConcurrentReads) {
        stats.maxConcurrentReads = stats.inFlightReads;
      }
      try {
        await wait();
        if (!store.has(key)) return null;
        const raw = store.get(key);
        if (type === "json") return JSON.parse(raw);
        return raw;
      } finally {
        stats.inFlightReads -= 1;
      }
    },

    async put(key, value, options) {
      stats.puts += 1;
      stats.putsByKey.push(key);
      if (failWrites) {
        stats.writeFailures += 1;
        // 模拟免费版「每天 1000 次写入」耗尽后 Cloudflare 返回的错误
        throw new Error("KV PUT failed: 429 daily write limit exceeded");
      }
      store.set(key, typeof value === "string" ? value : String(value));
      void options;
    },

    async delete(key) {
      stats.deletes += 1;
      store.delete(key);
    },

    async list() {
      return { keys: [...store.keys()].map((name) => ({ name })), list_complete: true, cursor: "" };
    }
  };

  return { kv, stats, store, reset() { stats.gets = 0; stats.puts = 0; stats.deletes = 0; stats.putsByKey.length = 0; stats.maxConcurrentReads = 0; } };
}

/** 造一个 Worker 运行时 env：KV + 管理员口令 + 会话密钥 + AI 绑定 */
export function createEnv({ latencyMs = 0, seed = {}, failWrites = false, adminPassword = ADMIN_PASS, sessionSecret = SESSION_SECRET, ai = null } = {}) {
  const fake = createFakeKV({ latencyMs, seed, failWrites });
  const env = {
    BLOG_KV: fake.kv,
    ADMIN_PASSWORD: adminPassword,
    SESSION_SECRET: sessionSecret,
    AI: ai || { run: async () => ({ response: "【AI 桩回复】" }) }
  };
  env.__kv = fake;
  return env;
}

/** 假的 ExecutionContext：把 waitUntil 的 Promise 收集起来，供测试显式 drain */
export function createCtx() {
  const pending = [];
  const ctx = {
    waitUntil(promise) {
      pending.push(Promise.resolve(promise));
    },
    passThroughOnException() {}
  };
  return {
    ctx,
    pending,
    async drain() {
      await Promise.allSettled(pending);
    }
  };
}

/** worker.js 默认导出（始终加载仓库根的构建产物，确保测的就是真正会部署的那份代码） */
export async function loadWorker() {
  const mod = await import("../../worker.js");
  return mod.default;
}

/** 发一个请求；path 可以是 "/api/articles" 或完整 URL */
export async function request(worker, env, path, init = {}, ctx) {
  const url = /^https?:\/\//.test(path) ? path : BASE_URL + path;
  return worker.fetch(new Request(url, init), env, ctx || createCtx().ctx);
}

/** JSON 请求的快捷方式 */
export function jsonInit(method, payload, extraHeaders = {}) {
  return {
    method,
    headers: { "Content-Type": "application/json", ...extraHeaders },
    body: payload === undefined ? undefined : JSON.stringify(payload)
  };
}

/** 登录并返回可直接塞进请求头的会话 cookie */
export async function login(worker, env, { username = ADMIN_USER, password = ADMIN_PASS, ctx } = {}) {
  const res = await request(worker, env, "/api/login", jsonInit("POST", { username, password }), ctx);
  const setCookies = typeof res.headers.getSetCookie === "function" ? res.headers.getSetCookie() : [];
  const pairs = setCookies
    .filter((c) => !/Max-Age=0|Expires=Thu, 01 Jan 1970/.test(c))
    .map((c) => c.split(";")[0])
    .filter(Boolean);
  return { res, setCookies, cookie: pairs.join("; "), body: await res.json() };
}

export function authed(cookie, extraHeaders = {}) {
  return { ...extraHeaders, Cookie: cookie };
}

/** 用测试密钥手工签发一个会话令牌，用于构造「过期」「超长有效期」等边界样本 */
export async function signSessionTokenForTest(env, { iat, exp, ver = "1" }) {
  const { createHmac } = await import("node:crypto");
  const payload = Buffer.from(`${iat}.${exp}.${ver}`, "utf8").toString("base64url");
  const sig = createHmac("sha256", String(env.SESSION_SECRET)).update(payload, "utf8").digest("base64url");
  return `${payload}.${sig}`;
}

/** 从页面 HTML 中抠出所有内联 <script> 的正文（跳过带 src 的外链脚本） */
export function extractInlineScripts(html) {
  const out = [];
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const attrs = m[1] || "";
    if (/\bsrc\s*=/.test(attrs)) continue;
    out.push(m[2]);
  }
  return out;
}

/** 造一条留言（用于留言板/审核相关测试的种子数据） */
export function makeComment(overrides = {}) {
  return {
    id: "comm-" + Math.floor(Math.random() * 1e12),
    createdTimestamp: Date.now(),
    articleId: "guestbook",
    articleTitle: "全站公开留言板",
    author: "测试读者",
    content: "这是一条测试留言。",
    createdAt: "2026-09-01 10:00",
    status: "pending",
    likes: 0,
    replies: [],
    ...overrides
  };
}
