# Design Document — conoceme-aun-mas

> Living design base. Every PR that changes direction **must** update this file.
> Last updated: 2026-07-17 · Status: Foundation (pre-code)

---

## 1. Vision

**conoceme-aun-mas** is not a portfolio website with a game bolted on.  
It is a **playable cinematic experience** that happens to reveal who Leandro is.

The first impression must feel like opening a carefully directed short film that becomes an interactive Uruguay: light, atmosphere, motion, and sound before any résumé bullet. When someone lands here, they should think: *“I’ve never seen a portfolio like this.”*

### One-liner

> Un mundo top-down de Uruguay, envuelto en una shell cinematográfica tipo Apple, donde caminás hasta cada capítulo de mi historia profesional.

### Emotional pillars

| Pillar | Feeling | How we deliver it |
|--------|---------|-------------------|
| **Cinematic** | Awe on first scroll | GSAP + Lenis intro, Apple-grade timing, no cheap transitions |
| **Playable** | Agency & curiosity | Real game loop: move, discover, interact |
| **Uruguay** | Pride & place | Landscape, light, icons, places — never tourist kitsch |
| **Craft** | “This person cares” | Detail density: particles, sound, micro-interactions, performance |
| **Human** | Warm, not corporate | Voice in copy, imperfect moments, humor allowed |

---

## 2. Product shape (three layers)

```
┌─────────────────────────────────────────────────────────┐
│  LAYER A — Cinematic Shell (DOM + GSAP + Lenis)         │
│  Title · scroll story · “Press start” · UI overlays     │
├─────────────────────────────────────────────────────────┤
│  LAYER B — Game World (Phaser 3, top-down)              │
│  Character · map · POIs · collisions · camera           │
├─────────────────────────────────────────────────────────┤
│  LAYER C — Content Graph (JSON / MD, progressive)       │
│  Experience · studies · GitHub · projects · contact     │
└─────────────────────────────────────────────────────────┘
```

- **Layer A** sells the first 10 seconds and frames the game.
- **Layer B** is the real product — a game, not a fake scroll-map.
- **Layer C** is data-driven so we can add bio content without rewiring systems.

---

## 3. Technology stack (locked)

### Core

| Area | Choice | Why |
|------|--------|-----|
| Bundler / app | **Vite + TypeScript** | Fast HMR, pure client game performance, no SSR tax on canvas |
| Game engine | **Phaser 3** | Production 2D engine, mobile + desktop, scenes, physics, input, cameras |
| Cinematic motion | **GSAP 3 + ScrollTrigger** | Industry standard for Apple-like timelines |
| Smooth scroll | **Lenis** | Buttery scroll only on the shell; disabled inside game |
| Styling (shell) | **CSS modules / vanilla CSS** with custom properties | Full control, no Tailwind “same as everyone” look unless we need utility islands |
| Content | **JSON + Markdown** in `/content` | Progressive loading of bio info |
| Deploy | **Vercel** (static) | Zero config for Vite, previews per PR |
| Repo workflow | **GitHub PRs only** → `main` | Pair workflow: Leandro + agent as peers |

### Explicit non-goals (for now)

- No React/Next for v1 game core (DOM shell can stay light; we can mount React later only for complex panels if needed).
- No Three.js / WebGL 3D world (hybrid 2D is enough to “romper los ojos” with craft; 3D dilutes focus and hurts mobile).
- No backend/auth in v1 (static content + public GitHub links).

### Libraries we will lean on hard

- **Phaser 3** — scenes, arcade physics or matter, tilemaps or free-form world layers, virtual joystick.
- **GSAP** — intro timeline, UI open/close, camera handoffs shell ↔ game.
- **howler.js** (planned) — ambient Uruguay + SFX with mobile unlock rules.
- **@fontsource** or self-hosted display fonts — typography as brand.

---

## 4. Visual direction — “Híbrido moderno”

Not pure pixel art. Not pure illustration.  
**Premium web craft + playable world.**

### Shell (above the fold / intro)

- Full-viewport cinematic frames.
- Large typography, restrained color, deep negative space then sudden richness.
- Scroll-driven chapters (Lenis + ScrollTrigger): title → Uruguay mood → invitation to play.
- Micro-motion: grain, light leaks, soft parallax of silhouettes (Palacio Salvo, Rambla, ombú, bandera abstracta — never clipart).

### Game world (top-down)

- Semi-realistic stylized ground: painted textures + soft lighting, not noisy photoreal.
- Silhouettes and landmarks of Uruguay as **readable POIs** and background storytelling.
- Character: simple, iconic, highly animated (idle, walk 8-dir or 4-dir with polish).
- Camera: soft follow, slight lag, optional screen shake on discovery.
- Day atmosphere: warm coastal light, soft shadows, subtle wind on foliage layers.

### Color system (working)

