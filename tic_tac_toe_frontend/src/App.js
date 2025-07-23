import React, { useState, useEffect } from 'react';
import './App.css';

// Color palette
const COLORS = {
  primary: '#1e90ff',
  accent: '#ff4500',
  secondary: '#f5f5f5'
};

/**
 * Creates a new empty 3x3 tic-tac-toe board.
 */
function createEmptyBoard() {
  return Array(3).fill(null).map(() => Array(3).fill(null));
}

// PUBLIC_INTERFACE
function App() {
  /**
   * MAIN state management for the Tic Tac Toe game.
   */
  const [board, setBoard] = useState(createEmptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [winner, setWinner] = useState(null);
  const [draw, setDraw] = useState(false);
  const [score, setScore] = useState({ X: 0, O: 0 });
  const [gameActive, setGameActive] = useState(true);

  // Responsive, minimalistic layout adjustments for mobile/desktop
  useEffect(() => {
    document.body.style.background = COLORS.secondary;
  }, []);

  /**
   * Detects if there's a winner or if the game is a draw on every change.
   */
  useEffect(() => {
    const res = checkGameStatus(board);
    if (res === 'X' || res === 'O') {
      setWinner(res);
      setGameActive(false);
      setScore(s => ({ ...s, [res]: s[res] + 1 }));
    } else if (res === 'draw') {
      setDraw(true);
      setGameActive(false);
    }
  }, [board]);

  // PUBLIC_INTERFACE
  function handleCellClick(rowIdx, colIdx) {
    if (!gameActive || winner || draw) return;
    if (board[rowIdx][colIdx]) return; // Already filled

    const updated = board.map((row, i) =>
      row.map((cell, j) => (i === rowIdx && j === colIdx ? currentPlayer : cell))
    );
    setBoard(updated);
    setCurrentPlayer(prev => (prev === 'X' ? 'O' : 'X'));
  }

  // PUBLIC_INTERFACE
  function startNewGame() {
    setBoard(createEmptyBoard());
    setWinner(null);
    setDraw(false);
    setGameActive(true);
    setCurrentPlayer('X');
  }

  // PUBLIC_INTERFACE
  function resetScore() {
    setScore({ X: 0, O: 0 });
    startNewGame();
  }

  return (
    <div className="ttt-root">
      <div className="ttt-container">
        <h1 className="ttt-title" style={{ color: COLORS.primary }}>Tic Tac Toe</h1>
        <div className="ttt-scoreboard">
          <div className="ttt-score" style={{ color: COLORS.primary }}>X: {score.X}</div>
          <div className="ttt-score" style={{ color: COLORS.accent }}>O: {score.O}</div>
        </div>
        <div className="ttt-controls">
          <button
            className="ttt-btn"
            style={{ background: COLORS.primary, color: '#fff' }}
            onClick={startNewGame}
            disabled={gameActive}
            aria-label="Start new game"
          >
            Start New Game
          </button>
          <button
            className="ttt-btn"
            style={{ background: COLORS.accent, color: '#fff', marginLeft: 12 }}
            onClick={resetScore}
            aria-label="Reset score"
          >
            Reset Score
          </button>
        </div>
        <div className="ttt-status">
          {winner && (
            <span style={{ color: winner === 'X' ? COLORS.primary : COLORS.accent }}>
              Player {winner} wins!
            </span>
          )}
          {!winner && draw && <span style={{ color: COLORS.primary }}>It's a draw!</span>}
          {!winner && !draw && gameActive && (
            <span>
              Next: <span style={{ color: currentPlayer === 'X' ? COLORS.primary : COLORS.accent }}>{currentPlayer}</span>
            </span>
          )}
        </div>
        <Board
          board={board}
          onCellClick={handleCellClick}
          winner={winner}
          winningCells={getWinningCells(board)}
          gameActive={gameActive}
        />
      </div>
      <footer className="ttt-footer">
        <span>Modern Minimal Tic Tac Toe &copy; {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}

// PUBLIC_INTERFACE
function Board({ board, onCellClick, winner, winningCells, gameActive }) {
  return (
    <div className="ttt-board" role="grid" aria-label="Tic Tac Toe board">
      {board.map((row, rowIdx) =>
        row.map((cell, colIdx) => {
          const isWinning = winningCells.some(([r, c]) => r === rowIdx && c === colIdx);
          return (
            <button
              key={`${rowIdx}-${colIdx}`}
              className={`ttt-cell${isWinning ? ' ttt-cell-winning' : ''}`}
              style={{
                cursor: cell || !gameActive ? 'default' : 'pointer'
              }}
              onClick={() => onCellClick(rowIdx, colIdx)}
              aria-label={`Cell ${rowIdx * 3 + colIdx + 1}`}
              disabled={!!cell || !gameActive}
              tabIndex="0"
            >
              {cell === 'X' && <span className="ttt-x">X</span>}
              {cell === 'O' && <span className="ttt-o">O</span>}
            </button>
          );
        })
      )}
    </div>
  );
}

/**
 * Checks for winner or draw in the board.
 * @returns 'X' | 'O' | 'draw' | null
 * PUBLIC_INTERFACE
 */
function checkGameStatus(board) {
  // Rows, columns, diagonals
  for (let i = 0; i < 3; ++i) {
    if (board[i][0] && board[i][0] === board[i][1] && board[i][1] === board[i][2]) return board[i][0];
    if (board[0][i] && board[0][i] === board[1][i] && board[1][i] === board[2][i]) return board[0][i];
  }
  if (board[0][0] && board[0][0] === board[1][1] && board[1][1] === board[2][2]) return board[0][0];
  if (board[0][2] && board[0][2] === board[1][1] && board[1][1] === board[2][0]) return board[0][2];
  
  // Draw if no empty cells
  if (board.every(row => row.every(cell => cell))) return 'draw';
  return null;
}

/**
 * Returns the list of cell coordinates [(r, c), ...] that form the winning line, or [] if none.
 */
function getWinningCells(board) {
  // Rows, columns, diagonals
  for (let i = 0; i < 3; ++i) {
    if (board[i][0] && board[i][0] === board[i][1] && board[i][1] === board[i][2])
      return [[i, 0], [i, 1], [i, 2]];
    if (board[0][i] && board[0][i] === board[1][i] && board[1][i] === board[2][i])
      return [[0, i], [1, i], [2, i]];
  }
  if (board[0][0] && board[0][0] === board[1][1] && board[1][1] === board[2][2])
    return [[0, 0], [1, 1], [2, 2]];
  if (board[0][2] && board[0][2] === board[1][1] && board[1][1] === board[2][0])
    return [[0, 2], [1, 1], [2, 0]];
  return [];
}

export default App;
