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

  // Ensure parent is visible and has size before Phaser boots
  options.parent.hidden = false;
  options.parent.style.display = 'block';

  gameRef = new Phaser.Game({
    type: Phaser.AUTO,
    parent: options.parent,
    width: Math.max(window.innerWidth, 320),
    height: Math.max(window.innerHeight, 320),
    backgroundColor: '#4f7a58',
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
      width: Math.max(window.innerWidth, 320),
      height: Math.max(window.innerHeight, 320),
    },
    scene: [BootScene, WorldScene],
    input: {
      activePointers: 3,
      keyboard: true,
    },
    render: {
      antialias: true,
      pixelArt: false,
      roundPixels: true,
      transparent: false,
      clearBeforeRender: true,
    },
    callbacks: {
      preBoot: (game) => {
        game.registry.set('worldData', data);
      },
    },
  });

  // Nudge a resize after layout (fixes black canvas on some browsers)
  requestAnimationFrame(() => {
    try {
      gameRef.scale.resize(window.innerWidth, window.innerHeight);
    } catch {
      /* ignore */
    }
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
