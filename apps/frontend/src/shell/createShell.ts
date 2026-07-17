import type { PlacesIndexDto, ProfileDto } from '@conoceme/shared';
import { el, link } from './dom';
import { bindShellMotion, type MotionHandle } from './motion';
import { uruguayBackdropSvg } from './uruguaySilhouette';

export interface ShellModel {
  profile: ProfileDto | null;
  places: PlacesIndexDto | null;
  error: string | null;
  apiOk: boolean;
}

let motion: MotionHandle | null = null;

export function createShell(root: HTMLElement, model: ShellModel): void {
  motion?.destroy();
  motion = null;
  root.replaceChildren();

  const shell = el('div', { className: 'shell' });
  const grain = el('div', { className: 'shell__grain', ariaHidden: 'true' });

  // ——— STAGE / INTRO ———
  const stage = el('section', { className: 'shell__stage' });
  const stageBg = el('div', { className: 'shell__stage-bg', ariaHidden: 'true' });
  stageBg.innerHTML = uruguayBackdropSvg();

  const hero = el('div', { className: 'shell__hero' });
  const kicker = el('p', {
    className: 'shell__kicker',
    text: 'Montevideo · Uruguay',
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

  const status = el('p', {
    className: model.apiOk
      ? 'shell__status shell__status--ok'
      : 'shell__status shell__status--err',
    text: model.error
      ? `API: ${model.error}`
      : model.apiOk
        ? 'Mundo online · datos desde la API'
        : 'API offline',
  });
  status.setAttribute('data-hero-line', '');

  const cta = el('button', {
    className: 'shell__cta',
    type: 'button',
    text: 'Explorar el mapa ↓',
  }) as HTMLButtonElement;
  cta.addEventListener('click', () => {
    document.getElementById('mapa')?.scrollIntoView({ behavior: 'smooth' });
  });

  const scrollHint = el('p', {
    className: 'shell__scroll-hint',
    text: 'Scroll para entrar',
  });

  hero.append(kicker, title, subtitle, status, cta, scrollHint);
  stage.append(stageBg, hero);

  // ——— CHAPTER: mood ———
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

  // ——— CHAPTER: places map ———
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
      placesGrid.append(card);
    }
  } else if (!model.error) {
    placesGrid.append(el('p', { text: 'Cargando lugares…' }));
  }
  mapChapter.append(placesGrid);

  if (model.places?.allUnlockedFromStart) {
    const hint = el('p', {
      className: 'shell__hint',
      text: 'Sin candados: la brújula del juego te va a mostrar la dirección; el recorrido lo elegís vos.',
    });
    hint.setAttribute('data-reveal', '');
    mapChapter.append(hint);
  }

  // ——— ABOUT ———
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
      const li = el('li', { className: 'shell__skill', text: skill });
      skills.append(li);
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

  // ——— FOOTER CTA ———
  const finale = el('section', { className: 'shell__finale' });
  finale.setAttribute('data-chapter', '');
  const finaleTitle = el('h2', {
    className: 'shell__finale-title',
    text: 'El mundo jugable llega en la próxima etapa',
  });
  finaleTitle.setAttribute('data-reveal', '');
  const finaleBody = el('p', {
    className: 'shell__chapter-body',
    text: 'Personaje top-down, minimapa brújula y zonas de Uruguay en Phaser. Esta intro ya es el portal.',
  });
  finaleBody.setAttribute('data-reveal', '');
  finale.append(finaleTitle, finaleBody);

  shell.append(grain, stage, mood, mapChapter, about, finale);
  root.append(shell);

  // Bind motion after paint
  requestAnimationFrame(() => {
    motion = bindShellMotion(shell);
  });
}
