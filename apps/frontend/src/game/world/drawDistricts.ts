import { WORLD_SIZE, type WorldPoi } from './mapLayout';

/** Dense props per place — no extra water textures (ocean is drawn once in the map). */
export function drawDistricts(
  scene: Phaser.Scene,
  g: Phaser.GameObjects.Graphics,
  pois: WorldPoi[],
  coastY: number,
): void {
  const byId = Object.fromEntries(pois.map((p) => [p.id, p])) as Partial<
    Record<WorldPoi['id'], WorldPoi>
  >;

  if (byId.campo) drawCampo(scene, g, byId.campo);
  if (byId.universidad) drawUniversidad(scene, g, byId.universidad);
  if (byId['ciudad-vieja']) drawCiudadVieja(scene, g, byId['ciudad-vieja']);
  if (byId.skyline) drawSkylineDistrict(g, byId.skyline);
  // Rambla first so port/faro docks sit cleanly on the same coast band
  if (byId.rambla) drawRambla(scene, g, byId.rambla, coastY);
  if (byId.puerto) drawPuerto(g, byId.puerto, coastY);
  if (byId.faro) drawFaro(g, byId.faro, coastY);
}

function drawCampo(scene: Phaser.Scene, g: Phaser.GameObjects.Graphics, p: WorldPoi): void {
  const lawn = scene.add.tileSprite(p.x, p.y, 300, 240, 'tex-grass').setDepth(2.5);
  lawn.setTint(0xb5dc9e);
  g.fillStyle(0x5d8f4e, 0.12);
  g.fillEllipse(p.x, p.y, 300, 240);

  g.lineStyle(2, 0x6b5344, 0.5);
  g.strokeEllipse(p.x, p.y, 270, 210);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    g.fillStyle(0x6b5344, 0.85);
    g.fillRect(p.x + Math.cos(a) * 135 - 2, p.y + Math.sin(a) * 105 - 8, 4, 14);
  }

  tree(g, p.x - 70, p.y - 40, 34);
  tree(g, p.x + 55, p.y - 20, 26);
  tree(g, p.x + 10, p.y + 45, 20);

  g.fillStyle(0xc4a574, 0.95);
  g.fillRect(p.x + 60, p.y + 15, 44, 30);
  g.fillStyle(0x8b5a2b, 0.9);
  g.fillTriangle(p.x + 56, p.y + 15, p.x + 82, p.y, p.x + 108, p.y + 15);
  g.fillStyle(0xd4a84b, 0.85);
  g.fillCircle(p.x - 85, p.y + 50, 11);
  g.fillCircle(p.x - 68, p.y + 52, 9);
}

function drawUniversidad(scene: Phaser.Scene, g: Phaser.GameObjects.Graphics, p: WorldPoi): void {
  const lawn = scene.add.tileSprite(p.x, p.y, 240, 200, 'tex-grass').setDepth(2.5);
  lawn.setTint(0xa8d4a0);
  g.fillStyle(0x4a7c59, 0.18);
  g.fillRoundedRect(p.x - 120, p.y - 100, 240, 200, 14);

  g.fillStyle(0xefe6d8, 0.98);
  g.fillRect(p.x - 65, p.y - 45, 130, 22);
  g.fillRect(p.x - 65, p.y - 45, 22, 85);
  g.fillRect(p.x + 43, p.y - 45, 22, 85);
  g.fillStyle(0xd8cfc0, 1);
  for (let i = 0; i < 5; i++) g.fillRect(p.x - 48 + i * 20, p.y - 36, 6, 18);

  g.fillStyle(0x7eb6d9, 0.45);
  g.fillCircle(p.x, p.y + 28, 20);
  g.fillStyle(0xf7f2e9, 0.7);
  g.fillCircle(p.x, p.y + 28, 7);

  g.fillStyle(0xe0d6c8, 0.95);
  g.fillRect(p.x - 110, p.y + 8, 36, 50);
  g.fillRect(p.x + 74, p.y + 8, 36, 50);
}

