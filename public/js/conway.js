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
  const aliveColor = '#39ff14'; /* terminal green */
  const gridLineColor = '#0a0a0a';

  let columns = 0;
  let rows = 0;
  let grid = [];
  let gen = 0;
  let running = true;

  /* ── Preset patterns (relative [col, row] offsets) ── */

  const patterns = {
    glider: {
      name: 'Glider',
      cells: [
        [1, 0],
        [2, 1],
        [0, 2],
        [1, 2],
        [2, 2],
      ],
    },
    lwss: {
      name: 'LWSS',
      cells: [
        [1, 0],
        [4, 0],
        [0, 1],
        [0, 2],
        [4, 2],
        [0, 3],
        [1, 3],
        [2, 3],
        [3, 3],
      ],
    },
    pulsar: {
      name: 'Pulsar',
      cells: (function () {
        // Period-3 oscillator — symmetric, centered on (0,0)
        const quarter = [
          [2, 1],
          [3, 1],
          [4, 1],
          [1, 2],
          [6, 2],
          [1, 3],
          [6, 3],
          [1, 4],
          [6, 4],
          [2, 5],
          [3, 5],
          [4, 5],
          [2, 7],
          [3, 7],
          [4, 7],
          [1, 8],
          [6, 8],
          [1, 9],
          [6, 9],
          [1, 10],
          [6, 10],
          [2, 11],
          [3, 11],
          [4, 11],
        ];
        const all = [];
        quarter.forEach(function (p) {
          all.push([p[0], p[1]]);
          all.push([-p[0], p[1]]);
          all.push([p[0], -p[1]]);
          all.push([-p[0], -p[1]]);
        });
        // Deduplicate
        const seen = {};
        return all.filter(function (p) {
          const k = p[0] + ',' + p[1];
          if (seen[k]) return false;
          seen[k] = true;
          return true;
        });
      })(),
    },
    rpentomino: {
      name: 'R-pentomino',
      cells: [
        [1, 0],
        [2, 0],
        [0, 1],
        [1, 1],
        [1, 2],
      ],
    },
    gospergun: {
      name: 'Gosper Gun',
      cells: [
        [24, 0],
        [22, 1],
        [24, 1],
        [12, 2],
        [13, 2],
        [20, 2],
        [21, 2],
        [34, 2],
        [35, 2],
        [11, 3],
        [15, 3],
        [20, 3],
        [21, 3],
        [34, 3],
        [35, 3],
        [0, 4],
        [1, 4],
        [10, 4],
        [16, 4],
        [20, 4],
        [21, 4],
        [0, 5],
        [1, 5],
        [10, 5],
        [14, 5],
        [16, 5],
        [17, 5],
        [22, 5],
        [24, 5],
        [10, 6],
        [16, 6],
        [24, 6],
        [11, 7],
        [15, 7],
        [12, 8],
        [13, 8],
      ],
    },
  };

  function randomGrid(cols, rws) {
    return new Array(cols)
      .fill(null)
      .map(() =>
        new Array(rws).fill(null).map(() => Math.floor(Math.random() * 2))
      );
  }

  function emptyGrid(cols, rws) {
    return new Array(cols).fill(null).map(() => new Array(rws).fill(0));
  }

  function placePattern(pattern) {
    const cells = pattern.cells;
    // Find bounding box
    let minC = Infinity,
      maxC = -Infinity,
      minR = Infinity,
      maxR = -Infinity;
    cells.forEach(function (p) {
      if (p[0] < minC) minC = p[0];
      if (p[0] > maxC) maxC = p[0];
      if (p[1] < minR) minR = p[1];
      if (p[1] > maxR) maxR = p[1];
    });
    var pw = maxC - minC + 1;
    var ph = maxR - minR + 1;
    // Center on grid
    var ox = Math.floor((columns - pw) / 2) - minC;
    var oy = Math.floor((rows - ph) / 2) - minR;

    grid = emptyGrid(columns, rows);
    cells.forEach(function (p) {
      var x = p[0] + ox;
      var y = p[1] + oy;
      if (x >= 0 && x < columns && y >= 0 && y < rows) {
        grid[x][y] = 1;
      }
    });
    gen = 0;
    updateGenDisplay();
    render(grid);
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

  function countNeighbors(prevGrid, col, row) {
    var count = 0;
    for (var i = -1; i < 2; i++) {
      for (var j = -1; j < 2; j++) {
        if (i === 0 && j === 0) continue;
        var x = col + i;
        var y = row + j;
        if (x >= 0 && y >= 0 && x < columns && y < rows) {
          count += prevGrid[x][y];
        }
      }
    }
    return count;
  }

  function createNextGenGrid(prevGrid) {
    const nextGrid = prevGrid.map((arr) => [...arr]);

    for (let column = 0; column < prevGrid.length; column++) {
      for (let row = 0; row < prevGrid[column].length; row++) {
        const cell = prevGrid[column][row];
        const neighbors = countNeighbors(prevGrid, column, row);

        if (cell === 1 && (neighbors < 2 || neighbors > 3))
          nextGrid[column][row] = 0;
        if (cell === 0 && neighbors === 3) nextGrid[column][row] = 1;
      }
    }

    return nextGrid;
  }

  function render(grid) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, cvs.width, cvs.height);

    // Draw grid lines (subtle)
    ctx.fillStyle = gridLineColor;
    for (let x = 0; x < columns; x++) {
      ctx.fillRect(x * res, 0, 1, rows * res);
    }
    for (let y = 0; y < rows; y++) {
      ctx.fillRect(0, y * res, columns * res, 1);
    }

    // Draw alive cells
    ctx.fillStyle = aliveColor;
    for (let column = 0; column < grid.length; column++) {
      for (let row = 0; row < grid[column].length; row++) {
        if (grid[column][row]) {
          ctx.fillRect(column * res + 1, row * res + 1, res - 1, res - 1);
        }
      }
    }
  }

  function updateGenDisplay() {
    var el = document.getElementById('genDisplay');
    if (el) el.textContent = '(' + gen + ')';
  }

  function run() {
    if (!alive) return;
    if (running) {
      grid = createNextGenGrid(grid);
      gen++;
      updateGenDisplay();
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
    updateGenDisplay();
    render(grid);
  }

  function clearGrid() {
    grid = emptyGrid(columns, rows);
    gen = 0;
    updateGenDisplay();
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

  // Pattern buttons
  Object.keys(patterns).forEach(function (key) {
    var btn = document.getElementById('pattern-' + key);
    if (btn) {
      btn.addEventListener(
        'click',
        function () {
          placePattern(patterns[key]);
        },
        { signal }
      );
    }
  });

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
