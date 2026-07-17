# PROYECTO — conoceme-aun-mas

| Field | Value |
|-------|--------|
| **Repo** | https://github.com/leandmartine/conoceme-aun-mas (público, showcase) |
| **Owner** | Leandro Emanuel Martinez (mergea siempre) |
| **Status** | 🟡 Shell cinematográfica GSAP/Lenis — juego Phaser next |
| **Stack** | FE: Vite·TS · BE: Hono·TS·REST · shared types · (Phaser/GSAP next) |
| **Art** | Híbrido moderno · top-down · minimapa brújula |
| **Progression** | Todo desbloqueado desde el inicio |

---

## Current focus

1. Merge shell cinematográfica (esta PR).  
2. Siguiente: Phaser player + minimapa brújula.

---

## Changelog

### 2026-07-17 — Shell cinematic

- GSAP + ScrollTrigger + Lenis en la intro.  
- Stage full-viewport con silueta Uruguay, chapters, cards de lugares.  
- CTA “Explorar el mapa” con scroll suave.

### 2026-07-17 — Monorepo scaffold

- npm workspaces: `apps/frontend`, `apps/backend`, `packages/shared`.  
- Backend Hono con capas SOLID: health, profile, places, player state.  
- Content leído desde `/content`.  
- Frontend Vite: shell dark premium + client API tipado.  
- CI: install + typecheck + build.

### 2026-07-17 — Architecture & profile

- Split FE/BE documentado; AI_GUIDE; world map; content base.

### 2026-07-17 — Foundation

- Visión inicial y repo público.

---

## Content backlog

| Block | Status |
|-------|--------|
| Profile base | ✅ |
| Places stub | ✅ |
| Timeline laboral fino | ⬜ |
| ORT detalle | ⬜ |
| Proyectos skyline | ⬜ |
| Knowledge IA | ⬜ |

---

## Pipeline

| PR | State |
|----|-------|
| Foundation | ✅ |
| docs: world map (#1) | ✅ |
| docs: architecture + profile + AI (#2) | ✅ |
| chore: monorepo scaffold (#3) | ✅ |
| feat(shell): GSAP intro | 🔵 esta PR |
| feat(game): player + compass | ⬜ |
| feat(ui): place panels | ⬜ |
| feat(art): character + rambla | ⬜ |
| feat(ai): stub + api key | ⬜ |
| chore: deploy | ⬜ |
