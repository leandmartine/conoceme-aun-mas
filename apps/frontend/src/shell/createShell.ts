import type { PlacesIndexDto, ProfileDto } from '@conoceme/shared';
import { el, link } from './dom';
import { mountLoopCanvas } from './loopCanvas';
import { bindShellMotion, type MotionHandle } from './motion';

export interface ShellModel {
  profile: ProfileDto | null;
  places: PlacesIndexDto | null;
  error: string | null;
  apiOk: boolean;
  onEnterWorld?: () => void;
}

let motion: MotionHandle | null = null;
let stopCanvas: (() => void) | null = null;

const REELS = [
  {
    id: 'walk',
    title: 'Caminá Uruguay',
    body: 'Top-down real: Rambla, ciudad, puerto y faro en un solo mapa.',
    loopClass: 'reel--walk',
  },
  {
    id: 'compass',
    title: 'Brújula viva',
    body: 'Marcá rumbo a experiencia, estudios, GitHub o contacto.',
    loopClass: 'reel--compass',
  },
  {
    id: 'chapters',
    title: 'Capítulos del portfolio',
    body: 'Cada lugar es un capítulo. Todo desbloqueado desde el inicio.',
    loopClass: 'reel--chapters',
  },
] as const;

export function createShell(root: HTMLElement, model: ShellModel): void {
  motion?.destroy();
  motion = null;
  stopCanvas?.();
  stopCanvas = null;
  root.replaceChildren();

  const shell = el('div', { className: 'shell' });
  const grain = el('div', { className: 'shell__grain', ariaHidden: 'true' });

  // ——— HERO STAGE ———
  const stage = el('section', { className: 'shell__stage' });
  const stageBg = el('div', { className: 'shell__stage-bg', ariaHidden: 'true' });
  const stageGlow = el('div', { className: 'shell__stage-glow', ariaHidden: 'true' });
  const stageOrb = el('div', { className: 'shell__stage-orb', ariaHidden: 'true' });

  const hero = el('div', { className: 'shell__hero' });
  const kicker = el('p', {
    className: 'shell__kicker',
    text: 'Montevideo · Uruguay · Portfolio jugable',
  });
  kicker.setAttribute('data-hero-line', '');

  const title = el('h1', { className: 'shell__title' });
  title.setAttribute('data-hero-line', '');
  title.innerHTML =
    '<span class="shell__title-line">conoceme</span><span class="shell__title-line shell__title-line--accent">aun mas</span>';

  const subtitle = el('p', {
    className: 'shell__subtitle',
    text: model.profile
      ? `${model.profile.name} — ${model.profile.headline}`
      : 'Portfolio jugable · cargando…',
  });
  subtitle.setAttribute('data-hero-line', '');

  const ctaRow = el('div', { className: 'shell__cta-row' });
  const ctaPlay = el('button', {
    className: 'shell__cta',
    type: 'button',
    text: 'Entrar al mundo',
  }) as HTMLButtonElement;
  const canEnter = Boolean(model.apiOk && model.places && model.onEnterWorld);
  ctaPlay.disabled = !canEnter;
  ctaPlay.addEventListener('click', () => model.onEnterWorld?.());

  const ctaMap = el('button', {
    className: 'shell__cta shell__cta--ghost',
    type: 'button',
    text: 'Ver lugares ↓',
  }) as HTMLButtonElement;
  ctaMap.addEventListener('click', () => {
    document.getElementById('mapa')?.scrollIntoView({ behavior: 'smooth' });
  });
  ctaRow.append(ctaPlay, ctaMap);

  // API status BELOW buttons only
  const apiStatus = el('p', {
    className: model.apiOk
      ? 'shell__api-status shell__api-status--ok'
      : 'shell__api-status shell__api-status--err',
  });
  apiStatus.innerHTML = model.apiOk
    ? '<span class="shell__api-dot" aria-hidden="true"></span> Online — mundo listo'
    : `<span class="shell__api-dot" aria-hidden="true"></span> Offline — ${model.error ? escapeHtml(model.error) : 'sin conexión a la API'}`;

  const scrollHint = el('p', {
    className: 'shell__scroll-hint',
    text: 'Scroll · la historia se mueve con vos',
  });

  hero.append(kicker, title, subtitle, ctaRow, apiStatus, scrollHint);
  stage.append(stageBg, stageGlow, stageOrb, hero);

  // ——— Feature cards (visual motion, no “loop” framing) ———
  const reels = el('section', { className: 'shell__reels', id: 'experiencia' });
  reels.setAttribute('data-chapter', '');
  reels.append(
    el('p', { className: 'shell__eyebrow', text: 'La experiencia' }),
    el('h2', {
      className: 'shell__chapter-title',
      text: 'Más que un portfolio en lista',
    }),
  );
  reels.querySelectorAll('p, h2').forEach((n) => n.setAttribute('data-reveal', ''));

  const reelsGrid = el('div', { className: 'shell__reels-grid' });
  for (const reel of REELS) {
    const card = el('article', { className: `shell__reel ${reel.loopClass}` });
    card.setAttribute('data-card', '');
    card.tabIndex = 0;

    const screen = el('div', { className: 'shell__reel-screen', ariaHidden: 'true' });
    screen.innerHTML = `
      <div class="shell__reel-loop">
        <div class="shell__reel-layer shell__reel-layer--a"></div>
        <div class="shell__reel-layer shell__reel-layer--b"></div>
        <div class="shell__reel-layer shell__reel-layer--c"></div>
        <div class="shell__reel-scan"></div>
      </div>
    `;

    const copy = el('div', { className: 'shell__reel-copy' });
    copy.append(
      el('h3', { className: 'shell__reel-title', text: reel.title }),
      el('p', { className: 'shell__reel-body', text: reel.body }),
    );

    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty('--rx', `${(-py * 8).toFixed(2)}deg`);
      card.style.setProperty('--ry', `${(px * 10).toFixed(2)}deg`);
      card.style.setProperty('--gx', `${(px + 0.5) * 100}%`);
      card.style.setProperty('--gy', `${(py + 0.5) * 100}%`);
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });

    card.append(screen, copy);
    reelsGrid.append(card);
  }
  reels.append(reelsGrid);

  // ——— Mood chapter ———
  const mood = el('section', { className: 'shell__chapter shell__chapter--mood' });
  mood.setAttribute('data-chapter', '');
  mood.append(
    el('p', {
      className: 'shell__eyebrow',
      text: 'Un país. Un portfolio. Un juego.',
    }),
    el('h2', {
      className: 'shell__chapter-title',
      text: 'Uruguay como mapa de mi historia',
    }),
    el('p', {
      className: 'shell__chapter-body',
      text: 'No es un CV en HTML. Es un mundo top-down donde cada lugar —Rambla, Ciudad Vieja, Puerto, Faro— abre un capítulo: quién soy, experiencia, estudios, código y cómo contactarme. Todo desbloqueado. Vos elegís el camino.',
    }),
  );
  mood.querySelectorAll('p, h2').forEach((n) => n.setAttribute('data-reveal', ''));

  // ——— Places ———
  const mapChapter = el('section', {
    className: 'shell__chapter shell__chapter--map',
    id: 'mapa',
  });
  mapChapter.setAttribute('data-chapter', '');
  mapChapter.append(
    el('p', { className: 'shell__eyebrow', text: 'Brújula del portfolio' }),
    el('h2', { className: 'shell__chapter-title', text: 'Lugares del mapa' }),
  );
  mapChapter.querySelectorAll('p, h2').forEach((n) => n.setAttribute('data-reveal', ''));

  const placesGrid = el('div', { className: 'shell__places-grid' });
  if (model.places) {
    for (const place of model.places.places) {
      const card = el('article', { className: 'shell__place-card' });
      card.setAttribute('data-card', '');
      card.append(
        el('span', { className: 'shell__place-compass', text: place.compassLabel }),
        el('h3', { className: 'shell__place-name', text: place.title }),
        el('p', {
          className: 'shell__place-meta',
          text: place.subtitle ?? place.chapter,
        }),
      );
      if (canEnter) {
        card.classList.add('shell__place-card--playable');
        card.addEventListener('click', () => model.onEnterWorld?.());
        card.title = 'Entrar al mundo';
      }
      placesGrid.append(card);
    }
  } else if (!model.error) {
    placesGrid.append(el('p', { text: 'Cargando lugares…' }));
  }
  mapChapter.append(placesGrid);

  if (model.places?.allUnlockedFromStart) {
    const hint = el('p', {
      className: 'shell__hint',
      text: 'Sin candados: la brújula te orienta; el recorrido lo elegís vos.',
    });
    hint.setAttribute('data-reveal', '');
    mapChapter.append(hint);
  }

  // ——— About ———
  const about = el('section', { className: 'shell__chapter shell__chapter--about' });
  about.setAttribute('data-chapter', '');
  about.append(
    el('p', { className: 'shell__eyebrow', text: 'Quién soy' }),
    el('h2', {
      className: 'shell__chapter-title',
      text: model.profile?.name ?? 'Leandro Emanuel Martinez',
    }),
  );
  about.querySelectorAll('p, h2').forEach((n) => n.setAttribute('data-reveal', ''));

  if (model.profile) {
    const summary = el('p', {
      className: 'shell__chapter-body',
      text: model.profile.summary,
    });
    summary.setAttribute('data-reveal', '');
    about.append(summary);

    const skills = el('ul', { className: 'shell__skills' });
    skills.setAttribute('data-reveal', '');
    for (const skill of model.profile.skills) {
      skills.append(el('li', { className: 'shell__skill', text: skill }));
    }
    about.append(skills);

    const row = el('div', { className: 'shell__links' });
    row.setAttribute('data-reveal', '');
    const { socials } = model.profile;
    if (socials.github) row.append(link(socials.github, 'GitHub'));
    if (socials.linkedin) row.append(link(socials.linkedin, 'LinkedIn'));
    if (socials.email) row.append(link(`mailto:${socials.email}`, 'Email'));
    about.append(row);
  }

  // ——— Finale ———
  const finale = el('section', { className: 'shell__finale' });
  finale.setAttribute('data-chapter', '');
  const finaleTitle = el('h2', {
    className: 'shell__finale-title',
    text: 'Listo para caminar Uruguay',
  });
  finaleTitle.setAttribute('data-reveal', '');
  const finaleBody = el('p', {
    className: 'shell__chapter-body',
    text: 'Personaje top-down, brújula y lugares del portfolio. Entrá al mundo y elegí tu camino.',
  });
  finaleBody.setAttribute('data-reveal', '');
  const finaleCta = el('button', {
    className: 'shell__cta',
    type: 'button',
    text: 'Entrar al mundo',
  }) as HTMLButtonElement;
  finaleCta.disabled = !canEnter;
  finaleCta.setAttribute('data-reveal', '');
  finaleCta.addEventListener('click', () => model.onEnterWorld?.());

  const finaleStatus = el('p', {
    className: model.apiOk
      ? 'shell__api-status shell__api-status--ok shell__api-status--center'
      : 'shell__api-status shell__api-status--err shell__api-status--center',
  });
  finaleStatus.innerHTML = model.apiOk
    ? '<span class="shell__api-dot" aria-hidden="true"></span> Online'
    : '<span class="shell__api-dot" aria-hidden="true"></span> Offline';

  finale.append(finaleTitle, finaleBody, finaleCta, finaleStatus);

  shell.append(grain, stage, reels, mood, mapChapter, about, finale);
  root.append(shell);

  requestAnimationFrame(() => {
    stopCanvas = mountLoopCanvas(stageBg);
    motion = bindShellMotion(shell);
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
