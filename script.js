// --- The "Legendary" Engine --- //

document.addEventListener('DOMContentLoaded', () => {
    const BACKEND_URL = 'https://shop-op4l.onrender.com';

    // --- DOM ELEMENTS ---
    const rulesOverlay = document.getElementById('rules-overlay');
    const acceptBtn = document.getElementById('accept-rules-btn');
    const statusUploadOverlay = document.getElementById('status-upload-overlay');
    const uploadScreenshotBtn = document.getElementById('upload-screenshot-btn');
    const screenshotUploadInput = document.getElementById('screenshot-upload-input');
    const uploadStatusText = document.getElementById('upload-status-text');
    const mainApp = document.getElementById('main-app');
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
    let loadingInterval = null; // To hold our loading message timer

    // --- HELPER FUNCTIONS ---
    function playSound(type) { 
        try { 
            if (type === 'game') { 
                if (gameMusic) { 
                    gameMusic.volume = 0.3; 
                    gameMusic.play().catch(e => {}); 
                } 
            } else { 
                if (buttonSound) { 
                    buttonSound.currentTime = 0; 
                    buttonSound.volume = 0.5; 
                    buttonSound.play().catch(e => {}); 
                } 
            } 
        } catch (e) {} 
    }
    
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

    // --- OVERLAY MANAGEMENT ---
    function showOverlay(overlay) {
        overlay.classList.remove('hidden');
    }

    function hideOverlay(overlay) {
        overlay.classList.add('hidden');
    }
    
    // --- CORE GAME LOGIC ---
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
            const response = await fetch(`${BACKEND_URL}/play`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deviceId: getDeviceId(), boxIndex: parseInt(boxIndex) })
            });
            if (response.status === 429) {
                const data = await response.json();
                showCooldownTimer(data.cooldownEnd - Date.now());
                return;
            }
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
    
    function populateAllBoxes(items) { 
        document.querySelectorAll('.game-box .box-back').forEach((back, i) => { 
            if (back) back.innerHTML = items[i]; 
        }); 
    }

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
        showOverlay(resultOverlay);
        resultOverlay.classList.add('visible');
    }
    
    function setDailyLock() { 
        localStorage.setItem(`cafeRiteLastPlayed_${getDeviceId()}`, Date.now()); 
    }

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
    
    function pad(num) { 
        return num < 10 ? '0' + num : num; 
    }

    async function updateViewersCount() {
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
    
    // --- SCREENSHOT VERIFICATION LOGIC ---
    async function verifyScreenshot(file) {
        uploadScreenshotBtn.disabled = true;
        uploadStatusText.classList.remove('error');

        // Multi-step loading messages
        const loadingMessages = [
            'Checking Your Image... 💻',
            'AI Analysing... 🤖',
            'Please wait... 🚀'
        ];
        let messageIndex = 0;
        uploadStatusText.textContent = loadingMessages[messageIndex];
        loadingInterval = setInterval(() => {
            messageIndex = (messageIndex + 1) % loadingMessages.length;
            uploadStatusText.textContent = loadingMessages[messageIndex];
        }, 1500);

        try {
            const worker = await Tesseract.createWorker('eng');
            const { data: { text } } = await worker.recognize(file);
            await worker.terminate();

            clearInterval(loadingInterval); // Stop the loading messages

            const lowerCaseText = text.toLowerCase();
            const hasMyStatus = lowerCaseText.includes('my status');
            const hasLocation = lowerCaseText.includes('kattigenahalli');

            if (hasMyStatus && hasLocation) {
                uploadStatusText.textContent = 'Verification successful! Starting game...';
                setTimeout(() => {
                    hideOverlay(statusUploadOverlay);
                    initializeGame();
                }, 1500);
            } else {
                // Throw a generic error for any failure
                throw new Error("Verification failed");
            }
        } catch (error) {
            clearInterval(loadingInterval);
            // Friendly, generic error message as requested
            uploadStatusText.textContent = "Upload Original Screenshot 🙂";
            uploadStatusText.classList.add('error');
            uploadScreenshotBtn.disabled = false;
        }
    }

    // --- MASTER FLOW ---
    // Start with the rules overlay visible.
    showOverlay(rulesOverlay);

    acceptBtn.addEventListener('click', () => {
        playSound('button');
        hideOverlay(rulesOverlay);
        showOverlay(statusUploadOverlay);

        // --- NEW AUTO-SCROLL LOGIC ---
        // After 3 seconds, smoothly scroll to the bottom of the upload page
        setTimeout(() => {
            if (statusUploadOverlay && !statusUploadOverlay.classList.contains('hidden')) {
                statusUploadOverlay.scrollTo({
                    top: statusUploadOverlay.scrollHeight,
                    behavior: 'smooth'
                });
            }
        }, 3000);
    });

    uploadScreenshotBtn.addEventListener('click', () => {
        playSound('button');
        // This button now triggers the hidden file input
        screenshotUploadInput.click();
    });

    screenshotUploadInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            // Reset the input so the user can upload the same file again if it fails
            screenshotUploadInput.value = '';
            verifyScreenshot(file);
        }
    });
});
