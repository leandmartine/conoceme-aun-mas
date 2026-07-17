/**
 * Runtime canvas art — stylized hybrid (not raw pixel noise).
 * Player: tall/broad, café-con-leche skin, black hair, grey marled quarter-zip
 * inspired by /media/leandro.jpg (stylized sprite, not photo cutout).
 */

function canvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('2d context unavailable');
  return [c, ctx];
}

function rnd(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** Soft grass patch (tileable-ish). */
export function makeGrassTexture(size = 128): HTMLCanvasElement {
  const [c, ctx] = canvas(size, size);
  const r = rnd(42);
  ctx.fillStyle = '#4f7a58';
  ctx.fillRect(0, 0, size, size);
  // base variation
  for (let i = 0; i < 80; i++) {
    const x = r() * size;
    const y = r() * size;
    const g = 90 + Math.floor(r() * 50);
    ctx.fillStyle = `rgba(${40 + r() * 30},${g},${50 + r() * 20},${0.15 + r() * 0.2})`;
    ctx.beginPath();
    ctx.ellipse(x, y, 8 + r() * 18, 5 + r() * 10, r() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  // grass blades
  for (let i = 0; i < 120; i++) {
    const x = r() * size;
    const y = r() * size;
    ctx.strokeStyle = `rgba(30,${100 + r() * 60},45,${0.25 + r() * 0.35})`;
    ctx.lineWidth = 1 + r();
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + (r() - 0.5) * 6, y - 4 - r() * 8, x + (r() - 0.5) * 4, y - 6 - r() * 10);
    ctx.stroke();
  }
  return c;
}

/** Warm sand / rambla. */
export function makeSandTexture(size = 128): HTMLCanvasElement {
  const [c, ctx] = canvas(size, size);
  const r = rnd(99);
  ctx.fillStyle = '#e8d5b5';
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 100; i++) {
    ctx.fillStyle = `rgba(${200 + r() * 40},${180 + r() * 30},${140 + r() * 30},${0.08 + r() * 0.15})`;
    ctx.beginPath();
    ctx.arc(r() * size, r() * size, 2 + r() * 10, 0, Math.PI * 2);
    ctx.fill();
  }
  // fine grit
  for (let i = 0; i < 200; i++) {
    ctx.fillStyle = `rgba(120,100,70,${0.05 + r() * 0.1})`;
    ctx.fillRect(r() * size, r() * size, 1, 1);
  }
  return c;
}

/** Río water with soft bands. */
export function makeWaterTexture(size = 128): HTMLCanvasElement {
  const [c, ctx] = canvas(size, size);
  const grad = ctx.createLinearGradient(0, 0, 0, size);
  grad.addColorStop(0, '#2a6f97');
  grad.addColorStop(0.45, '#1b4f72');
  grad.addColorStop(1, '#0f3550');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const r = rnd(7);
  for (let i = 0; i < 14; i++) {
    const y = (i / 14) * size + r() * 4;
    ctx.strokeStyle = `rgba(126,182,217,${0.08 + r() * 0.12})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x <= size; x += 8) {
      const yy = y + Math.sin(x * 0.08 + i) * 3;
      if (x === 0) ctx.moveTo(x, yy);
      else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }
  return c;
}

/** Cobble / colonial street. */
export function makeCobbleTexture(size = 128): HTMLCanvasElement {
  const [c, ctx] = canvas(size, size);
  ctx.fillStyle = '#b8956a';
  ctx.fillRect(0, 0, size, size);
  const r = rnd(21);
  const bw = 14;
  const bh = 10;
  for (let y = 0; y < size; y += bh) {
    const off = (Math.floor(y / bh) % 2) * (bw / 2);
    for (let x = -bw; x < size; x += bw) {
      const shade = 140 + Math.floor(r() * 50);
      ctx.fillStyle = `rgb(${shade},${shade - 25},${shade - 55})`;
      ctx.fillRect(x + off + 1, y + 1, bw - 2, bh - 2);
      ctx.strokeStyle = 'rgba(80,60,40,0.25)';
      ctx.strokeRect(x + off + 1, y + 1, bw - 2, bh - 2);
    }
  }
  return c;
}

/** Asphalt road strip. */
export function makeRoadTexture(size = 64): HTMLCanvasElement {
  const [c, ctx] = canvas(size, size);
  ctx.fillStyle = '#555b63';
  ctx.fillRect(0, 0, size, size);
  const r = rnd(3);
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = `rgba(255,255,255,${0.02 + r() * 0.04})`;
    ctx.fillRect(r() * size, r() * size, 2 + r() * 6, 1);
  }
  // center dash
  ctx.fillStyle = 'rgba(244,196,48,0.35)';
  ctx.fillRect(size / 2 - 1, 4, 2, 12);
  ctx.fillRect(size / 2 - 1, 24, 2, 12);
  ctx.fillRect(size / 2 - 1, 44, 2, 12);
  return c;
}

/**
 * Palette inspired by CV photo (leandro.jpg): café-con-leche skin,
 * black hair with volume, grey marled quarter-zip sweater, tall/broad build.
 * Stylized game sprite — not a photo cutout.
 */
const SKIN = '#c49a78';
const SKIN_HI = '#d4b090';
const SKIN_SHADOW = '#a67a58';
const HAIR = '#141210';
const HAIR_HI = '#2a2622';
const EYES = '#1a120c';
const BROW = 'rgba(26, 18, 12, 0.55)';
const SWEATER = '#96969c';
const SWEATER_HI = '#b0b0b6';
const SWEATER_DARK = '#6e6e74';
const SWEATER_ZIP = '#4a4a50';
const PANTS = '#2a3038';
const SHOES = '#2a2018';

type Dir = 'down' | 'up' | 'left' | 'right';

/**
 * Spritesheet: 4 directions × 4 frames, frame 48×76.
 * Layout rows: down, up, left, right.
 */
export function makePlayerSheet(): {
  canvas: HTMLCanvasElement;
  frameW: number;
  frameH: number;
  cols: number;
  rows: number;
} {
  const frameW = 48;
  const frameH = 76;
  const cols = 4;
  const rows = 4;
  const [c, ctx] = canvas(frameW * cols, frameH * rows);
  const dirs: Dir[] = ['down', 'up', 'left', 'right'];

  dirs.forEach((dir, row) => {
    for (let col = 0; col < cols; col++) {
      const ox = col * frameW;
      const oy = row * frameH;
      const walk = col; // 0 idle-ish, 1-3 walk cycle
      drawPlayerFrame(ctx, ox, oy, dir, walk);
    }
  });

  return { canvas: c, frameW, frameH, cols, rows };
}

function fillRound(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  roundRect(ctx, x, y, w, h, r);
  ctx.fill();
}

/** Subtle marl flecks on sweater fabric. */
function marlSweater(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  seed: number,
): void {
  const r = rnd(seed);
  ctx.save();
  ctx.beginPath();
  roundRect(ctx, x, y, w, h, 7);
  ctx.clip();
  for (let i = 0; i < 28; i++) {
    const px = x + r() * w;
    const py = y + r() * h;
    ctx.fillStyle =
      r() > 0.5 ? 'rgba(255,255,255,0.12)' : 'rgba(40,40,45,0.14)';
    ctx.fillRect(px, py, 1 + r() * 2, 1);
  }
  ctx.restore();
}

function drawPlayerFrame(
  ctx: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  dir: Dir,
  frame: number,
): void {
  const bob = frame === 0 ? 0 : Math.sin(frame * 1.2) * 1.5;
  const legSwing = frame === 0 ? 0 : Math.sin(frame * 1.4) * 4;
  const armSwing = -legSwing;
  const hx = 24;
  const hy = 17;

  ctx.save();
  ctx.translate(ox, oy + bob);

  // —— legs (dark jeans / chinos) ——
  ctx.fillStyle = PANTS;
  if (dir === 'left' || dir === 'right') {
    const flip = dir === 'left' ? -1 : 1;
    fillRound(ctx, 17, 54, 11, 16 + legSwing * 0.3 * flip, 3);
    fillRound(ctx, 26, 54, 11, 16 - legSwing * 0.3 * flip, 3);
    ctx.fillStyle = SHOES;
    ctx.fillRect(17, 68 + Math.max(0, legSwing * 0.2), 11, 4);
    ctx.fillRect(26, 68 - Math.min(0, legSwing * 0.2), 11, 4);
  } else {
    const swing = dir === 'down' ? legSwing * 0.4 : legSwing * 0.25;
    fillRound(ctx, 13, 54, 10, 16 + swing, 3);
    fillRound(ctx, 25, 54, 10, 16 - swing, 3);
    ctx.fillStyle = SHOES;
    ctx.fillRect(13, 68, 10, 4);
    ctx.fillRect(25, 68, 10, 4);
  }

  // —— torso: grey marled quarter-zip (from photo) ——
  // broader shoulders (tall_large)
  ctx.fillStyle = SWEATER;
  fillRound(ctx, 9, 27, 30, 32, 8);
  marlSweater(ctx, 9, 27, 30, 32, 11 + frame);
  // chest highlight
  ctx.fillStyle = SWEATER_HI;
  fillRound(ctx, 13, 29, 22, 9, 5);
  // collar / zip placket (front-facing)
  if (dir === 'down') {
    ctx.fillStyle = SWEATER_DARK;
    fillRound(ctx, 19, 27, 10, 10, 4);
    ctx.fillStyle = SWEATER_ZIP;
    ctx.fillRect(23, 28, 2, 14);
    // zipper pull
    ctx.fillStyle = '#c8c8cc';
    ctx.beginPath();
    ctx.arc(24, 29, 1.6, 0, Math.PI * 2);
    ctx.fill();
  } else if (dir === 'up') {
    // collar band from behind
    ctx.fillStyle = SWEATER_DARK;
    fillRound(ctx, 14, 27, 20, 6, 3);
  } else {
    // side collar hint
    ctx.fillStyle = SWEATER_DARK;
    if (dir === 'right') fillRound(ctx, 12, 27, 8, 8, 3);
    else fillRound(ctx, 28, 27, 8, 8, 3);
  }

  // —— arms (sleeves of sweater + skin hands) ——
  if (dir === 'down' || dir === 'up') {
    ctx.fillStyle = SWEATER;
    fillRound(ctx, 3, 30 + armSwing * 0.3, 9, 18, 4);
    fillRound(ctx, 36, 30 - armSwing * 0.3, 9, 18, 4);
    ctx.fillStyle = SKIN;
    fillRound(ctx, 4, 46 + armSwing * 0.3, 7, 7, 3);
    fillRound(ctx, 37, 46 - armSwing * 0.3, 7, 7, 3);
  } else if (dir === 'right') {
    ctx.fillStyle = SWEATER;
    fillRound(ctx, 34, 30 + armSwing * 0.4, 11, 18, 4);
    ctx.fillStyle = SKIN;
    fillRound(ctx, 36, 46 + armSwing * 0.4, 7, 7, 3);
    ctx.fillStyle = SWEATER_DARK;
    fillRound(ctx, 7, 32 - armSwing * 0.3, 8, 15, 3);
  } else {
    ctx.fillStyle = SWEATER;
    fillRound(ctx, 3, 30 + armSwing * 0.4, 11, 18, 4);
    ctx.fillStyle = SKIN;
    fillRound(ctx, 5, 46 + armSwing * 0.4, 7, 7, 3);
    ctx.fillStyle = SWEATER_DARK;
    fillRound(ctx, 33, 32 - armSwing * 0.3, 8, 15, 3);
  }

  // —— neck ——
  ctx.fillStyle = SKIN_SHADOW;
  fillRound(ctx, 19, 24, 10, 6, 3);

  // —— head ——
  ctx.fillStyle = SKIN;
  ctx.beginPath();
  ctx.ellipse(hx, hy, 11.5, 12.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // cheek soft highlight
  ctx.fillStyle = SKIN_HI;
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  ctx.ellipse(hx + (dir === 'left' ? -3 : dir === 'right' ? 3 : 0), hy + 1, 6, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // ears
  ctx.fillStyle = SKIN_SHADOW;
  if (dir !== 'left') {
    ctx.beginPath();
    ctx.ellipse(hx + 11, hy + 2, 2.8, 3.8, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  if (dir !== 'right') {
    ctx.beginPath();
    ctx.ellipse(hx - 11, hy + 2, 2.8, 3.8, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // —— hair: black, volume on top, short sides (photo) ——
  ctx.fillStyle = HAIR;
  if (dir === 'up') {
    // full back of head
    ctx.beginPath();
    ctx.ellipse(hx, hy + 1, 12, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(hx, hy - 5, 12.5, 9, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // crown + sideburns
    ctx.beginPath();
    ctx.ellipse(hx, hy - 6, 12.5, 8.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(hx - 12, hy - 6, 24, 9);
    // short sides curve down
    ctx.beginPath();
    ctx.ellipse(hx - 11, hy + 1, 3.5, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(hx + 11, hy + 1, 3.5, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    if (dir === 'down') {
      // soft fringe
      ctx.beginPath();
      ctx.moveTo(hx - 11, hy - 1);
      ctx.quadraticCurveTo(hx - 5, hy + 5, hx - 1, hy);
      ctx.quadraticCurveTo(hx + 2, hy + 5, hx + 6, hy + 1);
      ctx.quadraticCurveTo(hx + 9, hy + 4, hx + 11, hy - 1);
      ctx.lineTo(hx + 11, hy - 6);
      ctx.lineTo(hx - 11, hy - 6);
      ctx.closePath();
      ctx.fill();
      // hair highlight
      ctx.fillStyle = HAIR_HI;
      ctx.globalAlpha = 0.45;
      ctx.beginPath();
      ctx.ellipse(hx - 3, hy - 8, 5, 2.5, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    } else if (dir === 'left') {
      ctx.beginPath();
      ctx.ellipse(hx - 4, hy - 2, 8, 6, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (dir === 'right') {
      ctx.beginPath();
      ctx.ellipse(hx + 4, hy - 2, 8, 6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // —— face ——
  if (dir === 'down') {
    // brows
    ctx.strokeStyle = BROW;
    ctx.lineWidth = 1.3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(hx - 7.5, hy - 1.5);
    ctx.lineTo(hx - 2, hy - 2.5);
    ctx.moveTo(hx + 2, hy - 2.5);
    ctx.lineTo(hx + 7.5, hy - 1.5);
    ctx.stroke();
    // eyes
    ctx.fillStyle = EYES;
    ctx.beginPath();
    ctx.arc(hx - 4, hy + 1.2, 1.8, 0, Math.PI * 2);
    ctx.arc(hx + 4, hy + 1.2, 1.8, 0, Math.PI * 2);
    ctx.fill();
    // soft eye white glint
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.beginPath();
    ctx.arc(hx - 3.3, hy + 0.6, 0.6, 0, Math.PI * 2);
    ctx.arc(hx + 4.7, hy + 0.6, 0.6, 0, Math.PI * 2);
    ctx.fill();
    // nose hint
    ctx.strokeStyle = 'rgba(140, 100, 70, 0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(hx, hy + 2);
    ctx.lineTo(hx + 0.5, hy + 5);
    ctx.stroke();
    // open smile (photo energy)
    ctx.fillStyle = '#f5ebe0';
    ctx.beginPath();
    ctx.ellipse(hx, hy + 7.5, 4.2, 2.2, 0, 0, Math.PI);
    ctx.fill();
    ctx.strokeStyle = 'rgba(140, 80, 60, 0.65)';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.arc(hx, hy + 6.2, 4.2, 0.12, Math.PI - 0.12);
    ctx.stroke();
    // light stubble
    ctx.fillStyle = 'rgba(40, 30, 24, 0.18)';
    ctx.beginPath();
    ctx.ellipse(hx, hy + 9, 7, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (dir === 'left') {
    ctx.fillStyle = EYES;
    ctx.beginPath();
    ctx.arc(hx - 5, hy + 1, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.beginPath();
    ctx.arc(hx - 4.4, hy + 0.4, 0.55, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(140, 80, 60, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(hx - 4, hy + 6, 2.5, 0.2, Math.PI - 0.2);
    ctx.stroke();
  } else if (dir === 'right') {
    ctx.fillStyle = EYES;
    ctx.beginPath();
    ctx.arc(hx + 5, hy + 1, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.beginPath();
    ctx.arc(hx + 5.6, hy + 0.4, 0.55, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(140, 80, 60, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(hx + 4, hy + 6, 2.5, 0.2, Math.PI - 0.2);
    ctx.stroke();
  }

  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

/** Soft circular shadow. */
export function makeShadowTexture(): HTMLCanvasElement {
  const [c, ctx] = canvas(48, 24);
  const g = ctx.createRadialGradient(24, 12, 2, 24, 12, 20);
  g.addColorStop(0, 'rgba(0,0,0,0.35)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(24, 12, 20, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  return c;
}

/** POI beacon with soft glow. */
export function makePoiTexture(): HTMLCanvasElement {
  const [c, ctx] = canvas(64, 64);
  const g = ctx.createRadialGradient(32, 32, 4, 32, 32, 30);
  g.addColorStop(0, 'rgba(244,196,48,0.55)');
  g.addColorStop(0.5, 'rgba(244,196,48,0.15)');
  g.addColorStop(1, 'rgba(244,196,48,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  ctx.strokeStyle = 'rgba(244,196,48,0.9)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(32, 32, 18, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#f7f2e9';
  ctx.beginPath();
  ctx.arc(32, 32, 6, 0, Math.PI * 2);
  ctx.fill();
  return c;
}

/** Landmark icons 48×48 for each place type. */
export function makeLandmarkIcon(kind: string): HTMLCanvasElement {
  const [c, ctx] = canvas(48, 48);
  ctx.clearRect(0, 0, 48, 48);

  switch (kind) {
    case 'rambla':
      // wave + sun
      ctx.fillStyle = '#1b4f72';
      ctx.fillRect(4, 28, 40, 14);
      ctx.strokeStyle = '#7eb6d9';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(4, 30);
      for (let x = 4; x <= 44; x += 6) ctx.lineTo(x, 30 + Math.sin(x) * 3);
      ctx.stroke();
      ctx.fillStyle = '#f4c430';
      ctx.beginPath();
      ctx.arc(34, 14, 8, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'ciudad-vieja':
      ctx.fillStyle = '#c4a574';
      ctx.fillRect(10, 18, 28, 22);
      ctx.fillStyle = '#a88858';
      ctx.beginPath();
      ctx.moveTo(8, 18);
      ctx.lineTo(24, 6);
      ctx.lineTo(40, 18);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#5a4030';
      ctx.fillRect(20, 28, 8, 12);
      break;
    case 'skyline':
      ctx.fillStyle = '#3d4f66';
      ctx.fillRect(8, 20, 10, 22);
      ctx.fillRect(20, 10, 12, 32);
      ctx.fillRect(34, 16, 8, 26);
      ctx.fillStyle = '#7eb6d9';
      for (let y = 14; y < 40; y += 5) {
        ctx.fillRect(22, y, 3, 2);
        ctx.fillRect(28, y, 3, 2);
      }
      break;
    case 'universidad':
      ctx.fillStyle = '#efe6d8';
      ctx.fillRect(8, 16, 32, 24);
      ctx.fillStyle = '#4a7c59';
      ctx.fillRect(8, 12, 32, 6);
      ctx.fillStyle = '#5a4030';
      ctx.fillRect(20, 28, 8, 12);
      break;
    case 'puerto':
      ctx.fillStyle = '#1b4f72';
      ctx.fillRect(4, 26, 40, 14);
      ctx.fillStyle = '#6b5344';
      ctx.fillRect(10, 18, 6, 20);
      ctx.fillRect(22, 14, 6, 24);
      ctx.fillRect(34, 20, 6, 18);
      ctx.strokeStyle = '#3a3a3a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(13, 18);
      ctx.lineTo(13, 8);
      ctx.lineTo(22, 12);
      ctx.stroke();
      break;
    case 'campo':
      ctx.fillStyle = '#5d8f4e';
      ctx.beginPath();
      ctx.ellipse(24, 30, 18, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#3a5c40';
      ctx.beginPath();
      ctx.arc(24, 18, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#5a4030';
      ctx.fillRect(22, 22, 4, 12);
      break;
    case 'faro':
    default:
      ctx.fillStyle = '#b8956a';
      ctx.beginPath();
      ctx.moveTo(8, 40);
      ctx.lineTo(40, 40);
      ctx.lineTo(36, 28);
      ctx.lineTo(12, 28);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#f7f2e9';
      ctx.fillRect(20, 8, 8, 24);
      ctx.fillStyle = '#e07a5f';
      ctx.fillRect(20, 8, 8, 6);
      ctx.fillStyle = '#f4c430';
      ctx.beginPath();
      ctx.arc(24, 6, 5, 0, Math.PI * 2);
      ctx.fill();
      break;
  }
  return c;
}
