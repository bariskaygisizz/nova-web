// Deletes a NOVA ID with its recovery code, for people who no longer have their phone.
// The recovery code never leaves this browser: like the app, we derive `recoveryAuth` from it with
// HKDF-SHA256 and send only that. The server keeps just sha256(recoveryAuth), so it can match the ID.
(function () {
  "use strict";
  var ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

  /** Same rules as the app: case, spaces and dashes don't matter; O = 0, I/L = 1. */
  function parseCode(input) {
    var chars = input.toUpperCase().replace(/[^0-9A-Z]/g, "").replace(/O/g, "0").replace(/[IL]/g, "1");
    if (chars.length !== 24) return null;
    var out = new Uint8Array(15), buffer = 0, bits = 0, i = 0;
    for (var k = 0; k < chars.length; k++) {
      var v = ALPHABET.indexOf(chars[k]);
      if (v < 0) return null;
      buffer = ((buffer << 5) | v) & 0xffff;
      bits += 5;
      if (bits >= 8) { out[i++] = (buffer >> (bits - 8)) & 0xff; bits -= 8; }
    }
    return out;
  }

  async function recoveryAuth(codeBytes) {
    var enc = new TextEncoder();
    var key = await crypto.subtle.importKey("raw", codeBytes, "HKDF", false, ["deriveBits"]);
    var bits = await crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt: enc.encode("nova-id-v1"), info: enc.encode("recovery-auth") }, key, 256);
    return btoa(String.fromCharCode.apply(null, new Uint8Array(bits)));
  }

  if (typeof module !== "undefined") { module.exports = { parseCode: parseCode, recoveryAuth: recoveryAuth }; return; }

  var form = document.getElementById("delete-form");
  if (!form) return;
  var status = document.getElementById("delete-status");
  var button = form.querySelector("button");
  function show(msg, ok) { status.textContent = msg; status.className = "status " + (ok ? "ok" : "error"); }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    var code = parseCode(form.code.value);
    if (!code) return show("That recovery code doesn't look right. It has 24 letters and numbers, like 7K2M-Q9XD-4RTB-8WNE-3HPA-6FJC.", false);
    if (!form.confirm.checked) return show("Please tick the box to confirm you want to delete your NOVA ID.", false);
    button.disabled = true;
    show("Deleting…", true);
    try {
      var endpoint = (window.NOVA_CONFIG || {}).IDENTITY_DELETE_ENDPOINT;
      var r = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recoveryAuth: await recoveryAuth(code) }) });
      if (r.ok) { form.reset(); show("Your NOVA ID, its devices, security log and encrypted backup were deleted.", true); }
      else if (r.status === 404) show("That recovery code doesn't match a NOVA ID. It may already be deleted.", false);
      else if (r.status === 429) show("Too many attempts. Please wait 15 minutes and try again.", false);
      else show("NOVA ID isn't available right now. Please try again later.", false);
    } catch (err) {
      show("Couldn't reach NOVA. Check your internet connection and try again.", false);
    } finally {
      button.disabled = false;
    }
  });
})();
