// 小工具：HTML 转义、经历文本格式化、内联 JSON 安全序列化
function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * 把任意值序列化成可以安全嵌进内联 <script> 的 JS 字面量。
 *
 * 为什么不能直接用 JSON.stringify：
 *   JSON.stringify 不转义 `<`，所以字符串里一旦出现 `</script>`，浏览器会在那里
 *   提前闭合脚本块，后面的内容被当成 HTML 解析——留言、文章正文、简历字段都是
 *   外部可控输入，等于给每个注入点开了一扇 XSS 的门。
 * 这里把 `<` `>` `&` 与 U+2028/U+2029 一并转成 \\uXXXX（在 JS 字符串里语义不变，
 *   JSON.parse 也照样能读），脚本块就不可能被提前闭合。
 */
function safeJsonForScript(value) {
  const json = JSON.stringify(value);
  if (json === undefined) return 'null';
  return json
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

function formatExpText(text) {
  if (!text) return '';
  const lines = text.split('\n');
  let res = '';
  let inList = false;
  for (let l of lines) {
    let raw = l.trim();
    if (!raw) continue;
    let formatted = raw.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    if (raw.startsWith('- ') || raw.startsWith('* ')) {
      if (!inList) { res += '<ul>'; inList = true; }
      res += '<li>' + formatted.substring(2) + '</li>';
    } else {
      if (inList) { res += '</ul>'; inList = false; }
      res += '<p>' + formatted + '</p>';
    }
  }
  if (inList) res += '</ul>';
  return res;
}
export { escapeHtml, formatExpText, safeJsonForScript };