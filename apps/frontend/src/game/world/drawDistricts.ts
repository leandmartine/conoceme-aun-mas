import type { WorldPoi } from './mapLayout';

/** Dense props per place — each zone should feel “full”, not empty markers. */
export function drawDistricts(
  scene: Phaser.Scene,
  g: Phaser.GameObjects.Graphics,
  pois: WorldPoi[],
): void {
  const byId = Object.fromEntries(pois.map((p) => [p.id, p])) as Partial<
    Record<WorldPoi['id'], WorldPoi>
  >;

  if (byId.campo) drawCampo(scene, g, byId.campo);
  if (byId.universidad) drawUniversidad(scene, g, byId.universidad);
  if (byId['ciudad-vieja']) drawCiudadVieja(scene, g, byId['ciudad-vieja']);
  if (byId.skyline) drawSkylineDistrict(scene, g, byId.skyline);
  if (byId.puerto) drawPuerto(scene, g, byId.puerto);
  if (byId.rambla) drawRambla(scene, g, byId.rambla);
  if (byId.faro) drawFaro(scene, g, byId.faro);
}

function drawCampo(scene: Phaser.Scene, g: Phaser.GameObjects.Graphics, p: WorldPoi): void {
  const lawn = scene.add.tileSprite(p.x, p.y, 340, 280, 'tex-grass').setDepth(0.55);
  lawn.setTint(0xb5dc9e);
  g.fillStyle(0x5d8f4e, 0.12);
  g.fillEllipse(p.x, p.y, 340, 280);

  // fence posts
  g.lineStyle(2, 0x6b5344, 0.55);
  g.strokeEllipse(p.x, p.y, 300, 240);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const fx = p.x + Math.cos(a) * 150;
    const fy = p.y + Math.sin(a) * 120;
    g.fillStyle(0x6b5344, 0.85);
    g.fillRect(fx - 2, fy - 8, 4, 14);
  }

  // ombú cluster
  tree(g, p.x - 70, p.y - 40, 36);
  tree(g, p.x + 55, p.y - 20, 28);
  tree(g, p.x + 10, p.y + 50, 22);
  tree(g, p.x - 40, p.y + 35, 18);

  // rural shed
  g.fillStyle(0xc4a574, 0.95);
  g.fillRect(p.x + 70, p.y + 20, 48, 32);
  g.fillStyle(0x8b5a2b, 0.9);
  g.fillTriangle(p.x + 66, p.y + 20, p.x + 94, p.y + 4, p.x + 122, p.y + 20);
  // hay bales
  g.fillStyle(0xd4a84b, 0.85);
  g.fillCircle(p.x - 90, p.y + 55, 12);
  g.fillCircle(p.x - 70, p.y + 58, 10);
}

function drawUniversidad(scene: Phaser.Scene, g: Phaser.GameObjects.Graphics, p: WorldPoi): void {
  const lawn = scene.add.tileSprite(p.x, p.y, 260, 220, 'tex-grass').setDepth(0.55);
  lawn.setTint(0xa8d4a0);
  g.fillStyle(0x4a7c59, 0.2);
  g.fillRoundedRect(p.x - 130, p.y - 110, 260, 220, 16);

  // main hall U
  g.fillStyle(0xefe6d8, 0.98);
  g.fillRect(p.x - 70, p.y - 50, 140, 24);
  g.fillRect(p.x - 70, p.y - 50, 24, 90);
  g.fillRect(p.x + 46, p.y - 50, 24, 90);
  // columns
  g.fillStyle(0xd8cfc0, 1);
  for (let i = 0; i < 5; i++) {
    g.fillRect(p.x - 50 + i * 22, p.y - 40, 6, 20);
  }
  // patio + fountain
  g.fillStyle(0x7eb6d9, 0.45);
  g.fillCircle(p.x, p.y + 30, 22);
  g.fillStyle(0xf7f2e9, 0.7);
  g.fillCircle(p.x, p.y + 30, 8);
  // side buildings
  g.fillStyle(0xe0d6c8, 0.95);
  g.fillRect(p.x - 120, p.y + 10, 40, 55);
  g.fillRect(p.x + 80, p.y + 10, 40, 55);
  // bikes rack hint
  g.lineStyle(2, 0x3a3a3a, 0.5);
  for (let i = 0; i < 4; i++) {
    g.strokeCircle(p.x - 90 + i * 14, p.y + 80, 5);
  }
}

