/**
 * Dedicated JavaScript for the IP information report page.
 * Keeps routing and rendering logic self-contained inside the ipinfo folder.
 */

(() => {
  "use strict";

  const STORAGE_KEY = "ipinfo_data";
  const contentElement = document.getElementById("content");
  const currentDateElement = document.getElementById("current-date");
  let rawJsonContent = "";

  function redirectToCleanRoute() {
    const { pathname, search, hash } = window.location;
    if (!pathname.endsWith("/index.html")) {
      return false;
    }

    const cleanPath = pathname.replace(/\/index\.html$/, "") || "/";
    window.location.replace(`${cleanPath}${search}${hash}`);
    return true;
  }

  if (redirectToCleanRoute()) {
    return;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function setCurrentDate() {
    if (!currentDateElement) {
      return;
    }

    currentDateElement.textContent = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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

  function getStoredIpData() {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) {
      return { data: null, reason: "empty" };
    }

    try {
      return { data: JSON.parse(storedData), reason: null };
    } catch (error) {
      console.error("Failed to parse stored IP data:", error);
      return { data: null, reason: "invalid" };
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

  function renderMessage({ badge, title, message, isError = false }) {
    if (!contentElement) {
      return;
    }

    contentElement.innerHTML = `
      <section class="message-card card">
        <span class="message-badge${isError ? " is-error" : ""}">${escapeHtml(badge)}</span>
        <h2>${escapeHtml(title)}</h2>
        <p>${escapeHtml(message)}</p>
        <div class="message-actions">
          <a class="btn btn-primary" href="../">Go Home</a>
        </div>
      </section>
    `;
  }

  function renderReport(data) {
    if (!contentElement) {
      return;
    }

    const countryFlag = countryCodeToFlag(data.country);
    rawJsonContent = JSON.stringify(data, null, 2);

    contentElement.innerHTML = `
      <div class="left-panel">
        <section class="ip-spotlight card">
          <span class="eyebrow">Network Snapshot</span>
          <h2>Your IP Address</h2>
          <div class="ip-value">${escapeHtml(data.ip || "N/A")}</div>
        </section>

        <section class="details-card card">
          <div class="section-heading">
            <span class="section-kicker">Connection Details</span>
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
        </section>
      </div>

      <div class="right-panel">
        <section class="json-section card">
          <div class="json-header">
            <div class="json-heading">
              <span class="section-kicker">Structured Output</span>
              <h3>Raw JSON</h3>
              <p>Copy the payload or keep it as a clean technical report view.</p>
            </div>

            <button class="btn btn-secondary copy-btn" data-copy-json>
              📋 Copy JSON
            </button>
          </div>

          <div class="json-panel">
            <pre id="json-content">${escapeHtml(rawJsonContent)}</pre>
          </div>
        </section>

        <section class="actions-card card">
          <div class="section-heading section-heading-compact">
            <span class="section-kicker">Actions</span>
            <h3>Report controls</h3>
            <p>Save the current report or close this preview window.</p>
          </div>

          <div class="action-row">
            <button class="btn btn-primary" data-print-report>
              📄 Download Report
            </button>
            <button class="btn btn-secondary" data-close-report>
              ✕ Close
            </button>
          </div>
        </section>
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

      copyButton.textContent = "✓ Copied";
      copyButton.classList.add("copied");
    } catch (error) {
      console.error("Failed to copy JSON:", error);
      copyButton.textContent = "✗ Failed";
    }

    window.setTimeout(() => {
      if (!copyButton.isConnected) {
        return;
      }

      copyButton.textContent = "📋 Copy JSON";
      copyButton.classList.remove("copied");
    }, 1800);
  }

  function bindActionButtons() {
    const printButton = document.querySelector("[data-print-report]");
    const closeButton = document.querySelector("[data-close-report]");
    const copyButton = document.querySelector("[data-copy-json]");

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

  function initializePage() {
    setCurrentDate();

    const storedIpData = getStoredIpData();
    if (!storedIpData.data && storedIpData.reason === "invalid") {
      renderMessage({
        badge: "Report Error",
        title: "Unable to read saved report",
        message: "The stored IP data looks corrupted. Please go back to the homepage and generate the report again.",
        isError: true,
      });
      return;
    }

    if (!storedIpData.data) {
      renderMessage({
        badge: "No Saved Report",
        title: "No IP data found",
        message: "Open the homepage, click your detected IP address, and this report will be generated automatically.",
      });
      return;
    }

    renderReport(storedIpData.data);
  }

  initializePage();
})();