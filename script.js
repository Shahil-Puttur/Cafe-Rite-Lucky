// --- The "Unbreakable" Engine --- //

document.addEventListener('DOMContentLoaded', () => {
    const BACKEND_URL = 'https://shop-op4l.onrender.com';

    const rulesOverlay = document.getElementById('rules-overlay');
    const acceptBtn = document.getElementById('accept-rules-btn');
    const appContainer = document.getElementById('app-container');

    let gameMusic, buttonSound;
    function playSound(type) { try { if (type === 'game') { if (!gameMusic) gameMusic = new Audio('game.mp3'); gameMusic.volume = 0.3; gameMusic.play().catch(e => {}); } else { if (!buttonSound) buttonSound = new Audio('button.mp3'); buttonSound.volume = 0.5; buttonSound.currentTime = 0; buttonSound.play().catch(e => {}); } } catch (e) {} }

    // --- MASTER FLOW ---
    acceptBtn.addEventListener('click', () => {
        playSound('button');
        rulesOverlay.classList.add('hidden');
        
        // --- THE PRE-WARMING FIX ---
        // Send a silent "wake-up" call to the server immediately.
        fetch(`${BACKEND_URL}/status`).catch(err => console.log("Pre-warm request sent."));

        // Show the user the name/food form immediately.
        buildNameForm();
    });

    // --- STAGE 1: NAME FORM ---
    function buildNameForm() {
        appContainer.innerHTML = `
            <div class="app-scene">
                <header class="main-header">
                    <h1 class="main-title">CAFE RITE</h1>
                    <p class="sub-title">One Last Step...</p>
                </header>
                <main class="scene-container">
                    <div class="form-container">
                        <input type="text" id="user-name" class="form-input" placeholder="Enter Your Name">
                        <input type="text" id="user-food" class="form-input" placeholder="Enter Your Favorite Food">
                        <button id="next-btn" class="next-btn">NEXT</button>
                    </div>
                </main>
                <footer class="main-footer"></footer>
            </div>`;

        const nextBtn = document.getElementById('next-btn');
        nextBtn.addEventListener('click', () => {
            playSound('button');
            // By the time the user clicks this, the server is awake.
            buildGameApp();
        });
    }

    // --- STAGE 2: GAME APP ---
    function buildGameApp() {
        appContainer.innerHTML = `
            <div class="app-scene">
                <header class="main-header"><h1 class="main-title">CAFE RITE</h1><p class="sub-title">Pick a Lucky Box</p><p class="win-condition"><span>🍔</span> = ( WINNER ) ₹200 Free Food Order</p></header>
                <main class="scene-container">
                    <div id="game-grid" class="game-grid"></div>
                    <div id="cooldown-message" class="cooldown-message hidden"><p class="cooldown-icon">🕒</p><h2>YOUR NEXT CHANCE IS IN</h2><p id="timer-text" class="timer-text">23:59:59</p></div>
                </main>
                <footer class="main-footer"></footer>
            </div>
            <div id="result-overlay" class="result-overlay hidden">
                <div class="result-content"><img id="result-image" src="" alt="Game Result"><div id="winner-code-container" class="winner-code-container hidden"><p>YOUR WINNING CODE</p><div id="winner-code" class="winner-code"></div></div></div>
            </div>`;
        
        playSound('game');
        initializeGame();
    }

    // --- CORE GAME LOGIC (UNCHANGED, NOW IT WILL WORK) ---
    async function initializeGame() {
        try {
            const statusResponse = await fetch(`${BACKEND_URL}/status`);
            if (!statusResponse.ok) throw new Error('Cannot reach server for status check.');
            const serverStatus = await statusResponse.json();
            const serverVersion = serverStatus.version;
            const localVersion = localStorage.getItem('cafeRiteGameVersion');
            if (serverVersion > localVersion) {
                localStorage.clear();
                localStorage.setItem('cafeRiteGameVersion', serverVersion);
            }
            const winnerExpiry = localStorage.getItem('cafeRiteWinnerExpiry');
            if (winnerExpiry && Date.now() < parseInt(winnerExpiry, 10)) { showWinnerScreenFromStorage(); return; }
            const lastPlayed = localStorage.getItem('cafeRiteLastPlayed');
            if (lastPlayed) { const timeSince = Date.now() - parseInt(lastPlayed, 10); const cooldown = 24 * 60 * 60 * 1000; if (timeSince < cooldown) { showCooldownTimer(cooldown - timeSince); return; } }
            createGameGrid();
        } catch (error) {
            const sceneContainer = document.querySelector('.scene-container');
            if (sceneContainer) {
                sceneContainer.innerHTML = `<div class="error-message">Could not connect to the game.<br>Please check your internet and refresh.</div>`;
            }
        }
    }
    
    function createGameGrid() { /* ... unchanged ... */ }
    async function handleBoxClick(event) { /* ... unchanged ... */ }
    function playAnimations(clickedBox, result) { /* ... unchanged ... */ }
    function populateAllBoxes(items) { /* ... unchanged ... */ }
    function showResult(result) { /* ... unchanged ... */ }
    function showWinnerScreenFromStorage() { /* ... unchanged ... */ }
    function getDeviceId() { /* ... unchanged ... */ }
    function setDailyLock() { /* ... unchanged ... */ }
    function showCooldownTimer(msLeft) { /* ... unchanged ... */ }
    function pad(num) { /* ... unchanged ... */ }

    // Re-pasting the full logic to be safe
    function createGameGrid() { const gameGrid = document.getElementById('game-grid'); const cooldownMessage = document.getElementById('cooldown-message'); if (!gameGrid || !cooldownMessage) return; gameGrid.style.display = 'grid'; cooldownMessage.classList.add('hidden'); gameGrid.innerHTML = ''; for (let i = 0; i < 9; i++) { const box = document.createElement('div'); box.className = 'game-box'; box.addEventListener('click', handleBoxClick, { once: true }); box.innerHTML = `<div class="box-face box-front"></div><div class="box-face box-back"></div>`; gameGrid.appendChild(box); } }
    async function handleBoxClick(event) { playSound('button'); document.querySelectorAll('.game-box').forEach(b => b.classList.add('is-disabled')); const clickedBox = event.currentTarget; clickedBox.querySelector('.box-front').innerHTML = '<div class="loading-spinner"></div>'; try { const response = await fetch(`${BACKEND_URL}/play`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ deviceId: getDeviceId() }) }); if (!response.ok) throw new Error(`Server Error: ${response.status}`); const result = await response.json(); playAnimations(clickedBox, result); } catch (error) { console.error("CRITICAL: Game server connection failed.", error); alert("Sorry, the game server is busy. Please try again in a moment."); document.querySelectorAll('.game-box').forEach(b => { b.classList.remove('is-disabled'); b.querySelector('.box-front').innerHTML = ''; }); } }
    function playAnimations(clickedBox, result) { populateAllBoxes(result.items); const clickedIndex = Array.from(clickedBox.parentNode.children).indexOf(clickedBox); const finalResult = { ...result, win: result.items[clickedIndex] === '🍔' }; clickedBox.classList.add('is-flipped'); setTimeout(() => { showResult(finalResult); setDailyLock(); }, 800); }
    function populateAllBoxes(items) { document.querySelectorAll('.game-box').forEach((box, i) => { if(box) box.querySelector('.box-back').innerHTML = items[i]; }); }
    function showResult(result) { const resultOverlay = document.getElementById('result-overlay'); const resultImage = document.getElementById('result-image'); const winnerCodeContainer = document.getElementById('winner-code-container'); const winnerCodeEl = document.getElementById('winner-code'); if(!resultOverlay || !resultImage || !winnerCodeContainer || !winnerCodeEl) return; resultImage.src = result.win ? 'lucky.png' : 'unlucky.png'; if (result.win) { winnerCodeEl.textContent = result.winnerCode; winnerCodeContainer.classList.remove('hidden'); const expiryTime = Date.now() + 60 * 60 * 1000; localStorage.setItem('cafeRiteWinnerExpiry', expiryTime); localStorage.setItem('cafeRiteWinnerCode', result.winnerCode); } else { winnerCodeContainer.classList.add('hidden'); setTimeout(() => { resultOverlay.classList.remove('visible'); setTimeout(() => { document.querySelectorAll('.game-box').forEach(box => { if (box) box.classList.add('is-flipped'); }); setTimeout(() => { showCooldownTimer(24 * 60 * 60 * 1000); }, 7000); }, 100); }, 5000); } resultOverlay.classList.remove('hidden'); setTimeout(() => resultOverlay.classList.add('visible'), 10); }
    function showWinnerScreenFromstorage() { const sceneContainer = document.querySelector('.scene-container'); const resultOverlay = document.getElementById('result-overlay'); const resultImage = document.getElementById('result-image'); const winnerCodeContainer = document.getElementById('winner-code-container'); const winnerCodeEl = document.getElementById('winner-code'); if(!sceneContainer || !resultOverlay || !resultImage || !winnerCodeContainer || !winnerCodeEl) return; sceneContainer.innerHTML = ''; resultImage.src = 'lucky.png'; winnerCodeEl.textContent = localStorage.getItem('cafeRiteWinnerCode'); winnerCodeContainer.classList.remove('hidden'); resultOverlay.classList.remove('hidden'); resultOverlay.classList.add('visible'); }
    function getDeviceId() { let id = localStorage.getItem('cafeRiteDeviceId'); if (!id) { id = 'device-' + Date.now() + Math.random(); localStorage.setItem('cafeRiteDeviceId', id); } return id; }
    function setDailyLock() { localStorage.setItem('cafeRiteLastPlayed', Date.now()); }
    function showCooldownTimer(msLeft) { const sceneContainer = document.querySelector('.scene-container'); if(!sceneContainer) return; sceneContainer.innerHTML = `<div id="cooldown-message" class="cooldown-message"><p class="cooldown-icon">🕒</p><h2>YOUR NEXT CHANCE IS IN</h2><p id="timer-text" class="timer-text"></p></div>`; const timerText = document.getElementById('timer-text'); let interval = setInterval(() => { msLeft -= 1000; if (msLeft <= 0) { clearInterval(interval); buildGameApp(); return; } const h = Math.floor(msLeft / 3600000); const m = Math.floor((msLeft % 3600000) / 60000); const s = Math.floor((msLeft % 60000) / 1000); timerText.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`; }, 1000); }
    function pad(num) { return num < 10 ? '0' + num : num; }
});
