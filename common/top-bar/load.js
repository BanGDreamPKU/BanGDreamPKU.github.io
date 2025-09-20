const ph = document.getElementById('top-bar-placeholder');
if (!ph) {
  console.error('[load-navbar] 找不到 #navbar-placeholder 节点，导航栏无法加载');
}

fetch('/common/top-bar/top-bar.html')
  .then(r => r.text())
  .then(html => {
    ph.innerHTML = html;
    // 把当前页面指定的文字填进去
    const txt = ph.getAttribute('chinese_pathname') || '';
    const slot = document.querySelector('#chinese_pathname');
    if (slot) slot.textContent = txt;
  });