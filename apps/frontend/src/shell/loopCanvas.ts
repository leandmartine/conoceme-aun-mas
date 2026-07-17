/**
 * Lightweight looping “video” backdrops on canvas — no external assets.
 * Interactive: mouse/touch shifts parallax and wave energy.
 */
export function mountLoopCanvas(host: HTMLElement): () => void {
  const canvas = document.createElement('canvas');
  canvas.className = 'shell__loop-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  host.append(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => undefined;

  let w = 0;
  let h = 0;
  let raf = 0;
  let t = 0;
  let mx = 0.5;
  let my = 0.5;
  let targetMx = 0.5;
  let targetMy = 0.5;
  let running = true;

  const resize = () => {
    const rect = host.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = Math.max(1, Math.floor(rect.width));
    h = Math.max(1, Math.floor(rect.height));
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const onMove = (clientX: number, clientY: number) => {
    const rect = host.getBoundingClientRect();
    targetMx = (clientX - rect.left) / Math.max(rect.width, 1);
    targetMy = (clientY - rect.top) / Math.max(rect.height, 1);
  };

  const onPointer = (e: PointerEvent) => onMove(e.clientX, e.clientY);
  const onTouch = (e: TouchEvent) => {
    const touch = e.touches[0];
    if (touch) onMove(touch.clientX, touch.clientY);
  };

  host.addEventListener('pointermove', onPointer);
  host.addEventListener('touchmove', onTouch, { passive: true });
  window.addEventListener('resize', resize);
  resize();

  const draw = () => {
    if (!running) return;
    t += 0.016;
    mx += (targetMx - mx) * 0.06;
    my += (targetMy - my) * 0.06;

    // Sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#0b1a2e');
    sky.addColorStop(0.45, '#143352');
    sky.addColorStop(0.72, '#1b4f72');
    sky.addColorStop(1, '#0f3550');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Soft sun
    const sx = w * (0.72 + (mx - 0.5) * 0.08);
    const sy = h * (0.22 + (my - 0.5) * 0.05);
    const sun = ctx.createRadialGradient(sx, sy, 4, sx, sy, h * 0.28);
    sun.addColorStop(0, 'rgba(244,196,48,0.85)');
    sun.addColorStop(0.35, 'rgba(224,122,95,0.35)');
    sun.addColorStop(1, 'rgba(224,122,95,0)');
    ctx.fillStyle = sun;
    ctx.fillRect(0, 0, w, h);

    // Far hills
    ctx.fillStyle = 'rgba(47, 90, 70, 0.55)';
    drawHills(ctx, w, h * 0.58, 0.012, t * 0.15, 40 + (mx - 0.5) * 20);
    ctx.fillStyle = 'rgba(58, 108, 82, 0.7)';
    drawHills(ctx, w, h * 0.64, 0.018, t * 0.22 + 1, 28 + (mx - 0.5) * 12);

    // City silhouette mid
    ctx.fillStyle = 'rgba(30, 42, 58, 0.85)';
    drawSkyline(ctx, w, h * 0.62, mx);

    // Water band
    const waterY = h * 0.72;
    const water = ctx.createLinearGradient(0, waterY, 0, h);
    water.addColorStop(0, 'rgba(42,111,151,0.95)');
    water.addColorStop(1, 'rgba(15,53,80,1)');
    ctx.fillStyle = water;
    ctx.fillRect(0, waterY, w, h - waterY);

    // Animated wave loops
    for (let layer = 0; layer < 4; layer++) {
      const amp = 4 + layer * 3 + my * 6;
      const speed = 0.8 + layer * 0.35;
      const y0 = waterY + 8 + layer * 14;
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 6) {
        const y =
          y0 +
          Math.sin(x * 0.012 + t * speed + layer) * amp +
          Math.sin(x * 0.004 - t * 0.5 + mx * 2) * (amp * 0.4);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fillStyle = `rgba(126,182,217,${0.06 + layer * 0.04})`;
      ctx.fill();
    }

    // Foam line
    ctx.strokeStyle = 'rgba(247,242,233,0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 4) {
      const y = waterY + Math.sin(x * 0.02 + t * 2.2) * 3;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Floating particles (loop)
    for (let i = 0; i < 28; i++) {
      const px = ((i * 97 + t * (12 + (i % 5))) % (w + 40)) - 20;
      const py = ((i * 53 + Math.sin(t + i) * 30) % (h * 0.55)) + h * 0.08;
      ctx.fillStyle = `rgba(247,242,233,${0.08 + (i % 4) * 0.04})`;
      ctx.beginPath();
      ctx.arc(px + mx * 10, py, 1.2 + (i % 3), 0, Math.PI * 2);
      ctx.fill();
    }

    raf = requestAnimationFrame(draw);
  };

  raf = requestAnimationFrame(draw);

  return () => {
    running = false;
    cancelAnimationFrame(raf);
    host.removeEventListener('pointermove', onPointer);
    host.removeEventListener('touchmove', onTouch);
    window.removeEventListener('resize', resize);
    canvas.remove();
  };
}

function drawHills(
  ctx: CanvasRenderingContext2D,
  w: number,
  baseY: number,
  freq: number,
  phase: number,
  amp: number,
): void {
  ctx.beginPath();
  ctx.moveTo(0, baseY);
  for (let x = 0; x <= w; x += 8) {
    ctx.lineTo(x, baseY + Math.sin(x * freq + phase) * amp);
  }
  ctx.lineTo(w, baseY + 200);
  ctx.lineTo(0, baseY + 200);
  ctx.closePath();
  ctx.fill();
}

function drawSkyline(ctx: CanvasRenderingContext2D, w: number, baseY: number, mx: number): void {
  const shift = (mx - 0.5) * 30;
  let x = w * 0.15 + shift;
  const blocks = [70, 110, 55, 140, 90, 120, 65, 100, 80];
  for (let i = 0; i < blocks.length; i++) {
    const bh = blocks[i]!;
    const bw = 18 + (i % 3) * 8;
    ctx.fillRect(x, baseY - bh, bw, bh);
    x += bw + 10;
  }
}
