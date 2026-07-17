import type { PlacesIndexDto } from '@conoceme/shared';
import type { GameSession } from '../game/createGame';

let session: GameSession | null = null;

/** Lazy-loads Phaser so the cinematic shell stays light. */
export async function enterWorld(options: {
  places: PlacesIndexDto;
  onExitToShell: () => void;
}): Promise<void> {
  if (session) return;

  document.body.classList.add('mode-game');
  const root = document.getElementById('game-root');
  const hud = document.getElementById('game-hud');
  if (!root || !hud) throw new Error('game roots missing');

  root.hidden = false;
  hud.hidden = false;
  root.replaceChildren();
  hud.replaceChildren();

  const loading = document.createElement('p');
  loading.className = 'game-loading';
  loading.textContent = 'Cargando el mundo…';
  root.append(loading);

  const { createGame } = await import('../game/createGame');
  loading.remove();

  session = createGame({
    parent: root,
    hudHost: hud,
    places: options.places,
    onExit: () => {
      session = null;
      root.hidden = true;
      hud.hidden = true;
      root.replaceChildren();
      hud.replaceChildren();
      document.body.classList.remove('mode-game');
      options.onExitToShell();
    },
  });
}

export function isInWorld(): boolean {
  return session !== null;
}
