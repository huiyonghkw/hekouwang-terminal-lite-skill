/* 隐私友好埋点：填了 endpoint 才启用，默认静默。
   payload 为通用 JSON {event, props, path, ts}；接入 umami 等平台时按其 API 调整。 */
var HKW_ANALYTICS_ENDPOINT = '';

function hkwTrack(event, props) {
  try {
    if (!HKW_ANALYTICS_ENDPOINT) return;
    var payload = JSON.stringify({
      event: event,
      props: props || {},
      path: location.pathname,
      ts: Date.now()
    });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(HKW_ANALYTICS_ENDPOINT, new Blob([payload], { type: 'application/json' }));
    } else if (typeof fetch === 'function') {
      fetch(HKW_ANALYTICS_ENDPOINT, { method: 'POST', body: payload, keepalive: true }).catch(function () {});
    }
  } catch (e) {}
}

/* 通用焦点陷阱：Tab/Shift+Tab 锁在 container 内循环；unmount 时焦点还原到触发元素 */
function hkwTrapFocus(container) {
  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), ' +
    'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  var lastTrigger = null;

  function onKey(e) {
    if (e.key !== 'Tab') return;
    var items = Array.prototype.slice.call(container.querySelectorAll(FOCUSABLE)).filter(function (el) {
      return el.getClientRects().length > 0;
    });
    if (!items.length) return;
    var first = items[0];
    var last = items[items.length - 1];
    var active = document.activeElement;
    if (e.shiftKey) {
      if (active === first || !container.contains(active)) {
        e.preventDefault();
        last.focus();
      }
    } else if (active === last || !container.contains(active)) {
      e.preventDefault();
      first.focus();
    }
  }

  return {
    mount: function () {
      lastTrigger = document.activeElement;
      document.addEventListener('keydown', onKey, true);
    },
    unmount: function () {
      document.removeEventListener('keydown', onKey, true);
      if (lastTrigger && typeof lastTrigger.focus === 'function') {
        try { lastTrigger.focus(); } catch (e) {}
      }
      lastTrigger = null;
    }
  };
}

/* hekouwang-terminal-skill site 3.0 — lang / progress / motion / UE */
(function () {
  var KEY = 'hkw-lang';

  function readQuery() {
    try {
      var q = new URLSearchParams(location.search).get('lang');
      return q === 'zh' || q === 'en' ? q : null;
    } catch (e) {
      return null;
    }
  }

  function readStored() {
    try {
      var s = localStorage.getItem(KEY);
      return s === 'zh' || s === 'en' ? s : null;
    } catch (e) {
      return null;
    }
  }

  function detect() {
    var q = readQuery();
    if (q) return q;
    var s = readStored();
    if (s) return s;
    return /^zh/i.test(navigator.language || '') ? 'zh' : 'en';
  }

  function patchLinks(lang) {
    document.querySelectorAll('a[href]').forEach(function (a) {
      var raw = a.getAttribute('href');
      if (!raw || raw.charAt(0) === '#' || /^(https?:|mailto:|javascript:)/i.test(raw)) return;
      if (raw.slice(0, 2) === '//') return;
      try {
        var u = new URL(raw, location.href);
        if (u.origin !== location.origin) return;
        var path = raw.split('#')[0].split('?')[0];
        var hash = u.hash || '';
        a.setAttribute('href', path + '?lang=' + lang + hash);
      } catch (e) {}
    });
  }

  function syncUrl(lang) {
    try {
      var u = new URL(location.href);
      if (u.searchParams.get('lang') === lang) return;
      u.searchParams.set('lang', lang);
      history.replaceState(null, '', u.pathname + u.search + u.hash);
    } catch (e) {}
  }

  function set(lang, remember) {
    var zh = lang === 'zh';
    document.documentElement.classList.toggle('lang-zh', zh);
    document.documentElement.lang = zh ? 'zh-CN' : 'en';
    var btnEn = document.getElementById('btn-en');
    var btnZh = document.getElementById('btn-zh');
    if (btnEn) btnEn.setAttribute('aria-pressed', String(!zh));
    if (btnZh) btnZh.setAttribute('aria-pressed', String(zh));
    if (remember) {
      try { localStorage.setItem(KEY, lang); } catch (e) {}
      syncUrl(lang);
    }
    patchLinks(lang);
  }

  var lang = detect();
  set(lang, false);
  try {
    if (readQuery()) localStorage.setItem(KEY, lang);
  } catch (e) {}
  syncUrl(lang);
  patchLinks(lang);

  var btnEn = document.getElementById('btn-en');
  var btnZh = document.getElementById('btn-zh');
  if (btnEn) btnEn.addEventListener('click', function () { set('en', true); });
  if (btnZh) btnZh.addEventListener('click', function () { set('zh', true); });
})();

