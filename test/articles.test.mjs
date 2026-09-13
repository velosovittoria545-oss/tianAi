/**
 * 文章域测试：增删改、隐藏开关、浏览量、点赞去重、排序配置。
 *
 * 其中「编辑正文不得把隐藏文章重新公开」这条是历史回归点：AI 翻译自动保存曾经
 * 因为没带 hidden 字段而把隐藏文章重新放出来，这里把它钉死。
 */
import { test, before, mock } from "node:test";
import assert from "node:assert/strict";
import { authed, createCtx, createEnv, jsonInit, loadWorker, login, request } from "./helpers/env.mjs";

let worker;

before(async () => {
  worker = await loadWorker();
});

function seedArticles() {
  return {
    ARTICLES_DATA: JSON.stringify([
      { id: "art-a", title_zh: "文章 A", title_en: "Article A", content_zh: "<p>A</p>", content_en: "<p>A</p>", date: "2026.01.01", views: 10, likes: 1, tags: ["测试"] },
      { id: "art-b", title_zh: "文章 B", title_en: "Article B", content_zh: "<p>B</p>", content_en: "<p>B</p>", date: "2026.02.01", views: 30, likes: 5, tags: ["测试"] },
      { id: "art-c", title_zh: "文章 C", title_en: "Article C", content_zh: "<p>C</p>", content_en: "<p>C</p>", date: "2026.03.01", views: 20, likes: 3, tags: ["测试"] }
    ])
  };
}

async function anonArticles(env) {
  return (await request(worker, env, "/api/articles")).json();
}

async function adminArticles(env, cookie) {
  return (await request(worker, env, "/api/articles", { headers: authed(cookie) })).json();
}

test("写接口（保存/删除/隐藏/排序）必须登录", async () => {
  const env = createEnv({ seed: seedArticles() });
  const cases = [
    ["/api/articles", "POST", { id: "x", title_zh: "x" }],
    ["/api/articles?id=art-a", "DELETE", undefined],
    ["/api/articles/hide?id=art-a", "POST", { hidden: true }],
    ["/api/settings", "POST", { articleSort: { field: "likes", order: "desc" } }]
  ];
  for (const [path, method, payload] of cases) {
    const res = await request(worker, env, path, jsonInit(method, payload));
    assert.equal(res.status, 401, `${method} ${path} 应当拒绝匿名访问`);
  }
  assert.equal(env.__kv.stats.puts, 0);
});

test("新建文章后访客可见，且浏览量/点赞数被独立持久化", async () => {
  const env = createEnv({ seed: seedArticles() });
  const { cookie } = await login(worker, env);

  const res = await request(
    worker,
    env,
    "/api/articles",
    jsonInit("POST", { id: "art-new", title_zh: "新文章", content_zh: "<p>正文</p>", date: "2026.04.01", views: 77, likes: 9 }, authed(cookie))
  );
  assert.equal(res.status, 200);

  const items = await anonArticles(env);
  const created = items.find((a) => a.id === "art-new");
  assert.ok(created, "新文章应当出现在公开列表里");
  assert.equal(created.views, 77);
  assert.equal(created.likes, 9);
});

test("隐藏的文章对访客不可见、对管理员可见，且编辑正文不会把它重新公开", async () => {
  const env = createEnv({ seed: seedArticles() });
  const { cookie } = await login(worker, env);

  const hideRes = await request(worker, env, "/api/articles/hide?id=art-a", jsonInit("POST", { hidden: true }, authed(cookie)));
  assert.equal(hideRes.status, 200);

  assert.ok(!(await anonArticles(env)).some((a) => a.id === "art-a"));
  assert.ok((await adminArticles(env, cookie)).some((a) => a.id === "art-a" && a.hidden === true));

  // 关键回归：编辑时前端不携带 hidden 字段，服务端必须沿用已存的隐藏状态
  const editRes = await request(
    worker,
    env,
    "/api/articles",
    jsonInit("POST", { id: "art-a", title_zh: "文章 A（改）", content_zh: "<p>A2</p>" }, authed(cookie))
  );
  assert.equal(editRes.status, 200);
  assert.ok(!(await anonArticles(env)).some((a) => a.id === "art-a"), "编辑正文后文章仍然应该是隐藏的");

  // 显式取消隐藏则重新公开
  await request(worker, env, "/api/articles/hide?id=art-a", jsonInit("POST", { hidden: false }, authed(cookie)));
  assert.ok((await anonArticles(env)).some((a) => a.id === "art-a"));
});

test("删除文章会同时清掉它的浏览量/点赞数残留", async () => {
  const env = createEnv({
    seed: {
      ...seedArticles(),
      ARTICLE_VIEWS: JSON.stringify({ "art-b": 30, "art-a": 10 }),
      ARTICLE_LIKES: JSON.stringify({ "art-b": 5, "art-a": 1 })
    }
  });
  const { cookie } = await login(worker, env);

  const res = await request(worker, env, "/api/articles?id=art-b", jsonInit("DELETE", undefined, authed(cookie)));
  assert.equal(res.status, 200);
  assert.ok(!(await anonArticles(env)).some((a) => a.id === "art-b"));

  const views = JSON.parse(env.__kv.store.get("ARTICLE_VIEWS"));
  const likes = JSON.parse(env.__kv.store.get("ARTICLE_LIKES"));
  assert.equal(views["art-b"], undefined);
  assert.equal(likes["art-b"], undefined);
});

