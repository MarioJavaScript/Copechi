# Misión Copechi: ¡Todas y todos podemos!

Videojuego web para el Hackatón Misión Copechi (entrega 28-oct-2026, 18:30). Memoria del proyecto.

## Reglas de trabajo
- Trabajar POR FASES. Al terminar cada una: reportar en 5 líneas, correr `node check.js`, listar archivos tocados y ESPERAR a que Mario escriba "sigue".
- NUNCA ejecutar `git add`, `git commit` ni `git push`. Mario hace los commits.
- HTML, CSS y JS puros. Sin frameworks, sin dependencias, sin build. Debe funcionar solo con un link (GitHub Pages).
- Todo el texto del juego en español.

## Concepto
- Público: niñas y niños de 4 a 10 años (kinder y primaria) en Sonora. Kinder no lee bien: debe poder jugarse sin leer (voz + íconos).
- Tema: roles y estereotipos de género. Mensaje central: "¡Ningún juego, color ni oficio tiene dueño!"
- Guía: "La Copechi" (siempre en femenino), insecto con alas (parece libélula) en pixel art, verde o amarillo, simpática y original. Habla con voz, 3 expresiones (neutral, contenta, triste) y aleteo de 2 frames.
- Retos que cubre: 7 (Todas y todos tenemos un lugar), 5 (Las palabras pueden cuidar o lastimar), 4 (Mis emociones también importan), 3 (Me cuido en el mundo digital).

## Mobile first (obligatorio)
- Celular en vertical: diseñar para 360x640 y escalar a tablet y compu.
- 100% táctil: solo tap, sin hover, teclado ni arrastrar. Botones mínimo 64 px de alto y 48 px de separación táctil.
- meta viewport correcto, `touch-action: manipulation`, `100dvh`, `env(safe-area-inset-*)`, sin scroll accidental ni zoom por doble toque.
- Voz con speechSynthesis (es-MX, fallback a cualquier "es"). En iOS/Android solo suena tras el primer toque: la primera pantalla es "¡Toca para empezar!" y ahí se desbloquea. Botón grande de bocina para repetir.
- Vibración corta (`navigator.vibrate`) opcional al elegir, con comprobación de soporte.

## Arte: pixel art sencillo
- Paleta de máximo 16 colores vivos (cielo azul, pasto verde, amarillo sol, coral, naranja, morado, verde azulado, contorno oscuro; ver `PALETA` en `arte.js`, sin beige). Sin degradados, blur ni sombras difusas: bandas de color, sombras sólidas desplazadas 4 px y dithering.
- Todo el arte vive en `arte.js` (sprites simétricos como mitad izquierda, se espejan; check.js valida sus tamaños). Sprites 16x16 o 32x32 como matrices en JS, dibujados en canvas o CSS, con `image-rendering: pixelated`. Sin imágenes externas ni internet.
- Fuente pixel con fallback a monospace.

## Contenido
- `data/scenes.json` es la ÚNICA fuente de textos.
- Escena (episodio): opcional `fondo` ("patio", "salon" o "celular"), `text`, opcional `voz` (lo que se lee en voz alta), `opciones` (máx. 2), `final: true` en las finales.
- Opción: `text`, `icono` (emoji), `next`, `feedback`, opcional `badge`, opcional `triste: true` (opción menos buena: cara triste y `next` vuelve a la misma escena para reintentar).
- Textos de 1 o 2 frases simples. La Copechi acompaña, nunca regaña. Nunca "fallaste": la opción menos buena da cara triste, un feedback que invita a reflexionar y la posibilidad de volver a intentar.
- Escenas: (1) Juegos sin dueño (Sofi fútbol, Leo muñecos, "eso no es para ti"); (2) Frases que lastiman ("los niños no lloran", "las niñas no son fuertes"; elegir la frase respetuosa); (3) Quién puede ser qué (bombero, doctora, cocinero, piloto: "¡puede ser cualquiera!"); (4) Mensaje en línea (chat dice "las niñas no saben jugar" y un desconocido pregunta "¿dónde vives?"; salida correcta: bloquear y avisar a una persona adulta de confianza).
- Cada escena termina recordando que se puede pedir ayuda a una persona adulta de confianza.
- Final: estrellas (no puntajes), mensaje central y 3 preguntas para debatir en el salón (campo `preguntas` de la escena final; se muestran en la pantalla "Para platicar").