(function () {
  var bar = document.getElementById('prog');
  if (!bar) return;
  function tick() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', tick, { passive: true });
  window.addEventListener('resize', tick);
  tick();
})();

(function () {
  var nav = document.getElementById('site-nav');
  if (!nav) return;
  /* 「透明头部」页（index / pricing）：初始无边框，滚动后加玻璃底 + 细边框，回顶撤掉。
     文档页头部本就带 border-ash-100/10 等类——不能参与 toggle(false)，
     否则停在顶部时这些类被拆掉，border-b 落到 preflight 默认亮灰（白线 bug）。 */
  var plainNav = !nav.classList.contains('border-ash-100/10');
  function stuck() {
    var on = window.scrollY > 12;
    nav.classList.toggle('is-stuck', on);
    if (on) {
      nav.classList.add('border-ash-100/10');
      nav.classList.add('bg-ink-950/80');
      nav.classList.add('backdrop-blur-xl');
    } else if (plainNav) {
      nav.classList.remove('border-ash-100/10');
      nav.classList.remove('bg-ink-950/80');
      nav.classList.remove('backdrop-blur-xl');
    }
  }
  window.addEventListener('scroll', stuck, { passive: true });
  stuck();
})();

(function () {
  var btn = document.getElementById('nav-toggle');
  var panel = document.getElementById('mobile-nav');
  if (!btn || !panel) return;
  btn.addEventListener('click', function () {
    var open = panel.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });
  panel.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      panel.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    });
  });
})();

(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Hero entrance */
  requestAnimationFrame(function () {
    var copy = document.querySelector('.hero-copy');
    var media = document.querySelector('.hero-media');
    if (copy) copy.classList.add('is-ready');
    if (media) media.classList.add('is-ready');
  });

  /* Pointer glow */
  var glow = document.getElementById('pointer-glow');
  if (glow && !reduced && window.matchMedia('(pointer:fine)').matches) {
    var gx = window.innerWidth * 0.7;
    var gy = window.innerHeight * 0.25;
    var tx = gx;
    var ty = gy;
    var raf = 0;
    function paint() {
      gx += (tx - gx) * 0.12;
      gy += (ty - gy) * 0.12;
      glow.style.left = gx + 'px';
      glow.style.top = gy + 'px';
      raf = requestAnimationFrame(paint);
    }
    document.addEventListener('pointermove', function (e) {
      tx = e.clientX;
      ty = e.clientY;
      glow.classList.add('on');
    }, { passive: true });
    document.addEventListener('pointerleave', function () {
      glow.classList.remove('on');
    });
    raf = requestAnimationFrame(paint);
  }

  /* Magnetic buttons */
  if (!reduced && window.matchMedia('(pointer:fine)').matches) {
    document.querySelectorAll('.btn-mag').forEach(function (btn) {
      var strength = 18;
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        var x = e.clientX - (r.left + r.width / 2);
        var y = e.clientY - (r.top + r.height / 2);
        btn.style.transform = 'translate(' + (x / r.width) * strength + 'px,' + (y / r.height) * strength + 'px)';
      });
      btn.addEventListener('pointerleave', function () {
        btn.style.transform = '';
      });
    });
  }

  /* Value cell spotlight */
  document.querySelectorAll('.value-cell').forEach(function (cell) {
    cell.addEventListener('pointermove', function (e) {
      var r = cell.getBoundingClientRect();
      cell.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      cell.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* Reveal + stagger children */
  var els = document.querySelectorAll('[data-reveal]');
  function revealChildren(root) {
    var kids = root.querySelectorAll('[data-reveal-child]');
    kids.forEach(function (kid, i) {
      setTimeout(function () { kid.classList.add('in'); }, reduced ? 0 : 70 * i);
    });
  }

  if (!els.length) return;

  if (!('IntersectionObserver' in window) || reduced) {
    els.forEach(function (e) {
      e.classList.add('in');
      revealChildren(e);
    });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.classList.add('in');
      revealChildren(en.target);
      io.unobserve(en.target);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

  els.forEach(function (e) { io.observe(e); });

  setTimeout(function () {
    els.forEach(function (e) {
      if (!e.classList.contains('in')) {
        e.classList.add('in');
        revealChildren(e);
      }
    });
  }, 2200);
})();

/* Scene reel: play only while in view; respect reduced motion */
(function () {
  var vids = document.querySelectorAll('.scene-reel__video');
  if (!vids.length) return;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  vids.forEach(function (v) {
    if (reduced) {
      v.removeAttribute('autoplay');
      try { v.pause(); } catch (e) {}
      return;
    }
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var p = v.play();
          if (p && typeof p.catch === 'function') p.catch(function () {});
        } else {
          try { v.pause(); } catch (e) {}
        }
      });
    }, { threshold: 0.35 });
    io.observe(v);
  });
})();

