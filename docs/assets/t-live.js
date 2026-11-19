/* t-live.js — 「活终端」换装逻辑。
   三件事：圆点 switcher、data-auto 自动演示、画廊色卡试穿。
   纯渐进增强：任何一步失败都静默降级，不影响页面其余功能。 */
(function () {
  'use strict';

  /* 主题名 → 圆点/标题短显示名（与 HTML data-display 一致） */
  var DISPLAY = {
    'catppuccin-mocha': 'Catppuccin Mocha',
    'tokyo-night': 'Tokyo Night',
    'gruvbox-dark': 'Gruvbox Dark',
    'ember': 'Ember 暖烬',
    'voltage': 'Voltage 霓虹电压',
    'parchment': 'Parchment 暖纸',
    'ledger': 'Ledger 账簿'
  };

  /* 自动演示序列：初始即 ember，进视口后 voltage → parchment → ember，然后停 */
  var DEMO_SEQ = ['voltage', 'parchment', 'ember'];
  var DEMO_INTERVAL = 1400;

  function applyTlive(live, name, display) {
    if (!live) return;
    live.setAttribute('data-tlive', name);
    var title = live.querySelector('.tl-title');
    if (title) title.textContent = 'zsh — ' + display;
  }

  function markActive(sw, name) {
    if (!sw) return;
    var dots = sw.querySelectorAll('.t-dot');
    for (var i = 0; i < dots.length; i++) {
      dots[i].classList.toggle('is-active', dots[i].getAttribute('data-theme') === name);
    }
  }

  /* 约定：switcher 紧跟 .t-live 之后；不合约定就退回页面第一个 .t-live */
  function liveOf(sw) {
    var el = sw ? sw.previousElementSibling : null;
    if (el && el.classList && el.classList.contains('t-live')) return el;
    return document.querySelector('.t-live');
  }

  function switchTo(sw, name) {
    if (!DISPLAY[name]) return;
    applyTlive(liveOf(sw), name, DISPLAY[name]);
    markActive(sw, name);
  }

  function stopAuto(sw) {
    if (sw && typeof sw.__tlStop === 'function') {
      sw.__tlStop();
      sw.__tlStop = null;
    }
  }

  /* 1) 圆点 switcher —— document 级委托，支持页面上任意个 switcher */
  document.addEventListener('click', function (ev) {
    try {
      var target = ev.target;
      if (!target || !target.closest) return;
      var dot = target.closest('.t-dot');
      if (!dot) return;
      var sw = dot.closest('[data-tlive-switcher]');
      if (!sw) return;
      stopAuto(sw); /* 用户点过就取消自动演示 */
      switchTo(sw, dot.getAttribute('data-theme'));
    } catch (e) { /* 静默降级 */ }
  });

  /* 2) 自动演示：带 data-auto 的 switcher 首次进视口后按 DEMO_SEQ 播一遍 */
  function runDemo(sw) {
    var i = 0;
    var timer = null;
    function tick() {
      if (i >= DEMO_SEQ.length) return;
      switchTo(sw, DEMO_SEQ[i]);
      i += 1;
      timer = window.setTimeout(tick, DEMO_INTERVAL);
    }
    tick();
    return function stop() {
      if (timer) window.clearTimeout(timer);
      timer = null;
    };
  }

  function initAuto() {
    try {
      var sws = document.querySelectorAll('[data-tlive-switcher][data-auto]');
      if (!sws.length) return;
      var reduced = false;
      try {
        reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      } catch (e) { /* matchMedia 不可用视为未开启 */ }
      if (reduced || typeof window.IntersectionObserver !== 'function') return;
      var io = new IntersectionObserver(function (entries) {
        for (var i = 0; i < entries.length; i++) {
          var sw = entries[i].target;
          if (entries[i].isIntersecting && !sw.__tlStarted) {
            sw.__tlStarted = true;
            io.unobserve(sw);
            sw.__tlStop = runDemo(sw);
          }
        }
      }, { threshold: 0.35 });
      for (var j = 0; j < sws.length; j++) io.observe(sws[j]);
    } catch (e) { /* 静默降级 */ }
  }

  /* 3) 画廊试穿：点 article.tcard（id 即主题名）→ 页面 .t-live 实时换装 */
  document.addEventListener('click', function (ev) {
    try {
      var target = ev.target;
      if (!target || !target.closest) return;
      var card = target.closest('article.tcard[id]');
      if (!card) return;
      var name = card.id;
      if (!DISPLAY[name]) return;
      applyTlive(document.querySelector('.t-live'), name, DISPLAY[name]);
      card.classList.add('is-trying');
      window.setTimeout(function () { card.classList.remove('is-trying'); }, 1000);
    } catch (e) { /* 静默降级 */ }
  });

  initAuto();
})();
