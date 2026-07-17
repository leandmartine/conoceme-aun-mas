import Phaser from 'phaser';
import type { PlaceId, PlacesIndexDto } from '@conoceme/shared';
import { CompanionPanel } from '../ui/companionPanel';
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
  if (!options.places?.places?.length) {
    throw new Error('No hay lugares para armar el mapa');
  }

  const placePanel = new PlacePanel(options.hudHost);
  const playerCtx: { zoneId: PlaceId | null; visitedPlaceIds: PlaceId[] } = {
    zoneId: options.places.spawnPlaceId ?? 'rambla',
    visitedPlaceIds: [],
  };
  const companion = new CompanionPanel(options.hudHost, {
    getPlayer: () => ({
      zoneId: playerCtx.zoneId,
      visitedPlaceIds: [...playerCtx.visitedPlaceIds],
    }),
  });
  let destroyed = false;
  let gameRef: Phaser.Game;

  const data: WorldSceneData = {
    places: options.places,
    hudHost: options.hudHost,
    placePanel,
    playerCtx,
    onExit: () => {
      // Single teardown path: destroy game, then notify host
      session.destroy();
      void options.onExit();
    },
  };

  options.parent.hidden = false;
  options.parent.style.display = 'block';
  options.parent.style.visibility = 'visible';

  const w = Math.max(window.innerWidth, 320);
  const h = Math.max(window.innerHeight, 320);

  gameRef = new Phaser.Game({
    type: Phaser.AUTO,
    parent: options.parent,
    width: w,
    height: h,
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
      width: w,
      height: h,
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

  const onResize = () => {
    if (destroyed) return;
    gameRef.scale.resize(window.innerWidth, window.innerHeight);
  };
  window.addEventListener('resize', onResize);

  requestAnimationFrame(() => {
    if (!destroyed) onResize();
  });

  const session: GameSession = {
    destroy: () => {
      if (destroyed) return;
      destroyed = true;
      window.removeEventListener('resize', onResize);
      try {
        placePanel.destroy();
      } catch {
        /* ignore */
      }
      try {
        companion.destroy();
      } catch {
        /* ignore */
      }
      try {
        const world = gameRef.scene.getScene('World') as WorldScene | undefined;
        world?.shutdown?.();
      } catch {
        /* ignore */
      }
      try {
        gameRef.destroy(true);
      } catch {
        /* ignore */
      }
    },
  };

  return session;
}
