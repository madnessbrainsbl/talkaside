(function () {
  var d = document;
  window.__ts = 1;
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var lite = window.matchMedia && matchMedia("(max-width: 47.99rem), (pointer: coarse)").matches;
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


  var h1 = d.querySelector(".hero h1.split");
  if (h1) {
    if (reduce) h1.classList.add("go");
    else requestAnimationFrame(function () { requestAnimationFrame(function () { h1.classList.add("go"); }); });
  }

  if (window.matchMedia && matchMedia("(hover: hover)").matches) {
    $$(".card, .use, .cross-card, .step").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty("--mx", (e.clientX - r.left) + "px");
        el.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  }

  $$(".app[data-demo]").forEach(function (app) {
    if (app.getAttribute("data-demo") === "hist" || reduce || !("IntersectionObserver" in window)) return;
    var msgs = $$(".msg:not(.is-static)", app);
    if (!msgs.length) return;
    app.classList.add("play");
    var visible = false, running = false, timer = 0;
    var later = function (fn, ms) { timer = setTimeout(function () { if (!visible || d.hidden) { later(fn, 400); return; } fn(); }, ms); };
    var type = function (p, done) {
      var live = p.querySelector(".ai-live");
      var chars = Array.from(p.getAttribute("data-full") || "");
      var step = Math.max(1, Math.round(chars.length / 110));
      var i = 0;
      live.textContent = "";
      var tick = function () {
        i = Math.min(chars.length, i + step);
        live.textContent = chars.slice(0, i).join("");
        if (i < chars.length) later(tick, 22);
        else { p.classList.add("done"); done(); }
      };
      tick();
    };
    var run = function () {
      running = true;
      var k = 0;
      msgs.forEach(function (m) { m.classList.remove("on", "out", "thinking"); var t = m.querySelector(".ai-t"); if (t) t.classList.remove("done"); });
      var next = function () {
        if (k >= msgs.length) {
          later(function () {
            msgs.forEach(function (m) { m.classList.add("out"); });
            later(run, 700);
          }, 5200);
          return;
        }
        var m = msgs[k++];
        m.classList.add("on");
        var t = m.querySelector(".ai-t[data-full]");
        if (t) {
          m.classList.add("thinking");
          later(function () { m.classList.remove("thinking"); type(t, function () { later(next, 500); }); }, 1100);
        } else {
          later(next, app.getAttribute("data-demo") === "tr" ? 1000 : 1300);
        }
      };
      later(next, 450);
    };
    new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      if (visible && !running) run();
    }, { threshold: 0.25 }).observe(app);
  });


  var bar = d.querySelector(".bar");
  var strip = d.querySelector(".strip");
  if (bar && strip && "IntersectionObserver" in window) {
    new IntersectionObserver(function (es) { bar.classList.toggle("is-stuck", !es[0].isIntersecting); }).observe(strip);
  }
  var stripTimer = d.querySelector(".strip-timer");
  if (stripTimer) {
    var stripStart = Date.now();
    var pad = function (n) { return (n < 10 ? "0" : "") + n; };
    setInterval(function () {
      var s = Math.floor((Date.now() - stripStart) / 1000);
      stripTimer.textContent = pad(Math.floor(s / 3600)) + ":" + pad(Math.floor(s / 60) % 60) + ":" + pad(s % 60);
    }, 1000);
  }
  var sq = d.querySelector(".strip-text");
  if (sq && !reduce) {
    var qs = [];
    try { qs = JSON.parse(sq.getAttribute("data-q") || "[]"); } catch (e) { qs = []; }
    if (qs.length > 1) {
      var qi = 0;
      var typeQ = function (txt, k) {
        sq.textContent = Array.from(txt).slice(0, k).join("");
        if (k < Array.from(txt).length) setTimeout(function () { typeQ(txt, k + 1); }, 45);
        else setTimeout(function () { eraseQ(txt, Array.from(txt).length); }, 2400);
      };
      var eraseQ = function (txt, k) {
        sq.textContent = Array.from(txt).slice(0, k).join("");
        if (k > 0) setTimeout(function () { eraseQ(txt, k - 1); }, 18);
        else { qi = (qi + 1) % qs.length; setTimeout(function () { typeQ(qs[qi], 1); }, 300); }
      };
      setTimeout(function () { eraseQ(qs[0], Array.from(qs[0]).length); }, 2600);
    }
  }

  var hero = $$("[data-hero]");
  var g = window.gsap;
  if (g && !reduce) {
    var nav = d.querySelector(".bar");
    var frame = d.querySelector(".hero-frame");
    var tl = g.timeline({ defaults: { ease: "expo.out" } });
    tl.fromTo(nav, { y: -32, opacity: 0 }, { y: 0, opacity: 1, duration: 1, clearProps: "transform" }, 0);
    tl.fromTo(hero.filter(function (e) { return e !== frame && !(e.tagName === "H1" && e.classList.contains("split")); }), { y: 32, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, stagger: 0.09 }, 0.1);
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
      ctx.fillStyle = "rgba(140, 165, 255, 0.14)";
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
    if (!reduce && !lite) {
      if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; }).observe(cv);
      requestAnimationFrame(loop);
    }
  }

  var tc = d.querySelector(".trail");
  var heroEl = d.querySelector(".hero");
  if (tc && tc.getContext && heroEl && !reduce && !lite) {
    var tx = tc.getContext("2d");
    var TW = 0, TH = 0, parts = [], last = null, idleAt = 0, auto = true, tAuto = 0, tOn = true, prevT = 0, ax = 0, ay = 0;
    var colors = ["#5b8cff", "#a78bfa", "#f472b6", "#fb923c", "#4ade80", "#facc15"];
    var glyphs = "/&*<>{}#=;+".split("");
    var tsize = function () {
      var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      var r = tc.getBoundingClientRect();
      TW = r.width; TH = r.height;
      tc.width = Math.round(TW * dpr); tc.height = Math.round(TH * dpr);
      tx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    var spawn = function (x, y) {
      var s = 8 + Math.random() * 12;
      parts.push({ x: x + (Math.random() - 0.5) * 12, y: y + (Math.random() - 0.5) * 12, s: s, c: colors[(Math.random() * colors.length) | 0], g: s > 13 ? glyphs[(Math.random() * glyphs.length) | 0] : "", t: 0, life: 650 + Math.random() * 550, vy: -0.015 - Math.random() * 0.03 });
      if (parts.length > 160) parts.shift();
    };
    var follow = function (x, y) {
      if (!last) { last = { x: x, y: y }; spawn(x, y); return; }
      var dx = x - last.x, dy = y - last.y, dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 18) return;
      var n = Math.min(8, Math.floor(dist / 18));
      for (var i = 1; i <= n; i++) spawn(last.x + dx * i / n, last.y + dy * i / n);
      last = { x: x, y: y };
    };
    var arrow = function (x, y) {
      tx.save();
      tx.translate(x, y);
      tx.beginPath();
      tx.moveTo(0, 0); tx.lineTo(0, 19); tx.lineTo(4.6, 14.6); tx.lineTo(8.2, 22.4); tx.lineTo(11.2, 21); tx.lineTo(7.6, 13.4); tx.lineTo(13.6, 13.4); tx.closePath();
      tx.fillStyle = "#ffffff"; tx.fill();
      tx.lineWidth = 1.4; tx.strokeStyle = "#000000"; tx.stroke();
      tx.restore();
    };
    heroEl.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse") return;
      var r = tc.getBoundingClientRect();
      if (auto) { auto = false; last = null; }
      idleAt = performance.now();
      follow(e.clientX - r.left, e.clientY - r.top);
    });
    heroEl.addEventListener("pointerleave", function () { last = null; idleAt = performance.now() - 1800; });
    var tick2 = function (now) {
      requestAnimationFrame(tick2);
      if (!tOn || d.hidden) { prevT = now; return; }
      var dt = Math.min(40, now - (prevT || now)); prevT = now;
      if (!auto && now - idleAt > 2600) { auto = true; last = null; }
      if (auto) {
        tAuto += dt * 0.00042;
        ax = TW * (0.5 + 0.4 * Math.sin(tAuto * 2.1));
        ay = Math.min(TH, 760) * (0.3 + 0.36 * (0.5 + 0.5 * Math.sin(tAuto * 3.3 + 1)));
        follow(ax, ay);
      }
      tx.clearRect(0, 0, TW, TH);
      tx.textAlign = "center"; tx.textBaseline = "middle";
      for (var i = parts.length - 1; i >= 0; i--) {
        var p = parts[i];
        p.t += dt;
        if (p.t >= p.life) { parts.splice(i, 1); continue; }
        var k = 1 - p.t / p.life, sz = p.s * (0.35 + 0.65 * k);
        p.y += p.vy * dt;
        tx.globalAlpha = Math.min(1, k * 1.5);
        tx.fillStyle = p.c;
        tx.fillRect(p.x - sz / 2, p.y - sz / 2, sz, sz);
        if (p.g && k > 0.4) { tx.fillStyle = "#000000"; tx.font = "700 " + Math.round(sz * 0.64) + "px ui-monospace, Consolas, monospace"; tx.fillText(p.g, p.x, p.y + 0.5); }
      }
      tx.globalAlpha = 1;
      if (auto) arrow(ax, ay);
    };
    tsize();
    window.addEventListener("resize", tsize);
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { tOn = es[0].isIntersecting; }).observe(heroEl);
    requestAnimationFrame(tick2);
  }
})();
