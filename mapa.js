// Motor de mapas: cuadrícula de tiles 16x16, camino por BFS, NPC, salidas con fundido y progreso.
(() => {
  const T = 32, COLS = 11, FILAS = 14, PASO_MS = 150, FUNDIDO_MS = 300;
  const SOLIDOS = new Set(['#', 'T', 'B', 'W', 'Z', 'S', 'D', 'C', 'L', 'M']);
  const DIRS = { arriba: [0, -1], abajo: [0, 1], izquierda: [-1, 0], derecha: [1, 0] };
  const $ = (id) => document.getElementById(id);

  let canvas, ctx, fondo;
  let mapas = {}, listaMapas = [], mapa = null, avatar = null;
  let completadas = new Set(), alHablar = () => {};
  let sprites = {}, sprNpc = {};
  let ruta = [], destino = null, hablarCon = null, sostenida = null;
  let alterna = false, activo = false, corriendo = false, enTransicion = false;
  const jug = { x: 0, y: 0, dir: 'abajo', mov: null };

  const celda = (x, y) => (mapa.grid[y] && mapa.grid[y][x]) || '#';
  const npcEn = (x, y) => mapa.npcs.find((n) => n.x === x && n.y === y);
  const libre = (x, y) => !SOLIDOS.has(celda(x, y)) && !npcEn(x, y);
  const pendiente = (n) => !completadas.has(n.escena);

  // Búsqueda en anchura: devuelve los pasos desde `a` hasta `b` (sin incluir a), o null.
  function bfs(a, b) {
    if (!libre(b.x, b.y)) return null;
    const previo = new Map([[a.x + ',' + a.y, null]]);
    const cola = [a];
    while (cola.length) {
      const c = cola.shift();
      if (c.x === b.x && c.y === b.y) {
        const camino = [];
        for (let p = c; p && (p.x !== a.x || p.y !== a.y); p = previo.get(p.x + ',' + p.y)) camino.unshift(p);
        return camino;
      }
      for (const [dx, dy] of Object.values(DIRS)) {
        const n = { x: c.x + dx, y: c.y + dy };
        const k = n.x + ',' + n.y;
        if (!previo.has(k) && libre(n.x, n.y)) { previo.set(k, c); cola.push(n); }
      }
    }
    return null;
  }

  // Camino más corto hasta quedar al lado de un NPC (vacío si ya está al lado).
  function caminoAVecino(ini, npc) {
    if (Math.abs(ini.x - npc.x) + Math.abs(ini.y - npc.y) === 1) return [];
    let mejor = null;
    for (const [dx, dy] of Object.values(DIRS)) {
      const c = bfs(ini, { x: npc.x + dx, y: npc.y + dy });
      if (c && c.length && (!mejor || c.length < mejor.length)) mejor = c;
    }
    return mejor;
  }

  // A dónde apunta la flecha guía: el siguiente NPC pendiente de este mapa, o la salida que lleva a otro mapa con pendientes.
  function meta() {
    const n = mapa.npcs.find(pendiente);
    if (n) return { x: n.x, y: n.y };
    const vistos = new Set([mapa.id]);
    const cola = mapa.exits.map((e) => ({ e, id: e.a }));
    while (cola.length) {
      const { e, id } = cola.shift();
      if (vistos.has(id)) continue;
      vistos.add(id);
      if (mapas[id].npcs.some(pendiente)) return { x: e.x, y: e.y };
      mapas[id].exits.forEach((x) => cola.push({ e, id: x.a }));
    }
    return null;
  }

  function prepararSprites() {
    sprites = {};
    for (const d of Object.keys(DIRS)) {
      sprites[d] = [0, 1, 2].map((p) => {
        const c = document.createElement('canvas');
        ARTE.pintarPersonaje(c, avatar, d, p);
        return c;
      });
    }
    sprNpc = {};
    for (const n of mapa.npcs) {
      const c = document.createElement('canvas');
      ARTE.pintarPersonaje(c, ARTE.NPCS[n.sprite], 'abajo', 0);
      sprNpc[n.id] = c;
    }
  }

  function pintarFondo() {
    fondo = document.createElement('canvas');
    fondo.width = COLS * T;
    fondo.height = FILAS * T;
    const f = fondo.getContext('2d');
    for (let y = 0; y < FILAS; y++) {
      for (let x = 0; x < COLS; x++) {
        const ch = celda(x, y);
        f.drawImage(ARTE.tile(ch, mapa.estilo, { x, y, izq: celda(x - 1, y) === ch, der: celda(x + 1, y) === ch }), x * T, y * T);
      }
    }
  }

  // Una estrella por cada escena (episodio) del juego: llena si ya se completó.
  function pintarProgreso() {
    const escenas = [...new Set(listaMapas.flatMap((m) => m.npcs.map((n) => n.escena)))];
    $('mapa-estrellas').replaceChildren(...escenas.map((id) => {
      const c = document.createElement('canvas');
      c.width = c.height = 16;
      ARTE.pintarEstrella(c, !completadas.has(id));
      return c;
    }));
  }

  function entrar(id, spawn, dir) {
    mapa = mapas[id];
    const s = spawn || mapa.spawn;
    Object.assign(jug, { x: s.x, y: s.y, dir: dir || 'abajo', mov: null });
    ruta = [];
    destino = null;
    hablarCon = null;
    $('mapa-nombre').textContent = mapa.nombre;
    pintarFondo();
    prepararSprites();
    pintarProgreso();
    ajustar();
  }

  // Tamaño en pantalla: x1 (tiles de 32 px) si cabe; si no, se reduce para no hacer scroll.
  function ajustar() {
    if (!canvas || !mapa) return;
    const sec = $('mapa');
    const ctl = $('controles');
    const usado = $('mapa-barra').offsetHeight + (ctl.classList.contains('oculto') ? 0 : ctl.offsetHeight) + 16;
    let e = Math.min(1, (sec.clientHeight - usado) / (FILAS * T), (sec.clientWidth - 8) / (COLS * T));
    if (e < 1) e = Math.max(0.5, Math.floor(e * 4) / 4);
    canvas.style.width = COLS * T * e + 'px';
    canvas.style.height = FILAS * T * e + 'px';
  }

  function tocarMapa(ev) {
    ev.preventDefault();
    if (!activo || enTransicion) return;
    const r = canvas.getBoundingClientRect();
    const tx = Math.floor(((ev.clientX - r.left) / r.width) * COLS);
    const ty = Math.floor(((ev.clientY - r.top) / r.height) * FILAS);
    const ini = jug.mov ? { x: jug.mov.x1, y: jug.mov.y1 } : { x: jug.x, y: jug.y };
    const npc = npcEn(tx, ty);
    if (npc) {
      if (!pendiente(npc)) return;
      const camino = caminoAVecino(ini, npc);
      if (!camino) return;
      sostenida = null;
      ruta = camino;
      destino = camino.length ? camino[camino.length - 1] : null;
      hablarCon = npc;
      return;
    }
    const camino = bfs(ini, { x: tx, y: ty });
    if (!camino || !camino.length) return;
    sostenida = null;
    hablarCon = null;
    ruta = camino;
    destino = { x: tx, y: ty };
  }

  function empezarPaso(x1, y1, ahora) {
    const dx = x1 - jug.x, dy = y1 - jug.y;
    jug.dir = dx < 0 ? 'izquierda' : dx > 0 ? 'derecha' : dy < 0 ? 'arriba' : 'abajo';
    jug.mov = { x0: jug.x, y0: jug.y, x1, y1, t0: ahora };
    alterna = !alterna;
  }

  // Salida en el borde: fundido a negro, cambio de mapa en su spawn y fundido de vuelta.
  function transicion(ex) {
    enTransicion = true;
    ruta = [];
    destino = null;
    hablarCon = null;
    sostenida = null;
    const f = $('fundido');
    f.classList.add('negro');
    setTimeout(() => {
      entrar(ex.a, { x: ex.spawn_x, y: ex.spawn_y }, jug.dir);
      f.classList.remove('negro');
      setTimeout(() => { enTransicion = false; }, FUNDIDO_MS);
    }, FUNDIDO_MS);
  }

  function actualizar(ahora) {
    if (enTransicion) return;
    if (jug.mov) {
      if (ahora - jug.mov.t0 < PASO_MS) return;
      jug.x = jug.mov.x1;
      jug.y = jug.mov.y1;
      jug.mov = null;
      const ex = mapa.exits.find((e) => e.x === jug.x && e.y === jug.y);
      if (ex) return transicion(ex);
    }
    if (sostenida) {
      const [dx, dy] = DIRS[sostenida];
      ruta = [];
      destino = null;
      hablarCon = null;
      jug.dir = sostenida;
      if (libre(jug.x + dx, jug.y + dy)) empezarPaso(jug.x + dx, jug.y + dy, ahora);
    } else if (ruta.length) {
      const n = ruta.shift();
      if (libre(n.x, n.y)) empezarPaso(n.x, n.y, ahora);
      else { ruta = []; destino = null; hablarCon = null; }
    } else {
      destino = null;
      if (hablarCon) {
        const n = hablarCon;
        hablarCon = null;
        if (Math.abs(jug.x - n.x) + Math.abs(jug.y - n.y) === 1) {
          jug.dir = n.x < jug.x ? 'izquierda' : n.x > jug.x ? 'derecha' : n.y < jug.y ? 'arriba' : 'abajo';
          dibujar(ahora);
          alHablar(n);
        }
      }
    }
  }

  // Flecha amarilla que rebota sobre la meta (siguiente NPC o salida), al doble de tamaño.
  function flecha(m, ahora) {
    ctx.save();
    ctx.translate(m.x * T + T / 2, Math.max(4, m.y * T - 22) + (Math.floor(ahora / 250) % 2) * 3);
    ctx.scale(2, 2);
    const tri = (color, ancho, alto) => {
      ctx.fillStyle = ARTE.PALETA[color];
      for (let i = 0; i < alto; i++) ctx.fillRect(-(ancho - 2 * i) / 2, i, ancho - 2 * i, 1);
    };
    tri('k', 9, 5);
    ctx.fillStyle = ARTE.PALETA.k;
    ctx.fillRect(-3.5, -1, 7, 1);
    tri('Y', 7, 4);
    ctx.restore();
  }

  function dibujar(ahora) {
    ctx.drawImage(fondo, 0, 0);
    if (destino && Math.floor(ahora / 250) % 2) {
      ctx.fillStyle = ARTE.PALETA.Y;
      const x = destino.x * T, y = destino.y * T;
      [[0, 0], [T - 8, 0], [0, T - 2], [T - 8, T - 2]].forEach(([a, b]) => ctx.fillRect(x + a, y + b, 8, 2));
      [[0, 0], [T - 2, 0], [0, T - 8], [T - 2, T - 8]].forEach(([a, b]) => ctx.fillRect(x + a, y + b, 2, 8));
    }
    let px = jug.x * T, py = jug.y * T;
    if (jug.mov) {
      const t = Math.min(1, (ahora - jug.mov.t0) / PASO_MS);
      px = Math.round((jug.mov.x0 + (jug.mov.x1 - jug.mov.x0) * t) * T);
      py = Math.round((jug.mov.y0 + (jug.mov.y1 - jug.mov.y0) * t) * T);
    }
    const cosas = mapa.npcs.map((n) => ({ c: sprNpc[n.id], x: n.x * T, y: n.y * T }));
    cosas.push({ c: sprites[jug.dir][jug.mov ? (alterna ? 1 : 2) : 0], x: px, y: py });
    cosas.sort((a, b) => a.y - b.y).forEach((o) => ctx.drawImage(o.c, o.x, o.y));
    const m = meta();
    if (m) flecha(m, ahora);
  }

  function bucle(ahora) {
    if (!activo) { corriendo = false; return; }
    actualizar(ahora);
    if (activo) dibujar(ahora);
    requestAnimationFrame(bucle);
  }
  function arrancar() {
    activo = true;
    if (!corriendo) { corriendo = true; requestAnimationFrame(bucle); }
  }

  function iniciar(datos, av, opciones) {
    listaMapas = datos.mapas;
    mapas = Object.fromEntries(datos.mapas.map((m) => [m.id, m]));
    avatar = av;
    completadas = opciones.completadas;
    alHablar = opciones.alHablar;
    canvas = $('mapa-canvas');
    ctx = canvas.getContext('2d');
    canvas.addEventListener('pointerdown', tocarMapa);
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    document.querySelectorAll('#controles .btn').forEach((b) => {
      const soltar = () => { if (sostenida === b.dataset.dir) sostenida = null; };
      b.addEventListener('pointerdown', (e) => { e.preventDefault(); if (!enTransicion) sostenida = b.dataset.dir; });
      ['pointerup', 'pointercancel', 'pointerleave'].forEach((t) => b.addEventListener(t, soltar));
      b.addEventListener('contextmenu', (e) => e.preventDefault());
    });
    $('btn-flechas').addEventListener('click', () => { $('controles').classList.toggle('oculto'); ajustar(); });
    window.addEventListener('resize', ajustar);
    // Sin gestos del navegador (scroll, zoom) sobre el mapa.
    $('mapa').addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
  }

  window.MAPA = {
    iniciar,
    abrir(id) { entrar(id); arrancar(); },      // mapa nuevo en su spawn
    reanudar() { pintarProgreso(); ajustar(); arrancar(); }, // vuelve al mapa donde estaba
    pausar() { activo = false; sostenida = null; ruta = []; destino = null; },
    ajustar,
    get jugador() { return { x: jug.x, y: jug.y, dir: jug.dir, mov: !!jug.mov, mapa: mapa && mapa.id }; },
  };
})();
