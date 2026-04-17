/**
 * Dedicated JavaScript for the IP information report page.
 * Keeps report rendering logic out of the HTML file.
 */

(() => {
  "use strict";

  const STORAGE_KEY = "ipinfo_data";
  const HOME_PAGE_URL = "../index.html";
  const contentElement = document.getElementById("content");
  const currentDateElement = document.getElementById("current-date");
  const footerTextElement = document.getElementById("footer-text");

  let rawJsonContent = "";

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function countryCodeToFlag(countryCode) {
    if (!countryCode || countryCode.length !== 2) {
      return "🌐";
    }

    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((character) => 127397 + character.charCodeAt(0));

    return String.fromCodePoint(...codePoints);
  }

  function setPageMetadata() {
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    if (currentDateElement) {
      currentDateElement.textContent = currentDate;
    }

    if (footerTextElement) {
      footerTextElement.textContent = `© ${new Date().getFullYear()} Shakil Ahmed - All Rights Reserved`;
    }
  }

  function readStoredIpData() {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      return storedData ? JSON.parse(storedData) : null;
    } catch (error) {
      console.error("Failed to read stored IP data:", error);
      return null;
    }
  }

  function createInfoCard(label, value) {
    return `
      <div class="info-card">
        <label>${escapeHtml(label)}</label>
        <div class="value">${escapeHtml(value || "N/A")}</div>
      </div>
    `;
  }

  function renderMessage(title, message, options = {}) {
    if (!contentElement) {
      return;
    }

    const tone = options.tone === "error" ? "#f44336" : "#4caf50";
    const showHomeButton = Boolean(options.showHomeButton);

    contentElement.innerHTML = `
      <div class="error-message">
        <h2 style="color: ${tone}; margin-bottom: 10px;">${escapeHtml(title)}</h2>
        <p>${escapeHtml(message)}</p>
        ${
          showHomeButton
            ? '<button class="btn btn-primary" data-go-home>Go to Homepage</button>'
            : ""
        }
      </div>
    `;

    bindActionButtons();
  }

  function renderReport(data) {
    if (!contentElement) {
      return;
    }

    const countryFlag = countryCodeToFlag(data.country);
    rawJsonContent = JSON.stringify(data, null, 2);

    contentElement.innerHTML = `
      <div class="left-panel">
        <div class="ip-card">
          <h3>YOUR IP ADDRESS</h3>
          <div class="ip-value">${escapeHtml(data.ip || "N/A")}</div>
        </div>

        <div class="info-grid">
          ${createInfoCard("Hostname", data.hostname)}
          ${createInfoCard("City", data.city)}
          ${createInfoCard("Region", data.region)}
          <div class="info-card">
            <label>Country</label>
            <div class="value country-value">
              <span class="country-flag">${countryFlag}</span>
              <span>${escapeHtml(data.country || "N/A")}</span>
            </div>
          </div>
          ${createInfoCard("Location", data.loc)}
          ${createInfoCard("Organization", data.org)}
          ${createInfoCard("Postal Code", data.postal)}
          ${createInfoCard("Timezone", data.timezone)}
        </div>

        <div class="actions">
          <button class="btn btn-primary" data-print-report>
            📄 Download PDF
          </button>
          <button class="btn btn-secondary" data-close-report>
            ✕ Close
          </button>
        </div>
      </div>

      <div class="right-panel">
        <div class="json-section">
          <div class="json-header">
            <h4>RAW JSON DATA</h4>
            <button class="copy-btn" data-copy-json>
              📋 Copy
            </button>
          </div>
          <pre id="json-content">${escapeHtml(rawJsonContent)}</pre>
        </div>
      </div>
    `;

    bindActionButtons();
  }

  async function copyToClipboard() {
    const copyButton = document.querySelector("[data-copy-json]");
    if (!copyButton || !rawJsonContent) {
      return;
    }

    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        await navigator.clipboard.writeText(rawJsonContent);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = rawJsonContent;
        textArea.setAttribute("readonly", "readonly");
        textArea.style.position = "absolute";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
      }

      copyButton.textContent = "✓ Copied!";
      copyButton.classList.add("copied");
    } catch (error) {
      console.error("Failed to copy:", error);
      copyButton.textContent = "✗ Failed";
    }

    window.setTimeout(() => {
      if (!copyButton.isConnected) {
        return;
      }

      copyButton.textContent = "📋 Copy";
      copyButton.classList.remove("copied");
    }, 2000);
  }

  function bindActionButtons() {
    const goHomeButton = document.querySelector("[data-go-home]");
    const printButton = document.querySelector("[data-print-report]");
    const closeButton = document.querySelector("[data-close-report]");
    const copyButton = document.querySelector("[data-copy-json]");

    if (goHomeButton) {
      goHomeButton.addEventListener("click", () => {
        window.location.href = HOME_PAGE_URL;
      });
    }

    if (printButton) {
      printButton.addEventListener("click", () => {
        window.print();
      });
    }

    if (closeButton) {
      closeButton.addEventListener("click", () => {
        window.close();
      });
    }

    if (copyButton) {
      copyButton.addEventListener("click", copyToClipboard);
    }
  }

  setPageMetadata();

  const storedIpData = readStoredIpData();
  if (!storedIpData) {
    renderMessage("No IP Data Found", "Please go back to the homepage and click on your IP address.", {
      showHomeButton: true,
    });
    return;
  }

  renderReport(storedIpData);
})();