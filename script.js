// --- The "Legendary" Engine --- //

document.addEventListener('DOMContentLoaded', () => {
    const BACKEND_URL = 'https://shop-op4l.onrender.com';

    // Get all elements that exist on the page from the start
    const rulesOverlay = document.getElementById('rules-overlay');
    const acceptBtn = document.getElementById('accept-rules-btn');
    const mainApp = document.getElementById('main-app');
    const sceneContainer = document.getElementById('scene-container');
    const resultOverlay = document.getElementById('result-overlay');
    const resultImage = document.getElementById('result-image');
    const winnerCodeContainer = document.getElementById('winner-code-container');
    const winnerCodeEl = document.getElementById('winner-code');
    const gameGrid = document.getElementById('game-grid');
    const cooldownMessage = document.getElementById('cooldown-message');
    const viewersCountEl = document.getElementById('viewers-count');
    const gameMusic = document.getElementById('game-music');
    const buttonSound = document.getElementById('button-sound');
    
    let deviceId = null;

    function playSound(type) { try { if (type === 'game') { if (gameMusic) { gameMusic.volume = 0.3; gameMusic.play().catch(e => {}); } } else { if (buttonSound) { buttonSound.currentTime = 0; buttonSound.volume = 0.5; buttonSound.play().catch(e => {}); } } } catch (e) {} }
    
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
    
    async function initializeGame() {
        mainApp.classList.remove('hidden');
        playSound('game');
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
        gameGrid.classList.remove('hidden');
        cooldownMessage.classList.add('hidden');
        gameGrid.innerHTML = '';
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
            // The request is now simpler and faster
            const response = await fetch(`${BACKEND_URL}/play`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ boxIndex: parseInt(boxIndex) })
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
        setTimeout(() => { showResult(result); }, 800);
    }
    
    function populateAllBoxes(items) { document.querySelectorAll('.game-box .box-back').forEach((back, i) => { if(back) back.innerHTML = items[i]; }); }

    function showResult(result) {
        setDailyLock();
        resultImage.src = result.win ? 'lucky.png' : 'unlucky.png';
        if (result.win) {
            winnerCodeEl.textContent = result.winnerCode;
            winnerCodeContainer.classList.remove('hidden');
        } else {
            winnerCodeContainer.classList.add('hidden');
            setTimeout(() => {
                resultOverlay.classList.remove('visible');
                setTimeout(() => {
                    document.querySelectorAll('.game-box').forEach(box => box.classList.add('is-flipped'));
                    setTimeout(() => { showCooldownTimer(24 * 60 * 60 * 1000); }, 7000);
                }, 100);
            }, 5000);
        }
        resultOverlay.classList.remove('hidden');
        setTimeout(() => resultOverlay.classList.add('visible'), 10);
    }
    
    function setDailyLock() { localStorage.setItem(`cafeRiteLastPlayed_${getDeviceId()}`, Date.now()); }

    function showCooldownTimer(msLeft) {
        gameGrid.classList.add('hidden');
        cooldownMessage.classList.remove('hidden');
        const timerText = document.getElementById('timer-text');
        if (!timerText) return;
        
        let interval = setInterval(() => {
            msLeft -= 1000;
            if (msLeft <= 0) {
                clearInterval(interval);
                localStorage.removeItem(`cafeRiteLastPlayed_${getDeviceId()}`);
                window.location.reload();
                return;
            }
            const h = Math.floor(msLeft / 3600000);
            const m = Math.floor((msLeft % 3600000) / 60000);
            const s = Math.floor((msLeft % 60000) / 1000);
            timerText.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;
        }, 1000);
    }
    
    function pad(num) { return num < 10 ? '0' + num : num; }

    async function updateViewersCount() {
        if (!viewersCountEl) return;
        try {
            const response = await fetch(`${BACKEND_URL}/viewers`);
            if (!response.ok) return;
            const data = await response.json();
            viewersCountEl.querySelector('span').textContent = data.count;
            viewersCountEl.classList.remove('hidden');
        } catch (error) { console.log("Could not fetch viewer count."); }
    }
    
    // --- MASTER FLOW ---
    acceptBtn.addEventListener('click', () => {
        playSound('button');
        rulesOverlay.classList.add('hidden');
        initializeGame();
    });
});
