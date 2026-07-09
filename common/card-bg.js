/* 随机 BanG Dream! 5 星卡面作页面背景（主页除外）。
   卡面来自 bestdori，固定全屏铺底，上压纸色薄纱保证正文可读。 */
(function () {
    var CARDS = [
        'res001062', 'res001092', 'res002069', 'res003071', 'res004080', 'res005087',
        'res006086', 'res007073', 'res008070', 'res009069', 'res010069', 'res011075',
        'res012059', 'res012088', 'res013085', 'res014084', 'res015083', 'res016082',
        'res017060', 'res017085', 'res018079', 'res019078', 'res020082', 'res021081',
        'res022078', 'res023078', 'res024073', 'res025074', 'res026036', 'res026054',
        'res028027', 'res029023', 'res029045', 'res031032', 'res032029', 'res033031',
        'res034033', 'res035037', 'res036011', 'res037016', 'res039011'
    ];
    var pick = CARDS[Math.floor(Math.random() * CARDS.length)];
    var url = 'https://bestdori.com/assets/jp/characters/resourceset/' + pick + '_rip/card_after_training.png';

    var bg = document.createElement('div');
    bg.className = 'card-bg';
    bg.setAttribute('aria-hidden', 'true');

    var img = new Image();
    img.onload = function () {
        bg.style.backgroundImage = 'url("' + url + '")';
        bg.classList.add('card-bg--ready');
    };
    img.src = url;

    document.addEventListener('DOMContentLoaded', function () {
        document.body.insertBefore(bg, document.body.firstChild);
    });
})();
