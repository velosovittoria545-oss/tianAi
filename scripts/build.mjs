#!/usr/bin/env node
/**
 * 构建脚本：src/ 源码 -> 根目录 worker.js 产物（wrangler.toml 的 main 保持指向根目录 worker.js）。
 *
 * 1. split：把根目录 worker.js（历史单文件）按段落边界拆成 src/**.js 模块。
 *    - 幂等：src/ 已存在且没有任何源文件缺失时，split 直接跳过。
 *    - 拆分只做「搬代码 + 加 import/export」，不改任何语句。
 *    - 手工改代码时：改 src/，不要改根目录 worker.js（会被本脚本覆盖）。
 * 2. bundle：esbuild 打包 src/worker.js -> worker.js（IIFE 格式，Cloudflare Workers 兼容）。
 */
import { buildSync } from "esbuild";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "src");
const ARTIFACT = path.join(ROOT, "worker.js");
const SEED = path.join(ROOT, "worker.origin.js");

/* ------------------------------------------------------------------ */
/* 1) 一次性拆分（幂等）                                                */
/* ------------------------------------------------------------------ */

function existsAll(files) {
  return files.every((f) => fs.existsSync(path.join(SRC, f)));
}

function sliceLines(text, from, to) {
  const lines = text.split("\n");
  return lines.slice(from - 1, to).join("\n");
}

function splitSeed() {
  const src0 = fs.readFileSync(SEED, "utf8");
  fs.mkdirSync(SRC, { recursive: true });
  fs.mkdirSync(path.join(SRC, "pages"), { recursive: true });

  const write = (rel, content) =>
    fs.writeFileSync(path.join(SRC, rel), content, "utf8");

  write("config.js", `// 全站静态配置（头像 / 赞赏码 / 默认身份）\n${sliceLines(src0, 15, 24)}\n`);
  write("seed-data.js", `// 默认文章 / 留言 / 经历 / 个人信息种子数据\n${sliceLines(src0, 25, 743)}\n${sliceLines(src0, 1155, 1211)}\n`);
  write("store.js", `// KV 存储：文章 / 浏览量（合并写入）/ 点赞 / 设置 / 留言 / 个人信息 / 图片\n${sliceLines(src0, 744, 1154)}\n${sliceLines(src0, 1239, 1303)}\n`);
  write("util.js", `// 小工具：HTML 转义、经历文本格式化\n${sliceLines(src0, 1212, 1238)}\n`);
  write("auth.js", `// 会话：无状态 HMAC 签名令牌（不读写 KV 即可鉴权）+ CSRF Origin 校验\n${sliceLines(src0, 1304, 1494)}\n`);
  write("pages/common.js", `// 页面共用 CSS\n${sliceLines(src0, 1495, 1697)}\n`);
  write("pages/articles.js", `// GET /articles\n${sliceLines(src0, 1698, 2789)}\n`);
  write("pages/guestbook.js", `// GET /guestbook（/messages）\n${sliceLines(src0, 2790, 3561)}\n`);
  write("pages/experience.js", `// GET /experience\n${sliceLines(src0, 3562, 3839)}\n`);
  write("pages/home.js", `// GET /\n${sliceLines(src0, 3840, 4219)}\n`);
  write("pages/admin-login.js", `// GET /admin（未登录）\n${sliceLines(src0, 4220, 4437)}\n`);
  write("pages/admin-cms.js", `// GET /admin（登录后的 CMS 主界面）\n${sliceLines(src0, 4438, 6400)}\n`);
  write("worker.js", `// Cloudflare Workers 入口：路由与所有 API 处理函数\n${sliceLines(src0, 6401, 7246)}\n`);

  addImportsAndExports();

  console.log("[build] split: worker.origin.js -> src/ (one-time codemod)");
}