function drawCiudadVieja(scene: Phaser.Scene, g: Phaser.GameObjects.Graphics, p: WorldPoi): void {
  const cobble = scene.add.tileSprite(p.x, p.y, 300, 240, 'tex-cobble').setDepth(2.5);
  cobble.setTint(0xf2e4cc);
  g.fillStyle(0xc4a574, 0.12);
  g.fillRoundedRect(p.x - 150, p.y - 120, 300, 240, 12);

  blocks(g, p.x - 130, p.y - 95, 6, 5, 28, 22, 0xb8956a, 0x8b6914);
  g.fillStyle(0xe8d5b5, 0.7);
  g.fillCircle(p.x, p.y + 12, 40);
  g.fillStyle(0x8b7355, 0.9);
  g.fillRect(p.x - 3, p.y - 18, 6, 28);

  g.fillStyle(0xe07a5f, 0.75);
  g.fillRect(p.x - 120, p.y + 65, 34, 8);
  g.fillStyle(0x1b4f72, 0.7);
  g.fillRect(p.x + 85, p.y + 65, 34, 8);

  for (const [lx, ly] of [
    [-48, -28],
    [48, -28],
    [-48, 65],
    [48, 65],
  ] as const) {
    g.fillStyle(0x3a3a3a, 0.85);
    g.fillRect(p.x + lx, p.y + ly, 3, 16);
    g.fillStyle(0xf4c430, 0.4);
    g.fillCircle(p.x + lx + 1.5, p.y + ly, 5);
  }
}

function drawSkylineDistrict(g: Phaser.GameObjects.Graphics, p: WorldPoi): void {
  g.fillStyle(0x6a7d94, 0.5);
  g.fillRoundedRect(p.x - 130, p.y - 95, 260, 190, 12);
  g.fillStyle(0x9aa3ae, 0.4);
  g.fillRect(p.x - 110, p.y + 35, 220, 36);

  const heights = [90, 135, 70, 155, 105, 125, 85, 115];
  let x = p.x - 110;
  for (let i = 0; i < heights.length; i++) {
    const h = heights[i]!;
    const w = 20 + (i % 3) * 5;
    g.fillStyle(0x3d4f66, 0.96);
    g.fillRect(x, p.y + 35 - h, w, h);
    g.fillStyle(0x7eb6d9, 0.28);
    for (let wy = p.y + 42 - h; wy < p.y + 28; wy += 10) {
      for (let wx = x + 4; wx < x + w - 3; wx += 7) g.fillRect(wx, wy, 3, 4);
    }
    x += w + 7;
  }
  tree(g, p.x - 85, p.y + 50, 13);
  tree(g, p.x + 85, p.y + 50, 13);
}

/** Puerto: docks sit on the shared ocean — no second water texture. */
function drawPuerto(g: Phaser.GameObjects.Graphics, p: WorldPoi, coastY: number): void {
  // Keep quay on the land/water edge
  const quayY = Math.min(p.y, coastY - 8);

  g.fillStyle(0x6b6f76, 0.96);
  g.fillRect(p.x - 120, quayY - 28, 210, 32);
  // piers into water
  g.fillStyle(0x5a4030, 0.92);
  for (let i = 0; i < 5; i++) {
    g.fillRect(p.x - 100 + i * 38, quayY, 14, 78);
  }
  g.lineStyle(4, 0x2a2a2a, 0.85);
  g.lineBetween(p.x - 85, quayY, p.x - 85, quayY - 70);
  g.lineBetween(p.x - 85, quayY - 70, p.x - 25, quayY - 48);
  g.lineBetween(p.x + 25, quayY, p.x + 25, quayY - 75);
  g.lineBetween(p.x + 25, quayY - 75, p.x + 80, quayY - 50);

  const cols = [0xe07a5f, 0xf4c430, 0x1b4f72, 0x4a7c59, 0xc4a574];
  for (let i = 0; i < 5; i++) {
    g.fillStyle(cols[i]!, 0.92);
    g.fillRect(p.x - 95 + i * 32, quayY - 48, 26, 16);
    g.fillRect(p.x - 95 + i * 32, quayY - 65, 26, 16);
  }
  g.fillStyle(0x8a9098, 0.95);
  g.fillRect(p.x + 65, quayY - 55, 65, 48);
  g.fillStyle(0x3a3a3a, 0.5);
  g.fillRect(p.x + 78, quayY - 35, 18, 26);
  g.fillStyle(0xf7f2e9, 0.8);
  for (let i = 0; i < 5; i++) g.fillCircle(p.x - 95 + i * 38, quayY - 32, 4);
}

