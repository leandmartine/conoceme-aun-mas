# World map — Uruguay portfolio zones

Layout espacial del mundo top-down. No es cartografía real: es un **mapa legible y hermoso**.

**Regla de producto:** todos los lugares están **disponibles desde el inicio**. Sin unlock gates. El visitante elige el orden.

---

## Layout

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

---

## Zones

| ID | Landmark vibe | Capítulo portfolio | Prioridad arte |
|----|---------------|--------------------|----------------|
| `rambla` | Costa, luz baja, horizonte | About / personalidad | P0 — primera zona hermosa |
| `ciudad-vieja` | Empedrado, fachadas, faroles | Experiencia laboral | P0 |
| `skyline` | Torres, vidrio, sol | Proyectos | P0 |
| `universidad` | Campus / escaleras | Estudios | P1 |
| `puerto` | Agua, grúas abstractas | GitHub / collabs / código | P1 |
| `campo` | Ombú, horizonte | Valores / soft skills | P2 |
| `faro` | Costa este, haz de luz | Contacto | P1 |

---

## Minimapa / brújula

Siempre visible en juego (HUD):

- Disco tipo **brújula** con orientación del mundo.  
- Player en referencia central.  
- Markers de **todos** los POIs con dirección relativa.  
- Al elegir un destino (tap en marker o menú), una flecha de rumbo ayuda a caminar.  
- No teletransporta: invita a recorrer.

Detalle técnico: `docs/ARCHITECTURE.md` §6.

---

## Spawn & flow

1. Intro cinematográfica → fade in en **Rambla**.  
2. El minimapa ya muestra el resto de Uruguay del portfolio.  
3. Interacción libre; sin quest obligatoria.  
4. Opcional más adelante: collectibles (mate, sol) solo por diversión — nunca bloquean contenido.

---

## Personaje (player)

Inspirado en Leandro, **no** un clon 1:1:

- Complexión grande / presencia alta  
- Tez café con leche  
- Ojos oscuros  
- Cabello negro  
- Silueta legible en top-down; animaciones idle + walk pulidas  

---

## Implementation notes

- v1: planos pintados + colliders + landmarks altos legibles a distancia.  
- Zona enter → whisper del nombre en HUD → panel al interactuar (E / botón).  
- Datos del panel vienen de la **API REST** (`GET /places/:id`), no hardcode en la scene.
