# Misión Copechi: ¡Todas y todos podemos!

Videojuego web para niñas y niños de 4 a 10 años sobre roles y estereotipos de género. Mensaje: **¡Ningún juego, color ni oficio tiene dueño!**

HTML, CSS y JS puros, sin dependencias. Pensado para celular en vertical (360x640).

## Estructura
- `index.html`, `style.css`, `game.js`: el juego.
- `data/scenes.json`: todos los textos y escenas.
- `assets/`: recursos.
- `guia-docente.html`: guía para docentes.
- `check.js`: valida `scenes.json` (`node check.js`).
- `_githooks/pre-commit`: corre `check.js` antes de cada commit.

## Desarrollo
```
node check.js                       # validar escenas
git config core.hooksPath _githooks # activar el hook (una vez)
python -m http.server 8000          # probar en http://localhost:8000
```
(El juego carga `scenes.json` con `fetch`, así que necesita servidor local, no `file://`.)

## Publicar
Los pasos para GitHub Pages y el QR se agregan en la Fase 4.
