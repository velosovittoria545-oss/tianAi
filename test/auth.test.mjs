/**
 * 鉴权测试：无状态签名会话的全部边界（登录、cookie 属性、篡改、过期、超长有效期、吊销、CSRF）。
 *
 * 这些用例之所以重要：鉴权是历史上最反复出问题的地方（会话失效、登出无效、令牌泄漏进 URL），
 * 有了这层断言，下一轮改鉴权就不必靠「部署后手工点一下」来判断对错。
 */
import { test, before } from "node:test";
import assert from "node:assert/strict";
import {
  ADMIN_PASS,
  SESSION_COOKIE,
  SESSION_FLAG_COOKIE,
  authed,
  createEnv,
  jsonInit,
  loadWorker,
  login,
  request,
  signSessionTokenForTest
} from "./helpers/env.mjs";

let worker;

before(async () => {
  worker = await loadWorker();
});

const CMS_MARKER = 'id="cms-title"';          // 已登录：后台控制台
const LOGIN_MARKER = 'id="admin-title"';      // 未登录：管理员登录卡片

test("错误口令登录被拒绝，且不下发任何 cookie", async () => {
  const env = createEnv();
  const res = await request(worker, env, "/api/login", jsonInit("POST", { username: "admin", password: "wrong-password" }));
  assert.equal(res.status, 401);
  const body = await res.json();
  assert.equal(body.success, false);
  assert.equal(res.headers.getSetCookie().length, 0);
});

test("正确口令登录下发 HttpOnly 会话 cookie，且令牌不出现在响应体与 URL 里", async () => {
  const env = createEnv();
  const { res, setCookies, body } = await login(worker, env);

  assert.equal(res.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.token, undefined, "响应体不应再回传令牌");
  assert.equal(body.expiresIn, 30 * 60);

  const session = setCookies.find((c) => c.startsWith(SESSION_COOKIE + "="));
  assert.ok(session, "缺少会话 cookie");
  assert.match(session, /HttpOnly/);
  assert.match(session, /Secure/);
  assert.match(session, /SameSite=Strict/);

  const flag = setCookies.find((c) => c.startsWith(SESSION_FLAG_COOKIE + "="));
  assert.ok(flag, "缺少管理员标记 cookie");
  assert.doesNotMatch(flag, /HttpOnly/, "标记 cookie 需要让前端 JS 可读，不能加 HttpOnly");
});

test("登录后 /admin 渲染 CMS，未登录只看到登录卡片", async () => {
  const env = createEnv();
  const anon = await (await request(worker, env, "/admin")).text();
  assert.match(anon, new RegExp(LOGIN_MARKER));
  assert.doesNotMatch(anon, new RegExp(CMS_MARKER));

  const { cookie } = await login(worker, env);
  const authedHtml = await (await request(worker, env, "/admin", { headers: authed(cookie) })).text();
  assert.match(authedHtml, new RegExp(CMS_MARKER));
});

test("未登录访问 /admin 完全不需要读 KV", async () => {
  const env = createEnv();
  await request(worker, env, "/admin");
  assert.equal(env.__kv.stats.gets, 0);
});

test("匿名访客访问受保护写接口返回 401", async () => {
  const env = createEnv();
  for (const path of ["/api/settings", "/api/admin/comments"]) {
    const res = await request(worker, env, path);
    assert.equal(res.status, 401, `${path} 应当拒绝匿名访问`);
  }
  assert.equal(env.__kv.stats.puts, 0);
});

test("被篡改的令牌（签名不匹配）被拒绝", async () => {
  const env = createEnv();
  const { cookie } = await login(worker, env);
  const tampered = cookie.replace(/tianai_session=([^;]+)/, (_m, tok) => {
    const flipped = tok.slice(0, -1) + (tok.slice(-1) === "A" ? "B" : "A");
    return "tianai_session=" + flipped;
  });
  const res = await request(worker, env, "/api/settings", { headers: authed(tampered) });
  assert.equal(res.status, 401);
});

