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
  var crt = document.querySelector(".crt");
  function resetCrt() {
    crt.classList.remove("crt-ready", "crt-booted");
    var command = crt.querySelector(".crt-command"), prompt = crt.querySelector(".crt-prompt");
    command.classList.remove("crt-command-complete");
    command.textContent = "";
    prompt.classList.remove("crt-line-visible");
    prompt.innerHTML = 'Z:Me/GR:<span class="crt-cursor" aria-hidden="true"></span>';
    crt.querySelectorAll(".crt-line").forEach(function (line) {
      line.classList.remove("crt-line-visible");
      if (line.hasAttribute("data-output")) line.textContent = "";
    });
  }
  function bootCrt() {
    var command = crt.querySelector(".crt-command"), lines = crt.querySelectorAll(".crt-line[data-output]"), now = new Date();
    var navigation = window.performance && window.performance.getEntriesByType ? window.performance.getEntriesByType("navigation")[0] : null;
    var reload = navigation && navigation.type === "reload";
    var timestamp = [now.getHours(), now.getMinutes(), now.getSeconds()].map(function (value) { return String(value).padStart(2, "0"); }).join(":");
    var cursor = document.createElement("span");
    cursor.className = "crt-cursor";
    cursor.setAttribute("aria-hidden", "true");
    command.textContent = "";
    command.appendChild(document.createTextNode(""));
    command.appendChild(cursor);
    lines.forEach(function (line) { line.textContent = timestamp + ": " + line.getAttribute("data-output"); });
    crt.classList.add("crt-ready");
    var commandText = command.getAttribute("data-command"), position = 0, reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function typeCommand() {
      command.firstChild.textContent = commandText.slice(0, position);
      position += 1;
      if (position <= commandText.length) window.setTimeout(typeCommand, reducedMotion ? 0 : 45);
      else {
        command.classList.add("crt-command-complete");
        if (reload) startOutput();
      }
    }
    if (!reducedMotion) {
      typeCommand();
    } else {
      command.firstChild.textContent = commandText;
      command.classList.add("crt-command-complete");
      if (reload) startOutput();
    }
    function startOutput() {
      if (!command.classList.contains("crt-command-complete") || crt.classList.contains("crt-booted")) return;
      crt.classList.add("crt-booted");
      var outputLines = crt.querySelectorAll(".crt-line");
      Array.prototype.forEach.call(outputLines, function (line, index) {
        window.setTimeout(function () { line.classList.add("crt-line-visible"); }, 650 + index * 700);
      });
    }
    crt.startOutput = startOutput;
    crt.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        startOutput();
      }
    });
    if (!crt.hasAttribute("data-terminal-listener")) {
      document.addEventListener("keydown", function (event) {
        var target = event.target;
        if (event.key !== "Enter" || event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey ||
            (target && (target.matches("input, textarea, select, button, a") || target.isContentEditable))) return;
        var rect = crt.getBoundingClientRect(), visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
        if (visibleHeight / rect.height >= 0.75 && crt.startOutput) {
          event.preventDefault();
          crt.startOutput();
        }
      });
      crt.setAttribute("data-terminal-listener", "true");
    }
    crt.addEventListener("click", function () { crt.focus(); });
    if (reducedMotion) {
      command.classList.add("crt-command-complete");
    }
  }
  if (crt && "IntersectionObserver" in window) {
    var crtObserver = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        bootCrt();
        crtObserver.disconnect();
      }
    }, { threshold: 0.75 });
    crtObserver.observe(crt);
    window.addEventListener("pageshow", function (event) {
      if (event.persisted) {
        resetCrt();
        crtObserver.observe(crt);
      } else if (!crt.classList.contains("crt-ready")) {
        crtObserver.observe(crt);
      }
    });
    window.setTimeout(function () {
      if (!crt.classList.contains("crt-ready")) {
        var rect = crt.getBoundingClientRect(), visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
        if (visibleHeight / rect.height >= 0.75) bootCrt();
      }
    }, 250);
  } else if (crt) {
    bootCrt();
  }
  var share = document.querySelector("[data-share]");
  share.addEventListener("click", function (event) {
    if (navigator.share) { event.preventDefault(); navigator.share({ title: "Gabriel Røer | Mission Control", url: config.site }).catch(function () {}); return; }
    if (navigator.clipboard) { event.preventDefault(); navigator.clipboard.writeText(config.site).then(function () { var label = share.querySelector("small"); label.textContent = "LINK COPIED"; window.setTimeout(function () { label.textContent = "SEND THIS PAGE"; }, 2000); }); }
  });
  function time(total) { var h = Math.floor(total / 3600) % 100, m = Math.floor(total / 60) % 60, s = total % 60; return [h, m, s].map(function (v) { return String(v).padStart(2, "0"); }).join(":"); }
  function update() { var now = new Date(), gmt = [now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds()].map(function (v) { return String(v).padStart(2, "0"); }).join(":"), elapsed = Math.floor((Date.now() - startedAt) / 1000); document.getElementById("gmt-clock").textContent = gmt; document.getElementById("flight-clock").textContent = time(elapsed); document.getElementById("footer-flight").textContent = time(elapsed); }
  update(); window.setInterval(update, 1000);
}());