/** 给拆出的模块补 import/export。行号基于当前文件内容，逐步追加。 */
function addImportsAndExports() {
  const j = (rel) => path.join(SRC, rel);
  const read = (rel) => fs.readFileSync(j(rel), "utf8");
  const write = (rel, content) => fs.writeFileSync(j(rel), content, "utf8");
  const prepend = (rel, block) => write(rel, block + read(rel));
  const append = (rel, block) => write(rel, read(rel).trimEnd() + "\n" + block);

  // config.js
  prepend("config.js", "// @ts-check\n");
  append("config.js", `export { CONFIG };`);

  // seed-data.js：依赖 config（头像/赞赏码 base64）
  prepend(
    "seed-data.js",
    `import { CONFIG } from "./config.js";\n\n`
  );
  append("seed-data.js", `export { DEFAULT_ARTICLES, DEFAULT_COMMENTS, DEFAULT_EXPERIENCES, DEFAULT_PROFILE };`);

  // store.js（hashVisitorKey / parseArticleDateMs / normalizeSortConfig / sortArticlesByConfig 都是存储层内部工具，随 store 走）
  prepend(
    "store.js",
    `import { DEFAULT_ARTICLES, DEFAULT_COMMENTS, DEFAULT_PROFILE } from "./seed-data.js";\n\n`
  );
  append(
    "store.js",
    `export {
  kvPut, kvWriteFailureResponse, getArticles, saveArticles, getArticleViews,
  saveArticleViews, getArticleLikes, saveArticleLikes, recordArticleView,
  flushPendingViews, scheduleViewFlush, getBlogSettings, saveBlogSettings,
  getComments, saveComments, getCommentsWithAutoExpiry, getProfile, saveProfile,
  saveUploadedImage, getUploadedImage, getArticlesWithMetrics, getAdminPassword
};`
  );

  // util.js
  append(
    "util.js",
    `export { escapeHtml, formatExpText };`
  );

  // auth.js
  prepend(
    "auth.js",
    `import { getAdminPassword } from "./store.js";\nimport { DEFAULT_PROFILE } from "./seed-data.js";\n\n`
  );
  append(
    "auth.js",
    `export {
  getSessionSecret, signSessionToken, verifySessionToken, buildSessionCookie,
  buildAdminFlagCookie, buildClearCookie, extractRequestToken, checkAuth,
  isWriteOriginAllowed, SESSION_COOKIE, SESSION_FLAG_COOKIE
};`
  );

  // 页面模块
  const pageImports = (names) => {
    const fromUtil = names.filter((n) =>
      ["escapeHtml", "formatExpText"].includes(n)
    );
    const lines = [`import { CONFIG } from "../config.js";`];
    if (fromUtil.length) lines.push(`import { ${fromUtil.join(", ")} } from "../util.js";`);
    return lines.join("\n") + "\n\n";
  };
  prepend("pages/common.js", pageImports(["CONFIG"]));
  prepend("pages/articles.js", pageImports(["CONFIG", "escapeHtml"]));
  prepend("pages/guestbook.js", pageImports(["CONFIG", "escapeHtml"]));
  prepend("pages/experience.js", pageImports(["CONFIG", "escapeHtml", "formatExpText"]));
  prepend("pages/home.js", pageImports(["CONFIG", "escapeHtml", "formatExpText"]));
  prepend("pages/admin-login.js", pageImports(["CONFIG"]));
  prepend("pages/admin-cms.js", pageImports(["CONFIG"]));
  append("pages/common.js", `export { COMMON_CSS };`);
  const pageExports = {
    articles: "renderArticlesPageHtml",
    guestbook: "renderGuestbookHtml",
    experience: "renderExperienceHtml",
    home: "renderPublicHtml",
    "admin-login": "renderAdminLoginHtml",
    "admin-cms": "renderAdminCmsHtml",
  };
  for (const [f, name] of Object.entries(pageExports)) {
    append(`pages/${f}.js`, `export { ${name} };`);
  }

  // worker.js 入口
  prepend(
    "worker.js",
    `import {
  getArticlesWithMetrics, getBlogSettings, getCommentsWithAutoExpiry, getProfile,
  saveArticles, saveComments, saveProfile, saveBlogSettings, saveUploadedImage,
  getUploadedImage, getArticleViews, getArticleLikes, saveArticleViews,
  saveArticleLikes, recordArticleView, scheduleViewFlush, kvWriteFailureResponse
} from "./store.js";
import {
  signSessionToken, verifySessionToken, checkAuth, isWriteOriginAllowed,
  buildSessionCookie, buildAdminFlagCookie, buildClearCookie
} from "./auth.js";
import { renderArticlesPageHtml } from "./pages/articles.js";
import { renderGuestbookHtml } from "./pages/guestbook.js";
import { renderExperienceHtml } from "./pages/experience.js";
import { renderPublicHtml } from "./pages/home.js";
import { renderAdminLoginHtml } from "./pages/admin-login.js";
import { renderAdminCmsHtml } from "./pages/admin-cms.js";
import { DEFAULT_PROFILE } from "./seed-data.js";

`
  );
}

/* ------------------------------------------------------------------ */
/* 2) esbuild 打包                                                      */
/* ------------------------------------------------------------------ */

function bundle() {
  if (!existsAll(["worker.js"])) {
    throw new Error("src/worker.js 不存在，无法打包");
  }
  buildSync({
    entryPoints: [path.join(SRC, "worker.js")],
    bundle: true,
    format: "esm", // module worker：保留 export default，测试与 wrangler 都按 ESM 加载
    platform: "neutral",
    target: "es2022",
    outfile: ARTIFACT,
    legalComments: "none",
    logLevel: "info",
  });
}

