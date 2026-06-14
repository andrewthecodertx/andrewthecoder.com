var l = Object.defineProperty;
var d = (n, e, t) =>
  e in n
    ? l(n, e, { enumerable: !0, configurable: !0, writable: !0, value: t })
    : (n[e] = t);
var r = (n, e, t) => d(n, typeof e != 'symbol' ? e + '' : e, t);
(function () {
  const e = document.createElement('link').relList;
  if (e && e.supports && e.supports('modulepreload')) return;
  for (const i of document.querySelectorAll('link[rel="modulepreload"]')) s(i);
  new MutationObserver((i) => {
    for (const a of i)
      if (a.type === 'childList')
        for (const c of a.addedNodes)
          c.tagName === 'LINK' && c.rel === 'modulepreload' && s(c);
  }).observe(document, { childList: !0, subtree: !0 });
  function t(i) {
    const a = {};
    return (
      i.integrity && (a.integrity = i.integrity),
      i.referrerPolicy && (a.referrerPolicy = i.referrerPolicy),
      i.crossOrigin === 'use-credentials'
        ? (a.credentials = 'include')
        : i.crossOrigin === 'anonymous'
          ? (a.credentials = 'omit')
          : (a.credentials = 'same-origin'),
      a
    );
  }
  function s(i) {
    if (i.ep) return;
    i.ep = !0;
    const a = t(i);
    fetch(i.href, a);
  }
})();
class m {
  constructor() {
    r(this, 'gamearena');
    r(this, 'bullpen');
    r(this, 'gamepiece');
    r(this, 'bullpenpiece');
    r(this, 'standbyPiece');
    r(this, 'stats');
    ((this.gamearena = this.createCanvas(20, 10)),
      (this.bullpen = this.createCanvas(4, 2)),
      (this.gamepiece = null),
      (this.bullpenpiece = null),
      (this.standbyPiece = ''),
      (this.stats = {
        score: 0,
        level: 1,
        lines: 0,
        dropSpeed: 1e3,
        pieceStats: { I: 0, J: 0, L: 0, O: 0, S: 0, T: 0, Z: 0 },
      }));
  }
  createCanvas(e, t) {
    return Array.from({ length: e }, () => new Array(t).fill(0));
  }
  getGameArena() {
    return this.gamearena;
  }
  getBullpen() {
    return this.bullpen;
  }
  getGamePiece() {
    return this.gamepiece;
  }
  getBullpenPiece() {
    return this.bullpenpiece;
  }
  getStats() {
    return { ...this.stats };
  }
  getStandbyPiece() {
    return this.standbyPiece;
  }
  updateScore(e) {
    ((this.stats.score += e * 10),
      (this.stats.lines += e),
      this.stats.score > 49 * this.stats.level &&
        (this.stats.level++,
        (this.stats.dropSpeed = Math.max(this.stats.dropSpeed - 200, 200))));
  }
  updatePieceStats(e) {
    this.stats.pieceStats[e] = (this.stats.pieceStats[e] || 0) + 1;
  }
  setGamePiece(e) {
    this.gamepiece = e;
  }
  setBullpenPiece(e) {
    this.bullpenpiece = e;
  }
  setGamePiecePosition(e) {
    this.gamepiece && (this.gamepiece.position = { ...e });
  }
  moveGamePiece(e) {
    this.gamepiece &&
      ((this.gamepiece.position.x += e.x), (this.gamepiece.position.y += e.y));
  }
  fuseGamePiece() {
    this.gamepiece &&
      this.gamepiece.position &&
      this.gamepiece.matrix.forEach((e, t) => {
        e.forEach((s, i) => {
          s !== 0 &&
            this.gamepiece &&
            this.gamepiece.position &&
            (this.gamearena[t + this.gamepiece.position.y][
              i + this.gamepiece.position.x
            ] = s);
        });
      });
  }
  clearRows() {
    let e = 0;
    e: for (let t = this.gamearena.length - 1; t > 0; --t) {
      for (let i = 0; i < this.gamearena[t].length; ++i)
        if (this.gamearena[t][i] === 0) continue e;
      const s = this.gamearena.splice(t, 1)[0].fill(0);
      (this.gamearena.unshift(s), ++t, e++);
    }
    return e;
  }
  assignPiece() {
    const e = 'TJLOSZI';
    return e.charAt(Math.floor(Math.random() * e.length));
  }
  nextStandbyPiece() {
    this.standbyPiece = this.assignPiece();
  }
  getDropSpeed() {
    return this.stats.dropSpeed;
  }
  reset() {
    ((this.gamearena = this.createCanvas(20, 10)),
      (this.gamepiece = null),
      (this.bullpenpiece = null),
      (this.stats = {
        score: 0,
        level: 1,
        lines: 0,
        dropSpeed: 1e3,
        pieceStats: { I: 0, J: 0, L: 0, O: 0, S: 0, T: 0, Z: 0 },
      }));
  }
}
const p = '' + new URL('../images/cube.png', import.meta.url).href,
  g = '' + new URL('../images/I.png', import.meta.url).href,
  u = '' + new URL('../images/J.png', import.meta.url).href,
  f = '' + new URL('../images/L.png', import.meta.url).href,
  S = '' + new URL('../images/O.png', import.meta.url).href,
  y = '' + new URL('../images/S.png', import.meta.url).href,
  b = '' + new URL('../images/T.png', import.meta.url).href,
  x = '' + new URL('../images/Z.png', import.meta.url).href,
  w = [
    null,
    '0,   255, 255',
    '0,   0,   255',
    '255, 165, 0',
    '255, 255, 0',
    '0,   128, 0',
    '128, 0,   128',
    '255, 0,   0',
  ],
  v = { I: g, J: u, L: f, O: S, S: y, T: b, Z: x };
