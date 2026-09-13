import { getAdminPassword } from "./store.js";
import { DEFAULT_PROFILE } from "./seed-data.js";

// 会话：无状态 HMAC 签名令牌（不读写 KV 即可鉴权）+ CSRF Origin 校验
/* ============================================================================
 * 会话：无状态 HMAC 签名令牌
 *
 * 令牌 = base64url(iat.exp.ver) + "." + base64url(HMAC-SHA256(载荷, 密钥))
 * 鉴权只验签名与有效期，**完全不读写 KV**——避免鉴权把 KV 免费版每日写额度烧光。
 * 代价：服务端不再记录 lastActive，因此用「绝对有效期 30 分钟」替代原来的「2 分钟不活跃超时」。
 * 吊销：KV 里存一个只读整数 ADMIN_SESSION_VER，令牌带 ver；不匹配即失效。
 *       读额度（10 万/天）远宽于写额度（1 千/天），所以只读版本号是划算的。
 * ========================================================================== */

const SESSION_COOKIE = "tianai_session";
const SESSION_FLAG_COOKIE = "tianai_admin";
const SESSION_TTL_SEC = 30 * 60;              // 会话绝对有效期：30 分钟
const SESSION_VER_KEY = "ADMIN_SESSION_VER";  // 只读版本号，改大即可吊销全部会话
const SESSION_VER_DEFAULT = "1";
const SESSION_CLOCK_SKEW_SEC = 60;

// 签名密钥：优先独立的 SESSION_SECRET；否则退化为「密码派生」；都没有则用固定串（仅本地开发）
function getSessionSecret(env) {
  const s = (env && env.SESSION_SECRET) ? String(env.SESSION_SECRET) : "";
  if (s) return s;
  const p = getAdminPassword(env);
  if (p) return "pw-derived:" + p;
  return "tianai-insecure-local-dev-only";
}

