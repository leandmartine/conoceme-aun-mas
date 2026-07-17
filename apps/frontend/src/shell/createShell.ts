import type { PlacesIndexDto, ProfileDto } from '@conoceme/shared';

export interface ShellModel {
  profile: ProfileDto | null;
  places: PlacesIndexDto | null;
  error: string | null;
  apiOk: boolean;
}

export function createShell(root: HTMLElement, model: ShellModel): void {
  root.replaceChildren();

  const shell = el('div', { className: 'shell' });
  const grain = el('div', { className: 'shell__grain', ariaHidden: 'true' });
  const glow = el('div', { className: 'shell__glow', ariaHidden: 'true' });

  const hero = el('section', { className: 'shell__hero' });
  const kicker = el('p', { className: 'shell__kicker', text: 'Montevideo · Uruguay' });
  const title = el('h1', { className: 'shell__title', text: 'conoceme aun mas' });
  const subtitle = el('p', {
    className: 'shell__subtitle',
    text: model.profile
      ? `${model.profile.name} — ${model.profile.headline}`
      : 'Portfolio jugable · cargando…',
  });

  const status = el('p', {
    className: model.apiOk ? 'shell__status shell__status--ok' : 'shell__status shell__status--err',
    text: model.error
      ? `API: ${model.error}`
      : model.apiOk
        ? 'API conectada · monorepo listo'
        : 'API offline',
  });

  const cta = el('button', {
    className: 'shell__cta',
    type: 'button',
    text: 'Entrar al mundo (próximamente)',
  }) as HTMLButtonElement;
  cta.disabled = true;
  cta.title = 'El mundo Phaser llega en la siguiente PR';

  hero.append(kicker, title, subtitle, status, cta);

  const panel = el('section', { className: 'shell__panel' });
  panel.append(
    el('h2', { className: 'shell__panel-title', text: 'Mapa del portfolio' }),
  );

  if (model.places) {
    const list = el('ul', { className: 'shell__places' });
    for (const place of model.places.places) {
      const item = el('li', { className: 'shell__place' });
      item.append(
        el('span', { className: 'shell__place-label', text: place.compassLabel }),
        el('span', {
          className: 'shell__place-title',
          text: `${place.title} — ${place.subtitle ?? place.chapter}`,
        }),
      );
      list.append(item);
    }
    panel.append(list);
    panel.append(
      el('p', {
        className: 'shell__hint',
        text: model.places.allUnlockedFromStart
          ? 'Todos los lugares están abiertos desde el inicio. La brújula te orienta; vos elegís el camino.'
          : '',
      }),
    );
  } else if (!model.error) {
    panel.append(el('p', { text: 'Cargando lugares…' }));
  }

  if (model.profile) {
    const about = el('section', { className: 'shell__about' });
    about.append(
      el('h2', { className: 'shell__panel-title', text: 'Quién soy' }),
      el('p', { className: 'shell__summary', text: model.profile.summary }),
      linksRow(model.profile),
    );
    shell.append(grain, glow, hero, panel, about);
  } else {
    shell.append(grain, glow, hero, panel);
  }

  root.append(shell);
}

function linksRow(profile: ProfileDto): HTMLElement {
  const row = el('div', { className: 'shell__links' });
  const { socials } = profile;
  if (socials.github) {
    row.append(link(socials.github, 'GitHub'));
  }
  if (socials.linkedin) {
    row.append(link(socials.linkedin, 'LinkedIn'));
  }
  if (socials.email) {
    row.append(link(`mailto:${socials.email}`, 'Email'));
  }
  return row;
}

function link(href: string, label: string): HTMLAnchorElement {
  const a = document.createElement('a');
  a.href = href;
  a.textContent = label;
  a.className = 'shell__link';
  a.target = href.startsWith('http') ? '_blank' : '_self';
  a.rel = href.startsWith('http') ? 'noopener noreferrer' : '';
  return a;
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  opts: {
    className?: string;
    text?: string;
    type?: string;
    ariaHidden?: string;
  } = {},
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (opts.className) node.className = opts.className;
  if (opts.text) node.textContent = opts.text;
  if (opts.type && node instanceof HTMLButtonElement) node.type = opts.type as 'button';
  if (opts.ariaHidden) node.setAttribute('aria-hidden', opts.ariaHidden);
  return node;
}
