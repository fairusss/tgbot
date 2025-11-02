const tg = window.Telegram.WebApp;
    tg.expand();

    document.getElementById("sharePhone").addEventListener("click", async () => {
      try {
        const result = await tg.requestPhoneNumber();
        if (result && result.phone_number) {
          // Надсилаємо номер назад у бот
          tg.sendData(result.phone_number);
          alert(":white_check_mark: Номер надіслано боту!");
        }
      } catch (err) {
        console.error("Помилка при запиті номера:", err);
        alert(":warning: Помилка або користувач скасував дію.");
      }
    });