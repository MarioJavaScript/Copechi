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
let mp = { mapas: [] };
try { mp = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'maps.json'), 'utf8')); }
catch (e) { err('No se pudo leer data/maps.json: ' + e.message); }
if (!escenas[mp.final] || !escenas[mp.final].final) err('maps.json: "final" debe ser una escena con "final": true.');

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
    if (o.triste && o.next !== id) err(`${w}: una opción triste debe volver a la misma escena (next: "${id}") para reintentar.`);
    if (vacio(o.next)) err(`${w}: falta "next".`);
    else if (o.next !== 'mapa' && !escenas[o.next]) err(`${w}: "next" apunta a una escena inexistente (${o.next}).`);
  });
}

// Mapas
{
  const SOL = '#TBWZSDCLM';
  const CONOCIDOS = '#.TBEWZSDaCLM';
  const mapas = mp.mapas || [];
  const porId = Object.fromEntries(mapas.map((m) => [m.id, m]));
  if (!porId[mp.inicio]) err('maps.json: "inicio" apunta a un mapa inexistente.');
  if (new Set(mapas.map((m) => m.id)).size !== mapas.length) err('maps.json: hay ids de mapa repetidos.');
  const en = (m, x, y) => (m.grid[y] || '')[x];
  const dentro = (m, x, y) => en(m, x, y) !== undefined;
  const solido = (m, x, y) => !dentro(m, x, y) || SOL.includes(en(m, x, y));
  const npcEn = (m, x, y) => m.npcs.find((n) => n.x === x && n.y === y);

  for (const m of mapas) {
    const w = `[mapa ${m.id}]`;
    if (m.grid.length !== 14 || m.grid.some((f) => f.length !== 11)) { err(`${w} la cuadrícula debe ser de 11 columnas x 14 filas.`); continue; }
    for (const f of m.grid) for (const ch of f) if (!CONOCIDOS.includes(ch)) err(`${w} la cuadrícula usa el tile desconocido "${ch}".`);
    if (solido(m, m.spawn.x, m.spawn.y)) err(`${w} el spawn está en una pared o fuera del mapa.`);
    else if (en(m, m.spawn.x, m.spawn.y) === 'E') err(`${w} el spawn está sobre una salida (provocaría un bucle).`);

    m.npcs.forEach((n, i) => {
      if (solido(m, n.x, n.y)) err(`${w} el NPC ${n.id} está dentro de una pared o fuera del mapa.`);
      else if (en(m, n.x, n.y) === 'E') err(`${w} el NPC ${n.id} está sobre una salida.`);
      if (m.npcs.findIndex((o) => o.x === n.x && o.y === n.y) !== i) err(`${w} el NPC ${n.id} comparte tile con otro NPC.`);
      if (!escenas[n.escena]) err(`${w} el NPC ${n.id} apunta a una escena inexistente (${n.escena}).`);
      else if (escenas[n.escena].final) err(`${w} el NPC ${n.id} apunta a la escena final.`);
    });

    const salidas = new Set();
    m.exits.forEach((e) => {
      const q = `${w} salida (${e.x},${e.y})`;
      salidas.add(e.x + ',' + e.y);
      if (!dentro(m, e.x, e.y) || en(m, e.x, e.y) !== 'E') err(`${q}: debe estar sobre un tile E del borde (no en una pared).`);
      const d = porId[e.a];
      if (!d) return err(`${q}: apunta a un mapa inexistente (${e.a}).`);
      if (solido(d, e.spawn_x, e.spawn_y)) err(`${q}: el spawn de destino está en una pared o fuera de ${e.a}.`);
      else if (en(d, e.spawn_x, e.spawn_y) === 'E') err(`${q}: el spawn de destino está sobre una salida de ${e.a}.`);
      else if (npcEn(d, e.spawn_x, e.spawn_y)) err(`${q}: el spawn de destino está sobre un NPC de ${e.a}.`);
    });
    for (let y = 0; y < 14; y++) for (let x = 0; x < 11; x++) {
      if (en(m, x, y) === 'E' && !salidas.has(x + ',' + y)) err(`${w} el tile E (${x},${y}) no tiene salida en "exits".`);
    }

    // Tiles alcanzables desde el spawn y desde cada punto de llegada
    const entradas = [m.spawn, ...mapas.flatMap((o) => (o.exits || []).filter((e) => e.a === m.id).map((e) => ({ x: e.spawn_x, y: e.spawn_y })))];
    const alcanzados = (ini) => {
      const vis = new Set();
      const cola = solido(m, ini.x, ini.y) ? [] : [[ini.x, ini.y]];
      while (cola.length) {
        const [x, y] = cola.pop();
        if (vis.has(x + ',' + y) || solido(m, x, y) || npcEn(m, x, y)) continue;
        vis.add(x + ',' + y);
        cola.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
      }
      return vis;
    };
    const base = alcanzados(m.spawn);
    for (let y = 0; y < 14; y++) for (let x = 0; x < 11; x++) {
      if (!solido(m, x, y) && !npcEn(m, x, y) && !base.has(x + ',' + y)) err(`${w} el tile (${x},${y}) es inalcanzable desde el spawn.`);
    }
    entradas.forEach((e) => { if (!solido(m, e.x, e.y) && !base.has(e.x + ',' + e.y)) err(`${w} el punto de llegada (${e.x},${e.y}) queda aislado del resto del mapa.`); });
    m.npcs.forEach((n) => {
      const vecino = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => base.has((n.x + dx) + ',' + (n.y + dy)));
      if (!vecino) err(`${w} el NPC ${n.id} no tiene ningún tile libre alcanzable a su lado.`);
    });
  }

  // Todos los mapas deben poder visitarse desde el inicio
  const vistos = new Set();
  const cola = porId[mp.inicio] ? [mp.inicio] : [];
  while (cola.length) {
    const id = cola.pop();
    if (vistos.has(id) || !porId[id]) continue;
    vistos.add(id);
    porId[id].exits.forEach((e) => cola.push(e.a));
  }
  for (const m of mapas) if (!vistos.has(m.id)) err(`[mapa ${m.id}] no se puede llegar desde "${mp.inicio}".`);
}

