import Phaser from 'phaser';
import { registerGameTextures } from '../art/registerTextures';
import type { WorldSceneData } from './WorldScene';

/** Boot: register canvas art, then enter World. */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create(): void {
    try {
      registerGameTextures(this);
      const data = this.registry.get('worldData') as WorldSceneData | undefined;
      if (!data?.places?.places) {
        throw new Error('No se recibieron los lugares del mapa (worldData).');
      }
      this.scene.start('World', data);
    } catch (err) {
      console.error('[BootScene]', err);
      const message = err instanceof Error ? err.message : String(err);
      this.cameras.main.setBackgroundColor('#0b1220');
      this.add
        .text(
          this.scale.width / 2,
          this.scale.height / 2,
          `No se pudo cargar el mundo\n${message}`,
          {
            fontFamily: 'DM Sans, system-ui, sans-serif',
            fontSize: '16px',
            color: '#ffb4a8',
            align: 'center',
            wordWrap: { width: Math.min(420, this.scale.width - 40) },
          },
        )
        .setOrigin(0.5);
    }
  }
}
