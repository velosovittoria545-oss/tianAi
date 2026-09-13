/**
 * 留言板域测试：提交、字数上限、连击限流、审核流、公开接口不泄漏待审内容、
 * 按周查询（这条专门防「模板字面量把 \d 吃掉变成 d」这类静默错误）。
 */
import { test, before } from "node:test";
import assert from "node:assert/strict";
import { authed, createEnv, jsonInit, loadWorker, login, makeComment, request } from "./helpers/env.mjs";

let worker;

before(async () => {
  worker = await loadWorker();
});

const T = {
  sep02: Date.parse("2026-09-02T10:15:00+08:00"),
  sep05: Date.parse("2026-09-05T14:40:00+08:00")
};

function seedComments(comments) {
  return { BLOG_COMMENTS: JSON.stringify(comments) };
}

const BASE_SEED = [
  makeComment({ id: "comm-approved-1", articleId: "guestbook", status: "approved", createdTimestamp: T.sep02, content: "九月初的已审核留言", author: "读者甲" }),
  makeComment({ id: "comm-approved-2", articleId: "guestbook", status: "approved", createdTimestamp: T.sep05, content: "九月初另一条已审核留言", author: "读者乙" }),
  makeComment({ id: "comm-pending-1", articleId: "guestbook", status: "pending", content: "待审核留言", author: "读者丙" }),
  makeComment({ id: "comm-rejected-1", articleId: "guestbook", status: "rejected", content: "被驳回留言", author: "读者丁" })
];

async function adminComments(env, cookie) {
  return (await request(worker, env, "/api/admin/comments", { headers: authed(cookie) })).json();
}

test("读者提交留言后进入待审，公开接口看不到", async () => {
  const env = createEnv({ seed: seedComments(BASE_SEED) });

  const res = await request(
    worker,
    env,
    "/api/comments",
    jsonInit("POST", { content: "我也想留言一条", author: "新读者", articleId: "guestbook" }, { "cf-connecting-ip": "198.51.100.7" })
  );
  assert.equal(res.status, 200);
  assert.equal((await res.json()).success, true);

  const publicItems = await (await request(worker, env, "/api/comments")).json();
  assert.ok(!publicItems.items.some((c) => c.content === "我也想留言一条"), "待审留言不得出现在公开列表");

  const { cookie } = await login(worker, env);
  const all = await adminComments(env, cookie);
  const created = all.find((c) => c.content === "我也想留言一条");
  assert.ok(created, "管理员应当能看到待审留言");
  assert.equal(created.status, "pending");
});

test("公开接口只返回已审核留言，绝不泄漏待审或已驳回内容", async () => {
  const env = createEnv({ seed: seedComments(BASE_SEED) });
  const items = await (await request(worker, env, "/api/comments?articleId=guestbook")).json();
  assert.deepEqual(items.map((c) => c.id).sort(), ["comm-approved-1", "comm-approved-2"]);
  const text = JSON.stringify(items);
  assert.ok(!text.includes("待审核留言"));
  assert.ok(!text.includes("被驳回留言"));
});

test("同一 IP 3 秒内连击被限流（429）", async () => {
  const env = createEnv({ seed: seedComments(BASE_SEED) });
  const headers = { "cf-connecting-ip": "198.51.100.8" };

  const first = await request(worker, env, "/api/comments", jsonInit("POST", { content: "第一次留言" }, headers));
  assert.equal(first.status, 200);

  const second = await request(worker, env, "/api/comments", jsonInit("POST", { content: "第二次留言" }, headers));
  assert.equal(second.status, 429);
  assert.match((await second.json()).error, /频繁/);
});

test("留言内容校验：中文字数、英文单词数与总长度上限", async () => {
  const env = createEnv({ seed: seedComments(BASE_SEED) });
  const ip = (n) => ({ "cf-connecting-ip": "198.51.100." + n });

  const tooManyChinese = await request(worker, env, "/api/comments", jsonInit("POST", { content: "字".repeat(141) }, ip(11)));
  assert.equal(tooManyChinese.status, 400);
  assert.match((await tooManyChinese.json()).error, /汉字/);

  const tooManyWords = await request(worker, env, "/api/comments", jsonInit("POST", { content: Array.from({ length: 201 }, (_, i) => "w" + i).join(" ") }, ip(12)));
  assert.equal(tooManyWords.status, 400);
  assert.match((await tooManyWords.json()).error, /单词/);

  const tooLong = await request(worker, env, "/api/comments", jsonInit("POST", { content: ".".repeat(501) }, ip(13)));
  assert.equal(tooLong.status, 400);
  assert.match((await tooLong.json()).error, /长度/);

  const empty = await request(worker, env, "/api/comments", jsonInit("POST", { content: "   " }, ip(14)));
  assert.equal(empty.status, 400);
});

test("留言审核：通过后公开可见，删除后彻底消失", async () => {
  const env = createEnv({ seed: seedComments(BASE_SEED) });
  const { cookie } = await login(worker, env);

  const approve = await request(worker, env, "/api/admin/comments", jsonInit("POST", { id: "comm-pending-1", status: "approved" }, authed(cookie)));
  assert.equal(approve.status, 200);
  const publicItems = await (await request(worker, env, "/api/comments?articleId=guestbook")).json();
  assert.ok(publicItems.some((c) => c.id === "comm-pending-1"));

  const del = await request(worker, env, "/api/admin/comments?id=comm-pending-1", jsonInit("DELETE", undefined, authed(cookie)));
  assert.equal(del.status, 200);
  assert.ok(!(await adminComments(env, cookie)).some((c) => c.id === "comm-pending-1"));

  const missing = await request(worker, env, "/api/admin/comments", jsonInit("POST", { id: "not-there", status: "approved" }, authed(cookie)));
  assert.equal(missing.status, 404);
});

