// --- The "Legendary" Engine --- //

// ── THE MASTER HACKER INCOGNITO GATEKEEPER ──
// This is your genius code. It runs instantly and stops the script if needed.
(function() {
    const appContainer = document.getElementById('app-container');

    function showBlockScreen(title, message, icon = '🛡️') {
        appContainer.innerHTML = `
            <div class="block-container">
                <div class="block-icon">${icon}</div>
                <h1 class="block-title">${title}</h1>
                <p class="block-text">${message}</p>
            </div>`;
    }

    try {
        // Test if localStorage is writable. This fails in most incognito modes.
        localStorage.setItem('__incognito_test__', '1');
        localStorage.removeItem('__incognito_test__');

        // If it works, check for the cooldown.
        let deviceId = localStorage.getItem('cafeRiteDeviceId');
        if (!deviceId) {
            // This is a true first-time user in a normal tab.
            // Do nothing and let the main script run.
        } else {
            const lastPlayed = localStorage.getItem(`cafeRiteLastPlayed_${deviceId}`);
            if (lastPlayed) {
                const timeSince = Date.now() - parseInt(lastPlayed, 10);
                const cooldown = 24 * 60 * 60 * 1000; // 24 hours
                if (timeSince < cooldown) {
                    // This user has played recently. Block them and show the timer.
                    showBlockScreen('Please Wait', 'You have already played today. Your next chance is coming soon.', '🕒');
                    throw new Error("Blocked: User is on cooldown.");
                }
            }
        }
    } catch (e) {
        // If localStorage fails, it's almost certainly Incognito/Private mode.
        showBlockScreen('Incognito Mode Not Allowed', 'Please open this page in a normal browser tab to play the game.');
        // This stops the rest of the script from executing.
        throw new Error("Blocked: Incognito user.");
    }
})();