// Sprites: dimensiones de las matrices en arte.js (mitades de 16 u 8 columnas)
global.window = { matchMedia: null };
try {
  require('./arte.js');
  const A = window.ARTE;
  const validos = new Set([...Object.keys(A.PALETA), '.', 'S', 'H', 'C', 'P']);
  const mitad = (nombre, filas, ancho, alto) => {
    for (const y in filas) {
      for (const ch of filas[y]) if (!validos.has(ch)) err(`arte.js: ${nombre} fila ${y} usa "${ch}", que no está en la paleta.`);
      if (filas[y].length !== ancho) err(`arte.js: ${nombre} fila ${y} mide ${filas[y].length}, debe medir ${ancho}.`);
      if (+y >= alto) err(`arte.js: ${nombre} fila ${y} fuera del sprite.`);
    }
  };
  [['alasA', A.COP.alasA], ['alasB', A.COP.alasB], ['cuerpo', A.COP.cuerpo], ...Object.entries(A.COP.cara).map(([k, v]) => ['cara.' + k, v])]
    .forEach(([n, f]) => mitad('Copechi ' + n, f, 16, 32));
  mitad('personaje base', A.PJ.base, 16, 32);
  for (const [e, f] of Object.entries(A.PJ.cara)) mitad('personaje cara ' + e, f, 16, 32);
  for (const [n, f] of Object.entries(A.PJ.pelo)) mitad('pelo ' + n, f, 16, 32);
  for (const [n, f] of Object.entries(A.PJ.ropa)) mitad('ropa ' + n, f, 16, 32);
  for (const [n, f] of Object.entries(A.ICONOS_MATRIZ)) mitad('icono ' + n, f, 8, 16);
  A.CHISPA.forEach((f, i) => mitad('chispa ' + i, f, 7, 7)); A.FLOR.forEach((f, i) => mitad('flor ' + i, f, 7, 9));
  for (const [l, f] of Object.entries(A.FUENTE)) { if (f.length !== 7 || f.some((r) => r.length !== 5)) err('arte.js: la letra ' + l + ' debe medir 5x7.'); }
  mitad('estrella', A.ESTRELLA, 8, 16);
  const usados = new Set(Object.values(A.PALETA));
  if (usados.size > 16) err('La paleta tiene más de 16 colores.');
} catch (e) { err('arte.js no carga: ' + e.message); }

// Alcanzables: desde los NPC (y la escena final del juego)
const vistas = new Set();
const pila = [mp.final, ...(mp.mapas || []).flatMap((m) => m.npcs.map((n) => n.escena))].filter((id) => escenas[id]);
while (pila.length) {
  const id = pila.pop();
  if (vistas.has(id)) continue;
  vistas.add(id);
  for (const o of escenas[id].opciones || []) if (escenas[o.next]) pila.push(o.next);
}
for (const id of ids) if (!vistas.has(id)) err(`[${id}] es inalcanzable: ningún NPC la dispara.`);

// Escenas que llegan a un final (recorrido inverso desde los finales)
const llegan = new Set(ids.filter((id) => escenas[id].final || (escenas[id].opciones || []).some((o) => o.next === 'mapa')));
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
console.log(`✓ check.js: ${ids.length} escenas OK.`);
