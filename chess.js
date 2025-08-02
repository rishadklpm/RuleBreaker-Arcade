/**
 * Initializes the entire Chaos Chess game logic within the provided container.
 * @param {HTMLElement} container - The main container element for the chess game.
 */
function initializeChess(container) {
    // DOM Element References
    const gameModeSelection = container.querySelector('#game-mode-selection');
    const difficultySelection = container.querySelector('#difficulty-selection');
    const startGameButton = container.querySelector('#start-game-button');
    const chessSetupContainer = container.querySelector('#chess-setup');
    const chessGameArea = container.querySelector('#chess-game-area');
    const boardElement = container.querySelector('#chess-board');
    const turnInfoElement = container.querySelector('#turn-info');
    const moveInfoElement = container.querySelector('#move-info');
    const rulesInfoElement = container.querySelector('#rules-info');
    const tauntContainer = container.querySelector('#taunt-container');
    const rankLabelsElement = container.querySelector('.rank-labels');
    const fileLabelsElement = container.querySelector('.file-labels');

    // Game State
    let gameState = {};

    // --- Setup Listeners ---
    container.querySelectorAll('[data-mode]').forEach(button => {
        button.addEventListener('click', (e) => {
            container.querySelectorAll('[data-mode]').forEach(btn => btn.classList.remove('selected'));
            e.target.classList.add('selected');
            gameState.gameMode = e.target.dataset.mode;
            if (gameState.gameMode === 'singlePlayer') {
                difficultySelection.classList.remove('hidden');
                startGameButton.classList.remove('hidden');
                startGameButton.disabled = !gameState.difficulty; 
            } else { // multiplayer
                difficultySelection.classList.add('hidden');
                gameState.difficulty = null;
                startGameButton.classList.remove('hidden');
                startGameButton.disabled = false;
            }
        });
    });

    container.querySelectorAll('[data-difficulty]').forEach(button => {
        button.addEventListener('click', (e) => {
            container.querySelectorAll('[data-difficulty]').forEach(btn => btn.classList.remove('selected'));
            e.target.classList.add('selected');
            gameState.difficulty = e.target.dataset.difficulty;
            startGameButton.disabled = false;
        });
    });

    startGameButton.addEventListener('click', () => {
        chessSetupContainer.classList.add('hidden');
        chessGameArea.classList.remove('hidden');
        startGameButton.classList.add('hidden');
        setupNewChessGame();
    });

    // --- Chess Constants ---
    const PIECES = { 'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙', 'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟' };
    const PIECE_VALUES = { 'K': 900, 'Q': 90, 'R': 50, 'B': 30, 'N': 30, 'P': 10 };

    /**
     * Sets up the initial state for a new game.
     */
    function setupNewChessGame() {
        gameState = {
            board: Array(64).fill(null),
            turn: 'white',
            selectedPieceIndex: -1,
            ruleSet: {},
            moveCounters: {},
            gameOver: false,
            gameMode: gameState.gameMode,
            difficulty: gameState.difficulty
        };
        generateChaosRules();
        placePiecesRandomly();
        renderBoard();
        updateStatus("New game started! White's turn.");
    }

    /**
     * Generates the chaotic rule set by shuffling piece movements.
     */
    function generateChaosRules() {
        const pieceTypes = ['Q', 'R', 'B', 'N', 'K'];
        const moveFuncNames = ['QueenMoves', 'RookMoves', 'BishopMoves', 'KnightMoves', 'KingMoves'];
        for (let i = moveFuncNames.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [moveFuncNames[i], moveFuncNames[j]] = [moveFuncNames[j], moveFuncNames[i]];
        }
        pieceTypes.forEach((type, i) => {
            gameState.ruleSet[type] = moveFuncNames[i];
            gameState.moveCounters[type] = 0;
        });
    }

    /**
     * Places pieces on the board in a randomized (but valid) starting configuration.
     */
    function placePiecesRandomly() {
        const oneSidePieces = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'];
        const backRank = oneSidePieces.slice(0, 8);
        for (let i = backRank.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [backRank[i], backRank[j]] = [backRank[j], backRank[i]];
        }
        const shuffledPieces = backRank.concat(oneSidePieces.slice(8));

        for (let i = 0; i < 16; i++) {
            const whitePos = 48 + i;
            const blackPos = i;
            
            if(shuffledPieces[i] === 'K' && (blackPos % 8 === 0 || blackPos % 8 === 7)) {
                const swapIndex = Math.floor(Math.random() * 6) + 1;
                [shuffledPieces[i], shuffledPieces[swapIndex]] = [shuffledPieces[swapIndex], shuffledPieces[i]];
            }
            
            gameState.board[whitePos] = shuffledPieces[i].toUpperCase();
            gameState.board[blackPos] = shuffledPieces[i].toLowerCase();
        }
    }

    /**
     * Renders the entire chessboard based on the current gameState.
     */
    function renderBoard() {
        boardElement.innerHTML = '';
        rankLabelsElement.innerHTML = '';
        fileLabelsElement.innerHTML = '';

        for(let i = 8; i > 0; i--) rankLabelsElement.innerHTML += `<span>${i}</span>`;
        for(let i = 0; i < 8; i++) fileLabelsElement.innerHTML += `<span>${String.fromCharCode(97 + i)}</span>`;

        for (let i = 0; i < 64; i++) {
            const square = document.createElement('div');
            square.className = `square ${(Math.floor(i / 8) + i % 8) % 2 !== 0 ? 'light' : 'dark'}`;
            square.dataset.index = i;
            const pieceSymbol = gameState.board[i];
            if (pieceSymbol) {
                const pieceElement = document.createElement('span');
                pieceElement.className = `piece ${pieceSymbol === pieceSymbol.toUpperCase() ? 'white' : 'black'}`;
                pieceElement.textContent = PIECES[pieceSymbol];
                square.appendChild(pieceElement);
            }
            if (i === gameState.selectedPieceIndex) square.classList.add('selected');
            boardElement.appendChild(square);
        }
        addSquareListeners();
    }

    /**
     * Attaches click event listeners to each square on the board.
     */
    function addSquareListeners() {
        container.querySelectorAll('.square').forEach(square => {
            square.addEventListener('click', handleSquareClick);
        });
    }
    
    /**
     * Displays a temporary "CHAOS EVENT" notification on the screen.
     * @param {string} message - The message to display.
     */
    function showChaosNotification(message) {
         const chaosEl = document.createElement('div');
         chaosEl.textContent = `CHAOS EVENT: ${message}`;
         chaosEl.style.cssText = `
            position: absolute;
            top: 40%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--primary-color);
            color: var(--bg-color);
            padding: 1rem 2rem;
            border: 3px solid var(--highlight-color);
            z-index: 9999;
            font-size: 1.2rem;
            text-align: center;
            box-shadow: 0 0 20px var(--primary-color);
         `;
         container.appendChild(chaosEl);
         setTimeout(() => chaosEl.remove(), 3500);
    }

    /**
     * Makes a fetch call to the Gemini API to get a taunt.
     * @param {string} prompt - The prompt to send to the API.
     * @returns {Promise<string>} A promise that resolves to the AI's taunt.
     */
    async function callGemini(prompt) {
        console.log("Calling Gemini with prompt:", prompt);
        tauntContainer.textContent = "AI is thinking of a taunt...";
        
        const apiKey = ""; // API key is handled by the environment
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
        const payload = { contents: [{ parts: [{ text: prompt }] }] };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error(`API call failed: ${response.status}`);
            const result = await response.json();
            return result.candidates[0].content.parts[0].text.trim();
        } catch (error) {
            console.error("Error calling Gemini API:", error);
            const taunts = ["Predictable.", "My calculations are flawless.", "Falling into my trap!"];
            return taunts[Math.floor(Math.random() * taunts.length)];
        }
    }

    /**
     * Handles clicks on any square of the board.
     * @param {Event} e - The click event.
     */
    function handleSquareClick(e) {
        if (gameState.gameOver || (gameState.gameMode === 'singlePlayer' && gameState.turn === 'black')) return;
        const index = parseInt(e.currentTarget.dataset.index);
        const piece = gameState.board[index];
        const pieceColor = piece ? (piece === piece.toUpperCase() ? 'white' : 'black') : null;
        
        if (gameState.selectedPieceIndex === -1) {
            if (piece && pieceColor === gameState.turn) {
                gameState.selectedPieceIndex = index;
                highlightLegalMoves();
            }
        } else {
            const legalMoves = getLegalMoves(gameState.selectedPieceIndex);
            if (legalMoves.includes(index)) {
                movePiece(gameState.selectedPieceIndex, index);
            } else {
                clearHighlights();
                gameState.selectedPieceIndex = -1;
                if (piece && pieceColor === gameState.turn) {
                    gameState.selectedPieceIndex = index;
                    highlightLegalMoves();
                }
            }
        }
    }

    /**
     * Highlights the selected piece and all its legal moves.
     */
    function highlightLegalMoves() {
        clearHighlights();
        container.querySelector(`[data-index='${gameState.selectedPieceIndex}']`).classList.add('selected');
        const legalMoves = getLegalMoves(gameState.selectedPieceIndex);
        legalMoves.forEach(move => {
            container.querySelector(`[data-index='${move}']`).classList.add('legal-move');
        });
    }

    /**
     * Removes all 'selected' and 'legal-move' highlights from the board.
     */
    function clearHighlights() {
        container.querySelectorAll('.square').forEach(s => s.classList.remove('selected', 'legal-move'));
    }

    /**
     * Executes a piece move from a 'from' index to a 'to' index.
     * @param {number} from - The starting index of the piece.
     * @param {number} to - The destination index.
     */
    function movePiece(from, to) {
        const piece = gameState.board[from];
        const pieceType = piece.toUpperCase();
        const capturedPiece = gameState.board[to];
        const movingPlayerColor = piece === piece.toUpperCase() ? 'white' : 'black';
        const moveNotation = `Last Move: ${movingPlayerColor.toUpperCase()} moves ${PIECES[piece]} from ${getAlgebraicNotation(from)} to ${getAlgebraicNotation(to)}`;
        
        gameState.board[to] = piece;
        gameState.board[from] = null;
        
        if (capturedPiece && capturedPiece.toUpperCase() === 'K') gameState.gameOver = true;
        
        gameState.selectedPieceIndex = -1;
        clearHighlights();
        renderBoard();

        if (pieceType !== 'P' && !gameState.gameOver) {
             gameState.moveCounters[pieceType]++;
             if (gameState.moveCounters[pieceType] >= 3) {
                const oldRule = gameState.ruleSet[pieceType];
                const moveFuncNames = ['QueenMoves', 'RookMoves', 'BishopMoves', 'KnightMoves', 'KingMoves'];
                let newRule = oldRule;
                while (newRule === oldRule) newRule = moveFuncNames[Math.floor(Math.random() * moveFuncNames.length)];
                gameState.ruleSet[pieceType] = newRule;
                gameState.moveCounters[pieceType] = 0;
                showChaosNotification(`The ${PIECES[pieceType]} now moves like a ${newRule.replace('Moves','')}`);
             }
        }
        
        if (!gameState.gameOver) {
            gameState.turn = gameState.turn === 'white' ? 'black' : 'white';
            tauntContainer.textContent = '';
            updateStatus(moveNotation);
            if (gameState.gameMode === 'singlePlayer' && gameState.turn === 'black') {
                setTimeout(makeAIMove, 1000);
            }
        } else {
            updateStatus(`GAME OVER! ${movingPlayerColor.toUpperCase()} WINS!`);
        }
    }

    /**
     * Calculates and executes the AI's move based on difficulty.
     */
    async function makeAIMove() {
        if (gameState.gameOver) return;
        const allMoves = [];
        for (let i = 0; i < 64; i++) {
            const piece = gameState.board[i];
            if (piece && piece === piece.toLowerCase()) {
                const moves = getLegalMoves(i);
                moves.forEach(to => allMoves.push({ from: i, to, piece: piece }));
            }
        }
        if (allMoves.length === 0) {
            gameState.gameOver = true;
            updateStatus('GAME OVER! YOU WIN! (AI has no moves)');
            return;
        }
        
        let chosenMove;
        if (gameState.difficulty === 'easy') {
            chosenMove = allMoves[Math.floor(Math.random() * allMoves.length)];
        } else {
            allMoves.forEach(move => {
                const capturedPiece = gameState.board[move.to];
                move.score = capturedPiece ? PIECE_VALUES[capturedPiece.toUpperCase()] : 0;
            });
            allMoves.sort((a,b) => b.score - a.score);
            if(gameState.difficulty === 'hard' || allMoves[0].score > 0) {
                const bestMoves = allMoves.filter(m => m.score === allMoves[0].score);
                chosenMove = bestMoves[Math.floor(Math.random() * bestMoves.length)];
            } else {
                chosenMove = allMoves[Math.floor(Math.random() * allMoves.length)];
            }
        }

        movePiece(chosenMove.from, chosenMove.to);
        
        if (!gameState.gameOver) {
            const boardStateText = getBoardStateAsText();
            const prompt = `You are a chaotic AI playing chess. You just moved. Based on this board: ${boardStateText}, generate a short, witty taunt to the human player (under 15 words).`;
            const taunt = await callGemini(prompt);
            tauntContainer.textContent = `AI: "${taunt}"`;
        }
    }
    
    /**
     * Updates all the status display elements.
     * @param {string} [moveInfo] - Optional string describing the last move.
     */
    function updateStatus(moveInfo) {
        moveInfoElement.textContent = moveInfo || '';
        if (gameState.gameOver) {
            turnInfoElement.textContent = moveInfo;
            moveInfoElement.textContent = 'Click "Back to Menu" to play again.';
            rulesInfoElement.textContent = '';
            tauntContainer.textContent = '';
            return;
        }
        
        turnInfoElement.textContent = gameState.gameMode === 'singlePlayer' 
            ? (gameState.turn === 'white' ? "Your Turn (White)" : "AI is thinking...")
            : `Turn: ${gameState.turn.toUpperCase()}`;
        
        const rules = Object.entries(gameState.ruleSet).map(([piece, move]) => 
            `${PIECES[piece]}→${move.replace('Moves','')}`
        );
        rules.push(`${PIECES['P']}→Pawn`);
        rulesInfoElement.innerHTML = `Rules: ${rules.join(' ')}`;
    }
    
    // --- Helper and Move Logic Functions ---
    function getAlgebraicNotation(index) {
        return `${String.fromCharCode(97 + (index % 8))}${8 - Math.floor(index / 8)}`;
    }

    function getBoardStateAsText() {
        let text = "";
        for(let i=0; i<64; i++) {
            if(gameState.board[i]) {
                const piece = gameState.board[i];
                const color = piece === piece.toUpperCase() ? 'White' : 'Black';
                const pieceName = Object.keys(PIECES).find(key => key.toUpperCase() === piece.toUpperCase());
                text += `${color} ${pieceName} on ${getAlgebraicNotation(i)}. `;
            }
        }
        return text;
    }

    function getLegalMoves(index) {
        const piece = gameState.board[index];
        if (!piece) return [];
        const pieceType = piece.toUpperCase();
        if (pieceType === 'P') return getPawnMoves(index, piece);
        const moveFunction = MOVE_FUNCTIONS[gameState.ruleSet[pieceType]];
        return moveFunction ? moveFunction(index, piece) : [];
    }

    const MOVE_FUNCTIONS = {
        RookMoves: (i, p) => getSlidingMoves(i, p, [[0, 1], [0, -1], [1, 0], [-1, 0]]),
        BishopMoves: (i, p) => getSlidingMoves(i, p, [[1, 1], [1, -1], [-1, 1], [-1, -1]]),
        QueenMoves: (i, p) => getSlidingMoves(i, p, [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]]),
        KnightMoves: (i, p) => getLeapingMoves(i, p, [[1, 2], [1, -2], [-1, 2], [-1, -2], [2, 1], [2, -1], [-2, 1], [-2, -1]]),
        KingMoves: (i, p) => getLeapingMoves(i, p, [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]])
    };

    function getSlidingMoves(index, piece, directions) {
        const moves = [];
        const pieceColor = piece === piece.toUpperCase() ? 'white' : 'black';
        const startRow = Math.floor(index / 8);
        const startCol = index % 8;
        for (const [rowDir, colDir] of directions) {
            for (let i = 1; i < 8; i++) {
                const newRow = startRow + i * rowDir;
                const newCol = startCol + i * colDir;
                if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8) break;
                const newIndex = newRow * 8 + newCol;
                const targetPiece = gameState.board[newIndex];
                if (targetPiece) {
                    if ((targetPiece === targetPiece.toUpperCase() ? 'white' : 'black') !== pieceColor) moves.push(newIndex);
                    break;
                } else {
                    moves.push(newIndex);
                }
            }
        }
        return moves;
    }
    
    function getLeapingMoves(index, piece, offsets) {
        const moves = [];
        const pieceColor = piece === piece.toUpperCase() ? 'white' : 'black';
        const startRow = Math.floor(index / 8);
        const startCol = index % 8;
        for (const [rowOffset, colOffset] of offsets) {
            const newRow = startRow + rowOffset;
            const newCol = startCol + colOffset;
            if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                const newIndex = newRow * 8 + newCol;
                const targetPiece = gameState.board[newIndex];
                if (!targetPiece || (targetPiece === targetPiece.toUpperCase() ? 'white' : 'black') !== pieceColor) {
                    moves.push(newIndex);
                }
            }
        }
        return moves;
    }

    function getPawnMoves(index, piece) {
        const moves = [];
        const pieceColor = piece === 'P' ? 'white' : 'black';
        const dir = pieceColor === 'white' ? -1 : 1;
        const currentRow = Math.floor(index / 8);
        const currentCol = index % 8;
        const oneStep = index + dir * 8;
        
        if (oneStep >= 0 && oneStep < 64 && !gameState.board[oneStep]) {
            moves.push(oneStep);
            const isStartingRank = (pieceColor === 'white' && currentRow === 6) || (pieceColor === 'black' && currentRow === 1);
            if ( isStartingRank ) {
                const twoSteps = index + dir * 16;
                if (twoSteps >= 0 && twoSteps < 64 && !gameState.board[twoSteps]) {
                    moves.push(twoSteps);
                }
            }
        }
        
        const captureOffsets = [-1, 1];
        for (const offset of captureOffsets) {
            if (currentCol + offset >= 0 && currentCol + offset < 8) {
                const captureIndex = index + dir * 8 + offset;
                if(captureIndex >= 0 && captureIndex < 64) {
                    const targetPiece = gameState.board[captureIndex];
                    if (targetPiece && (targetPiece === targetPiece.toUpperCase() ? 'white' : 'black') !== pieceColor) {
                        moves.push(captureIndex);
                    }
                }
            }
        }
        return moves;
    }
}
