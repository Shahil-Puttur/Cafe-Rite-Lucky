// --- The "Legendary" Engine --- //

document.addEventListener('DOMContentLoaded', () => {
    const BACKEND_URL = 'https://shop-op4l.onrender.com';

    const rulesOverlay = document.getElementById('rules-overlay');
    const acceptBtn = document.getElementById('accept-rules-btn');
    const appContainer = document.getElementById('app-container');

    let gameMusic, buttonSound;
    let userPhoneNumber = null;

    function playSound(type) { try { if (type === 'game') { if (!gameMusic) gameMusic = new Audio('game.mp3'); gameMusic.volume = 0.3; gameMusic.play().catch(e => {}); } else { if (!buttonSound) buttonSound = new Audio('button.mp3'); buttonSound.volume = 0.5; buttonSound.currentTime = 0; buttonSound.play().catch(e => {}); } } catch (e) {} }

    acceptBtn.addEventListener('click', () => {
        playSound('button');
        rulesOverlay.classList.add('hidden');
        // --- THE PRE-WARMING FIX ---
        fetch(BACKEND_URL).catch(err => console.log("Pre-warm request sent."));
        buildNameForm();
    });
    
    // --- STAGE 1: NAME FORM (THE PERFECT DELAY) ---
    function buildNameForm() {
        appContainer.innerHTML = `
            <div class="app-scene">
                <header class="main-header"><h1 class="main-title">CAFE RITE</h1><p class="sub-title">Verify to Play</p></header>
                <main class="scene-container">
                    <div class="form-container">
                        <div class="input-group"><span class="input-icon">📱</span><input type="tel" id="phone-number" class="form-input" placeholder="Enter 10-digit Phone Number" maxlength="10"></div>
                        <button id="next-btn" class="next-btn" disabled>NEXT</button>
                    </div>
                </main>
                <footer class="main-footer"></footer>
            </div>`;

        const nextBtn = document.getElementById('next-btn');
        const phoneInput = document.getElementById('phone-number');
        
        phoneInput.addEventListener('input', () => {
            phoneInput.value = phoneInput.value.replace(/[^0-9]/g, '');
            nextBtn.disabled = phoneInput.value.length !== 10;
        });

        nextBtn.addEventListener('click', () => {
            playSound('button');
            userPhoneNumber = phoneInput.value;
            localStorage.setItem('cafeRiteLastPhoneNumber', userPhoneNumber);
            buildOtpScreen();
        });
    }

    // --- STAGE 2: FAKE OTP ---
    function buildOtpScreen() {
        appContainer.innerHTML = `
            <div class="app-scene">
                <header class="main-header"><h1 class="main-title">CAFE RITE</h1><p class="sub-title">Verifying...</p></header>
                <main class="scene-container">
                    <div class="form-container">
                        <div class="otp-container">
                            <div class="otp-box"></div><div class="otp-box"></div><div class="otp-box"></div><div class="otp-box"></div><div class="otp-box"></div>
                        </div>
                        <p class="otp-status">Auto-detecting OTP...</p>
                    </div>
                </main>
                <footer class="main-footer"></footer>
            </div>`;

        const otpBoxes = document.querySelectorAll('.otp-box');
        const otpStatus = document.querySelector('.otp-status');
        const randomOtp = Array.from({length: 5}, () => Math.floor(Math.random() * 10));
        
        setTimeout(() => {
            let i = 0;
            const interval = setInterval(() => {
                if(otpBoxes[i]) otpBoxes[i].textContent = randomOtp[i];
                i++;
                if (i >= otpBoxes.length) {
                    clearInterval(interval);
                    if(otpStatus) otpStatus.innerHTML = '✅ Verified!';
                    setTimeout(buildGameApp, 800);
                }
            }, 300);
        }, 1000);
    }

    // --- STAGE 3: GAME APP ---
    function buildGameApp() {
        appContainer.innerHTML = `
            <div class="app-scene">
                <header class="main-header">
                    <div id="viewers-count" class="viewers-count hidden">👁️ <span>...</span></div>
                    <h1 class="main-title">CAFE RITE</h1><p class="sub-title">Pick a Lucky Box</p>
                    <p class="win-condition"><span>🍔</span> = ( WINNER ) ₹200 Free Food Order</p>
                </header>
                <main id="scene-container" class="scene-container"></main>
                <footer class="main-footer"></footer>
            </div>
            <div id="result-overlay" class="result-overlay hidden">
                <div class="result-content"><img id="result-image" src="" alt="Game Result"><div id="winner-code-container" class="winner-code-container hidden"><p>YOUR WINNING CODE</p><div id="winner-code" class="winner-code"></div></div></div>
            </div>`;
        playSound('game');
        initializeGame();
    }
    
    // --- CORE GAME LOGIC (Unbreakable & Fast) ---
    async function initializeGame() {
        updateViewersCount();
        createGameGrid();
    }
    
    // All other functions remain the same, but they are now called in a stable, flawless sequence.
    function createGameGrid() { /* ... unchanged ... */ }
    async function handleBoxClick(event) { /* ... unchanged ... */ }
    function playAnimations(clickedBox, result) { /* ... unchanged ... */ }
    function populateAllBoxes(items) { /* ... unchanged ... */ }
    function showResult(result) { /* ... unchanged ... */ }
    let deviceId = null; function getDeviceId() { /* ... unchanged ... */ }
    function setDailyLock() { /* ... unchanged ... */ }
    function showCooldownTimer(msLeft) { /* ... unchanged ... */ }
    function pad(num) { /* ... unchanged ... */ }
    async function updateViewersCount() { /* ... unchanged ... */ }
    
    // Re-pasting full logic for completeness
    function createGameGrid() { const sceneContainer = document.getElementById('scene-container'); if (!sceneContainer) return; sceneContainer.innerHTML = `<div id="game-grid" class="game-grid"></div>`; const gameGrid = document.getElementById('game-grid'); for (let i = 0; i < 9; i++) { const box = document.createElement('div'); box.className = 'game-box'; box.dataset.index = i; box.addEventListener('click', handleBoxClick, { once: true }); box.innerHTML = `<div class="box-face box-front"></div><div class="box-face box-back"></div>`; gameGrid.appendChild(box); } }
    async function handleBoxClick(event) { playSound('button'); const clickedBox = event.currentTarget; const boxIndex = clickedBox.dataset.index; document.querySelectorAll('.game-box').forEach(b => b.classList.add('is-disabled')); clickedBox.querySelector('.box-front').innerHTML = '<div class="loading-spinner"></div>'; try { const currentPhoneNumber = userPhoneNumber || localStorage.getItem('cafeRiteLastPhoneNumber'); const response = await fetch(`${BACKEND_URL}/play`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ deviceId: getDeviceId(), phoneNumber: currentPhoneNumber, boxIndex: parseInt(boxIndex) }) }); if (response.status === 429) { const data = await response.json(); showCooldownTimer(data.cooldownEnd - Date.now()); return; } if (!response.ok) throw new Error(`Server Error: ${response.status}`); const result = await response.json(); playAnimations(clickedBox, result); } catch (error) { console.error("CRITICAL: Game server connection failed.", error); alert("Sorry, the game server is busy. Please refresh and try again."); document.querySelectorAll('.game-box').forEach(b => { b.classList.remove('is-disabled'); b.querySelector('.box-front').innerHTML = ''; }); } }
    function playAnimations(clickedBox, result) { populateAllBoxes(result.items); clickedBox.querySelector('.box-front').innerHTML = ''; clickedBox.classList.add('is-flipped'); setTimeout(() => { showResult(result); setDailyLock(); }, 800); }
    function populateAllBoxes(items) { document.querySelectorAll('.game-box').forEach((box, i) => { if(box) box.querySelector('.box-back').innerHTML = items[i]; }); }
    function showResult(result) { const resultOverlay = document.getElementById('result-overlay'); const resultImage = document.getElementById('result-image'); const winnerCodeContainer = document.getElementById('winner-code-container'); const winnerCodeEl = document.getElementById('winner-code'); if(!resultOverlay) return; resultImage.src = result.win ? 'lucky.png' : 'unlucky.png'; if (result.win) { winnerCodeEl.textContent = result.winnerCode; winnerCodeContainer.classList.remove('hidden'); } else { winnerCodeContainer.classList.add('hidden'); setTimeout(() => { resultOverlay.classList.remove('visible'); setTimeout(() => { document.querySelectorAll('.game-box').forEach(box => { if (box) box.classList.add('is-flipped'); }); setTimeout(() => { showCooldownTimer(24 * 60 * 60 * 1000); }, 7000); }, 100); }, 5000); } resultOverlay.classList.remove('hidden'); setTimeout(() => resultOverlay.classList.add('visible'), 10); }
    function getDeviceId() { if (deviceId) return deviceId; let id = localStorage.getItem('cafeRiteDeviceId'); if (!id) { id = 'device-' + Date.now() + Math.random().toString(36).substr(2, 9); localStorage.setItem('cafeRiteDeviceId', id); } deviceId = id; return deviceId; }
    function setDailyLock() { localStorage.setItem(`cafeRiteLastPlayed_${getDeviceId()}`, Date.now()); }
    function showCooldownTimer(msLeft) { const sceneContainer = document.getElementById('scene-container'); if(!sceneContainer) return; sceneContainer.innerHTML = `<div id="cooldown-message" class="cooldown-message"><p class="cooldown-icon">🕒</p><h2>YOUR NEXT CHANCE IS IN</h2><p id="timer-text" class="timer-text"></p></div>`; const timerText = document.getElementById('timer-text'); if (!timerText) return; let interval = setInterval(() => { msLeft -= 1000; if (msLeft <= 0) { clearInterval(interval); localStorage.removeItem(`cafeRiteLastPlayed_${getDeviceId()}`); buildMainApp(); return; } const h = Math.floor(msLeft / 3600000); const m = Math.floor((msLeft % 3600000) / 60000); const s = Math.floor((msLeft % 60000) / 1000); if(timerText) timerText.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`; }, 1000); }
    function pad(num) { return num < 10 ? '0' + num : num; }
    async function updateViewersCount() { const viewersCountEl = document.getElementById('viewers-count'); if (!viewersCountEl) return; try { const response = await fetch(`${BACKEND_URL}/viewers`); if (!response.ok) return; const data = await response.json(); viewersCountEl.querySelector('span').textContent = data.count; viewersCountEl.classList.remove('hidden'); } catch (error) { console.log("Could not fetch viewer count."); } }
});
