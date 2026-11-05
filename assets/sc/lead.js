// THE LEAD: one glowing dot that follows the scroll across the whole page.
// hub: leaves the "New lead" chip and is pulled into the core. system: sits on the line while
// each stage meets it. then it docks on the side rail, and finally settles into the closing button.
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s) { return document.querySelector(s); };
  var lead = $("#lead"), hub = $("#hub"), sys = $("#system"), cls = $("#close");
  var chip = $("#chipLead .ic"), core = $("#core"), anchor = $("#sysAnchor"), goal = $("#goal");
  var stations = Array.prototype.slice.call(document.querySelectorAll(".st[data-st]"));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll("#railnav a"));
  var secIds = ["top", "hub", "system", "offers", "leo", "close"];
  var secs = secIds.map(function (id) { return document.getElementById(id); });
  var vh = innerHeight, vw = innerWidth, tops = [], hubT = 0, sysT = 0, sysH = 0, clsT = 0, hubStageOff = null;
  var scheduled = false, lastNow = -1;

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function ease(t) { t = clamp(t, 0, 1); return 1 - Math.pow(1 - t, 3); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function mix(p, q, t) { return { x: lerp(p.x, q.x, t), y: lerp(p.y, q.y, t) }; }
  function ctr(el) { var r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
  function absTop(el) { return el.getBoundingClientRect().top + scrollY; }
  function pOf(el) { return parseFloat(el.style.getPropertyValue("--sc-p")) || 0; }

  var navOn = false;
  function measure() {
    vh = innerHeight; vw = innerWidth;
    navOn = !!navLinks.length && getComputedStyle($("#railnav")).display !== "none";
    tops = secs.map(absTop);
    hubT = absTop(hub); sysT = absTop(sys); sysH = sys.offsetHeight; clsT = absTop(cls);
  }

  function dock() {
    if (!navOn) return { x: vw / 2, y: vh - 26 };
    var probe = scrollY + vh * 0.5, idx = 0;
    for (var i = 0; i < tops.length; i++) if (tops[i] <= probe) idx = i;
    var next = Math.min(idx + 1, tops.length - 1);
    var f = next === idx ? 0 : clamp((probe - tops[idx]) / (tops[next] - tops[idx]), 0, 1);
    var a = ctr(navLinks[idx].querySelector("i")), b = ctr(navLinks[next].querySelector("i"));
    return mix(a, b, f);
  }

  function hubPinned() {
    // chip and core are laid out relative to the pinned stage (top = 0), so read them live.
    var st = hub.querySelector("[data-sc-stage]").getBoundingClientRect();
    function rel(el) { var c = ctr(el); return { x: c.x - st.left, y: c.y - st.top }; }
    // QA: park in the lower third of the core, not dead centre, where it sat on "coached".
    var cr = core.getBoundingClientRect(), cc = rel(core);
    return { chip: rel(chip), core: { x: cc.x, y: cc.y + cr.height * 0.3 } };
  }

  function render() {
    scheduled = false;
    var y = scrollY, pos = null, op = 1, scale = 1, landed = false;
    var sysPin0 = sysT, sysPin1 = sysT + sysH - vh;
    if (y < hubT - vh * 0.2) { op = 0; }
    else if (y < sysT - vh) {
      var hp = pOf(hub), h = hubPinned();
      var t = ease((hp - 0.34) / 0.3);
      pos = mix(h.chip, h.core, t);
      op = clamp((y - (hubT - vh * 0.2)) / (vh * 0.2), 0, 1);
      scale = 1 + t * 0.6;
    } else if (y < sysT) {
      var h2 = hubPinned(), t1 = ease((y - (sysT - vh)) / vh);
      pos = mix(h2.core, ctr(anchor), t1); scale = lerp(1.6, 1.25, t1);
    } else if (y <= sysPin1) {
      pos = ctr(anchor); scale = 1.25;
    } else if (y < sysPin1 + vh * 0.8) {
      var t2 = ease((y - sysPin1) / (vh * 0.8));
      pos = mix(ctr(anchor), dock(), t2); scale = lerp(1.25, 1, t2);
      // mobile QA: no side rail on phones, so the dock sat over body copy. Fade out instead.
      if (!navOn) op = 1 - t2;
    } else if (y < clsT - vh) {
      pos = dock();
      if (!navOn) op = 0;
    } else {
      var t3 = ease((y - (clsT - vh)) / vh);
      pos = mix(dock(), ctr(goal), t3);
      if (!navOn) op = t3;
      landed = t3 >= 0.995;
      scale = lerp(1, 1.1, t3);
    }
    // QA: all layout reads happen before any write, so a frame costs one style pass, not a
    // forced re-layout per station.
    var inSys = y > sysT - vh * 0.6 && y < sysPin1 + vh, st8 = null, now = -1;
    if (inSys) {
      var x0 = ctr(anchor).x;
      // a stage reacts when the lead reaches it and stays "now" until the lead is most of a
      // stage past (was: lit half a stage BEFORE contact, so the ping fired in empty space).
      st8 = stations.map(function (s, i) {
        var r = s.getBoundingClientRect(), c = r.left + r.width / 2;
        var on = c <= x0 + 6, isNow = on && c > x0 - r.width * 0.9;
        if (isNow) now = i;
        return [on, isNow];
      });
    }

    if (pos) lead.style.transform = "translate3d(" + (pos.x - 7).toFixed(1) + "px," + (pos.y - 7).toFixed(1) + "px,0) scale(" + scale.toFixed(2) + ")";
    lead.style.opacity = landed ? 0 : op;
    if (goal) goal.classList.toggle("lit", landed);
    if (st8) {
      stations.forEach(function (s, i) { s.classList.toggle("on", st8[i][0]); s.classList.toggle("now", st8[i][1]); });
      if (now !== lastNow && now >= 0 && y >= sysT && y <= sysPin1) { lead.classList.remove("ping"); void lead.offsetWidth; lead.classList.add("ping"); }
      lastNow = now;
    }

    // rail nav highlight
    var probe = y + vh * 0.5, cur = 0;
    for (var i = 0; i < tops.length; i++) if (tops[i] <= probe) cur = i;
    navLinks.forEach(function (a, k) { a.classList.toggle("on", k === cur); });
  }

  var idle = 0, lastKey = "";
  function loop() {
    var key = scrollY + "|" + pOf(hub) + "|" + pOf(sys) + "|" + pOf(cls);
    if (key !== lastKey) { lastKey = key; idle = 0; }
    if (idle < 6) { render(); idle++; }
    requestAnimationFrame(loop);
  }
  function req() { idle = 0; }

  if (reduce) {
    stations.forEach(function (s) { s.classList.add("on"); });
    return;
  }
  measure();
  addEventListener("scroll", req, { passive: true });
  addEventListener("resize", function () { measure(); req(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { measure(); req(); });
  addEventListener("load", function () { setTimeout(function () { measure(); req(); if (location.hash) { var h = document.querySelector(location.hash); if (h) h.scrollIntoView(); } }, 350); });
  requestAnimationFrame(loop);
})();
