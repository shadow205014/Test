// Game variables
const player = document.getElementById('player');
const sansElement = document.getElementById('sans');
const gameArea = document.querySelector('.game-area');
const startBtn = document.getElementById('start-btn');
const scoreDisplay = document.getElementById('score');
const healthDisplay = document.getElementById('health');
const messageDisplay = document.getElementById('message');

// Initialize WebsimSocket for multiplayer
const room = new WebsimSocket();

// Create an object to track key presses
const keys = {};

let gameRunning = false;
let playerHealth = 100;
let score = 0;
let bones = [];
let playerX = 300;
let playerY = 300;
let lastPlayerX = 300;
let lastPlayerY = 300;
let isPlayerMoving = false;
const playerSpeed = 5;
let boneInterval;
let scoreInterval;
let dodgeCount = 0;
let backgroundMusic;
let karmaEffect = 0;
let karmaInterval;
let itemButtons = [];
let pieUsed = false;
let itemMenuOpen = false;
let hasActiveItemButton = false;
let lastBoneWasBlue = false;
let playerStunned = false;

// Initialize player position
player.style.left = playerX + 'px';
player.style.top = playerY + 'px';

// Event listeners
startBtn.addEventListener('click', function() {
    if (startBtn.textContent === 'RESET') {
        window.location.reload();
    } else {
        startGame();
    }
});

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    // Check for item activation with Z or Enter
    if ((e.key === 'z' || e.key === 'Enter') && gameRunning && !itemMenuOpen) {
        checkItemButtonCollision();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Game functions
function startGame() {
    if (gameRunning) return;
    
    resetGame();
    gameRunning = true;
    startBtn.textContent = 'RESET';
    startBtn.classList.add('reset');
    messageDisplay.innerHTML = "* don't get hit by the bones!";
    
    // Play Megalovania background music with error handling
    if (!backgroundMusic) {
        backgroundMusic = new Audio('1-13 Megalovania.mp3');
        backgroundMusic.volume = 0.3;
        backgroundMusic.loop = true;
        
        // Add error handling for audio
        backgroundMusic.onerror = function() {
            console.log("Error loading audio. Trying alternative source.");
            // Fallback to a CDN hosted version
            backgroundMusic.src = "https://cdn.freesound.org/previews/448/448271_7913959-lq.mp3";
        };
    }
    
    try {
        backgroundMusic.currentTime = 0;
        const playPromise = backgroundMusic.play();
        
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log("Playback failed:", error);
                messageDisplay.innerHTML += "<br>* click anywhere to enable music";
                
                document.addEventListener('click', function audioClickHandler() {
                    backgroundMusic.play().catch(e => console.log("Still can't play audio:", e));
                    document.removeEventListener('click', audioClickHandler);
                }, { once: true });
            });
        }
    } catch (e) {
        console.log("Error playing audio:", e);
    }
    
    requestAnimationFrame(gameLoop);
    boneInterval = setInterval(createBone, 800);
    scoreInterval = setInterval(() => {
        score += 10;
        scoreDisplay.textContent = score;
    }, 1000);
    
    sansElement.classList.add('flashing');
    playTextSound();
}

function resetGame() {
    bones.forEach(bone => bone.element.remove());
    bones = [];
    
    itemButtons.forEach(item => item.element.remove());
    itemButtons = [];
    
    playerHealth = 100;
    score = 0;
    dodgeCount = 0;
    playerX = 300;
    playerY = 300;
    lastPlayerX = 300;
    lastPlayerY = 300;
    karmaEffect = 0;
    pieUsed = false;
    playerStunned = false;
    
    updateKarmaDisplay();
    
    if (karmaInterval) {
        clearInterval(karmaInterval);
        karmaInterval = null;
    }
    
    player.style.left = playerX + 'px';
    player.style.top = playerY + 'px';
    player.style.filter = '';
    healthDisplay.textContent = playerHealth;
    scoreDisplay.textContent = score;
    
    const existingMenu = document.querySelector('.item-menu');
    if (existingMenu) {
        existingMenu.remove();
    }
}

function gameLoop() {
    if (!gameRunning) return;
    
    isPlayerMoving = (playerX !== lastPlayerX || playerY !== lastPlayerY);
    lastPlayerX = playerX;
    lastPlayerY = playerY;
    
    movePlayer();
    moveBones();
    moveItemButtons();
    checkCollisions();
    
    if (gameRunning) {
        requestAnimationFrame(gameLoop);
    }
}

