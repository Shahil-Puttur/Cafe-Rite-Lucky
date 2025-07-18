// --- The "Legendary" Engine --- //

document.addEventListener('DOMContentLoaded', () => {
    const BACKEND_URL = 'https://shop-op4l.onrender.com';

    const rulesOverlay = document.getElementById('rules-overlay');
    const acceptBtn = document.getElementById('accept-rules-btn');
    const appContainer = document.getElementById('app-container');

    let gameMusic, buttonSound;
    function playSound(type) { /* ... unchanged ... */ }

    acceptBtn.addEventListener('click', () => { playSound('button'); rulesOverlay.classList.add('hidden'); buildMainApp(); });

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
    
    // --- CORE GAME LOGIC (Unbreakable & Fast) ---
    async function initializeGame() {
        updateViewersCount();
        const lastPlayed = localStorage.getItem('cafeRiteLastPlayed');
        if (lastPlayed) { const timeSince = Date.now() - parseInt(lastPlayed, 10); const cooldown = 24 * 60 * 60 * 1000; if (timeSince < cooldown) { showCooldownTimer(cooldown - timeSince); return; } }
        
        const hasUsedSecondChance = localStorage.getItem('cafeRiteSecondChanceUsed');
        if (hasUsedSecondChance === 'true') {
            showCooldownTimer(0); // If they already used a second chance, force cooldown
            return;
        }
        
        createGameGrid();
    }
    
    function createGameGrid() { /* ... unchanged ... */ }
    async function handleBoxClick(event) { /* ... unchanged ... */ }
    function playAnimations(clickedBox, result) { /* ... unchanged ... */ }
    function populateAllBoxes(items) { /* ... unchanged ... */ }
    function showResult(result) { /* ... The new logic lives here ... */ }
    function getDeviceId() { /* ... unchanged ... */ }
    function setDailyLock(isSecondChance = false) { /* ... updated ... */ }
    function showCooldownTimer(msLeft) { /* ... unchanged ... */ }
    function pad(num) { /* ... unchanged ... */ }
    async function updateViewersCount() { /* ... unchanged ... */ }
    
    // --- NEW "PLAY AGAIN" FUNCTIONS ---
    function buildPlayAgainPrompt() { /* ... new ... */ }
    function buildShareRules() { /* ... new ... */ }
    async function handleShareClick() { /* ... new ... */ }
    function buildProofUpload() { /* ... new ... */ }
    async function handleProofUpload(fileInput, chanceCounter) { /* ... new ... */ }
    function buildSuccessMessage() { /* ... new ... */ }
    
    // Re-pasting full logic for completeness
    function playSound(type) { try { if (type === 'game') { if (!gameMusic) gameMusic = new Audio('game.mp3'); gameMusic.volume = 0.3; gameMusic.play().catch(e => {}); } else { if (!buttonSound) buttonSound = new Audio('button.mp3'); buttonSound.volume = 0.5; buttonSound.currentTime = 0; buttonSound.play().catch(e => {}); } } catch (e) {} }
    function createGameGrid() { const scene = document.getElementById('scene-container'); if (!scene) return; scene.innerHTML = `<div id="game-grid" class="game-grid"></div>`; const gameGrid = document.getElementById('game-grid'); for (let i = 0; i < 9; i++) { const box = document.createElement('div'); box.className = 'game-box'; box.dataset.index = i; box.addEventListener('click', handleBoxClick, { once: true }); box.innerHTML = `<div class="box-face box-front"></div><div class="box-face box-back"></div>`; gameGrid.appendChild(box); } }
    async function handleBoxClick(event) { playSound('button'); const clickedBox = event.currentTarget; const boxIndex = clickedBox.dataset.index; document.querySelectorAll('.game-box').forEach(b => b.classList.add('is-disabled')); clickedBox.querySelector('.box-front').innerHTML = '<div class="loading-spinner"></div>'; try { const response = await fetch(`${BACKEND_URL}/play`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ deviceId: getDeviceId(), boxIndex: parseInt(boxIndex) }) }); if (!response.ok) throw new Error(`Server Error: ${response.status}`); const result = await response.json(); playAnimations(clickedBox, result); } catch (error) { console.error("CRITICAL: Game server connection failed.", error); alert("Sorry, the game server is busy. Please refresh and try again."); document.querySelectorAll('.game-box').forEach(b => { b.classList.remove('is-disabled'); b.querySelector('.box-front').innerHTML = ''; }); } }
    function playAnimations(clickedBox, result) { populateAllBoxes(result.items); clickedBox.querySelector('.box-front').innerHTML = ''; clickedBox.classList.add('is-flipped'); setTimeout(() => { showResult(result); }, 800); }
    function populateAllBoxes(items) { document.querySelectorAll('.game-box').forEach((box, i) => { if(box) box.querySelector('.box-back').innerHTML = items[i]; }); }
    function showResult(result) { const resultOverlay = document.getElementById('result-overlay'); const resultImage = document.getElementById('result-image'); const winnerCodeContainer = document.getElementById('winner-code-container'); const winnerCodeEl = document.getElementById('winner-code'); if(!resultOverlay) return; resultImage.src = result.win ? 'lucky.png' : 'unlucky.png'; if (result.win) { winnerCodeEl.textContent = result.winnerCode; winnerCodeContainer.classList.remove('hidden'); setDailyLock(); } else { winnerCodeContainer.classList.add('hidden'); setTimeout(() => { resultOverlay.classList.remove('visible'); setTimeout(() => { document.querySelectorAll('.game-box').forEach(box => { if (box) box.classList.add('is-flipped'); }); const hasUsedSecondChance = localStorage.getItem('cafeRiteSecondChanceUsed'); if (hasUsedSecondChance === 'true') { setTimeout(() => { showCooldownTimer(24 * 60 * 60 * 1000); }, 7000); } else { setTimeout(buildPlayAgainPrompt, 4000); } }, 100); }, 5000); } resultOverlay.classList.remove('hidden'); setTimeout(() => resultOverlay.classList.add('visible'), 10); }
    function buildPlayAgainPrompt() { const scene = document.getElementById('scene-container'); if (!scene) return; scene.innerHTML = `<div class="prompt-container"><button id="play-again-btn" class="prompt-btn primary">Play Again</button><button id="back-btn" class="prompt-btn secondary">Back</button></div>`; document.getElementById('play-again-btn').addEventListener('click', () => { playSound('button'); buildShareRules(); }); document.getElementById('back-btn').addEventListener('click', () => { playSound('button'); setDailyLock(); showCooldownTimer(24 * 60 * 60 * 1000); }); setTimeout(() => { if (document.getElementById('play-again-btn')) { setDailyLock(); showCooldownTimer(24 * 60 * 60 * 1000); } }, 60000); }
    function buildShareRules() { const scene = document.getElementById('scene-container'); if (!scene) return; scene.innerHTML = `<div class="share-rules"><h2>🤩 Want a Second Chance?</h2><div class="rules-list"><div class="rule-item"><span>📲</span><p><strong>Share Our Poster!</strong> Tap the button below to share our poster to your WhatsApp Status.</p></div><div class="rule-item"><span>📸</span><p><strong>Take a Screenshot!</strong> After posting, take a screenshot of your status.</p></div><div class="rule-item"><span>🤖</span><p><strong>Upload Your Proof!</strong> You'll be asked to upload the screenshot for our AI to verify.</p></div></div><div class="prompt-container"><button id="share-btn" class="prompt-btn primary">Share Status</button><button id="back-btn-share" class="prompt-btn secondary">Back</button></div></div>`; document.getElementById('share-btn').addEventListener('click', handleShareClick); document.getElementById('back-btn-share').addEventListener('click', () => { playSound('button'); setDailyLock(); showCooldownTimer(24 * 60 * 60 * 1000); }); }
    async function handleShareClick() { playSound('button'); const shareData = { title: 'Cafe Rite', text: 'Check out this awesome game from Cafe Rite!', url: window.location.href }; try { if (navigator.share) { await navigator.share(shareData); setTimeout(buildProofUpload, 5000); } else { alert("Please share our poster to your status!"); setTimeout(buildProofUpload, 5000); } } catch (err) { console.log('Share was cancelled.'); } }
    function buildProofUpload(chanceCounter = 1) { const scene = document.getElementById('scene-container'); if (!scene) return; scene.innerHTML = `<div class="upload-container"><h2>🤖 AI Verification</h2><p style="opacity: 0.7; margin-bottom: 20px;">Upload the screenshot of your status.</p><input type="file" id="proof-upload" accept="image/*"><div id="ai-robot" class="ai-robot hidden"></div><p id="upload-status" style="margin-top: 15px;"></p></div>`; document.getElementById('proof-upload').addEventListener('change', (event) => handleProofUpload(event.target, chanceCounter)); }
    async function handleProofUpload(fileInput, chanceCounter) { const file = fileInput.files[0]; if (!file) return; const robot = document.getElementById('ai-robot'); const status = document.getElementById('upload-status'); fileInput.style.display = 'none'; if(robot) robot.classList.remove('hidden'); if(status) status.textContent = 'Analyzing image...'; const formData = new FormData(); formData.append('proof', file); try { const response = await fetch(`${BACKEND_URL}/verify-proof`, { method: 'POST', body: formData }); const result = await response.json(); if(robot) robot.classList.add('hidden'); if (result.success) { buildSuccessMessage(); } else { if (chanceCounter < 2) { if(status) status.textContent = "Verification failed. Please upload a real screenshot. You have one more chance."; setTimeout(() => buildProofUpload(2), 3000); } else { if(status) status.textContent = "Verification failed. See you tomorrow!"; setDailyLock(); setTimeout(() => showCooldownTimer(24 * 60 * 60 * 1000), 2000); } } } catch (err) { alert('Upload failed. Please try again.'); fileInput.style.display = 'block'; if(robot) robot.classList.add('hidden'); if(status) status.textContent = ''; } }
    function buildSuccessMessage() { const scene = document.getElementById('scene-container'); if (!scene) return; scene.innerHTML = `<div class="success-message"><h2>Thanks For Your Support! 🤝</h2><p style="opacity:0.8; margin: 10px 0 25px;">Cafe Rite Team.. ✌🏻</p><button id="final-play-btn" class="prompt-btn primary">Play Again 🔥</button></div>`; document.getElementById('final-play-btn').addEventListener('click', () => { playSound('button'); setDailyLock(true); createGameGrid(); }); }
    function getDeviceId() { let id = localStorage.getItem('cafeRiteDeviceId'); if (!id) { id = 'device-' + Date.now() + Math.random().toString(36).substr(2, 9); localStorage.setItem('cafeRiteDeviceId', id); } return id; }
    function setDailyLock(isSecondChance = false) { localStorage.setItem('cafeRiteLastPlayed', Date.now()); if(isSecondChance) localStorage.setItem('cafeRiteSecondChanceUsed', 'true'); }
    function showCooldownTimer(msLeft) { const scene = document.getElementById('scene-container'); if(!scene) return; scene.innerHTML = `<div id="cooldown-message" class="cooldown-message"><p class="cooldown-icon">🕒</p><h2>YOUR NEXT CHANCE IS IN</h2><p id="timer-text" class="timer-text"></p></div>`; const timerText = document.getElementById('timer-text'); if (!timerText) return; let interval = setInterval(() => { msLeft -= 1000; if (msLeft <= 0) { clearInterval(interval); buildMainApp(); return; } const h = Math.floor(msLeft / 3600000); const m = Math.floor((msLeft % 3600000) / 60000); const s = Math.floor((msLeft % 60000) / 1000); if(timerText) timerText.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`; }, 1000); }
    function pad(num) { return num < 10 ? '0' + num : num; }
    async function updateViewersCount() { const viewersCountEl = document.getElementById('viewers-count'); if (!viewersCountEl) return; try { const response = await fetch(`${BACKEND_URL}/viewers`); if (!response.ok) return; const data = await response.json(); viewersCountEl.querySelector('span').textContent = data.count; viewersCountEl.classList.remove('hidden'); } catch (error) { console.log("Could not fetch viewer count."); } }
});
