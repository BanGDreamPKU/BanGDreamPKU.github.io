const ph = document.getElementById('top-bar-placeholder');
if (!ph) {
  console.error('[load-navbar] 找不到 #navbar-placeholder 节点，导航栏无法加载');
}

// 路径文字 -> URL 的映射，用于把左上角路径渲染成可点击的面包屑。
// 没有出现在表里的层级（通常是当前页名）会渲染为不可点击的纯文字。
const PATH_URL_MAP = {
  '生日提醒': '/birthday/',
  '力儿八概论': '/garupaintro/',
  'TapTune': '/taptune/',
  // 「力儿八概论」的子页面
  '写在前面': '/garupaintro/introduction/',
  '关于抽卡': '/garupaintro/gacha/',
  '关于养成': '/garupaintro/training/',
  '养成资源': '/garupaintro/resource/',
  '打歌入门': '/garupaintro/playing/',
  '关于冲榜': '/garupaintro/ranking/',
};

function renderBreadcrumb(raw) {
  // 把形如 "/力儿八概论/关于抽卡" 的字符串拆成若干段，
  // 每段尝试在 PATH_URL_MAP 里找到对应链接，找不到则为纯文字。
  const segments = String(raw || '').split('/').map(s => s.trim()).filter(Boolean);
  if (segments.length === 0) return '';

  return segments.map((seg, idx) => {
    const isLast = idx === segments.length - 1;
    const url = PATH_URL_MAP[seg];
    // 最后一段是当前页，始终不可点；
    // 其它段如果映射到了 URL 才可点。
    if (!isLast && url) {
      return `<span class="crumb-sep">/</span><a class="crumb-link" href="${url}">${seg}</a>`;
    }
    return `<span class="crumb-sep">/</span><span class="crumb-current">${seg}</span>`;
  }).join('');
}

fetch('/common/top-bar/top-bar.html')
  .then(r => r.text())
  .then(html => {
    ph.innerHTML = html;
    // 把当前页面指定的文字填进去（渲染成面包屑）
    const txt = ph.getAttribute('chinese_pathname') || '';
    const slot = document.querySelector('#chinese_pathname');
    if (slot) slot.innerHTML = renderBreadcrumb(txt);
  });
