document.addEventListener('DOMContentLoaded', () => {
    const tg = window.Telegram.WebApp;

    let progress = 0;
    const text = document.getElementById('loadtext');
    const bar = document.getElementById('loadbar');

    tg.expand();

    const interval = setInterval(() => {
        const opacity = getComputedStyle(text).opacity;
        if (opacity == 1) {
            progress += 1;
            bar.style.width = progress + '%';

            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    window.location.href = '/login';
                }, 500);
            }
        }
    }, 10);
});
