/* ============================================================
   Blog Alert – Animated terminal-style notification
   Self-contained: injects its own HTML + CSS into the page.
   Include with <script src="alert/blog-alert.js"></script>
   ============================================================ */

(function () {
  "use strict";

  /* ---------- tunables ---------- */
  var DELAY_MS   = 3000;   // show after 3 s
  var DISMISS_KEY = "blog_alert_dismissed";
  var DISMISS_TTL = 24 * 60 * 60 * 1000; // re-show after 24 h

  /* skip if already dismissed recently */
  var dismissed = localStorage.getItem(DISMISS_KEY);
  if (dismissed && Date.now() - Number(dismissed) < DISMISS_TTL) return;

  /* ---------- CSS ---------- */
  var css = [
    /* wrapper */
    ".blog-alert-wrap{",
      "position:fixed;bottom:100px;right:24px;z-index:9999;",
      "pointer-events:none;opacity:0;",
      "transform:translateX(120%);",
      "transition:transform .6s cubic-bezier(.22,1,.36,1),opacity .6s ease;",
    "}",
    ".blog-alert-wrap.show{",
      "pointer-events:auto;opacity:1;transform:translateX(0);",
    "}",
    ".blog-alert-wrap.hide{",
      "pointer-events:none;opacity:0;transform:translateX(120%);",
      "transition:transform .45s ease-in,opacity .35s ease;",
    "}",

    /* card */
    ".blog-alert{",
      "width:300px;",
      "background:rgba(13,17,23,.92);",
      "border:1px solid rgba(76,175,80,.35);",
      "border-radius:10px;",
      "backdrop-filter:blur(16px) saturate(160%);",
      "-webkit-backdrop-filter:blur(16px) saturate(160%);",
      "box-shadow:0 0 20px rgba(76,175,80,.12),0 8px 32px rgba(0,0,0,.45);",
      "font-family:'JetBrains Mono',monospace;",
      "overflow:hidden;",
      "animation:alertPulse 3s ease-in-out infinite;",
    "}",

    /* glow pulse */
    "@keyframes alertPulse{",
      "0%,100%{box-shadow:0 0 20px rgba(76,175,80,.12),0 8px 32px rgba(0,0,0,.45);}",
      "50%{box-shadow:0 0 28px rgba(76,175,80,.25),0 8px 32px rgba(0,0,0,.45);}",
    "}",

    /* title bar */
    ".blog-alert-bar{",
      "display:flex;align-items:center;justify-content:space-between;",
      "padding:8px 12px;",
      "background:rgba(76,175,80,.10);",
      "border-bottom:1px solid rgba(76,175,80,.18);",
    "}",
    ".blog-alert-dots{display:flex;gap:6px;}",
    ".blog-alert-dots span{",
      "width:10px;height:10px;border-radius:50%;",
    "}",
    ".blog-alert-dots .r{background:#ff5f57;}",
    ".blog-alert-dots .y{background:#febc2e;}",
    ".blog-alert-dots .g{background:#28c840;}",
    ".blog-alert-bar-title{",
      "font-size:.7rem;color:#8b949e;letter-spacing:.5px;",
    "}",
    ".blog-alert-close{",
      "background:none;border:none;color:#8b949e;font-size:1rem;",
      "cursor:pointer;padding:0 2px;line-height:1;",
      "transition:color .2s;",
    "}",
    ".blog-alert-close:hover{color:#e6edf3;}",

    /* body */
    ".blog-alert-body{padding:14px 14px 12px;}",
    ".blog-alert-prompt{",
      "font-size:.75rem;color:#4caf50;margin-bottom:8px;",
    "}",
    ".blog-alert-prompt .cmd{color:#e6edf3;}",

    /* typing area */
    ".blog-alert-msg{",
      "font-size:.78rem;color:#8b949e;line-height:1.55;",
      "min-height:38px;margin-bottom:12px;",
    "}",
    ".blog-alert-msg .hl{color:#4caf50;}",

    /* cursor blink */
    ".ba-cursor{",
      "display:inline-block;width:7px;height:14px;",
      "background:#4caf50;vertical-align:text-bottom;",
      "animation:baCursorBlink 1s step-end infinite;",
    "}",
    "@keyframes baCursorBlink{0%,100%{opacity:1;}50%{opacity:0;}}",

    /* CTA button */
    ".blog-alert-btn{",
      "display:inline-block;padding:7px 16px;",
      "background:rgba(76,175,80,.15);",
      "border:1px solid rgba(76,175,80,.4);",
      "border-radius:6px;color:#4caf50;",
      "font-family:'JetBrains Mono',monospace;",
      "font-size:.75rem;text-decoration:none;",
      "transition:background .25s,border-color .25s,transform .2s;",
    "}",
    ".blog-alert-btn:hover{",
      "background:rgba(76,175,80,.25);",
      "border-color:rgba(76,175,80,.6);",
      "transform:translateY(-1px);",
    "}",

    /* responsive */
    "@media(max-width:480px){",
      ".blog-alert-wrap{right:12px;left:12px;bottom:80px;}",
      ".blog-alert{width:100%;}",
    "}"
  ].join("\n");

  var styleEl = document.createElement("style");
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* ---------- HTML ---------- */
  var wrap = document.createElement("div");
  wrap.className = "blog-alert-wrap";
  wrap.innerHTML = [
    '<div class="blog-alert">',
      '<div class="blog-alert-bar">',
        '<div class="blog-alert-dots">',
          '<span class="r"></span><span class="y"></span><span class="g"></span>',
        '</div>',
        '<span class="blog-alert-bar-title">notification</span>',
        '<button class="blog-alert-close" aria-label="Close">&times;</button>',
      '</div>',
      '<div class="blog-alert-body">',
        '<div class="blog-alert-prompt">',
          '<span class="cmd">$ cat new_posts.log</span>',
        '</div>',
        '<div class="blog-alert-msg">',
          '<span class="ba-cursor"></span>',
        '</div>',
        '<a href="https://blog.shakilahmed.tech" class="blog-alert-btn" style="opacity:0;transform:translateY(6px);transition:opacity .4s,transform .4s;">',
          '~/blog &rarr;',
        '</a>',
      '</div>',
    '</div>'
  ].join("");

  document.body.appendChild(wrap);

  /* ---------- elements ---------- */
  var closeBtn = wrap.querySelector(".blog-alert-close");
  var msgEl    = wrap.querySelector(".blog-alert-msg");
  var ctaBtn   = wrap.querySelector(".blog-alert-btn");

  /* ---------- dismiss ---------- */
  function dismiss() {
    wrap.classList.remove("show");
    wrap.classList.add("hide");
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  }
  closeBtn.addEventListener("click", dismiss);

  /* ---------- typing effect ---------- */
  var lines = [
    { text: "New blog posts available!", cls: "hl" },
    { text: " Check out articles on APIs, Git, Docker, Databases & more.", cls: "" }
  ];

  function typeLines(lineIdx, charIdx) {
    if (lineIdx >= lines.length) {
      /* remove cursor, show CTA */
      var cur = msgEl.querySelector(".ba-cursor");
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
      /* insert before cursor */
      var cursor = msgEl.querySelector(".ba-cursor");
      msgEl.insertBefore(span, cursor);
    }
    if (charIdx < line.text.length) {
      span.textContent += line.text[charIdx];
      setTimeout(function () { typeLines(lineIdx, charIdx + 1); }, 32);
    } else {
      setTimeout(function () { typeLines(lineIdx + 1, 0); }, 200);
    }
  }

  /* ---------- show ---------- */
  setTimeout(function () {
    wrap.classList.add("show");
    /* start typing after slide-in finishes */
    setTimeout(function () { typeLines(0, 0); }, 650);
  }, DELAY_MS);

  /* auto-dismiss after 15s if not interacted */
  setTimeout(function () {
    if (wrap.classList.contains("show") && !wrap.classList.contains("hide")) {
      dismiss();
    }
  }, DELAY_MS + 18000);
})();
