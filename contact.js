(function () {
  var cfg = window.NOVA_CONFIG || {};
  var form = document.getElementById("contact-form");
  var status = document.getElementById("c-status");
  var submit = document.getElementById("c-submit");
  var params = new URLSearchParams(location.search);
  if (params.get("topic")) { var t = document.getElementById("c-topic"); t.value = params.get("topic"); }

  function show(text, kind) { status.textContent = text; status.className = "status " + (kind || ""); }

  if (!cfg.CONTACT_ENDPOINT) {
    show("The contact form is being set up. Please check back shortly.", "error");
    submit.disabled = true;
    return;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var data = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      topic: form.topic.value,
      message: form.message.value.trim(),
      website: form.website.value,
    };
    if (!data.name) { show("Please enter your name.", "error"); form.name.focus(); return; }
    if (data.message.length < 10) { show("Please write a message of at least 10 characters.", "error"); form.message.focus(); return; }
    submit.disabled = true;
    show("Sending…");
    fetch(cfg.CONTACT_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (b) { return { ok: r.ok, body: b }; }); })
      .then(function (res) {
        if (res.ok) { form.reset(); show("Thanks! Your message has been sent.", "ok"); }
        else { show(res.body.error || "Something went wrong. Please try again later.", "error"); }
      })
      .catch(function () { show("Network error. Please check your connection and try again.", "error"); })
      .then(function () { submit.disabled = false; });
  });
})();
