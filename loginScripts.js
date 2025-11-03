const tg = window.Telegram.WebApp;
const obj = document.getElementById("TEST");

document.getElementById("loginbtn").addEventListener("click", async () => {
    console.log("pisun");
    tg.sendData(JSON.stringify({ action: "request_contact"}));
});