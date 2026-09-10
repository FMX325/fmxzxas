// ============================================================
// 付美雪个人简历 - 脚本逻辑
// 文件: main.js
// 功能: 主题切换、气泡动画、导航高亮、地图交互、飞机展开、渐入动画
// 架构: IIFE + 'use strict'，模块化设计（每个功能一个 init 函数）
// 依赖: 无（纯原生 JS，不依赖 jQuery 等库）
// 作者: 付美雪
// 日期: 2026-08-16
// ============================================================

// 模块清单:
//   initTheme        主题切换 + localStorage 持久化
//   makeBubbles       动态生成 18 个背景气泡
//   initHamburger     移动端汉堡菜单展开/收起
//   initNavigation    Tab 导航 + 滚动高亮
//   initAwardsPlane   纸飞机点击展开/收起获奖详情
//   initGrowMap       成长地图节点交互
//   initScrollReveal  IntersectionObserver 渐入 + 技能条动画
//   initSkillVideo    视频占位自动隐藏
//
// 常量: THEME_KEY / BUBBLE_COUNT / NAV_SECTION_IDS / SCROLL_ACTIVE_OFFSET
(function () {
  'use strict';
  var THEME_KEY = 'fmx_theme', THEME_DARK = 'dark', THEME_LIGHT = 'light';
  var BUBBLE_COUNT = 18;
  var NAV_SECTION_IDS = ['hero','grow','skills','awards','hobby','skillsShow','expect'];
  var SCROLL_ACTIVE_OFFSET = 120;

  function applyTheme(theme) {
    var safe = theme === THEME_LIGHT ? THEME_LIGHT : THEME_DARK;
    document.body.setAttribute('data-theme', safe);
    try { localStorage.setItem(THEME_KEY, safe); } catch (e) {}
  }
  function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
    applyTheme(saved === THEME_LIGHT ? THEME_LIGHT : THEME_DARK);
    ['themeBtn','themeBtnMobile'].forEach(function (id) {
      var btn = document.getElementById(id);
      if (btn) btn.addEventListener('click', function () {
        var cur = document.body.getAttribute('data-theme');
        applyTheme(cur === THEME_LIGHT ? THEME_DARK : THEME_LIGHT);
      });
    });
  }
  function makeBubbles() {
    var wrap = document.getElementById('bubbles'); if (!wrap) return;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < BUBBLE_COUNT; i++) {
      var b = document.createElement('div'); b.className = 'bubble';
      var size = 10 + Math.random() * 48;
      b.style.width = size + 'px'; b.style.height = size + 'px';
      b.style.left = (Math.random() * 100) + 'vw';
      b.style.animationDuration = (8 + Math.random() * 14) + 's';
      b.style.animationDelay = (-Math.random() * 14) + 's';
      b.style.opacity = 0.4 + Math.random() * 0.5;
      frag.appendChild(b);
    }
    wrap.appendChild(frag);
  }
  function initHamburger() {
    var btn = document.getElementById('hamburgerBtn'), list = document.getElementById('mainNavList');
    if (!btn || !list) return;
    function toggle(force) {
      var will = typeof force === 'boolean' ? force : list.classList.contains('hidden');
      list.classList.toggle('hidden', !will);
      btn.setAttribute('aria-expanded', will ? 'true' : 'false');
    }
    btn.addEventListener('click', function () { toggle(); });
    list.querySelectorAll('.tab').forEach(function (t) {
      t.addEventListener('click', function () {
        if (!list.classList.contains('hidden') && window.innerWidth < 768) toggle(false);
      });
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 768) { list.classList.remove('hidden'); btn.setAttribute('aria-expanded','true'); }
    });
  }
  function initNavigation() {
    var wrap = document.getElementById('navTabs'); if (!wrap) return;
    var tabs = wrap.querySelectorAll('.tab'); if (tabs.length === 0) return;
    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        var id = t.getAttribute('data-target'); if (!id) return;
        var el = document.getElementById(id);
        if (el) el.scrollIntoView({behavior:'smooth', block:'start'});
      });
    });
    function onScroll() {
      var cur = NAV_SECTION_IDS[0];
      for (var i = 0; i < NAV_SECTION_IDS.length; i++) {
        var s = document.getElementById(NAV_SECTION_IDS[i]);
        if (!s) continue;
        var r = s.getBoundingClientRect();
        if (r.top <= SCROLL_ACTIVE_OFFSET) cur = NAV_SECTION_IDS[i];
      }
      tabs.forEach(function (t) {
        var active = t.getAttribute('data-target') === cur;
        t.classList.toggle('active', active);
        t.setAttribute('aria-selected', active ? 'true' : 'false');
      });
    }
    window.addEventListener('scroll', onScroll, {passive:true});
    onScroll();
  }
  function initAwardsPlane() {
    var plane = document.getElementById('planeCard'), detail = document.getElementById('awardsDetail');
    if (!plane || !detail) return;
    /* 默认展开，点击切换为收起 */
    function toggle() {
      detail.classList.toggle('collapsed');
      var isCollapsed = detail.classList.contains('collapsed');
      var sub = plane.querySelector('.plane-sub');
      if (sub) sub.textContent = isCollapsed ? '— 点击飞机再次展开 —' : '— 点击飞机可收起详情 —';
    }
    plane.addEventListener('click', toggle);
    plane.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ' || e.keyCode === 13 || e.keyCode === 32) { e.preventDefault(); toggle(); }
    });
  }
  function initGrowMap() {
    var tip = document.getElementById('mapTip'), mwrap = document.querySelector('.map-wrap');
    var panel = document.getElementById('growStagePanel');
    var num = document.getElementById('stageNumTag'), title = document.getElementById('stageTitle');
    var sub = document.getElementById('stageSub'), body = document.getElementById('stageBody');
    var cx = document.getElementById('stageCloseX');
    var nodes = document.querySelectorAll('.map-node.route-num');
    if (!tip || !mwrap || !panel || nodes.length === 0) return;
    function moveTip(e) { var r = mwrap.getBoundingClientRect(); tip.style.left = (e.clientX-r.left)+'px'; tip.style.top = (e.clientY-r.top)+'px'; }
    nodes.forEach(function (n) {
      n.addEventListener('mouseenter', function (e) {
        tip.innerHTML = '<b style="color:#ffd54f;">'+(n.getAttribute('data-title')||'')+'</b><br/>'+(n.getAttribute('data-sub')||'');
        tip.style.display='block'; moveTip(e);
      });
      n.addEventListener('mousemove', moveTip);
      n.addEventListener('mouseleave', function () { tip.style.display='none'; });
      n.addEventListener('click', function () {
        if (num) num.textContent = n.getAttribute('data-stage') || '';
        if (title) title.textContent = n.getAttribute('data-title') || '';
        if (sub) sub.textContent = n.getAttribute('data-sub') || '';
        if (body) body.innerHTML = n.getAttribute('data-content') || '';
        panel.classList.remove('open'); void panel.offsetWidth;
        panel.classList.add('open');
        panel.scrollIntoView({behavior:'smooth', block:'nearest'});
      });
    });
    function close() { panel.classList.remove('open'); }
    if (cx) {
      cx.addEventListener('click', close);
      cx.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ' || e.keyCode === 13 || e.keyCode === 32) { e.preventDefault(); close(); }
      });
    }
  }
  function initScrollReveal() {
    document.querySelectorAll('.skill-fill').forEach(function (f) {
      if (!f.style.width || f.style.width === '0%') f.style.width = '0%';
    });
    var list = document.querySelectorAll('.fade-in'); if (list.length === 0) return;
    if (typeof IntersectionObserver !== 'function') {
      list.forEach(function (el) {
        el.classList.add('show');
        el.querySelectorAll('.skill-fill').forEach(function (f) { f.style.width = (f.getAttribute('data-w')||0) + '%'; });
      });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('show');
          en.target.querySelectorAll('.skill-fill').forEach(function (f) { f.style.width = (f.getAttribute('data-w')||0) + '%'; });
          io.unobserve(en.target);
        }
      });
    }, {threshold: 0.12});
    list.forEach(function (el) { io.observe(el); });
  }
  function initSkillVideo() {
    var v = document.getElementById('skillVideo'), p = document.getElementById('skillVideoPlaceholder');
    if (!v || !p) return;
    function sync() {
      var hasSrc = (v.getAttribute('src') && v.getAttribute('src').length > 0) || (v.querySelectorAll('source').length > 0);
      p.style.display = hasSrc ? 'none' : 'flex';
    }
    sync();
    try {
      var mo = new MutationObserver(sync);
      mo.observe(v, {attributes:true, attributeFilter:['src'], childList:true, subtree:true});
    } catch (e) {}
  }

  document.addEventListener('DOMContentLoaded', function () {
    // 标记 JS 已加载，启用渐入动画（配合 CSS: body.js-loaded .fade-in）
    document.body.classList.add('js-loaded');
    var mods = [
      ['主题模块', initTheme],
      ['天空气泡', makeBubbles],
      ['汉堡菜单', initHamburger],
      ['导航交互', initNavigation],
      ['纸飞机获奖', initAwardsPlane],
      ['成长地图', initGrowMap],
      ['滚动入场动画', initScrollReveal],
      ['视频占位', initSkillVideo]
    ];
    mods.forEach(function (pair) {
      try { pair[1](); }
      catch (err) { if (window.console && console.error) console.error('[FMX]['+pair[0]+']错误', err); }
    });
  });
})();

