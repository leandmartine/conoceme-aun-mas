import type { PlaceDetailDto } from '@conoceme/shared';
import { api } from '../api/client';
import type { PlaceId } from '@conoceme/shared';

export class PlacePanel {
  private root: HTMLElement;
  private body: HTMLElement;
  private titleEl: HTMLElement;
  private open = false;

  constructor(host: HTMLElement) {
    this.root = document.createElement('aside');
    this.root.className = 'place-panel';
    this.root.hidden = true;
    this.root.innerHTML = `
      <div class="place-panel__card">
        <button type="button" class="place-panel__close" aria-label="Cerrar">×</button>
        <p class="place-panel__eyebrow" data-eyebrow></p>
        <h2 class="place-panel__title" data-title></h2>
        <div class="place-panel__body" data-body></div>
        <div class="place-panel__links" data-links></div>
      </div>
    `;
    host.append(this.root);
    this.body = this.root.querySelector('[data-body]') as HTMLElement;
    this.titleEl = this.root.querySelector('[data-title]') as HTMLElement;
    this.root.querySelector('.place-panel__close')?.addEventListener('click', () => this.hide());
    this.root.addEventListener('click', (e) => {
      if (e.target === this.root) this.hide();
    });
  }

  get isOpen(): boolean {
    return this.open;
  }

  async showPlace(id: PlaceId): Promise<void> {
    this.root.hidden = false;
    this.open = true;
    this.titleEl.textContent = 'Cargando…';
    this.body.textContent = '';
    try {
      const detail = await api.place(id);
      this.render(detail);
    } catch {
      this.titleEl.textContent = 'No se pudo cargar';
      this.body.textContent = 'Reintentá en un momento.';
    }
  }

  hide(): void {
    this.open = false;
    this.root.hidden = true;
  }

  destroy(): void {
    this.root.remove();
  }

  private render(detail: PlaceDetailDto): void {
    const eyebrow = this.root.querySelector('[data-eyebrow]') as HTMLElement;
    eyebrow.textContent = detail.subtitle ?? detail.chapter;
    this.titleEl.textContent = detail.title;
    this.body.innerHTML = simpleMarkdown(detail.bodyMarkdown);
    const links = this.root.querySelector('[data-links]') as HTMLElement;
    links.replaceChildren();
    for (const l of detail.links) {
      const a = document.createElement('a');
      a.href = l.href;
      a.textContent = l.label;
      a.className = 'place-panel__link';
      if (l.href.startsWith('http')) {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      }
      links.append(a);
    }
  }
}

/** Tiny safe-ish markdown: bold + links + paragraphs. */
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
  return withBold
    .split(/\n{2,}/)
    .map((p) => `<p>${p.replace(/^#+\s*/gm, '').replace(/\n/g, '<br/>')}</p>`)
    .join('');
}
