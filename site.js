(function () {
  var d = document;
  window.__ts = 1;
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $$ = function (s, r) { return [].slice.call((r || d).querySelectorAll(s)); };

  var rv = $$(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    rv.forEach(function (e) { e.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    rv.forEach(function (e) { io.observe(e); });
  }

  var words = $$(".tag .w");
  if (reduce || !("IntersectionObserver" in window)) {
    words.forEach(function (w) { w.classList.add("on"); });
  } else {
    var wio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        e.target.classList.toggle("on", e.isIntersecting || e.boundingClientRect.top < 0);
      });
    }, { rootMargin: "0px 0px -38% 0px", threshold: 0 });
    words.forEach(function (w) { wio.observe(w); });
  }

  var langmenu = d.querySelector(".langmenu");
  if (langmenu) {
    d.addEventListener("click", function (e) { if (langmenu.open && !langmenu.parentNode.contains(e.target)) langmenu.open = false; });
    d.addEventListener("keydown", function (e) { if (e.key === "Escape" && langmenu.open) { langmenu.open = false; langmenu.querySelector("summary").focus(); } });
  }

  var hero = $$("[data-hero]");
  var g = window.gsap;
  if (g && !reduce) {
    var nav = d.querySelector(".nav");
    var frame = d.querySelector(".hero-frame");
    var tl = g.timeline({ defaults: { ease: "expo.out" } });
    tl.fromTo(nav, { y: -32, opacity: 0 }, { y: 0, opacity: 1, duration: 1, clearProps: "transform" }, 0);
    tl.fromTo(hero.filter(function (e) { return e !== frame; }), { y: 32, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, stagger: 0.09 }, 0.1);
    if (frame) {
      tl.fromTo(frame, { y: 72, opacity: 0, rotationX: 16, scale: 0.94, transformPerspective: 1400, transformOrigin: "50% 0%" }, { y: 0, opacity: 1, rotationX: 0, scale: 1, duration: 1.5 }, 0.45);
      if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        var rx = g.quickTo(frame, "rotationX", { duration: 0.8, ease: "power3" });
        var ry = g.quickTo(frame, "rotationY", { duration: 0.8, ease: "power3" });
        var zone = d.querySelector(".hero");
        zone.addEventListener("pointermove", function (e) {
          var r = frame.getBoundingClientRect();
          var nx = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
          var ny = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
          ry(nx * 6);
          rx(-ny * 4);
        });
        zone.addEventListener("pointerleave", function () { ry(0); rx(0); });
      }
    }
  } else {
    hero.forEach(function (e) { e.style.opacity = 1; });
  }

  var par = $$("[data-par]");
  if (par.length && !reduce) {
    var tick = false;
    var update = function () {
      tick = false;
      var vh = window.innerHeight;
      par.forEach(function (el) {
        var r = el.getBoundingClientRect();
        var p = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.9)));
        el.style.transform = "translate3d(0," + ((1 - p) * 48).toFixed(1) + "px,0) scale(" + (0.94 + 0.06 * p).toFixed(3) + ")";
      });
    };
    window.addEventListener("scroll", function () { if (!tick) { tick = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  var cv = d.querySelector(".bars");
  if (cv && cv.getContext) {
    var ctx = cv.getContext("2d");
    var W = 0, H = 0, t0 = 0, run = !reduce, vis = true;
    var N = 72;
    var size = function () {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var b = cv.getBoundingClientRect();
      W = b.width; H = b.height;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    var draw = function (t) {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#181818";
      var gap = W / N, bw = Math.max(3, gap * 0.45);
      for (var i = 0; i < N; i++) {
        var x = gap * (i + 0.5);
        var env = Math.pow(Math.sin(Math.PI * (i + 0.5) / N), 1.4);
        var m = 0.25 + 0.75 * Math.abs(Math.sin(t * 0.0011 + i * 0.37) * Math.cos(t * 0.0007 + i * 0.13));
        var h = Math.max(6, H * 0.85 * env * m);
        var y = H * 0.5 - h / 2;
        if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(x - bw / 2, y, bw, h, bw / 2); ctx.fill(); }
        else ctx.fillRect(x - bw / 2, y, bw, h);
      }
    };
    var loop = function (t) {
      if (run && vis && !d.hidden) draw(t);
      requestAnimationFrame(loop);
    };
    size();
    draw(2000);
    window.addEventListener("resize", function () { size(); draw(2000); });
    if (!reduce) {
      if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; }).observe(cv);
      requestAnimationFrame(loop);
    }
  }
})();
