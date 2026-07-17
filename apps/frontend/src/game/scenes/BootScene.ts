import Phaser from 'phaser';
import { registerGameTextures } from '../art/registerTextures';
import type { WorldSceneData } from './WorldScene';

/** Boot: register canvas art, then enter World. */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create(): void {
    registerGameTextures(this);
    const data = this.registry.get('worldData') as WorldSceneData;
    this.scene.start('World', data);
  }
}