function drawCiudadVieja(scene: Phaser.Scene, g: Phaser.GameObjects.Graphics, p: WorldPoi): void {
  const cobble = scene.add.tileSprite(p.x, p.y, 320, 260, 'tex-cobble').setDepth(0.6);
  cobble.setTint(0xf2e4cc);
  g.fillStyle(0xc4a574, 0.15);
  g.fillRoundedRect(p.x - 160, p.y - 130, 320, 260, 14);

  // dense colonial blocks
  blocks(g, p.x - 140, p.y - 100, 6, 5, 28, 22, 0xb8956a, 0x8b6914);
  // plaza
  g.fillStyle(0xe8d5b5, 0.7);
  g.fillCircle(p.x, p.y + 15, 42);
  g.fillStyle(0xc4a574, 0.5);
  g.fillCircle(p.x, p.y + 15, 10); // monument base
  g.fillStyle(0x8b7355, 0.9);
  g.fillRect(p.x - 3, p.y - 20, 6, 30);
  // cafés / awnings
  g.fillStyle(0xe07a5f, 0.75);
  g.fillRect(p.x - 130, p.y + 70, 36, 8);
  g.fillStyle(0x1b4f72, 0.7);
  g.fillRect(p.x + 90, p.y + 70, 36, 8);
  // street lamps
  for (const [lx, ly] of [
    [-50, -30],
    [50, -30],
    [-50, 70],
    [50, 70],
  ] as const) {
    g.fillStyle(0x3a3a3a, 0.85);
    g.fillRect(p.x + lx, p.y + ly, 3, 18);
    g.fillStyle(0xf4c430, 0.4);
    g.fillCircle(p.x + lx + 1.5, p.y + ly, 5);
  }
}

function drawSkylineDistrict(scene: Phaser.Scene, g: Phaser.GameObjects.Graphics, p: WorldPoi): void {
  void scene;
  g.fillStyle(0x6a7d94, 0.55);
  g.fillRoundedRect(p.x - 140, p.y - 100, 280, 200, 12);
  // plaza concrete
  g.fillStyle(0x9aa3ae, 0.45);
  g.fillRect(p.x - 120, p.y + 40, 240, 40);

  const heights = [90, 140, 70, 160, 110, 130, 85, 120];
  let x = p.x - 115;
  for (let i = 0; i < heights.length; i++) {
    const h = heights[i]!;
    const w = 22 + (i % 3) * 5;
    g.fillStyle(0x3d4f66, 0.96);
    g.fillRect(x, p.y + 40 - h, w, h);
    g.fillStyle(0x7eb6d9, 0.3);
    for (let wy = p.y + 48 - h; wy < p.y + 32; wy += 10) {
      for (let wx = x + 4; wx < x + w - 3; wx += 7) {
        g.fillRect(wx, wy, 3, 4);
      }
    }
    // roof AC
    g.fillStyle(0x2a3544, 0.8);
    g.fillRect(x + 4, p.y + 40 - h - 6, 8, 6);
    x += w + 8;
  }
  // plaza trees
  tree(g, p.x - 90, p.y + 55, 14);
  tree(g, p.x + 90, p.y + 55, 14);
}

function drawPuerto(scene: Phaser.Scene, g: Phaser.GameObjects.Graphics, p: WorldPoi): void {
  // water basin (must sit on coastal water — caller draws river; deepen here)
  const water = scene.add.tileSprite(p.x - 20, p.y + 30, 300, 200, 'tex-water').setDepth(0.7);
  scene.tweens.add({
    targets: water,
    tilePositionX: 48,
    duration: 9000,
    repeat: -1,
    ease: 'Linear',
  });

  // quay
  g.fillStyle(0x6b6f76, 0.95);
  g.fillRect(p.x - 130, p.y - 40, 220, 36);
  g.fillStyle(0x5a4030, 0.9);
  for (let i = 0; i < 6; i++) {
    g.fillRect(p.x - 110 + i * 36, p.y - 10, 14, 70);
  }
  // cranes
  g.lineStyle(4, 0x2a2a2a, 0.85);
  g.lineBetween(p.x - 90, p.y - 10, p.x - 90, p.y - 95);
  g.lineBetween(p.x - 90, p.y - 95, p.x - 30, p.y - 70);
  g.lineBetween(p.x + 20, p.y - 10, p.x + 20, p.y - 100);
  g.lineBetween(p.x + 20, p.y - 100, p.x + 80, p.y - 75);
  // containers stacked
  const cols = [0xe07a5f, 0xf4c430, 0x1b4f72, 0x4a7c59, 0xc4a574];
  for (let i = 0; i < 5; i++) {
    g.fillStyle(cols[i]!, 0.92);
    g.fillRect(p.x - 100 + i * 32, p.y - 55, 28, 18);
    g.fillRect(p.x - 100 + i * 32, p.y - 74, 28, 18);
  }
  // warehouse
  g.fillStyle(0x8a9098, 0.95);
  g.fillRect(p.x + 70, p.y - 30, 70, 50);
  g.fillStyle(0x3a3a3a, 0.5);
  g.fillRect(p.x + 85, p.y - 10, 20, 28);
  // bollards
  g.fillStyle(0xf7f2e9, 0.8);
  for (let i = 0; i < 5; i++) {
    g.fillCircle(p.x - 100 + i * 40, p.y - 42, 4);
  }
}