class P {
  constructor(e, t) {
    r(this, 'ctx');
    r(this, 'bpctx');
    r(this, 'cube');
    ((this.ctx = e.getContext('2d')),
      this.ctx.scale(30, 30),
      (this.bpctx = t.getContext('2d')),
      this.bpctx.scale(20, 20),
      (this.cube = new Image()),
      (this.cube.src = p));
  }
  renderElement(e, t, s) {
    e &&
      e.forEach((i, a) =>
        i.forEach((c, h) => {
          c !== 0 &&
            (s.drawImage(this.cube, h + t.x, a + t.y, 1, 1),
            (s.fillStyle = `rgba(${w[c]}, 0.4)`),
            s.fillRect(h + t.x, a + t.y, 1, 1));
        })
      );
  }
  redrawCanvases(e) {
    ((this.ctx.fillStyle = 'rgba(0, 0, 0, 1)'),
      this.ctx.fillRect(0, 0, 10, 20),
      this.renderElement(e.getGameArena(), { x: 0, y: 0 }, this.ctx));
    const t = e.getGamePiece();
    t && this.renderElement(t.matrix, t.position, this.ctx);
  }
  loadBullpen(e) {
    (this.bpctx.clearRect(
      0,
      0,
      this.bpctx.canvas.width,
      this.bpctx.canvas.height
    ),
      (this.bpctx.fillStyle = 'rgba(255, 255, 255, 0.5)'),
      this.bpctx.fillRect(
        0,
        0,
        this.bpctx.canvas.width,
        this.bpctx.canvas.height
      ),
      this.renderElement(e.getBullpen(), { x: 0, y: 1 }, this.bpctx));
    const t = e.getBullpenPiece();
    t && this.renderElement(t.matrix, { x: 0, y: 0 }, this.bpctx);
  }
  displayScore(e) {
    const t = e.getStats(),
      s = document.getElementById('score'),
      i = document.getElementById('level'),
      a = document.getElementById('lines');
    s &&
      i &&
      a &&
      ((s.innerText = t.score.toString()),
      (i.innerText = t.level.toString()),
      (a.innerText = t.lines.toString()));
  }
  updateStatistics(e) {
    const t = document.getElementById('stats');
    if (!t) return;
    const { pieceStats: s } = e.getStats();
    t.innerHTML = `
            <ul>
                ${Object.entries(s)
                  .map(
                    ([i, a]) =>
                      `<li><img src="${v[i]}" alt="${i}" width="20" height="20"> <span>${a}</span></li>`
                  )
                  .join('')}
            </ul>
        `;
  }
  drawGameOver() {
    ((this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'),
      this.ctx.fillRect(0, 0, 10, 20),
      (this.ctx.font = "1px 'Press Start 2P'"),
      (this.ctx.fillStyle = 'white'),
      (this.ctx.textAlign = 'center'),
      this.ctx.fillText('GAME OVER', 5, 10));
  }
}
class E {
  constructor(e, t, s, i) {
    r(this, 'keydownHandler');
    r(this, 'shiftLeftHandler');
    r(this, 'shiftRightHandler');
    r(this, 'rotateHandler');
    r(this, 'dropHandler');
    ((this.shiftShape = e),
      (this.dropShape = t),
      (this.rotateShape = s),
      (this.startGame = i),
      (this.keydownHandler = this.kbcontrols.bind(this)),
      document.addEventListener('keydown', this.keydownHandler),
      (this.shiftLeftHandler = () => this.shiftShape(-1)),
      (this.shiftRightHandler = () => this.shiftShape(1)),
      (this.rotateHandler = () => this.rotateShape(1)),
      (this.dropHandler = () => this.dropShape()));
  }
  addTouchControls() {
    var e, t, s, i;
    ((e = document.getElementById('left-btn')) == null ||
      e.addEventListener('click', this.shiftLeftHandler),
      (t = document.getElementById('right-btn')) == null ||
        t.addEventListener('click', this.shiftRightHandler),
      (s = document.getElementById('rotate-btn')) == null ||
        s.addEventListener('click', this.rotateHandler),
      (i = document.getElementById('down-btn')) == null ||
        i.addEventListener('click', this.dropHandler));
  }
  removeTouchControls() {
    var e, t, s, i;
    ((e = document.getElementById('left-btn')) == null ||
      e.removeEventListener('click', this.shiftLeftHandler),
      (t = document.getElementById('right-btn')) == null ||
        t.removeEventListener('click', this.shiftRightHandler),
      (s = document.getElementById('rotate-btn')) == null ||
        s.removeEventListener('click', this.rotateHandler),
      (i = document.getElementById('down-btn')) == null ||
        i.removeEventListener('click', this.dropHandler));
  }
  playercontrols(e) {
    switch (e.code) {
      case 'ArrowLeft':
      case 'KeyH':
        this.shiftShape(-1);
        break;
      case 'ArrowRight':
      case 'KeyL':
        this.shiftShape(1);
        break;
      case 'ArrowDown':
      case 'KeyJ':
        this.dropShape();
        break;
      case 'KeyD':
        this.rotateShape(1);
        break;
      case 'KeyA':
        this.rotateShape(-1);
        break;
    }
  }
  kbcontrols(e) {
    e.code === 'Space' && (this.enableGameControls(), this.startGame());
  }
  enableGameControls() {
    (document.removeEventListener('keydown', this.keydownHandler),
      (this.keydownHandler = this.playercontrols.bind(this)),
      document.addEventListener('keydown', this.keydownHandler),
      this.addTouchControls());
  }
  disableGameControls() {
    (document.removeEventListener('keydown', this.keydownHandler),
      (this.keydownHandler = this.kbcontrols.bind(this)),
      document.addEventListener('keydown', this.keydownHandler),
      this.removeTouchControls());
  }
}
class o {
  constructor(e, t) {
    r(this, 'position');
    r(this, 'matrix');
    ((this.matrix = this.createPiece(e)), (this.position = t));
  }
  createPiece(e) {
    switch (e) {
      case 'I':
        return [
          [0, 0, 0, 0],
          [1, 1, 1, 1],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
        ];
      case 'J':
        return [
          [2, 0, 0],
          [2, 2, 2],
          [0, 0, 0],
        ];
      case 'L':
        return [
          [0, 0, 3],
          [3, 3, 3],
          [0, 0, 0],
        ];
      case 'O':
        return [
          [4, 4],
          [4, 4],
        ];
      case 'S':
        return [
          [0, 5, 5],
          [5, 5, 0],
          [0, 0, 0],
        ];
      case 'T':
        return [
          [0, 6, 0],
          [6, 6, 6],
          [0, 0, 0],
        ];
      case 'Z':
        return [
          [7, 7, 0],
          [0, 7, 7],
          [0, 0, 0],
        ];
      default:
        throw new Error('Invalid piece shape');
    }
  }
}
class L {
  constructor(e, t) {
    r(this, 'gameState');
    r(this, 'renderer');
    r(this, 'inputHandler');
    r(this, 'cancelId');
    r(this, 'dropCounter');
    r(this, 'time');
    r(this, 'standby');
    ((this.gameState = new m()),
      (this.renderer = new P(e, t)),
      (this.inputHandler = new E(
        this.shiftShape.bind(this),
        this.dropShape.bind(this),
        this.rotateShape.bind(this),
        this.startGame.bind(this)
      )),
      (this.cancelId = 0),
      (this.dropCounter = 0),
      (this.time = 0),
      (this.standby = this.gameState.assignPiece()),
      this.renderer.redrawCanvases(this.gameState),
      this.renderer.updateStatistics(this.gameState));
  }
  collision() {
    const e = this.gameState.getGamePiece(),
      t = this.gameState.getGameArena();
    if (!e) return !1;
    for (let s = 0; s < e.matrix.length; ++s)
      for (let i = 0; i < e.matrix[s].length; ++i)
        if (
          e.matrix[s][i] !== 0 &&
          (t[s + e.position.y] && t[s + e.position.y][i + e.position.x]) !== 0
        )
          return !0;
    return !1;
  }
  rotate(e, t) {
    let s = e.map((i) => [...i]);
    for (let i = 0; i < s.length; ++i)
      for (let a = 0; a < i; ++a) [s[a][i], s[i][a]] = [s[i][a], s[a][i]];
    return (t > 0 ? s.forEach((i) => i.reverse()) : s.reverse(), s);
  }
  rotateShape(e) {
    const t = this.gameState.getGamePiece();
    if (!t) return;
    const s = this.rotate(t.matrix, e);
    let i = 1;
    const a = t.matrix;
    for (t.matrix = s, this.gameState.setGamePiece(t); this.collision(); )
      if (
        (this.gameState.moveGamePiece({ x: i, y: 0 }),
        (i = -(i + (i > 0 ? 1 : -1))),
        Math.abs(i) > t.matrix[0].length)
      ) {
        ((t.matrix = a), this.gameState.setGamePiece(t));
        return;
      }
  }
  shiftShape(e) {
    (this.gameState.moveGamePiece({ x: e, y: 0 }),
      this.collision() && this.gameState.moveGamePiece({ x: -e, y: 0 }));
  }
  dropShape() {
    if ((this.gameState.moveGamePiece({ x: 0, y: 1 }), this.collision())) {
      (this.gameState.moveGamePiece({ x: 0, y: -1 }),
        this.gameState.fuseGamePiece(),
        this.initiateNewGamePiece(this.gameState.getStandbyPiece()),
        this.loadBullpen());
      const e = this.gameState.clearRows();
      e > 0 &&
        (this.gameState.updateScore(e),
        this.renderer.displayScore(this.gameState));
    }
    this.dropCounter = 0;
  }
  initiateNewGamePiece(e) {
    (this.gameState.updatePieceStats(e),
      this.renderer.updateStatistics(this.gameState));
    const t = new o(e, {
      x: Math.floor(
        (this.gameState.getGameArena()[0].length -
          new o(e, { x: 0, y: 0 }).matrix[0].length) /
          2
      ),
      y: 0,
    });
    (this.gameState.setGamePiece(t), this.collision() && this.gameOver());
  }
  loadBullpen() {
    this.gameState.nextStandbyPiece();
    const e = new o(this.gameState.getStandbyPiece(), { x: 0, y: 0 });
    (this.gameState.setBullpenPiece(e),
      this.renderer.loadBullpen(this.gameState));
  }
  run(e = 0) {
    const t = e - this.time;
    ((this.dropCounter += t),
      this.dropCounter > this.gameState.getDropSpeed() && this.dropShape(),
      (this.time = e),
      this.renderer.redrawCanvases(this.gameState),
      (this.cancelId = requestAnimationFrame(this.run.bind(this))));
  }
  gameOver() {
    (cancelAnimationFrame(this.cancelId),
      this.renderer.drawGameOver(),
      this.inputHandler.disableGameControls());
  }
  startGame() {
    (this.gameState.reset(),
      (this.standby = this.gameState.assignPiece()),
      this.renderer.displayScore(this.gameState),
      this.renderer.updateStatistics(this.gameState),
      this.initiateNewGamePiece(this.standby),
      this.loadBullpen(),
      this.run());
  }
}
const G = document.getElementById('gamearena'),
  H = document.getElementById('bullpen');
new L(G, H);
