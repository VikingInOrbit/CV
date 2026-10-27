(function () {
  "use strict";
  var config = window.SITE_CONFIG || {}, startedAt = Date.now();
  var keys = document.querySelectorAll(".legend-key"), colors = ["#f5e21a", "#e8423f", "#f2b01e", "#f5e21a", "#f1efe0", "#f2b01e", "#f2b01e"];
  function isSet(value) { return typeof value === "string" && value.trim() !== "" && value.indexOf(String.fromCharCode(60) + String.fromCharCode(60)) === -1; }
  function setLink(key, value, href, external) {
    if (!isSet(value)) { key.classList.add("unset"); key.removeAttribute("href"); key.setAttribute("tabindex", "-1"); key.setAttribute("aria-disabled", "true"); key.querySelector("small").textContent = "NOT AVAILABLE"; return; }
    key.href = href; if (external) { key.target = "_blank"; key.rel = "noopener noreferrer"; }
  }
  setLink(document.querySelector('[data-key="email"]'), config.email, "mailto:" + config.email, false);
  setLink(document.querySelector('[data-key="linkedin"]'), config.linkedin, config.linkedin, true);
  keys.forEach(function (key) {
    if (!key.classList.contains("unset")) {
      key.addEventListener("click", function () { key.classList.add("activated"); });
      window.setTimeout(function () { key.classList.add("yellow"); }, Math.random() * 20000);
      window.setTimeout(function () { key.classList.add("activated"); }, 20000 + Math.random() * 100000);
    }
  });
  var systemIndicators = document.querySelectorAll(".system-indicator");
  systemIndicators.forEach(function (indicator) {
    window.setTimeout(function () { indicator.classList.add("system-go"); }, 60000 + Math.random() * 60000);
  });
  var share = document.querySelector("[data-share]");
  share.addEventListener("click", function (event) {
    if (navigator.share) { event.preventDefault(); navigator.share({ title: "Gabriel Røer | Mission Control", url: config.site }).catch(function () {}); return; }
    if (navigator.clipboard) { event.preventDefault(); navigator.clipboard.writeText(config.site).then(function () { var label = share.querySelector("small"); label.textContent = "LINK COPIED"; window.setTimeout(function () { label.textContent = "SEND THIS PAGE"; }, 2000); }); }
  });
  function time(total) { var h = Math.floor(total / 3600) % 100, m = Math.floor(total / 60) % 60, s = total % 60; return [h, m, s].map(function (v) { return String(v).padStart(2, "0"); }).join(":"); }
  function update() { var now = new Date(), gmt = [now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds()].map(function (v) { return String(v).padStart(2, "0"); }).join(":"), elapsed = Math.floor((Date.now() - startedAt) / 1000); document.getElementById("gmt-clock").textContent = gmt; document.getElementById("flight-clock").textContent = time(elapsed); document.getElementById("footer-flight").textContent = time(elapsed); }
  update(); window.setInterval(update, 1000);
}());
