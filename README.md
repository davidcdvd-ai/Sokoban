# 📦 Empuja Cajas

Un Sokoban para peques (8–10 años): empuja las cajas hasta los círculos.

**Jugar:** visita la página de GitHub Pages del repositorio (https://davidcdvd-ai.github.io/Sokoban/) o abre `index.html` en el navegador. En el móvil o la tablet se puede "Añadir a pantalla de inicio" y se abre como una app, con su icono.

## Qué tiene

- **40 niveles en 5 mundos** (Granja, Selva, Polo Norte, Dulces, Espacio), cada uno más difícil.
  Todos los niveles se han comprobado con un solucionador: siempre tienen solución.
- **Estrellas ⭐⭐⭐** según los pasos que uses. Los mundos se abren al juntar estrellas,
  así que merece la pena repetir niveles para mejorar.
- **Monedas 🪙** por cada nivel y estrella nueva, para comprar **personajes** y **cajas** en la tienda.
- **Cofre 🎁** al terminar cada mundo y **álbum de pegatinas** con logros.
- **Premio diario** con racha de días 🔥 y **reto del día** 🎯.
- **Varios jugadores**: cada niño tiene su perfil con su progreso (se guarda en el navegador).
- Botón **Atrás** (deshacer), **Otra vez**, y **Pista** 💡 (cuesta 5 monedas).
- Controles: cruceta en pantalla, deslizar el dedo sobre el tablero, o teclado
  (flechas / WASD, `Z` deshacer, `R` reiniciar).

## Niveles

Los niveles se generan con `python3 tools/generar_niveles.py > levels.js`.
El generador crea cada nivel "al revés" (tirando de las cajas desde las metas) y
un solucionador BFS calcula la solución más corta, que sirve para las estrellas y las pistas.