test("超过 24 小时未审核的留言在读取时即被视为已屏蔽（管理端可见标记）", async () => {
  const stale = makeComment({ id: "comm-stale", status: "pending", createdTimestamp: Date.now() - 48 * 3600 * 1000, content: "两天前没人管" });
  const env = createEnv({ seed: seedComments([...BASE_SEED, stale]) });
  const { cookie } = await login(worker, env);

  const all = await adminComments(env, cookie);
  const found = all.find((c) => c.id === "comm-stale");
  assert.equal(found.status, "rejected");
  assert.equal(found.autoBlocked, true);

  const publicItems = await (await request(worker, env, "/api/comments?articleId=guestbook")).json();
  assert.ok(!publicItems.some((c) => c.id === "comm-stale"));
});

test("自动屏蔽只做内存计算：读取路径零 KV 写入", async () => {
  const stale = makeComment({ id: "comm-stale", status: "pending", createdTimestamp: Date.now() - 48 * 3600 * 1000 });
  const env = createEnv({ seed: seedComments([...BASE_SEED, stale]) });
  const { cookie } = await login(worker, env);

  env.__kv.reset();
  await adminComments(env, cookie);
  await request(worker, env, "/api/comments");
  await request(worker, env, "/guestbook");

  assert.equal(
    env.__kv.stats.puts,
    0,
    `访客只是看一看留言板就消耗了写额度：${env.__kv.stats.putsByKey.join(", ")}`
  );
});

test("自动屏蔽的结果会在下一次真实写入时顺带落库", async () => {
  const stale = makeComment({ id: "comm-stale", status: "pending", createdTimestamp: Date.now() - 48 * 3600 * 1000 });
  const env = createEnv({ seed: seedComments([...BASE_SEED, stale]) });
  const { cookie } = await login(worker, env);

  await request(worker, env, "/api/admin/comments", jsonInit("POST", { id: "comm-pending-1", status: "approved" }, authed(cookie)));

  const persisted = JSON.parse(env.__kv.store.get("BLOG_COMMENTS"));
  assert.equal(persisted.find((c) => c.id === "comm-stale").status, "rejected");
  assert.equal(persisted.find((c) => c.id === "comm-pending-1").status, "approved");
});

test("每条留言最多 5 条回复，超出被拒绝", async () => {
  const withFiveReplies = makeComment({
    id: "comm-full",
    status: "approved",
    replies: Array.from({ length: 5 }, (_, i) => ({ id: "rep-seed-" + i, author: "读者", content: "第 " + (i + 1) + " 条回复", likes: 0, createdTimestamp: T.sep05 }))
  });
  const env = createEnv({ seed: seedComments([...BASE_SEED, withFiveReplies]) });

  const res = await request(worker, env, "/api/comments/reply", jsonInit("POST", { parentId: "comm-full", content: "第六条回复" }));
  assert.equal(res.status, 400);
  assert.match((await res.json()).error, /5 条上限/);
});

test("正常回复被接受并挂到母留言下", async () => {
  const env = createEnv({ seed: seedComments(BASE_SEED) });
  const res = await request(worker, env, "/api/comments/reply", jsonInit("POST", { parentId: "comm-approved-1", content: "支持一下", author: "读者戊" }));
  assert.equal(res.status, 200);
  assert.equal((await res.json()).success, true);

  const items = await (await request(worker, env, "/api/comments?articleId=guestbook")).json();
  const parent = items.find((c) => c.id === "comm-approved-1");
  assert.equal(parent.replies.length, 1);
  assert.equal(parent.replies[0].content, "支持一下");

  const missing = await request(worker, env, "/api/comments/reply", jsonInit("POST", { parentId: "nope", content: "x" }));
  assert.equal(missing.status, 404);
});

test("留言按周查询：from=YYYY-MM-DD 精确命中该 7 天窗口", async () => {
  const env = createEnv({ seed: seedComments(BASE_SEED) });

  const week = await (await request(worker, env, "/api/comments?from=2026-09-01")).json();
  assert.equal(week.from, "2026-09-01");
  assert.deepEqual(week.items.map((c) => c.id).sort(), ["comm-approved-1", "comm-approved-2"]);

  const otherWeek = await (await request(worker, env, "/api/comments?from=2026-10-01")).json();
  assert.deepEqual(otherWeek.items, []);

  const malformed = await (await request(worker, env, "/api/comments?from=09-01")).json();
  assert.equal(malformed.from, null, "非法日期参数应当被忽略并回退到默认最新 10 条");
  assert.ok(Array.isArray(malformed.items));
});

test("留言点赞支持对留言与回复分别计数", async () => {
  const withReply = makeComment({ id: "comm-like", status: "approved", likes: 3, replies: [{ id: "rep-1", author: "读者", content: "回复", likes: 1, createdTimestamp: T.sep05 }] });
  const env = createEnv({ seed: seedComments([...BASE_SEED, withReply]) });

  const commLike = await (await request(worker, env, "/api/comments/like", jsonInit("POST", { commentId: "comm-like" }))).json();
  assert.equal(commLike.likes, 4);

  const replyLike = await (await request(worker, env, "/api/comments/like", jsonInit("POST", { commentId: "comm-like", replyId: "rep-1" }))).json();
  assert.equal(replyLike.likes, 2);

  const missing = await request(worker, env, "/api/comments/like", jsonInit("POST", { commentId: "nope" }));
  assert.equal(missing.status, 404);
});