/* Lightbox: click any content image to zoom */
(function () {
  function skip(img) {
    if (!img || !img.getAttribute('src')) return true;
    if (img.closest('.brand-mark')) return true;
    if (img.hasAttribute('data-no-zoom')) return true;
    if (img.classList.contains('no-zoom')) return true;
    var src = (img.getAttribute('src') || '').toLowerCase();
    if (/icon-skillhub|favicon|apple-touch/.test(src)) return true;
    var w = parseInt(img.getAttribute('width'), 10);
    var h = parseInt(img.getAttribute('height'), 10);
    if ((w && w <= 48) || (h && h <= 48)) return true;
    return false;
  }

  var imgs = Array.prototype.slice.call(document.querySelectorAll('img')).filter(function (img) {
    return !skip(img);
  });
  if (!imgs.length) return;

  var root = document.createElement('div');
  root.id = 'lightbox';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-label', 'Image preview');
  root.innerHTML =
    '<button type="button" class="lb-close" aria-label="Close">×</button>' +
    '<span class="lb-count" aria-hidden="true"></span>' +
    '<button type="button" class="lb-prev" aria-label="Previous">‹</button>' +
    '<button type="button" class="lb-next" aria-label="Next">›</button>' +
    '<div class="lb-stage">' +
      '<img class="lb-img" alt="">' +
      '<p class="lb-cap"></p>' +
    '</div>';
  document.body.appendChild(root);

  var stageImg = root.querySelector('.lb-img');
  var cap = root.querySelector('.lb-cap');
  var countEl = root.querySelector('.lb-count');
  var btnClose = root.querySelector('.lb-close');
  var btnPrev = root.querySelector('.lb-prev');
  var btnNext = root.querySelector('.lb-next');
  var index = 0;
  var open = false;
  var trap = hkwTrapFocus(root);

  imgs.forEach(function (img) {
    img.classList.add('zoomable');
    img.setAttribute('tabindex', '0');
    img.setAttribute('role', 'button');
    var label = img.getAttribute('alt') || 'Zoom image';
    img.setAttribute('aria-label', label);
  });

  function srcOf(img) {
    return img.currentSrc || img.getAttribute('src') || '';
  }

  function show(i) {
    if (!imgs.length) return;
    index = (i + imgs.length) % imgs.length;
    var img = imgs[index];
    stageImg.src = srcOf(img);
    stageImg.alt = img.getAttribute('alt') || '';
    var text = img.getAttribute('alt') || '';
    cap.textContent = text;
    cap.style.display = text ? '' : 'none';
    countEl.textContent = (index + 1) + ' / ' + imgs.length;
    var multi = imgs.length > 1;
    btnPrev.style.display = multi ? '' : 'none';
    btnNext.style.display = multi ? '' : 'none';
  }

  function openAt(i) {
    show(i);
    root.classList.add('open');
    document.body.classList.add('lb-lock');
    open = true;
    trap.mount();
    btnClose.focus();
  }

  function close() {
    if (!open) return;
    open = false;
    root.classList.remove('open');
    document.body.classList.remove('lb-lock');
    stageImg.removeAttribute('src');
    trap.unmount();
  }

  imgs.forEach(function (img, i) {
    img.addEventListener('click', function (e) {
      e.preventDefault();
      openAt(i);
    });
    img.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openAt(i);
      }
    });
  });

  btnClose.addEventListener('click', function (e) {
    e.stopPropagation();
    close();
  });
  btnPrev.addEventListener('click', function (e) {
    e.stopPropagation();
    show(index - 1);
  });
  btnNext.addEventListener('click', function (e) {
    e.stopPropagation();
    show(index + 1);
  });
  stageImg.addEventListener('click', function (e) {
    e.stopPropagation();
    close();
  });
  root.addEventListener('click', function (e) {
    if (e.target === root) close();
  });

  document.addEventListener('keydown', function (e) {
    if (!open) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(index - 1);
    else if (e.key === 'ArrowRight') show(index + 1);
  });

  var touchX = null;
  root.addEventListener('touchstart', function (e) {
    if (e.changedTouches && e.changedTouches[0]) touchX = e.changedTouches[0].clientX;
  }, { passive: true });
  root.addEventListener('touchend', function (e) {
    if (touchX == null || !e.changedTouches || !e.changedTouches[0]) return;
    var dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) < 48) return;
    if (dx > 0) show(index - 1);
    else show(index + 1);
  }, { passive: true });
})();