function b64urlEncode(bytes) {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let bin = "";
  for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecodeToBytes(str) {
  const pad = str.length % 4 === 0 ? "" : "=".repeat(4 - (str.length % 4));
  const bin = atob(str.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function b64urlDecodeToString(str) {
  return new TextDecoder().decode(b64urlDecodeToBytes(str));
}

async function importHmacKey(secret) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/* 会话版本号用于「一键吊销全部会话」。若每个鉴权请求都去读一次 KV，
 * 后台每个请求都会多一次往返；因此在 isolate 内做 30 秒缓存。
 * 代价：吊销不是瞬时生效，最多晚 30 秒——对一个个人站点完全可接受。 */
const SESSION_VER_CACHE_MS = 30 * 1000;
const sessionVersionCache = new WeakMap(); // KV 绑定 -> { value, at }

async function getSessionVersion(env) {
  const kv = env && env.BLOG_KV;
  if (!kv) return SESSION_VER_DEFAULT;

  const now = Date.now();
  const cached = sessionVersionCache.get(kv);
  if (cached && now - cached.at < SESSION_VER_CACHE_MS) return cached.value;

  let version = SESSION_VER_DEFAULT;
  try {
    const raw = await kv.get(SESSION_VER_KEY);
    if (raw !== null && raw !== undefined && String(raw).trim() !== "") version = String(raw).trim();
  } catch (e) {
    console.error("Session version read error:", e);
  }
  sessionVersionCache.set(kv, { value: version, at: now });
  return version;
}

async function signSessionToken(env, ver) {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + SESSION_TTL_SEC;
  const payload = b64urlEncode(new TextEncoder().encode(iat + "." + exp + "." + ver));
  const sig = await crypto.subtle.sign(
    "HMAC",
    await importHmacKey(getSessionSecret(env)),
    new TextEncoder().encode(payload)
  );
  return payload + "." + b64urlEncode(sig);
}

async function verifySessionToken(env, token) {
  if (!token || typeof token !== "string") return false;
  const dot = token.indexOf(".");
  if (dot <= 0 || dot >= token.length - 1) return false;
  const payload = token.slice(0, dot);

  let sig;
  try { sig = b64urlDecodeToBytes(token.slice(dot + 1)); } catch (e) { return false; }

  try {
    // crypto.subtle.verify 内部为常数时间比较，避免签名比对的计时侧信道
    const ok = await crypto.subtle.verify(
      "HMAC",
      await importHmacKey(getSessionSecret(env)),
      sig,
      new TextEncoder().encode(payload)
    );
    if (!ok) return false;
  } catch (e) {
    return false;
  }

  let iat, exp, ver;
  try {
    const parts = b64urlDecodeToString(payload).split(".");
    if (parts.length !== 3) return false;
    iat = parseInt(parts[0], 10);
    exp = parseInt(parts[1], 10);
    ver = parts[2];
  } catch (e) {
    return false;
  }
  if (!Number.isFinite(iat) || !Number.isFinite(exp)) return false;

  const now = Math.floor(Date.now() / 1000);
  if (now > exp) return false;                                            // 绝对有效期到点
  if (iat > now + SESSION_CLOCK_SKEW_SEC) return false;                   // 签发时间落在未来
  if (exp - iat > SESSION_TTL_SEC + SESSION_CLOCK_SKEW_SEC) return false; // 有效期跨度不得超过配置上限
  if (now - iat > SESSION_TTL_SEC + SESSION_CLOCK_SKEW_SEC) return false; // 令牌年龄不得超过配置上限

  if (String(ver) !== await getSessionVersion(env)) return false;         // 版本号不匹配 ⇒ 已吊销
  return true;
}

function buildSessionCookie(token) {
  return SESSION_COOKIE + "=" + token + "; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=" + SESSION_TTL_SEC;
}

// 这个 cookie 不含任何凭据，只用来让前台判断是否显示「管理员」浮标，故故意不加 HttpOnly
function buildAdminFlagCookie() {
  return SESSION_FLAG_COOKIE + "=1; Path=/; Secure; SameSite=Strict; Max-Age=" + SESSION_TTL_SEC;
}

function buildClearCookie(name, httpOnly) {
  return name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; Secure; SameSite=Strict"
    + (httpOnly ? "; HttpOnly" : "");
}

// 会话令牌只从 cookie 读取。不再接受 Authorization 头与 URL 参数：
// 那两条路径会让令牌进入浏览器历史、Referer 头与中间代理日志。
function extractRequestToken(request) {
  const cookieHeader = request.headers.get("Cookie") || "";
  const match = cookieHeader.match(/(?:^|;\s*)tianai_session=([^;]*)/);
  return match ? match[1].trim() : "";
}

async function checkAuth(request, env) {
  // 1. Cloudflare Zero Trust (Access) 邮箱免密直通校验
  const cfUserEmail = (request.headers.get("cf-access-authenticated-user-email") || "").trim().toLowerCase();
  const adminEmail = (DEFAULT_PROFILE.email || "velosovittoria545@gmail.com").trim().toLowerCase();
  if (cfUserEmail && (cfUserEmail === adminEmail || cfUserEmail === "velosovittoria545@gmail.com")) {
    return true;
  }

  // 2. 无状态签名令牌：只验签名与有效期，不读写 KV
  return await verifySessionToken(env, extractRequestToken(request));
}

/* CSRF：改用纯 cookie 认证后浏览器会自动带上凭据，因此写操作必须校验 Origin。
 * 同源放行；localhost / 127.0.0.1 放行（本地开发）。
 * 没有 Origin 头的是非浏览器客户端（curl、脚本），不存在被 CSRF 利用的场景，放行。 */
function isWriteOriginAllowed(request) {
  const origin = request.headers.get("Origin");
  if (!origin) return true;
  let originHost;
  try {
    originHost = new URL(origin).hostname.toLowerCase();
  } catch (e) {
    return false;
  }
  let selfHost = "";
  try {
    selfHost = new URL(request.url).hostname.toLowerCase();
  } catch (e) {}
  if (selfHost && originHost === selfHost) return true;
  return originHost === "localhost" || originHost === "127.0.0.1" || originHost === "::1";
}

// 通用极简 CSS
export {
  getSessionSecret, signSessionToken, verifySessionToken, buildSessionCookie,
  buildAdminFlagCookie, buildClearCookie, extractRequestToken, checkAuth,
  isWriteOriginAllowed, SESSION_COOKIE, SESSION_FLAG_COOKIE,
  SESSION_TTL_SEC, getSessionVersion
};