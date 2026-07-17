import Phaser from 'phaser';
import type { PlacesIndexDto } from '@conoceme/shared';
import { PlacePanel } from '../ui/placePanel';
import { BootScene } from './scenes/BootScene';
import { WorldScene, type WorldSceneData } from './scenes/WorldScene';

export interface GameSession {
  destroy: () => void;
}

export function createGame(options: {
  parent: HTMLElement;
  hudHost: HTMLElement;
  places: PlacesIndexDto;
  onExit: () => void | Promise<void>;
}): GameSession {
  const placePanel = new PlacePanel(options.hudHost);

  let gameRef: Phaser.Game;

  const data: WorldSceneData = {
    places: options.places,
    hudHost: options.hudHost,
    placePanel,
    onExit: () => {
      session.destroy();
      void options.onExit();
    },
  };

  gameRef = new Phaser.Game({
    type: Phaser.AUTO,
    parent: options.parent,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#0f3550',
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [BootScene, WorldScene],
    input: {
      activePointers: 3,
    },
    render: {
      antialias: true,
      pixelArt: false,
      roundPixels: true,
    },
    callbacks: {
      preBoot: (game) => {
        game.registry.set('worldData', data);
      },
    },
  });

  const onResize = () => {
    gameRef.scale.resize(window.innerWidth, window.innerHeight);
  };
  window.addEventListener('resize', onResize);

  const session: GameSession = {
    destroy: () => {
      window.removeEventListener('resize', onResize);
      placePanel.destroy();
      const world = gameRef.scene.getScene('World') as WorldScene;
      if (world?.sys?.settings?.active || world?.sys?.settings?.visible) {
        world.shutdown();
      }
      gameRef.destroy(true);
    },
  };

  return session;
}
