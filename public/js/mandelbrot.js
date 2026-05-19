(function () {
  // Tear down any previous instance (Astro ClientRouter re-runs this script on navigation)
  if (window.__mandelCleanup) window.__mandelCleanup();

  const canvas = document.querySelector("#mandelCanvas");
  const wrap = document.querySelector("#mandel-wrap");
  const errEl = document.querySelector("#mandel-err");
  if (!canvas || !wrap) return;

  const gl = canvas.getContext("webgl2", { antialias: false, preserveDrawingBuffer: false });
  if (!gl) {
    if (errEl) {
      errEl.style.display = "grid";
      errEl.textContent = "WebGL 2 is not available in this browser.";
    }
    return;
  }

  const controller = new AbortController();
  const signal = controller.signal;
  let alive = true;
  let rafHandle = 0;
  window.__mandelCleanup = () => {
    alive = false;
    controller.abort();
    if (rafHandle) cancelAnimationFrame(rafHandle);
  };

  const DEFAULT_VIEW = [-2.5, 1.0, -1.25, 1.25];
  const ZOOM_FACTOR = 2.0;
  const PAN_FRACTION = 0.25;
  const VIEW_ASPECT = (DEFAULT_VIEW[1] - DEFAULT_VIEW[0]) / (DEFAULT_VIEW[3] - DEFAULT_VIEW[2]);

  let view = DEFAULT_VIEW.slice();

  const compile = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src.trim());
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(s) || "shader compile failed");
    }
    return s;
  };

  const link = (vsSrc, fsSrc) => {
    const p = gl.createProgram();
    gl.attachShader(p, compile(gl.VERTEX_SHADER, vsSrc));
    gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fsSrc));
    gl.bindAttribLocation(p, 0, "a_pos");
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(p) || "program link failed");
    }
    return p;
  };

  let prog;
  try {
    const vsSrc = document.getElementById("vs").textContent;
    const fsSrc = document.getElementById("fs-mandel").textContent;
    prog = link(vsSrc, fsSrc);
  } catch (e) {
    if (errEl) {
      errEl.style.display = "grid";
      errEl.textContent = "Shader error: " + e.message;
    }
    return;
  }

  // Fullscreen triangle (avoids the seam of two triangles).
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  const uResolution = gl.getUniformLocation(prog, "u_resolution");
  const uView = gl.getUniformLocation(prog, "u_view");

  const resize = () => {
    if (!alive) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const wrapRect = wrap.getBoundingClientRect();
    let cssW, cssH;
    if (wrapRect.width / wrapRect.height > VIEW_ASPECT) {
      cssH = wrapRect.height;
      cssW = cssH * VIEW_ASPECT;
    } else {
      cssW = wrapRect.width;
      cssH = cssW / VIEW_ASPECT;
    }
    canvas.style.width = cssW + "px";
    canvas.style.height = cssH + "px";
    const w = Math.max(1, Math.floor(cssW * dpr));
    const h = Math.max(1, Math.floor(cssH * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
    requestRender();
  };

  const renderMandel = () => {
    gl.useProgram(prog);
    gl.uniform2f(uResolution, canvas.width, canvas.height);
    gl.uniform4f(uView, view[0], view[1], view[2], view[3]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const requestRender = () => {
    if (!alive) return;
    if (rafHandle) return;
    rafHandle = requestAnimationFrame(() => {
      rafHandle = 0;
      if (alive) renderMandel();
    });
  };

  const pixelToComplex = (px, py) => {
    const [xmin, xmax, ymin, ymax] = view;
    const x = xmin + (px / Math.max(1, canvas.clientWidth - 1)) * (xmax - xmin);
    const y = ymax - (py / Math.max(1, canvas.clientHeight - 1)) * (ymax - ymin);
    return [x, y];
  };

  const zoomAt = (cx, cy, factor) => {
    const [xmin, xmax, ymin, ymax] = view;
    const halfW = (xmax - xmin) / factor / 2;
    const halfH = (ymax - ymin) / factor / 2;
    view = [cx - halfW, cx + halfW, cy - halfH, cy + halfH];
  };

  const zoomCenter = (factor) => {
    const cx = (view[0] + view[1]) / 2;
    const cy = (view[2] + view[3]) / 2;
    zoomAt(cx, cy, factor);
  };

  const pan = (dx, dy) => {
    const w = view[1] - view[0];
    const h = view[3] - view[2];
    const sx = dx * w * PAN_FRACTION;
    const sy = dy * h * PAN_FRACTION;
    view = [view[0] + sx, view[1] + sx, view[2] + sy, view[3] + sy];
  };

  const resetView = () => {
    view = DEFAULT_VIEW.slice();
    requestRender();
  };

  // --- Pointer input: tap zoom, drag pan, pinch zoom ---
  const pointers = new Map();
  let panState = null;
  let pinchState = null;
  let dragMoved = false;
  const TAP_THRESHOLD_PX = 8;

  const getCanvasPos = (e) => {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };
  const midpoint = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  const dist = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);

  canvas.addEventListener(
    "pointerdown",
    (e) => {
      canvas.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, getCanvasPos(e));

      if (pointers.size === 1) {
        const p = pointers.values().next().value;
        panState = { startX: p.x, startY: p.y, initialView: view.slice() };
        pinchState = null;
        dragMoved = false;
      } else if (pointers.size === 2) {
        const [p1, p2] = [...pointers.values()];
        const mid = midpoint(p1, p2);
        pinchState = {
          initialView: view.slice(),
          initialMid: mid,
          initialDist: Math.max(1, dist(p1, p2)),
          anchorComplex: (() => {
            const [cx, cy] = pixelToComplex(mid.x, mid.y);
            return { x: cx, y: cy };
          })(),
        };
        panState = null;
        dragMoved = true;
      }
    },
    { signal }
  );

  canvas.addEventListener(
    "pointermove",
    (e) => {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, getCanvasPos(e));

      const W = canvas.clientWidth || 1;
      const H = canvas.clientHeight || 1;

      if (pinchState && pointers.size >= 2) {
        const [p1, p2] = [...pointers.values()];
        const currMid = midpoint(p1, p2);
        const currDist = dist(p1, p2);
        if (currDist < 1) return;
        const scale = currDist / pinchState.initialDist;
        const iv = pinchState.initialView;
        const halfW = (iv[1] - iv[0]) / 2 / scale;
        const halfH = (iv[3] - iv[2]) / 2 / scale;
        const A = pinchState.anchorComplex;
        let xmin = A.x - halfW, xmax = A.x + halfW;
        let ymin = A.y - halfH, ymax = A.y + halfH;
        const dxp = currMid.x - pinchState.initialMid.x;
        const dyp = currMid.y - pinchState.initialMid.y;
        const dxc = -dxp / W * (xmax - xmin);
        const dyc = dyp / H * (ymax - ymin);
        view = [xmin + dxc, xmax + dxc, ymin + dyc, ymax + dyc];
        requestRender();
      } else if (panState && pointers.size === 1) {
        const p = pointers.values().next().value;
        const dxp = p.x - panState.startX;
        const dyp = p.y - panState.startY;
        if (!dragMoved) {
          if (Math.hypot(dxp, dyp) <= TAP_THRESHOLD_PX) return;
          dragMoved = true;
        }
        const iv = panState.initialView;
        const w = iv[1] - iv[0];
        const h = iv[3] - iv[2];
        const dxc = -dxp / W * w;
        const dyc = dyp / H * h;
        view = [iv[0] + dxc, iv[1] + dxc, iv[2] + dyc, iv[3] + dyc];
        requestRender();
      }
    },
    { signal }
  );

  const endPointer = (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.delete(e.pointerId);

    if (pointers.size === 0) {
      if (!dragMoved && panState) {
        const [cx, cy] = pixelToComplex(panState.startX, panState.startY);
        zoomAt(cx, cy, ZOOM_FACTOR);
        requestRender();
      }
      panState = null;
      pinchState = null;
    } else if (pointers.size === 1 && pinchState) {
      const p = pointers.values().next().value;
      panState = { startX: p.x, startY: p.y, initialView: view.slice() };
      pinchState = null;
      dragMoved = true;
    }
  };
  canvas.addEventListener("pointerup", endPointer, { signal });
  canvas.addEventListener("pointercancel", endPointer, { signal });

  canvas.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      const factor = Math.pow(1.2, -Math.sign(e.deltaY));
      zoomCenter(factor);
      requestRender();
    },
    { signal, passive: false }
  );

  window.addEventListener(
    "keydown",
    (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      let handled = true;
      switch (e.key) {
        case "+": case "=": zoomCenter(ZOOM_FACTOR); break;
        case "-": case "_": zoomCenter(1 / ZOOM_FACTOR); break;
        case "PageUp": zoomCenter(ZOOM_FACTOR); break;
        case "PageDown": zoomCenter(1 / ZOOM_FACTOR); break;
        case "h": case "a": case "ArrowLeft": pan(-1, 0); break;
        case "l": case "d": case "ArrowRight": pan(1, 0); break;
        case "j": case "s": case "ArrowDown": pan(0, -1); break;
        case "k": case "w": case "ArrowUp": pan(0, 1); break;
        case "r": view = DEFAULT_VIEW.slice(); break;
        default: handled = false;
      }
      if (handled) {
        e.preventDefault();
        requestRender();
      }
    },
    { signal }
  );

  const resetButton = document.getElementById("mandelResetButton");
  if (resetButton) {
    resetButton.addEventListener("click", resetView, { signal });
  }
  const zoomInButton = document.getElementById("mandelZoomInButton");
  if (zoomInButton) {
    zoomInButton.addEventListener("click", () => { zoomCenter(ZOOM_FACTOR); requestRender(); }, { signal });
  }
  const zoomOutButton = document.getElementById("mandelZoomOutButton");
  if (zoomOutButton) {
    zoomOutButton.addEventListener("click", () => { zoomCenter(1 / ZOOM_FACTOR); requestRender(); }, { signal });
  }

  if (typeof ResizeObserver !== "undefined") {
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    signal.addEventListener("abort", () => ro.disconnect());
  } else {
    window.addEventListener("resize", resize, { signal });
  }

  resize();
})();
