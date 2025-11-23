(() => {
  const canvas = document.getElementById('board');
  const ctx = canvas.getContext('2d');
  const stage = document.getElementById('canvas-stage');
  const frame = document.querySelector('.board-frame');
  const gridCanvas = document.getElementById('grid-canvas');
  const gctx = gridCanvas.getContext('2d');

  const colorInput = document.getElementById('color');
  const sizeInput = document.getElementById('size');
  const gridToggle = document.getElementById('grid-toggle');
  const undoBtn = document.getElementById('undo');
  const redoBtn = document.getElementById('redo');
  const clearBtn = document.getElementById('clear');
  const downloadBtn = document.getElementById('download');
  const toolButtons = Array.from(document.querySelectorAll('[data-tool]'));

  let tool = 'pen';
  let drawing = false;
  let startX = 0, startY = 0;
  let lastX = 0, lastY = 0;
  let scale = 1;
  const MIN_SCALE = 0.25;
  const MAX_SCALE = 3;

  // Use a large fixed canvas; zoom with CSS transform
  let CANVAS_W = 5000;
  let CANVAS_H = 4000;
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  gridCanvas.width = CANVAS_W;
  gridCanvas.height = CANVAS_H;
  canvas.style.width = CANVAS_W + 'px';
  canvas.style.height = CANVAS_H + 'px';
  gridCanvas.style.width = CANVAS_W + 'px';
  gridCanvas.style.height = CANVAS_H + 'px';
  stage.style.width = CANVAS_W + 'px';
  stage.style.height = CANVAS_H + 'px';

  function expandCanvasTo(newW, newH) {
    const prevCanvas = document.createElement('canvas');
    prevCanvas.width = canvas.width;
    prevCanvas.height = canvas.height;
    prevCanvas.getContext('2d').drawImage(canvas, 0, 0);

    CANVAS_W = Math.max(newW, CANVAS_W);
    CANVAS_H = Math.max(newH, CANVAS_H);
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    gridCanvas.width = CANVAS_W;
    gridCanvas.height = CANVAS_H;
    canvas.style.width = CANVAS_W + 'px';
    canvas.style.height = CANVAS_H + 'px';
    gridCanvas.style.width = CANVAS_W + 'px';
    gridCanvas.style.height = CANVAS_H + 'px';
    stage.style.width = CANVAS_W + 'px';
    stage.style.height = CANVAS_H + 'px';

    ctx.drawImage(prevCanvas, 0, 0);
    if (gridToggle.checked) drawGrid();
  }

  function ensureCanvasCoversFrame() {
    const needW = Math.ceil(frame.clientWidth / scale);
    const needH = Math.ceil(frame.clientHeight / scale);
    if (canvas.width < needW || canvas.height < needH) {
      expandCanvasTo(Math.max(canvas.width, needW), Math.max(canvas.height, needH));
    }
  }

  function applyScale(newScale, anchorPx = { x: frame.clientWidth / 2, y: frame.clientHeight / 2 }) {
    const prevScale = scale;
    scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));
    if (scale === prevScale) return;

    // If zooming out, ensure the canvas base size is large enough to cover viewport
    ensureCanvasCoversFrame();

    // Keep the anchor point stable during zoom
    const preScrollLeft = frame.scrollLeft;
    const preScrollTop = frame.scrollTop;
    const ax = preScrollLeft + anchorPx.x;
    const ay = preScrollTop + anchorPx.y;
    const relX = ax / prevScale;
    const relY = ay / prevScale;

    stage.style.transform = `scale(${scale})`;

    const nx = relX * scale - anchorPx.x;
    const ny = relY * scale - anchorPx.y;
    frame.scrollLeft = nx;
    frame.scrollTop = ny;
  }

  const undoStack = [];
  const redoStack = [];

  function setCanvasSize() {
    // no-op: fixed canvas size; ensure grid redraw
    ensureCanvasCoversFrame();
    if (gridToggle.checked) drawGrid();
  }

  function snapshot() {
    try {
      undoStack.push(canvas.toDataURL('image/png'));
      if (undoStack.length > 50) undoStack.shift();
      redoStack.length = 0;
    } catch {}
  }

  function restore(dataUrl) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        if (gridToggle.checked) drawGrid();
        resolve();
      };
      img.src = dataUrl;
    });
  }

  function clearGrid() {
    gctx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);
  }
  function drawGrid() {
    clearGrid();
    const spacing = 24;
    gctx.save();
    gctx.strokeStyle = '#c8c8c8';
    gctx.lineWidth = 1;
    for (let x = spacing; x < gridCanvas.width; x += spacing) {
      gctx.beginPath(); gctx.moveTo(x + 0.5, 0); gctx.lineTo(x + 0.5, gridCanvas.height); gctx.stroke();
    }
    for (let y = spacing; y < gridCanvas.height; y += spacing) {
      gctx.beginPath(); gctx.moveTo(0, y + 0.5); gctx.lineTo(gridCanvas.width, y + 0.5); gctx.stroke();
    }
    gctx.restore();
  }

  function beginDraw(x, y) {
    drawing = true;
    startX = lastX = x;
    startY = lastY = y;
    snapshot();
  }

  function drawTo(x, y) {
    if (!drawing) return;
    const color = colorInput.value;
    const size = parseInt(sizeInput.value, 10) || 1;
    if (tool === 'pen' || tool === 'highlighter' || tool === 'eraser') {
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = size;
      if (tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
      } else {
        ctx.globalCompositeOperation = tool === 'highlighter' ? 'multiply' : 'source-over';
        ctx.strokeStyle = color;
        ctx.globalAlpha = tool === 'highlighter' ? 0.25 : 1;
      }
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.restore();
      lastX = x; lastY = y;
      return;
    }

    // Preview shapes: restore last snapshot to avoid trails
    restore(undoStack[undoStack.length - 1]).then(() => {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      if (tool === 'line') {
        ctx.beginPath(); ctx.moveTo(startX, startY); ctx.lineTo(x, y); ctx.stroke();
      } else if (tool === 'rect') {
        const w = x - startX, h = y - startY;
        ctx.strokeRect(startX, startY, w, h);
      } else if (tool === 'circle') {
        const r = Math.hypot(x - startX, y - startY);
        ctx.beginPath(); ctx.arc(startX, startY, r, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.restore();
      if (gridToggle.checked) drawGrid();
    });
  }

  function endDraw(x, y) {
    if (!drawing) return;
    drawing = false;
    if (tool === 'text') {
      const text = prompt('Enter text:', '');
      if (text) {
        ctx.save();
        ctx.fillStyle = colorInput.value;
        ctx.font = `${Math.max(12, parseInt(sizeInput.value, 10) * 6)}px Inter, Arial, sans-serif`;
        ctx.fillText(text, x, y);
        ctx.restore();
        if (gridToggle.checked) drawGrid();
      }
      return;
    }
    // For free draw, drawing already placed. For shapes, commit already drawn preview.
  }

  function pointerPos(evt) {
    const rect = canvas.getBoundingClientRect();
    if (evt.touches && evt.touches[0]) {
      return {
        x: evt.touches[0].clientX - rect.left,
        y: evt.touches[0].clientY - rect.top
      };
    }
    return { x: evt.clientX - rect.left, y: evt.clientY - rect.top };
  }

  // Events
  window.addEventListener('resize', setCanvasSize);
  setCanvasSize();
  stage.style.transform = `scale(${scale})`;
  if (gridToggle.checked) drawGrid();

  canvas.addEventListener('mousedown', (e) => { const p = pointerPos(e); beginDraw(p.x, p.y); });
  canvas.addEventListener('mousemove', (e) => { const p = pointerPos(e); drawTo(p.x, p.y); });
  window.addEventListener('mouseup', (e) => { const p = pointerPos(e); endDraw(p.x, p.y); });

  canvas.addEventListener('touchstart', (e) => { const p = pointerPos(e); beginDraw(p.x, p.y); e.preventDefault(); }, { passive: false });
  canvas.addEventListener('touchmove', (e) => { const p = pointerPos(e); drawTo(p.x, p.y); e.preventDefault(); }, { passive: false });
  canvas.addEventListener('touchend', (e) => { const p = pointerPos(e.changedTouches && e.changedTouches[0] ? e.changedTouches[0] : e); endDraw(p.x, p.y); e.preventDefault(); }, { passive: false });

  toolButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      toolButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      tool = btn.getAttribute('data-tool') || 'pen';
      // Update cursor to reflect tool
      if (tool === 'text') {
        canvas.style.cursor = 'text';
      } else if (tool === 'eraser') {
        canvas.style.cursor = 'cell';
      } else {
        canvas.style.cursor = 'crosshair';
      }
    });
  });
  // set initial cursor
  canvas.style.cursor = 'crosshair';

  undoBtn.addEventListener('click', async () => {
    if (!undoStack.length) return;
    const current = canvas.toDataURL('image/png');
    const prev = undoStack.pop();
    redoStack.push(current);
    await restore(prev);
  });
  redoBtn.addEventListener('click', async () => {
    if (!redoStack.length) return;
    const current = canvas.toDataURL('image/png');
    const next = redoStack.pop();
    undoStack.push(current);
    await restore(next);
  });

  clearBtn.addEventListener('click', () => {
    snapshot();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (gridToggle.checked) drawGrid();
  });

  downloadBtn.addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = 'whiteboard.png';
    a.click();
  });

  // Upload feature removed per request

  gridToggle.addEventListener('change', () => {
    if (gridToggle.checked) drawGrid();
    else clearGrid();
  });

  // Zoom controls
  function framePointFromEvent(e) {
    const rect = frame.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }
  document.getElementById('zoom-in').addEventListener('click', () => applyScale(scale * 1.2));
  document.getElementById('zoom-out').addEventListener('click', () => applyScale(scale / 1.2));
  document.getElementById('zoom-reset').addEventListener('click', () => {
    stage.style.transform = 'scale(1)';
    scale = 1;
    ensureCanvasCoversFrame();
  });
  document.getElementById('zoom-fit').addEventListener('click', () => {
    const sx = frame.clientWidth / canvas.width;
    const sy = frame.clientHeight / canvas.height;
    applyScale(Math.max(MIN_SCALE, Math.min(MAX_SCALE, Math.min(sx, sy))));
    frame.scrollLeft = 0;
    frame.scrollTop = 0;
  });

  // Ctrl + wheel to zoom, normal wheel scrolls the board in both directions
  frame.addEventListener('wheel', (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const anchor = framePointFromEvent(e);
      const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
      applyScale(scale * factor, anchor);
    }
  }, { passive: false });
})();