function drawRambla(
  scene: Phaser.Scene,
  g: Phaser.GameObjects.Graphics,
  p: WorldPoi,
  coastY: number,
): void {
  // Promenade full width of world, clamped — no stick-out past map edges
  const bandY = Math.min(p.y + 6, coastY - 20);
  const sand = scene.add
    .tileSprite(WORLD_SIZE / 2, bandY, WORLD_SIZE, 72, 'tex-sand')
    .setDepth(2.8);
  sand.setTint(0xfff0d8);

  g.fillStyle(0xd4c0a0, 0.85);
  g.fillRect(0, bandY - 28, WORLD_SIZE, 10);
  g.fillStyle(0xcfc4b0, 0.95);
  g.fillRect(0, bandY - 8, WORLD_SIZE, 18);
  g.fillStyle(0x8a9098, 0.75);
  g.fillRect(0, bandY + 18, WORLD_SIZE, 4);

  for (let x = 40; x < WORLD_SIZE - 40; x += 72) {
    g.fillStyle(0x3a3a3a, 0.9);
    g.fillRect(x, bandY - 34, 3, 20);
    g.fillStyle(0xf4c430, 0.4);
    g.fillCircle(x + 1.5, bandY - 36, 5);
  }
  for (let x = 80; x < WORLD_SIZE - 80; x += 110) {
    g.fillStyle(0x6b5344, 0.85);
    g.fillRect(x, bandY + 2, 30, 6);
  }
  for (const ox of [-160, -40, 90, 200]) {
    const x = Phaser.Math.Clamp(p.x + ox, 40, WORLD_SIZE - 40);
    g.fillStyle(0x5a4030, 0.9);
    g.fillRect(x, bandY - 52, 5, 28);
    g.fillStyle(0x3a6b40, 0.85);
    g.fillEllipse(x + 2, bandY - 55, 26, 14);
  }
}

/** Faro: rock + tower only — ocean already under the point. */
function drawFaro(g: Phaser.GameObjects.Graphics, p: WorldPoi, coastY: number): void {
  const baseY = Math.min(p.y + 20, coastY + 10);

  g.fillStyle(0xb8956a, 1);
  g.fillTriangle(p.x - 45, baseY + 40, p.x + 70, baseY - 20, p.x + 80, baseY + 55);
  g.fillStyle(0xa88858, 0.75);
  g.fillTriangle(p.x - 25, baseY + 25, p.x + 50, baseY - 5, p.x + 55, baseY + 40);

  g.fillStyle(0xf7f2e9, 1);
  g.fillRect(p.x - 12, p.y - 100, 24, 110);
  g.fillStyle(0xe07a5f, 1);
  g.fillRect(p.x - 12, p.y - 100, 24, 20);
  g.fillRect(p.x - 12, p.y - 55, 24, 14);
  g.fillRect(p.x - 12, p.y - 12, 24, 12);
  g.fillStyle(0xf4c430, 0.7);
  g.fillCircle(p.x, p.y - 110, 14);
  g.fillStyle(0xf4c430, 0.1);
  g.fillTriangle(p.x, p.y - 110, p.x + 120, p.y - 30, p.x + 120, p.y + 30);

  g.fillStyle(0xe8d5b5, 0.95);
  g.fillRect(p.x - 65, p.y + 5, 38, 26);
  g.fillStyle(0xe07a5f, 0.85);
  g.fillTriangle(p.x - 68, p.y + 5, p.x - 46, p.y - 10, p.x - 24, p.y + 5);
}

function blocks(
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
      if (r === 2 && c >= 2 && c <= 3) continue;
      const x = ox + c * (bw + 6);
      const y = oy + r * (bh + 6);
      g.fillStyle(fill, 0.94);
      g.fillRect(x, y, bw, bh);
      g.lineStyle(1, stroke, 0.28);
      g.strokeRect(x, y, bw, bh);
      g.fillStyle(0xf7f2e9, 0.14);
      g.fillRect(x + 2, y + 2, bw - 4, 3);
    }
  }
}

function tree(g: Phaser.GameObjects.Graphics, x: number, y: number, r: number): void {
  g.fillStyle(0x3a5c40, 0.92);
  g.fillCircle(x, y, r);
  g.fillStyle(0x2d4a32, 0.75);
  g.fillCircle(x - r * 0.25, y + r * 0.1, r * 0.65);
  g.fillStyle(0x5a4030, 1);
  g.fillRect(x - 3, y + r * 0.45, 6, r * 0.55);
}