```
--uy-sky:        #7EB6D9   /* sky / rambla */
--uy-water:      #1B4F72   /* río / mar */
--uy-sand:       #E8D5B5   /* costa */
--uy-grass:      #4A7C59   /* campo */
--uy-sun:        #F4C430   /* sol / accent gold */
--uy-night:      #0B1220   /* deep shell bg */
--uy-cream:      #F7F2E9   /* text on dark */
--uy-coral:      #E07A5F   /* interactive / CTA */
```

Typography direction: one display face (editorial / geometric) + one clean body (system or Inter-like for a11y). Exact fonts chosen in art PR.

### Motion language (Apple-grade)

- Easing: custom cubic-beziers, never default ease-in-out everywhere.
- Durations: 0.6–1.2s for major transitions; 120–200ms for UI feedback.
- Stagger reveals; mask/clip text; blur → sharp on focus.
- Game transitions: shell fades / wipes into canvas with shared color so it feels one product.

---

## 5. World design — Uruguay as map of self

The map is **stylized Uruguay**, not a cartographic GIS. Regions map to portfolio chapters.

### Macro zones (v1 proposal)

| Zone | Place inspiration | Portfolio content |
|------|-------------------|-------------------|
| **Costa / Rambla** | Montevideo rambla | Intro, about me, personality |
| **Ciudad Vieja** | Casco histórico MVD | Experience / work history |
| **Torre de las Comunicaciones / modern skyline** | Montevideo tech | Projects & case studies |
| **Universidad / campus** | UdelaR or study landmark | Education |
| **Puerto / barco** | Puerto de Montevideo | Open source / GitHub / collaborations |
| **Campo / interior** | Silo / ombú / ruta | Soft skills, values, side quests |
| **Faro / Punta** | East coast lighthouse | Contact / “send signal” CTA |

Each zone has:

1. **Landmark visual** (readable from far).
2. **POI marker** (glow / totem) when in range.
3. **Interaction panel** (Layer A overlay) with rich content + external links.
4. **Optional collectible** (e.g. “mate”, “sol de Mayo”) for completionists — fun, never required.

### Navigation fantasy

- Spawn near **Rambla** after intro.
- Soft “quest compass” or distant landmark silhouettes pull curiosity (not a loud minimap at start).
- Mobile: virtual joystick + interact button; Desktop: WASD/arrows + E/click.

---

## 6. Experience flow (user journey)

```
[Landing dark]
    ↓ scroll (Lenis + GSAP)
[Title sequence: “conoceme aun mas”]
    ↓
[Mood frames: light of Uruguay, short copy]
    ↓
[CTA: “Entrar al mundo” / “Jugar”]
    ↓ handoff animation
[Phaser boot + first room/zone]
    ↓ free exploration
[Approach POI → prompt]
    ↓
[Panel: content + links + close]
    ↓ continue exploring
[Optional: collect all → secret / thank-you]
```

### Accessibility & fallback

- Keyboard full path for shell + game.
- Reduced motion: shorter GSAP, less parallax, game still playable.
- Content reachable without 100% game completion (escape menu / index of places).
- Touch targets ≥ 44px on mobile overlays.

---

## 7. Content model (progressive)

Content lives in `/content` and is versioned in git. We fill gradually.

```ts
// Conceptual shape — implement in PR of content system
type PlaceId =
  | 'rambla'
  | 'ciudad-vieja'
  | 'skyline'
  | 'universidad'
  | 'puerto'
  | 'campo'
  | 'faro';

interface PortfolioPlace {
  id: PlaceId;
  title: string;
  subtitle?: string;
  body: string;          // markdown
  links: { label: string; href: string; kind: 'github' | 'web' | 'linkedin' | 'email' | 'other' }[];
  unlock?: { requires?: PlaceId[] };
}
```

**Rule:** never hardcode long bio text inside Phaser scenes. Scenes only know `placeId`; UI layer renders content.

Placeholder content is fine until real data arrives.

---

## 8. Architecture (code)

```
conoceme-aun-mas/
├── docs/                 # DESIGN, art direction, decisions
├── content/              # portfolio JSON/MD (progressive)
├── public/
│   ├── audio/
│   ├── fonts/
│   └── game/             # textures, sprites, tilemaps
├── src/
│   ├── main.ts           # boot
│   ├── shell/            # DOM intro, GSAP, Lenis, overlays
│   ├── game/             # Phaser game
│   │   ├── main.ts
│   │   ├── scenes/
│   │   ├── entities/
│   │   ├── systems/      # input, interact, audio bridge
│   │   └── world/
│   ├── ui/               # place panels, menus, HUD
│   ├── content/          # loaders & types
│   └── styles/
├── .github/              # PR template, CI
├── AGENTS.md             # how AI + human collaborate
├── CONTRIBUTING.md
├── PROYECTO.md           # status board (living)
└── package.json
```

### Scene plan (Phaser)

1. `BootScene` — assets critical path  
2. `PreloadScene` — progress bar on-brand  
3. `WorldScene` — main exploration  
4. (Later) `InteriorScene` optional for deep dives  

### Shell ↔ Game bridge

