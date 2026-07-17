import Phaser from 'phaser';
import { WORLD_SIZE, type WorldPoi } from './mapLayout';

/**
 * Stylized Uruguay top-down: biomes anchored to real POI positions.
 * South feel = Río + Rambla · west = Puerto · center = ciudad · north = campo · east = faro.
 */
export function drawUruguayMap(scene: Phaser.Scene, pois: WorldPoi[]): void {
  const g = scene.add.graphics().setDepth(0);
  const W = WORLD_SIZE;
  const H = WORLD_SIZE;
  const byId = Object.fromEntries(pois.map((p) => [p.id, p])) as Partial<
    Record<WorldPoi['id'], WorldPoi>
  >;

  const rambla = byId.rambla;
  const ciudad = byId['ciudad-vieja'];
  const skyline = byId.skyline;
  const uni = byId.universidad;
  const puerto = byId.puerto;
  const campo = byId.campo;
  const faro = byId.faro;

  // —— Base land (warm green-grey countryside / periurbano) ——
  g.fillStyle(0x4f7a58, 1);
  g.fillRect(0, 0, W, H);

  // Soft sky-haze north (atmosphere)
  g.fillStyle(0x8eb8d4, 0.12);
  g.fillRect(0, 0, W, H * 0.2);

  // —— Campo (north, around campo POI) ——
  if (campo) {
    g.fillStyle(0x5d8f4e, 1);
    g.fillEllipse(campo.x, campo.y, 520, 420);
    g.fillStyle(0x6fa05c, 0.45);
    g.fillEllipse(campo.x - 40, campo.y - 30, 280, 200);
    g.fillStyle(0xc4a574, 0.25);
    // rural track
    g.lineStyle(16, 0xc4a574, 0.4);
    g.lineBetween(campo.x - 180, campo.y + 40, campo.x + 160, campo.y - 20);
    drawTree(g, campo.x - 90, campo.y - 40, 32);
    drawTree(g, campo.x + 70, campo.y + 20, 26);
    drawTree(g, campo.x + 20, campo.y - 70, 22);
  } else {
    g.fillStyle(0x5d8f4e, 1);
    g.fillEllipse(W * 0.4, H * 0.22, 600, 400);
  }

  // —— Universidad campus ——
  if (uni) {
    g.fillStyle(0x5a8f66, 1);
    g.fillCircle(uni.x, uni.y, 130);
    g.fillStyle(0x7eb68a, 0.35);
    g.fillCircle(uni.x, uni.y, 80);
    g.fillStyle(0xefe6d8, 0.95);
    g.fillRect(uni.x - 55, uni.y - 30, 110, 20);
    g.fillRect(uni.x - 55, uni.y - 30, 20, 60);
    g.fillRect(uni.x + 35, uni.y - 30, 20, 60);
    g.fillStyle(0x4a7c59, 0.5);
    g.fillCircle(uni.x, uni.y + 45, 28); // patio
  }

  // —— Urban plate (ciudad + skyline) ——
  if (ciudad && skyline) {
    const midX = (ciudad.x + skyline.x) / 2;
    const midY = (ciudad.y + skyline.y) / 2;
    g.fillStyle(0x8b919a, 1);
    g.fillRoundedRect(midX - 280, midY - 160, 560, 320, 36);
    g.fillStyle(0x9aa3ae, 0.4);
    g.fillRoundedRect(midX - 250, midY - 140, 500, 280, 28);
  }

  // Ciudad Vieja — warm stone
  if (ciudad) {
    g.fillStyle(0xc4a574, 1);
    g.fillRoundedRect(ciudad.x - 130, ciudad.y - 100, 260, 200, 18);
    g.fillStyle(0xd8bc94, 0.45);
    g.fillRoundedRect(ciudad.x - 110, ciudad.y - 80, 220, 160, 12);
    drawCityBlocks(g, ciudad.x - 95, ciudad.y - 70, 5, 4, 30, 24, 0xb8956a, 0x8b6914);
    // plaza
    g.fillStyle(0xe8d5b5, 0.55);
    g.fillCircle(ciudad.x, ciudad.y + 10, 36);
  }

  // Skyline — glass towers
  if (skyline) {
    g.fillStyle(0x6a7d94, 1);
    g.fillRoundedRect(skyline.x - 120, skyline.y - 90, 240, 180, 14);
    drawSkyline(g, skyline.x - 100, skyline.y - 20, 7);
  }

  // —— Puerto ——
  if (puerto) {
    g.fillStyle(0x1b4f72, 1);
    g.fillRoundedRect(puerto.x - 140, puerto.y - 100, 260, 210, 28);
    g.fillStyle(0x2a6a8f, 0.55);
    g.fillRoundedRect(puerto.x - 120, puerto.y - 80, 220, 170, 20);
    g.fillStyle(0x6b5344, 0.95);
    for (let i = 0; i < 5; i++) {
      g.fillRect(puerto.x - 90 + i * 36, puerto.y - 20, 16, 85);
    }
    g.lineStyle(4, 0x3a3a3a, 0.75);
    g.lineBetween(puerto.x - 70, puerto.y - 20, puerto.x - 70, puerto.y - 90);
    g.lineBetween(puerto.x - 70, puerto.y - 90, puerto.x - 20, puerto.y - 70);
    g.lineBetween(puerto.x + 40, puerto.y - 15, puerto.x + 40, puerto.y - 95);
    g.lineBetween(puerto.x + 40, puerto.y - 95, puerto.x + 90, puerto.y - 75);
    // containers
    g.fillStyle(0xe07a5f, 0.8);
    g.fillRect(puerto.x - 40, puerto.y + 40, 34, 22);
    g.fillStyle(0xf4c430, 0.75);
    g.fillRect(puerto.x + 5, puerto.y + 40, 34, 22);
  }

  // —— Río de la Plata (south of rambla) ——
  const waterTop = rambla ? rambla.y + 40 : H * 0.72;
  g.fillStyle(0x1b4f72, 1);
  g.fillRect(0, waterTop, W, H - waterTop);
  g.fillStyle(0x164566, 1);
  g.fillRect(0, waterTop + 80, W, H - waterTop - 80);
  g.fillStyle(0x0f3550, 1);
  g.fillRect(0, waterTop + 160, W, Math.max(0, H - waterTop - 160));
  g.lineStyle(2, 0x7eb6d9, 0.18);
  for (let y = waterTop + 20; y < H; y += 32) {
    g.beginPath();
    for (let x = 0; x <= W; x += 48) {
      const yy = y + Math.sin(x * 0.018 + y * 0.02) * 7;
      if (x === 0) g.moveTo(x, yy);
      else g.lineTo(x, yy);
    }
    g.strokePath();
  }

  // —— Rambla promenade ——
  if (rambla) {
    const ry = rambla.y + 10;
    g.fillStyle(0xe8d5b5, 1);
    g.fillRect(0, ry - 35, W, 70);
    g.fillStyle(0xd4c0a0, 1);
    g.fillRect(0, ry - 35, W, 12);
    g.fillStyle(0xcfc4b0, 0.95);
    g.fillRect(0, ry - 8, W, 20);
    // rail / edge to water
    g.fillStyle(0x8a9098, 0.7);
    g.fillRect(0, ry + 22, W, 6);
    // lamps
    for (let x = 60; x < W; x += 130) {
      g.fillStyle(0x4a4a4a, 0.85);
      g.fillRect(x, ry - 40, 4, 28);
      g.fillStyle(0xf4c430, 0.4);
      g.fillCircle(x + 2, ry - 42, 7);
    }
    // benches hint
    g.fillStyle(0x6b5344, 0.7);
    for (let x = 120; x < W; x += 200) {
      g.fillRect(x, ry + 2, 28, 6);
    }
  }

  // —— Faro / east coast ——
  if (faro) {
    g.fillStyle(0xb8956a, 1);
    g.fillTriangle(faro.x - 40, faro.y + 80, faro.x + 160, faro.y - 40, faro.x + 160, faro.y + 120);
    g.fillStyle(0x1b4f72, 0.9);
    g.fillRect(faro.x + 40, faro.y + 40, 200, 160);
    // tower
    g.fillStyle(0xf7f2e9, 1);
    g.fillRect(faro.x - 12, faro.y - 100, 24, 110);
    g.fillStyle(0xe07a5f, 1);
    g.fillRect(faro.x - 12, faro.y - 100, 24, 20);
    g.fillRect(faro.x - 12, faro.y - 50, 24, 16);
    g.fillStyle(0xf4c430, 0.65);
    g.fillCircle(faro.x, faro.y - 112, 16);
    g.fillStyle(0xf4c430, 0.1);
    g.fillTriangle(faro.x, faro.y - 112, faro.x + 220, faro.y - 40, faro.x + 220, faro.y + 80);
  }

  // —— Roads between places ——
  drawRoads(g, pois);

  // Soft zone rings (readable, not noisy)
  for (const poi of pois) {
    g.fillStyle(poi.color, 0.1);
    g.fillCircle(poi.x, poi.y, 88);
    g.lineStyle(2, poi.color, 0.35);
    g.strokeCircle(poi.x, poi.y, 88);
  }

  // Edge atmosphere
  g.lineStyle(100, 0x1a3040, 0.1);
  g.strokeRect(50, 50, W - 100, H - 100);
}

