# Misión Copechi: ¡Todas y todos podemos!

Videojuego web para niñas y niños de 4 a 10 años sobre roles y estereotipos de género. Mensaje: **¡Ningún juego, color ni oficio tiene dueño!**

HTML, CSS y JS puros, sin dependencias. Pensado para celular en vertical (360x640).

## Estructura
- `index.html`, `style.css`, `game.js`: el juego.
- `data/scenes.json`: todos los textos y escenas.
- `assets/`: recursos.
- `guia-docente.html`: guía para docentes.
- `arte.js`: pixel art (sprites, tiles, fondos, avatar).
- `mapa.js` y `data/maps.json`: mapas, movimiento y salidas.
- `sw.js`: service worker para jugar sin internet tras la primera carga.
- `check.js`: valida `scenes.json` (`node check.js`).
- `_githooks/pre-commit`: corre `check.js` antes de cada commit.

## Desarrollo
```
node check.js                       # validar escenas
git config core.hooksPath _githooks # activar el hook (una vez)
python -m http.server 8000          # probar en http://localhost:8000
```
(El juego carga `scenes.json` con `fetch`, así que necesita servidor local, no `file://`.)

## Publicar en GitHub Pages
1. Crea un repositorio en GitHub y sube estos archivos a la rama `main` (`git init`, `git add .`, `git commit`, `git remote add origin ...`, `git push -u origin main`).
2. En GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, rama `main`, carpeta `/ (root)`, **Save**.
3. Espera 1 o 2 minutos. El juego queda en `https://TU-USUARIO.github.io/TU-REPO/` y la guía en `.../guia-docente.html`.
4. Abre el enlace en un celular, deja que cargue una vez y prueba el modo avión: debe seguir funcionando.

Si cambias archivos del juego, sube el número de `CACHE` en `sw.js` (por ejemplo `copechi-v2`) para que los celulares descarguen la versión nueva.

## Generar el QR
- Rápido: abre cualquier generador de QR (por ejemplo qr-code-generator.com), pega el enlace de GitHub Pages y descarga el PNG.
- Con Node (opcional, fuera del repo): `npx qrcode -o qr.png "https://TU-USUARIO.github.io/TU-REPO/"`.
- Imprímelo grande (mínimo 5 x 5 cm) y pruébalo con un celular antes de entregarlo.