function movePlayer() {
    // If player is stunned, don't allow movement
    if (playerStunned) return;
    
    if (keys['ArrowUp'] || keys['w']) {
        playerY = Math.max(0, playerY - playerSpeed);
    }
    if (keys['ArrowDown'] || keys['s']) {
        playerY = Math.min(gameArea.clientHeight - player.clientHeight, playerY + playerSpeed);
    }
    if (keys['ArrowLeft'] || keys['a']) {
        playerX = Math.max(0, playerX - playerSpeed);
    }
    if (keys['ArrowRight'] || keys['d']) {
        playerX = Math.min(gameArea.clientWidth - player.clientWidth, playerX + playerSpeed);
    }
    
    player.style.left = playerX + 'px';
    player.style.top = playerY + 'px';
}

function createBone() {
    if (!gameRunning) return;
    
    // Only create an item button if we don't already have one active
    // and there's a 12.6% chance
    if (!hasActiveItemButton && Math.random() < 0.126) {
        createItemButton();
        return;
    }
    
    // Decide if this should be a blue bone (30% chance, but not twice in a row)
    const isBlue = !lastBoneWasBlue && Math.random() < 0.3;
    lastBoneWasBlue = isBlue;
    
    // Create bone element
    const bone = document.createElement('div');
    bone.className = isBlue ? 'blue-bone' : 'bone';
    
    let boneX, boneY, width, height, speedX, speedY;
    
    // Random position and direction for both normal and blue bones
    const fromTop = Math.random() < 0.5;
    const size = 20 + Math.random() * 30;
    
    if (fromTop) {
        // Horizontal bone from top/bottom
        width = size * 2;
        height = size;
        boneX = Math.random() * (gameArea.clientWidth - width);
        boneY = Math.random() < 0.5 ? -height : gameArea.clientHeight;
        speedX = 0;
        speedY = boneY < 0 ? 3 + Math.random() * 2 : -3 - Math.random() * 2;
    } else {
        // Vertical bone from left/right
        width = size;
        height = size * 2;
        boneX = Math.random() < 0.5 ? -width : gameArea.clientWidth;
        boneY = Math.random() * (gameArea.clientHeight - height);
        speedX = boneX < 0 ? 3 + Math.random() * 2 : -3 - Math.random() * 2;
        speedY = 0;
    }
    
    // If it's a blue bone, randomly increase its size
    if (isBlue) {
        const sizeMultiplier = Math.random();
        
        if (sizeMultiplier < 0.2) {
            // Small - 20% - no change
        } else if (sizeMultiplier < 0.7) {
            // Medium - 50%
            width *= 1.5;
            height *= 1.5;
        } else if (sizeMultiplier < 0.8) {
            // Big - 10%
            width *= 2;
            height *= 2;
        } else if (sizeMultiplier < 0.95) {
            // Tall - 15%
            width *= 1.2;
            height *= 3;
        } else {
            // Very tall - 5%
            width *= 1;
            height *= 4;
        }
    }
    
    bone.style.width = width + 'px';
    bone.style.height = height + 'px';
    bone.style.left = boneX + 'px';
    bone.style.top = boneY + 'px';
    
    if (!isBlue) {
        bone.style.transform = Math.random() < 0.5 ? 'rotate(90deg)' : 'rotate(0deg)';
    } else {
        bone.style.transform = fromTop ? 'rotate(90deg)' : 'rotate(0deg)';
    }
    
    gameArea.appendChild(bone);
    
    bones.push({
        element: bone,
        x: boneX,
        y: boneY,
        width,
        height,
        speedX,
        speedY,
        isBlue
    });
    
    // Increase difficulty every 10 bones
    dodgeCount++;
    if (dodgeCount % 10 === 0 && dodgeCount > 0) {
        clearInterval(boneInterval);
        const newInterval = Math.max(300, 800 - (dodgeCount / 10) * 50);
        boneInterval = setInterval(createBone, newInterval);
    }
}

function moveBones() {
    for (let i = bones.length - 1; i >= 0; i--) {
        const bone = bones[i];
        bone.x += bone.speedX;
        bone.y += bone.speedY;
        
        bone.element.style.left = bone.x + 'px';
        bone.element.style.top = bone.y + 'px';
        
        // Remove bones that have gone off screen
        if (
            bone.x < -bone.width * 2 || 
            bone.x > gameArea.clientWidth + bone.width || 
            bone.y < -bone.height * 2 || 
            bone.y > gameArea.clientHeight + bone.height
        ) {
            bone.element.remove();
            bones.splice(i, 1);
        }
    }
}

function moveItemButtons() {
    for (let i = itemButtons.length - 1; i >= 0; i--) {
        const item = itemButtons[i];
        
        // Move the item button
        item.x += item.speedX;
        item.y += item.speedY;
        
        item.element.style.left = item.x + 'px';
        item.element.style.top = item.y + 'px';
        
        // Increase lifetime
        item.lifetime += 1;
        
        // Remove item if it goes off screen or after some time (about 10 seconds at 60fps)
        if (
            item.x < -item.width * 2 || 
            item.x > gameArea.clientWidth + item.width || 
            item.y < -item.height * 2 || 
            item.y > gameArea.clientHeight + item.height ||
            item.lifetime > 600
        ) {
            item.element.remove();
            itemButtons.splice(i, 1);
            hasActiveItemButton = false;
        }
    }
}

