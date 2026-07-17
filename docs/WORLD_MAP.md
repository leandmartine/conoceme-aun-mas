# World map — Uruguay portfolio zones

Working spatial layout for the top-down world. Not cartographic accuracy — **readable fantasy map**.

```
                    N
                    ▲
        [CAMPO]     │     [UNIVERSIDAD]
           ·        │          ·
            \       │         /
             \      │        /
    [PUERTO] ·------★------· [SKYLINE]
             /   (centro)    \
            /    Ciudad       \
           ·                   ·
      [CIUDAD VIEJA]      [FARO / ESTE]
           ·
           │
      [RAMBLA]  ← spawn post-intro
           │
           ▼ S (Río / mar)
```

## Zone brief

| ID | Landmark vibe | Content chapter | Priority |
|----|---------------|-----------------|----------|
| `rambla` | Curva de costa, luz baja, gente lejana | About / personalidad | P0 — first beautiful zone |
| `ciudad-vieja` | Empedrado, fachadas, faroles | Experiencia laboral | P0 |
| `skyline` | Torres, vidrio, sol en cristales | Proyectos | P0 |
| `universidad` | Escaleras, libros/arquitectura campus | Estudios | P1 |
| `puerto` | Grúas, agua, contenedores abstractos | GitHub / collab | P1 |
| `campo` | Ombú, horizonte, pastos | Valores / soft skills | P2 |
| `faro` | Acantilado este, haz de luz | Contacto | P1 |

## Spawn & flow

1. After cinematic CTA → fade into **Rambla**.
2. Soft silhouettes of Ciudad Vieja + skyline pull north.
3. Faro remains a distant east beacon (contact always “visible” metaphorically).

## Implementation notes

- v1 can use large painted planes + collider polygons (no full Tiled map required on day one).
- Landmark billboards: tall sprites that read at camera distance.
- Zone enter = trigger volume → HUD whisper of place name → full panel on interact.

Update this file when zone order or metaphor changes.