/* ------------------------------------------------------------------ */

/* split 产物的完整清单：src/ 里这些文件都在时视为「已拆分过」，跳过 codemod。
 * （否则每次 build 都会用 worker.origin.js 覆盖 src/，手工改动会静默丢失。） */
const SPLIT_FILES = [
  "config.js", "seed-data.js", "store.js", "util.js", "auth.js", "worker.js",
  "pages/common.js", "pages/articles.js", "pages/guestbook.js", "pages/experience.js",
  "pages/home.js", "pages/admin-login.js", "pages/admin-cms.js",
];

/* ------------------------------------------------------------------ */
/* 3) 自动补齐缺失的跨模块 import                                        */
/* ------------------------------------------------------------------ */

/* 拆分 codemod 依赖行号与人工维护，容易漏 import（esbuild 只对「import 了但没导出」
 * 报警告，对「引用了但没 import」会当成全局变量静默放行，运行时才 ReferenceError）。
 * 这里每次构建都跑一遍自愈：凡是引用了其他模块导出名、但本文件没 import 的，自动补上。
 * 只增不改：不会动已有 import，只会在文件头（注释块之后）追加新的 import 行。 */
function listSrcFiles(dir, out = []) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) listSrcFiles(p, out);
    else if (p.endsWith(".js")) out.push(p);
  }
  return out;
}

function fixMissingImports() {
  const files = listSrcFiles(SRC);

  // 1) 收集全部导出名 -> 定义文件绝对路径
  const exporters = new Map(); // name -> absolute path
  for (const p of files) {
    const code = fs.readFileSync(p, "utf8");
    for (const m of code.matchAll(/^export\s*\{([^}]+)\}/gm)) {
      for (const n of m[1].split(",")) {
        const name = n.trim().split(/\s+as\s+/).pop().trim();
        if (name && !exporters.has(name)) exporters.set(name, p);
      }
    }
  }

  let fixedTotal = 0;
  for (const p of files) {
    const code = fs.readFileSync(p, "utf8");

    // 2) 本文件已 import 的名字
    const imported = new Set();
    for (const m of code.matchAll(/import\s*\{([^}]+)\}\s*from\s*["'][^"']*["']/g)) {
      for (const n of m[1].split(",")) {
        const t = n.trim().split(/\s+as\s+/)[0].trim();
        if (t) imported.add(t);
      }
    }

    // 3) 引用了但没 import 的导出名（跳过注释行 / import / export 行）
    const need = new Map(); // exporter 绝对路径 -> Set<name>
    for (const [name, defPath] of exporters) {
      if (imported.has(name) || defPath === p) continue;
      const re = new RegExp("(?<![\\w.$])" + name + "(?![\\w$])");
      const hits = code.split("\n").some((l) => {
        const t = l.trim();
        if (t.startsWith("//") || t.startsWith("*") || t.startsWith("import") || t.startsWith("export")) return false;
        return re.test(l);
      });
      if (hits) {
        if (!need.has(defPath)) need.set(defPath, new Set());
        need.get(defPath).add(name);
      }
    }
    if (need.size === 0) continue;

    // 4) 在文件头注释块之后插入新的 import 行（ESM import 会提升，位置安全）
    const lines = code.split("\n");
    let insertAt = 0;
    while (insertAt < lines.length) {
      const t = lines[insertAt].trim();
      if (t === "" || t.startsWith("//")) insertAt++;
      else break;
    }
    const spec = (from, to) => {
      let rel = path.relative(path.dirname(from), to).replace(/\\/g, "/");
      if (!rel.startsWith(".")) rel = "./" + rel;
      return rel;
    };
    const newImports = [...need.entries()]
      .map(([defPath, names]) => `import { ${[...names].sort().join(", ")} } from "${spec(p, defPath)}";`)
      .sort();
    lines.splice(insertAt, 0, ...newImports, "");
    fs.writeFileSync(p, lines.join("\n"), "utf8");
    fixedTotal += newImports.length;
    for (const line of newImports) console.log(`[build] fix-imports: ${path.relative(ROOT, p)} <- ${line}`);
  }
  if (fixedTotal) console.log(`[build] fix-imports: 共补 ${fixedTotal} 条 import`);
}

if (fs.existsSync(SEED) && !existsAll(SPLIT_FILES)) {
  splitSeed();
} else if (!existsAll(["worker.js"])) {
  throw new Error("缺少 worker.origin.js 且 src/ 为空：无法构建");
}
fixMissingImports();
bundle();
