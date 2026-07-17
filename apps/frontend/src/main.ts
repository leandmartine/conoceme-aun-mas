import './styles/global.css';
import './styles/shell.css';
import './styles/game.css';
import type { PlacesIndexDto, ProfileDto } from '@conoceme/shared';
import { api } from './api/client';
import { enterWorld } from './app/enterWorld';
import { createShell } from './shell/createShell';

let cachedPlaces: PlacesIndexDto | null = null;
let cachedProfile: ProfileDto | null = null;

function ensureGameRoots(): void {
  if (!document.getElementById('game-root')) {
    const gameRoot = document.createElement('div');
    gameRoot.id = 'game-root';
    gameRoot.hidden = true;
    document.body.append(gameRoot);
  }
  if (!document.getElementById('game-hud')) {
    const hud = document.createElement('div');
    hud.id = 'game-hud';
    hud.hidden = true;
    document.body.append(hud);
  }
}

function showShell(opts: {
  profile: ProfileDto | null;
  places: PlacesIndexDto | null;
  error: string | null;
  apiOk: boolean;
}): void {
  const root = document.querySelector<HTMLElement>('#app');
  if (!root) throw new Error('#app missing');

  createShell(root, {
    ...opts,
    onEnterWorld: () => {
      if (!cachedPlaces) return;
      root.hidden = true;
      void enterWorld({
        places: cachedPlaces,
        onExitToShell: () => {
          root.hidden = false;
          showShell({
            profile: cachedProfile,
            places: cachedPlaces,
            error: null,
            apiOk: true,
          });
          window.scrollTo(0, 0);
        },
      });
    },
  });
}

async function boot(): Promise<void> {
  ensureGameRoots();
  showShell({
    profile: null,
    places: null,
    error: null,
    apiOk: false,
  });

  try {
    await api.health();
    const [profile, places] = await Promise.all([api.profile(), api.places()]);
    cachedProfile = profile;
    cachedPlaces = places;
    showShell({
      profile,
      places,
      error: null,
      apiOk: true,
    });
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : 'No se pudo hablar con el backend. ¿Está corriendo en :8787?';
    showShell({
      profile: null,
      places: null,
      error: message,
      apiOk: false,
    });
  }
}

void boot();
