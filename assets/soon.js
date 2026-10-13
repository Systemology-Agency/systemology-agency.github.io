// Coming-soon waitlist. Browser posts first name + email to Kit v3 tag-subscribe with the
// PUBLIC key (same class as Stripe pk_, safe in page source). Primary Kit account (1409401),
// tag systemology-launch-waitlist. Leo's email alert comes from cia-sys-launch-waitlist-notify.
(function () {
  var KIT_PUB = "1sNcVDssIRtQ-GnEJiUemg";
  var TAG = 24601236;
  var form = document.getElementById("wl");
  var name = document.getElementById("wl-name");
  var email = document.getElementById("wl-email");
  var err = document.getElementById("wl-err");
  var submit = document.getElementById("wl-submit");
  var fields = document.getElementById("wl-fields");
  var done = document.getElementById("wl-done");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var n = name.value.trim(), v = email.value.trim();
    if (!n) { err.textContent = "Enter your first name."; name.focus(); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { err.textContent = "Enter a valid email."; email.focus(); return; }
    submit.disabled = true;
    err.textContent = "";
    fetch("https://api.convertkit.com/v3/tags/" + TAG + "/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: KIT_PUB, email: v, first_name: n })
    }).then(function (r) {
      if (!r.ok) throw new Error("kit " + r.status);
      fields.hidden = true;
      done.hidden = false;
    }).catch(function () {
      submit.disabled = false;
      err.textContent = "Something went wrong. Try again, or email leo@systemology.agency.";
    });
  });
})();
