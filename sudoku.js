/**
 * Initializes the entire Deceitful Sudoku game logic within the provided container.
 * @param {HTMLElement} container - The main container element for the Sudoku game.
 */
function initializeSudoku(container) {
    // DOM Element References
    const setupContainer = container.querySelector('#sudoku-setup');
    const gameArea = container.querySelector('#sudoku-game-area');
    const startButton = container.querySelector('#start-sudoku-game-button');
    const checkButton = container.querySelector('#check-sudoku-button');
    const boardElement = container.querySelector('#sudoku-board');
    const turnInfoElement = container.querySelector('#turn-info');
    const moveInfoElement = container.querySelector('#move-info');

    // Game State
    let difficulty = 'easy';
    let solution = [];
    let puzzle = [];

    // --- Setup Listeners ---
    container.querySelectorAll('[data-difficulty]').forEach(button => {
        button.addEventListener('click', (e) => {
            container.querySelectorAll('[data-difficulty]').forEach(btn => btn.classList.remove('selected'));
            e.target.classList.add('selected');
            difficulty = e.target.dataset.difficulty;
            startButton.disabled = false;
        });
    });

    startButton.addEventListener('click', () => {
        setupContainer.classList.add('hidden');
        gameArea.classList.remove('hidden');
        checkButton.classList.remove('hidden');
        startButton.classList.add('hidden');
        startNewGame();
    });

    /**
     * Starts a new game by generating a puzzle with lies.
     */
    function startNewGame() {
        // A pre-defined solved board is used for simplicity. A real app would use a generator.
        solution = [
            [5,3,4,6,7,8,9,1,2],[6,7,2,1,9,5,3,4,8],[1,9,8,3,4,2,5,6,7],
            [8,5,9,7,6,1,4,2,3],[4,2,6,8,5,3,7,9,1],[7,1,3,9,2,4,8,5,6],
            [9,6,1,5,3,7,2,8,4],[2,8,7,4,1,9,6,3,5],[3,4,5,2,8,6,1,7,9]
        ];
        puzzle = JSON.parse(JSON.stringify(solution)); // Deep copy

        // Poke holes in the puzzle to create empty cells
        const holes = { easy: 40, medium: 50, hard: 60 };
        for(let i=0; i < holes[difficulty]; i++) {
            const r = Math.floor(Math.random() * 9);
            const c = Math.floor(Math.random() * 9);
            puzzle[r][c] = 0;
        }
        
        // RuleBreaker: Introduce lies into the given numbers
        const lies = { easy: 2, medium: 4, hard: 6 };
        const numLies = lies[difficulty];
        let liesPlaced = 0;
        while(liesPlaced < numLies) {
            const r = Math.floor(Math.random() * 9);
            const c = Math.floor(Math.random() * 9);
            if(puzzle[r][c] !== 0) {
                let lieValue;
                do {
                    lieValue = Math.floor(Math.random() * 9) + 1;
                } while (lieValue === solution[r][c]);
                puzzle[r][c] = -lieValue; 
                liesPlaced++;
            }
        }
        renderBoard();
    }

    /**
     * Renders the Sudoku board. All cells contain an input field to allow editing.
     */
    function renderBoard() {
        boardElement.innerHTML = '';
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const cell = document.createElement('div');
                cell.classList.add('sudoku-cell');
                cell.dataset.row = r;
                cell.dataset.col = c;

                const input = document.createElement('input');
                input.type = 'text'; // Use text to better control input
                input.maxLength = 1;
                input.addEventListener('input', (e) => {
                    e.target.value = e.target.value.replace(/[^1-9]/g, '');
                    validateBoard();
                });

                const val = puzzle[r][c];
                if (val !== 0) {
                    input.value = Math.abs(val);
                    cell.classList.add('given');
                    if (val < 0) {
                        cell.classList.add('lie');
                    }
                }
                
                cell.appendChild(input);
                boardElement.appendChild(cell);
            }
        }
    }
    
    /**
     * Validates the board in real-time, highlighting duplicates.
     */
    function validateBoard() {
        boardElement.querySelectorAll('.sudoku-cell').forEach(c => c.classList.remove('error'));

        for(let i=0; i<9; i++) {
            checkGroup(getGroup(i, 'row'));
            checkGroup(getGroup(i, 'col'));
            checkGroup(getGroup(i, 'box'));
        }

        function getGroup(index, type) {
            const group = [];
            for(let i=0; i<9; i++) {
                let r, c;
                if(type === 'row') { r = index; c = i; }
                else if(type === 'col') { r = i; c = index; }
                else { // box
                    const startRow = Math.floor(index / 3) * 3;
                    const startCol = (index % 3) * 3;
                    r = startRow + Math.floor(i / 3);
                    c = startCol + (i % 3);
                }
                group.push(boardElement.querySelector(`[data-row='${r}'][data-col='${c}']`));
            }
            return group;
        }

        function checkGroup(group) {
            const nums = new Map();
            for(const cell of group) {
                const value = cell.querySelector('input')?.value;
                if(value && value >= '1' && value <= '9') {
                    if(nums.has(value)) {
                        cell.classList.add('error');
                        nums.get(value).classList.add('error');
                    } else {
                        nums.set(value, cell);
                    }
                }
            }
        }
    }

    /**
     * Checks the user's solution against the correct solution.
     */
    checkButton.addEventListener('click', () => {
        let isComplete = true;
        let isCorrect = true;

        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const cell = boardElement.querySelector(`[data-row='${r}'][data-col='${c}']`);
                const input = cell.querySelector('input');
                const inputVal = input.value;
                if (!inputVal) {
                    isComplete = false;
                }
                if (parseInt(inputVal) !== solution[r][c]) {
                    isCorrect = false;
                }
            }
        }

        if (!isComplete) {
            moveInfoElement.textContent = "Board is not complete!";
        } else if (isCorrect) {
            turnInfoElement.textContent = "Congratulations! You Win!";
            moveInfoElement.textContent = "You saw through the lies!";
            checkButton.disabled = true;
            boardElement.querySelectorAll('input').forEach(input => {
                input.readOnly = true;
                input.parentElement.style.backgroundColor = 'var(--ludo-green)';
            });
        } else {
            moveInfoElement.textContent = "Something is wrong... Keep trying!";
        }
    });
}
