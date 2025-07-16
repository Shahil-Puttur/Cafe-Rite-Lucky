// --- The "Flawless" Engine --- //

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
            <div id="main-container" class="main-container">
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

    // --- THE SMART SYNC LOGIC ---
    async function initializeGame() {
        try {
            // Ask the server for the current game version
            const statusResponse = await fetch(`${BACKEND_URL}/status`);
            if (!statusResponse.ok) throw new Error('Cannot reach server for status check.');
            const serverStatus = await statusResponse.json();
            const serverVersion = serverStatus.version;
            
            const localVersion = localStorage.getItem('cafeRiteGameVersion');

            // If server version is newer, a reset has happened!
            if (serverVersion > localVersion) {
                console.log('Server reset detected! Clearing all local data.');
                localStorage.removeItem('cafeRiteLastPlayed');
                localStorage.removeItem('cafeRiteWinnerExpiry');
                localStorage.removeItem('cafeRiteWinnerCode');
                localStorage.setItem('cafeRiteGameVersion', serverVersion);
            }

            // Now, proceed with the normal checks using clean data
            const winnerExpiry = localStorage.getItem('cafeRiteWinnerExpiry');
            if (winnerExpiry && Date.now() < parseInt(winnerExpiry, 10)) { showWinnerScreenFromStorage(); return; }
            
            const lastPlayed = localStorage.getItem('cafeRiteLastPlayed');
            if (lastPlayed) { const timeSince = Date.now() - parseInt(lastPlayed, 10); const cooldown = 24 * 60 * 60 * 1000; if (timeSince < cooldown) { showCooldownTimer(cooldown - timeSince); return; } }

            createGameGrid();
        } catch (error) {
            console.error("Initialization failed:", error);
            alert("Could not connect to the game. Please check your internet connection and refresh.");
        }
    }
    
    function createGameGrid() {
        const gameGrid = document.getElementById('game-grid'); const cooldownMessage = document.getElementById('cooldown-message'); if (!gameGrid || !cooldownMessage) return;
        gameGrid.style.display = 'grid'; cooldownMessage.classList.add('hidden'); gameGrid.innerHTML = '';
        for (let i = 0; i < 9; i++) { const box = document.createElement('div'); box.className = 'game-box'; box.addEventListener('click', handleBoxClick, { once: true }); box.innerHTML = `<div class="box-face box-front"></div><div class="box-face box-back"></div>`; gameGrid.appendChild(box); }
    }

    async function handleBoxClick(event) {
        playSound('button');
        document.querySelectorAll('.game-box').forEach(b => b.classList.add('is-disabled'));
        const clickedBox = event.currentTarget;
        try {
            const response = await fetch(`${BACKEND_URL}/play`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ deviceId: getDeviceId() }) });
            if (!response.ok) throw new Error(`Server Error: ${response.status}`);
            const result = await response.json();
            playAnimations(clickedBox, result);
        } catch (error) { console.error("CRITICAL: Game server connection failed.", error); alert("Sorry, the game server is busy. Please try again in a moment."); document.querySelectorAll('.game-box').forEach(b => b.classList.remove('is-disabled')); }
    }

    function playAnimations(clickedBox, result) {
        populateAllBoxes(result.items);
        const clickedIndex = Array.from(clickedBox.parentNode.children).indexOf(clickedBox);
        
        // This is the core bug fix for the "false winner"
        const finalResult = { ...result, win: result.items[clickedIndex] === '🍔' };

        clickedBox.classList.add('is-flipped');
        setTimeout(() => {
            showResult(finalResult);
            setDailyLock();
        }, 800);
    }
    
    function populateAllBoxes(items) { document.querySelectorAll('.game-box').forEach((box, i) => { if(box) box.querySelector('.box-back').innerHTML = items[i]; }); }

    function showResult(result) {
        const resultOverlay = document.getElementById('result-overlay'); const resultImage = document.getElementById('result-image'); const winnerCodeContainer = document.getElementById('winner-code-container'); const winnerCodeEl = document.getElementById('winner-code'); if(!resultOverlay || !resultImage || !winnerCodeContainer || !winnerCodeEl) return;
        
        if (result.win) {
            resultImage.src = 'lucky.png';
            winnerCodeEl.textContent = result.winnerCode;
            winnerCodeContainer.classList.remove('hidden');
            const expiryTime = Date.now() + 60 * 60 * 1000;
            localStorage.setItem('cafeRiteWinnerExpiry', expiryTime);
            localStorage.setItem('cafeRiteWinnerCode', result.winnerCode);
        } else {
            resultImage.src = 'unlucky.png';
            winnerCodeContainer.classList.add('hidden');
            setTimeout(() => {
                resultOverlay.classList.remove('visible');
                setTimeout(() => { 
                    document.querySelectorAll('.game-box').forEach(box => { if (box) box.classList.add('is-flipped'); });
                    setTimeout(() => { showCooldownTimer(24 * 60 * 60 * 1000); }, 7000); // 7 seconds after revealing boxes
                }, 100);
            }, 5000);
        }
        
        resultOverlay.classList.remove('hidden');
        setTimeout(() => resultOverlay.classList.add('visible'), 10);
    }
    
    function showWinnerScreenFromStorage() { /* ... unchanged ... */ }
    function getDeviceId() { /* ... unchanged ... */ }
    function setDailyLock() { /* ... unchanged ... */ }
    function showCooldownTimer(msLeft) { /* ... unchanged ... */ }
    function pad(num) { /* ... unchanged ... */ }

    function showWinnerScreenFromStorage() { const gameGrid = document.getElementById('game-grid'); const cooldownMessage = document.getElementById('cooldown-message'); const resultOverlay = document.getElementById('result-overlay'); const resultImage = document.getElementById('result-image'); const winnerCodeContainer = document.getElementById('winner-code-container'); const winnerCodeEl = document.getElementById('winner-code'); if(!gameGrid || !cooldownMessage || !resultOverlay || !resultImage || !winnerCodeContainer || !winnerCodeEl) return; gameGrid.style.display = 'none'; cooldownMessage.classList.add('hidden'); resultImage.src = 'lucky.png'; winnerCodeEl.textContent = localStorage.getItem('cafeRiteWinnerCode'); winnerCodeContainer.classList.remove('hidden'); resultOverlay.classList.remove('hidden'); resultOverlay.classList.add('visible'); }
    function getDeviceId() { let id = localStorage.getItem('cafeRiteDeviceId'); if (!id) { id = 'device-' + Date.now() + Math.random(); localStorage.setItem('cafeRiteDeviceId', id); } return id; }
    function setDailyLock() { localStorage.setItem('cafeRiteLastPlayed', Date.now()); }
    function showCooldownTimer(msLeft) { const gameGrid = document.getElementById('game-grid'); const cooldownMessage = document.getElementById('cooldown-message'); const timerText = document.getElementById('timer-text'); if(!gameGrid || !cooldownMessage || !timerText) return; gameGrid.style.display = 'none'; cooldownMessage.classList.remove('hidden'); let interval = setInterval(() => { msLeft -= 1000; if (msLeft <= 0) { clearInterval(interval); createGameGrid(); return; } const h = Math.floor(msLeft / 3600000); const m = Math.floor((msLeft % 3600000) / 60000); const s = Math.floor((msLeft % 60000) / 1000); timerText.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`; }, 1000); }
    function pad(num) { return num < 10 ? '0' + num : num; }
});
