// Homepage interactions: mega menu, mobile nav, system map loop, offer tabs, tile glow.
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hdr = document.getElementById("hdr");

  // header border once the page scrolls
  function onScroll() { hdr.classList.toggle("scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // mega menus: click to open, one at a time, close on outside click or Escape
  var items = document.querySelectorAll(".menu > li:not(.m-only)");
  function closeAll(except) {
    items.forEach(function (li) {
      if (li === except) return;
      li.classList.remove("open");
      li.querySelector(".menu-btn").setAttribute("aria-expanded", "false");
    });
  }
  items.forEach(function (li) {
    var btn = li.querySelector(".menu-btn");
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = !li.classList.contains("open");
      closeAll(li);
      li.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", String(open));
    });
  });
  document.addEventListener("click", function (e) { if (!e.target.closest(".menu")) closeAll(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeAll(); });

  // mobile nav
  var burger = document.getElementById("burger");
  burger.addEventListener("click", function () {
    var open = hdr.classList.toggle("nav-open");
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });

  // system map: walk a lead through the five stages, then loop
  var flow = document.getElementById("flow");
  var nodes = flow.querySelectorAll(".node");
  var msg = document.getElementById("logmsg");
  var lines = [
    "<b>New lead</b> came in from your IDX site and was tagged by price range and area.",
    "<b>Instant follow-up</b> sent a text and an email 2 minutes after sign-up.",
    "<b>Appointment set</b> for a Saturday showing, with a reminder the day before.",
    "<b>Under contract</b>, so the closing checklist and client updates started on their own.",
    "<b>Lifetime nurture</b> added them to Deal of the Week. They hear from you every Tuesday."
  ];
  var step = 0, timer = null;
  function show(i) {
    nodes.forEach(function (n, k) { n.classList.toggle("on", k <= i); });
    flow.style.setProperty("--fill", (i / (nodes.length - 1) * 100) + "%");
    msg.style.opacity = 0;
    setTimeout(function () { msg.innerHTML = lines[i]; msg.style.opacity = 1; }, reduce ? 0 : 220);
  }
  function tick() { show(step); step = (step + 1) % nodes.length; }
  if (reduce) {
    show(nodes.length - 1);
  } else if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && !timer) { tick(); timer = setInterval(tick, 2400); }
        else if (!e.isIntersecting && timer) { clearInterval(timer); timer = null; }
      });
    }, { threshold: 0.3 }).observe(flow);
  } else { tick(); timer = setInterval(tick, 2400); }

  // offer tabs with sliding underline and arrow-key support
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));
  var ink = document.getElementById("ink");
  function moveInk(t) { ink.style.left = t.offsetLeft + "px"; ink.style.width = t.offsetWidth + "px"; }
  function select(t, focus) {
    tabs.forEach(function (o) {
      var on = o === t, p = document.getElementById(o.getAttribute("aria-controls"));
      o.setAttribute("aria-selected", String(on));
      o.tabIndex = on ? 0 : -1;
      p.hidden = !on;
      p.classList.toggle("show", on);
    });
    moveInk(t);
    if (focus) t.focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { select(t); });
    t.addEventListener("keydown", function (e) {
      var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (d) { e.preventDefault(); select(tabs[(i + d + tabs.length) % tabs.length], true); }
    });
  });
  function inkToCurrent() { moveInk(tabs.filter(function (t) { return t.getAttribute("aria-selected") === "true"; })[0]); }
  window.addEventListener("resize", inkToCurrent);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(inkToCurrent);
  inkToCurrent();

  // nurture tiles: glow follows the pointer
  document.querySelectorAll(".tile").forEach(function (el) {
    el.addEventListener("pointermove", function (e) {
      var r = el.getBoundingClientRect();
      el.style.setProperty("--mx", (e.clientX - r.left) + "px");
      el.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });
})();
