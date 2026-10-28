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
- Paleta de máximo 16 colores, tonos cálidos. Sin degradados ni sombras difusas.
- Todo el arte vive en `arte.js` (sprites simétricos como mitad izquierda, se espejan; check.js valida sus tamaños). Sprites 16x16 o 32x32 como matrices en JS, dibujados en canvas o CSS, con `image-rendering: pixelated`. Sin imágenes externas ni internet.
- Fuente pixel con fallback a monospace.

## Contenido
- `data/scenes.json` es la ÚNICA fuente de textos.
- Escena: opcional `fondo` ("patio", "salon" o "celular"), `text`, opcional `voz` (lo que se lee en voz alta), `opciones` (máx. 2), `final: true` en las finales.
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

## Comandos
- `node check.js`: valida scenes.json (next inexistente, escenas sin salida, inalcanzables, sin ruta a final, falta text/feedback/next).
- Activar el hook (lo hace Mario): `git config core.hooksPath _githooks`.
