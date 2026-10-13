// /crmmm money machine diagram: draws the wires between nodes and runs leads through the CRM to the $.
(function () {
  var m = document.getElementById("machine");
  if (!m) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var NS = "http://www.w3.org/2000/svg";
  var svg = m.querySelector("svg.wires");
  var ins = m.querySelectorAll(".col.in .mnode");
  var outs = m.querySelectorAll(".col.out .mnode");
  var engine = m.querySelector(".engine");
  var cash = m.querySelector(".cash");
  var cap = document.getElementById("machine-msg");
  var lines = [
    "A lead from your <b>lead magnet</b> is tagged in the CRM, then <b>booked on your calendar</b> automatically.",
    "A <b>Google Business</b> searcher lands in your database and starts getting <b>lifetime nurture</b> emails.",
    "A <b>social media</b> lead gets fast follow-up and moves to <b>converted</b> in your pipeline.",
    "Every source and stage rolls up into <b>performance reports</b>, so you know what is working."
  ];
  var wires = { inE: [], eOut: [], outC: [] };

  function wire(a, b) {
    var mr = m.getBoundingClientRect(), r1 = a.getBoundingClientRect(), r2 = b.getBoundingClientRect();
    var x1, y1, x2, y2, d;
    if (r2.left >= r1.right - 4) { // side by side
      x1 = r1.right - mr.left; y1 = r1.top + r1.height / 2 - mr.top;
      x2 = r2.left - mr.left; y2 = r2.top + r2.height / 2 - mr.top;
      var cx = (x2 - x1) / 2;
      d = "M" + x1 + " " + y1 + " C" + (x1 + cx) + " " + y1 + " " + (x2 - cx) + " " + y2 + " " + x2 + " " + y2;
    } else { // stacked
      x1 = r1.left + r1.width / 2 - mr.left; y1 = r1.bottom - mr.top;
      x2 = r2.left + r2.width / 2 - mr.left; y2 = r2.top - mr.top;
      var cy = (y2 - y1) / 2;
      d = "M" + x1 + " " + y1 + " C" + x1 + " " + (y1 + cy) + " " + x2 + " " + (y2 - cy) + " " + x2 + " " + y2;
    }
    var p = document.createElementNS(NS, "path");
    p.setAttribute("d", d);
    svg.appendChild(p);
    return p;
  }

  function draw() {
    Array.prototype.slice.call(svg.querySelectorAll("path")).forEach(function (p) { p.remove(); });
    wires.inE = Array.prototype.map.call(ins, function (n) { return wire(n, engine); });
    wires.eOut = Array.prototype.map.call(outs, function (n) { return wire(engine, n); });
    wires.outC = Array.prototype.map.call(outs, function (n) { return wire(n, cash); });
  }
  draw();
  window.addEventListener("resize", draw);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);

  function setCap(i) {
    cap.style.opacity = 0;
    setTimeout(function () { cap.innerHTML = lines[i]; cap.style.opacity = 1; }, reduce ? 0 : 200);
  }

  if (reduce) {
    outs.forEach(function (n) { n.classList.add("on"); });
    setCap(0);
    return;
  }

  var dot = document.createElementNS(NS, "circle");
  dot.setAttribute("r", "5");
  dot.style.opacity = 0;
  svg.appendChild(dot);

  function travel(path, ms, done) {
    path.classList.add("flowing");
    var len = path.getTotalLength(), t0 = null;
    dot.style.opacity = 1;
    function frame(t) {
      if (!t0) t0 = t;
      var k = Math.min((t - t0) / ms, 1), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      var pt = path.getPointAtLength(e * len);
      dot.setAttribute("cx", pt.x); dot.setAttribute("cy", pt.y);
      if (k < 1) requestAnimationFrame(frame);
      else { path.classList.remove("flowing"); done(); }
    }
    requestAnimationFrame(frame);
  }

  var step = 0, running = false, visible = false;
  function cycle() {
    if (!visible) { running = false; return; }
    running = true;
    var j = step % outs.length, i = step % ins.length;
    ins.forEach(function (n, k) { n.classList.toggle("on", k === i); });
    outs.forEach(function (n) { n.classList.remove("on"); });
    setCap(j);
    travel(wires.inE[i], 900, function () {
      travel(wires.eOut[j], 900, function () {
        outs[j].classList.add("on");
        travel(wires.outC[j], 700, function () {
          dot.style.opacity = 0;
          cash.classList.remove("hit"); void cash.offsetWidth; cash.classList.add("hit");
          step++;
          setTimeout(cycle, 900);
        });
      });
    });
  }

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        visible = e.isIntersecting;
        if (visible && !running) cycle();
      });
    }, { threshold: 0.25 }).observe(m);
  } else { visible = true; cycle(); }
})();
