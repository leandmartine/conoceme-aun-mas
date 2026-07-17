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
  if (session) {
    // Avoid stuck black session from a previous failed boot
    try {
      session.destroy();
    } catch {
      /* ignore */
    }
    session = null;
  }

  gameAudio.loadPreference();
  await gameAudio.unlock();
  gameAudio.tick();

  // Clear any stuck handoff overlays from a prior run
  document.querySelectorAll('.handoff').forEach((n) => n.remove());

  await runHandoff('to-game');
  document.querySelectorAll('.handoff').forEach((n) => n.remove());

  document.body.classList.add('mode-game');
  const root = document.getElementById('game-root');
  const hud = document.getElementById('game-hud');
  if (!root || !hud) throw new Error('game roots missing');

  root.hidden = false;
  hud.hidden = false;
  root.style.display = 'block';
  root.style.visibility = 'visible';
  root.replaceChildren();
  hud.replaceChildren();

  const loading = document.createElement('div');
  loading.className = 'game-loading';
  loading.innerHTML = `
    <p class="game-loading__title">Cargando el mundo</p>
    <p class="game-loading__sub">Rambla, ciudad, campo…</p>
  `;
  root.append(loading);

  try {
    const { createGame } = await import('../game/createGame');
    loading.remove();

    session = createGame({
      parent: root,
      hudHost: hud,
      places: options.places,
      onExit: async () => {
        gameAudio.tick();
        const current = session;
        session = null;
        try {
          current?.destroy();
        } catch {
          /* ignore */
        }
        document.querySelectorAll('.handoff').forEach((n) => n.remove());
        await runHandoff('to-shell');
        document.querySelectorAll('.handoff').forEach((n) => n.remove());
        root.hidden = true;
        hud.hidden = true;
        root.replaceChildren();
        hud.replaceChildren();
        document.body.classList.remove('mode-game');
        options.onExitToShell();
      },
    });
  } catch (err) {
    console.error('[enterWorld]', err);
    loading.innerHTML = `
      <p class="game-loading__title">No se pudo abrir el mundo</p>
      <p class="game-loading__sub">${err instanceof Error ? err.message : 'Error desconocido'}</p>
    `;
    session = null;
  }
}

export function isInWorld(): boolean {
  return session !== null;
}