// --- The "Old is Gold" Game Logic --- //
// This code will ONLY run if the gatekeeper above allows it.
document.addEventListener('DOMContentLoaded', () => {
    const BACKEND_URL = 'https://shop-op4l.onrender.com';
    const appContainer = document.getElementById('app-container');

    // Since the gatekeeper already checked, we just show the rules.
    showRules();

    let gameMusic, buttonSound;
    function playSound(type) { try { if (type === 'game') { if (!gameMusic) gameMusic = new Audio('game.mp3'); gameMusic.volume = 0.3; gameMusic.play().catch(e => {}); } else { if (!buttonSound) buttonSound = new Audio('button.mp3'); buttonSound.volume = 0.5; buttonSound.currentTime = 0; buttonSound.play().catch(e => {}); } } catch (e) {} }

    function showRules() {
        appContainer.innerHTML = `
             <div id="rules-overlay" class="rules-overlay">
                <div class="rules-content"><h2 class="rules-title">📜 RULES OF THE GAME</h2><div class="rules-list"><div class="rule-item"><span>✅</span><p><strong>One Scratch per Day:</strong> You get one chance every 24 hours.</p></div><div class="rule-item"><span>🏠</span><p><strong>Only Inside the Café:</strong> Valid only when scanned inside the café.</p></div><div class="rule-item"><span>🎁</span><p><strong>Win a ₹200 Free Food Offer:</strong> Show the winning code to the cashier.</p></div><div class="rule-item"><span>😅</span><p><strong>Didn’t Win?:</strong> No worries! Try again tomorrow.</p></div><div class="rule-item"><span>🔒</span><p><strong>No Misuse:</strong> The QR code is for real visitors only.</p></div></div><button id="accept-rules-btn" class="accept-btn">ACCEPT & PLAY</button></div>
            </div>`;
        const acceptBtn = document.getElementById('accept-rules-btn');
        acceptBtn.addEventListener('click', () => {
            playSound('button');
            document.getElementById('rules-overlay').classList.add('hidden');
            buildMainApp();
        });
    }

    function buildMainApp() {
        appContainer.innerHTML += `
            <div class="app-scene">
                <header class="main-header">
                    <div id="viewers-count" class="viewers-count hidden">👁️ <span>...</span></div>
                    <h1 class="main-title">CAFE RITE</h1>
                    <p class="sub-title">Pick a Lucky Box</p>
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
    
    let deviceId = null;
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
    
    function initializeGame() {
        updateViewersCount();
        createGameGrid();
    }
    
    function createGameGrid() {
        const sceneContainer = document.getElementById('scene-container');
        if (!sceneContainer) return;
        sceneContainer.innerHTML = `<div id="game-grid" class="game-grid"></div>`;
        const gameGrid = document.getElementById('game-grid');
        for (let i = 0; i < 9; i++) {
            const box = document.createElement('div');
            box.className = 'game-box';
            box.dataset.index = i;
            box.addEventListener('click', handleBoxClick, { once: true });
            box.innerHTML = `<div class="box-face box-front"></div><div class="box-face box-back"></div>`;
            gameGrid.appendChild(box);
        }
    }

    async function handleBoxClick(event) {
        playSound('button');
        const clickedBox = event.currentTarget;
        const boxIndex = clickedBox.dataset.index;
        document.querySelectorAll('.game-box').forEach(b => b.classList.add('is-disabled'));
        clickedBox.querySelector('.box-front').innerHTML = '<div class="loading-spinner"></div>';
        
        try {
            const response = await fetch(`${BACKEND_URL}/play`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deviceId: getDeviceId(), boxIndex: parseInt(boxIndex) })
            });
            if (!response.ok) throw new Error(`Server Error: ${response.status}`);
            const result = await response.json();
            playAnimations(clickedBox, result);
        } catch (error) {
            console.error("CRITICAL: Game server connection failed.", error);
            alert("Sorry, the game server is busy. Please refresh and try again.");
            document.querySelectorAll('.game-box').forEach(b => {
                b.classList.remove('is-disabled');
                b.querySelector('.box-front').innerHTML = '';
            });
        }
    }
    
    function playAnimations(clickedBox, result) { /* ... unchanged ... */ }
    function populateAllBoxes(items) { /* ... unchanged ... */ }
    function showResult(result) { /* ... unchanged ... */ }
    function setDailyLock() { /* ... unchanged ... */ }
    function showCooldownTimer(msLeft) { /* ... unchanged ... */ }
    function pad(num) { /* ... unchanged ... */ }
    async function updateViewersCount() { /* ... unchanged ... */ }
    
    function playAnimations(clickedBox, result) { populateAllBoxes(result.items); clickedBox.querySelector('.box-front').innerHTML = ''; clickedBox.classList.add('is-flipped'); setTimeout(() => { showResult(result); }, 800); }
    function populateAllBoxes(items) { document.querySelectorAll('.game-box').forEach((box, i) => { if(box) box.querySelector('.box-back').innerHTML = items[i]; }); }
    function showResult(result) { const resultOverlay = document.getElementById('result-overlay'); const resultImage = document.getElementById('result-image'); const winnerCodeContainer = document.getElementById('winner-code-container'); const winnerCodeEl = document.getElementById('winner-code'); if(!resultOverlay) return; resultImage.src = result.win ? 'lucky.png' : 'unlucky.png'; setDailyLock(); if (result.win) { winnerCodeEl.textContent = result.winnerCode; winnerCodeContainer.classList.remove('hidden'); } else { winnerCodeContainer.classList.add('hidden'); setTimeout(() => { resultOverlay.classList.remove('visible'); setTimeout(() => { document.querySelectorAll('.game-box').forEach(box => { if (box) box.classList.add('is-flipped'); }); setTimeout(() => { showCooldownTimer(24 * 60 * 60 * 1000); }, 7000); }, 100); }, 5000); } resultOverlay.classList.remove('hidden'); setTimeout(() => resultOverlay.classList.add('visible'), 10); }
    function setDailyLock() { localStorage.setItem(`cafeRiteLastPlayed_${getDeviceId()}`, Date.now()); }
    function showCooldownTimer(msLeft) { const sceneContainer = document.getElementById('scene-container'); const mainHeader = document.querySelector('.main-header'); if(!sceneContainer || !mainHeader) { appContainer.innerHTML = `<div id="cooldown-message" class="cooldown-message"><p class="cooldown-icon">🕒</p><h2>YOUR NEXT CHANCE IS IN</h2><p id="timer-text" class="timer-text"></p></div>`; } else { mainHeader.style.display = 'none'; sceneContainer.innerHTML = `<div id="cooldown-message" class="cooldown-message"><p class="cooldown-icon">🕒</p><h2>YOUR NEXT CHANCE IS IN</h2><p id="timer-text" class="timer-text"></p></div>`; } const timerText = document.getElementById('timer-text'); if (!timerText) return; let interval = setInterval(() => { msLeft -= 1000; if (msLeft <= 0) { clearInterval(interval); localStorage.removeItem(`cafeRiteLastPlayed_${getDeviceId()}`); window.location.reload(); return; } const h = Math.floor(msLeft / 3600000); const m = Math.floor((msLeft % 3600000) / 60000); const s = Math.floor((msLeft % 60000) / 1000); if(timerText) timerText.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`; }, 1000); }
    function pad(num) { return num < 10 ? '0' + num : num; }
    async function updateViewersCount() { const viewersCountEl = document.getElementById('viewers-count'); if (!viewersCountEl) return; try { const response = await fetch(`${BACKEND_URL}/viewers`); if (!response.ok) return; const data = await response.json(); viewersCountEl.querySelector('span').textContent = data.count; viewersCountEl.classList.remove('hidden'); } catch (error) { console.log("Could not fetch viewer count."); } }
                                 }