function createItemButton() {
    // Don't create a new button if one already exists
    if (hasActiveItemButton) return;
    
    const itemButton = document.createElement('div');
    itemButton.className = 'item-button';
    
    // Random position within game area
    let bx = Math.random() * (gameArea.clientWidth - 80);
    let by = Math.random() * (gameArea.clientHeight - 35);
    
    // Random movement speed and direction - same as the bones' attack pattern
    let speedX = 0;
    let speedY = 0;
    
    // Decide random direction similar to bones
    const fromTop = Math.random() < 0.5;
    
    if (fromTop) {
        // Horizontal movement from top/bottom
        bx = Math.random() * (gameArea.clientWidth - 80);
        by = Math.random() < 0.5 ? -35 : gameArea.clientHeight;
        speedX = 0;
        speedY = by < 0 ? 3 + Math.random() * 2 : -3 - Math.random() * 2;
    } else {
        // Vertical movement from left/right
        bx = Math.random() < 0.5 ? -80 : gameArea.clientWidth;
        by = Math.random() * (gameArea.clientHeight - 35);
        speedX = bx < 0 ? 3 + Math.random() * 2 : -3 - Math.random() * 2;
        speedY = 0;
    }
    
    itemButton.style.left = bx + 'px';
    itemButton.style.top = by + 'px';
    
    gameArea.appendChild(itemButton);
    
    itemButtons.push({
        element: itemButton,
        x: bx,
        y: by,
        width: 80,
        height: 35,
        speedX: speedX,
        speedY: speedY,
        lifetime: 0
    });
    
    hasActiveItemButton = true;
}

function checkItemButtonCollision() {
    if (itemButtons.length === 0) return;
    
    const playerRect = {
        x: playerX + 14,
        y: playerY + 14,
        width: 22,
        height: 22
    };
    
    for (let i = 0; i < itemButtons.length; i++) {
        const item = itemButtons[i];
        const itemRect = {
            x: item.x,
            y: item.y,
            width: item.width,
            height: item.height
        };
        
        if (
            playerRect.x < itemRect.x + itemRect.width &&
            playerRect.x + playerRect.width > itemRect.x &&
            playerRect.y < itemRect.y + itemRect.height &&
            playerRect.y + playerRect.height > itemRect.y
        ) {
            // Colliding with an item button - use an item automatically
            useRandomItem(item);
            break;
        }
    }
}

function useRandomItem(itemButton) {
    // Create a random item based on the probability distribution
    let itemType = Math.random();
    let item;
    
    if (itemType < 0.03 && !pieUsed) {
        // 3% - Pie (Full HP) - only once per game
        item = { name: 'PIE', healing: 100, description: '* Restores all HP' };
    } else if (itemType < 0.18) { 
        // 15% - MTT Steak (60 HP)
        item = { name: 'MTT STEAK', healing: 60, description: '* Restores 60 HP' };
    } else if (itemType < 0.48) { 
        // 30% - Snowman Piece (45 HP)
        item = { name: 'SNOWMAN', healing: 45, description: '* Restores 45 HP' };
    } else {
        // 40% - Legendary Hero (40 HP)
        item = { name: 'L. HERO', healing: 40, description: '* Restores 40 HP' };
    }
    
    // Use the item
    useItem(item);
    
    // Remove the item button
    itemButton.element.remove();
    itemButtons = itemButtons.filter(b => b !== itemButton);
    hasActiveItemButton = false;
}

function useItem(item) {
    let healAmount = item.healing;
    
    // Check if it's a pie (full heal)
    if (item.name === 'PIE') {
        healAmount = 100; 
        pieUsed = true;
    }
    
    // Apply healing and reduce karma first
    if (karmaEffect > 0) {
        // Reduce karma first by the heal amount
        if (healAmount >= karmaEffect) {
            // If heal amount is more than karma, reduce karma to 0 and heal the rest
            const remainingHeal = healAmount - karmaEffect;
            karmaEffect = 0;
            playerHealth = Math.min(100, playerHealth + remainingHeal);
        } else {
            // If heal amount is less than karma, just reduce karma
            karmaEffect -= healAmount;
        }
    } else {
        // No karma, just heal normally
        playerHealth = Math.min(100, playerHealth + healAmount);
    }
    
    // Update display
    healthDisplay.textContent = playerHealth;
    updateKarmaDisplay();
    
    // Show healing message with exact number of HP recovered
    messageDisplay.innerHTML = `* You ate the ${item.name}.<br>* You recovered ${healAmount} HP!`;
    
    // Play healing sound
    playHealSound();
}

