import type { AiChatPlayerContext, PlaceId } from '@conoceme/shared';
import { api, ApiClientError } from '../api/client';

/**
 * In-game companion chat (grounded stub via POST /ai/chat).
 * Collapsed FAB by default so it doesn't fight the place panel.
 */
export class CompanionPanel {
  private root: HTMLElement;
  private logEl: HTMLElement | null = null;
  private inputEl: HTMLInputElement | null = null;
  private open = false;
  private busy = false;
  private getPlayer: () => AiChatPlayerContext;

  constructor(
    host: HTMLElement,
    options: {
      getPlayer: () => AiChatPlayerContext;
    },
  ) {
    this.getPlayer = options.getPlayer;
    this.root = document.createElement('div');
    this.root.className = 'companion';
    this.root.innerHTML = `
      <button type="button" class="companion__fab" data-toggle aria-expanded="false" title="Compañero del portfolio">
        💬
      </button>
      <div class="companion__panel" hidden data-panel>
        <header class="companion__head">
          <div>
            <p class="companion__title">Compañero</p>
            <p class="companion__sub">Sobre Leandro y el mapa · grounded</p>
          </div>
          <button type="button" class="companion__close" data-close aria-label="Cerrar">×</button>
        </header>
        <div class="companion__log" data-log></div>
        <form class="companion__form" data-form>
          <input
            class="companion__input"
            data-input
            type="text"
            maxlength="500"
            placeholder="¿Qué estudiás? ¿Cómo te contacto?"
            autocomplete="off"
          />
          <button type="submit" class="companion__send">Enviar</button>
        </form>
      </div>
    `;
    host.append(this.root);

    this.logEl = this.root.querySelector('[data-log]');
    this.inputEl = this.root.querySelector('[data-input]');

    this.root.querySelector('[data-toggle]')?.addEventListener('click', () => this.setOpen(!this.open));
    this.root.querySelector('[data-close]')?.addEventListener('click', () => this.setOpen(false));
    this.root.querySelector('[data-form]')?.addEventListener('submit', (e) => {
      e.preventDefault();
      void this.send();
    });

    // Stop WASD from fighting chat focus
    this.root.addEventListener('keydown', (e) => e.stopPropagation());
    this.root.addEventListener('keyup', (e) => e.stopPropagation());

    this.pushBot(
      'Hola — soy el compañero del portfolio. Preguntame por experiencia, estudios, skills, contacto o el mapa (brújula, zonas).',
    );
  }

  destroy(): void {
    this.root.remove();
  }

  private setOpen(next: boolean): void {
    this.open = next;
    const panel = this.root.querySelector<HTMLElement>('[data-panel]');
    const fab = this.root.querySelector<HTMLButtonElement>('[data-toggle]');
    if (panel) panel.hidden = !next;
    fab?.setAttribute('aria-expanded', next ? 'true' : 'false');
    this.root.classList.toggle('is-open', next);
    if (next) this.inputEl?.focus();
  }

  private pushBot(text: string): void {
    this.pushMsg('bot', text);
  }

  private pushUser(text: string): void {
    this.pushMsg('user', text);
  }

  private pushMsg(role: 'bot' | 'user', text: string): void {
    if (!this.logEl) return;
    const row = document.createElement('div');
    row.className = `companion__msg companion__msg--${role}`;
    row.textContent = text;
    this.logEl.append(row);
    this.logEl.scrollTop = this.logEl.scrollHeight;
  }

  private async send(): Promise<void> {
    if (this.busy || !this.inputEl) return;
    const message = this.inputEl.value.trim();
    if (!message) return;
    this.inputEl.value = '';
    this.pushUser(message);
    this.busy = true;

    try {
      const player = this.getPlayer();
      const res = await api.aiChat({
        message,
        locale: 'es',
        player: {
          zoneId: (player.zoneId as PlaceId | null | undefined) ?? null,
          visitedPlaceIds: player.visitedPlaceIds,
        },
      });
      this.pushBot(res.reply);
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 401) {
        this.pushBot(
          'El compañero necesita una API key local (VITE_PORTFOLIO_API_KEY + PORTFOLIO_API_KEYS). Mirá .env.example.',
        );
      } else if (err instanceof ApiClientError && err.code === 'RATE_LIMIT') {
        this.pushBot(err.message);
      } else {
        this.pushBot(
          err instanceof Error
            ? `No pude responder: ${err.message}`
            : 'No pude responder ahora.',
        );
      }
    } finally {
      this.busy = false;
    }
  }
}
