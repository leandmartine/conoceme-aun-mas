import Phaser from 'phaser';
import { WORLD_SIZE, type WorldPoi } from './mapLayout';
import { drawDistricts } from './drawDistricts';
import { drawWindingRoads } from './drawRoads';

/**
 * Layer order (no overlapping water textures):
 * 0 land · 1 ocean (single sheet, clipped to world) · 2 roads · 3 districts
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

  // Coast line: just south of rambla promenade (clamped)
  const coastY = Phaser.Math.Clamp(
    rambla ? rambla.y + 48 : H * 0.72,
    H * 0.55,
    H - 80,
  );
  const waterH = H - coastY;

  // —— 0: Land (full world grass; ocean covers south) ——
  const grass = scene.add.tileSprite(W / 2, H / 2, W, H, 'tex-grass').setDepth(0);
  grass.setTint(0xc5ddb8);

  const land = scene.add.graphics().setDepth(0.2);
  land.fillStyle(0x9ec4dc, 0.1);
  land.fillRect(0, 0, W, H * 0.2);

  if (ciudad && skyline) {
    const midX = (ciudad.x + skyline.x) / 2;
    const midY = (ciudad.y + skyline.y) / 2;
    land.fillStyle(0x8b919a, 0.3);
    land.fillRoundedRect(midX - 260, midY - 150, 520, 300, 28);
  }

  // —— 1: ONE ocean tileSprite, exactly to world bottom (no overflow) ——
  const ocean = scene.add
    .tileSprite(W / 2, coastY + waterH / 2, W, waterH, 'tex-water')
    .setDepth(1)
    .setOrigin(0.5, 0.5);
  scene.tweens.add({
    targets: ocean,
    tilePositionX: 80,
    duration: 18000,
    repeat: -1,
    ease: 'Linear',
  });

  // Soft deeper water tint (same layer family, graphics only — no 2nd texture)
  const waterFx = scene.add.graphics().setDepth(1.1);
  waterFx.fillStyle(0x0a2a42, 0.22);
  waterFx.fillRect(0, coastY + waterH * 0.45, W, waterH * 0.55);
  // Shallow turquoise band near shore (Rambla-facing)
  waterFx.fillStyle(0x4a9bb8, 0.12);
  waterFx.fillRect(0, coastY, W, Math.min(48, waterH * 0.22));
  // Sun path glitter on water (SE-ish)
  waterFx.fillStyle(0xf4c430, 0.06);
  waterFx.fillEllipse(W * 0.62, coastY + waterH * 0.28, W * 0.35, waterH * 0.2);
  // Undulating foam line at coast
  waterFx.fillStyle(0xf7f2e9, 0.18);
  waterFx.fillRect(0, coastY, W, 5);
  waterFx.fillStyle(0xf7f2e9, 0.1);
  for (let x = 0; x < W; x += 48) {
    const mid = x + 24;
    const dip = 4 + ((x / 48) % 3) * 2;
    waterFx.fillEllipse(mid, coastY + dip, 36, 8);
  }
  waterFx.fillStyle(0xffffff, 0.06);
  for (let x = 20; x < W; x += 70) {
    waterFx.fillEllipse(x, coastY + 14 + (x % 3) * 3, 22, 5);
  }

  // —— 2: Roads on land (above ocean so bridges/quays read, but drawn before props) ——
  const roads = scene.add.graphics().setDepth(2);
  drawWindingRoads(roads, pois);

  // —— 3: Districts (no extra water tileSprites) ——
  const props = scene.add.graphics().setDepth(3);
  drawDistricts(scene, props, pois, coastY);

  // —— 4: Soft zone rings only ——
  const rings = scene.add.graphics().setDepth(3.5);
  for (const poi of pois) {
    rings.lineStyle(2, poi.color, 0.22);
    rings.strokeCircle(poi.x, poi.y, 68);
  }

  // NO world-edge vignette (it looked like a “border in the wrong place”)
}
