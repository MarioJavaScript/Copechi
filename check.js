// Valida data/scenes.json. Uso: node check.js
const fs = require('fs');
const path = require('path');

const errores = [];
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
  const ops = e.opciones || [];
  if (e.final) {
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
