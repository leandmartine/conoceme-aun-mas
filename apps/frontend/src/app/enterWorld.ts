import type { PlacesIndexDto } from '@conoceme/shared';
import { gameAudio } from '../audio/gameAudio';
import type { GameSession } from '../game/createGame';
import { runHandoff } from '../ui/handoff';

let session: GameSession | null = null;

/** Lazy-loads Phaser so the cinematic shell stays light. */
export async function enterWorld(options: {
  places: PlacesIndexDto;
  onExitToShell: () => void;
}): Promise<void> {
  if (session) return;

  gameAudio.loadPreference();
  await gameAudio.unlock();
  gameAudio.tick();

  await runHandoff('to-game');

  document.body.classList.add('mode-game');
  const root = document.getElementById('game-root');
  const hud = document.getElementById('game-hud');
  if (!root || !hud) throw new Error('game roots missing');

  root.hidden = false;
  hud.hidden = false;
  root.replaceChildren();
  hud.replaceChildren();

  const loading = document.createElement('div');
  loading.className = 'game-loading';
  loading.innerHTML = `
    <p class="game-loading__title">Cargando el mundo</p>
    <p class="game-loading__sub">Rambla, ciudad, campo…</p>
  `;
  root.append(loading);

  const { createGame } = await import('../game/createGame');
  loading.remove();

  session = createGame({
    parent: root,
    hudHost: hud,
    places: options.places,
    onExit: async () => {
      gameAudio.tick();
      session = null;
      await runHandoff('to-shell');
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
