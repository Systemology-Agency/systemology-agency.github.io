// Waitlist capture for "coming soon" nurture cards. Same mechanism as the
// DoW Pro email gate (different account): browser posts to Kit v3 tag-subscribe with the PUBLIC
// key (same class as Stripe pk_, safe in page source).
//
// TAG IDS ARE NOT CREATED YET. Each null below needs a Kit tag in the Systemology
// Kit account before this page ships. While a tag is null, signups for that
// card are refused with a visible error instead of silently dropped.
(function () {
  var KIT_PUB = "1sNcVDssIRtQ-GnEJiUemg"; // Systemology Kit account (primary) public key
  var TAGS = {
    "market-update":  null, // ltn-waitlist-market-update
    "buyer-stories":  null, // ltn-waitlist-buyer-stories
    "seller-stories": null, // ltn-waitlist-seller-stories
    "qa-emails":      null  // ltn-waitlist-qa-emails
  };

  var back = document.getElementById("wl-back");
  var form = document.getElementById("wl-form");
  var email = document.getElementById("wl-email");
  var err = document.getElementById("wl-err");
  var submit = document.getElementById("wl-submit");
  var title = document.getElementById("wl-title");
  var formWrap = document.getElementById("wl-form-wrap");
  var done = document.getElementById("wl-done");
  var current = null;

  function open(key, name) {
    current = key;
    title.textContent = name + " waitlist";
    err.textContent = "";
    formWrap.hidden = false;
    done.hidden = true;
    submit.disabled = false;
    back.classList.add("open");
    setTimeout(function () { email.focus(); }, 50);
  }
  function close() { back.classList.remove("open"); }

  document.querySelectorAll("[data-waitlist]").forEach(function (b) {
    b.addEventListener("click", function () { open(b.dataset.waitlist, b.dataset.name); });
  });
  document.getElementById("wl-close").addEventListener("click", close);
  back.addEventListener("click", function (e) { if (e.target === back) close(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = email.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { err.textContent = "Enter a valid email."; return; }
    var tag = TAGS[current];
    if (!tag) { err.textContent = "Waitlist isn't open yet. Email leo@systemology.agency to save your spot."; return; }
    submit.disabled = true;
    err.textContent = "";
    fetch("https://api.convertkit.com/v3/tags/" + tag + "/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: KIT_PUB, email: v })
    }).then(function (r) {
      if (!r.ok) throw new Error("kit " + r.status);
      formWrap.hidden = true;
      done.hidden = false;
    }).catch(function () {
      submit.disabled = false;
      err.textContent = "Something went wrong. Try again, or email leo@systemology.agency.";
    });
  });
})();