## Fases
- FASE 0: estructura del repo (CLAUDE.md, README, .gitignore, check.js, _githooks/pre-commit, .claude/settings.json, index.html, style.css, game.js, data/scenes.json, assets/, guia-docente.html) con escena de prueba.
- FASE 1: motor mobile-first (toca para empezar, motor de escenas, botones grandes, voz + bocina, feedback con expresión, pantalla final). Probar en 360x640.
- FASE 2: arte pixel (Copechi 3 expresiones + aleteo, fondos patio/salón/celular con chat, avatar con ◀ ▶ sin restricción por género, estrellas).
- FASE 3: contenido de las 4 escenas en scenes.json.
- FASE 4: pulido: guia-docente.html (objetivo, 15 min, uso, 3 preguntas), funciona offline tras cargar, contraste y letra, README con GitHub Pages y QR. Verificar en 360x640 y 768x1024.

## Arquitectura de mapas (Fase 6)
- Flujo: "Toca para empezar" → avatar → mapa. El jugador camina por 3 mapas vistos desde arriba, habla con NPC y cada NPC abre una escena de `scenes.json` como diálogo encima del mapa. Al terminar la escena (opción con `"next": "mapa"`) se vuelve al mapa y se marca completada (estrella llena en la barra). Con las 4 escenas completadas se muestra la pantalla final (estrellas, mensaje central, "Para platicar").
- Mapas: patio (escena `juegos`, NPC Sofi), salón (`frases` con la maestra y `oficio_bombero`→…→`oficio_piloto` con el amigo) y cuarto con celular (`chat`, NPC Leo). Conexiones: patio ↔ salón (borde de arriba/abajo), salón ↔ cuarto (borde derecho/izquierdo).
- `data/maps.json`: `inicio`, `final` (id de la escena final) y `mapas[]`. Cada mapa: `id`, `nombre`, `estilo` ("exterior" o "interior"), `grid` (14 strings de 11 caracteres: `#` pared, `.` suelo, `T` árbol, `B` banca/pupitre, `E` salida en el borde), `npcs` (`id`, `x`, `y`, `sprite`, `escena`), `exits` (`x`, `y`, `a`, `spawn_x`, `spawn_y`) y `spawn`. Un tile `E` sin entrada en `exits` es error. Spawn y llegadas nunca sobre `E` ni NPC.
- Tiles 16x16 escalados x2 (32 px), una sola pantalla sin scroll (el canvas baja de escala si la pantalla es más baja). Tiles y NPC salen de matrices en `arte.js` (`TILES`, `TILES_INT`, `NPCS`).
- `mapa.js` (motor): BFS esquivando paredes y NPC, caminata de 2 frames con orientación, flecha amarilla hacia el siguiente NPC pendiente (o la salida que lleva a él), fundido de 300 ms al cambiar de mapa. `game.js` conecta mapa y escenas (`hablarConNpc`, `cerrarEpisodio`).
- Controles: tocar un tile (camina), tocar un NPC (camina a su lado y habla) y 4 flechas de 64 px (se mantienen presionadas; el botón 🎮 las oculta). Solo pointer events.
- Escenas: una opción `triste: true` debe tener `next` igual a su propia escena (reintentar). `next: "mapa"` termina el episodio.

## Offline
- `sw.js` guarda los archivos (cache-first). Al cambiar archivos, subir la versión de `CACHE` en sw.js.

## Comandos
- `node check.js`: valida scenes.json (next inexistente, escenas sin salida, inalcanzables, sin ruta a final, falta text/feedback/next).
- Activar el hook (lo hace Mario): `git config core.hooksPath _githooks`.
