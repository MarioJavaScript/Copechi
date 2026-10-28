// Valida data/scenes.json. Uso: node check.js
const fs = require('fs');
const path = require('path');

const errores = [];
const FONDOS = ['patio', 'salon', 'celular'];
const err = (m) => errores.push(m);
let datos;
try {
  datos = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'scenes.json'), 'utf8'));
} catch (e) {
  console.error('✗ No se pudo leer data/scenes.json: ' + e.message);
  process.exit(1);
}

const escenas = datos.escenas || {};
const ids = Object.keys(escenas);
const vacio = (s) => typeof s !== 'string' || s.trim() === '';

if (!ids.length) err('No hay escenas.');
if (vacio(datos.inicio) || !escenas[datos.inicio]) err(`"inicio" apunta a una escena inexistente: ${datos.inicio}`);

for (const id of ids) {
  const e = escenas[id];
  if (vacio(e.text)) err(`[${id}] falta "text".`);
  if (e.voz !== undefined && vacio(e.voz)) err(`[${id}] "voz" está vacía.`);
  if (e.fondo !== undefined && !FONDOS.includes(e.fondo)) err(`[${id}] fondo desconocido: ${e.fondo}.`);
  const ops = e.opciones || [];
  if (e.final) {
    if (!Array.isArray(e.preguntas) || e.preguntas.length !== 3 || e.preguntas.some(vacio)) err(`[${id}] la escena final necesita 3 "preguntas" de debate.`);
    if (ops.length) err(`[${id}] es final pero tiene opciones.`);
    continue;
  }
  if (!ops.length) err(`[${id}] no tiene salida (sin opciones y no es final).`);
  if (ops.length > 2) err(`[${id}] tiene ${ops.length} opciones (máximo 2).`);
  ops.forEach((o, i) => {
    const w = `[${id}] opción ${i + 1}`;
    if (vacio(o.text)) err(`${w}: falta "text".`);
    if (vacio(o.icono)) err(`${w}: falta "icono".`);
    if (vacio(o.feedback)) err(`${w}: falta "feedback".`);
    if (vacio(o.next)) err(`${w}: falta "next".`);
    else if (!escenas[o.next]) err(`${w}: "next" apunta a una escena inexistente (${o.next}).`);
  });
}

// Mapas (validación básica de 6A; la completa llega en 6C)
try {
  const mp = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'maps.json'), 'utf8'));
  const SOL = '#TB';
  for (const m of mp.mapas || []) {
    if (m.grid.length !== 14 || m.grid.some((f) => f.length !== 11)) err(`[mapa ${m.id}] la cuadrícula debe ser de 11 columnas x 14 filas.`);
    const en = (x, y) => (m.grid[y] || '')[x];
    if (!en(m.spawn.x, m.spawn.y) || SOL.includes(en(m.spawn.x, m.spawn.y))) err(`[mapa ${m.id}] el spawn está en una pared o fuera del mapa.`);
    for (const n of m.npcs) {
      if (!en(n.x, n.y) || SOL.includes(en(n.x, n.y))) err(`[mapa ${m.id}] el NPC ${n.id} está en una pared o fuera del mapa.`);
      if (!escenas[n.escena]) err(`[mapa ${m.id}] el NPC ${n.id} apunta a una escena inexistente (${n.escena}).`);
    }
  }
  if (!(mp.mapas || []).some((m) => m.id === mp.inicio)) err('maps.json: "inicio" apunta a un mapa inexistente.');
} catch (e) { err('No se pudo leer data/maps.json: ' + e.message); }

// Sprites: dimensiones de las matrices en arte.js (mitades de 16 u 8 columnas)
global.window = { matchMedia: null };
try {
  require('./arte.js');
  const A = window.ARTE;
  const mitad = (nombre, filas, ancho, alto) => {
    for (const y in filas) {
      if (filas[y].length !== ancho) err(`arte.js: ${nombre} fila ${y} mide ${filas[y].length}, debe medir ${ancho}.`);
      if (+y >= alto) err(`arte.js: ${nombre} fila ${y} fuera del sprite.`);
    }
  };
  [['alasA', A.COP.alasA], ['alasB', A.COP.alasB], ['cuerpo', A.COP.cuerpo], ...Object.entries(A.COP.cara).map(([k, v]) => ['cara.' + k, v])]
    .forEach(([n, f]) => mitad('Copechi ' + n, f, 16, 32));
  mitad('avatar cara', A.AV.cara, 8, 16); mitad('avatar caraLado', A.AV.caraLado, 16, 16);
  for (const [t, d] of Object.entries(A.TILES)) mitad('tile ' + t, d.filas, 8, 16);
  mitad('estrella', A.ESTRELLA, 8, 16); mitad('avatar base', A.AV.base, 8, 16);
  for (const [k, f] of Object.entries(A.AV.pelo)) mitad('pelo ' + k, f, 8, 16);
  for (const [k, f] of Object.entries(A.AV.ropa)) mitad('ropa ' + k, f, 8, 16);
  const usados = new Set(Object.values(A.PALETA));
  if (usados.size > 16) err('La paleta tiene más de 16 colores.');
} catch (e) { err('arte.js no carga: ' + e.message); }

// Alcanzables desde el inicio
const vistas = new Set();
const pila = escenas[datos.inicio] ? [datos.inicio] : [];
while (pila.length) {
  const id = pila.pop();
  if (vistas.has(id)) continue;
  vistas.add(id);
  for (const o of escenas[id].opciones || []) if (escenas[o.next]) pila.push(o.next);
}
for (const id of ids) if (!vistas.has(id)) err(`[${id}] es inalcanzable desde "${datos.inicio}".`);

// Escenas que llegan a un final (recorrido inverso desde los finales)
const llegan = new Set(ids.filter((id) => escenas[id].final));
let cambio = true;
while (cambio) {
  cambio = false;
  for (const id of ids) {
    if (llegan.has(id)) continue;
    if ((escenas[id].opciones || []).some((o) => llegan.has(o.next))) { llegan.add(id); cambio = true; }
  }
}
for (const id of ids) if (!llegan.has(id)) err(`[${id}] no puede llegar a ningún final.`);
if (!ids.some((id) => escenas[id].final)) err('No hay ninguna escena final.');

if (errores.length) {
  console.error(`✗ check.js: ${errores.length} problema(s)\n` + errores.map((m) => '  - ' + m).join('\n'));
  process.exit(1);
}
console.log(`✓ check.js: ${ids.length} escenas OK (inicio: ${datos.inicio}).`);
