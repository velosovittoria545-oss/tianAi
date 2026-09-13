#!/usr/bin/env node
/**
 * 产物检查：build 之后运行。
 *  1. 产物必须是合法 ESM（构建 format 为 "esm"，含 export default，
 *     因此写入临时 .mjs 用 node --check 校验——new Function() 只支持脚本语法会误报）。
 *  2. 产物里不允许残留 require(...)（platform=neutral 的 esbuild 产物不该有 CJS 调用）。
 */
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";

const artifact = "worker.js";
const code = readFileSync(artifact, "utf8");

// 1) 语法可编译（不执行）
const dir = mkdtempSync(path.join(tmpdir(), "tianai-check-"));
try {
  const tmp = path.join(dir, "artifact.mjs");
  writeFileSync(tmp, code, "utf8");
  const res = spawnSync(process.execPath, ["--check", tmp], { encoding: "utf8" });
  if (res.status !== 0) {
    const errLine = (res.stderr || "").split("\n").find((l) => l.trim() !== "") || "未知语法错误";
    console.error(`[check] FAIL: 产物语法错误: ${errLine.trim()}`);
    process.exit(1);
  }
} finally {
  rmSync(dir, { recursive: true, force: true });
}

// 2) 不允许残留 require 调用
const bad = /(^|[^\w.$])require\s*\(/m.exec(code);
if (bad) {
  console.error("[check] FAIL: 产物中残留 require(...)，请检查 src/ 里是否有 CJS 写法");
  process.exit(1);
}

console.log(`[check] OK: ${artifact} (${(code.length / 1024).toFixed(1)} KB, ESM)`);
