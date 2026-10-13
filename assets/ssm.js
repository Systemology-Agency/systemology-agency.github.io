// /ssm live call window: example questions come in, get answered, and the agenda moves along.
(function () {
  var call = document.getElementById("call");
  if (!call) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var feed = document.getElementById("feed");
  var items = call.querySelectorAll(".agenda li");
  var tally = document.getElementById("fixed");
  var pairs = [
    { a: 0, who: "SA", role: "Solo agent", q: "How do I turn open house sign-ins into appointments?", r: "Tag them in Lofty, start the open house plan and call within 24 hours. I'll share the plan now." },
    { a: 1, who: "NA", role: "Newer agent", q: "What do I text a lead who went quiet for 90 days?", r: "Use the 3-text revival script. It's in the member library, ready to paste." },
    { a: 2, who: "TL", role: "Team leader", q: "Can AI write my weekly market email?", r: "Yes. We'll build the prompt together on this call, and you'll leave with it." },
    { a: 3, who: "SA", role: "Solo agent", q: "Lofty added a new feature. Should I use it?", r: "Yes, here's how it fits your setup. It's this month's system upgrade." },
    { a: 4, who: "TL", role: "Team leader", q: "My agents' texts are getting blocked.", r: "That's text registration. We'll check yours after the call and fix it." }
  ];
  var n = 0;

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; }
  function bubble(p, leo) {
    var m = el("div", "msg" + (leo ? " leo" : ""));
    m.appendChild(el("div", "av", leo ? "LC" : p.who));
    m.appendChild(el("div", "bub", leo
      ? "<small>Leo</small>" + p.r + "<br><span class=\"fixed\">&#10003; Fixed</span>"
      : "<small>" + p.role + "</small>" + p.q));
    return m;
  }
  function trim() { while (feed.children.length > 5) feed.removeChild(feed.firstChild); }
  function mark(i) {
    items.forEach(function (li, k) {
      li.classList.toggle("on", k === i);
      li.classList.toggle("done", k < i);
    });
  }

  if (reduce) {
    pairs.slice(0, 2).forEach(function (p) { feed.appendChild(bubble(p)); feed.appendChild(bubble(p, true)); });
    mark(1); tally.textContent = "2";
    return;
  }

  var step = 0, running = false, visible = false;
  function cycle() {
    if (!visible) { running = false; return; }
    running = true;
    var p = pairs[step % pairs.length];
    if (p.a === 0) { n = 0; tally.textContent = "0"; }
    mark(p.a);
    feed.appendChild(bubble(p)); trim();
    setTimeout(function () {
      var t = el("div", "msg leo typing", "<div class=\"av\">LC</div><div class=\"bub\"><span></span><span></span><span></span></div>");
      feed.appendChild(t); trim();
      setTimeout(function () {
        feed.replaceChild(bubble(p, true), t);
        trim();
        tally.textContent = String(++n);
        step++;
        setTimeout(cycle, 2200);
      }, 1300);
    }, 900);
  }

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        visible = e.isIntersecting;
        if (visible && !running) cycle();
      });
    }, { threshold: 0.25 }).observe(call);
  } else { visible = true; cycle(); }
})();
