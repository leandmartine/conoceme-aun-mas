# PROYECTO — conoceme-aun-mas

Living status board. Update on every meaningful PR.

| Field | Value |
|-------|--------|
| **Repo** | `leandmartine/conoceme-aun-mas` (public) |
| **Status** | 🟡 Foundation landed on GitHub — next: Vite scaffold (PR #1 code) |
| **Stack** | Vite · TypeScript · Phaser 3 · GSAP · Lenis |
| **Art** | Híbrido moderno · top-down Uruguay |
| **Workflow** | Branch → PR → review → merge to `main` only |

---

## Current focus

1. ~~Land foundation docs (PR #0).~~ ✅ on `main`  
2. World map doc + status (this PR).  
3. Scaffold tooling (next: `chore/scaffold-vite`).  
4. Parallel tracks: cinematic shell + Phaser player.

---

## Changelog

### 2026-07-17 — World map

- Added `docs/WORLD_MAP.md` (zone layout, spawn, priorities).
- Marked foundation as landed; pipeline advanced.

### 2026-07-17 — Foundation

- Created living design system (`docs/DESIGN.md`).
- Locked stack: Vite + TS + Phaser 3 + GSAP + Lenis.
- Locked art: híbrido moderno, top-down.
- Locked product name: **conoceme-aun-mas**.
- Collaboration rules: PR-only, peer workflow human + agent.
- Content model designed for progressive bio loading.
- Public repo: https://github.com/leandmartine/conoceme-aun-mas

---

## Content backlog (fill progressively)

| Block | Status | Notes |
|-------|--------|-------|
| About / bio corta | ⬜ empty | Rambla zone |
| Experiencia laboral | ⬜ empty | Ciudad Vieja |
| Proyectos destacados | ⬜ empty | Skyline |
| Estudios | ⬜ empty | Universidad |
| GitHub / OSS | ⬜ empty | Puerto — link repos |
| Contacto | ⬜ empty | Faro |
| Skills / stack | ⬜ empty | Optional campo quest |

---

## Open questions for Leandro

- [ ] Nombre + título profesional para title card  
- [ ] Links: GitHub, LinkedIn, email, otros  
- [ ] Personaje: ilustrado custom vs avatar basado en vos  
- [ ] Prioridad de zonas de contenido  
- [ ] Dominio / deploy preferido  

---

## PR pipeline (see DESIGN §15)

| PR | Title | State |
|----|-------|-------|
| 0 | docs: foundation design & collaboration rules | ✅ merged (initial main) |
| 0b | docs: world map + status board update | 🔵 this PR |
| 1 | chore: scaffold Vite + TS + base tooling | ⬜ |
| 2 | feat(shell): cinematic title + Lenis/GSAP intro | ⬜ |
| 3 | feat(game): Phaser boot + player movement | ⬜ |
| 4 | feat(world): Uruguay zones scaffold | ⬜ |
| 5 | feat(content): place system + POI panels | ⬜ |
| 6 | feat(art): hybrid art pass (Rambla first) | ⬜ |
| 7 | feat(polish): handoff, audio, a11y | ⬜ |
| 8 | feat(content): real experience/education/github | ⬜ |
| 9 | chore: Vercel + CI on PR | ⬜ |

---

## Working agreement (short)

1. **Nunca** pushear directo a `main`.  
2. Una PR = una intención clara.  
3. Actualizar `DESIGN.md` / este archivo si cambia la dirección.  
4. Agent y humano se tratan como compañeros: reviews, commits atómicos, CI verde.  
5. La belleza no es opcional — si se ve genérico, no mergeamos.
