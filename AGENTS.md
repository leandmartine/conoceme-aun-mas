# AGENTS.md — collaboration contract

This repo is built by **Leandro** and **AI coding agents** as peers.  
Read this before any non-trivial change.

---

## Mission

Build **conoceme-aun-mas**: a hybrid cinematic + top-down game portfolio set in a stylized Uruguay.  
Source of truth for product/tech: [`docs/DESIGN.md`](./docs/DESIGN.md).  
Source of truth for status: [`PROYECTO.md`](./PROYECTO.md).

---

## Hard rules

1. **PR-only workflow**  
   - Create a branch from `main`.  
   - Open a PR.  
   - Never commit directly to `main` (unless user explicitly emergency-overrides).  

2. **Follow the design line**  
   - Visual ambition is part of the definition of done.  
   - Prefer craft over speed when they conflict on user-facing surfaces.  
   - If you invent a new pattern, document it in `DESIGN.md` in the same PR.

3. **Autocomplement, don’t fork vision**  
   - New assets, copy, and motion must feel like the same product.  
   - Reuse color tokens, easing language, and zone metaphors from DESIGN.  
   - When unsure, propose in the PR description — don’t silently reinvent.

4. **Content is progressive**  
   - Don’t block systems on missing bio data.  
   - Use placeholders with clear `TODO` content keys.  
   - Never hardcode long copy inside Phaser scenes.

5. **Quality bar**  
   - TypeScript strict.  
   - No `any` without justification.  
   - Lint + typecheck clean before requesting review.  
   - Mobile is first-class (touch controls, safe areas, performance).

6. **Git hygiene**  
   - Conventional commits preferred: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `style:`, `perf:`.  
   - Small PRs > giant dumps.  
   - PR description: *why*, *what*, *how to test*, screenshots/GIFs for UI.

---

## Branch naming

```
docs/<short-slug>
chore/<short-slug>
feat/<short-slug>
fix/<short-slug>
art/<short-slug>
```

Examples: `docs/foundation`, `feat/shell-intro`, `feat/player-movement`.

---

## PR checklist (agents must fill)

- [ ] Touches match a single intention  
- [ ] `DESIGN.md` / `PROYECTO.md` updated if direction or status changed  
- [ ] No secrets committed  
- [ ] How to test locally documented  
- [ ] Visual QA note for mobile + desktop when UI/game changes  

---

## Stack reminders

| Layer | Tech |
|-------|------|
| Shell | DOM + GSAP + ScrollTrigger + Lenis |
| Game | Phaser 3 top-down |
| App | Vite + TypeScript |
| Content | `/content` JSON + MD |

See DESIGN for non-goals (no Three.js world, no React-required v1, etc.).

---

## What “senior craft” means here

- Motion with intention (not random fades).  
- Uruguay as atmosphere, not sticker pack.  
- Input that feels good before it looks fancy.  
- Performance as a feature.  
- Empty states and placeholders that still look designed.

---

## When blocked

1. Check `DESIGN.md` open questions / `PROYECTO.md`.  
2. Ask the user with a concrete recommendation.  
3. Don’t ship a generic fallback that lowers the bar.
