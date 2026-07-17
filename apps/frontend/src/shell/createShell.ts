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

export function createShell(root: HTMLElement, model: ShellModel): void {
  motion?.destroy();
  motion = null;
  stopCanvas?.();
  stopCanvas = null;
  root.replaceChildren();

  const p = model.profile;
  const name = p?.name ?? 'Leandro Emanuel Martinez';
  const headline = p?.headline ?? 'Aspiring Software Developer · estudiante';
  const location = p?.location ?? 'Montevideo, Uruguay';
  const summary =
    p?.summary ??
    'Profesional con experiencia en banca y fintech, en transición hacia el desarrollo de software.';
  const canEnter = Boolean(model.apiOk && model.places && model.onEnterWorld);

  const shell = el('div', { className: 'shell' });
  const grain = el('div', { className: 'shell__grain', ariaHidden: 'true' });

  // ——— HERO ———
  const stage = el('section', { className: 'shell__stage' });
  const stageBg = el('div', { className: 'shell__stage-bg', ariaHidden: 'true' });
  const stageGlow = el('div', { className: 'shell__stage-glow', ariaHidden: 'true' });
  const stageOrb = el('div', { className: 'shell__stage-orb', ariaHidden: 'true' });

  const hero = el('div', { className: 'shell__hero' });
  const kicker = el('p', {
    className: 'shell__kicker',
    text: `${location} · portfolio jugable`,
  });
  kicker.setAttribute('data-hero-line', '');

  const title = el('h1', { className: 'shell__title' });
  title.setAttribute('data-hero-line', '');
  title.innerHTML =
    '<span class="shell__title-line">conoceme</span><span class="shell__title-line shell__title-line--accent">aún más</span>';

  const nameLine = el('p', {
    className: 'shell__name',
    text: name,
  });
  nameLine.setAttribute('data-hero-line', '');

  const subtitle = el('p', {
    className: 'shell__subtitle',
    text: headline,
  });
  subtitle.setAttribute('data-hero-line', '');

  const ctaRow = el('div', { className: 'shell__cta-row' });
  const ctaPlay = el('button', {
    className: 'shell__cta',
    type: 'button',
    text: 'Entrar al mundo',
  }) as HTMLButtonElement;
  ctaPlay.disabled = !canEnter;
  ctaPlay.addEventListener('click', () => model.onEnterWorld?.());

  const ctaStory = el('button', {
    className: 'shell__cta shell__cta--ghost',
    type: 'button',
    text: 'Leer mi historia ↓',
  }) as HTMLButtonElement;
  ctaStory.addEventListener('click', () => {
    document.getElementById('historia')?.scrollIntoView({ behavior: 'smooth' });
  });
  ctaRow.append(ctaPlay, ctaStory);

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
    text: 'Deslizá · la historia se abre con vos',
  });

  hero.append(kicker, title, nameLine, subtitle, ctaRow, apiStatus, scrollHint);
  stage.append(stageBg, stageGlow, stageOrb, hero);

  // ——— STORY STRIP (horizontal pin) ———
  const story = el('section', { className: 'shell__story', id: 'historia' });
  story.innerHTML = `
    <div class="shell__story-pin" data-story-pin>
      <div class="shell__story-track" data-story-track>
        <article class="shell__story-panel shell__story-panel--intro">
          <p class="shell__eyebrow">Capítulo 01</p>
          <h2>No vine a pegar un PDF</h2>
          <p>${escapeHtml(summary)}</p>
        </article>
        <article class="shell__story-panel shell__story-panel--fintech">
          <p class="shell__eyebrow">Capítulo 02 · Fintech</p>
          <h2>Primero el negocio, después el código</h2>
          <p>Trabajé en contextos de <strong>banca y fintech</strong>, incluido <strong>Mercado Libre</strong> como <strong>FP ATO FINTECH REP</strong>: escala, operaciones y la disciplina de no romper lo que mueve plata.</p>
          <ul class="shell__story-tags">
            <li>Mercado Libre</li>
            <li>Fintech</li>
            <li>Operaciones</li>
            <li>Datos</li>
          </ul>
        </article>
        <article class="shell__story-panel shell__story-panel--code">
          <p class="shell__eyebrow">Capítulo 03 · Software</p>
          <h2>Transición con oficio</h2>
          <p>Hoy construyo con <strong>C#</strong>, <strong>ASP.NET MVC</strong>, <strong>SQL</strong>, análisis de datos y web. Estudiante en <strong>Universidad ORT Uruguay</strong>. Quiero laburo junior o trainee donde pueda crecer haciendo productos reales.</p>
          <ul class="shell__story-tags">
            <li>C#</li>
            <li>ASP.NET MVC</li>
            <li>SQL</li>
            <li>TypeScript</li>
            <li>APIs REST</li>
          </ul>
        </article>
        <article class="shell__story-panel shell__story-panel--world">
          <p class="shell__eyebrow">Capítulo 04 · Este proyecto</p>
          <h2>Un Uruguay para conocerme</h2>
          <p>Este portfolio es un <strong>juego top-down</strong>: Rambla, Ciudad Vieja, Puerto, Faro. Cada lugar es un capítulo de mi historia. Código público en GitHub para quien quiera chusmear cómo está hecho.</p>
          <p class="shell__story-cta-inline">Cuando termines de scrollear… entrá al mundo.</p>
        </article>
      </div>
      <div class="shell__story-progress" aria-hidden="true"><span data-story-bar></span></div>
    </div>
  `;

  // ——— PORTRAIT / IDENTITY ———
  const identity = el('section', { className: 'shell__identity', id: 'yo' });
  identity.setAttribute('data-chapter', '');
  identity.innerHTML = `
    <div class="shell__identity-grid">
      <div class="shell__portrait" data-reveal>
        <div class="shell__portrait-frame">
          <div class="shell__portrait-silhouette" aria-hidden="true"></div>
          <p class="shell__portrait-caption">Personaje del juego · inspirado en mí</p>
        </div>
      </div>
      <div class="shell__identity-copy">
        <p class="shell__eyebrow" data-reveal>Quién soy</p>
        <h2 class="shell__chapter-title" data-reveal>${escapeHtml(name)}</h2>
        <p class="shell__chapter-body" data-reveal>${escapeHtml(summary)}</p>
        <p class="shell__identity-meta" data-reveal>${escapeHtml(location)} · ${escapeHtml(headline)}</p>
      </div>
    </div>
  `;

  // ——— TIMELINE ———
  const path = el('section', { className: 'shell__path', id: 'camino' });
  path.setAttribute('data-chapter', '');
  const pathInner = el('div', { className: 'shell__path-inner' });
  pathInner.append(
    el('p', { className: 'shell__eyebrow', text: 'El camino' }),
    el('h2', { className: 'shell__chapter-title', text: 'De fintech a software' }),
  );
  pathInner.querySelectorAll('p, h2').forEach((n) => n.setAttribute('data-reveal', ''));

  const timeline = el('ol', { className: 'shell__timeline' });
  const steps = [
    {
      t: 'Banca y fintech',
      d: 'Operaciones, procesos y datos en industria financiera. Aprendí el peso de un sistema que no puede fallar.',
    },
    {
      t: 'Mercado Libre',
      d: 'FP ATO FINTECH REP. Escala real, ritmo de producto y entorno fintech de alto tráfico.',
    },
    {
      t: 'Universidad ORT Uruguay',
      d: 'Estudiante enfocado en software e IT. Aplicar teoría a problemas de negocio y producto.',
    },
    {
      t: 'Desarrollo de software',
      d: 'C#, ASP.NET MVC, SQL, web y APIs. Construyendo este portfolio-juego y buscando el próximo laburo junior.',
    },
  ];
  for (const step of steps) {
    const li = el('li', { className: 'shell__timeline-item' });
    li.setAttribute('data-card', '');
    li.append(
      el('h3', { className: 'shell__timeline-title', text: step.t }),
      el('p', { className: 'shell__timeline-body', text: step.d }),
    );
    timeline.append(li);
  }
  pathInner.append(timeline);
  path.append(pathInner);

  // ——— SKILLS ———
  const skillsSec = el('section', { className: 'shell__skills-sec', id: 'stack' });
  skillsSec.setAttribute('data-chapter', '');
  skillsSec.append(
    el('p', { className: 'shell__eyebrow', text: 'Stack y foco' }),
    el('h2', { className: 'shell__chapter-title', text: 'Con qué construyo' }),
  );
  skillsSec.querySelectorAll('p, h2').forEach((n) => n.setAttribute('data-reveal', ''));
  const skills = el('ul', { className: 'shell__skills shell__skills--big' });
  skills.setAttribute('data-reveal', '');
  const skillList = p?.skills?.length
    ? p.skills
    : ['C#', 'ASP.NET MVC', 'SQL', 'Análisis de datos', 'Web', 'TypeScript'];
  for (const skill of skillList) {
    skills.append(el('li', { className: 'shell__skill', text: skill }));
  }
  skillsSec.append(skills);

  // ——— MAP PLACES ———
  const mapChapter = el('section', {
    className: 'shell__chapter shell__chapter--map',
    id: 'mapa',
  });
  mapChapter.setAttribute('data-chapter', '');
  mapChapter.append(
    el('p', { className: 'shell__eyebrow', text: 'El mapa' }),
    el('h2', {
      className: 'shell__chapter-title',
      text: 'Siete lugares. Toda mi historia.',
    }),
    el('p', {
      className: 'shell__chapter-body',
      text: 'En el juego cada zona de un Uruguay estilizado abre un capítulo. Todo desbloqueado: vos elegís el orden.',
    }),
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
  }
  mapChapter.append(placesGrid);

  // ——— CONTACT ———
  const contact = el('section', { className: 'shell__finale', id: 'contacto' });
  contact.setAttribute('data-chapter', '');
  const finaleTitle = el('h2', {
    className: 'shell__finale-title',
    text: 'Mandá señal desde el Faro',
  });
  finaleTitle.setAttribute('data-reveal', '');
  const finaleBody = el('p', {
    className: 'shell__chapter-body',
    text: 'Oportunidades junior o trainee, feedback del portfolio-juego, o un simple “vi el faro”. Montevideo, Uruguay.',
  });
  finaleBody.setAttribute('data-reveal', '');

  const links = el('div', { className: 'shell__links shell__links--center' });
  links.setAttribute('data-reveal', '');
  const socials = p?.socials;
  if (socials?.github) links.append(link(socials.github, 'GitHub'));
  if (socials?.linkedin) links.append(link(socials.linkedin, 'LinkedIn'));
  if (socials?.email) links.append(link(`mailto:${socials.email}`, 'Email'));
  else links.append(link('mailto:leandromartinez38@gmail.com', 'Email'));

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

  contact.append(finaleTitle, finaleBody, links, finaleCta, finaleStatus);

  shell.append(grain, stage, story, identity, path, skillsSec, mapChapter, contact);
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
