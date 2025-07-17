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
                <main class="scene-container">
                    <div id="game-grid" class="game-grid"></div>
                    <div id="cooldown-message" class="cooldown-message hidden"><p class="cooldown-icon">🕒</p><h2>YOUR NEXT CHANCE IS IN</h2><p id="timer-text" class="timer-text"></p></div>
                </main>
                <footer class="main-footer"></footer>
            </div>
            <div id="result-overlay" class="result-overlay hidden">
                <div class="result-content"><img id="result-image" src="" alt="Game Result"><div id="winner-code-container" class="winner-code-container hidden"><p>YOUR WINNING CODE</p><div id="winner-code" class="winner-code"></div></div></div>
            </div>`;
        playSound('game');
        initializeGame();
    }

    // --- GENIUS DEVELOPER FINGERPRINTING ---
    let deviceFingerprint = null;
    function getDeviceId() {
        if (deviceFingerprint) return deviceFingerprint;
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        const renderer = gl ? gl.getParameter(gl.RENDERER) : 'no-webgl';
        const data = `${navigator.userAgent}${screen.height}${screen.width}${screen.colorDepth}${renderer}`;
        // Simple hash function
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0;
        }
        deviceFingerprint = hash.toString();
        return deviceFingerprint;
    }

    // --- CORE GAME LOGIC (Unbreakable & Simple) ---
    async function initializeGame() {
        updateViewersCount();
        const fingerprint = getDeviceId();
        try {
            const response = await fetch(`${BACKEND_URL}/check`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fingerprint })
            });
            const data = await response.json();
            if (!data.canPlay) {
                showCooldownTimer(); // Show a generic 24h timer
                return;
            }
        } catch (e) {
            console.error("Could not check status, proceeding with caution.");
        }
        createGameGrid();
    }
    
    function createGameGrid() { /* ... unchanged ... */ }
    async function handleBoxClick(event) { /* ... unchanged ... */ }
    function playAnimations(clickedBox, result) { /* ... unchanged ... */ }
    function populateAllBoxes(items) { /* ... unchanged ... */ }
    function showResult(result) { /* ... unchanged ... */ }
    function pad(num) { /* ... unchanged ... */ }

    // Re-pasting full logic for completeness
    function createGameGrid() { const gameGrid = document.getElementById('game-grid'); const cooldownMessage = document.getElementById('cooldown-message'); if (!gameGrid || !cooldownMessage) return; gameGrid.style.display = 'grid'; cooldownMessage.classList.add('hidden'); gameGrid.innerHTML = ''; for (let i = 0; i < 9; i++) { const box = document.createElement('div'); box.className = 'game-box'; box.dataset.index = i; box.addEventListener('click', handleBoxClick, { once: true }); box.innerHTML = `<div class="box-face box-front"></div><div class="box-face box-back"></div>`; gameGrid.appendChild(box); } }
    async function handleBoxClick(event) {
        playSound('button');
        const clickedBox = event.currentTarget;
        const boxIndex = clickedBox.dataset.index;
        document.querySelectorAll('.game-box').forEach(b => b.classList.add('is-disabled'));
        clickedBox.querySelector('.box-front').innerHTML = '<div class="loading-spinner"></div>';
        try {
            const response = await fetch(`${BACKEND_URL}/play`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ deviceId: "legacy", fingerprint: getDeviceId(), boxIndex: parseInt(boxIndex) }) });
            if (!response.ok) throw new Error(`Server Error: ${response.status}`);
            const result = await response.json();
            playAnimations(clickedBox, result);
        } catch (error) { console.error("CRITICAL: Game server connection failed.", error); alert("Sorry, the game server is busy. Please refresh and try again."); document.querySelectorAll('.game-box').forEach(b => { b.classList.remove('is-disabled'); b.querySelector('.box-front').innerHTML = ''; }); }
    }
    function playAnimations(clickedBox, result) { populateAllBoxes(result.items); clickedBox.querySelector('.box-front').innerHTML = ''; clickedBox.classList.add('is-flipped'); setTimeout(() => { showResult(result); }, 800); }
    function populateAllBoxes(items) { document.querySelectorAll('.game-box').forEach((box, i) => { if(box) box.querySelector('.box-back').innerHTML = items[i]; }); }
    function showResult(result) {
        const resultOverlay = document.getElementById('result-overlay'); const resultImage = document.getElementById('result-image'); const winnerCodeContainer = document.getElementById('winner-code-container'); const winnerCodeEl = document.getElementById('winner-code'); if(!resultOverlay) return;
        resultImage.src = result.win ? 'lucky.png' : 'unlucky.png';
        if (result.win) {
            winnerCodeEl.textContent = result.winnerCode;
            winnerCodeContainer.classList.remove('hidden');
        } else {
            winnerCodeContainer.classList.add('hidden');
            setTimeout(() => {
                resultOverlay.classList.remove('visible');
                setTimeout(() => { document.querySelectorAll('.game-box').forEach(box => { if (box) box.classList.add('is-flipped'); });
                    setTimeout(() => { showCooldownTimer(); }, 7000);
                }, 100);
            }, 5000);
        }
        resultOverlay.classList.remove('hidden');
        setTimeout(() => resultOverlay.classList.add('visible'), 10);
    }
    function showCooldownTimer() {
        const sceneContainer = document.querySelector('.scene-container'); if(!sceneContainer) return;
        sceneContainer.innerHTML = `<div id="cooldown-message" class="cooldown-message"><p class="cooldown-icon">🕒</p><h2>You have already played today.</h2><p>Your next chance is tomorrow.</p></div>`;
    }
    function pad(num) { return num < 10 ? '0' + num : num; }
    async function updateViewersCount() { const viewersCountEl = document.getElementById('viewers-count'); if (!viewersCountEl) return; try { const response = await fetch(`${BACKEND_URL}/viewers`); if (!response.ok) return; const data = await response.json(); viewersCountEl.querySelector('span').textContent = data.count; viewersCountEl.classList.remove('hidden'); } catch (error) { console.log("Could not fetch viewer count."); } }
});