test("手工构造的令牌：合法签名可用，过期/超长有效期/未来签发时间一律拒绝", async () => {
  const now = Math.floor(Date.now() / 1000);

  const okEnv = createEnv();
  const valid = await signSessionTokenForTest(okEnv, { iat: now, exp: now + 300 });
  assert.equal((await request(worker, okEnv, "/api/settings", { headers: authed(SESSION_COOKIE + "=" + valid) })).status, 200);

  // 已过期（绝对有效期到点）
  const expiredEnv = createEnv();
  const expired = await signSessionTokenForTest(expiredEnv, { iat: now - 3600, exp: now - 60 });
  assert.equal((await request(worker, expiredEnv, "/api/settings", { headers: authed(SESSION_COOKIE + "=" + expired) })).status, 401);

  // 有效期跨度超过配置上限（伪造「永不过期」的令牌）
  const longEnv = createEnv();
  const longLived = await signSessionTokenForTest(longEnv, { iat: now, exp: now + 86400 });
  assert.equal((await request(worker, longEnv, "/api/settings", { headers: authed(SESSION_COOKIE + "=" + longLived) })).status, 401);

  // 签发时间落在未来（时钟漂移容差之外）
  const futureEnv = createEnv();
  const future = await signSessionTokenForTest(futureEnv, { iat: now + 3600, exp: now + 600 });
  assert.equal((await request(worker, futureEnv, "/api/settings", { headers: authed(SESSION_COOKIE + "=" + future) })).status, 401);
});

test("KV 中的会话版本号变大即可吊销全部已签发令牌", async () => {
  // 用版本号 1 的环境签发一个正常令牌
  const env1 = createEnv();
  const { cookie } = await login(worker, env1);
  assert.equal((await request(worker, env1, "/api/settings", { headers: authed(cookie) })).status, 200);

  // 换成一个 KV 里版本号为 2 的环境（等价于线上把 ADMIN_SESSION_VER 改大）
  const env2 = createEnv({ seed: { ADMIN_SESSION_VER: "2" } });
  assert.equal(
    (await request(worker, env2, "/api/settings", { headers: authed(cookie) })).status,
    401,
    "版本号变更后，旧令牌必须立即失效"
  );
});

test("登出通过响应头清除两个 cookie", async () => {
  const env = createEnv();
  const { cookie } = await login(worker, env);
  const res = await request(worker, env, "/api/logout", { method: "POST", headers: authed(cookie) });
  assert.equal(res.status, 200);
  const cleared = res.headers.getSetCookie();
  assert.ok(cleared.some((c) => c.startsWith(SESSION_COOKIE + "=") && /Max-Age=0/.test(c)));
  assert.ok(cleared.some((c) => c.startsWith(SESSION_FLAG_COOKIE + "=") && /Max-Age=0/.test(c)));
});

test("?logout=true 返回登录页并清除 cookie", async () => {
  const env = createEnv();
  const { cookie } = await login(worker, env);
  const res = await request(worker, env, "/admin?logout=true", { headers: authed(cookie) });
  assert.equal(res.status, 200);
  assert.match(await res.text(), new RegExp(LOGIN_MARKER));
  assert.ok(res.headers.getSetCookie().some((c) => /Max-Age=0/.test(c)));
});

test("跨站 Origin 的写请求被 403 拒绝，同源/无 Origin 放行到鉴权环节", async () => {
  const env = createEnv();

  const crossSite = await request(worker, env, "/api/settings", jsonInit("POST", { articleSort: { field: "likes", order: "desc" } }, { Origin: "https://evil.example" }));
  assert.equal(crossSite.status, 403);

  const sameSite = await request(worker, env, "/api/settings", jsonInit("POST", {}, { Origin: "https://drvittoria.de5.net" }));
  assert.equal(sameSite.status, 401, "同源但未登录，应当是 401 而不是 403");

  const noOrigin = await request(worker, env, "/api/settings", jsonInit("POST", {}));
  assert.equal(noOrigin.status, 401);
});

test("Cloudflare Access 邮箱头直通鉴权仍然可用", async () => {
  const env = createEnv();
  const res = await request(worker, env, "/api/settings", {
    headers: { "cf-access-authenticated-user-email": "velosovittoria545@gmail.com" }
  });
  assert.equal(res.status, 200);
});

test("会话 cookie 不会把令牌写入任何形式的 URL", async () => {
  const env = createEnv();
  const { cookie } = await login(worker, env);
  const token = /tianai_session=([^;]+)/.exec(cookie)[1];
  const html = await (await request(worker, env, "/admin", { headers: authed(cookie) })).text();
  assert.ok(!html.includes(token), "页面 HTML 中不应出现会话令牌");
  assert.ok(ADMIN_PASS.length > 0);
});
