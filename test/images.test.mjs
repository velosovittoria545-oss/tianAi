/** 插图上传与读取：上传后必须能按 id 取回，且带长期不可变缓存头。 */
import { test, before } from "node:test";
import assert from "node:assert/strict";
import { authed, createEnv, jsonInit, loadWorker, login, request } from "./helpers/env.mjs";

let worker;

const TINY_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==";

before(async () => {
  worker = await loadWorker();
});

test("上传图片需要登录", async () => {
  const env = createEnv();
  const res = await request(worker, env, "/api/upload", jsonInit("POST", { image: TINY_PNG }));
  assert.equal(res.status, 401);
});

test("上传后可通过返回的 URL 取回图片，并带 immutable 缓存头", async () => {
  const env = createEnv();
  const { cookie } = await login(worker, env);

  const upload = await request(worker, env, "/api/upload", jsonInit("POST", { image: TINY_PNG }, authed(cookie)));
  assert.equal(upload.status, 200);
  const { id, url } = await upload.json();
  assert.match(id, /^img_/);
  assert.equal(url, "/api/images/" + id);

  const fetched = await request(worker, env, url);
  assert.equal(fetched.status, 200);
  assert.equal(fetched.headers.get("Content-Type"), "image/png");
  assert.match(fetched.headers.get("Cache-Control") || "", /immutable/);
  assert.equal((await fetched.arrayBuffer()).byteLength > 0, true);
});

test("缺少图片数据返回 400", async () => {
  const env = createEnv();
  const { cookie } = await login(worker, env);
  const res = await request(worker, env, "/api/upload", jsonInit("POST", {}, authed(cookie)));
  assert.equal(res.status, 400);
});
