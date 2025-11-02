const tg = window.Telegram.WebApp;
const obj = document.getElementById("TEST");

tg.expand();

document.getElementById("loginbtn").addEventListener("click", () => {
  try {
    // :fire: Новий офіційний метод — викликає popup Telegram
    obj.textContent = "TEST";
    const contact = tg.requestContact();

    if (contact && contact.phone_number) {
      tg.sendData(contact.phone_number); // надсилаємо номер назад у бот
    } else {
      console.warn("Користувач скасував або не надав номер");
    }
  } catch (e) {
    console.error("Помилка при запиті номера:", e);
  }
});