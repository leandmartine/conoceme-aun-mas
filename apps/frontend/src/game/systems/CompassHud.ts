import type { PlaceId } from '@conoceme/shared';
import type { WorldPoi } from '../world/mapLayout';

export interface CompassState {
  playerX: number;
  playerY: number;
  pois: WorldPoi[];
  focusedId: PlaceId | null;
}

/**
 * DOM compass minimap — player-centered bearings to every place.
 */
export class CompassHud {
  private root: HTMLElement;
  private disc: HTMLElement;
  private markers = new Map<string, HTMLElement>();
  private bearingEl: HTMLElement;
  private labelEl: HTMLElement;
  private focusedId: PlaceId | null = null;
  private onFocus: ((id: PlaceId | null) => void) | null = null;
  private lastUpdate = 0;

  constructor(host: HTMLElement) {
    this.root = document.createElement('div');
    this.root.className = 'compass';
    this.root.innerHTML = `
      <div class="compass__ring" aria-hidden="true"></div>
      <div class="compass__disc" data-disc>
        <span class="compass__n">N</span>
        <span class="compass__player" title="Vos"></span>
      </div>
      <div class="compass__bearing" data-bearing></div>
      <p class="compass__label" data-label>Tocá un punto para marcar rumbo</p>
    `;
    host.append(this.root);
    this.disc = this.root.querySelector('[data-disc]') as HTMLElement;
    this.bearingEl = this.root.querySelector('[data-bearing]') as HTMLElement;
    this.labelEl = this.root.querySelector('[data-label]') as HTMLElement;
  }

  setFocusHandler(handler: (id: PlaceId | null) => void): void {
    this.onFocus = handler;
  }

  setPois(pois: WorldPoi[]): void {
    this.markers.forEach((m) => m.remove());
    this.markers.clear();
    for (const poi of pois) {
      const m = document.createElement('button');
      m.type = 'button';
      m.className = 'compass__marker';
      m.dataset.id = poi.id;
      m.textContent = poi.compassLabel.slice(0, 4);
      m.title = `${poi.title} — ${poi.subtitle}`;
      m.addEventListener('click', () => {
        this.focusedId = this.focusedId === poi.id ? null : poi.id;
        this.onFocus?.(this.focusedId);
        this.markers.forEach((el, id) => {
          el.classList.toggle('compass__marker--focus', id === this.focusedId);
        });
        this.labelEl.textContent = this.focusedId
          ? `Rumbo: ${poi.title} — ${poi.subtitle}`
          : 'Tocá un punto para marcar rumbo';
      });
      this.disc.append(m);
      this.markers.set(poi.id, m);
    }
  }

  update(state: CompassState, now = performance.now()): void {
    // ~12 Hz
    if (now - this.lastUpdate < 80) return;
    this.lastUpdate = now;

    const radius = 58;
    for (const poi of state.pois) {
      const el = this.markers.get(poi.id);
      if (!el) continue;
      const dx = poi.x - state.playerX;
      const dy = poi.y - state.playerY;
      const dist = Math.hypot(dx, dy) || 1;
      // Map distance to ring (closer = closer to center, min edge)
      const t = Math.min(1, dist / 900);
      const r = 18 + t * (radius - 18);
      const ang = Math.atan2(dy, dx);
      const mx = Math.cos(ang) * r;
      const my = Math.sin(ang) * r;
      el.style.transform = `translate(calc(-50% + ${mx}px), calc(-50% + ${my}px))`;
      el.style.opacity = String(0.55 + (1 - t) * 0.45);
    }

    if (state.focusedId) {
      const target = state.pois.find((p) => p.id === state.focusedId);
      if (target) {
        const ang = Math.atan2(target.y - state.playerY, target.x - state.playerX);
        this.bearingEl.style.opacity = '1';
        this.bearingEl.style.transform = `translate(-50%, -100%) rotate(${(ang * 180) / Math.PI + 90}deg)`;
      }
    } else {
      this.bearingEl.style.opacity = '0';
    }
  }

  destroy(): void {
    this.root.remove();
  }
}
