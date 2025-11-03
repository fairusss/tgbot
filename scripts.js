let progress = 0;
const bar = document.getElementById("loadbar");
const text = document.getElementById("loadtext")

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