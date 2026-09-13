// 小工具：HTML 转义、经历文本格式化
function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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
export { escapeHtml, formatExpText };