/* ==================== starfield: per-section star layer (different colors / density / speed) ==================== */
(function () {
  var STAR_THEMES = {
    hero:       { density: 0.000105, colors: ['#bfeaff', '#ffffff', '#7fe7ff'], dur: [2.2, 4.8], sizeMax: 2.4, shoot: 1 },
    grow:       { density: 0.000080, colors: ['#cfe0ff', '#ffffff', '#a9c8ff'], dur: [3.0, 6.5], sizeMax: 2.0, shoot: 0 },
    skills:     { density: 0.000100, colors: ['#7fe7ff', '#bfeaff', '#ffffff'], dur: [2.0, 4.2], sizeMax: 2.3, shoot: 1 },
    awards:     { density: 0.000090, colors: ['#ffd97a', '#ffe9b0', '#fff6d9'], dur: [2.6, 5.4], sizeMax: 2.4, shoot: 0 },
    hobby:      { density: 0.000115, colors: ['#7fe7ff', '#ffd97a', '#ffffff'], dur: [2.2, 4.6], sizeMax: 2.4, shoot: 1 },
    skillsShow: { density: 0.000105, colors: ['#7fe7ff', '#bfeaff', '#ffffff'], dur: [2.0, 4.0], sizeMax: 2.3, shoot: 1 },
    expect:     { density: 0.000125, colors: ['#ffffff', '#e8f6ff', '#bfeaff'], dur: [2.4, 5.0], sizeMax: 2.6, shoot: 1 }
  };
  var FALLBACK = { density: 0.000090, colors: ['#bfeaff', '#ffffff'], dur: [2.5, 5.0], sizeMax: 2.2, shoot: 0 };

  function initStars() {
    var sections = document.querySelectorAll('section.fade-in[id]');
    if (!sections.length) return;
    var isMobile = window.innerWidth < 640;
    sections.forEach(function (sec) {
      if (sec.querySelector(':scope > .stars-layer')) return;
      var cfg = STAR_THEMES[sec.id] || FALLBACK;
      var layer = document.createElement('div');
      layer.className = 'stars-layer';
      layer.setAttribute('aria-hidden', 'true');
      var w = sec.offsetWidth || 800;
      var h = Math.max(sec.offsetHeight || 0, 320);
      var count = Math.round(w * h * cfg.density * (isMobile ? 0.6 : 1));
      count = Math.max(isMobile ? 18 : 24, Math.min(count, isMobile ? 55 : 90));
      var frag = document.createDocumentFragment();
      for (var i = 0; i < count; i++) {
        var s = document.createElement('span');
        s.className = 'star-dot' + (Math.random() < 0.18 ? ' star-bright' : '');
        var size = 0.8 + Math.random() * (cfg.sizeMax - 0.8);
        s.style.width = size.toFixed(1) + 'px';
        s.style.height = size.toFixed(1) + 'px';
        s.style.left = (Math.random() * 100).toFixed(2) + '%';
        s.style.top = (Math.random() * 100).toFixed(2) + '%';
        var color = cfg.colors[Math.floor(Math.random() * cfg.colors.length)];
        s.style.background = color;
        s.style.color = color;
        var dur = cfg.dur[0] + Math.random() * (cfg.dur[1] - cfg.dur[0]);
        s.style.animationDuration = dur.toFixed(2) + 's';
        s.style.animationDelay = (-Math.random() * dur).toFixed(2) + 's';
        frag.appendChild(s);
      }
      for (var j = 0; j < cfg.shoot; j++) {
        var sh = document.createElement('span');
        sh.className = 'star-shoot';
        sh.style.left = (55 + Math.random() * 38).toFixed(1) + '%';
        sh.style.top = (4 + Math.random() * 22).toFixed(1) + '%';
        var sd = 9 + Math.random() * 6;
        sh.style.animationDuration = sd.toFixed(1) + 's';
        sh.style.animationDelay = (-Math.random() * sd).toFixed(1) + 's';
        frag.appendChild(sh);
      }
      layer.appendChild(frag);
      sec.insertBefore(layer, sec.firstChild);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStars);
  } else {
    initStars();
  }
})();
