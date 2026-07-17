import Phaser from 'phaser';
import { WORLD_SIZE, type WorldPoi } from './mapLayout';

/**
 * Stylized Uruguay top-down with textured biomes (grass/sand/water/cobble).
 */
export function drawUruguayMap(scene: Phaser.Scene, pois: WorldPoi[]): void {
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

  // Base grass texture full world
  const grass = scene.add
    .tileSprite(W / 2, H / 2, W, H, 'tex-grass')
    .setDepth(0);
  grass.setTint(0xd0e8d4);

  // Soft north haze
  const g = scene.add.graphics().setDepth(0.5);
  g.fillStyle(0x8eb8d4, 0.1);
  g.fillRect(0, 0, W, H * 0.18);

  // —— Campo ——
  if (campo) {
    const campoGrass = scene.add
      .tileSprite(campo.x, campo.y, 520, 420, 'tex-grass')
      .setDepth(0.6);
    campoGrass.setTint(0xb8e0a8);
    // elliptical mask feel via overlay
    g.fillStyle(0x5d8f4e, 0.15);
    g.fillEllipse(campo.x, campo.y, 520, 420);
    g.lineStyle(14, 0xc4a574, 0.45);
    g.lineBetween(campo.x - 180, campo.y + 40, campo.x + 160, campo.y - 20);
    drawTree(g, campo.x - 90, campo.y - 40, 32);
    drawTree(g, campo.x + 70, campo.y + 20, 26);
    drawTree(g, campo.x + 20, campo.y - 70, 22);
    drawTree(g, campo.x - 40, campo.y + 50, 20);
  }

  // —— Universidad ——
  if (uni) {
    g.fillStyle(0x5a8f66, 0.55);
    g.fillCircle(uni.x, uni.y, 130);
    const lawn = scene.add.tileSprite(uni.x, uni.y, 200, 200, 'tex-grass').setDepth(0.7);
    lawn.setTint(0xa8d4a0);
    g.fillStyle(0xefe6d8, 0.95);
    g.fillRect(uni.x - 55, uni.y - 30, 110, 20);
    g.fillRect(uni.x - 55, uni.y - 30, 20, 60);
    g.fillRect(uni.x + 35, uni.y - 30, 20, 60);
    g.fillStyle(0x4a7c59, 0.45);
    g.fillCircle(uni.x, uni.y + 45, 28);
  }

  // —— Urban plate ——
  if (ciudad && skyline) {
    const midX = (ciudad.x + skyline.x) / 2;
    const midY = (ciudad.y + skyline.y) / 2;
    g.fillStyle(0x8b919a, 0.85);
    g.fillRoundedRect(midX - 280, midY - 160, 560, 320, 36);
  }

  // Ciudad Vieja — cobble texture
  if (ciudad) {
    const cobble = scene.add
      .tileSprite(ciudad.x, ciudad.y, 280, 220, 'tex-cobble')
      .setDepth(0.8);
    cobble.setTint(0xf0e0c8);
    g.fillStyle(0xc4a574, 0.2);
    g.fillRoundedRect(ciudad.x - 140, ciudad.y - 110, 280, 220, 18);
    drawCityBlocks(g, ciudad.x - 95, ciudad.y - 70, 5, 4, 30, 24, 0xb8956a, 0x8b6914);
    g.fillStyle(0xe8d5b5, 0.55);
    g.fillCircle(ciudad.x, ciudad.y + 10, 36);
  }

  // Skyline
  if (skyline) {
    g.fillStyle(0x6a7d94, 0.9);
    g.fillRoundedRect(skyline.x - 120, skyline.y - 90, 240, 180, 14);
    drawSkyline(g, skyline.x - 100, skyline.y - 20, 7);
  }

  // —— Puerto ——
  if (puerto) {
    const waterP = scene.add
      .tileSprite(puerto.x, puerto.y, 280, 220, 'tex-water')
      .setDepth(0.7);
    // slow scroll for life
    scene.tweens.add({
      targets: waterP,
      tilePositionX: 64,
      duration: 8000,
      repeat: -1,
      ease: 'Linear',
    });
    g.fillStyle(0x6b5344, 0.95);
    for (let i = 0; i < 5; i++) {
      g.fillRect(puerto.x - 90 + i * 36, puerto.y - 20, 16, 85);
    }
    g.lineStyle(4, 0x3a3a3a, 0.75);
    g.lineBetween(puerto.x - 70, puerto.y - 20, puerto.x - 70, puerto.y - 90);
    g.lineBetween(puerto.x - 70, puerto.y - 90, puerto.x - 20, puerto.y - 70);
    g.lineBetween(puerto.x + 40, puerto.y - 15, puerto.x + 40, puerto.y - 95);
    g.lineBetween(puerto.x + 40, puerto.y - 95, puerto.x + 90, puerto.y - 75);
    g.fillStyle(0xe07a5f, 0.85);
    g.fillRect(puerto.x - 40, puerto.y + 40, 34, 22);
    g.fillStyle(0xf4c430, 0.8);
    g.fillRect(puerto.x + 5, puerto.y + 40, 34, 22);
  }

  // —— Río ——
  const waterTop = rambla ? rambla.y + 40 : H * 0.72;
  const waterH = H - waterTop;
  const river = scene.add
    .tileSprite(W / 2, waterTop + waterH / 2, W, waterH, 'tex-water')
    .setDepth(0.9);
  scene.tweens.add({
    targets: river,
    tilePositionX: 128,
    duration: 14000,
    repeat: -1,
    ease: 'Linear',
  });
  scene.tweens.add({
    targets: river,
    tilePositionY: 32,
    duration: 9000,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.inOut',
  });

  // —— Rambla sand ——
  if (rambla) {
    const ry = rambla.y + 10;
    const sand = scene.add
      .tileSprite(W / 2, ry, W, 80, 'tex-sand')
      .setDepth(1);
    sand.setTint(0xfff0d8);
    g.setDepth(1.1);
    g.fillStyle(0xd4c0a0, 0.7);
    g.fillRect(0, ry - 35, W, 10);
    g.fillStyle(0x8a9098, 0.65);
    g.fillRect(0, ry + 22, W, 6);
    for (let x = 60; x < W; x += 130) {
      g.fillStyle(0x4a4a4a, 0.85);
      g.fillRect(x, ry - 40, 4, 28);
      g.fillStyle(0xf4c430, 0.4);
      g.fillCircle(x + 2, ry - 42, 7);
    }
    g.fillStyle(0x6b5344, 0.7);
    for (let x = 120; x < W; x += 200) {
      g.fillRect(x, ry + 2, 28, 6);
    }
  }

  // —— Faro ——
  if (faro) {
    g.fillStyle(0xb8956a, 1);
    g.fillTriangle(faro.x - 40, faro.y + 80, faro.x + 160, faro.y - 40, faro.x + 160, faro.y + 120);
    g.fillStyle(0x1b4f72, 0.85);
    g.fillRect(faro.x + 40, faro.y + 40, 200, 160);
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

  // Roads with texture segments
  drawRoads(scene, g, pois);

  // Zone rings
  for (const poi of pois) {
    g.lineStyle(2, poi.color, 0.4);
    g.strokeCircle(poi.x, poi.y, 88);
    g.fillStyle(poi.color, 0.08);
    g.fillCircle(poi.x, poi.y, 88);
  }

  g.lineStyle(100, 0x1a3040, 0.08);
  g.strokeRect(50, 50, W - 100, H - 100);
}

function drawRoads(
  scene: Phaser.Scene,
  g: Phaser.GameObjects.Graphics,
  pois: WorldPoi[],
): void {
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

  g.lineStyle(22, 0x555b63, 0.55);
  for (const [a, b] of links) {
    const pa = byId.get(a);
    const pb = byId.get(b);
    if (!pa || !pb) continue;
    g.lineBetween(pa.x, pa.y, pb.x, pb.y);
    // dashed gold center
  }
  g.lineStyle(3, 0xf4c430, 0.28);
  for (const [a, b] of links) {
    const pa = byId.get(a);
    const pb = byId.get(b);
    if (!pa || !pb) continue;
    g.lineBetween(pa.x, pa.y, pb.x, pb.y);
  }
  void scene;
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
