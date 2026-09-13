/**
 * 性能与免费版配额回归测试。
 *
 * 两条不变量：
 *  1) 读要并发发出，不能一个个 await（KV 往返几十毫秒，串行会直接相加）；
 *  2) 响应不能被「记一次浏览」这种后台写入挡住。
 * 这里用带延迟的内存 KV 把并发峰值与耗时量出来，避免以后有人把 Promise.all 改回串行。
 */
import { test, before, mock } from "node:test";
import assert from "node:assert/strict";
import { authed, createCtx, createEnv, loadWorker, login, request } from "./helpers/env.mjs";

const LATENCY_MS = 40;
let worker;

before(async () => {
  worker = await loadWorker();
});

test("文章列表接口的 4 次 KV 读是并发发出的（而非串行相加）", async () => {
  const env = createEnv({ latencyMs: LATENCY_MS });
  const started = Date.now();
  const res = await request(worker, env, "/api/articles");
  const elapsed = Date.now() - started;

  assert.equal(res.status, 200);
  await res.json();

  assert.ok(env.__kv.stats.gets >= 4, "文章数据、浏览量、点赞数、设置都要读");
  assert.ok(
    env.__kv.stats.maxConcurrentReads >= 4,
    `4 次读应当并发进行，实测并发峰值只有 ${env.__kv.stats.maxConcurrentReads}`
  );
  // 串行的话至少 4×40=160ms，并发应当明显低于这个数
  assert.ok(elapsed < 120, `文章列表耗时 ${elapsed}ms，说明读又被串行了`);
});

test("管理后台首屏的多次 KV 读也是并发发出的", async () => {
  const env = createEnv({ latencyMs: LATENCY_MS });
  const { cookie } = await login(worker, env);

  env.__kv.stats.maxConcurrentReads = 0;
  const res = await request(worker, env, "/admin", { headers: authed(cookie) });
  assert.equal(res.status, 200);
  await res.text();

  assert.ok(
    env.__kv.stats.maxConcurrentReads >= 5,
    `后台首屏应当并发读取文章/留言/简历/设置，实测并发峰值只有 ${env.__kv.stats.maxConcurrentReads}`
  );
});

test("记一次浏览不会阻塞响应：写入被推迟到响应之后", async () => {
  const env = createEnv({
    seed: { ARTICLES_DATA: JSON.stringify([{ id: "perf-a", title_zh: "性能文章", content_zh: "<p>x</p>", date: "2026.01.01", views: 5, likes: 0 }]) }
  });
  const ctx = createCtx();

  mock.timers.enable({ apis: ["setTimeout"] });
  try {
    const res = await request(worker, env, "/api/articles/view?id=perf-a", { method: "POST" }, ctx.ctx);
    assert.equal(res.status, 200);
    assert.equal((await res.json()).views, 6);

    // 响应已经返回，此刻还没有任何写入发生
    assert.equal(env.__kv.stats.puts, 0, "浏览量写入必须延后到响应之后");

    mock.timers.tick(5000);
    await ctx.drain();
  } finally {
    mock.timers.reset();
  }

  assert.equal(JSON.parse(env.__kv.store.get("ARTICLE_VIEWS"))["perf-a"], 1);
});

test("只读请求在读额度上花的钱是可控的：单次页面请求不超过 8 次 KV 读", async () => {
  const env = createEnv();
  env.__kv.reset();
  await request(worker, env, "/api/articles");
  assert.ok(env.__kv.stats.gets <= 8, `文章列表接口读了 ${env.__kv.stats.gets} 次 KV，偏多`);

  env.__kv.reset();
  await request(worker, env, "/guestbook");
  assert.ok(env.__kv.stats.gets <= 3, `留言板页面读了 ${env.__kv.stats.gets} 次 KV，偏多`);
});
