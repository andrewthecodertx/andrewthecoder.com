(function () {
  // Tear down any previous instance (Astro ClientRouter re-runs this script on navigation)
  if (window.__conwayCleanup) window.__conwayCleanup();

  const cvs = document.querySelector('#gameCanvas');
  if (!cvs) return;
  const ctx = cvs.getContext('2d');

  const controller = new AbortController();
  const signal = controller.signal;
  let alive = true;
  window.__conwayCleanup = () => {
    alive = false;
    controller.abort();
  };

  const res = 5; /* pixel size */

  let columns = 0;
  let rows = 0;
  let grid = [];
  let gen = 0;
  let running = true;

  function randomGrid(cols, rws) {
    return new Array(cols)
      .fill(null)
      .map(() =>
        new Array(rws).fill(null).map(() => Math.floor(Math.random() * 2))
      );
  }

  function resizeCanvas() {
    const rect = cvs.getBoundingClientRect();
    const width = Math.max(window.innerWidth, 0);
    const height = Math.max(window.innerHeight - rect.top - 8, 0);

    cvs.width = width;
    cvs.height = height;

    const newColumns = Math.max(Math.floor(width / res), 1);
    const newRows = Math.max(Math.floor(height / res), 1);

    if (grid.length === 0) {
      grid = randomGrid(newColumns, newRows);
    } else {
      const next = new Array(newColumns)
        .fill(null)
        .map((_, c) =>
          new Array(newRows)
            .fill(0)
            .map((_, r) => (c < columns && r < rows ? grid[c][r] : 0))
        );
      grid = next;
    }

    columns = newColumns;
    rows = newRows;
    render(grid);
  }

  function createNextGenGrid(prevGrid) {
    const nextGrid = prevGrid.map((arr) => [...arr]);

    for (let column = 0; column < prevGrid.length; column++) {
      for (let row = 0; row < prevGrid[column].length; row++) {
        const cell = prevGrid[column][row];
        let neighbors = 0;

        for (let i = -1; i < 2; i++) {
          for (let j = -1; j < 2; j++) {
            if (i === 0 && j === 0) continue;

            const x = column + i;
            const y = row + j;

            if (x >= 0 && y >= 0 && x < columns && y < rows) {
              neighbors += prevGrid[column + i][row + j];
            }
          }
        }

        if (cell === 1 && (neighbors < 2 || neighbors > 3))
          nextGrid[column][row] = 0;
        if (cell === 0 && neighbors === 3) nextGrid[column][row] = 1;
      }
    }

    return nextGrid;
  }

  function render(grid) {
    for (let column = 0; column < grid.length; column++) {
      for (let row = 0; row < grid[column].length; row++) {
        const cell = grid[column][row];

        ctx.beginPath();
        ctx.rect(column * res, row * res, res, res);
        ctx.fillStyle = cell ? '#fff' : '#000';
        ctx.fill();
      }
    }
  }

  function run() {
    if (!alive) return;
    if (running) {
      grid = createNextGenGrid(grid);
      gen++;
      render(grid);
    }
    requestAnimationFrame(run);
  }

  const pauseButton = document.getElementById('pauseButton');

  function setRunning(value) {
    running = value;
    pauseButton.textContent = running ? '[pause]' : '[play]';
  }

  function restart() {
    grid = randomGrid(columns, rows);
    gen = 0;
    render(grid);
  }

  function clearGrid() {
    grid = grid.map((arr) => arr.fill(0));
    gen = 0;
    render(grid);
  }

  document.addEventListener(
    'keydown',
    (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      let handled = true;
      switch (event.key) {
        case ' ':
          setRunning(!running);
          break;
        case 'r':
        case 'R':
          restart();
          break;
        case 'c':
        case 'C':
          clearGrid();
          break;
        default:
          handled = false;
      }
      if (handled) event.preventDefault();
    },
    { signal }
  );

  pauseButton.addEventListener('click', () => setRunning(!running), { signal });
  document
    .getElementById('restartButton')
    .addEventListener('click', restart, { signal });
  document
    .getElementById('clearButton')
    .addEventListener('click', clearGrid, { signal });

  let painting = false;
  let paintValue = 0;
  let lastCellKey = '';

  function cellAt(event) {
    const rect = cvs.getBoundingClientRect();
    const x = Math.floor(((event.clientX - rect.left) / rect.width) * columns);
    const y = Math.floor(((event.clientY - rect.top) / rect.height) * rows);
    return { x, y };
  }

  cvs.addEventListener(
    'pointerdown',
    (event) => {
      const { x, y } = cellAt(event);
      if (x < 0 || x >= columns || y < 0 || y >= rows) return;
      painting = true;
      cvs.setPointerCapture(event.pointerId);
      paintValue = grid[x][y] === 0 ? 1 : 0;
      grid[x][y] = paintValue;
      lastCellKey = `${x},${y}`;
      render(grid);
    },
    { signal }
  );

  cvs.addEventListener(
    'pointermove',
    (event) => {
      if (!painting) return;
      const { x, y } = cellAt(event);
      if (x < 0 || x >= columns || y < 0 || y >= rows) return;
      const key = `${x},${y}`;
      if (key === lastCellKey) return;
      lastCellKey = key;
      grid[x][y] = paintValue;
      render(grid);
    },
    { signal }
  );

  const endPaint = () => {
    painting = false;
  };
  cvs.addEventListener('pointerup', endPaint, { signal });
  cvs.addEventListener('pointercancel', endPaint, { signal });

  window.addEventListener('resize', resizeCanvas, { signal });

  resizeCanvas();
  requestAnimationFrame(run);
})();