- Single event bus (`mitt` or tiny custom emitter).
- Events: `shell:enter-world`, `game:open-place`, `game:close-place`, `ui:reduced-motion`.
- Only one “focus owner” at a time (scroll shell vs game input).

---

## 9. Performance budget

| Metric | Target |
|--------|--------|
| LCP (shell) | < 2.0s on mid mobile |
| Game first interactive | < 3.5s after “Entrar” on 4G |
| Bundle initial JS | Prefer code-split: shell first, Phaser lazy on enter |
| Texture atlas | Pack sprites; avoid huge unoptimized PNGs |
| FPS | 60 desktop, stable 30–60 mobile |

Phaser should **not** load until the user commits to enter (or soft preload in idle time after first paint).

---

## 10. Sound direction (phase 2+)

- Ambient: soft wind + distant water (Rambla), subtle campo cicadas in interior zones.
- UI: soft ticks, discovery chime (not generic game beeps).
- Respect autoplay policies; mute toggle always visible; remember preference.

---

## 11. Brand voice (copy)

- Spanish first (Rioplatense natural, not translated corporate).
- Short lines. Poetry allowed in intro; clarity in experience panels.
- Title treatment: **conoceme aun mas** (sin tildes en marca de producto / repo; copy puede usar “conoceme aún más”).

---

## 12. Key decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| App shell | Vite + TS | Max control & perf for hybrid game site |
| Engine | Phaser 3 | Real game framework, mobile+desktop, battle-tested |
| Perspective | Top-down | Free exploration of Uruguay zones as portfolio chapters |
| Art style | Híbrido moderno | Cinematic shell + stylized semi-real world — unique, not “another pixel portfolio” |
| Content | External JSON/MD | Progressive bio without code rewrites |
| Motion | GSAP + Lenis on shell only | Apple-like intro without fighting the game loop |
| Collaboration | Public repo, **PR-only** to `main` | Peer workflow human + agent, reviewable history |
| React | Not in v1 core | Avoid framework soup; add later only if UI complexity demands |

---

## 13. Non-goals (v1)

- Multiplayer / accounts  
- CMS admin UI  
- Full Uruguay cartography accuracy  
- 3D world  
- Native app stores  

---

## 14. Open questions (for Leandro)

Tracked in `PROYECTO.md`. Critical ones:

1. Nombre real + rol para el title card (ej. “Leandro Martínez — Full Stack”).  
2. Links canónicos: GitHub, LinkedIn, email, site.  
3. ¿Hay foto/avatar preferido o diseñamos personaje 100% ilustrado?  
4. Prioridad de contenido: ¿experiencia laboral o proyectos primero?  
5. Dominio custom o `*.vercel.app` al inicio?

---

## 15. PR Plan (implementation roadmap)

Each PR is independently reviewable and mergeable. **No direct commits to `main`.**

| # | PR title | Scope | Depends on |
|---|----------|--------|------------|
| **0** | `docs: foundation design & collaboration rules` | DESIGN, PROYECTO, AGENTS, CONTRIBUTING, PR template | — |
| **1** | `chore: scaffold Vite + TS + base tooling` | package.json, eslint, prettier, tsconfig, empty app boot | 0 |
| **2** | `feat(shell): cinematic title + Lenis/GSAP intro` | Layer A scroll experience, “Entrar al mundo” CTA | 1 |
| **3** | `feat(game): Phaser boot + player movement top-down` | WorldScene, keyboard + mobile joystick, camera follow | 1 |
| **4** | `feat(world): Uruguay zones scaffold + collision` | Placeholder map layers, zone triggers | 3 |
| **5** | `feat(content): place content system + first POI panels` | `/content`, open/close UI, sample places | 2, 4 |
| **6** | `feat(art): hybrid art pass — textures, character, landmarks` | Assets pipeline, first beautiful zone (Rambla) | 4 |
| **7** | `feat(polish): motion handoff shell↔game, audio, a11y` | Bridges, reduced motion, mute, polish | 2, 5, 6 |
| **8** | `feat(content): fill experience / education / github` | Real data progressive | 5 |
| **9** | `chore: deploy Vercel + CI checks on PR` | Preview deploys, lint/typecheck CI | 1 |

Later PRs: more zones, collectibles, secret ending, SEO meta, og:image cinematic.

---

## 16. Definition of done (experience v1)

- [ ] Intro scroll feels intentional and premium on desktop + mobile  
- [ ] User can enter world and move character smoothly  
- [ ] ≥ 3 interactive places with real or placeholder content + links  
- [ ] Uruguay atmosphere is readable without text (“this is my country”)  
- [ ] No broken input focus between shell and game  
- [ ] Lighthouse / perf not embarrassing on mobile  
- [ ] All changes landed via PR review  

---

## 17. How to keep this file alive

When you (human or agent) change architecture, art direction, stack, or map structure:

1. Update this document in the **same PR**.  
2. Add a line to the changelog in `PROYECTO.md`.  
3. Never leave code and DESIGN divergent.

This document is the **source of truth** for autopilot implementation.