test("浏览量递增并落库（写入可以延后，但最终必须一致）", async () => {
  const env = createEnv({ seed: { ...seedArticles(), ARTICLE_VIEWS: JSON.stringify({ "art-a": 100 }) } });
  const ctx = createCtx();

  // 合并写入窗口用假定时器跳过，测试不必真的等 3 秒
  mock.timers.enable({ apis: ["setTimeout"] });
  try {
    const res = await request(worker, env, "/api/articles/view?id=art-a", { method: "POST" }, ctx.ctx);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.views, 101);

    mock.timers.tick(5000);
    await ctx.drain();
  } finally {
    mock.timers.reset();
  }

  const views = JSON.parse(env.__kv.store.get("ARTICLE_VIEWS") || "{}");
  assert.equal(views["art-a"], 101);
});

test("同一窗口内的多次浏览合并成一次 KV 写入（保住免费版每日 1000 次写额度）", async () => {
  const env = createEnv({ seed: { ...seedArticles(), ARTICLE_VIEWS: JSON.stringify({ "art-a": 0 }) } });
  const ctx = createCtx();

  mock.timers.enable({ apis: ["setTimeout"] });
  try {
    for (let i = 1; i <= 5; i++) {
      const res = await request(worker, env, "/api/articles/view?id=art-a", { method: "POST" }, ctx.ctx);
      assert.equal((await res.json()).views, i, "读者看到的计数要包含还没落库的增量");
    }
    assert.equal(env.__kv.stats.puts, 0, "窗口内不应该有任何 KV 写入");

    mock.timers.tick(5000);
    await ctx.drain();
  } finally {
    mock.timers.reset();
  }

  assert.equal(JSON.parse(env.__kv.store.get("ARTICLE_VIEWS"))["art-a"], 5);
  const viewWrites = env.__kv.stats.putsByKey.filter((k) => k === "ARTICLE_VIEWS").length;
  assert.equal(viewWrites, 1, `5 次浏览应当只写一次 ARTICLE_VIEWS，实际写了 ${viewWrites} 次`);
});

test("浏览量缺少 id 时返回 400", async () => {
  const env = createEnv({ seed: seedArticles() });
  const res = await request(worker, env, "/api/articles/view", { method: "POST" });
  assert.equal(res.status, 400);
});

test("同一访客 7 天内重复点赞不重复计数，换访客才计数", async () => {
  const env = createEnv({ seed: seedArticles() });
  const ip = { "cf-connecting-ip": "203.0.113.9" };

  const first = await (await request(worker, env, "/api/articles/like?id=art-a", { method: "POST", headers: ip })).json();
  assert.equal(first.alreadyLiked, false);
  assert.equal(first.likes, 2, "种子文章 art-a 的初始点赞数是 1");

  const second = await (await request(worker, env, "/api/articles/like?id=art-a", { method: "POST", headers: ip })).json();
  assert.equal(second.alreadyLiked, true);
  assert.equal(second.likes, 2);

  const other = await (await request(worker, env, "/api/articles/like?id=art-a", { method: "POST", headers: { "cf-connecting-ip": "203.0.113.10" } })).json();
  assert.equal(other.alreadyLiked, false);
  assert.equal(other.likes, 3);
});

test("给不存在的文章点赞返回 404", async () => {
  const env = createEnv({ seed: seedArticles() });
  const res = await request(worker, env, "/api/articles/like?id=does-not-exist", { method: "POST" });
  assert.equal(res.status, 404);
});

test("排序配置生效：按点赞降序 / 按日期降序 / 按浏览量升序", async () => {
  const env = createEnv({ seed: seedArticles() });
  const { cookie } = await login(worker, env);

  await request(worker, env, "/api/settings", jsonInit("POST", { articleSort: { field: "likes", order: "desc" } }, authed(cookie)));
  assert.deepEqual(
    (await anonArticles(env)).map((a) => a.id),
    ["art-b", "art-c", "art-a"]
  );

  await request(worker, env, "/api/settings", jsonInit("POST", { articleSort: { field: "views", order: "asc" } }, authed(cookie)));
  assert.deepEqual(
    (await anonArticles(env)).map((a) => a.id),
    ["art-a", "art-c", "art-b"]
  );

  await request(worker, env, "/api/settings", jsonInit("POST", { articleSort: { field: "date", order: "desc" } }, authed(cookie)));
  assert.deepEqual(
    (await anonArticles(env)).map((a) => a.id),
    ["art-c", "art-b", "art-a"]
  );

  // 非法字段被忽略，不会把配置写坏
  await request(worker, env, "/api/settings", jsonInit("POST", { articleSort: { field: "hacked", order: "sideways" } }, authed(cookie)));
  const settings = await (await request(worker, env, "/api/settings", { headers: authed(cookie) })).json();
  assert.equal(settings.articleSort.field, "date");
  assert.equal(settings.articleSort.order, "desc");
});

test("KV 写入失败时，保存文章必须报错而不是假装成功", async () => {
  const env = createEnv({ seed: seedArticles(), failWrites: true });
  const ctx = createCtx();
  const { cookie } = await login(worker, env, { ctx: ctx.ctx });

  const res = await request(
    worker,
    env,
    "/api/articles",
    jsonInit("POST", { id: "art-fail", title_zh: "写不进去", content_zh: "<p>x</p>" }, authed(cookie))
  );
  assert.equal(res.status, 500, "KV 写入被拒绝时必须让调用方看到失败");
  const body = await res.json();
  assert.match(String(body.error), /保存失败|写入/);
});
