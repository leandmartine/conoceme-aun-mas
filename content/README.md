# Content

Fuente editorial del portfolio. El **backend** la expone por REST; el **frontend** no debería hardcodear biografías largas.

```text
content/
  profile.json           # canon de Leandro
  places.index.json      # ids, coords de mapa, capítulos
  places/*.md            # cuerpos por zona
  knowledge/             # (futuro) hechos cortos para la IA
```

## Reglas

- Todo lugar listado en `places.index.json` está **disponible desde el inicio**.  
- Ampliar experiencia/estudios/proyectos con PRs de contenido.  
- Mantener alineado con LinkedIn: https://www.linkedin.com/in/leandmartine/  
