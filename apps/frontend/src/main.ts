import './styles/global.css';
import './styles/shell.css';
import { api } from './api/client';
import { createShell } from './shell/createShell';

async function boot(): Promise<void> {
  const root = document.querySelector<HTMLElement>('#app');
  if (!root) throw new Error('#app missing');

  createShell(root, {
    profile: null,
    places: null,
    error: null,
    apiOk: false,
  });

  try {
    await api.health();
    const [profile, places] = await Promise.all([api.profile(), api.places()]);
    createShell(root, {
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
    createShell(root, {
      profile: null,
      places: null,
      error: message,
      apiOk: false,
    });
  }
}

void boot();
