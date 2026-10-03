/**
 * Main JavaScript for Shakil Ahmed's portfolio.
 * Theme: Software Engineer, Backend/DevOps Engineer
 */

document.addEventListener("DOMContentLoaded", function () {
  const IP_STORAGE_KEY = "ipinfo_data";
  const modalControllers = new Map();
  const TERMINAL_FRAMES = [
    {
      command: "whoami",
      output: "Software Engineer",
    },
    {
      command: "cat skills.txt",
      output: "AWS | Docker | Kubernetes | Terraform | Ansible | CI/CD | Python | JavaScript",
    },
    {
      command: "ls projects/",
      output: "Legal Consultation System — BLCS",
    },
    {
      command: "docker ps",
      output: "CONTAINER ID   IMAGE                  STATUS          PORTS",
    },
    {
      command: "kubectl get pods",
      output: "NAME                    READY   STATUS    RESTARTS   AGE",
    },
    {
      command: "terraform apply",
      output: "Apply complete! Resources: 12 added, 5 changed, 2 destroyed.",
    },
    {
      command: "git push origin main",
      output: "Everything up-to-date",
    },
  ];

  const IP_REPORT_FIELDS = [
    ["Hostname", "hostname"],
    ["City", "city"],
    ["Region", "region"],
    ["Country", "country"],
    ["Location", "loc"],
    ["Organization", "org"],
    ["Postal code", "postal"],
    ["Timezone", "timezone"],
  ];

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function isValidIP(ip) {
    const ipv4Pattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::$|^([0-9a-fA-F]{1,4}:){1,7}:$|^:(:([0-9a-fA-F]{1,4})){1,7}$|^([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}$|^([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}$|^([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}$|^([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}$|^([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}$|^[0-9a-fA-F]{1,4}:(:[0-9a-fA-F]{1,4}){1,6}$/;

    return ipv4Pattern.test(ip) || ipv6Pattern.test(ip);
  }

  function countryCodeToFlag(countryCode) {
    if (!countryCode || countryCode.length !== 2) {
      return "";
    }

    return String.fromCodePoint(
      ...countryCode
        .toUpperCase()
        .split("")
        .map((character) => 127397 + character.charCodeAt(0)),
    );
  }

  function renderIpReport(container, data) {
    if (!container) {
      return;
    }

    if (!data) {
      container.innerHTML = `
        <p class="ip-report__note">
          Your IP address hasn't been detected yet. Check your connection or any ad blocker, then try again.
        </p>
      `;
      return;
    }

    const items = IP_REPORT_FIELDS.map(([label, key]) => {
      const value = key === "country" ? `${countryCodeToFlag(data.country)} ${data.country || ""}`.trim() : data[key];

      return `
        <div class="ip-report__item">
          <dt>${label}</dt>
          <dd>${escapeHtml(value || "N/A")}</dd>
        </div>
      `;
    }).join("");

    container.innerHTML = `
      <section class="ip-report__spotlight">
        <span class="ip-report__kicker">Your IP Address</span>
        <div class="ip-report__ip">${escapeHtml(data.ip)}</div>
      </section>
      <dl class="ip-report__grid">${items}</dl>
      <pre class="ip-report__json">${escapeHtml(JSON.stringify(data, null, 2))}</pre>
    `;
  }

  // Fold typography down to the single-byte characters WinAnsiEncoding can show.
  function toPdfText(value) {
    return String(value ?? "")
      .replace(/[\u2013\u2014]/g, "-")
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201c\u201d]/g, '"')
      .replace(/[^\x20-\xff]/g, "");
  }

  // Helvetica and Arial share their metrics, so the canvas gives usable PDF text widths.
  function createPdfTextMeasurer() {
    const context = document.createElement("canvas").getContext("2d");
    const cssFonts = {
      F1: "{size}px Helvetica, Arial, sans-serif",
      F2: "bold {size}px Helvetica, Arial, sans-serif",
      F3: "{size}px 'Courier New', monospace",
    };
    const fallbackRatios = { F1: 0.5, F2: 0.55, F3: 0.6 };

    return (value, size, font) => {
      if (!context) {
        return value.length * size * fallbackRatios[font];
      }

      context.font = cssFonts[font].replace("{size}", size);
      return context.measureText(value).width;
    };
  }

  // Hand-written single page PDF so the report downloads without pulling in a PDF library.
  function createIpReportPdf(data) {
    const PAGE_WIDTH = 595.28;
    const PAGE_HEIGHT = 841.89;
    const MARGIN = 48;
    const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
    const INK = {
      text: "0.11 0.13 0.15",
      muted: "0.42 0.46 0.5",
      accent: "0.3 0.69 0.31",
      rule: "0.85 0.86 0.88",
    };

    const measure = createPdfTextMeasurer();
    const operations = [];

    const text = (value, { x, y, size = 10, font = "F1", color = INK.text, align = "left" }) => {
      const content = toPdfText(value);
      if (!content) return;

      const left = align === "right" ? x - measure(content, size, font) : x;
      const escaped = content.replace(/([\\()])/g, "\\$1");
      operations.push(`BT ${color} rg /${font} ${size} Tf 1 0 0 1 ${left.toFixed(2)} ${y.toFixed(2)} Tm (${escaped}) Tj ET`);
    };

    const rule = (y, { color = INK.rule, width = 0.8 } = {}) => {
      operations.push(`${color} RG ${width} w ${MARGIN} ${y} m ${PAGE_WIDTH - MARGIN} ${y} l S`);
    };

    const panel = (y, height) => {
      operations.push(
        `0.97 0.97 0.98 rg ${INK.rule} RG 0.6 w ${MARGIN} ${y.toFixed(2)} ${CONTENT_WIDTH} ${height.toFixed(2)} re B`,
      );
    };

    const truncate = (value, maxWidth, size, font) => {
      let content = toPdfText(value);
      if (measure(content, size, font) <= maxWidth) return content;

      while (content.length > 1 && measure(`${content}...`, size, font) > maxWidth) {
        content = content.slice(0, -1);
      }

      return `${content}...`;
    };

    text("Md Shakil Ahmed", { x: MARGIN, y: 790, size: 15, font: "F2" });
    text("IT, Network & DevOps Engineer \u00b7 shakilahmed.tech", { x: MARGIN, y: 774, size: 8.5, color: INK.muted });
    text("IP INFORMATION REPORT", {
      x: PAGE_WIDTH - MARGIN,
      y: 790,
      size: 10,
      font: "F2",
      color: INK.accent,
      align: "right",
    });
    text(new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }), {
      x: PAGE_WIDTH - MARGIN,
      y: 774,
      size: 8.5,
      color: INK.muted,
      align: "right",
    });
    rule(762, { color: INK.accent, width: 1.6 });

    text("DETECTED IP ADDRESS", { x: MARGIN, y: 726, size: 8, font: "F2", color: INK.muted });
    text(data.ip, { x: MARGIN, y: 694, size: 24, font: "F2" });
    rule(674);

    text("CONNECTION DETAILS", { x: MARGIN, y: 646, size: 8, font: "F2", color: INK.muted });

    const columnWidth = CONTENT_WIDTH / 2;
    IP_REPORT_FIELDS.forEach(([label, key], index) => {
      const x = MARGIN + (index % 2) * columnWidth;
      const y = 616 - Math.floor(index / 2) * 50;

      text(label.toUpperCase(), { x, y, size: 7.5, font: "F2", color: INK.muted });
      text(truncate(data[key] || "N/A", columnWidth - 18, 10.5, "F1"), { x, y: y - 16, size: 10.5 });
    });

    rule(428);
    text("RAW JSON", { x: MARGIN, y: 400, size: 8, font: "F2", color: INK.muted });

    // Tighten the leading if the payload is unusually long, so it still fits on one page.
    const jsonLines = JSON.stringify(data, null, 2).split("\n");
    const jsonTop = 386;
    const leading = Math.min(11, (jsonTop - 228) / jsonLines.length);
    panel(jsonTop - (jsonLines.length * leading + 18), jsonLines.length * leading + 18);

    jsonLines.forEach((line, index) => {
      const y = jsonTop - 14 - index * leading;
      text(truncate(line, CONTENT_WIDTH - 24, leading - 3, "F3"), {
        x: MARGIN + 12,
        y,
        size: leading - 3,
        font: "F3",
        color: INK.muted,
      });
    });

    text("ABOUT THIS REPORT", { x: MARGIN, y: 200, size: 8, font: "F2", color: INK.muted });
    text("Network details detected for this visitor's public IP at the time shown above.", {
      x: MARGIN,
      y: 184,
      size: 8.5,
      color: INK.muted,
    });
    text("Lookup data from ipinfo.io. Nothing from this report is stored on shakilahmed.tech.", {
      x: MARGIN,
      y: 172,
      size: 8.5,
      color: INK.muted,
    });

    rule(104);
    text("Report prepared by Md Shakil Ahmed", { x: MARGIN, y: 86, size: 9, font: "F2" });
    text("\u00a9 2026 Shakil Ahmed. All Rights Reserved. \u00b7 shakilahmed.tech", {
      x: MARGIN,
      y: 74,
      size: 8,
      color: INK.muted,
    });
    text("Data source: ipinfo.io", { x: PAGE_WIDTH - MARGIN, y: 86, size: 8, color: INK.muted, align: "right" });
    text("Page 1 of 1", { x: PAGE_WIDTH - MARGIN, y: 74, size: 8, color: INK.muted, align: "right" });

    const stream = operations.join("\n");
    const objects = [
      "<< /Type /Catalog /Pages 2 0 R >>",
      "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] ` +
        "/Resources << /Font << /F1 5 0 R /F2 6 0 R /F3 7 0 R >> >> /Contents 4 0 R >>",
      `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
      "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
      "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
      "<< /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >>",
      "<< /Title (IP Information Report) /Author (Md Shakil Ahmed) /Creator (shakilahmed.tech) >>",
    ];

    const bytes = [];
    const write = (value) => {
      for (let index = 0; index < value.length; index += 1) {
        bytes.push(value.charCodeAt(index) & 0xff);
      }
    };

    write("%PDF-1.4\n");
    const offsets = objects.map((body, index) => {
      const offset = bytes.length;
      write(`${index + 1} 0 obj\n${body}\nendobj\n`);
      return offset;
    });

    // The cross-reference table needs byte offsets, so every entry is padded to 20 bytes.
    const startXref = bytes.length;
    write(`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`);
    offsets.forEach((offset) => write(`${String(offset).padStart(10, "0")} 00000 n \n`));
    write(
      `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info ${objects.length} 0 R >>\n` +
        `startxref\n${startXref}\n%%EOF\n`,
    );

    return new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
  }

  function initializeIpInfo() {
    const userIpElement = document.getElementById("user-ip");
    const ipLinkElement = document.getElementById("ip-link");
    let ipInfoData = null;

    if (!userIpElement || !ipLinkElement) {
      return;
    }

    async function fetchIpInfo() {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const response = await fetch("https://ipinfo.io/json", {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        if (!data || !data.ip || !isValidIP(data.ip)) {
          throw new Error("Invalid IPinfo response");
        }

        ipInfoData = data;
        userIpElement.textContent = data.ip;
      } catch (error) {
        console.error("IPinfo fetch failed:", error);
        userIpElement.textContent = "Not detected";
        ipInfoData = null;
      }
    }

    async function copyIpJson(button) {
      const label = button.querySelector("span");

      try {
        await navigator.clipboard.writeText(JSON.stringify(ipInfoData, null, 2));
        if (label) label.textContent = "Copied";
      } catch (error) {
        console.error("Copying the IP report failed:", error);
        if (label) label.textContent = "Copy failed";
      }

      setTimeout(() => {
        if (label) label.textContent = "Copy JSON";
      }, 1800);
    }

    function downloadIpReport(button) {
      const label = button.querySelector("span");

      try {
        const url = URL.createObjectURL(createIpReportPdf(ipInfoData));
        const link = document.createElement("a");
        link.href = url;
        link.download = `ip-report-${ipInfoData.ip}.pdf`;
        // Some browsers only honour a programmatic click on an anchor in the document.
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        if (label) label.textContent = "Saved";
      } catch (error) {
        console.error("Building the IP report PDF failed:", error);
        if (label) label.textContent = "Failed";
      }

      setTimeout(() => {
        if (label) label.textContent = "Download";
      }, 1800);
    }

    fetchIpInfo();

    const ipModal = modalControllers.get("ip-modal");
    if (!ipModal) {
      return;
    }

    const report = document.querySelector("[data-ip-report]");
    const copyButton = document.querySelector("[data-ip-copy]");
    const downloadButton = document.querySelector("[data-ip-download]");

    // Fill the popup just before it opens so it always shows the latest lookup.
    ipModal.onBeforeOpen = () => {
      if (ipInfoData) {
        // The standalone /ipinfo report reads the lookup back from storage.
        localStorage.setItem(IP_STORAGE_KEY, JSON.stringify(ipInfoData));
      }

      renderIpReport(report, ipInfoData);
      if (copyButton) copyButton.hidden = !ipInfoData;
      if (downloadButton) downloadButton.hidden = !ipInfoData;
    };

    copyButton?.addEventListener("click", () => copyIpJson(copyButton));
    downloadButton?.addEventListener("click", () => downloadIpReport(downloadButton));
  }

  function initializeMobileNavigation() {
    const menuToggle = document.querySelector(".menu-toggle");
    const navMenu = document.querySelector(".nav-menu");

    if (!menuToggle || !navMenu) {
      return;
    }

    menuToggle.addEventListener("click", function () {
      menuToggle.classList.toggle("active");
      navMenu.classList.toggle("active");
      menuToggle.setAttribute("aria-expanded", String(navMenu.classList.contains("active")));

      const bars = document.querySelectorAll(".bar");
      if (menuToggle.classList.contains("active")) {
        bars[0].style.transform = "rotate(-45deg) translate(-5px, 6px)";
        bars[1].style.opacity = "0";
        bars[2].style.transform = "rotate(45deg) translate(-5px, -6px)";
      } else {
        bars[0].style.transform = "none";
        bars[1].style.opacity = "1";
        bars[2].style.transform = "none";
      }
    });

    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", function () {
        if (navMenu.classList.contains("active")) {
          menuToggle.click();
        }
      });
    });
  }

  function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      // Links that open a popup keep their hash only as a no-JS fallback.
      if (anchor.hasAttribute("data-modal-open")) {
        return;
      }

      anchor.addEventListener("click", function (event) {
        const targetId = this.getAttribute("href");

        if (!targetId || targetId === "#") {
          event.preventDefault();
          return;
        }

        const targetElement = document.querySelector(targetId);
        if (!targetElement) {
          event.preventDefault();
          return;
        }

        event.preventDefault();
        window.scrollTo({
          top: targetElement.offsetTop - 70,
          behavior: "smooth",
        });
      });
    });
  }

  function renderTerminalFrame(terminalBody, frame) {
    terminalBody.innerHTML = `
      <div class="line">
        <span class="prompt">$</span>
        <span class="command">${frame.command}</span>
      </div>
      <div class="line">
        <span class="output">${frame.output}</span>
      </div>
      <div class="line">
        <span class="prompt">$</span>
        <span class="cursor"></span>
      </div>
    `;
  }

  function initializeTerminal() {
    const terminalBody = document.querySelector(".terminal-body");

    if (!terminalBody) {
      return;
    }

    let currentIndex = 0;
    renderTerminalFrame(terminalBody, TERMINAL_FRAMES[currentIndex]);

    setInterval(function () {
      currentIndex = (currentIndex + 1) % TERMINAL_FRAMES.length;
      renderTerminalFrame(terminalBody, TERMINAL_FRAMES[currentIndex]);
    }, 3000);
  }

  function initializeSkillAnimation() {
    const skillCategories = document.querySelectorAll(".skill-category");

    if (!skillCategories.length || typeof IntersectionObserver === "undefined") {
      return;
    }

    // Fade cards in with a class (not inline styles) so the CSS hover lift keeps working.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("skill-hidden");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );

    skillCategories.forEach((category) => {
      category.classList.add("skill-hidden");
      observer.observe(category);
    });
  }

  /* EmailJS contact form (disabled: visitors email info@shakilahmed.tech directly)
  function initializeContactForm() {
    const EMAILJS_PUBLIC_KEY = "";
    const EMAILJS_SERVICE_ID = "";
    const EMAILJS_TEMPLATE_ID = "";

    const contactForm = document.getElementById("contactForm");
    if (!contactForm) {
      return;
    }

    const submitButton = contactForm.querySelector('button[type="submit"]');
    const statusElement = contactForm.querySelector(".form-status");
    const honeypot = contactForm.querySelector(".form-honeypot");
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // The EmailJS script comes from a CDN; an ad blocker can stop it loading.
    const emailjsReady = typeof emailjs !== "undefined";
    if (emailjsReady) {
      emailjs.init(EMAILJS_PUBLIC_KEY);
    }

    function setStatus(message, type) {
      if (!statusElement) return;
      statusElement.textContent = message;
      statusElement.className = `form-status${type ? ` form-status--${type}` : ""}`;
    }

    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const email = document.getElementById("email").value.trim();
      const subject = document.getElementById("subject").value.trim();
      const message = document.getElementById("message").value.trim();

      if (honeypot && honeypot.value) {
        return;
      }

      if (!emailPattern.test(email)) {
        setStatus("Please enter a valid email address.", "error");
        document.getElementById("email").focus();
        return;
      }

      if (!subject || !message) {
        setStatus("Please fill in the subject and message.", "error");
        return;
      }

      if (!emailjsReady) {
        setStatus("Couldn't load the mail service. Please email me directly at ahmedmshakil1@gmail.com.", "error");
        return;
      }

      // These names must match the {{variables}} used in the EmailJS template.
      const templateParams = {
        from_email: email,
        reply_to: email,
        subject: subject,
        message: message,
      };

      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
      setStatus("", "");

      emailjs
        .send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
        .then(function () {
          contactForm.reset();
          setStatus("Thanks for your message! I'll get back to you soon.", "success");
        })
        .catch(function (error) {
          console.error("Email sending failed!", error);
          setStatus("Sorry, the message couldn't be sent. Please try again or email me directly at ahmedmshakil1@gmail.com.", "error");
        })
        .finally(function () {
          submitButton.disabled = false;
          submitButton.textContent = "Send Message";
        });
    });
  }
  */

  // Duplicate the logo set at runtime for a seamless marquee loop.
  // Keeping only one set in the HTML avoids duplicate images for crawlers.
  function initializeToolMarquee() {
    const track = document.querySelector(".tool-track");
    const set = track && track.querySelector(".tool-set");
    if (!set) return;
    const clone = set.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    clone.querySelectorAll("img").forEach((img) => img.setAttribute("alt", ""));
    track.appendChild(clone);
    track.classList.add("is-looping");
  }

  // Swap to the bundled icon if an external brand logo fails to load.
  function initializeToolLogoFallback() {
    document.querySelectorAll("img[data-fallback]").forEach((img) => {
      const useFallback = () => {
        const fallback = img.dataset.fallback;
        if (!fallback || img.dataset.fallbackUsed === "true") return;
        img.dataset.fallbackUsed = "true";
        img.src = fallback;
      };
      img.addEventListener("error", useFallback);
      // The image may have already failed before this script ran.
      if (img.complete && img.naturalWidth === 0) useFallback();
    });
  }

  // Tighten the floating header once the page scrolls.
  function initializeNavScroll() {
    const navWrap = document.querySelector("[data-nav]");
    if (!navWrap) return;
    let ticking = false;
    const update = () => {
      ticking = false;
      navWrap.classList.toggle("scrolled", window.scrollY > 32);
    };
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(update);
        }
      },
      { passive: true }
    );
    update();
  }

  // Popup shell shared by the resume viewer, the "Let's talk" card and the IP report.
  function createModalController(modal) {
    const frame = modal.querySelector("[data-modal-frame]");
    const closeButtons = modal.querySelectorAll("[data-modal-close]");
    const panel = modal.querySelector(".site-modal__panel");
    let lastFocused = null;

    const controller = {
      // Consumers can set this to fill the popup right before it appears.
      onBeforeOpen: null,

      open() {
        if (typeof controller.onBeforeOpen === "function") {
          controller.onBeforeOpen();
        }
        lastFocused = document.activeElement;
        // Load an embedded document only the first time the popup is opened.
        if (frame && !frame.getAttribute("src")) {
          frame.setAttribute("src", frame.dataset.src);
        }
        modal.hidden = false;
        document.body.classList.add("modal-open");
        // Flush the style change so the fade-in transition runs from its start value.
        void modal.offsetWidth;
        modal.classList.add("is-open");
        modal.querySelector(".site-modal__close")?.focus();
      },

      close() {
        if (modal.hidden) return;
        modal.classList.remove("is-open");
        document.body.classList.remove("modal-open");
        setTimeout(() => {
          modal.hidden = true;
        }, 200);
        lastFocused?.focus();
      },
    };

    closeButtons.forEach((button) => button.addEventListener("click", controller.close));

    document.addEventListener("keydown", (event) => {
      if (modal.hidden) return;
      if (event.key === "Escape") {
        controller.close();
        return;
      }
      // Keep keyboard focus inside the popup.
      if (event.key === "Tab" && panel) {
        const focusable = [...panel.querySelectorAll("a[href], button:not([disabled]), iframe")].filter(
          (element) => !element.hidden,
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });

    return controller;
  }

  function initializeModals() {
    document.querySelectorAll(".site-modal").forEach((modal) => {
      modalControllers.set(modal.id, createModalController(modal));
    });

    document.querySelectorAll("[data-modal-open]").forEach((trigger) => {
      const controller = modalControllers.get(trigger.dataset.modalOpen);
      // Without the popup markup the trigger stays a plain link.
      if (!controller) return;

      trigger.addEventListener("click", (event) => {
        event.preventDefault();
        controller.open();
      });
    });
  }

  initializeModals();
  initializeIpInfo();
  initializeNavScroll();
  initializeToolMarquee();
  initializeToolLogoFallback();
  initializeMobileNavigation();
  initializeSmoothScrolling();
  initializeTerminal();
  initializeSkillAnimation();
  // initializeContactForm(); // EmailJS disabled
});
