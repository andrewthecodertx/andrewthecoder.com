(function () {
  if (window.__nesCleanup) window.__nesCleanup();

  const canvas = document.querySelector('#nes-canvas');
  const canvasFrame = document.querySelector('#nesCanvasFrame');
  const status = document.querySelector('#nesStatus');
  const loadBtn = document.querySelector('#nesLoadButton');
  const resetBtn = document.querySelector('#nesResetButton');
  const pauseBtn = document.querySelector('#nesPauseButton');
  const fullscreenBtn = document.querySelector('#nesFullscreenButton');
  const romInput = document.querySelector('#nesRomInput');
  if (
    !canvas ||
    !canvasFrame ||
    !status ||
    !loadBtn ||
    !resetBtn ||
    !pauseBtn ||
    !fullscreenBtn ||
    !romInput
  )
    return;

  const controller = new AbortController();
  const signal = controller.signal;
  let alive = true;
  let rafHandle = 0;
  let isPaused = false;
  let romLoaded = false;

  window.__nesCleanup = () => {
    alive = false;
    try {
      if (romLoaded && typeof window.nesPause === 'function') window.nesPause();
    } catch (e) {
      /* noop */
    }
    controller.abort();
    if (rafHandle) cancelAnimationFrame(rafHandle);
  };

  if (typeof window.Go === 'undefined') {
    status.textContent = 'wasm runtime not loaded';
    return;
  }

  status.textContent = 'loading emulator...';
  const go = new window.Go();
  WebAssembly.instantiateStreaming(fetch('/nes/nes.wasm'), go.importObject)
    .then((result) => {
      if (!alive) return;
      go.run(result.instance);
      status.textContent = 'ready — load a .nes rom';
    })
    .catch((err) => {
      status.textContent =
        'error loading emulator: ' +
        (err && err.message ? err.message : String(err));
    });

  loadBtn.addEventListener('click', () => romInput.click(), { signal });

  romInput.addEventListener(
    'change',
    async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      status.textContent = 'loading rom...';
      try {
        const buf = await file.arrayBuffer();
        const result = window.nesLoadROM(new Uint8Array(buf));
        status.textContent = result;
        if (
          typeof result === 'string' &&
          !result.toLowerCase().startsWith('error')
        ) {
          romLoaded = true;
          resetBtn.disabled = false;
          pauseBtn.disabled = false;
          isPaused = false;
          pauseBtn.textContent = '[pause]';
        }
      } catch (err) {
        status.textContent =
          'rom load failed: ' +
          (err && err.message ? err.message : String(err));
      }
      romInput.value = '';
    },
    { signal }
  );

  resetBtn.addEventListener(
    'click',
    () => {
      if (romLoaded && typeof window.nesReset === 'function') window.nesReset();
    },
    { signal }
  );

  pauseBtn.addEventListener(
    'click',
    () => {
      if (!romLoaded) return;
      if (isPaused) {
        window.nesResume();
        pauseBtn.textContent = '[pause]';
      } else {
        window.nesPause();
        pauseBtn.textContent = '[resume]';
      }
      isPaused = !isPaused;
    },
    { signal }
  );

  const isFullscreen = () =>
    !!(document.fullscreenElement || document.webkitFullscreenElement);
  const enterFullscreen = (el) => {
    if (el.requestFullscreen) return el.requestFullscreen();
    if (el.webkitRequestFullscreen) return el.webkitRequestFullscreen();
  };
  const leaveFullscreen = () => {
    if (document.exitFullscreen) return document.exitFullscreen();
    if (document.webkitExitFullscreen) return document.webkitExitFullscreen();
  };

  fullscreenBtn.addEventListener(
    'click',
    () => {
      try {
        if (isFullscreen()) leaveFullscreen();
        else enterFullscreen(canvasFrame);
      } catch (e) {
        /* noop */
      }
    },
    { signal }
  );

  const onFsChange = () => {
    fullscreenBtn.textContent = isFullscreen()
      ? '[exit fullscreen]'
      : '[fullscreen]';
  };
  document.addEventListener('fullscreenchange', onFsChange, { signal });
  document.addEventListener('webkitfullscreenchange', onFsChange, { signal });

  const keyMap = {
    ArrowUp: 'up',
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right',
    KeyW: 'up',
    KeyS: 'down',
    KeyA: 'left',
    KeyD: 'right',
    KeyX: 'a',
    KeyZ: 'b',
    KeyJ: 'a',
    KeyK: 'b',
    Enter: 'start',
    ShiftLeft: 'select',
    ShiftRight: 'select',
  };

  document.addEventListener(
    'keydown',
    (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.code === 'KeyP' && romLoaded) {
        pauseBtn.click();
        e.preventDefault();
        return;
      }
      const btn = keyMap[e.code];
      if (btn && romLoaded) {
        window.nesSetButton(btn, true);
        e.preventDefault();
      }
    },
    { signal }
  );

  document.addEventListener(
    'keyup',
    (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const btn = keyMap[e.code];
      if (btn && romLoaded) {
        window.nesSetButton(btn, false);
        e.preventDefault();
      }
    },
    { signal }
  );

  let gamepadIndex = null;
  const gamepadState = {
    a: false,
    b: false,
    select: false,
    start: false,
    up: false,
    down: false,
    left: false,
    right: false,
  };

  window.addEventListener(
    'gamepadconnected',
    (e) => {
      gamepadIndex = e.gamepad.index;
    },
    { signal }
  );
  window.addEventListener(
    'gamepaddisconnected',
    (e) => {
      if (e.gamepad.index === gamepadIndex) gamepadIndex = null;
    },
    { signal }
  );

  function pollGamepad() {
    if (!alive) return;
    if (gamepadIndex !== null && romLoaded) {
      const gp = navigator.getGamepads()[gamepadIndex];
      if (gp) {
        const next = {
          a: !!(gp.buttons[0]?.pressed || gp.buttons[2]?.pressed),
          b: !!(gp.buttons[1]?.pressed || gp.buttons[3]?.pressed),
          select: !!gp.buttons[8]?.pressed,
          start: !!gp.buttons[9]?.pressed,
          up: !!(
            gp.buttons[12]?.pressed ||
            (gp.axes[1] !== undefined && gp.axes[1] < -0.5)
          ),
          down: !!(
            gp.buttons[13]?.pressed ||
            (gp.axes[1] !== undefined && gp.axes[1] > 0.5)
          ),
          left: !!(
            gp.buttons[14]?.pressed ||
            (gp.axes[0] !== undefined && gp.axes[0] < -0.5)
          ),
          right: !!(
            gp.buttons[15]?.pressed ||
            (gp.axes[0] !== undefined && gp.axes[0] > 0.5)
          ),
        };
        for (const btn of Object.keys(next)) {
          if (next[btn] !== gamepadState[btn]) {
            gamepadState[btn] = next[btn];
            window.nesSetButton(btn, next[btn]);
          }
        }
      }
    }
    rafHandle = requestAnimationFrame(pollGamepad);
  }
  rafHandle = requestAnimationFrame(pollGamepad);
})();
