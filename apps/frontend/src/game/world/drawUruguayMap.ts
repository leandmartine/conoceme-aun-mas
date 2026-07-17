import Phaser from 'phaser';
import { WORLD_SIZE, type WorldPoi } from './mapLayout';
import { drawDistricts } from './drawDistricts';
import { drawWindingRoads } from './drawRoads';

/**
 * Compact coastal Uruguay:
 * south = Río + Rambla · west bay = Puerto · east point = Faro
 * center = ciudad · north = campus + campo (not water).
 */
export function drawUruguayMap(scene: Phaser.Scene, pois: WorldPoi[]): void {
  const W = WORLD_SIZE;
  const H = WORLD_SIZE;
  const byId = Object.fromEntries(pois.map((p) => [p.id, p])) as Partial<
    Record<WorldPoi['id'], WorldPoi>
  >;

  const rambla = byId.rambla;
  const puerto = byId.puerto;
  const faro = byId.faro;
  const ciudad = byId['ciudad-vieja'];
  const skyline = byId.skyline;

  // —— Land base (inland green, not full-map water chaos) ——
  const grass = scene.add.tileSprite(W / 2, H / 2, W, H, 'tex-grass').setDepth(0);
  grass.setTint(0xc5ddb8);

  const g = scene.add.graphics().setDepth(1);

  // Soft northern “horizon” haze
  g.fillStyle(0x9ec4dc, 0.12);
  g.fillRect(0, 0, W, H * 0.22);

  // Urban land plate under city cluster
  if (ciudad && skyline) {
    const midX = (ciudad.x + skyline.x) / 2;
    const midY = (ciudad.y + skyline.y) / 2;
    g.fillStyle(0x8b919a, 0.35);
    g.fillRoundedRect(midX - 260, midY - 150, 520, 300, 28);
  }

  // —— Río de la Plata (south continuous coast) ——
  const waterTop = rambla ? rambla.y + 36 : H * 0.72;
  const river = scene.add
    .tileSprite(W / 2, waterTop + (H - waterTop) / 2, W, H - waterTop + 40, 'tex-water')
    .setDepth(0.4);
  scene.tweens.add({
    targets: river,
    tilePositionX: 100,
    duration: 16000,
    repeat: -1,
    ease: 'Linear',
  });
  // darker offshore
  g.fillStyle(0x0f3550, 0.25);
  g.fillRect(0, waterTop + 80, W, H - waterTop);

  // West bay bite for Puerto (water must connect to river)
  if (puerto) {
    g.fillStyle(0x1b4f72, 0.55);
    g.fillEllipse(puerto.x - 10, Math.max(puerto.y, waterTop - 10), 280, 200);
  }

  // East cove for Faro
  if (faro) {
    g.fillStyle(0x1b4f72, 0.5);
    g.fillEllipse(faro.x + 30, Math.max(faro.y + 20, waterTop - 5), 240, 180);
  }

  // —— Roads first (under buildings slightly / with districts) ——
  // draw roads at depth via graphics before heavy props
  drawWindingRoads(g, pois);

  // —— Dense districts ——
  drawDistricts(scene, g, pois);

  // Soft zone rings (subtle)
  for (const poi of pois) {
    g.lineStyle(2, poi.color, 0.28);
    g.strokeCircle(poi.x, poi.y, 72);
  }

  // Edge vignette
  g.lineStyle(70, 0x1a3040, 0.1);
  g.strokeRect(40, 40, W - 80, H - 80);
}
