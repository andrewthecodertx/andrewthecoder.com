(function () {
  if (window.__dungeonCleanup) window.__dungeonCleanup();

  const canvas = document.getElementById('gameCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const statusEl = document.getElementById('dungeonStatus');

  const setStatus = (msg) => {
    if (statusEl) statusEl.textContent = msg;
  };

  const aborter = new AbortController();
  const signal = aborter.signal;
  let alive = true;
  let rafHandle = 0;
  let ws = null;

  window.__dungeonCleanup = () => {
    alive = false;
    aborter.abort();
    if (rafHandle) cancelAnimationFrame(rafHandle);
    try {
      if (ws) ws.close();
    } catch (e) {
      /* noop */
    }
  };

  const isProduction =
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1';

  const wsUrl = isProduction
    ? `wss://${window.location.host}:5555`
    : `ws://localhost:8080`;

  setStatus('connecting...');
  try {
    ws = new WebSocket(wsUrl);
  } catch (e) {
    setStatus('connection failed: ' + e.message);
    return;
  }

  let localPlayerId = null;
  let players = {};
  let mapLayout = [];
  let tileTypes = {};

  const TILE_SIZE = 32;
  const keys = {};
  const playerWidth = 96;
  const playerHeight = 80;
  const walkSpeed = 2;
  const runSpeed = 4;
  const frameCount = 8;
  const animationSpeed = 100;

  const baseSprites = {
    IDLE: {
      down: new Image(),
      up: new Image(),
      left: new Image(),
      right: new Image(),
    },
    RUN: {
      down: new Image(),
      up: new Image(),
      left: new Image(),
      right: new Image(),
    },
    'ATTACK 1': {
      down: new Image(),
      up: new Image(),
      left: new Image(),
      right: new Image(),
    },
    'ATTACK 2': {
      down: new Image(),
      up: new Image(),
      left: new Image(),
      right: new Image(),
    },
  };

  let allSpritesLoaded = false;
  let mapDataReceived = false;
  let gameLoopStarted = false;

  function startGameLoopIfReady() {
    if (allSpritesLoaded && mapDataReceived && !gameLoopStarted) {
      gameLoopStarted = true;
      gameLoop();
    }
  }

  function loadBaseSprites() {
    let loadedCount = 0;
    const totalImages = Object.keys(baseSprites).reduce(
      (acc, action) => acc + Object.keys(baseSprites[action]).length,
      0
    );

    const onImageLoad = () => {
      loadedCount++;
      if (loadedCount === totalImages) {
        allSpritesLoaded = true;
        for (const id in players) {
          const player = players[id];
          if (player.sprites) {
            for (const action in baseSprites) {
              for (const direction in baseSprites[action]) {
                if (!player.sprites[action][direction]) {
                  const baseSpriteSheet = baseSprites[action][direction];
                  player.sprites[action][direction] = recolorSprite(
                    baseSpriteSheet,
                    player.color
                  );
                }
              }
            }
          }
        }
        startGameLoopIfReady();
      }
    };

    for (const action in baseSprites) {
      for (const direction in baseSprites[action]) {
        const img = baseSprites[action][direction];
        img.onload = onImageLoad;
        img.onerror = () => console.error(`Failed to load sprite: ${img.src}`);
        let pathAction = action.toLowerCase();
        if (action.startsWith('ATTACK')) {
          pathAction = action.replace(' ', '').toLowerCase();
        }
        img.src = `/dungeon/sprites/${action}/${pathAction}_${direction}.png`;
      }
    }
  }

  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  function isSkinTone(r, g, b) {
    const isBrownish = r > g && g > b;
    const isLightEnough = r > 60 && g > 40 && b > 20;
    const isNotTooRed = r < 240;
    const isNotGrayscale =
      Math.abs(r - g) > 5 || Math.abs(r - b) > 5 || Math.abs(g - b) > 5;
    return isBrownish && isLightEnough && isNotTooRed && isNotGrayscale;
  }

  function recolorSprite(image, color) {
    const newCanvas = document.createElement('canvas');
    newCanvas.width = image.width;
    newCanvas.height = image.height;
    const c = newCanvas.getContext('2d');
    c.drawImage(image, 0, 0);
    if (image.width === 0 || image.height === 0) return newCanvas;

    const imageData = c.getImageData(0, 0, newCanvas.width, newCanvas.height);
    const data = imageData.data;
    const tintRgb = hexToRgb(color);
    if (!tintRgb) return newCanvas;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      if (a === 0) continue;
      if (!isSkinTone(r, g, b)) {
        data[i] = (r * tintRgb.r) / 255;
        data[i + 1] = (g * tintRgb.g) / 255;
        data[i + 2] = (b * tintRgb.b) / 255;
      }
    }
    c.putImageData(imageData, 0, 0);
    return newCanvas;
  }

  ws.onopen = () =>
    setStatus(
      'connected — use arrows / hjkl to move, shift to run, A/S to attack'
    );
  ws.onerror = () =>
    setStatus('connection error — is the dungeon server running?');
  ws.onclose = () => {
    if (alive) setStatus('disconnected from server');
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    switch (data.type) {
      case 'assign_id':
        localPlayerId = data.id;
        break;
      case 'map':
        mapLayout = data.layout;
        tileTypes = data.tiles;
        mapDataReceived = true;
        startGameLoopIfReady();
        break;
      case 'update': {
        const serverPlayers = data.players;
        const newPlayers = {};
        for (const id in serverPlayers) {
          const serverPlayer = serverPlayers[id];
          const existingPlayer = players[id];
          newPlayers[id] = serverPlayer;
          if (existingPlayer) {
            newPlayers[id].frame = existingPlayer.frame;
            newPlayers[id].animationTimer = existingPlayer.animationTimer;
            newPlayers[id].sprites = existingPlayer.sprites;
          } else {
            newPlayers[id].frame = 0;
            newPlayers[id].animationTimer = 0;
            newPlayers[id].sprites = {
              IDLE: {},
              RUN: {},
              'ATTACK 1': {},
              'ATTACK 2': {},
            };
            if (allSpritesLoaded) {
              for (const action in baseSprites) {
                for (const direction in baseSprites[action]) {
                  const baseSpriteSheet = baseSprites[action][direction];
                  if (
                    baseSpriteSheet.complete &&
                    baseSpriteSheet.naturalHeight !== 0
                  ) {
                    newPlayers[id].sprites[action][direction] = recolorSprite(
                      baseSpriteSheet,
                      serverPlayer.color
                    );
                  }
                }
              }
            }
          }
        }
        players = newPlayers;
        break;
      }
      case 'player_disconnected':
        delete players[data.id];
        break;
    }
  };

  function drawMap() {
    if (!mapLayout.length || !Object.keys(tileTypes).length) return;
    for (let y = 0; y < mapLayout.length; y++) {
      for (let x = 0; x < mapLayout[y].length; x++) {
        const tileId = mapLayout[y][x];
        const tile = tileTypes[tileId];
        ctx.fillStyle = tile ? tile.color : '#FFFFFF';
        ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMap();

    for (const id in players) {
      const player = players[id];
      if (!player || !player.sprites) continue;

      player.animationTimer = (player.animationTimer || 0) + 16;
      if (player.animationTimer > animationSpeed) {
        player.frame = player.frame + 1;
        player.animationTimer = 0;
        if (player.action.startsWith('ATTACK') && player.frame >= frameCount) {
          player.action = 'IDLE';
          player.frame = 0;
        } else {
          player.frame %= frameCount;
        }
      }
      if (player.action === 'IDLE') {
        player.frame = 0;
      }

      const spriteSheet =
        player.sprites[player.action] &&
        player.sprites[player.action][player.direction];
      if (spriteSheet) {
        const frameX = player.frame * playerWidth;
        ctx.drawImage(
          spriteSheet,
          frameX,
          0,
          playerWidth,
          playerHeight,
          player.x,
          player.y,
          playerWidth,
          playerHeight
        );
      } else {
        ctx.fillStyle = player.color || '#FF0000';
        ctx.fillRect(player.x, player.y, playerWidth, playerHeight);
      }
    }
  }

  function sendInputState() {
    if (!localPlayerId || !ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: 'input', keys }));
  }

  function gameLoop() {
    if (!alive) return;
    draw();
    rafHandle = requestAnimationFrame(gameLoop);
  }

  const tracked = new Set([
    'ArrowUp',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'KeyH',
    'KeyJ',
    'KeyK',
    'KeyL',
    'KeyA',
    'KeyS',
    'ShiftLeft',
    'ShiftRight',
  ]);

  document.addEventListener(
    'keydown',
    (e) => {
      if (!tracked.has(e.code)) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (!keys[e.code]) {
        keys[e.code] = true;
        sendInputState();
      }
      e.preventDefault();
    },
    { signal }
  );
  document.addEventListener(
    'keyup',
    (e) => {
      if (!tracked.has(e.code)) return;
      keys[e.code] = false;
      sendInputState();
      e.preventDefault();
    },
    { signal }
  );

  loadBaseSprites();
})();
