/**
 * 防复发守卫：内联 <script> 里的数据必须转义，不能被 </script> 提前闭合。
 *
 * 背景（2026-09-13 审计发现并复现的真实漏洞）：
 *   页面模板用 `${JSON.stringify(x)}` 把数据塞进内联 <script>。JSON.stringify 不转义
 *   `<`，于是读者提交一条正文含 `</script><script>…` 的留言后，只要管理员打开 /admin，
 *   那段脚本就会在管理员会话下执行（同源，CSRF 的 Origin 校验天然通过）——整个 CMS 失守。
 *
 * 断言策略用的是「差分」而不是「匹配某个特定字符串」：
 *   先渲染一份干净页面，拿到 <script 标签数量的基线；再注入恶意数据渲染一次，
 *   两者必须完全相等。多出来的任何一个 <script 标签，都意味着数据成功闭合了脚本块。
 *   这样即使以后页面结构变了（加减脚本块），测试依然有效。
 */
import { test, before } from "node:test";
import assert from "node:assert/strict";
import { authed, createEnv, loadWorker, login, request, jsonInit } from "./helpers/env.mjs";

let worker;

before(async () => {
  worker = await loadWorker();
});

/** 一个能同时闭合脚本块、并带上可识别标记的载荷 */
const BREAKOUT = "</script><script>window.__PWNED__=1;</script>";

function scriptTagCount(html) {
  return (html.match(/<script\b/gi) || []).length;
}

function closeTagCount(html) {
  return (html.match(/<\/script>/gi) || []).length;
}

test("读者留言里的 </script> 不能闭合后台页面的脚本块（存储型 XSS 回归）", async () => {
  const env = createEnv();

  // 基线：还没有任何恶意留言时的后台页面
  const { cookie } = await login(worker, env);
  const cleanHtml = await (await request(worker, env, "/admin", { headers: authed(cookie) })).text();
  const baseline = scriptTagCount(cleanHtml);
  assert.equal(
    scriptTagCount(cleanHtml),
    closeTagCount(cleanHtml),
    "基线页面本身的 <script> 与 </script> 数量就不相等，模板已经坏了"
  );

  // 读者提交一条含 </script> 的留言（公开接口，无需登录；且无需审核通过）
  const posted = await request(worker, env, "/api/comments", jsonInit("POST", {
    content: BREAKOUT,
    author: "attacker",
    articleId: "guestbook"
  }));
  assert.equal(posted.status, 200);

  // 管理员打开后台
  const adminHtml = await (await request(worker, env, "/admin", { headers: authed(cookie) })).text();

  assert.equal(
    scriptTagCount(adminHtml),
    baseline,
    "留言数据成功闭合了脚本块并插入了新的 <script>——存储型 XSS 又回来了"
  );
  assert.equal(
    scriptTagCount(adminHtml),
    closeTagCount(adminHtml),
    "后台页面出现了配不成对的 script 标签，脚本块已被数据截断"
  );
  // 载荷应当以转义形式留在数据里，而不是消失
  assert.ok(
    adminHtml.includes("\\u003c/script"),
    "载荷既没有转义也没有原样出现，转义逻辑可能被改坏了"
  );
});

test("文章正文里的 </script> 不能闭合文章列表页的脚本块", async () => {
  const env = createEnv();
  const { cookie } = await login(worker, env);

  const cleanHtml = await (await request(worker, env, "/articles")).text();
  const baseline = scriptTagCount(cleanHtml);

  // 管理员发一篇正文里带 </script> 的文章（正文走 Markdown/HTML 导入，属外部输入）
  const created = await request(worker, env, "/api/articles", jsonInit("POST", {
    id: "xss-probe-article",
    title_zh: "转义探针",
    content_zh: "<p>正文</p>" + BREAKOUT + "<p>结束</p>",
    date: "2026.09.13"
  }, authed(cookie)));
  assert.equal(created.status, 200);

  const html = await (await request(worker, env, "/articles")).text();
  assert.equal(scriptTagCount(html), baseline, "文章数据闭合了脚本块——/articles 页存在注入");
  assert.equal(scriptTagCount(html), closeTagCount(html));
});

test("留言板初始数据里的 </script> 不能闭合脚本块", async () => {
  const env = createEnv();
  const { cookie } = await login(worker, env);

  const cleanHtml = await (await request(worker, env, "/guestbook")).text();
  const baseline = scriptTagCount(cleanHtml);

  const posted = await request(worker, env, "/api/comments", jsonInit("POST", {
    content: BREAKOUT,
    author: "attacker",
    articleId: "guestbook"
  }));
  assert.equal(posted.status, 200);
  const created = await posted.json();
  assert.equal(created.success, true);

  // 审核通过，让它进入 /guestbook 的初始数据
  const allComments = await (await request(worker, env, "/api/admin/comments", { headers: authed(cookie) })).json();
  const target = allComments.find((c) => c.content === BREAKOUT);
  assert.ok(target, "没找到刚提交的留言");
  const approved = await request(worker, env, "/api/admin/comments", jsonInit("POST", {
    id: target.id, status: "approved"
  }, authed(cookie)));
  assert.equal(approved.status, 200);

  const html = await (await request(worker, env, "/guestbook")).text();
  assert.equal(scriptTagCount(html), baseline, "留言板初始数据闭合了脚本块——/guestbook 存在注入");
  assert.equal(scriptTagCount(html), closeTagCount(html));
});

test("简历字段里的 </script> 不能闭合首页与经历页的脚本块", async () => {
  const env = createEnv();
  const { cookie } = await login(worker, env);

  const homeBaseline = scriptTagCount(await (await request(worker, env, "/")).text());
  const expBaseline = scriptTagCount(await (await request(worker, env, "/experience")).text());

  const saved = await request(worker, env, "/api/profile", jsonInit("POST", {
    nameZh: "维托里奥 崔" + BREAKOUT,
    introZh: "简介" + BREAKOUT,
    positionZh: "职位" + BREAKOUT
  }, authed(cookie)));
  assert.equal(saved.status, 200);

  const homeHtml = await (await request(worker, env, "/")).text();
  const expHtml = await (await request(worker, env, "/experience")).text();

  assert.equal(scriptTagCount(homeHtml), homeBaseline, "首页简历字段闭合了脚本块");
  assert.equal(scriptTagCount(expHtml), expBaseline, "经历页简历字段闭合了脚本块");
});

test("safeJsonForScript 本身：转义后仍是合法 JSON，且语义不变", async () => {
  const { safeJsonForScript } = await import("../src/util.js");
  const original = { content: BREAKOUT, emoji: "a\u2028b\u2029c", amp: "a&b<c>d" };
  const literal = safeJsonForScript(original);

  // 不能残留任何能闭合脚本块或打断 JS 解析的字符
  assert.ok(!literal.includes("</"), "转义结果里不该残留 </");
  assert.ok(!/[\u2028\u2029]/.test(literal), "转义结果里不该残留 U+2028/U+2029");
  // 但必须还能被 JSON.parse 还原成原值
  assert.deepEqual(JSON.parse(literal), original);
});
