/**
 * Initializes the entire Chaos Ludo game logic within the provided container.
 * @param {HTMLElement} container - The main container element for the Ludo game.
 */
function initializeLudo(container) {
    // DOM Element References
    const setupContainer = container.querySelector('#ludo-setup');
    const gameArea = container.querySelector('#ludo-game-area');
    const startButton = container.querySelector('#start-ludo-game-button');
    const boardContainer = container.querySelector('#ludo-board-container');
    const boardElement = container.querySelector('#ludo-board');
    const diceElement = container.querySelector('#ludo-dice-area');
    const turnInfoElement = container.querySelector('#turn-info');
    const moveInfoElement = container.querySelector('#move-info');

    // Ludo Constants
    const COLORS = ['red', 'green', 'yellow', 'blue'];
    const PATH = [
        [6,1],[6,2],[6,3],[6,4],[6,5], [5,6],[4,6],[3,6],[2,6],[1,6],[0,6], [0,7],
        [0,8],[1,8],[2,8],[3,8],[4,8],[5,8], [6,9],[6,10],[6,11],[6,12],[6,13],[6,14], [7,14],
        [8,14],[8,13],[8,12],[8,11],[8,10],[8,9], [9,8],[10,8],[11,8],[12,8],[13,8],[14,8], [14,7],
        [14,6],[13,6],[12,6],[11,6],[10,6],[9,6], [8,5],[8,4],[8,3],[8,2],[8,1],[8,0], [7,0],
        [6,0]
    ];
    const START_POSITIONS = { green: 1, yellow: 14, blue: 27, red: 40 };
    const HOME_PATHS = {
        green: [[1,7],[2,7],[3,7],[4,7],[5,7],[6,7]],
        yellow: [[7,13],[7,12],[7,11],[7,10],[7,9],[7,8]],
        blue: [[13,7],[12,7],[11,7],[10,7],[9,7],[8,7]],
        red: [[7,1],[7,2],[7,3],[7,4],[7,5],[7,6]]
    };

    // Game State
    let gameState = {};

    /**
     * Resets the game state to its initial values.
     */
    function resetGameState() {
        gameState = {
            numPlayers: 2,
            players: [],
            turn: 0,
            diceValue: 0,
            diceRolled: false,
            tokens: []
        };
    }

    // --- Setup Listeners ---
    container.querySelectorAll('[data-players]').forEach(button => {
        button.addEventListener('click', (e) => {
            container.querySelectorAll('[data-players]').forEach(btn => btn.classList.remove('selected'));
            e.target.classList.add('selected');
            gameState.numPlayers = parseInt(e.target.dataset.players);
            startButton.disabled = false;
        });
    });

    startButton.addEventListener('click', () => {
        setupContainer.classList.add('hidden');
        gameArea.classList.remove('hidden');
        startButton.classList.add('hidden');
        startNewGame();
    });

    diceElement.addEventListener('click', handleDiceRoll);

    /**
     * Starts a new game by setting up players and tokens.
     */
    function startNewGame() {
        resetGameState();
        gameState.players = COLORS.slice(0, gameState.numPlayers);
        
        let tokenId = 0;
        for(const color of gameState.players) {
            for(let i=0; i<4; i++) {
                gameState.tokens.push({
                    id: tokenId++,
                    color: color,
                    state: 'yard', // yard, path, home
                    position: i,   // index in yard, path, or home
                });
            }
        }
        renderFullBoard();
        updateStatus();
    }

    /**
     * Renders the entire Ludo board, including cells, yards, and tokens.
     */
    function renderFullBoard() {
        boardElement.innerHTML = '';
        boardContainer.querySelectorAll('.ludo-yard, .ludo-token').forEach(el => el.remove());

        for(let r=0; r<15; r++) {
            for(let c=0; c<15; c++) {
                const cell = document.createElement('div');
                cell.className = 'ludo-cell';
                cell.dataset.r = r;
                cell.dataset.c = c;
                boardElement.appendChild(cell);
            }
        }
        
        PATH.forEach(([r,c]) => boardElement.querySelector(`[data-r='${r}'][data-c='${c}']`).classList.add('ludo-path'));
        Object.entries(HOME_PATHS).forEach(([color, path]) => {
            path.forEach(([r,c]) => {
                const cell = boardElement.querySelector(`[data-r='${r}'][data-c='${c}']`);
                cell.style.backgroundColor = `var(--ludo-${color})`;
                cell.classList.add('ludo-path');
            });
        });
        
        COLORS.forEach(color => {
            const yard = document.createElement('div');
            yard.className = `ludo-yard ${color}`;
            boardContainer.appendChild(yard);
        });

        renderTokens();
    }

    /**
     * Renders the tokens in their current positions.
     */
    function renderTokens() {
        boardContainer.querySelectorAll('.ludo-token').forEach(el => el.remove());
        const yardPositions = {};

        gameState.tokens.forEach(token => {
            const tokenEl = document.createElement('div');
            tokenEl.className = 'ludo-token';
            tokenEl.id = `token-${token.id}`;
            tokenEl.style.backgroundColor = `var(--ludo-${token.color})`;
            
            let top, left;
            if (token.state === 'yard') {
                const yard = boardContainer.querySelector(`.ludo-yard.${token.color}`);
                if (!yardPositions[token.color]) yardPositions[token.color] = 0;
                const r = Math.floor(yardPositions[token.color] / 2);
                const c = yardPositions[token.color] % 2;
                const yardRect = yard.getBoundingClientRect();
                const containerRect = boardContainer.getBoundingClientRect();
                top = (yardRect.top - containerRect.top) + (yardRect.height * (0.25 + r * 0.5)) - (tokenEl.offsetHeight / 2);
                left = (yardRect.left - containerRect.left) + (yardRect.width * (0.25 + c * 0.5)) - (tokenEl.offsetWidth / 2);
                yardPositions[token.color]++;
            } else if (token.state === 'path') {
                const [r, c] = PATH[token.position];
                top = (r / 15) * 100 + (100/30) - (5.5/2);
                left = (c / 15) * 100 + (100/30) - (5.5/2);
            } else { // home
                const [r, c] = HOME_PATHS[token.color][token.position];
                top = (r / 15) * 100 + (100/30) - (5.5/2);
                left = (c / 15) * 100 + (100/30) - (5.5/2);
            }
            tokenEl.style.top = `${top}%`;
            tokenEl.style.left = `${left}%`;
            
            tokenEl.addEventListener('click', () => handleTokenClick(token.id));
            boardContainer.appendChild(tokenEl);
        });
        highlightMovables();
    }

    /**
     * Updates the game status display.
     */
    function updateStatus() {
        const currentColor = gameState.players[gameState.turn];
        turnInfoElement.textContent = `${currentColor.toUpperCase()}'s Turn`;
        if (gameState.diceRolled) {
            moveInfoElement.textContent = `You rolled a ${gameState.diceValue}. Move a token.`;
        } else {
            moveInfoElement.textContent = `Roll the dice!`;
        }
    }

    /**
     * Handles the dice roll event.
     */
    function handleDiceRoll() {
        if(gameState.diceRolled) return;
        
        diceElement.classList.add('rolling');
        setTimeout(() => diceElement.classList.remove('rolling'), 500);

        let realRoll = Math.floor(Math.random() * 6) + 1;
        if (Math.random() < 0.2) { // 20% chance to lie
            let lieRoll;
            do { lieRoll = Math.floor(Math.random() * 6) + 1; } while (lieRoll === realRoll);
            gameState.diceValue = lieRoll;
            moveInfoElement.textContent = `The dice shows ${lieRoll}, but it feels like a ${realRoll}...`;
        } else {
            gameState.diceValue = realRoll;
        }
        
        diceElement.textContent = gameState.diceValue;
        gameState.diceRolled = true;

        const movableTokens = getMovableTokens();
        if (movableTokens.length === 0) {
            moveInfoElement.textContent = `Rolled a ${gameState.diceValue}. No possible moves.`;
            setTimeout(nextTurn, 1500);
        } else {
            highlightMovables();
            updateStatus();
        }
    }

    /**
     * Gets a list of tokens that the current player can move.
     * @returns {Array<object>} An array of movable token objects.
     */
    function getMovableTokens() {
        const currentColor = gameState.players[gameState.turn];
        return gameState.tokens.filter(token => {
            if (token.color !== currentColor) return false;
            if (token.state === 'yard') return gameState.diceValue === 6;
            if (token.state === 'home') return false; // Cannot move from home
            if (token.state === 'path') {
                const homeEntryIndex = (START_POSITIONS[token.color] + 51) % 52;
                const stepsToHomeEntry = (homeEntryIndex - token.position + 52) % 52;
                return gameState.diceValue <= stepsToHomeEntry + 6;
            }
            return false;
        });
    }

    /**
     * Adds a 'movable' class to tokens that can be moved.
     */
    function highlightMovables() {
        boardContainer.querySelectorAll('.ludo-token').forEach(t => t.classList.remove('movable'));
        if(gameState.diceRolled) {
            getMovableTokens().forEach(token => {
                boardContainer.querySelector(`#token-${token.id}`).classList.add('movable');
            });
        }
    }

    /**
     * Handles a click on a player token.
     * @param {number} tokenId - The ID of the clicked token.
     */
    function handleTokenClick(tokenId) {
        const token = gameState.tokens.find(t => t.id === tokenId);
        if (!token || !getMovableTokens().some(mt => mt.id === tokenId)) return;

        let captured = false;
        if (token.state === 'yard' && gameState.diceValue === 6) {
            token.state = 'path';
            token.position = START_POSITIONS[token.color];
        } else if (token.state === 'path') {
            const homeEntryIndex = (START_POSITIONS[token.color] + 51) % 52;
            const stepsToHomeEntry = (homeEntryIndex - token.position + 52) % 52;

            if (gameState.diceValue > stepsToHomeEntry) {
                token.state = 'home';
                token.position = gameState.diceValue - stepsToHomeEntry - 1;
            } else {
                token.position = (token.position + gameState.diceValue) % 52;
            }
            
            // A token cannot be captured on a "safe" start square
            const isSafeSquare = Object.values(START_POSITIONS).includes(token.position);
            const capturedToken = gameState.tokens.find(t => 
                t.id !== token.id && 
                t.state === 'path' && 
                t.position === token.position &&
                !isSafeSquare
            );
            if(capturedToken) {
                capturedToken.state = 'yard';
                captured = true;
            }
        }
        
        renderTokens();
        
        if (gameState.tokens.filter(t => t.color === token.color && t.state === 'home').length === 4) {
            turnInfoElement.textContent = `${token.color.toUpperCase()} WINS!`;
            moveInfoElement.textContent = 'Game Over!';
            diceElement.removeEventListener('click', handleDiceRoll);
            return;
        }

        if (gameState.diceValue !== 6 && !captured) {
            nextTurn();
        } else {
            // Player gets another turn for rolling a 6 or capturing
            gameState.diceRolled = false;
            diceElement.textContent = '?';
            updateStatus();
        }
    }

    /**
     * Advances the turn to the next player.
     */
    function nextTurn() {
        gameState.turn = (gameState.turn + 1) % gameState.numPlayers;
        gameState.diceRolled = false;
        diceElement.textContent = '?';
        updateStatus();
        highlightMovables();
    }
}
