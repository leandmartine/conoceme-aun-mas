# AGENTS.md — reglas para agentes de código

Este repo lo mantiene **solo Leandro**. Es público para que cualquiera chusmee el código, no para PRs de terceros.

Los agentes de IA que implementen acá deben seguir esto al pie de la letra.

---

## Misión

Construir **conoceme-aun-mas**: portfolio-juego (shell cinematográfica + Phaser top-down + backend REST), ambientado en un Uruguay estilizado.

Fuentes de verdad:

| Doc | Uso |
|-----|-----|
| `docs/DESIGN.md` | Producto y decisiones |
| `docs/ARCHITECTURE.md` | FE/BE, SOLID, REST, API key |
| `docs/WORLD_MAP.md` | Zonas + brújula |
| `docs/AI_GUIDE.md` | Rol de la IA del portfolio (futuro endpoint) |
| `PROYECTO.md` | Estado |
| `content/*` | Datos de Leandro y lugares |

---

## Hard rules

1. **PRs, no commits sueltos a `main`.**  
2. **Leandro siempre mergea.** Cuando la PR esté lista: avisarle con el link y un resumen. No asumas merge.  
3. **No agregues commits a una PR ya creada y marcada lista.** Puede estar mergeada. Si hay que seguir: **branch + PR nueva** desde `main` actualizado.  
4. **Frontend y backend separados** (`apps/frontend`, `apps/backend`, `packages/shared`). No mezclar responsabilidades.  
5. **SOLID + REST** como en `ARCHITECTURE.md`. Controllers flacos, services con reglas, repos para I/O.  
6. **Secretos y system prompts solo en backend.**  
7. **Contenido largo en `/content`**, no hardcodeado en Phaser scenes.  
8. **Todos los lugares desbloqueados** desde el inicio.  
9. **Minimapa tipo brújula** es feature de producto, no nice-to-have.  
10. **Barra de calidad visual alta** — si se ve genérico, no está listo.  
11. TypeScript strict; sin `any` sin justificación.  
12. Actualizar docs de diseño/estado en la **misma** PR si cambia la dirección.

---

## Branch naming

```
docs/<slug>
chore/<slug>
feat/<slug>
fix/<slug>
art/<slug>
```

---

## Commits

Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `perf:`.

---

## Al avisar que una PR está lista

Incluir siempre:

1. URL de la PR  
2. Qué cambió (bullets)  
3. Cómo probar (si aplica)  
4. Si requiere merge antes de la siguiente tarea  

---

## IA del portfolio (no confundir)

Hay **dos** roles de IA distintos:

| Rol | Dónde | Doc |
|-----|-------|-----|
| Agente de código (vos acá) | Desarrollo del repo | este archivo |
| Compañero del juego/API | Runtime futuro `/api/v1/ai/chat` | `docs/AI_GUIDE.md` |

No implementes el compañero sin leer `AI_GUIDE.md` (anti-bypass, grounded, sin código on-demand).
