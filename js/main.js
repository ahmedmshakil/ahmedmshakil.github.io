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

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = 1;
            entry.target.style.transform = "translateY(0)";
          }
        });
      },
      { threshold: 0.1 },
    );

    skillCategories.forEach((category) => {
      category.style.opacity = 0;
      category.style.transform = "translateY(20px)";
      category.style.transition = "opacity 0.5s ease, transform 0.5s ease";
      observer.observe(category);
    });
  }

  function initializeContactForm() {
    emailjs.init("YJZu6V-1TBhEYFccE"); //currently on (Shakil)_Replace with YOUR_PUBLIC_KEY

    const contactForm = document.getElementById("contactForm");
    if (!contactForm) {
      return;
    }

    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const formValues = {
        from_name: document.getElementById("name").value,
        from_email: document.getElementById("email").value,
        subject: document.getElementById("subject").value,
        message: document.getElementById("message").value,
      };

      emailjs
        .send("service_tq5blnq", "template_8wmpcf9", formValues)
        .then(function (response) {
          console.log("Email sent successfully!", response);

          const successMessage = document.createElement("div");
          successMessage.className = "success-message";
          successMessage.textContent = "Thank you for your message! I will get back to you soon.";
          successMessage.style.color = "var(--terminal-green)";
          successMessage.style.padding = "15px";
          successMessage.style.marginTop = "15px";
          successMessage.style.backgroundColor = "rgba(76, 175, 80, 0.1)";
          successMessage.style.borderRadius = "4px";

          contactForm.appendChild(successMessage);
          contactForm.reset();

          setTimeout(() => {
            successMessage.remove();
          }, 5000);
        })
        .catch(function (error) {
          console.error("Email sending failed!", error);
          alert("Failed to send message. Please try again later.");
        });
    });
  }

  initializeIpInfo();
  initializeMobileNavigation();
  initializeSmoothScrolling();
  initializeTerminal();
  initializeSkillAnimation();
  initializeContactForm();
});
