// ===============================
// BASIC FRONTEND SECURITY SCRIPT
// ===============================
(function () {
  "use strict";

  // 🔒 Disable Right Click
  document.addEventListener("contextmenu", function (e) {
    e.preventDefault();
    showWarning("Right click is disabled");
  });

  // 🔒 Disable common DevTools shortcuts
  document.addEventListener("keydown", function (e) {
    // F12
    if (e.key === "F12") {
      block(e);
    }

    // Ctrl + Shift + I / J / C
    if (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key)) {
      block(e);
    }

    // Ctrl + U (View Source)
    if (e.ctrlKey && e.key.toLowerCase() === "u") {
      block(e);
    }

    // Ctrl + S (Save page)
    if (e.ctrlKey && e.key.toLowerCase() === "s") {
      block(e);
    }
  });

  // 🔒 Disable copy / paste / cut
  ["copy", "paste", "cut"].forEach(event => {
    document.addEventListener(event, function (e) {
      e.preventDefault();
      showWarning("Copy/Paste is disabled");
    });
  });

  // 🔍 DevTools Detection (basic)
  let devtoolsOpen = false;
  const threshold = 160;

  setInterval(() => {
    const widthDiff = window.outerWidth - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;

    if (widthDiff > threshold || heightDiff > threshold) {
      if (!devtoolsOpen) {
        devtoolsOpen = true;
        onDevToolsOpen();
      }
    } else {
      devtoolsOpen = false;
    }
  }, 1000);

  // 🚨 What to do when DevTools opens
  function onDevToolsOpen() {
    console.warn("DevTools detected");

    alert("⚠️ Developer tools are not allowed on this application.");

    // Optional: auto logout
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    localStorage.removeItem("institutionCode");

    // Redirect to login
    window.location.href = "/login.html";
  }

  function block(e) {
    e.preventDefault();
    showWarning("Action disabled");
    return false;
  }

  function showWarning(message) {
    console.warn("Security:", message);
  }
})();
