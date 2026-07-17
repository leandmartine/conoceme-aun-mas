import Phaser from 'phaser';
import type { WorldSceneData } from './WorldScene';

/** Generates textures at runtime (no external art assets yet). */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create(): void {
    this.makePlayerTexture();
    this.makeShadowTexture();
    this.makePoiTexture();
    const data = this.registry.get('worldData') as WorldSceneData;
    this.scene.start('World', data);
  }

  private makePlayerTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 });

    // Body — tall / large presence
    g.fillStyle(0x2a3a4a, 1);
    g.fillRoundedRect(10, 28, 28, 34, 8);

    // Head — café con leche
    g.fillStyle(0xc4a484, 1);
    g.fillCircle(24, 18, 12);

    // Hair — black
    g.fillStyle(0x1a1a1a, 1);
    g.fillEllipse(24, 12, 24, 14);
    g.fillRect(12, 12, 24, 8);

    // Eyes — dark
    g.fillStyle(0x1a120c, 1);
    g.fillCircle(20, 19, 1.6);
    g.fillCircle(28, 19, 1.6);

    // Arms
    g.fillStyle(0xc4a484, 1);
    g.fillRoundedRect(4, 32, 8, 18, 3);
    g.fillRoundedRect(36, 32, 8, 18, 3);

    // Legs
    g.fillStyle(0x1e2a36, 1);
    g.fillRoundedRect(12, 58, 9, 16, 3);
    g.fillRoundedRect(27, 58, 9, 16, 3);

    g.generateTexture('player', 48, 76);
    g.destroy();
  }

  private makeShadowTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x000000, 0.28);
    g.fillEllipse(20, 10, 36, 14);
    g.generateTexture('shadow', 40, 20);
    g.destroy();
  }

  private makePoiTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0xf4c430, 0.25);
    g.fillCircle(24, 24, 22);
    g.lineStyle(3, 0xf4c430, 0.9);
    g.strokeCircle(24, 24, 16);
    g.fillStyle(0xf7f2e9, 1);
    g.fillCircle(24, 24, 5);
    g.generateTexture('poi', 48, 48);
    g.destroy();
  }
}