function drawRambla(scene: Phaser.Scene, g: Phaser.GameObjects.Graphics, p: WorldPoi): void {
  // long promenade strip centered on rambla
  const sand = scene.add.tileSprite(p.x, p.y + 10, 900, 100, 'tex-sand').setDepth(0.95);
  sand.setTint(0xfff0d8);

  g.fillStyle(0xd4c0a0, 0.85);
  g.fillRect(p.x - 450, p.y - 25, 900, 12);
  g.fillStyle(0xcfc4b0, 0.95);
  g.fillRect(p.x - 450, p.y - 5, 900, 22);
  g.fillStyle(0x8a9098, 0.75);
  g.fillRect(p.x - 450, p.y + 28, 900, 5);

  // lamps + benches dense
  for (let x = p.x - 400; x < p.x + 400; x += 70) {
    g.fillStyle(0x3a3a3a, 0.9);
    g.fillRect(x, p.y - 32, 3, 22);
    g.fillStyle(0xf4c430, 0.45);
    g.fillCircle(x + 1.5, p.y - 34, 6);
  }
  for (let x = p.x - 360; x < p.x + 360; x += 100) {
    g.fillStyle(0x6b5344, 0.85);
    g.fillRect(x, p.y + 4, 32, 7);
    g.fillRect(x, p.y + 2, 4, 12);
    g.fillRect(x + 28, p.y + 2, 4, 12);
  }
  // palm-ish silhouettes
  for (const ox of [-180, -60, 80, 200]) {
    g.fillStyle(0x5a4030, 0.9);
    g.fillRect(p.x + ox, p.y - 55, 5, 30);
    g.fillStyle(0x3a6b40, 0.85);
    g.fillEllipse(p.x + ox + 2, p.y - 58, 28, 16);
  }
  // people dots (tiny life)
  g.fillStyle(0x2a3a4a, 0.7);
  for (let i = 0; i < 10; i++) {
    g.fillCircle(p.x - 200 + i * 42, p.y + 12 + (i % 3) * 3, 3);
  }
}

function drawFaro(scene: Phaser.Scene, g: Phaser.GameObjects.Graphics, p: WorldPoi): void {
  // rocky point into water
  const water = scene.add.tileSprite(p.x + 40, p.y + 50, 220, 160, 'tex-water').setDepth(0.7);
  scene.tweens.add({
    targets: water,
    tilePositionX: -40,
    duration: 11000,
    repeat: -1,
    ease: 'Linear',
  });

  g.fillStyle(0xb8956a, 1);
  g.fillTriangle(p.x - 50, p.y + 70, p.x + 90, p.y + 10, p.x + 100, p.y + 90);
  g.fillStyle(0xa88858, 0.7);
  g.fillTriangle(p.x - 30, p.y + 50, p.x + 60, p.y + 20, p.x + 70, p.y + 70);

  // lighthouse tower detailed
  g.fillStyle(0xf7f2e9, 1);
  g.fillRect(p.x - 14, p.y - 110, 28, 120);
  g.fillStyle(0xe07a5f, 1);
  g.fillRect(p.x - 14, p.y - 110, 28, 22);
  g.fillRect(p.x - 14, p.y - 60, 28, 16);
  g.fillRect(p.x - 14, p.y - 10, 28, 12);
  g.fillStyle(0xf4c430, 0.7);
  g.fillCircle(p.x, p.y - 120, 16);
  g.fillStyle(0xf4c430, 0.12);
  g.fillTriangle(p.x, p.y - 120, p.x + 160, p.y - 40, p.x + 160, p.y + 40);

  // keeper house
  g.fillStyle(0xe8d5b5, 0.95);
  g.fillRect(p.x - 70, p.y + 10, 40, 28);
  g.fillStyle(0xe07a5f, 0.85);
  g.fillTriangle(p.x - 74, p.y + 10, p.x - 50, p.y - 8, p.x - 26, p.y + 10);
  // path stones to tower
  g.fillStyle(0xd4c0a0, 0.8);
  for (let i = 0; i < 6; i++) {
    g.fillCircle(p.x - 25 + i * 6, p.y + 45 - i * 8, 4);
  }
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
      if (r === 2 && c >= 2 && c <= 3) continue; // plaza hole
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
