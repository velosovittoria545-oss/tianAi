/**
 * 路由冒烟测试：所有公开页面与只读 API 都能正常返回。
 *
 * 这层测试的价值在于「改完立刻知道有没有把某个页面搞崩」——历史上
 * 两次事故（模板转义写坏、内联脚本语法错误）都是在这里会被拦住的类型。
 */
import { test, before } from "node:test";
import assert from "node:assert/strict";
import { createEnv, loadWorker, request } from "./helpers/env.mjs";

let worker;
let env;

before(async () => {
  worker = await loadWorker();
  env = createEnv();
});

const HTML_PAGES = ["/", "/articles", "/blog", "/experience", "/work-experience", "/guestbook", "/messages"];

for (const path of HTML_PAGES) {
  test(`GET ${path} 返回完整 HTML 页面`, async () => {
    const res = await request(worker, env, path);
    assert.equal(res.status, 200);
    assert.match(res.headers.get("Content-Type") || "", /text\/html/);
    const html = await res.text();
    assert.match(html, /^<!DOCTYPE html>/i);
    assert.match(html, /<\/html>\s*$/);
    assert.match(html, /<title>[^<]+<\/title>/);
  });
}

test("GET /articles 页面内嵌了浏览量上报端点（功能标记未丢失）", async () => {
  const html = await (await request(worker, env, "/articles")).text();
  assert.match(html, /api\/articles\/view/);
});

test("GET /guestbook 页面内嵌了留言提交端点（功能标记未丢失）", async () => {
  const html = await (await request(worker, env, "/guestbook")).text();
  assert.match(html, /api\/comments/);
});

test("GET /api/articles 返回文章数组", async () => {
  const res = await request(worker, env, "/api/articles");
  assert.equal(res.status, 200);
  assert.match(res.headers.get("Content-Type") || "", /application\/json/);
  const items = await res.json();
  assert.ok(Array.isArray(items));
  assert.ok(items.length > 0, "内置体验模式应当至少有一篇示例文章");
  for (const a of items) {
    assert.equal(typeof a.id, "string");
    assert.equal(typeof a.views, "number");
    assert.equal(typeof a.likes, "number");
  }
});

test("GET /articles.json 与 /api/articles 等价", async () => {
  const a = await (await request(worker, env, "/api/articles")).json();
  const b = await (await request(worker, env, "/articles.json")).json();
  assert.deepEqual(
    a.map((x) => x.id),
    b.map((x) => x.id)
  );
});

test("GET /api/profile 返回简历对象", async () => {
  const res = await request(worker, env, "/api/profile");
  assert.equal(res.status, 200);
  const prof = await res.json();
  assert.equal(typeof prof.email, "string");
  assert.ok(Array.isArray(prof.experiences) || typeof prof.experiences === "object");
});

test("GET /api/comments 返回留言板分页结构", async () => {
  const res = await request(worker, env, "/api/comments");
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.ok(Array.isArray(body.items));
  assert.equal(typeof body.total, "number");
  assert.ok(body.items.length <= 10, "留言板默认只展示最新 10 条");
});

test("GET /api/comments?articleId=... 返回该文章的已审核留言数组", async () => {
  const res = await request(worker, env, "/api/comments?articleId=guestbook");
  assert.equal(res.status, 200);
  const items = await res.json();
  assert.ok(Array.isArray(items));
  for (const c of items) {
    assert.equal(c.status, "approved", "公开接口不能泄漏待审/已驳回留言");
  }
});

test("GET /api/images/<不存在> 返回 404", async () => {
  const res = await request(worker, env, "/api/images/img_does_not_exist");
  assert.equal(res.status, 404);
});

test("GET /assets/reward-qr 返回可长缓存的 JPEG", async () => {
  const res = await request(worker, env, "/assets/reward-qr");
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("Content-Type"), "image/jpeg");
  assert.match(res.headers.get("Cache-Control") || "", /immutable/);
  const bytes = new Uint8Array(await res.arrayBuffer());
  assert.ok(bytes.length > 1000, `赞赏码图片只有 ${bytes.length} 字节，八成是空的`);
  // JPEG 魔数
  assert.equal(bytes[0], 0xff);
  assert.equal(bytes[1], 0xd8);
});

test("赞赏码不再内联进页面（页面体积不该被一张图吃掉一半）", async () => {
  const html = await (await request(worker, env, "/articles")).text();
  assert.ok(
    !/data:image\/jpeg;base64/.test(html),
    "/articles 又出现了内联的 base64 图片——赞赏码应当走 /assets/reward-qr"
  );
  assert.match(html, /src="\/assets\/reward-qr"/);
  assert.ok(html.length < 120000, `/articles 页面膨胀到 ${html.length} 字符`);
});

test("后台页面不再引用客户端未定义的 CONFIG（恢复默认收款码按钮曾经会抛 ReferenceError）", async () => {
  const { login, authed } = await import("./helpers/env.mjs");
  const { cookie } = await login(worker, env);
  const html = await (await request(worker, env, "/admin", { headers: authed(cookie) })).text();
  assert.ok(!/CONFIG\./.test(html), "后台页面里残留了 CONFIG 引用，浏览器端没有这个变量");
  assert.match(html, /\/assets\/reward-qr/);
});

test("只读 GET 流程不会写 KV（访客浏览不该消耗每日写额度）", async () => {
  const fresh = createEnv();
  await request(worker, fresh, "/api/articles");
  await request(worker, fresh, "/");
  await request(worker, fresh, "/articles");
  await request(worker, fresh, "/guestbook");
  await request(worker, fresh, "/api/comments");
  await request(worker, fresh, "/api/profile");
  assert.equal(fresh.__kv.stats.puts, 0, `只读请求产生了写入：${fresh.__kv.stats.putsByKey.join(", ")}`);
});
