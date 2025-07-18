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
                <main id="scene-container" class="scene-container"></main>
                <footer class="main-footer"></footer>
            </div>
            <div id="result-overlay" class="result-overlay hidden">
                <div class="result-content"><img id="result-image" src="" alt="Game Result"><div id="winner-code-container" class="winner-code-container hidden"><p>YOUR WINNING CODE</p><div id="winner-code" class="winner-code"></div></div></div>
            </div>`;
        playSound('game');
        initializeGame();
    }
    
    // --- THE "OLD AND GOLD" FAST ID (NO FINGERPRINTJS) ---
    let deviceId = null;
    function getDeviceId() {
        if (deviceId) return deviceId;
        // This creates a simple, fast, and effective ID stored locally.
        let id = localStorage.getItem('cafeRiteDeviceId');
        if (!id) {
            id = 'device-' + Date.now() + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('cafeRiteDeviceId', id);
        }
        deviceId = id;
        return deviceId;
    }
    
    // --- CORE GAME LOGIC (Unbreakable & Fast) ---
    async function initializeGame() {
        updateViewersCount();
        const lastPlayed = localStorage.getItem(`cafeRiteLastPlayed_${getDeviceId()}`);
        if (lastPlayed) {
            const timeSince = Date.now() - parseInt(lastPlayed, 10);
            const cooldown = 24 * 60 * 60 * 1000;
            if (timeSince < cooldown) {
                showCooldownTimer(cooldown - timeSince);
                return;
            }
        }
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
    
    function playAnimations(clickedBox, result) {
        populateAllBoxes(result.items);
        clickedBox.querySelector('.box-front').innerHTML = '';
        clickedBox.classList.add('is-flipped');
        setTimeout(() => {
            showResult(result);
        }, 800);
    }
    
    function populateAllBoxes(items) { document.querySelectorAll('.game-box').forEach((box, i) => { if(box) box.querySelector('.box-back').innerHTML = items[i]; }); }

    function showResult(result) {
        const resultOverlay = document.getElementById('result-overlay');
        const resultImage = document.getElementById('result-image');
        const winnerCodeContainer = document.getElementById('winner-code-container');
        const winnerCodeEl = document.getElementById('winner-code');
        if(!resultOverlay) return;

        resultImage.src = result.win ? 'lucky.png' : 'unlucky.png';
        
        setDailyLock(); // Set the lock for both winners and losers
        
        if (result.win) {
            winnerCodeEl.textContent = result.winnerCode;
            winnerCodeContainer.classList.remove('hidden');
        } else {
            winnerCodeContainer.classList.add('hidden');
            setTimeout(() => {
                resultOverlay.classList.remove('visible');
                setTimeout(() => {
                    document.querySelectorAll('.game-box').forEach(box => {
                        if (box) box.classList.add('is-flipped');
                    });
                    setTimeout(() => {
                        showCooldownTimer(24 * 60 * 60 * 1000);
                    }, 7000);
                }, 100);
            }, 5000);
        }
        
        resultOverlay.classList.remove('hidden');
        setTimeout(() => resultOverlay.classList.add('visible'), 10);
    }
    
    function setDailyLock() {
        localStorage.setItem(`cafeRiteLastPlayed_${getDeviceId()}`, Date.now());
    }

    function showCooldownTimer(msLeft) {
        const sceneContainer = document.querySelector('.scene-container');
        if(!sceneContainer) return;
        sceneContainer.innerHTML = `<div id="cooldown-message" class="cooldown-message"><p class="cooldown-icon">🕒</p><h2>YOUR NEXT CHANCE IS IN</h2><p id="timer-text" class="timer-text"></p></div>`;
        const timerText = document.getElementById('timer-text');
        if (!timerText) return;
        
        let interval = setInterval(() => {
            msLeft -= 1000;
            if (msLeft <= 0) {
                clearInterval(interval);
                buildMainApp();
                return;
            }
            const h = Math.floor(msLeft / 3600000);
            const m = Math.floor((msLeft % 3600000) / 60000);
            const s = Math.floor((msLeft % 60000) / 1000);
            if(timerText) timerText.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;
        }, 1000);
    }
    
    function pad(num) {
        return num < 10 ? '0' + num : num;
    }

    async function updateViewersCount() {
        const viewersCountEl = document.getElementById('viewers-count');
        if (!viewersCountEl) return;
        try {
            const response = await fetch(`${BACKEND_URL}/viewers`);
            if (!response.ok) return;
            const data = await response.json();
            viewersCountEl.querySelector('span').textContent = data.count;
            viewersCountEl.classList.remove('hidden');
        } catch (error) {
            console.log("Could not fetch viewer count.");
        }
    }
});
