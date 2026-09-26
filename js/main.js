/**
 * Main JavaScript for Shakil Ahmed's portfolio.
 * Theme: Software Engineer, Backend/DevOps Engineer
 */

document.addEventListener("DOMContentLoaded", function () {
  const IP_STORAGE_KEY = "ipinfo_data";
  const IP_INFO_PAGE_URL = "ipinfo";
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

  function isValidIP(ip) {
    const ipv4Pattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::$|^([0-9a-fA-F]{1,4}:){1,7}:$|^:(:([0-9a-fA-F]{1,4})){1,7}$|^([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}$|^([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}$|^([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}$|^([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}$|^([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}$|^[0-9a-fA-F]{1,4}:(:[0-9a-fA-F]{1,4}){1,6}$/;

    return ipv4Pattern.test(ip) || ipv6Pattern.test(ip);
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

    ipLinkElement.addEventListener("click", function (event) {
      event.preventDefault();

      if (!ipInfoData) {
        alert("IP information not loaded yet. Please wait a moment.");
        return;
      }

      localStorage.setItem(IP_STORAGE_KEY, JSON.stringify(ipInfoData));

      const ipInfoWindow = window.open(IP_INFO_PAGE_URL, "_blank", "noopener");
      if (ipInfoWindow) {
        ipInfoWindow.opener = null;
      }
    });

    fetchIpInfo();
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

  // Resume viewer popup: opens the PDF in a modal with open/download actions.
  function initializeResumeModal() {
    const modal = document.getElementById("resume-modal");
    const triggers = document.querySelectorAll("[data-resume-open]");
    if (!modal || !triggers.length) return;

    const frame = modal.querySelector("[data-resume-frame]");
    const closeButtons = modal.querySelectorAll("[data-resume-close]");
    const panel = modal.querySelector(".resume-modal__panel");
    let lastFocused = null;

    const open = (event) => {
      event.preventDefault();
      lastFocused = document.activeElement;
      // Load the PDF only the first time the viewer is opened.
      if (frame && !frame.getAttribute("src")) {
        frame.setAttribute("src", frame.dataset.src);
      }
      modal.hidden = false;
      document.body.classList.add("modal-open");
      requestAnimationFrame(() => modal.classList.add("is-open"));
      modal.querySelector(".resume-modal__close")?.focus();
    };

    const close = () => {
      if (modal.hidden) return;
      modal.classList.remove("is-open");
      document.body.classList.remove("modal-open");
      setTimeout(() => {
        modal.hidden = true;
      }, 200);
      lastFocused?.focus();
    };

    triggers.forEach((trigger) => trigger.addEventListener("click", open));
    closeButtons.forEach((button) => button.addEventListener("click", close));

    document.addEventListener("keydown", (event) => {
      if (modal.hidden) return;
      if (event.key === "Escape") {
        close();
        return;
      }
      // Keep keyboard focus inside the popup.
      if (event.key === "Tab" && panel) {
        const focusable = panel.querySelectorAll("a[href], button:not([disabled]), iframe");
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
  }

  initializeIpInfo();
  initializeNavScroll();
  initializeResumeModal();
  initializeToolMarquee();
  initializeToolLogoFallback();
  initializeMobileNavigation();
  initializeSmoothScrolling();
  initializeTerminal();
  initializeSkillAnimation();
  // initializeContactForm(); // EmailJS disabled
});