function drawRoads(g: Phaser.GameObjects.Graphics, pois: WorldPoi[]): void {
  const byId = new Map(pois.map((p) => [p.id, p]));
  const links: Array<[WorldPoi['id'], WorldPoi['id']]> = [
    ['rambla', 'ciudad-vieja'],
    ['ciudad-vieja', 'puerto'],
    ['ciudad-vieja', 'skyline'],
    ['skyline', 'universidad'],
    ['universidad', 'campo'],
    ['skyline', 'faro'],
    ['rambla', 'faro'],
    ['puerto', 'campo'],
  ];

  g.lineStyle(20, 0x555b63, 0.5);
  for (const [a, b] of links) {
    const pa = byId.get(a);
    const pb = byId.get(b);
    if (!pa || !pb) continue;
    g.lineBetween(pa.x, pa.y, pb.x, pb.y);
  }
  g.lineStyle(3, 0xf4c430, 0.22);
  for (const [a, b] of links) {
    const pa = byId.get(a);
    const pb = byId.get(b);
    if (!pa || !pb) continue;
    g.lineBetween(pa.x, pa.y, pb.x, pb.y);
  }
}

function drawCityBlocks(
  g: Phaser.GameObjects.Graphics,
  ox: number,
  oy: number,
  cols: number,
  rows: number,
  bw: number,
  bh: number,
  fill: number,
  stroke: number,
): void {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = ox + c * (bw + 8);
      const y = oy + r * (bh + 8);
      g.fillStyle(fill, 0.92);
      g.fillRect(x, y, bw, bh);
      g.lineStyle(1, stroke, 0.3);
      g.strokeRect(x, y, bw, bh);
      g.fillStyle(0xf7f2e9, 0.15);
      g.fillRect(x + 2, y + 2, bw - 4, 4);
    }
  }
}

function drawSkyline(g: Phaser.GameObjects.Graphics, ox: number, baselineY: number, count: number): void {
  const heights = [100, 140, 75, 160, 110, 130, 90];
  let x = ox;
  for (let i = 0; i < count; i++) {
    const h = heights[i % heights.length] ?? 100;
    const w = 24 + (i % 3) * 6;
    g.fillStyle(0x3d4f66, 0.96);
    g.fillRect(x, baselineY - h, w, h);
    g.fillStyle(0x7eb6d9, 0.28);
    for (let wy = baselineY - h + 10; wy < baselineY - 8; wy += 11) {
      for (let wx = x + 5; wx < x + w - 4; wx += 8) {
        g.fillRect(wx, wy, 3, 5);
      }
    }
    x += w + 10;
  }
}

function drawTree(g: Phaser.GameObjects.Graphics, x: number, y: number, r: number): void {
  g.fillStyle(0x3a5c40, 0.92);
  g.fillCircle(x, y, r);
  g.fillStyle(0x2d4a32, 0.75);
  g.fillCircle(x - r * 0.25, y + r * 0.1, r * 0.65);
  g.fillStyle(0x5a4030, 1);
  g.fillRect(x - 3, y + r * 0.45, 6, r * 0.55);
}
