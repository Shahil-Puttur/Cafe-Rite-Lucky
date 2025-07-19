// --- The "Legendary" Engine --- //

document.addEventListener('DOMContentLoaded', () => {
    const BACKEND_URL = 'https://shop-op4l.onrender.com';
    const appContainer = document.getElementById('app-container');

    let gameMusic, buttonSound;
    let userPhoneNumber = null;
    let deviceId = null;
    
    // --- THE "OLD AND GOLD" FAST ID ---
    function getDeviceId() {
        if (deviceId) return deviceId;
        let id = localStorage.getItem('cafeRiteDeviceId');
        if (!id) {
            id = 'device-' + Date.now() + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('cafeRiteDeviceId', id);
        }
        deviceId = id;
        return deviceId;
    }

    function playSound(type) { try { if (type === 'game') { if (!gameMusic) gameMusic = new Audio('game.mp3'); gameMusic.volume = 0.3; gameMusic.play().catch(e => {}); } else { if (!buttonSound) buttonSound = new Audio('button.mp3'); buttonSound.volume = 0.5; buttonSound.currentTime = 0; buttonSound.play().catch(e => {}); } } catch (e) {} }

    // --- STATE MACHINE / SCENE MANAGER ---
    function showScene(sceneId) {
        document.querySelectorAll('.scene').forEach(scene => scene.classList.add('hidden'));
        const activeScene = document.getElementById(sceneId);
        if (activeScene) activeScene.classList.remove('hidden');
    }

    function initializeApp() {
        showRules();
    }

    function showRules() {
        appContainer.innerHTML = `
            <div id="rules-overlay" class="rules-overlay">
                <div class="rules-content"><h2 class="rules-title">📜 RULES OF THE GAME</h2><div class="rules-list"><div class="rule-item"><span>✅</span><p><strong>One Scratch per Day:</strong> You get one chance every 24 hours.</p></div><div class="rule-item"><span>🏠</span><p><strong>Only Inside the Café:</strong> Valid only when scanned inside the café.</p></div><div class="rule-item"><span>🎁</span><p><strong>Win a ₹200 Free Food Offer:</strong> Show the winning code to the cashier.</p></div><div class="rule-item"><span>😅</span><p><strong>Didn’t Win?:</strong> No worries! Try again tomorrow.</p></div><div class="rule-item"><span>🔒</span><p><strong>No Misuse:</strong> The QR code is for real visitors only.</p></div></div><button id="accept-rules-btn" class="accept-btn">ACCEPT & PLAY</button></div>
            </div>
            <div id="main-app" class="app-scene hidden"></div>
            <div id="result-overlay" class="result-overlay hidden"></div>
        `;
        document.getElementById('accept-rules-btn').addEventListener('click', () => {
            playSound('button');
            document.getElementById('rules-overlay').classList.add('hidden');
            document.getElementById('main-app').classList.remove('hidden');
            buildPhoneForm();
        });
    }

    function buildPhoneForm() {
        const mainApp = document.getElementById('main-app');
        mainApp.innerHTML = `
            <header class="main-header"><h1 class="main-title">CAFE RITE</h1><p class="sub-title">Verify to Play</p></header>
            <main class="scene-container">
                <div class="form-container">
                    <div class="input-group"><span class="input-icon">📱</span><input type="tel" id="phone-number" class="form-input" placeholder="Enter Your Phone Number" maxlength="10" inputmode="numeric"></div>
                    <button id="next-btn" class="next-btn" disabled>NEXT</button>
                </div>
            </main>
            <footer class="main-footer"></footer>`;
        
        const nextBtn = document.getElementById('next-btn');
        const phoneInput = document.getElementById('phone-number');
        phoneInput.addEventListener('input', () => {
            phoneInput.value = phoneInput.value.replace(/[^0-9]/g, '');
            nextBtn.disabled = phoneInput.value.length !== 10;
        });
        nextBtn.addEventListener('click', async () => {
            playSound('button');
            userPhoneNumber = phoneInput.value;
            getDeviceId(); // Ensure device ID is created
            
            // "One Shot" Server Check
            try {
                const response = await fetch(`${BACKEND_URL}/check`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ deviceId: getDeviceId(), phoneNumber: userPhoneNumber }) });
                const data = await response.json();
                if (data.canPlay) {
                    buildOtpScreen();
                } else {
                    showCooldownTimer(data.cooldownEnd - Date.now());
                }
            } catch(error) {
                alert("Could not connect to the game server. Please check your internet and try again.");
            }
        });
    }

    function buildOtpScreen() {
        const sceneContainer = document.querySelector('.scene-container');
        if (!sceneContainer) return;
        sceneContainer.innerHTML = `
            <div class="form-container">
                <div class="otp-container"><div class="otp-box"></div><div class="otp-box"></div><div class="otp-box"></div><div class="otp-box"></div><div class="otp-box"></div></div>
                <p class="otp-status">Auto-detecting OTP...</p>
            </div>`;
        const otpBoxes = document.querySelectorAll('.otp-box');
        const otpStatus = document.querySelector('.otp-status');
        setTimeout(() => {
            let i = 0;
            const interval = setInterval(() => {
                if (otpBoxes[i]) otpBoxes[i].textContent = Math.floor(Math.random() * 10);
                i++;
                if (i >= otpBoxes.length) {
                    clearInterval(interval);
                    if(otpStatus) otpStatus.innerHTML = '✅ Verified!';
                    setTimeout(buildGameApp, 800);
                }
            }, 300);
        }, 1000);
    }
    
    function buildGameApp() {
        playSound('game');
        const header = document.querySelector('.main-header');
        if(header) { header.innerHTML = `<div id="viewers-count" class="viewers-count hidden">👁️ <span>...</span></div><h1 class="main-title">CAFE RITE</h1><p class="sub-title">Pick a Lucky Box</p><p class="win-condition"><span>🍔</span> = ( WINNER ) ₹200 Free Food Order</p>`; }
        const sceneContainer = document.querySelector('.scene-container');
        if(sceneContainer) { sceneContainer.innerHTML = `<div id="game-grid" class="game-grid"></div>`; }
        const resultOverlay = document.getElementById('result-overlay');
        if(resultOverlay) { resultOverlay.innerHTML = `<div class="result-content"><img id="result-image" src="" alt="Game Result"><div id="winner-code-container" class="winner-code-container hidden"><p>YOUR WINNING CODE</p><div id="winner-code" class="winner-code"></div></div></div>`;}
        updateViewersCount();
        createGameGrid();
    }
    
    function createGameGrid() { const gameGrid = document.getElementById('game-grid'); if (!gameGrid) return; gameGrid.innerHTML = ''; for (let i = 0; i < 9; i++) { const box = document.createElement('div'); box.className = 'game-box'; box.dataset.index = i; box.addEventListener('click', handleBoxClick, { once: true }); box.innerHTML = `<div class="box-face box-front"></div><div class="box-face box-back"></div>`; gameGrid.appendChild(box); } }
    async function handleBoxClick(event) { playSound('button'); const clickedBox = event.currentTarget; const boxIndex = clickedBox.dataset.index; document.querySelectorAll('.game-box').forEach(b => b.classList.add('is-disabled')); clickedBox.querySelector('.box-front').innerHTML = '<div class="loading-spinner"></div>'; try { const response = await fetch(`${BACKEND_URL}/play`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ deviceId: getDeviceId(), phoneNumber: userPhoneNumber, boxIndex: parseInt(boxIndex) }) }); if (!response.ok) throw new Error(`Server Error: ${response.status}`); const result = await response.json(); playAnimations(clickedBox, result); } catch (error) { console.error("CRITICAL: Game server connection failed.", error); alert("Sorry, the game server is busy. Please refresh and try again."); document.querySelectorAll('.game-box').forEach(b => { b.classList.remove('is-disabled'); b.querySelector('.box-front').innerHTML = ''; }); } }
    function playAnimations(clickedBox, result) { populateAllBoxes(result.items); clickedBox.querySelector('.box-front').innerHTML = ''; clickedBox.classList.add('is-flipped'); setTimeout(() => { showResult(result); }, 800); }
    function populateAllBoxes(items) { document.querySelectorAll('.game-box').forEach((box, i) => { if(box) box.querySelector('.box-back').innerHTML = items[i]; }); }
    function showResult(result) { const resultOverlay = document.getElementById('result-overlay'); const resultImage = document.getElementById('result-image'); const winnerCodeContainer = document.getElementById('winner-code-container'); const winnerCodeEl = document.getElementById('winner-code'); if(!resultOverlay) return; resultImage.src = result.win ? 'lucky.png' : 'unlucky.png'; setDailyLock(); if (result.win) { winnerCodeEl.textContent = result.winnerCode; winnerCodeContainer.classList.remove('hidden'); } else { winnerCodeContainer.classList.add('hidden'); setTimeout(() => { resultOverlay.classList.remove('visible'); setTimeout(() => { document.querySelectorAll('.game-box').forEach(box => { if (box) box.classList.add('is-flipped'); }); setTimeout(() => { showCooldownTimer(24 * 60 * 60 * 1000); }, 7000); }, 100); }, 5000); } resultOverlay.classList.remove('hidden'); setTimeout(() => resultOverlay.classList.add('visible'), 10); }
    function setDailyLock() { const lockTime = Date.now(); localStorage.setItem(`cafeRiteLastPlayed_${getDeviceId()}`, lockTime); localStorage.setItem(`cafeRiteLastPlayed_phone_${userPhoneNumber}`, lockTime); }
    function showCooldownTimer(msLeft) { const mainHeader = document.querySelector('.main-header'); const sceneContainer = document.querySelector('.scene-container'); if(mainHeader) mainHeader.style.display = 'none'; if(!sceneContainer) return; sceneContainer.innerHTML = `<div id="cooldown-message" class="cooldown-message"><p class="cooldown-icon">🕒</p><h2>YOUR NEXT CHANCE IS IN</h2><p id="timer-text" class="timer-text"></p></div>`; const timerText = document.getElementById('timer-text'); if (!timerText) return; let interval = setInterval(() => { msLeft -= 1000; if (msLeft <= 0) { clearInterval(interval); localStorage.removeItem(`cafeRiteLastPlayed_${getDeviceId()}`); if(userPhoneNumber) localStorage.removeItem(`cafeRiteLastPlayed_phone_${userPhoneNumber}`); window.location.reload(); return; } const h = Math.floor(msLeft / 3600000); const m = Math.floor((msLeft % 3600000) / 60000); const s = Math.floor((msLeft % 60000) / 1000); if(timerText) timerText.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`; }, 1000); }
    function pad(num) { return num < 10 ? '0' + num : num; }
    async function updateViewersCount() { const viewersCountEl = document.getElementById('viewers-count'); if (!viewersCountEl) return; try { const response = await fetch(`${BACKEND_URL}/viewers`); if (!response.ok) return; const data = await response.json(); viewersCountEl.querySelector('span').textContent = data.count; viewersCountEl.classList.remove('hidden'); } catch (error) { console.log("Could not fetch viewer count."); } }
    
    // START THE APP
    initializeApp();
});
