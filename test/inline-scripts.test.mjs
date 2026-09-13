/**
 * 防复发守卫：把所有页面里内联的 <script> 正文抠出来真正解析一遍。
 *
 * 为什么值得单独一个文件：这个项目的页面是「模板字面量里套 HTML 与 JS」写成的，
 * 一个反引号或一处未转义的正则/斜杠就能把整页的脚本写坏，而线上表现为
 * 「按钮全都没反应」。历史上已经有两次提交是在修这类事故（broken admin publish
 * & logout、fix CMS script syntax）。有了这条断言，同类错误在本地几秒内就会红。
 */
import { test, before } from "node:test";
import assert from "node:assert/strict";
import { authed, createEnv, extractInlineScripts, loadWorker, login, request } from "./helpers/env.mjs";

let worker;

before(async () => {
  worker = await loadWorker();
});

async function renderAllPages() {
  const env = createEnv();
  const { cookie } = await login(worker, env);
  const pages = [];
  for (const path of ["/", "/articles", "/experience", "/guestbook"]) {
    pages.push({ name: path, html: await (await request(worker, env, path)).text() });
  }
  pages.push({ name: "/admin (未登录)", html: await (await request(worker, env, "/admin")).text() });
  pages.push({ name: "/admin (已登录)", html: await (await request(worker, env, "/admin", { headers: authed(cookie) })).text() });
  return pages;
}

test("所有页面都内联了可解析的脚本（没有把整页 JS 写坏）", async () => {
  const pages = await renderAllPages();
  for (const { name, html } of pages) {
    const scripts = extractInlineScripts(html);
    assert.ok(scripts.length > 0, `${name} 里一个内联脚本都没有，页面多半是坏的`);
    scripts.forEach((body, i) => {
      try {
        // 只做语法解析，不执行：捕获 SyntaxError 就说明这一页的脚本已经坏了
        new Function(body);
      } catch (err) {
        assert.fail(`${name} 第 ${i + 1} 段内联脚本语法错误：${err.message}`);
      }
    });
  }
});

test("页面里的模板变量都已求值（没有漏出 ${...} 占位符）", async () => {
  const pages = await renderAllPages();
  for (const { name, html } of pages) {
    assert.ok(!/\$\{[A-Za-z_$][^}]*\}/.test(html), `${name} 中残留了未求值的模板变量`);
  }
});

test("关键交互函数在所有相关页面都存在（改模板时别把它们删掉）", async () => {
  const pages = await renderAllPages();
  const byName = Object.fromEntries(pages.map((p) => [p.name, p.html]));

  assert.match(byName["/articles"], /function\s+\(\)|async function|=>/);
  assert.match(byName["/articles"], /api\/articles\/like/);
  assert.match(byName["/guestbook"], /api\/comments\/reply/);
  assert.match(byName["/admin (已登录)"], /handleLogout/);
  assert.match(byName["/admin (已登录)"], /switchAdminTab/);
  assert.match(byName["/admin (未登录)"], /\/api\/login/);
});
