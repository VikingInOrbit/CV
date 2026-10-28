(function () {
  "use strict";
  var config = window.SITE_CONFIG || {};
  var startedAt = Date.now();
  var keys = document.querySelectorAll(".legend-key");

  function isSet(value) {
    return typeof value === "string" && value.trim() !== "" &&
      value.indexOf(String.fromCharCode(60) + String.fromCharCode(60)) === -1;
  }

  function setLink(key, value, href, external) {
    if (!isSet(value)) {
      key.classList.add("unset");
      key.removeAttribute("href");
      key.setAttribute("tabindex", "-1");
      key.setAttribute("aria-disabled", "true");
      key.querySelector("small").textContent = "NOT AVAILABLE";
      return;
    }
    key.href = href;
    if (external) {
      key.target = "_blank";
      key.rel = "noopener noreferrer";
    }
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

  var now = new Date();
  var timestamp = [now.getHours(), now.getMinutes(), now.getSeconds()]
    .map(function (value) { return String(value).padStart(2, "0"); })
    .join(":");
  document.querySelectorAll(".crt-line:not(.crt-prompt)").forEach(function (line) {
    line.textContent = timestamp + line.textContent.slice(8);
  });

  var share = document.querySelector("[data-share]");
  share.addEventListener("click", function (event) {
    if (navigator.share) {
      event.preventDefault();
      navigator.share({ title: "Gabriel Røer | Mission Control", url: config.site }).catch(function () {});
      return;
    }
    if (navigator.clipboard) {
      event.preventDefault();
      navigator.clipboard.writeText(config.site).then(function () {
        var label = share.querySelector("small");
        label.textContent = "LINK COPIED";
        window.setTimeout(function () { label.textContent = "SEND THIS PAGE"; }, 2000);
      });
    }
  });

  function time(total) {
    var h = Math.floor(total / 3600) % 100;
    var m = Math.floor(total / 60) % 60;
    var s = total % 60;
    return [h, m, s].map(function (value) { return String(value).padStart(2, "0"); }).join(":");
  }

  function update() {
    var current = new Date();
    var gmt = [current.getUTCHours(), current.getUTCMinutes(), current.getUTCSeconds()]
      .map(function (value) { return String(value).padStart(2, "0"); })
      .join(":");
    var elapsed = Math.floor((Date.now() - startedAt) / 1000);
    document.getElementById("gmt-clock").textContent = gmt;
    document.getElementById("flight-clock").textContent = time(elapsed);
    document.getElementById("footer-flight").textContent = time(elapsed);
  }

  update();
  window.setInterval(update, 1000);
}());
