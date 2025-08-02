// --- Scroll Logic ---
// Adds a 'scrolled' class to the body when the user scrolls down
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        document.body.classList.add('scrolled');
    } else {
        document.body.classList.remove('scrolled');
    }
});

// --- Scroll Prompt Click ---
// Smoothly scrolls the main content into view when the prompt is clicked
document.getElementById('scroll-prompt').addEventListener('click', () => {
    document.getElementById('main-content').scrollIntoView();
});

// --- Game Launching Logic ---
const gamePortal = document.getElementById('game-portal');
const mainContent = document.getElementById('main-content');
const stickyHeader = document.getElementById('sticky-header');
const landingHeader = document.getElementById('landing-header');
let activeGameContainer = null;

/**
 * Hides the main menu and injects the HTML for a selected game.
 * @param {string} gameId - The identifier for the game to launch (e.g., 'chess', 'ludo').
 */
function launchGame(gameId) {
    // Prevent launching a new game if one is already active
    if(activeGameContainer) return;

    // Hide main menu elements
    mainContent.style.display = 'none';
    landingHeader.style.display = 'none';
    stickyHeader.style.transform = 'translateY(-100%)';
    
    // Create a container for the game
    const gameContainer = document.createElement('div');
    gameContainer.id = `${gameId}-container`;
    gameContainer.className = 'game-container';
    activeGameContainer = gameContainer;
    
    // Inject the correct game's HTML and initialize its script
    if (gameId === 'chess') {
        gameContainer.innerHTML = `
            <div id="chess-setup" style="text-align: center;">
                <div class="setup-section" id="game-mode-selection">
                    <h3>Select Mode</h3>
                    <div class="selection-buttons">
                        <button class="game-button" data-mode="singlePlayer">Single Player</button>
                        <button class="game-button" data-mode="multiplayer">Multiplayer</button>
                    </div>
                </div>
                <div class="setup-section hidden" id="difficulty-selection">
                    <h3>Select AI Difficulty</h3>
                    <div class="selection-buttons">
                        <button class="game-button" data-difficulty="easy">Easy</button>
                        <button class="game-button" data-difficulty="medium">Medium</button>
                        <button class="game-button" data-difficulty="hard">Hard</button>
                    </div>
                </div>
            </div>
            <div id="chess-game-area" class="hidden">
                <div id="game-status">
                    <div id="turn-info"></div>
                    <div id="game-status-main">
                        <div id="rules-info"></div>
                        <div id="taunt-container"></div>
                    </div>
                    <div id="move-info"></div>
                </div>
                <div class="board-wrapper">
                    <div class="rank-labels"></div>
                    <div id="chess-board"></div>
                    <div class="file-labels"></div>
                </div>
            </div>
            <div class="action-bar">
                 <button class="game-button back-button">Back to Menu</button>
                 <button id="start-game-button" class="game-button hidden" disabled>Start Game</button>
            </div>
        `;
        initializeChess(gameContainer);
    } else if (gameId === 'ludo') {
        gameContainer.innerHTML = `
            <div id="ludo-setup" style="text-align: center;">
                <div class="setup-section">
                    <h3>Select Players</h3>
                    <div class="selection-buttons">
                        <button class="game-button" data-players="2">2 Players</button>
                        <button class="game-button" data-players="3">3 Players</button>
                        <button class="game-button" data-players="4">4 Players</button>
                    </div>
                </div>
            </div>
            <div id="ludo-game-area" class="hidden">
                 <div id="game-status">
                    <div id="turn-info"></div>
                    <div id="move-info"></div>
                </div>
                <div id="ludo-board-container">
                    <div id="ludo-board"></div>
                    <!-- Tokens will be added here -->
                </div>
                <div id="ludo-dice-area">?</div>
            </div>
            <div class="action-bar">
                <button class="game-button back-button">Back to Menu</button>
                <button id="start-ludo-game-button" class="game-button" disabled>Start Game</button>
            </div>
        `;
        initializeLudo(gameContainer);
    } else if (gameId === 'tictactoe') {
        gameContainer.innerHTML = `
            <div id="tictactoe-game-area">
                <div id="game-status">
                    <div id="turn-info">X's Turn</div>
                    <div id="move-info">Board size will change randomly!</div>
                </div>
                <div id="tictactoe-board"></div>
            </div>
             <div class="action-bar">
                <button class="game-button back-button">Back to Menu</button>
                <button id="restart-tictactoe-button" class="game-button">Restart</button>
            </div>
        `;
        initializeTicTacToe(gameContainer);
    } else if (gameId === 'sudoku') {
        gameContainer.innerHTML = `
            <div id="sudoku-setup" style="text-align: center;">
                <div class="setup-section">
                    <h3>Select Difficulty (Affects # of lies)</h3>
                    <div class="selection-buttons">
                        <button class="game-button" data-difficulty="easy">Easy (1-2 Lies)</button>
                        <button class="game-button" data-difficulty="medium">Medium (3-4 Lies)</button>
                        <button class="game-button" data-difficulty="hard">Hard (5-6 Lies)</button>
                    </div>
                </div>
            </div>
            <div id="sudoku-game-area" class="hidden">
                <div id="game-status">
                    <div id="turn-info">Find the lies and solve the puzzle!</div>
                    <div id="move-info"></div>
                </div>
                <div id="sudoku-board"></div>
            </div>
            <div class="action-bar">
                <button class="game-button back-button">Back to Menu</button>
                <button id="check-sudoku-button" class="game-button hidden">Check Solution</button>
                <button id="start-sudoku-game-button" class="game-button" disabled>Start Game</button>
            </div>
        `;
        initializeSudoku(gameContainer);
    } else {
         gameContainer.innerHTML = `
            <h2 style="font-size: 2rem; color: var(--primary-color);">${gameId.toUpperCase()}</h2>
            <p>This game is under construction.</p>
            <button class="game-button back-button">Back to Menu</button>
        `;
    }
    
    // Add the game container to the page
    gamePortal.appendChild(gameContainer);

    // Add a listener to the 'Back' button to return to the main menu
    gameContainer.querySelector('.back-button').addEventListener('click', () => {
        gamePortal.innerHTML = '';
        mainContent.style.display = 'block';
        landingHeader.style.display = 'flex';
        // A small timeout to allow the DOM to update before scrolling
        setTimeout(() => {
            document.body.classList.remove('scrolled');
            window.scrollTo(0,0);
        }, 0);
        activeGameContainer = null;
    });
}

