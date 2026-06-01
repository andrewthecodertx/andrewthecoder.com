'use strict';
(function () {
  const GRID_SIZE = 9;
  const BOX_SIZE = 3;
  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function isValid(puzzle, row, col, num) {
    for (let x = 0; x < 9; x++) {
      if (puzzle[row][x] === num || puzzle[x][col] === num) {
        return false;
      }
    }
    const sr = row - (row % 3),
      sc = col - (col % 3);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (puzzle[i + sr][j + sc] === num) {
          return false;
        }
      }
    }
    return true;
  }
  function findEmpty(puzzle) {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (puzzle[r][c] === 0) {
          return [r, c];
        }
      }
    }
    return null;
  }
  function solve(puzzle) {
    const find = findEmpty(puzzle);
    if (!find) {
      return true;
    }
    const [row, col] = find;
    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    shuffle(nums);
    for (const num of nums) {
      if (isValid(puzzle, row, col, num)) {
        puzzle[row][col] = num;
        if (solve(puzzle)) {
          return true;
        }
        puzzle[row][col] = 0;
      }
    }
    return false;
  }
  function solveSudoku(puzzle) {
    const solved = structuredClone(puzzle);
    if (solve(solved)) {
      return solved;
    }
    return puzzle;
  }
  function countSolutions(puzzle) {
    let count = 0;
    function solveAndCount() {
      const find = findEmpty(puzzle);
      if (!find) {
        count++;
        return;
      }
      const [row, col] = find;
      for (let num = 1; num <= 9; num++) {
        if (isValid(puzzle, row, col, num)) {
          puzzle[row][col] = num;
          solveAndCount();
          puzzle[row][col] = 0;
          if (count > 1) {
            return;
          }
        }
      }
    }
    solveAndCount();
    return count;
  }
  function generateSudoku(cellsToRemove) {
    let puzzle = Array(GRID_SIZE)
      .fill(null)
      .map(() => Array(GRID_SIZE).fill(0));
    const solution = solveSudoku(puzzle);
    puzzle = structuredClone(solution);
    const cells = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        cells.push([r, c]);
      }
    }
    shuffle(cells);
    let removedCount = 0;
    while (cells.length > 0 && removedCount < cellsToRemove) {
      const [row, col] = cells.pop();
      const temp = puzzle[row][col];
      puzzle[row][col] = 0;
      const puzzleCopy = structuredClone(puzzle);
      const numSolutions = countSolutions(puzzleCopy);
      if (numSolutions !== 1) {
        puzzle[row][col] = temp;
      } else {
        removedCount++;
      }
    }
    return puzzle;
  }
  function isValidSudoku(puzzle) {
    if (findEmpty(puzzle)) {
      return false;
    }
    const tempPuzzle = structuredClone(puzzle);
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const num = tempPuzzle[r][c];
        tempPuzzle[r][c] = 0;
        if (!isValid(tempPuzzle, r, c, num)) {
          return false;
        }
        tempPuzzle[r][c] = num;
      }
    }
    return true;
  }
  const canvas = document.getElementById('sudoku-grid');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const solveButton = document.getElementById('sudoku-solve');
  const generateButton = document.getElementById('sudoku-generate');
  const clearButton = document.getElementById('sudoku-clear');
  const checkButton = document.getElementById('sudoku-check');
  const checkResult = document.getElementById('sudoku-check-result');
  const numberPad = document.getElementById('sudoku-number-pad');
  let cellSize;
  let puzzle = Array(GRID_SIZE)
    .fill(null)
    .map(() => Array(GRID_SIZE).fill(0));
  let initialPuzzle = Array(GRID_SIZE)
    .fill(null)
    .map(() => Array(GRID_SIZE).fill(0));
  let selectedCell = { row: -1, col: -1 };
  function resizeCanvas() {
    const container = canvas.parentElement;
    const maxSize = Math.min(container.clientWidth, 500);
    canvas.width = maxSize;
    canvas.height = maxSize;
    cellSize = maxSize / GRID_SIZE;
    updateButtonStates();
    redraw();
  }
  function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(canvas.width, i * cellSize);
      ctx.stroke();
    }
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 3;
    for (let i = 0; i <= GRID_SIZE; i++) {
      if (i % BOX_SIZE === 0) {
        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(canvas.width, i * cellSize);
        ctx.stroke();
      }
    }
  }
  function drawNumbers() {
    ctx.font = `${cellSize * 0.55}px "JetBrains Mono",monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const selectedNum =
      selectedCell.row !== -1 ? puzzle[selectedCell.row][selectedCell.col] : 0;
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const num = puzzle[row][col];
        if (num !== 0) {
          if (num === selectedNum && selectedNum !== 0) {
            ctx.fillStyle = 'rgba(34,211,238,0.15)';
            ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
          }
          if (initialPuzzle[row][col] !== 0) {
            ctx.fillStyle = '#e0e0e0';
          } else {
            ctx.fillStyle = '#4ade80';
          }
          ctx.fillText(
            num,
            col * cellSize + cellSize / 2,
            row * cellSize + cellSize / 2
          );
        }
      }
    }
  }
  function highlightSelectedCell() {
    if (selectedCell.row !== -1 && selectedCell.col !== -1) {
      ctx.fillStyle = 'rgba(74,222,128,0.25)';
      ctx.fillRect(
        selectedCell.col * cellSize,
        selectedCell.row * cellSize,
        cellSize,
        cellSize
      );
    }
  }
  function redraw() {
    drawGrid();
    highlightSelectedCell();
    drawNumbers();
    updateNumberPad();
  }
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);
    if (col >= 0 && col < GRID_SIZE && row >= 0 && row < GRID_SIZE) {
      selectedCell = { row, col };
      redraw();
    } else {
      selectedCell = { row: -1, col: -1 };
      redraw();
    }
  });
  canvas.addEventListener(
    'touchstart',
    (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      const col = Math.floor(x / cellSize);
      const row = Math.floor(y / cellSize);
      if (col >= 0 && col < GRID_SIZE && row >= 0 && row < GRID_SIZE) {
        selectedCell = { row, col };
        redraw();
      }
    },
    { passive: false }
  );
  window.addEventListener('keydown', (e) => {
    if (selectedCell.row === -1 || selectedCell.col === -1) return;
    const key = parseInt(e.key);
    if (
      (!isNaN(key) && key >= 1 && key <= 9) ||
      e.key === 'Backspace' ||
      e.key === 'Delete'
    ) {
      if (initialPuzzle[selectedCell.row][selectedCell.col] !== 0) return;
      if (!isNaN(key)) {
        const counts = {};
        for (let r = 0; r < GRID_SIZE; r++) {
          for (let c = 0; c < GRID_SIZE; c++) {
            const num = puzzle[r][c];
            if (num !== 0) {
              counts[num] = (counts[num] || 0) + 1;
            }
          }
        }
        if (!counts[key] || counts[key] < 9) {
          puzzle[selectedCell.row][selectedCell.col] = key;
          redraw();
        }
      } else {
        puzzle[selectedCell.row][selectedCell.col] = 0;
        redraw();
      }
      updateButtonStates();
    } else {
      e.preventDefault();
      switch (e.key) {
        case 'ArrowUp':
        case 'k':
          selectedCell.row = (selectedCell.row - 1 + GRID_SIZE) % GRID_SIZE;
          break;
        case 'ArrowDown':
        case 'j':
          selectedCell.row = (selectedCell.row + 1) % GRID_SIZE;
          break;
        case 'ArrowLeft':
        case 'h':
          selectedCell.col = (selectedCell.col - 1 + GRID_SIZE) % GRID_SIZE;
          break;
        case 'ArrowRight':
        case 'l':
          selectedCell.col = (selectedCell.col + 1) % GRID_SIZE;
          break;
        default:
          return;
      }
      redraw();
    }
  });
  solveButton.addEventListener('click', () => {
    puzzle = solveSudoku(puzzle);
    solveButton.disabled = true;
    checkButton.disabled = false;
    generateButton.disabled = false;
    redraw();
  });
  clearButton.addEventListener('click', () => {
    puzzle = Array(GRID_SIZE)
      .fill(null)
      .map(() => Array(GRID_SIZE).fill(0));
    initialPuzzle = Array(GRID_SIZE)
      .fill(null)
      .map(() => Array(GRID_SIZE).fill(0));
    solveButton.disabled = true;
    checkButton.disabled = true;
    generateButton.disabled = false;
    checkResult.textContent = '';
    checkResult.style.visibility = 'hidden';
    redraw();
  });
  generateButton.addEventListener('click', () => {
    const cellsToRemove = Math.floor(Math.random() * 11) + 40;
    puzzle = generateSudoku(cellsToRemove);
    initialPuzzle = structuredClone(puzzle);
    solveButton.disabled = false;
    checkButton.disabled = false;
    generateButton.disabled = true;
    checkResult.textContent = '';
    checkResult.style.visibility = 'hidden';
    redraw();
  });
  checkButton.addEventListener('click', () => {
    if (isValidSudoku(puzzle)) {
      checkResult.textContent = 'Valid!';
      checkResult.style.color = '#4ade80';
    } else {
      checkResult.textContent = 'Not valid.';
      checkResult.style.color = '#f87171';
    }
    checkResult.style.visibility = 'visible';
  });
  function updateNumberPad() {
    const counts = {};
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const num = puzzle[r][c];
        if (num !== 0) {
          counts[num] = (counts[num] || 0) + 1;
        }
      }
    }
    const buttons = numberPad.querySelectorAll('button');
    for (const button of buttons) {
      const number = parseInt(button.textContent);
      if (!isNaN(number)) {
        if (counts[number] && counts[number] >= 9) {
          button.disabled = true;
          button.classList.add('opacity-30');
        } else {
          button.disabled = false;
          button.classList.remove('opacity-30');
        }
      }
    }
  }
  function updateButtonStates() {
    const hasEmpty = puzzle.some((row) => row.some((cell) => cell === 0));
    if (generateButton.disabled) {
      // A puzzle is active
      solveButton.disabled = !hasEmpty;
      checkButton.disabled = false;
    } else {
      // No puzzle loaded
      solveButton.disabled = true;
      checkButton.disabled = true;
    }
  }
  numberPad.addEventListener('click', (e) => {
    if (
      e.target.tagName === 'BUTTON' &&
      selectedCell.row !== -1 &&
      selectedCell.col !== -1
    ) {
      if (initialPuzzle[selectedCell.row][selectedCell.col] !== 0) return;
      const text = e.target.textContent.trim();
      if (text === 'C') {
        puzzle[selectedCell.row][selectedCell.col] = 0;
      } else {
        const num = parseInt(text, 10);
        if (!isNaN(num) && num >= 1 && num <= 9) {
          puzzle[selectedCell.row][selectedCell.col] = num;
        }
      }
      redraw();
      updateButtonStates();
    }
  });
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
})();
