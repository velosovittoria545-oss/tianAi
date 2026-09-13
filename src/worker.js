import { ARTICLE_SORT_FIELDS, commentTimestampMs, hashVisitorKey, normalizeArticle, normalizeSortConfig, pendingViewDelta } from "./store.js";
import { SESSION_TTL_SEC, getSessionVersion } from "./auth.js";

import { CONFIG } from "./config.js";
import { SESSION_COOKIE, SESSION_FLAG_COOKIE } from "./auth.js";
import { flushPendingViews, getAdminPassword, getArticles } from "./store.js";

import {
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

// Cloudflare Workers 入口：路由与所有 API 处理函数
export default {
  // 第三个参数 ctx 是为了 ctx.waitUntil：浏览量等「不影响响应」的写入放到响应之后执行
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CSRF 防护：所有写操作校验 Origin（同源与本地开发放行，无 Origin 的非浏览器客户端放行）
    if (method !== "GET" && method !== "HEAD" && method !== "OPTIONS" && !isWriteOriginAllowed(request)) {
      return new Response(JSON.stringify({ error: "跨站请求被拒绝" }), {
        status: 403,
        headers: { "Content-Type": "application/json;charset=UTF-8" }
      });
    }

    // 1. API: 登录 POST /api/login
    if (path === "/api/login" && method === "POST") {
      try {
        const body = await request.json();
        const inputUser = (body.username || "").trim().toLowerCase();
        const inputPass = (body.password || "").trim();
        const configuredUser = (CONFIG.adminUsername || "admin").trim().toLowerCase();
        const configuredEmail = (DEFAULT_PROFILE.email || "velosovittoria545@gmail.com").trim().toLowerCase();
        const configuredPass = (getAdminPassword(env) || "").trim();

        // 宽容适配：用户名支持 'admin'、配置用户名及管理员邮箱（不区分大小写）
        const userMatches = (inputUser === configuredUser || inputUser === configuredEmail || inputUser === "admin");
        if (userMatches && inputPass === configuredPass) {
          // 无状态签名令牌：只放进 HttpOnly cookie，响应体不再回传 token（避免被 JS 读取）
          const token = await signSessionToken(env, await getSessionVersion(env));
          const headers = new Headers({
            "Content-Type": "application/json;charset=UTF-8",
            "Cache-Control": "no-store, no-cache, must-revalidate"
          });
          headers.append("Set-Cookie", buildSessionCookie(token));
          headers.append("Set-Cookie", buildAdminFlagCookie());
          return new Response(JSON.stringify({ success: true, expiresIn: SESSION_TTL_SEC }), { headers });
        }
        return new Response(JSON.stringify({ success: false, error: "用户名或密码错误，请核对后重试。" }), {
          status: 401,
          headers: { "Content-Type": "application/json;charset=UTF-8" }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 400 });
      }
    }

    // 2. API: 登出 POST/GET /api/logout
    // 无状态会话没有服务端记录可删，登出 = 让浏览器丢掉 cookie
    if (path === "/api/logout" && (method === "POST" || method === "GET")) {
      const headers = new Headers({
        "Content-Type": "application/json;charset=UTF-8",
        "Cache-Control": "no-store, no-cache, must-revalidate"
      });
      headers.append("Set-Cookie", buildClearCookie(SESSION_COOKIE, true));
      headers.append("Set-Cookie", buildClearCookie(SESSION_FLAG_COOKIE, false));
      return new Response(JSON.stringify({ success: true }), { headers });
    }

    // 3. API: 获取文章列表 GET /api/articles
    if ((path === "/api/articles" || path === "/articles.json") && method === "GET") {
      // 文章数据与鉴权判定彼此独立，一起发出去，少一次串行往返
      const [allItems, isAdminView] = await Promise.all([
        getArticlesWithMetrics(env),
        checkAuth(request, env)
      ]);
      // 未登录访客看不到被隐藏的文章；管理员登录后可见全部（后台需要展示并切换隐藏状态）
      let items = allItems;
      if (!isAdminView) items = items.filter(a => !a.hidden);
      return new Response(JSON.stringify(items, null, 2), {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": isAdminView ? "no-store" : "public, max-age=15"
        }
      });
    }

    // 3.5. API: 记录并增加文章浏览量 POST /api/articles/view?id=...
    if (path === "/api/articles/view" && method === "POST") {
      const artId = url.searchParams.get("id");
      if (!artId) {
        return new Response(JSON.stringify({ error: "Missing id" }), { status: 400 });
      }
      try {
        const viewsMap = await getArticleViews(env);
        let currentViews = viewsMap[artId];
        if (typeof currentViews !== 'number') {
          const allArts = await getArticles(env);
          const found = allArts.find(a => a.id === artId);
          if (found && found.views) {
            currentViews = typeof found.views === 'number' ? found.views : (parseInt(String(found.views).replace(/[^0-9]/g, ''), 10) || 1000);
          } else {
            currentViews = 1000;
          }
        }
        // 补上还没落库的增量，再记下这一次浏览；真正写 KV 由 waitUntil 在响应之后合并完成
        currentViews += pendingViewDelta(env, artId);
        recordArticleView(env, artId);
        currentViews += 1;
        scheduleViewFlush(env, ctx);
        return new Response(JSON.stringify({ success: true, id: artId, views: currentViews }), {
          headers: { "Content-Type": "application/json;charset=UTF-8" }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
      }
    }

    // 3.6. API: 文章点赞 POST /api/articles/like?id=...
    if (path === "/api/articles/like" && method === "POST") {
      const artId = url.searchParams.get("id");
      if (!artId) {
        return new Response(JSON.stringify({ error: "Missing id" }), { status: 400 });
      }
      try {
        const likesMap = await getArticleLikes(env);
        let currentLikes = likesMap[artId];
        if (typeof currentLikes !== 'number') {
          const allArts = await getArticles(env);
          const found = allArts.find(a => a.id === artId);
          if (!found) {
            return new Response(JSON.stringify({ error: "Article not found" }), { status: 404 });
          }
          currentLikes = typeof found.likes === 'number'
            ? found.likes
            : (parseInt(String(found.likes || '0').replace(/[^0-9]/g, ''), 10) || 0);
        }

        // 同一访客对同一篇文章 7 天内只计一次，防止刷新刷赞
        const clientIp = request.headers.get("cf-connecting-ip") || request.headers.get("x-real-ip") || "";
        const dedupKey = (env && env.BLOG_KV && clientIp)
          ? "LIKE_SEEN_" + artId + "_" + hashVisitorKey(clientIp)
          : null;
        let alreadyLiked = false;
        if (dedupKey) {
          try {
            if (await env.BLOG_KV.get(dedupKey)) alreadyLiked = true;
          } catch (e) {
            console.error("Like dedup read error:", e);
          }
        }

        // 点赞属于「尽力而为」的互动：写入失败不回 500（读者体验优先），但必须把失败原因
        // 明说出去，而不是让界面显示一个其实没存下来的数字
        let likeWarning = null;
        if (!alreadyLiked) {
          likesMap[artId] = currentLikes + 1;
          const likeSaved = await saveArticleLikes(env, likesMap);
          if (likeSaved.ok || likeSaved.skipped) {
            currentLikes += 1;
            // 只有计数真的落库了才记去重标记：否则这次点赞会因为「已点过」而永远补不上
            if (dedupKey) {
              try {
                await env.BLOG_KV.put(dedupKey, "1", { expirationTtl: 604800 });
              } catch (e) {
                console.error("Like dedup write error:", e);
              }
            }
          } else {
            likeWarning = "点赞未能保存：Cloudflare KV 写入被拒绝（" + (likeSaved.error || "未知原因") + "）";
          }
        }

        return new Response(JSON.stringify({ success: true, id: artId, likes: currentLikes, alreadyLiked: alreadyLiked, warning: likeWarning }), {
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "no-store, no-cache, must-revalidate"
          }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
      }
    }

    // 3.9 API: AI 翻译 POST /api/translate
    if (path === "/api/translate" && method === "POST") {
      if (!await checkAuth(request, env)) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
      }
      try {
        const body = await request.json();
        const { text, from, to } = body || {};
        if (!text || !text.trim()) {
          return new Response(JSON.stringify({ error: "Missing text to translate" }), { status: 400 });
        }
        if (!env.AI) {
          return new Response(JSON.stringify({ error: "Workers AI binding (env.AI) is not configured in wrangler.toml" }), { status: 500 });
        }
        const source_lang = (from === 'en') ? 'en' : 'zh';
        const target_lang = (to === 'zh') ? 'zh' : 'en';

        const aiResponse = await env.AI.run('@cf/meta/m2m100-1.2b', {
          text: text,
          source_lang: source_lang,
          target_lang: target_lang
        });

        const translatedText = aiResponse ? (aiResponse.translated_text || aiResponse.response || "") : "";
        return new Response(JSON.stringify({ translatedText: translatedText }), {
          headers: { "Content-Type": "application/json;charset=UTF-8" }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message || "Translation failed" }), { status: 500 });
      }
    }

    // 3.9. API: 切换文章隐藏状态 POST /api/articles/hide?id=...  body: { hidden: true|false }
    if (path === "/api/articles/hide" && method === "POST") {
      if (!await checkAuth(request, env)) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
      }
      const hideId = url.searchParams.get("id");
      if (!hideId) {
        return new Response(JSON.stringify({ error: "Missing article id" }), { status: 400 });
      }
      try {
        let body = {};
        try { body = await request.json(); } catch (e) { body = {}; }
        const nextHidden = body.hidden === true || body.hidden === "true" || body.hidden === 1 || body.hidden === "1";

        let items = await getArticles(env);
        const hIdx = items.findIndex(a => a.id === hideId);
        if (hIdx < 0) {
          return new Response(JSON.stringify({ error: "Article not found" }), { status: 404 });
        }
        items[hIdx] = Object.assign({}, items[hIdx], { hidden: nextHidden });
        const hideWriteFailed = kvWriteFailureResponse(await saveArticles(env, items));
        if (hideWriteFailed) return hideWriteFailed;

        return new Response(JSON.stringify({ success: true, id: hideId, hidden: nextHidden }), {
          headers: { "Content-Type": "application/json;charset=UTF-8" }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
      }
    }

    // 4. API: 保存/更新文章 POST /api/articles
    if (path === "/api/articles" && method === "POST") {
      if (!await checkAuth(request, env)) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
      }
      try {
        let rawItem = await request.json();
        if (!rawItem || !rawItem.id || !(rawItem.title || rawItem.title_zh)) {
          return new Response(JSON.stringify({ error: "Invalid article payload" }), { status: 400 });
        }
        const newItem = normalizeArticle(rawItem);

        // 管理员显式填了浏览量时，先把内存里未落库的浏览增量写下去，
        // 免得后台的修正值又被稍后的合并写入盖掉
        if (typeof newItem.views === 'number') await flushPendingViews(env);

        const [items, viewsMap, likesMap] = await Promise.all([
          getArticles(env),
          getArticleViews(env),
          getArticleLikes(env)
        ]);
        const idx = items.findIndex(a => a.id === newItem.id);
        if (idx >= 0) {
          // 隐藏开关只由 /api/articles/hide 维护：保存正文时若前端没有显式携带 hidden，
          // 必须沿用服务端已存的状态，否则一次编辑（或 AI 翻译自动保存）就会把隐藏文章重新公开。
          const keepsStoredHidden = !Object.prototype.hasOwnProperty.call(rawItem, "hidden");
          items[idx] = keepsStoredHidden
            ? Object.assign({}, newItem, { hidden: items[idx].hidden === true })
            : newItem;
        } else {
          items.unshift(newItem);
        }

        const writes = [saveArticles(env, items)];

        // 浏览量/点赞数独立持久化，便于管理员随时修正
        if (typeof newItem.views === 'number') {
          viewsMap[newItem.id] = newItem.views;
          writes.push(saveArticleViews(env, viewsMap));
        }
        if (typeof newItem.likes === 'number') {
          likesMap[newItem.id] = newItem.likes;
          writes.push(saveArticleLikes(env, likesMap));
        }

        // 写入失败必须报错：宁可让后台看到「保存失败」，也不要假装成功而丢数据
        for (const result of await Promise.all(writes)) {
          const failed = kvWriteFailureResponse(result);
          if (failed) return failed;
        }

        return new Response(JSON.stringify({ success: true, article: newItem }), {
          headers: { "Content-Type": "application/json;charset=UTF-8" }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
      }
    }

    // 5. API: 删除文章 DELETE /api/articles
    if (path === "/api/articles" && method === "DELETE") {
      if (!await checkAuth(request, env)) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
      }
      const deleteId = url.searchParams.get("id");
      let items = await getArticles(env);
      items = items.filter(a => a.id !== deleteId);
      const deleteWriteFailed = kvWriteFailureResponse(await saveArticles(env, items));
      if (deleteWriteFailed) return deleteWriteFailed;

      // 同步清理该文章遗留的浏览量、点赞数与访客去重标记，避免 KV 残留脏数据
      if (deleteId) {
        try {
          const viewsMap = await getArticleViews(env);
          if (viewsMap[deleteId] !== undefined) {
            delete viewsMap[deleteId];
            await saveArticleViews(env, viewsMap);
          }
        } catch (e) {
          console.error("Cleanup views error:", e);
        }
        try {
          const likesMap = await getArticleLikes(env);
          if (likesMap[deleteId] !== undefined) {
            delete likesMap[deleteId];
            await saveArticleLikes(env, likesMap);
          }
        } catch (e) {
          console.error("Cleanup likes error:", e);
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json;charset=UTF-8" }
      });
    }

    // 6. API: 获取审核通过的留言列表 GET /api/comments?articleId=...
    if (path === "/api/comments" && method === "GET") {
      const allComments = await getCommentsWithAutoExpiry(env);
      const articleId = url.searchParams.get("articleId");
      let filtered = allComments.filter(c => c.status === "approved");
      if (articleId) {
        // 文章页评论：逻辑不变，返回该文章全部已审核留言
        filtered = filtered.filter(c => c.articleId === articleId);
        return new Response(JSON.stringify(filtered), {
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "public, max-age=10"
          }
        });
      }
      // 留言板：默认只展示最新 10 条；?from=YYYY-MM-DD 按周查找（固定 7 天区间，最多 20 条）
      filtered.sort((a, b) => commentTimestampMs(b) - commentTimestampMs(a));
      const fromParam = url.searchParams.get("from");
      if (fromParam && /^\d{4}-\d{2}-\d{2}$/.test(fromParam)) {
        const fromMs = new Date(fromParam + "T00:00:00+08:00").getTime();
        if (!isNaN(fromMs)) {
          const toMs = fromMs + 7 * 24 * 60 * 60 * 1000;
          const inWeek = filtered.filter(c => {
            const t = commentTimestampMs(c);
            return t >= fromMs && t < toMs;
          });
          return new Response(JSON.stringify({
            items: inWeek.slice(0, 20),
            total: inWeek.length,
            from: fromParam,
            capped: inWeek.length > 20
          }), {
            headers: {
              "Content-Type": "application/json;charset=UTF-8",
              "Access-Control-Allow-Origin": "*",
              "Cache-Control": "public, max-age=10"
            }
          });
        }
      }
      return new Response(JSON.stringify({
        items: filtered.slice(0, 10),
        total: filtered.length,
        from: null,
        capped: filtered.length > 10
      }), {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=10"
        }
      });
    }

        // 6.5 API: 留言与回复点赞 POST /api/comments/like
    if (path === "/api/comments/like" && method === "POST") {
      try {
        const body = await request.json();
        const commentId = body.commentId;
        const replyId = body.replyId;
        if (!commentId) {
          return new Response(JSON.stringify({ error: "缺少 commentId" }), { status: 400 });
        }
        let allComments = await getCommentsWithAutoExpiry(env);
        const targetComm = allComments.find(c => c.id === commentId);
        if (!targetComm) {
          return new Response(JSON.stringify({ error: "未找到对应留言" }), { status: 404 });
        }
        let updatedLikes = 0;
        if (replyId) {
          if (!targetComm.replies) targetComm.replies = [];
          const targetRep = targetComm.replies.find(r => r.id === replyId);
          if (!targetRep) {
            return new Response(JSON.stringify({ error: "未找到对应回复" }), { status: 404 });
          }
          targetRep.likes = (targetRep.likes || 0) + 1;
          updatedLikes = targetRep.likes;
        } else {
          targetComm.likes = (targetComm.likes || 0) + 1;
          updatedLikes = targetComm.likes;
        }
        const commentWriteFailed = kvWriteFailureResponse(await saveComments(env, allComments));
        if (commentWriteFailed) return commentWriteFailed;
        return new Response(JSON.stringify({ success: true, likes: updatedLikes }), {
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
      }
    }

    // 6.6 API: 读者回复留言 POST /api/comments/reply
    if (path === "/api/comments/reply" && method === "POST") {
      try {
        const body = await request.json();
        const parentId = body.parentId;
        const content = (body.content || "").trim();
        if (!parentId || !content) {
          return new Response(JSON.stringify({ error: "回复内容和母留言 ID 不能为空" }), { status: 400 });
        }
        let allComments = await getCommentsWithAutoExpiry(env);
        const parentComm = allComments.find(c => c.id === parentId);
        if (!parentComm) {
          return new Response(JSON.stringify({ error: "对应母留言不存在" }), { status: 404 });
        }
        if (!parentComm.replies) parentComm.replies = [];

        // 严格硬性上限校验：每条留言回复不得超过 5 条
        if (parentComm.replies.length >= 5) {
          return new Response(JSON.stringify({ error: "该条留言回复已达 5 条上限，无法继续添加新回复。" }), {
            status: 400,
            headers: { "Content-Type": "application/json;charset=UTF-8" }
          });
        }

        // 字数校验：140 汉字以内，或 200 英文单词以内
        const zhMatches = content.match(/[一-龥]/g) || [];
        const zhCount = zhMatches.length;
        const words = content.replace(/[一-龥]/g, ' ').match(/[a-zA-Z0-9_-]+/g) || [];
        const wordCount = words.length;

        if (zhCount > 140) {
          return new Response(JSON.stringify({ error: "中文字数超限：最多支持 140 个汉字（当前为 " + zhCount + " 字）" }), {
            status: 400,
            headers: { "Content-Type": "application/json;charset=UTF-8" }
          });
        }
        if (wordCount > 200) {
          return new Response(JSON.stringify({ error: "英文字数超限：最多支持 200 个单词（当前为 " + wordCount + " 词）" }), {
            status: 400,
            headers: { "Content-Type": "application/json;charset=UTF-8" }
          });
        }
        if (content.length > 500) {
          return new Response(JSON.stringify({ error: "回复总长度超出限制（最多 500 个字符）" }), {
            status: 400,
            headers: { "Content-Type": "application/json;charset=UTF-8" }
          });
        }

        const now = Date.now();
        const newReply = {
          id: "rep-" + now,
          createdTimestamp: now,
          author: (body.author && body.author.trim()) ? body.author.trim().slice(0, 30) : "匿名读者",
          content: content,
          createdAt: new Date(now + 8 * 3600000).toISOString().replace("T", " ").slice(0, 16),
          likes: 0
        };
        parentComm.replies.push(newReply);
        const commentWriteFailed = kvWriteFailureResponse(await saveComments(env, allComments));
        if (commentWriteFailed) return commentWriteFailed;
        return new Response(JSON.stringify({ success: true, reply: newReply }), {
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
      }
    }

    // 7. API: 读者提交留言 POST /api/comments
    if (path === "/api/comments" && method === "POST") {
      try {
        const clientIp = request.headers.get("cf-connecting-ip") || request.headers.get("x-real-ip") || "unknown";

        // IP 快速连击保护（3秒内防重复点击）
        if (env && env.BLOG_KV && clientIp !== "unknown") {
          const rateKey = "RATE_" + clientIp;
          const lastPost = await env.BLOG_KV.get(rateKey);
          if (lastPost && (Date.now() - parseInt(lastPost, 10) < 3000)) {
            return new Response(JSON.stringify({ error: "点击过于频繁，请稍候 3 秒后再试。" }), {
              status: 429,
              headers: { "Content-Type": "application/json;charset=UTF-8" }
            });
          }
          await env.BLOG_KV.put(rateKey, Date.now().toString(), { expirationTtl: 60 });
        }

        const body = await request.json();
        const content = (body.content || "").trim();
        if (!content) {
          return new Response(JSON.stringify({ error: "留言内容不能为空" }), { status: 400 });
        }

        // 校验字数限制：140 汉字以内，或 200 英文单词以内
        const zhMatches = content.match(/[一-龥]/g) || [];
        const zhCount = zhMatches.length;
        const words = content.replace(/[一-龥]/g, ' ').match(/[a-zA-Z0-9_\-]+/g) || [];
        const wordCount = words.length;

        if (zhCount > 140) {
          return new Response(JSON.stringify({ error: "中文字数超限：最多支持 140 个汉字（当前为 " + zhCount + " 字）" }), {
            status: 400,
            headers: { "Content-Type": "application/json;charset=UTF-8" }
          });
        }
        if (wordCount > 200) {
          return new Response(JSON.stringify({ error: "英文字数超限：最多支持 200 个单词（当前为 " + wordCount + " 词）" }), {
            status: 400,
            headers: { "Content-Type": "application/json;charset=UTF-8" }
          });
        }
        if (content.length > 500) {
          return new Response(JSON.stringify({ error: "留言总长度超出限制（最多 500 个字符）" }), {
            status: 400,
            headers: { "Content-Type": "application/json;charset=UTF-8" }
          });
        }

        const now = Date.now();
        const newComm = {
          id: "comm-" + now,
          createdTimestamp: now,
          articleId: body.articleId || "general",
          articleTitle: body.articleTitle || "全站公开留言板",
          author: (body.author && body.author.trim()) ? body.author.trim().slice(0, 30) : "匿名读者",
          content: content,
          createdAt: new Date(now + 8 * 3600000).toISOString().replace("T", " ").slice(0, 16),
          status: "pending" // 哪怕管理员自己的留言也必须经过审核
        };
        let allComments = await getCommentsWithAutoExpiry(env);
        allComments.unshift(newComm);
        const commentWriteFailed = kvWriteFailureResponse(await saveComments(env, allComments));
        if (commentWriteFailed) return commentWriteFailed;
        return new Response(JSON.stringify({ success: true, message: "留言已成功提交，待管理员审核通过后公开展示。" }), {
          headers: { "Content-Type": "application/json;charset=UTF-8" }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
      }
    }

    // 8. API: 管理员获取全量留言 GET /api/admin/comments
    if (path === "/api/admin/comments" && method === "GET") {
      if (!await checkAuth(request, env)) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
      }
      const allComments = await getCommentsWithAutoExpiry(env);
      return new Response(JSON.stringify(allComments), {
        headers: { "Content-Type": "application/json;charset=UTF-8" }
      });
    }

    // 9. API: 管理员审核留言状态 POST /api/admin/comments
    if (path === "/api/admin/comments" && method === "POST") {
      if (!await checkAuth(request, env)) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
      }
      try {
        const body = await request.json();
        let allComments = await getCommentsWithAutoExpiry(env);
        const target = allComments.find(c => c.id === body.id);
        if (target) {
          target.status = body.status;
          if (body.status === "approved") {
            target.autoBlocked = false;
          }
          const commentWriteFailed = kvWriteFailureResponse(await saveComments(env, allComments));
        if (commentWriteFailed) return commentWriteFailed;
          return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json;charset=UTF-8" }
          });
        }
        return new Response(JSON.stringify({ error: "Comment not found" }), { status: 404 });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
      }
    }

    // 10. API: 管理员删除留言 DELETE /api/admin/comments
    if (path === "/api/admin/comments" && method === "DELETE") {
      if (!await checkAuth(request, env)) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
      }
      const deleteId = url.searchParams.get("id");
      let allComments = await getCommentsWithAutoExpiry(env);
      allComments = allComments.filter(c => c.id !== deleteId);
      const commentDeleteFailed = kvWriteFailureResponse(await saveComments(env, allComments));
      if (commentDeleteFailed) return commentDeleteFailed;
      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json;charset=UTF-8" }
      });
    }

    // 10.5. API: 上传图片 POST /api/upload
    if (path === "/api/upload" && method === "POST") {
      if (!await checkAuth(request, env)) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
      }
      try {
        const body = await request.json();
        const base64Data = body.image;
        if (!base64Data) {
          return new Response(JSON.stringify({ error: "Image data is required" }), { status: 400 });
        }
        const imgId = "img_" + Date.now() + "_" + Math.random().toString(36).substring(2, 8);
        const imageWriteFailed = kvWriteFailureResponse(await saveUploadedImage(env, imgId, base64Data));
        if (imageWriteFailed) return imageWriteFailed;
        return new Response(JSON.stringify({ success: true, id: imgId, url: "/api/images/" + imgId }), {
          headers: { "Content-Type": "application/json;charset=UTF-8" }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
      }
    }

    // 10.6. API: 获取上传的图片 GET /api/images/:id
    if (path.startsWith("/api/images/") && method === "GET") {
      const imgId = path.replace("/api/images/", "");
      const base64Data = await getUploadedImage(env, imgId);
      if (!base64Data) {
        return new Response("Image not found", { status: 404 });
      }
      let mimeType = "image/jpeg";
      let cleanB64 = base64Data;
      if (base64Data.startsWith("data:")) {
        const parts = base64Data.split(",");
        const match = parts[0].match(/:(.*?);/);
        if (match) mimeType = match[1];
        cleanB64 = parts[1] || "";
      }
      const binaryString = atob(cleanB64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return new Response(bytes.buffer, {
        headers: {
          "Content-Type": mimeType,
          "Cache-Control": "public, max-age=31536000, immutable"
        }
      });
    }

    // 10.7. API: 获取个人简历配置 GET /api/profile
    if (path === "/api/profile" && method === "GET") {
      const prof = await getProfile(env);
      return new Response(JSON.stringify(prof), {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=10"
        }
      });
    }

    // 10.8. API: 保存个人简历配置 POST /api/profile
    if (path === "/api/profile" && method === "POST") {
      if (!await checkAuth(request, env)) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
      }
      try {
        const body = await request.json();
        const profileWriteFailed = kvWriteFailureResponse(await saveProfile(env, body));
        if (profileWriteFailed) return profileWriteFailed;
        return new Response(JSON.stringify({ success: true }), {
          headers: { "Content-Type": "application/json;charset=UTF-8" }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
      }
    }

    // 10.9. API: 读取站点设置（文章排序方式）GET /api/settings
    if (path === "/api/settings" && method === "GET") {
      if (!await checkAuth(request, env)) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
      }
      const settings = await getBlogSettings(env);
      return new Response(JSON.stringify(settings), {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          "Cache-Control": "no-store, no-cache, must-revalidate"
        }
      });
    }

    // 10.95. API: 保存站点设置（文章排序方式）POST /api/settings
    if (path === "/api/settings" && method === "POST") {
      if (!await checkAuth(request, env)) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
      }
      try {
        const body = await request.json();
        const current = await getBlogSettings(env);
        const next = Object.assign({}, current);
        if (body && body.articleSort) {
          const incoming = body.articleSort;
          next.articleSort = normalizeSortConfig({
            articleSort: {
              field: ARTICLE_SORT_FIELDS.includes(incoming.field) ? incoming.field : current.articleSort.field,
              order: incoming.order === "asc" ? "asc" : (incoming.order === "desc" ? "desc" : current.articleSort.order)
            }
          });
        }
        const settingsWriteFailed = kvWriteFailureResponse(await saveBlogSettings(env, next));
        if (settingsWriteFailed) return settingsWriteFailed;
        return new Response(JSON.stringify({ success: true, settings: next }), {
          headers: { "Content-Type": "application/json;charset=UTF-8" }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
      }
    }

    // 11. 独立文章列表页面 GET /articles 或 /blog
    if (path === "/articles" || path === "/blog") {
      const [allItems, prof] = await Promise.all([
        getArticlesWithMetrics(env),
        getProfile(env)
      ]);
      // 公开列表页不展示被隐藏的文章（管理员在 /admin 可见全部并随时切换）
      const items = allItems.filter(a => !a.hidden);
      return new Response(renderArticlesPageHtml(JSON.stringify(items), prof.rewardQrCode), {
        headers: {
          "Content-Type": "text/html;charset=UTF-8",
          "Cache-Control": "public, max-age=15"
        }
      });
    }

    // 12. 独立工作经历页面 GET /experience
    if (path === "/experience" || path === "/work-experience") {
      const prof = await getProfile(env);
      return new Response(renderExperienceHtml(prof), {
        headers: {
          "Content-Type": "text/html;charset=UTF-8",
          "Cache-Control": "public, max-age=120"
        }
      });
    }

    // 12.5. 独立留言板页面 GET /guestbook 或 /messages
    if (path === "/guestbook" || path === "/messages") {
      const gbAll = await getCommentsWithAutoExpiry(env);
      const gbApproved = gbAll.filter(c => c.status === "approved");
      gbApproved.sort((a, b) => commentTimestampMs(b) - commentTimestampMs(a));
      const gbInitial = {
        items: gbApproved.slice(0, 10),
        total: gbApproved.length,
        from: null,
        capped: gbApproved.length > 10
      };
      const gbInitialJson = JSON.stringify(gbInitial)
        .replace(/</g, "\\u003c")
        .replace(/\u2028/g, "\\u2028")
        .replace(/\u2029/g, "\\u2029");
      return new Response(renderGuestbookHtml(gbInitialJson), {
        headers: {
          "Content-Type": "text/html;charset=UTF-8",
          "Cache-Control": "public, max-age=60"
        }
      });
    }

    // 13. 管理后台 GET /admin (未登录显示登录页面，已登录显示 CMS)
    if (path === "/admin") {
      if (url.searchParams.get("logout") === "true") {
        // 无状态会话：登出只需让浏览器丢掉 cookie，没有服务端记录要删
        const headers = new Headers({
          "Content-Type": "text/html;charset=UTF-8",
          "Cache-Control": "no-store, no-cache, must-revalidate"
        });
        headers.append("Set-Cookie", buildClearCookie(SESSION_COOKIE, true));
        headers.append("Set-Cookie", buildClearCookie(SESSION_FLAG_COOKIE, false));
        return new Response(renderAdminLoginHtml(), { headers });
      }
      const isAuthed = await checkAuth(request, env);
      if (!isAuthed) {
        return new Response(renderAdminLoginHtml(), {
          headers: { 
            "Content-Type": "text/html;charset=UTF-8",
            "Cache-Control": "no-store, no-cache, must-revalidate"
          }
        });
      }
      // 后台首屏曾经是 4 次串行 KV 读 + 1 次会话版本读，加载体感明显发涩；现在并发发出
      const [items, commentsData, prof, settings] = await Promise.all([
        getArticlesWithMetrics(env),
        getCommentsWithAutoExpiry(env),
        getProfile(env),
        getBlogSettings(env)
      ]);
      const hasKv = Boolean(env && env.BLOG_KV);
      // 不再下发任何 cookie：令牌本来就只存在于 HttpOnly cookie 里，页面无需知道它
      return new Response(renderAdminCmsHtml(JSON.stringify(items), JSON.stringify(commentsData), JSON.stringify(prof), hasKv, JSON.stringify(settings)), {
        headers: { 
          "Content-Type": "text/html;charset=UTF-8",
          "Cache-Control": "no-store, no-cache, must-revalidate"
        }
      });
    }

    // 14. 公开主页 GET / (不显示文章，仅关于我与经历)
    const prof = await getProfile(env);
    return new Response(renderPublicHtml(prof), {
      headers: {
        "Content-Type": "text/html;charset=UTF-8",
        "Cache-Control": "public, max-age=120"
      }
    });
  }
};
