import Phaser from 'phaser';
import type { PlaceId } from '@conoceme/shared';
import {
  makeCobbleTexture,
  makeGrassTexture,
  makeLandmarkIcon,
  makePlayerSheet,
  makePoiTexture,
  makeRoadTexture,
  makeSandTexture,
  makeShadowTexture,
  makeWaterTexture,
} from './canvasTextures';

const LANDMARK_KINDS: PlaceId[] = [
  'rambla',
  'ciudad-vieja',
  'skyline',
  'universidad',
  'puerto',
  'campo',
  'faro',
];

export function registerGameTextures(scene: Phaser.Scene): void {
  add(scene, 'tex-grass', makeGrassTexture(128));
  add(scene, 'tex-sand', makeSandTexture(128));
  add(scene, 'tex-water', makeWaterTexture(128));
  add(scene, 'tex-cobble', makeCobbleTexture(128));
  add(scene, 'tex-road', makeRoadTexture(64));
  add(scene, 'shadow', makeShadowTexture());
  add(scene, 'poi', makePoiTexture());

  for (const id of LANDMARK_KINDS) {
    add(scene, `icon-${id}`, makeLandmarkIcon(id));
  }

  const sheet = makePlayerSheet();
  if (scene.textures.exists('player')) scene.textures.remove('player');
  scene.textures.addCanvas('player', sheet.canvas);
  const tex = scene.textures.get('player');
  let frameIndex = 0;
  for (let row = 0; row < sheet.rows; row++) {
    for (let col = 0; col < sheet.cols; col++) {
      tex.add(
        frameIndex,
        0,
        col * sheet.frameW,
        row * sheet.frameH,
        sheet.frameW,
        sheet.frameH,
      );
      frameIndex += 1;
    }
  }

  // Animations
  const mk = (key: string, row: number) => {
    if (scene.anims.exists(key)) scene.anims.remove(key);
    scene.anims.create({
      key,
      frames: scene.anims.generateFrameNumbers('player', {
        start: row * 4,
        end: row * 4 + 3,
      }),
      frameRate: 8,
      repeat: -1,
    });
  };
  mk('walk-down', 0);
  mk('walk-up', 1);
  mk('walk-left', 2);
  mk('walk-right', 3);

  const idle = (key: string, frame: number) => {
    if (scene.anims.exists(key)) scene.anims.remove(key);
    scene.anims.create({
      key,
      frames: [{ key: 'player', frame }],
      frameRate: 1,
    });
  };
  idle('idle-down', 0);
  idle('idle-up', 4);
  idle('idle-left', 8);
  idle('idle-right', 12);
}

function add(scene: Phaser.Scene, key: string, canvas: HTMLCanvasElement): void {
  if (scene.textures.exists(key)) scene.textures.remove(key);
  scene.textures.addCanvas(key, canvas);
}
