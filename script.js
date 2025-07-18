// --- The "Legendary" Engine --- //

document.addEventListener('DOMContentLoaded', () => {
    const BACKEND_URL = 'https://shop-op4l.onrender.com';

    const rulesOverlay = document.getElementById('rules-overlay');
    const acceptBtn = document.getElementById('accept-rules-btn');
    const appContainer = document.getElementById('app-container');

    let gameMusic, buttonSound;
    function playSound(type) { try { if (type === 'game') { if (!gameMusic) gameMusic = new Audio('game.mp3'); gameMusic.volume = 0.3; gameMusic.play().catch(e => {}); } else { if (!buttonSound) buttonSound = new Audio('button.mp3'); buttonSound.volume = 0.5; buttonSound.currentTime = 0; buttonSound.play().catch(e => {}); } } catch (e) {} }

    acceptBtn.addEventListener('click', () => {
        playSound('button');
        rulesOverlay.classList.add('hidden');
        buildMainApp();
    });

    function buildMainApp() {
        appContainer.innerHTML = `
            <div class="app-scene">
                <header class="main-header">
                    <div id="viewers-count" class="viewers-count hidden">👁️ <span>...</span></div>
                    <h1 class="main-title">CAFE RITE</h1>
                    <p class="sub-title">Pick a Lucky Box</p>
                    <p class="win-condition"><span>🍔</span> = ( WINNER ) ₹200 Free Food Order</p>
                </header>
                <main id="scene-container" class="scene-container">
                    <!-- Game will be built here by JS -->
                </main>
                <footer class="main-footer"></footer>
            </div>
            <div id="result-overlay" class="result-overlay hidden">
                <div class="result-content"><img id="result-image" src="" alt="Game Result"><div id="winner-code-container" class="winner-code-container hidden"><p>YOUR WINNING CODE</p><div id="winner-code" class="winner-code"></div></div></div>
            </div>`;
        playSound('game');
        initializeGame();
    }
    
    // --- THE UNBREAKABLE FIX: "OPTIMISTIC UI" ---
    async function initializeGame() {
        const sceneContainer = document.getElementById('scene-container');
        if (!sceneContainer) return;

        // 1. Build the UI immediately so the user sees something.
        sceneContainer.innerHTML = `
            <div id="game-grid-container" style="position: relative;">
                <div id="game-grid" class="game-grid is-loading"></div>
                <div id="grid-loading-overlay" class="grid-loading-overlay visible">
                    <div class="loading-spinner"></div>
                </div>
            </div>
            <div id="cooldown-message" class="cooldown-message hidden"></div>
        `;
        createGameGrid(true); // Create the grid in a disabled state
        updateViewersCount();

        // 2. Now, check the server in the background.
        try {
            const fingerprint = await getDeviceId();
            const response = await fetch(`${BACKEND_URL}/check`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fingerprint })
            });
            if (!response.ok) throw new Error("Server check failed");
            const data = await response.json();

            // 3. Update the UI based on the server's response.
            if (!data.canPlay) {
                showCooldownTimer(data.cooldownEnd - Date.now());
            } else {
                // It's playable, remove the overlay and enable the boxes.
                const overlay = document.getElementById('grid-loading-overlay');
                const grid = document.getElementById('game-grid');
                if (overlay) overlay.remove();
                if (grid) grid.classList.remove('is-loading');
                document.querySelectorAll('.game-box').forEach(b => b.classList.remove('is-disabled'));
            }
        } catch (e) {
            sceneContainer.innerHTML = `<div class="error-message">Could not connect to game server.<br>Please refresh.</div>`;
        }
    }
    
    function createGameGrid(disabled = false) { /* ... unchanged ... */ }
    async function handleBoxClick(event) { /* ... unchanged ... */ }
    function playAnimations(clickedBox, result) { /* ... unchanged ... */ }
    function populateAllBoxes(items) { /* ... unchanged ... */ }
    function showResult(result) { /* ... unchanged ... */ }
    let deviceFingerprint = null;
    async function getDeviceId() { /* ... unchanged ... */ }
    function setDailyLock() { /* ... unchanged ... */ }
    function showCooldownTimer(msLeft) { /* ... unchanged ... */ }
    function pad(num) { /* ... unchanged ... */ }
    async function updateViewersCount() { /* ... unchanged ... */ }

    // Re-pasting full logic for completeness
    function createGameGrid(disabled = false) { const gameGrid = document.getElementById('game-grid'); if (!gameGrid) return; gameGrid.innerHTML = ''; for (let i = 0; i < 9; i++) { const box = document.createElement('div'); box.className = `game-box ${disabled ? 'is-disabled' : ''}`; box.dataset.index = i; box.addEventListener('click', handleBoxClick, { once: true }); box.innerHTML = `<div class="box-face box-front"></div><div class="box-face box-back"></div>`; gameGrid.appendChild(box); } }
    async function handleBoxClick(event) { playSound('button'); const clickedBox = event.currentTarget; const boxIndex = clickedBox.dataset.index; document.querySelectorAll('.game-box').forEach(b => b.classList.add('is-disabled')); clickedBox.querySelector('.box-front').innerHTML = '<div class="loading-spinner"></div>'; try { const fingerprint = await getDeviceId(); const response = await fetch(`${BACKEND_URL}/play`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fingerprint, boxIndex: parseInt(boxIndex) }) }); if (!response.ok) throw new Error(`Server Error: ${response.status}`); const result = await response.json(); playAnimations(clickedBox, result); } catch (error) { console.error("CRITICAL: Game server connection failed.", error); alert("Sorry, the game server is busy. Please refresh and try again."); document.querySelectorAll('.game-box').forEach(b => { b.classList.remove('is-disabled'); b.querySelector('.box-front').innerHTML = ''; }); } }
    function playAnimations(clickedBox, result) { populateAllBoxes(result.items); clickedBox.querySelector('.box-front').innerHTML = ''; clickedBox.classList.add('is-flipped'); setTimeout(() => { showResult(result); setDailyLock(); }, 800); }
    function populateAllBoxes(items) { document.querySelectorAll('.game-box').forEach((box, i) => { if(box) box.querySelector('.box-back').innerHTML = items[i]; }); }
    function showResult(result) { const resultOverlay = document.getElementById('result-overlay'); const resultImage = document.getElementById('result-image'); const winnerCodeContainer = document.getElementById('winner-code-container'); const winnerCodeEl = document.getElementById('winner-code'); if(!resultOverlay) return; resultImage.src = result.win ? 'lucky.png' : 'unlucky.png'; if (result.win) { winnerCodeEl.textContent = result.winnerCode; winnerCodeContainer.classList.remove('hidden'); } else { winnerCodeContainer.classList.add('hidden'); setTimeout(() => { resultOverlay.classList.remove('visible'); setTimeout(() => { document.querySelectorAll('.game-box').forEach(box => { if (box) box.classList.add('is-flipped'); }); setTimeout(() => { showCooldownTimer(24 * 60 * 60 * 1000); }, 7000); }, 100); }, 5000); } resultOverlay.classList.remove('hidden'); setTimeout(() => resultOverlay.classList.add('visible'), 10); }
    async function getDeviceId() { if (deviceFingerprint) return deviceFingerprint; if (window.FingerprintJS) { try { const fp = await FingerprintJS.load(); const result = await fp.get(); deviceFingerprint = result.visitorId; return deviceFingerprint; } catch(e) { console.error("FingerprintJS failed to load."); } } return 'fallback-' + (navigator.userAgent || '') + (navigator.language || ''); }
    function setDailyLock() { localStorage.setItem('cafeRiteLastPlayed', Date.now()); }
    function showCooldownTimer(msLeft) { const sceneContainer = document.getElementById('scene-container'); if(!sceneContainer) return; sceneContainer.innerHTML = `<div id="cooldown-message" class="cooldown-message"><p class="cooldown-icon">🕒</p><h2>YOUR NEXT CHANCE IS IN</h2><p id="timer-text" class="timer-text"></p></div>`; const timerText = document.getElementById('timer-text'); if (!timerText) return; let interval = setInterval(() => { msLeft -= 1000; if (msLeft <= 0) { clearInterval(interval); buildMainApp(); return; } const h = Math.floor(msLeft / 3600000); const m = Math.floor((msLeft % 3600000) / 60000); const s = Math.floor((msLeft % 60000) / 1000); if(timerText) timerText.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`; }, 1000); }
    function pad(num) { return num < 10 ? '0' + num : num; }
    async function updateViewersCount() { const viewersCountEl = document.getElementById('viewers-count'); if (!viewersCountEl) return; try { const response = await fetch(`${BACKEND_URL}/viewers`); if (!response.ok) return; const data = await response.json(); viewersCountEl.querySelector('span').textContent = data.count; viewersCountEl.classList.remove('hidden'); } catch (error) { console.log("Could not fetch viewer count."); } }
});
