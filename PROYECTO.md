# PROYECTO — conoceme-aun-mas

| Field | Value |
|-------|--------|
| **Repo** | https://github.com/leandmartine/conoceme-aun-mas (público, showcase) |
| **Owner** | Leandro Emanuel Martinez (mergea siempre) |
| **Status** | 🟢 v1 experiencia completa en código — deploy real pendiente de OK |
| **Stack** | FE: Vite·TS·Phaser 3·GSAP · BE: Hono·TS·REST · shared · content-driven |
| **Art** | Híbrido moderno · top-down · minimapa brújula · personaje foto-inspired |
| **Progression** | Todo desbloqueado desde el inicio |

---

## Current focus

1. Merge `chore/deploy-ci` (CI + Docker scaffold).  
2. **Deploy público** solo cuando Leandro lo autorice (ver `docs/DEPLOY.md`).  
3. Opcional: provider LLM SpaceXAI con `XAI_API_KEY`.

---

## Changelog

### 2026-07-17 — Deploy scaffold + CI

- GitHub Actions: typecheck + unit tests (intent AI) + build.  
- Dockerfile + docker-compose (SPA + API same-origin).  
- Backend: secure headers, `STATIC_ROOT`, serve Vite dist in production.  
- `docs/DEPLOY.md`.

### 2026-07-17 — AI companion stub

- `POST /api/v1/ai/chat` + API key + rate limit + knowledge base.  
- FAB 💬 in-game companion (grounded stub).

### 2026-07-17 — Art: character + Rambla

- Personaje inspirado en foto CV (sweater gris, walk cycle).  
- Paseo costero: dunas, faroles, bancos, palmeras, espuma.

### 2026-07-17 — Game + shell + monorepo

- Phaser world, brújula, paneles, sprint, landing cinematográfica.  
- Content profile/places; workspaces FE/BE/shared.

---

## Content backlog

| Block | Status |
|-------|--------|
| Profile base | ✅ |
| Places narrative | ✅ (ampliable) |
| Knowledge IA | ✅ `content/knowledge/` |
| Timeline laboral fino | ⬜ fechas exactas extra |
| ORT detalle carrera | ⬜ |
| Proyectos skyline extra | ⬜ |

---

## Pipeline

| PR | State |
|----|-------|
| Foundation → monorepo → shell → game → panels | ✅ |
| feat(art): character + Rambla | ✅ |
| feat(ai): stub + api key | ✅ |
| chore: deploy + CI | 🔵 esta PR |
| Deploy live | ⬜ espera OK de Leandro |