function checkCollisions() {
    const playerRect = {
        x: playerX + 14,
        y: playerY + 14,
        width: 22,
        height: 22
    };
    
    // Check bone collisions
    for (let i = bones.length - 1; i >= 0; i--) {
        const bone = bones[i];
        const boneRect = {
            x: bone.x,
            y: bone.y,
            width: bone.width,
            height: bone.height
        };
        
        if (
            playerRect.x < boneRect.x + boneRect.width &&
            playerRect.x + playerRect.width > boneRect.x &&
            playerRect.y < boneRect.y + boneRect.height &&
            playerRect.y + playerRect.height > boneRect.y
        ) {
            // Special case for blue bones - only take damage if moving
            if (bone.isBlue) {
                if (isPlayerMoving) {
                    takeDamage();
                }
            } else {
                takeDamage();
            }
        }
    }
}

function takeDamage() {
    // Initial direct damage (1 instead of 10)
    playerHealth = Math.max(0, playerHealth - 1);
    
    // Apply karma effect (reduced from 3 to 1 for better balance)
    karmaEffect = Math.min(99, karmaEffect + 1); 
    
    // Update karma indicator
    updateKarmaDisplay();
    
    // Start karma damage over time if not already started
    if (!karmaInterval) {
        karmaInterval = setInterval(() => {
            if (karmaEffect > 0) {
                // Only apply karma damage if health is above 1
                if (playerHealth > 1) {
                    playerHealth -= 1;
                    karmaEffect -= 1;
                    healthDisplay.textContent = playerHealth;
                    updateKarmaDisplay();
                } else {
                    // Just reduce karma without reducing health below 1
                    karmaEffect -= 1;
                    updateKarmaDisplay();
                }
                
                if (playerHealth <= 0) {
                    clearInterval(karmaInterval);
                    endGame();
                }
            } else {
                clearInterval(karmaInterval);
                karmaInterval = null;
            }
        }, 1000); 
    }
    
    healthDisplay.textContent = playerHealth;
    
    // Flash player to indicate damage
    player.classList.add('flashing');
    setTimeout(() => {
        player.classList.remove('flashing');
    }, 500);
    
    // Only end game if player health is 0 or below
    if (playerHealth <= 0) {
        endGame();
    }
}

function updateKarmaDisplay() {
    healthDisplay.setAttribute('data-karma', karmaEffect);
    document.getElementById('karma').textContent = karmaEffect;
}

function endGame() {
    gameRunning = false;
    clearInterval(boneInterval);
    clearInterval(scoreInterval);
    if (karmaInterval) {
        clearInterval(karmaInterval);
        karmaInterval = null;
    }
    
    itemButtons.forEach(item => item.element.remove());
    itemButtons = [];
    
    if (backgroundMusic) {
        backgroundMusic.pause();
    }
    
    messageDisplay.innerHTML = `* game over!<br>* final score: ${score}`;
    startBtn.textContent = 'RESET';
    startBtn.classList.add('reset');
    
    sansElement.classList.remove('flashing');
    playGameOverSound();
    showGameOverAnimation();
}

function showGameOverAnimation() {
    const gameOverScreen = document.getElementById('gameOverScreen');
    gameOverScreen.style.backgroundImage = "url('undertale-game-over.gif')";
    gameOverScreen.style.display = 'block';
    
    // Show the game over screen instantly
    gameOverScreen.style.opacity = 1;
    
    // Wait for about half of the game over animation to finish (reduced from 5 to 3 seconds)
    // Then show the "get dunked on" animation
    setTimeout(() => {
        // Switch immediately to the second gif
        gameOverScreen.style.backgroundImage = "url('get-dunked-on.gif')";
        
        // After about half of the second animation completes, fade to black (reduced from 5 to 2.5 seconds)
        setTimeout(() => {
            gameOverScreen.style.backgroundImage = "none";
        }, 2500);
    }, 3000);
}

function playTextSound() {
    const sound = new Audio('https://cdn.jsdelivr.net/gh/Loycifer/Undertale-Web/resources/sounds/voice_undertale.wav');
    sound.volume = 0.2;
    sound.play().catch(e => console.log("Couldn't play text sound:", e));
}

function playHealSound() {
    const sound = new Audio('https://cdn.jsdelivr.net/gh/Loycifer/Undertale-Web/resources/sounds/heal.wav');
    sound.volume = 0.2;
    sound.play().catch(e => console.log("Couldn't play heal sound:", e));
}

function playGameOverSound() {
    const sound = new Audio('undertale-death-sound-effect-made-with-Voicemod.mp3');
    sound.volume = 0.3;
    sound.play().catch(e => console.log("Couldn't play game over sound:", e));
}
