/* ============================================================
   KeyLM Alert – Animated terminal-style notification (stacked)
   Appears 2s after blog alert, pushes it up smoothly.
   Include with <script src="alert/keylm-alert.js"></script>
   ============================================================ */

(function () {
  "use strict";

  var DELAY_MS = 5000; // 3s (blog) + 2s gap
  var DISMISS_KEY = "keylm_alert_dismissed";
  var DISMISS_TTL = 24 * 60 * 60 * 1000;

  var dismissed = localStorage.getItem(DISMISS_KEY);
  if (dismissed && Date.now() - Number(dismissed) < DISMISS_TTL) return;

  /* ---------- reuse shared stack ---------- */
  var stack = document.getElementById("notif-stack");
  if (!stack) {
    stack = document.createElement("div");
    stack.id = "notif-stack";
    document.body.appendChild(stack);
  }

  /* ---------- CSS ---------- */
  var css = [
    ".keylm-alert-wrap{",
      "opacity:0;max-height:0;overflow:hidden;",
      "transform:translateX(120%);",
      "transition:transform .6s cubic-bezier(.22,1,.36,1),opacity .6s ease,max-height .5s ease;",
    "}",
    ".keylm-alert-wrap.show{",
      "opacity:1;max-height:300px;transform:translateX(0);",
    "}",
    ".keylm-alert-wrap.hide{",
      "opacity:0;max-height:0;transform:translateX(120%);",
      "transition:transform .45s ease-in,opacity .35s ease,max-height .4s ease .2s;",
    "}",

    ".keylm-alert{",
      "width:300px;",
      "background:rgba(13,17,23,.92);",
      "border:1px solid rgba(227,155,68,.35);",
      "border-radius:10px;",
      "backdrop-filter:blur(16px) saturate(160%);",
      "-webkit-backdrop-filter:blur(16px) saturate(160%);",
      "box-shadow:0 0 20px rgba(227,155,68,.12),0 8px 32px rgba(0,0,0,.45);",
      "font-family:'JetBrains Mono',monospace;",
      "overflow:hidden;",
      "animation:keylmPulse 3s ease-in-out infinite;",
    "}",
    "@keyframes keylmPulse{",
      "0%,100%{box-shadow:0 0 20px rgba(227,155,68,.12),0 8px 32px rgba(0,0,0,.45);}",
      "50%{box-shadow:0 0 28px rgba(227,155,68,.25),0 8px 32px rgba(0,0,0,.45);}",
    "}",

    ".keylm-alert-bar{",
      "display:flex;align-items:center;justify-content:space-between;",
      "padding:8px 12px;",
      "background:rgba(227,155,68,.10);",
      "border-bottom:1px solid rgba(227,155,68,.18);",
    "}",
    ".keylm-alert-dots{display:flex;gap:6px;}",
    ".keylm-alert-dots span{width:10px;height:10px;border-radius:50%;}",
    ".keylm-alert-dots .r{background:#ff5f57;}",
    ".keylm-alert-dots .y{background:#febc2e;}",
    ".keylm-alert-dots .g{background:#28c840;}",
    ".keylm-alert-bar-title{font-size:.7rem;color:#8b949e;letter-spacing:.5px;}",
    ".keylm-alert-close{",
      "background:none;border:none;color:#8b949e;font-size:1rem;",
      "cursor:pointer;padding:0 2px;line-height:1;transition:color .2s;",
    "}",
    ".keylm-alert-close:hover{color:#e6edf3;}",

    ".keylm-alert-body{padding:14px 14px 12px;}",
    ".keylm-alert-prompt{font-size:.75rem;color:#e39b44;margin-bottom:8px;}",
    ".keylm-alert-prompt .cmd{color:#e6edf3;}",
    ".keylm-alert-msg{",
      "font-size:.78rem;color:#8b949e;line-height:1.55;",
      "min-height:38px;margin-bottom:12px;",
    "}",
    ".keylm-alert-msg .hl{color:#e39b44;}",

    ".ka-cursor{",
      "display:inline-block;width:7px;height:14px;",
      "background:#e39b44;vertical-align:text-bottom;",
      "animation:kaCursorBlink 1s step-end infinite;",
    "}",
    "@keyframes kaCursorBlink{0%,100%{opacity:1;}50%{opacity:0;}}",

    ".keylm-alert-btn{",
      "display:inline-block;padding:7px 16px;",
      "background:rgba(227,155,68,.15);",
      "border:1px solid rgba(227,155,68,.4);",
      "border-radius:6px;color:#e39b44;",
      "font-family:'JetBrains Mono',monospace;",
      "font-size:.75rem;text-decoration:none;",
      "transition:background .25s,border-color .25s,transform .2s;",
    "}",
    ".keylm-alert-btn:hover{",
      "background:rgba(227,155,68,.25);",
      "border-color:rgba(227,155,68,.6);",
      "transform:translateY(-1px);",
    "}",

    "@media(max-width:480px){.keylm-alert{width:100%;}}"
  ].join("\n");

  var styleEl = document.createElement("style");
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* ---------- HTML ---------- */
  var wrap = document.createElement("div");
  wrap.className = "keylm-alert-wrap";
  wrap.innerHTML = [
    '<div class="keylm-alert">',
      '<div class="keylm-alert-bar">',
        '<div class="keylm-alert-dots">',
          '<span class="r"></span><span class="y"></span><span class="g"></span>',
        '</div>',
        '<span class="keylm-alert-bar-title">notification</span>',
        '<button class="keylm-alert-close" aria-label="Close">&times;</button>',
      '</div>',
      '<div class="keylm-alert-body">',
        '<div class="keylm-alert-prompt">',
          '<span class="cmd">$ cat projects.log</span>',
        '</div>',
        '<div class="keylm-alert-msg">',
          '<span class="ka-cursor"></span>',
        '</div>',
        '<a href="https://keylm.shakilahmed.tech" class="keylm-alert-btn" style="opacity:0;transform:translateY(6px);transition:opacity .4s,transform .4s;">',
          '~/keylm &rarr;',
        '</a>',
      '</div>',
    '</div>'
  ].join("");

  stack.appendChild(wrap);

  var closeBtn = wrap.querySelector(".keylm-alert-close");
  var msgEl    = wrap.querySelector(".keylm-alert-msg");
  var ctaBtn   = wrap.querySelector(".keylm-alert-btn");

  function dismiss() {
    wrap.classList.remove("show");
    wrap.classList.add("hide");
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setTimeout(function () { wrap.remove(); }, 600);
  }
  closeBtn.addEventListener("click", dismiss);

  var lines = [
    { text: "KeyLM — Bring Your AI", cls: "hl" },
    { text: " Your keys. Your models. One unified chat workspace.", cls: "" }
  ];

  function typeLines(lineIdx, charIdx) {
    if (lineIdx >= lines.length) {
      var cur = msgEl.querySelector(".ka-cursor");
      if (cur) cur.remove();
      ctaBtn.style.opacity = "1";
      ctaBtn.style.transform = "translateY(0)";
      return;
    }
    var line = lines[lineIdx];
    var span = msgEl.querySelector('[data-line="' + lineIdx + '"]');
    if (!span) {
      span = document.createElement("span");
      span.setAttribute("data-line", lineIdx);
      if (line.cls) span.className = line.cls;
      var cursor = msgEl.querySelector(".ka-cursor");
      msgEl.insertBefore(span, cursor);
    }
    if (charIdx < line.text.length) {
      span.textContent += line.text[charIdx];
      setTimeout(function () { typeLines(lineIdx, charIdx + 1); }, 32);
    } else {
      setTimeout(function () { typeLines(lineIdx + 1, 0); }, 200);
    }
  }

  setTimeout(function () {
    wrap.classList.add("show");
    setTimeout(function () { typeLines(0, 0); }, 650);
  }, DELAY_MS);

  setTimeout(function () {
    if (wrap.classList.contains("show") && !wrap.classList.contains("hide")) {
      dismiss();
    }
  }, DELAY_MS + 20000);
})();
