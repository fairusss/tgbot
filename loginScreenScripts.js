document.addEventListener("DOMContentLoaded", () => {
    const tg = window.Telegram.WebApp;
    const confirmBtn = document.getElementById("confirm-btn");

    confirmBtn.addEventListener("click", () => {
        const passcode = document.getElementById("passcode").value.trim();
        const user_id = tg.initDataUnsafe?.user?.id;

        if (!passcode) {
            tg.showAlert("Будь ласка, введіть код!");
            return;
        }

        fetch("https://tgbot-6lgc.onrender.com", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ passcode: passcode, user_id: user_id })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                tg.showAlert("✅ Код успішно надіслано!");
            } else {
                tg.showAlert("❌ Помилка при надсиланні коду.");
            }
        })
        .catch(err => {
            console.error("Error:", err);
            tg.showAlert("⚠️ Не вдалося надіслати код.");
        });
    });
});
