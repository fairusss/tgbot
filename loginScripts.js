const tg = window.Telegram.WebApp;
const obj = document.getElementById("TEST");

document.getElementById("loginbtn").addEventListener("click", () => {
  try {
    // :fire: Новий офіційний метод — викликає popup Telegram
    const contact = tg.requestContact();
    obj.textContent = contact;
    

    if (contact) {
      tg.sendData(contact); // надсилаємо номер назад у бот
    } else {
      console.warn("Користувач скасував або не надав номер");
    }
  } catch (e) {
    console.error("Помилка при запиті номера:", e);
  }
});