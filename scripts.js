let progress = 0;
const bar = document.getElementById("loadbar");

const interval = setInterval(() => {
  console.log(progress)
  progress += 0.5;
  bar.style.width = progress + "px";

  if (progress >= 100) {
    clearInterval(interval);
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1000);
  }
}, 10);