// --- Add event listeners for all game cards ---
document.getElementById('start-chess').addEventListener('click', () => launchGame('chess'));
document.getElementById('start-ludo').addEventListener('click', () => launchGame('ludo'));
document.getElementById('start-flappy').addEventListener('click', () => launchGame('flappy'));
document.getElementById('start-sl').addEventListener('click', () => launchGame('sl'));
document.getElementById('start-tictactoe').addEventListener('click', () => launchGame('tictactoe'));
document.getElementById('start-sudoku').addEventListener('click', () => launchGame('sudoku'));


// --- Settings Modal Logic ---
const settingsButton = document.getElementById('settings-button');
const settingsModal = document.getElementById('settings-modal');
const settingsBackdrop = document.getElementById('settings-backdrop');
const settingsBackButton = document.getElementById('settings-back-button');

const volumeSlider = document.getElementById('volume');
const resolutionSlider = document.getElementById('resolution');
const fpsSlider = document.getElementById('fps');
const volumeValue = document.getElementById('volume-value');
const resolutionValue = document.getElementById('resolution-value');
const fpsValue = document.getElementById('fps-value');

function openSettings() {
    settingsModal.classList.remove('hidden');
    settingsBackdrop.classList.remove('hidden');
}

function closeSettings() {
    settingsModal.classList.add('hidden');
    settingsBackdrop.classList.add('hidden');
}

settingsButton.addEventListener('click', openSettings);
settingsBackButton.addEventListener('click', closeSettings);
settingsBackdrop.addEventListener('click', closeSettings);

// Update display values when sliders are moved
volumeSlider.addEventListener('input', (e) => { volumeValue.textContent = e.target.value; });
resolutionSlider.addEventListener('input', (e) => { resolutionValue.textContent = `${e.target.value}%`; });
fpsSlider.addEventListener('input', (e) => { fpsValue.textContent = e.target.value; });
