/* toc.js — 文档页右侧浮动目录。
   article.doc 内 h2 ≥3 才启用；标题按页面语言取 .en/.zh，两者皆空取 textContent。
   纯渐进增强：任何一步失败都静默降级，不影响页面其余功能。 */
(function () {
  'use strict';

  function onReady(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  onReady(function () {
    try {
      var article = document.querySelector('article.doc');
      if (!article) return;
      var h2s = article.querySelectorAll('h2');
      if (h2s.length < 3) return;

      /* 语言：与全站 .en/.zh 机制一致，看 documentElement */
      function isZh() {
        return document.documentElement.classList.contains('lang-zh');
      }
      function titleOf(h2) {
        var en = h2.querySelector('.en');
        var zh = h2.querySelector('.zh');
        var t = isZh()
          ? ((zh && zh.textContent) || (en && en.textContent) || '')
          : ((en && en.textContent) || (zh && zh.textContent) || '');
        if (!t || !t.trim()) t = h2.textContent || '';
        return t.trim();
      }

      /* 组装 nav，注入 body */
      var nav = document.createElement('nav');
      nav.className = 'toc-float';
      nav.setAttribute('aria-label', '本页目录');
      var label = document.createElement('p');
      label.className = 'toc-float__title';
      label.textContent = '本页目录 / On this page';
      var ul = document.createElement('ul');
      nav.appendChild(label);
      nav.appendChild(ul);

      var rows = [];
      for (var i = 0; i < h2s.length; i++) {
        var h2 = h2s[i];
        if (!h2.id) h2.id = 'toc-h2-' + (i + 1);
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = '#' + h2.id;
        a.textContent = titleOf(h2);
        a.addEventListener('click', makeClickHandler(h2));
        li.appendChild(a);
        ul.appendChild(li);
        rows.push({ h2: h2, li: li });
      }
      /* 放进文档网格做第三列（sticky），fixed 定位在 1440–1600px 会压正文 */
      var host = document.querySelector('.docgrid');
      if (host) { host.classList.add('has-toc'); host.appendChild(nav); }
      else document.body.appendChild(nav);

      /* 点击：smooth 滚动（prefers-reduced-motion 时 auto） */
      function makeClickHandler(h2) {
        return function (ev) {
          ev.preventDefault();
          var reduced = false;
          try {
            reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          } catch (e) { /* 视为未开启 */ }
          if (typeof h2.scrollIntoView === 'function') {
            h2.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
          } else {
            location.hash = '#' + h2.id;
          }
        };
      }

      /* 滚动高亮：标题进入视口 40%–45% 波段即为当前项 */
      function setCurrent(h2) {
        for (var k = 0; k < rows.length; k++) {
          rows[k].li.classList.toggle('is-active', rows[k].h2 === h2);
        }
      }
      if (typeof window.IntersectionObserver === 'function') {
        setCurrent(rows[0].h2);
        var io = new IntersectionObserver(function (entries) {
          for (var j = 0; j < entries.length; j++) {
            if (entries[j].isIntersecting) setCurrent(entries[j].target);
          }
        }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
        for (var m = 0; m < rows.length; m++) io.observe(rows[m].h2);
        /* 兜底：滚到页底时标最后一项（末节过短时够不到高亮波段） */
        window.addEventListener('scroll', function () {
          try {
            var doc = document.documentElement;
            if (window.innerHeight + window.scrollY >= doc.scrollHeight - 4) {
              setCurrent(rows[rows.length - 1].h2);
            }
          } catch (e) { /* 静默降级 */ }
        }, { passive: true });
      }

      /* 跟随页头语言切换刷新标题文本 */
      function refreshTitles() {
        for (var k = 0; k < rows.length; k++) {
          var a = rows[k].li.querySelector('a');
          if (a) a.textContent = titleOf(rows[k].h2);
        }
      }
      var ben = document.getElementById('btn-en');
      var bzh = document.getElementById('btn-zh');
      if (ben) ben.addEventListener('click', refreshTitles);
      if (bzh) bzh.addEventListener('click', refreshTitles);
    } catch (e) { /* 静默降级 */ }
  });
})();
