/**
 * Initializes the entire Chaotic Tic-Tac-Toe game logic within the provided container.
 * @param {HTMLElement} container - The main container element for the Tic-Tac-Toe game.
 */
function initializeTicTacToe(container) {
    // DOM Element References
    const boardElement = container.querySelector('#tictactoe-board');
    const turnInfoElement = container.querySelector('#turn-info');
    const restartButton = container.querySelector('#restart-tictactoe-button');

    // Game State
    let boardState;
    let currentPlayer;
    let boardSize;
    let gameOver;

    /**
     * Starts a new game, resetting the board and state.
     */
    function startNewGame() {
        boardSize = 3;
        currentPlayer = 'X';
        gameOver = false;
        turnInfoElement.textContent = `X's Turn`;
        createBoard();
    }

    /**
     * Creates the game board grid based on the current boardSize.
     */
    function createBoard() {
        boardState = Array(boardSize * boardSize).fill(null);
        boardElement.innerHTML = '';
        boardElement.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;
        boardElement.style.gridTemplateRows = `repeat(${boardSize}, 1fr)`;

        for (let i = 0; i < boardSize * boardSize; i++) {
            const cell = document.createElement('div');
            cell.classList.add('tictactoe-cell');
            cell.dataset.index = i;
            cell.addEventListener('click', handleCellClick);
            boardElement.appendChild(cell);
        }
    }

    /**
     * Handles a click on a cell of the board.
     * @param {Event} e - The click event.
     */
    function handleCellClick(e) {
        if (gameOver) return;
        const index = parseInt(e.target.dataset.index);
        if (boardState[index] === null) {
            boardState[index] = currentPlayer;
            e.target.textContent = currentPlayer;
            e.target.classList.add(currentPlayer);

            if (checkWin()) {
                gameOver = true;
                turnInfoElement.textContent = `${currentPlayer} Wins!`;
            } else if (boardState.every(cell => cell !== null)) {
                gameOver = true;
                turnInfoElement.textContent = "It's a Draw!";
            } else {
                currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
                turnInfoElement.textContent = `${currentPlayer}'s Turn`;
                
                // RuleBreaker: Change board size randomly
                if (Math.random() > 0.4) { // 60% chance to change size
                    const currentBoard = [...boardState];
                    const oldSize = boardSize;
                    boardSize = Math.max(3, boardSize + (Math.random() > 0.5 ? 1 : -1));
                    if(boardSize > 6) boardSize = 3; // Cap the max size
                    
                    createBoard();
                    // Attempt to map old state to the new, larger/smaller board
                    for(let r=0; r<oldSize; r++) {
                        for(let c=0; c<oldSize; c++) {
                            if(r < boardSize && c < boardSize) {
                                const oldIndex = r * oldSize + c;
                                const newIndex = r * boardSize + c;
                                if(currentBoard[oldIndex]) {
                                    boardState[newIndex] = currentBoard[oldIndex];
                                    const cell = boardElement.querySelector(`[data-index='${newIndex}']`);
                                    cell.textContent = boardState[newIndex];
                                    cell.classList.add(boardState[newIndex]);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    /**
     * Checks all possible winning lines on the board.
     * @returns {boolean} True if the current player has won, false otherwise.
     */
    function checkWin() {
        const lines = [];
        // Rows & Columns
        for (let i = 0; i < boardSize; i++) {
            const row = [];
            const col = [];
            for (let j = 0; j < boardSize; j++) {
                row.push(i * boardSize + j);
                col.push(j * boardSize + i);
            }
            lines.push(row, col);
        }
        // Diagonals
        const diag1 = [];
        const diag2 = [];
        for (let i = 0; i < boardSize; i++) {
            diag1.push(i * boardSize + i);
            diag2.push(i * boardSize + (boardSize - 1 - i));
        }
        lines.push(diag1, diag2);

        for (const line of lines) {
            if (boardState[line[0]] && line.every(index => boardState[index] === boardState[line[0]])) {
                line.forEach(index => {
                   boardElement.querySelector(`[data-index='${index}']`).classList.add('win');
                });
                return true;
            }
        }
        return false;
    }

    // Initialize
    restartButton.addEventListener('click', startNewGame);
    startNewGame();
}
