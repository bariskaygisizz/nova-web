(function () {
  var cfg = window.NOVA_CONFIG || {};
  var params = new URLSearchParams(location.search);
  // Forward campaign attribution (UTM tags) to the RevenueCat funnel so web conversions can be attributed.
  var keep = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "ref"];
  var focus = null;

  function funnelHref() {
    if (!cfg.FUNNEL_URL) return null;
    var u = new URL(cfg.FUNNEL_URL);
    keep.forEach(function (k) { if (params.get(k)) u.searchParams.set(k, params.get(k)); });
    if (focus) u.searchParams.set("nova_focus", focus);
    return u.toString();
  }

  function wireCtas() {
    var href = funnelHref();
    document.querySelectorAll("[data-cta]").forEach(function (a) {
      if (a.closest(".nav") || a.closest(".hero")) return; // these scroll to #pro
      if (href) { a.href = href; a.rel = "noopener"; a.removeAttribute("aria-disabled"); }
      else { a.setAttribute("aria-disabled", "true"); a.href = "#download"; }
    });
    document.getElementById("cta-missing").hidden = Boolean(href);
  }

  var copy = {
    focus: "NOVA turns your one priority into a plan with time blocks — and keeps it in front of you.",
    wellness: "Short guided mobility and recovery sessions that fit between meetings.",
    career: "Practice the hard conversation before it happens, with feedback on your wording.",
    organization: "A Smart Vault for notes, links and ideas that you can actually find again.",
    gaming: "Track the games you want to play and finish — and play NOVA QUEST.",
    balance: "One small good deed a day, plus a calmer plan for everything else."
  };
  document.querySelectorAll("[data-focus]").forEach(function (b) {
    b.setAttribute("aria-pressed", "false");
    b.addEventListener("click", function () {
      document.querySelectorAll("[data-focus]").forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
      b.setAttribute("aria-pressed", "true");
      focus = b.getAttribute("data-focus");
      document.getElementById("focus-copy").textContent = copy[focus];
      wireCtas();
    });
  });

  var ios = document.getElementById("appstore"), galaxy = document.getElementById("galaxy");
  if (cfg.APP_STORE_URL) ios.href = cfg.APP_STORE_URL; else ios.hidden = true;
  if (cfg.GALAXY_STORE_URL) galaxy.href = cfg.GALAXY_STORE_URL; else galaxy.hidden = true;
  document.getElementById("stores-missing").hidden = Boolean(cfg.APP_STORE_URL || cfg.GALAXY_STORE_URL);
  wireCtas();

  // Challenge links (…/?c=CODE&s=SCORE) from NOVA QUEST: offer to open the same level in the app.
  var code = (params.get("c") || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (/^[A-Z2-9]{6}$/.test(code)) {
    var score = /^\d{1,7}$/.test(params.get("s") || "") ? params.get("s") : "";
    var bar = document.createElement("div");
    bar.className = "challenge";
    bar.setAttribute("role", "region");
    bar.setAttribute("aria-label", "NOVA QUEST challenge");
    var title = document.createElement("strong");
    title.textContent = score ? "NOVA QUEST challenge: beat " + score + "!" : "NOVA QUEST challenge";
    var body = document.createElement("span");
    body.textContent = " Code " + code + " — same level, your turn. ";
    var open = document.createElement("a");
    open.className = "btn small";
    open.href = "nova://quest?c=" + code + (score ? "&s=" + score : "");
    open.textContent = "Open in NOVA";
    var get = document.createElement("a");
    get.href = "#download";
    get.textContent = "Don't have NOVA yet?";
    bar.appendChild(title); bar.appendChild(body); bar.appendChild(open); bar.appendChild(document.createTextNode(" ")); bar.appendChild(get);
    var main = document.querySelector("main");
    main.insertBefore(bar, main.firstChild);
  }
})();
