import type { PlaceDetailDto, PlaceId } from '@conoceme/shared';
import { api } from '../api/client';

const CHAPTER_ACCENT: Record<string, string> = {
  about: '#2a6f97',
  experience: '#c4a574',
  projects: '#5b7c99',
  education: '#4a7c59',
  github: '#1b4f72',
  values: '#5d8f4e',
  contact: '#e07a5f',
};

export class PlacePanel {
  private root: HTMLElement;
  private card: HTMLElement;
  private scrollEl: HTMLElement;
  private body: HTMLElement;
  private titleEl: HTMLElement;
  private eyebrowEl: HTMLElement;
  private metaEl: HTMLElement;
  private linksEl: HTMLElement;
  private open = false;
  private onKey: ((e: KeyboardEvent) => void) | null = null;
  private onWheel: ((e: WheelEvent) => void) | null = null;
  private onTouchMove: ((e: TouchEvent) => void) | null = null;

  constructor(host: HTMLElement) {
    this.root = document.createElement('aside');
    this.root.className = 'place-panel';
    this.root.hidden = true;
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.innerHTML = `
      <div class="place-panel__card" data-card>
        <div class="place-panel__accent" data-accent aria-hidden="true"></div>
        <header class="place-panel__head">
          <button type="button" class="place-panel__close" aria-label="Cerrar">×</button>
          <p class="place-panel__eyebrow" data-eyebrow></p>
          <h2 class="place-panel__title" data-title></h2>
          <p class="place-panel__meta" data-meta></p>
        </header>
        <div class="place-panel__scroll" data-scroll>
          <div class="place-panel__body" data-body></div>
          <div class="place-panel__links" data-links></div>
          <p class="place-panel__hint">Esc o × para cerrar · scrolleá para leer todo</p>
        </div>
      </div>
    `;
    host.append(this.root);
    this.card = this.root.querySelector('[data-card]') as HTMLElement;
    this.scrollEl = this.root.querySelector('[data-scroll]') as HTMLElement;
    this.body = this.root.querySelector('[data-body]') as HTMLElement;
    this.titleEl = this.root.querySelector('[data-title]') as HTMLElement;
    this.eyebrowEl = this.root.querySelector('[data-eyebrow]') as HTMLElement;
    this.metaEl = this.root.querySelector('[data-meta]') as HTMLElement;
    this.linksEl = this.root.querySelector('[data-links]') as HTMLElement;

    this.root.querySelector('.place-panel__close')?.addEventListener('click', () => this.hide());
    this.root.addEventListener('click', (e) => {
      if (e.target === this.root) this.hide();
    });

    // Keep wheel/touch scroll on the panel; Phaser often steals the wheel otherwise
    this.onWheel = (e: WheelEvent) => {
      e.stopPropagation();
    };
    this.onTouchMove = (e: TouchEvent) => {
      e.stopPropagation();
    };
    this.card.addEventListener('wheel', this.onWheel, { passive: true });
    this.scrollEl.addEventListener('wheel', this.onWheel, { passive: true });
    this.scrollEl.addEventListener('touchmove', this.onTouchMove, { passive: true });
  }

  get isOpen(): boolean {
    return this.open;
  }

  async showPlace(id: PlaceId): Promise<void> {
    this.root.hidden = false;
    this.open = true;
    this.root.classList.remove('place-panel--out');
    this.root.classList.add('place-panel--in');
    this.bindKeys();
    this.scrollEl.scrollTop = 0;

    this.eyebrowEl.textContent = 'Lugar del mapa';
    this.titleEl.textContent = 'Cargando…';
    this.metaEl.textContent = '';
    this.body.innerHTML = '<p class="place-panel__loading">Traemos el capítulo…</p>';
    this.linksEl.replaceChildren();

    try {
      const detail = await api.place(id);
      this.render(detail);
      // After content paints, ensure scrollable area is focused for keyboard users
      requestAnimationFrame(() => {
        this.scrollEl.scrollTop = 0;
      });
    } catch {
      this.titleEl.textContent = 'No se pudo cargar';
      this.body.innerHTML = '<p>Reintentá en un momento. ¿Backend en :8787?</p>';
    }
  }

  hide(): void {
    if (!this.open) return;
    this.root.classList.remove('place-panel--in');
    this.root.classList.add('place-panel--out');
    window.setTimeout(() => {
      this.open = false;
      this.root.hidden = true;
      this.root.classList.remove('place-panel--out');
      this.unbindKeys();
    }, 220);
  }

  destroy(): void {
    this.unbindKeys();
    if (this.onWheel) {
      this.card.removeEventListener('wheel', this.onWheel);
      this.scrollEl.removeEventListener('wheel', this.onWheel);
    }
    if (this.onTouchMove) {
      this.scrollEl.removeEventListener('touchmove', this.onTouchMove);
    }
    this.root.remove();
  }

  private bindKeys(): void {
    this.unbindKeys();
    this.onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') this.hide();
    };
    window.addEventListener('keydown', this.onKey);
  }

  private unbindKeys(): void {
    if (this.onKey) window.removeEventListener('keydown', this.onKey);
    this.onKey = null;
  }

  private render(detail: PlaceDetailDto): void {
    const accent = CHAPTER_ACCENT[detail.chapter] ?? '#7eb6d9';
    const accentEl = this.root.querySelector('[data-accent]') as HTMLElement;
    accentEl.style.background = accent;
    this.card.style.setProperty('--place-accent', accent);

    this.eyebrowEl.textContent = 'Capítulo del portfolio';
    this.titleEl.textContent = detail.title;
    this.metaEl.textContent = detail.subtitle
      ? `${detail.title} — ${detail.subtitle}`
      : detail.chapter;

    this.body.innerHTML = simpleMarkdown(detail.bodyMarkdown);
    this.linksEl.replaceChildren();

    if (detail.links.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'place-panel__links-empty';
      empty.textContent = 'Sin links extra en este lugar.';
      this.linksEl.append(empty);
      return;
    }

    for (const l of detail.links) {
      const a = document.createElement('a');
      a.href = l.href;
      a.textContent = l.label;
      a.className = `place-panel__link place-panel__link--${l.kind}`;
      if (l.href.startsWith('http')) {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      }
      this.linksEl.append(a);
    }
  }
}

function simpleMarkdown(md: string): string {
  const escaped = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const withLinks = escaped.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)]+|mailto:[^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
  );
  const withBold = withLinks.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  const withLists = withBold.replace(
    /(?:^|\n)- (.+)(?=\n|$)/g,
    (_m, item: string) => `\n<li>${item}</li>`,
  );
  return withLists
    .split(/\n{2,}/)
    .map((block) => {
      const clean = block.replace(/^#+\s*/gm, '').trim();
      if (clean.includes('<li>')) {
        return `<ul class="place-panel__list">${clean.replace(/\n/g, '')}</ul>`;
      }
      return `<p>${clean.replace(/\n/g, '<br/>')}</p>`;
    })
    .join('');
}