/* Copy button on terminal blocks (pre.sc): strips leading "$ " prompts */
(function () {
  /* file:// 等环境下 clipboard 可能不可用 —— 静默降级为不注入按钮 */
  if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') return;

  var zh = document.documentElement.classList.contains('lang-zh');
  var LABEL = zh ? '复制' : 'Copy';
  var DONE = zh ? '已复制 ✓' : 'Copied ✓';

  function cleanText(pre) {
    /* 逐行去掉行首的 "$ " 提示符，仅去行首 */
    return pre.innerText.split('\n').map(function (line) {
      return line.replace(/^\$ /, '');
    }).join('\n');
  }

  document.querySelectorAll('pre.sc').forEach(function (pre) {
    /* 包一层 .sc-wrap 定位按钮：pre 自身 overflow-x:auto，按钮挂 pre 里
       会随横向滚动跑出视野。包装不影响任何现有后代/后代链选择器。 */
    var wrap = document.createElement('div');
    wrap.className = 'sc-wrap';
    pre.parentNode.insertBefore(wrap, pre);
    wrap.appendChild(pre);

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'copy-btn';
    btn.textContent = LABEL;
    btn.setAttribute('aria-label', zh ? '复制命令' : 'Copy command');
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      navigator.clipboard.writeText(cleanText(pre)).then(function () {
        hkwTrack('copy_command', { cmd: (cleanText(pre).trim().split(/\s+/)[0] || '').slice(0, 64) });
        btn.textContent = DONE;
        btn.classList.add('done');
        setTimeout(function () {
          btn.textContent = LABEL;
          btn.classList.remove('done');
        }, 1500);
      }).catch(function () {
        /* 复制失败：静默降级为不显示按钮 */
        btn.remove();
      });
    });
    wrap.appendChild(btn);
  });
})();

/* Buy CTA tracking: document-level delegation so pricing.html links count site-wide */
document.addEventListener('click', function (e) {
  try {
    var t = e.target;
    var a = t && t.closest ? t.closest('a[href]') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (!/skillpay\.alipay\.com|skillhub\.cn/i.test(href)) return;
    var host = '';
    try { host = new URL(href, location.href).hostname; } catch (err) {}
    hkwTrack('buy_click', { target: host });
  } catch (err) {}
}, true);

/* Compare slider: free (base, left) vs paid (overlay, right) — larger value reveals more paid.
   HTML contract: .compare-slider[data-compare] > .cmp-base / .cmp-overlay>.cmp-top / .cmp-handle / .cmp-range */
(function () {
  document.querySelectorAll('.compare-slider[data-compare]').forEach(function (box) {
    var overlay = box.querySelector('.cmp-overlay');
    var handle = box.querySelector('.cmp-handle');
    var range = box.querySelector('.cmp-range');
    var base = box.querySelector('.cmp-base');
    if (!overlay || !handle || !range) return;

    function apply(v) {
      var pct = Math.max(0, Math.min(100, Number(v) || 0));
      overlay.style.clipPath = 'inset(0 0 0 ' + (100 - pct) + '%)';
      handle.style.left = pct + '%';
    }

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var io = null;
    var autoRaf = 0;
    var autoDriving = false;
    var userTouched = false;
    var played = false;

    function cancelAuto() {
      userTouched = true;
      if (autoRaf) { cancelAnimationFrame(autoRaf); autoRaf = 0; }
      autoDriving = false;
      if (io) { io.disconnect(); io = null; }
    }

    range.addEventListener('input', function () {
      if (!autoDriving) cancelAuto();
      apply(range.value);
    });
    range.addEventListener('pointerdown', cancelAuto);
    range.addEventListener('keydown', cancelAuto);
    box.addEventListener('pointerdown', cancelAuto);

    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

    function demo() {
      if (played || userTouched || reduced) return;
      played = true;
      var from = Number(range.value) || 0;
      var to = 62;
      var start = 0;
      autoDriving = true;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min(1, (ts - start) / 900);
        var v = from + (to - from) * easeOutCubic(p);
        range.value = v;
        apply(v);
        if (p < 1) {
          autoRaf = requestAnimationFrame(step);
        } else {
          autoRaf = 0;
          range.value = to;
          range.dispatchEvent(new Event('input', { bubbles: true }));
          autoDriving = false;
        }
      }
      autoRaf = requestAnimationFrame(step);
    }

    /* Demonstrate once, when the slider first enters the viewport. */
    if (!reduced && 'IntersectionObserver' in window) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          io.disconnect();
          io = null;
          demo();
        });
      }, { threshold: 0.4 });
      io.observe(box);
    }

    /* lock container aspect ratio to the base image's intrinsic ratio */
    if (base) {
      var lockRatio = function () {
        if (base.naturalWidth && base.naturalHeight) {
          box.style.aspectRatio = base.naturalWidth + ' / ' + base.naturalHeight;
        }
      };
      if (base.complete && base.naturalWidth) lockRatio();
      else base.addEventListener('load', lockRatio);
    }

    if (!reduced) {
      box.classList.add('is-anim');
    }
    apply(range.value);
  });
})();
