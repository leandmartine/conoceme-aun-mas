import type { PlacesIndexDto } from '@conoceme/shared';
import { gameAudio } from '../audio/gameAudio';
import type { GameSession } from '../game/createGame';
import { runHandoff } from '../ui/handoff';

let session: GameSession | null = null;
let exiting = false;

function clearHandoffs(): void {
  document.querySelectorAll('.handoff').forEach((n) => n.remove());
}

/** Fully hide game layers so they never cover the landing (green #game-root). */
export function hideGameLayers(): void {
  for (const id of ['game-root', 'game-hud'] as const) {
    const el = document.getElementById(id);
    if (!el) continue;
    el.hidden = true;
    el.setAttribute('aria-hidden', 'true');
    el.replaceChildren();
    // Clear inline styles Phaser/createGame may have set (beat residual green overlay)
    el.style.display = 'none';
    el.style.visibility = 'hidden';
    el.style.pointerEvents = 'none';
    el.style.opacity = '0';
  }
  document.body.classList.remove('mode-game');
  document.documentElement.classList.remove('mode-game');
}

function showGameLayers(root: HTMLElement, hud: HTMLElement): void {
  for (const el of [root, hud]) {
    el.hidden = false;
    el.removeAttribute('aria-hidden');
    el.style.display = 'block';
    el.style.visibility = 'visible';
    el.style.pointerEvents = '';
    el.style.opacity = '1';
  }
  root.style.pointerEvents = 'auto';
  hud.style.pointerEvents = 'none'; // children re-enable
}

/** Lazy-loads Phaser so the cinematic shell stays light. */
export async function enterWorld(options: {
  places: PlacesIndexDto;
  onExitToShell: () => void;
}): Promise<void> {
  if (!options.places?.places?.length) {
    console.error('[enterWorld] places vacíos');
    return;
  }
  if (exiting) return;

  // Tear down any previous session completely
  if (session) {
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

  clearHandoffs();
  await runHandoff('to-game');
  clearHandoffs();

  document.body.classList.add('mode-game');
  document.documentElement.classList.add('mode-game');
  const root = document.getElementById('game-root');
  const hud = document.getElementById('game-hud');
  if (!root || !hud) throw new Error('game roots missing');

  root.replaceChildren();
  hud.replaceChildren();
  showGameLayers(root, hud);

  const loading = document.createElement('div');
  loading.className = 'game-loading';
  loading.innerHTML = `
    <img
      class="game-loading__portrait"
      src="/media/leandro.jpg"
      alt=""
      width="72"
      height="72"
      decoding="async"
    />
    <p class="game-loading__title">Cargando el mundo</p>
    <p class="game-loading__sub">Tu personaje entra a la Rambla…</p>
  `;
  root.append(loading);

  try {
    const { createGame } = await import('../game/createGame');
    loading.remove();

    // Host callback after Phaser session already destroyed by createGame.onExit
    const afterDestroy = async () => {
      if (exiting) return;
      exiting = true;
      session = null;
      try {
        // Hide green game layer *before* handoff ends so landing isn't covered
        hideGameLayers();
        clearHandoffs();
        await runHandoff('to-shell');
        clearHandoffs();
        hideGameLayers();
        options.onExitToShell();
      } finally {
        exiting = false;
      }
    };

    session = createGame({
      parent: root,
      hudHost: hud,
      places: options.places,
      onExit: () => {
        gameAudio.tick();
        void afterDestroy();
      },
    });
  } catch (err) {
    console.error('[enterWorld]', err);
    loading.innerHTML = `
      <p class="game-loading__title">No se pudo abrir el mundo</p>
      <p class="game-loading__sub">${err instanceof Error ? err.message : 'Error desconocido'}</p>
    `;
    session = null;
    hideGameLayers();
  }
}

export function isInWorld(): boolean {
  return session !== null;
}
