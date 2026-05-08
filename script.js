const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status');
const resetButton = document.getElementById('resetButton');

let board = ['', '', '', '', '', '', '', '', ''];
const human = 'X';
const ai = 'O';
let gameActive = true;

// Combinaciones ganadoras
const winCombos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

// Event Listeners
cells.forEach(cell => cell.addEventListener('click', handleCellClick));
resetButton.addEventListener('click', resetGame);

function handleCellClick(e) {
    const index = e.target.getAttribute('data-index');
    if (board[index] !== '' || !gameActive) return;

    // Turno del humano
    makeMove(index, human);
    
    if (!checkGameOver(board, human)) {
        statusText.innerText = "IA pensando...";
        gameActive = false; // Bloqueamos el tablero para que no puedas hacer clic
        
        // Pequeño retraso para que se sienta natural
        setTimeout(() => {
            const bestMoveInfo = minimax(board, ai);
            makeMove(bestMoveInfo.index, ai);
            
            // Verificamos si la IA ganó o si hay empate con su jugada
            if (!checkGameOver(board, ai)) {
                gameActive = true; // ¡ESTO FALTABA! Volvemos a desbloquear el tablero
                statusText.innerText = "Tu turno (X)";
            }
        }, 300);
    }
}

function makeMove(index, player) {
    board[index] = player;
    cells[index].innerText = player;
    cells[index].classList.add(player.toLowerCase());
}

function checkWin(currentBoard, player) {
    return winCombos.some(combo => {
        return combo.every(index => currentBoard[index] === player);
    });
}

function getAvailableSpots(currentBoard) {
    return currentBoard.map((val, idx) => val === '' ? idx : null).filter(val => val !== null);
}

function checkGameOver(currentBoard, player) {
    if (checkWin(currentBoard, player)) {
        statusText.innerText = player === human ? "¡Ganaste!" : "¡La IA Gana!";
        gameActive = false;
        return true;
    } else if (getAvailableSpots(currentBoard).length === 0) {
        statusText.innerText = "¡Es un empate!";
        gameActive = false;
        return true;
    }
    return false;
}

// --- Algoritmo Minimax ---
function minimax(newBoard, player) {
    const availableSpots = getAvailableSpots(newBoard);

    // Casos base (evaluación final)
    if (checkWin(newBoard, human)) return { score: -10 };
    else if (checkWin(newBoard, ai)) return { score: 10 };
    else if (availableSpots.length === 0) return { score: 0 };

    const moves = [];

    // Probar cada espacio disponible
    for (let i = 0; i < availableSpots.length; i++) {
        const move = {};
        move.index = availableSpots[i];
        
        // Simular movimiento
        newBoard[availableSpots[i]] = player;

        // Llamada recursiva cambiando de turno
        if (player === ai) {
            const result = minimax(newBoard, human);
            move.score = result.score;
        } else {
            const result = minimax(newBoard, ai);
            move.score = result.score;
        }

        // Deshacer movimiento para dejar el tablero como estaba
        newBoard[availableSpots[i]] = ''; 
        moves.push(move);
    }

    // Elegir el mejor movimiento
    let bestMove;
    if (player === ai) {
        let bestScore = -Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }
    
    // Retorna el objeto completo del mejor movimiento (incluye index y score)
    return moves[bestMove];
}

function resetGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    statusText.innerText = "Tu turno (X)";
    cells.forEach(cell => {
        cell.innerText = '';
        cell.className = 'cell'; // Limpia las clases 'x' o 'o'
    });
}