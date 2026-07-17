# PROYECTO — conoceme-aun-mas

Living status board. Update on every meaningful PR.

| Field | Value |
|-------|--------|
| **Repo** | `leandmartine/conoceme-aun-mas` (public) |
| **Status** | 🟡 Foundation — design locked direction, code not started |
| **Stack** | Vite · TypeScript · Phaser 3 · GSAP · Lenis |
| **Art** | Híbrido moderno · top-down Uruguay |
| **Workflow** | Branch → PR → review → merge to `main` only |

---

## Current focus

1. Land foundation docs (PR #0).  
2. Scaffold tooling (PR #1).  
3. Parallel tracks: cinematic shell (PR #2) + Phaser player (PR #3).

---

## Changelog

### 2026-07-17 — Foundation

- Created living design system (`docs/DESIGN.md`).
- Locked stack: Vite + TS + Phaser 3 + GSAP + Lenis.
- Locked art: híbrido moderno, top-down.
- Locked product name: **conoceme-aun-mas**.
- Collaboration rules: PR-only, peer workflow human + agent.
- Content model designed for progressive bio loading.

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
| 0 | docs: foundation design & collaboration rules | 🔵 in progress |
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
