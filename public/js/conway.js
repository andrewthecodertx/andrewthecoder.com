(function () {
  // ── Cleanup previous instance (Astro ClientRouter) ──
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

  // ── Constants ──
  const RES = 5; // cell pixel size
  const ALIVE = '#39ff14';
  const BG = '#000';
  const TARGET_MS = 1000 / 30; // ~30fps cap for simulation speed

  // ── State (flat Uint8Array, row-major: index = row * cols + col) ──
  let cols = 0;
  let rows = 0;
  let buf0 = null; // current generation
  let buf1 = null; // next generation (double buffer)
  let gen = 0;
  let running = true;
  let lastTick = 0;

  // ── Patterns (relative [col, row]) ──
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
        // Period-3 oscillator — generate all 4 quadrants from one
        var q = [
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
        ];
        var cells = [];
        var seen = new Set();
        for (var i = 0; i < q.length; i++) {
          var c = q[i][0],
            r = q[i][1];
          var pts = [
            [c, r],
            [-c, r],
            [c, -r],
            [-c, -r],
          ];
          for (var j = 0; j < pts.length; j++) {
            var k = pts[j][0] + ',' + pts[j][1];
            if (!seen.has(k)) {
              seen.add(k);
              cells.push(pts[j]);
            }
          }
        }
        // Shift down by 7 so all rows are non-negative (min row is -6)
        for (var i = 0; i < cells.length; i++) cells[i][1] += 7;
        return cells;
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

  // ── Grid helpers (flat buffers) ──
  function idx(c, r) {
    return r * cols + c;
  }

  function makeGrid() {
    return new Uint8Array(cols * rows);
  }

  function randomGrid() {
    var g = makeGrid();
    for (var i = 0; i < g.length; i++) g[i] = Math.random() < 0.3 ? 1 : 0;
    return g;
  }

  function clearGrid() {
    buf0.fill(0);
    gen = 0;
    updateGenDisplay();
  }

  function placePattern(pattern) {
    var cells = pattern.cells;
    var minC = Infinity,
      maxC = -Infinity,
      minR = Infinity,
      maxR = -Infinity;
    for (var i = 0; i < cells.length; i++) {
      if (cells[i][0] < minC) minC = cells[i][0];
      if (cells[i][0] > maxC) maxC = cells[i][0];
      if (cells[i][1] < minR) minR = cells[i][1];
      if (cells[i][1] > maxR) maxR = cells[i][1];
    }
    var ox = Math.floor((cols - (maxC - minC + 1)) / 2) - minC;
    var oy = Math.floor((rows - (maxR - minR + 1)) / 2) - minR;
    buf0.fill(0);
    for (var i = 0; i < cells.length; i++) {
      var x = cells[i][0] + ox;
      var y = cells[i][1] + oy;
      if (x >= 0 && x < cols && y >= 0 && y < rows) buf0[idx(x, y)] = 1;
    }
    gen = 0;
    updateGenDisplay();
  }

  // ── Simulation (flat grid, toroidal wrapping, double-buffer) ──
  function step() {
    var cur = buf0;
    var nxt = buf1;
    var c = cols;
    var r = rows;
    var len = c * r;

    for (var row = 0; row < r; row++) {
      var rp = row === 0 ? r - 1 : row - 1; // row above (wrapping)
      var rn = row === r - 1 ? 0 : row + 1; // row below (wrapping)
      for (var col = 0; col < c; col++) {
        var cl = col === 0 ? c - 1 : col - 1; // col left (wrapping)
        var cr = col === c - 1 ? 0 : col + 1; // col right (wrapping)

        // Count 8 neighbors using pre-computed wrapped coords (no bounds checks)
        var n =
          cur[rp * c + cl] +
          cur[rp * c + col] +
          cur[rp * c + cr] +
          cur[row * c + cl] +
          cur[row * c + cr] +
          cur[rn * c + cl] +
          cur[rn * c + col] +
          cur[rn * c + cr];

        var i = row * c + col;
        var cell = cur[i];
        nxt[i] =
          (cell === 1 && (n === 2 || n === 3)) || (cell === 0 && n === 3)
            ? 1
            : 0;
      }
    }

    // Swap buffers
    buf0 = nxt;
    buf1 = cur;
    gen++;
  }

  // ── Rendering (ImageData for bulk pixel writes) ──
  var imageData = null;

  function render() {
    if (
      !imageData ||
      imageData.width !== cvs.width ||
      imageData.height !== cvs.height
    ) {
      imageData = ctx.createImageData(cvs.width, cvs.height);
    }
    var data = imageData.data;
    var w = cvs.width;

    // Clear to black (alpha 255)
    for (var i = 3; i < data.length; i += 4) data[i] = 255; // set alpha only once if we fill RGB each frame

    // Parse alive color once
    var ar = 0x39,
      ag = 0xff,
      ab = 0x14; // #39ff14

    // Write pixels
    var buf = buf0;
    var c = cols;
    var r = rows;
    var res = RES;

    // Full black fill
    for (var i = 0; i < data.length; i += 4) {
      data[i] = 0; // R
      data[i + 1] = 0; // G
      data[i + 2] = 0; // B
      data[i + 3] = 255; // A
    }

    // Draw only alive cells
    for (var row = 0; row < r; row++) {
      for (var col = 0; col < c; col++) {
        if (buf[row * c + col]) {
          // Fill the cell rectangle (res x res pixels, offset 1px for grid effect)
          var px = col * res;
          var py = row * res;
          var startX = px + 1;
          var startY = py + 1;
          var endX = Math.min(px + res, w);
          var endY = Math.min(py + res, cvs.height);
          for (var y = startY; y < endY; y++) {
            var rowOff = y * w;
            for (var x = startX; x < endX; x++) {
              var pi = (rowOff + x) << 2;
              data[pi] = ar;
              data[pi + 1] = ag;
              data[pi + 2] = ab;
              // alpha already 255
            }
          }
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  // ── Generation display ──
  function updateGenDisplay() {
    var el = document.getElementById('genDisplay');
    if (el) el.textContent = '(' + gen + ')';
  }

  // ── Main loop (throttled to ~30fps) ──
  function loop(ts) {
    if (!alive) return;
    requestAnimationFrame(loop);
    if (!running) {
      render();
      return;
    }

    var dt = ts - lastTick;
    if (dt < TARGET_MS) return;
    lastTick = ts - (dt % TARGET_MS);

    step();
    updateGenDisplay();
    render();
  }

  // ── Controls ──
  var pauseButton = document.getElementById('pauseButton');

  function setRunning(v) {
    running = v;
    pauseButton.textContent = running ? 'pause' : 'play';
    if (running) {
      lastTick = performance.now();
    }
  }

  function restart() {
    buf0 = randomGrid();
    buf1 = makeGrid();
    gen = 0;
    updateGenDisplay();
  }

  // Keyboard
  document.addEventListener(
    'keydown',
    function (e) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      var handled = true;
      switch (e.key) {
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
      if (handled) e.preventDefault();
    },
    { signal }
  );

  pauseButton.addEventListener(
    'click',
    function () {
      setRunning(!running);
    },
    { signal }
  );
  document
    .getElementById('restartButton')
    .addEventListener('click', restart, { signal });
  document
    .getElementById('clearButton')
    .addEventListener('click', clearGrid, { signal });

  // Pattern buttons
  var keys = Object.keys(patterns);
  for (var k = 0; k < keys.length; k++) {
    (function (key) {
      var btn = document.getElementById('pattern-' + key);
      if (btn)
        btn.addEventListener(
          'click',
          function () {
            placePattern(patterns[key]);
          },
          { signal }
        );
    })(keys[k]);
  }

  // ── Drawing (pointer events) ──
  var painting = false;
  var paintValue = 0;
  var lastCell = -1;

  function cellAt(e) {
    var rect = cvs.getBoundingClientRect();
    var x = Math.floor(((e.clientX - rect.left) / rect.width) * cols);
    var y = Math.floor(((e.clientY - rect.top) / rect.height) * rows);
    if (x < 0 || x >= cols || y < 0 || y >= rows) return -1;
    return idx(x, y);
  }

  cvs.addEventListener(
    'pointerdown',
    function (e) {
      var i = cellAt(e);
      if (i < 0) return;
      painting = true;
      cvs.setPointerCapture(e.pointerId);
      paintValue = buf0[i] === 0 ? 1 : 0;
      buf0[i] = paintValue;
      lastCell = i;
      render();
    },
    { signal }
  );

  cvs.addEventListener(
    'pointermove',
    function (e) {
      if (!painting) return;
      var i = cellAt(e);
      if (i < 0 || i === lastCell) return;
      lastCell = i;
      buf0[i] = paintValue;
      render();
    },
    { signal }
  );

  function endPaint() {
    painting = false;
  }
  cvs.addEventListener('pointerup', endPaint, { signal });
  cvs.addEventListener('pointercancel', endPaint, { signal });

  // ── Resize ──
  function resizeCanvas() {
    var rect = cvs.getBoundingClientRect();
    var w = Math.max(window.innerWidth, 0);
    var h = Math.max(window.innerHeight - rect.top - 8, 0);
    cvs.width = w;
    cvs.height = h;

    var newCols = Math.max(Math.floor(w / RES), 1);
    var newRows = Math.max(Math.floor(h / RES), 1);

    if (cols === 0) {
      cols = newCols;
      rows = newRows;
      buf0 = randomGrid();
      buf1 = makeGrid();
    } else if (newCols !== cols || newRows !== rows) {
      // Copy old grid into new, centered
      var oldBuf = buf0;
      var oldCols = cols;
      var oldRows = rows;
      cols = newCols;
      rows = newRows;
      buf0 = makeGrid();
      buf1 = makeGrid();
      // Copy what fits
      var copyR = Math.min(oldRows, rows);
      var copyC = Math.min(oldCols, cols);
      for (var r = 0; r < copyR; r++) {
        for (var c = 0; c < copyC; c++) {
          buf0[r * cols + c] = oldBuf[r * oldCols + c];
        }
      }
    }

    imageData = null; // force re-create
    render();
  }

  window.addEventListener('resize', resizeCanvas, { signal });
  resizeCanvas();
  requestAnimationFrame(loop);
})();
