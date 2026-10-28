// Motor de mapas: cuadrícula de tiles 16x16, camino por BFS, toques y flechas.
(() => {
  const T = 16, COLS = 11, FILAS = 14, PASO_MS = 150;
  const SOLIDOS = new Set(['#', 'T', 'B']);
  const DIRS = { arriba: [0, -1], abajo: [0, 1], izquierda: [-1, 0], derecha: [1, 0] };
  const $ = (id) => document.getElementById(id);

  let canvas, ctx, fondo;
  let mapas = {}, mapa = null, avatar = null;
  let sprites = {}, sprNpc = {};
  let ruta = [], destino = null, sostenida = null, alterna = false, activo = false;
  const jug = { x: 0, y: 0, dir: 'abajo', mov: null };

  const celda = (x, y) => (mapa.grid[y] && mapa.grid[y][x]) || '#';
  const npcEn = (x, y) => mapa.npcs.find((n) => n.x === x && n.y === y);
  const libre = (x, y) => !SOLIDOS.has(celda(x, y)) && !npcEn(x, y);

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

  function prepararSprites() {
    sprites = {};
    for (const d of Object.keys(DIRS)) {
      sprites[d] = [0, 1, 2].map((p) => {
        const c = document.createElement('canvas');
        c.width = c.height = T;
        ARTE.pintarAvatar(c, avatar, d, p);
        return c;
      });
    }
    sprNpc = {};
    for (const n of mapa.npcs) {
      const c = document.createElement('canvas');
      c.width = c.height = T;
      ARTE.pintarAvatar(c, ARTE.NPCS[n.sprite], 'abajo', 0);
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
        let ch = celda(x, y);
        if (ch === '.' && (x * 31 + y * 17) % 7 === 0) ch = 'f';
        f.drawImage(ARTE.tile(ch), x * T, y * T);
      }
    }
  }

  function entrar(id, spawn) {
    mapa = mapas[id];
    const s = spawn || mapa.spawn;
    Object.assign(jug, { x: s.x, y: s.y, dir: 'abajo', mov: null });
    ruta = [];
    destino = null;
    $('mapa-nombre').textContent = mapa.nombre;
    pintarFondo();
    prepararSprites();
    ajustar();
  }

  // Tamaño en pantalla: x2 (32 px por tile) si cabe; si no, se reduce para no hacer scroll.
  function ajustar() {
    if (!canvas || !mapa) return;
    const sec = $('mapa');
    const ctl = $('controles');
    const usado = $('mapa-barra').offsetHeight + (ctl.classList.contains('oculto') ? 0 : ctl.offsetHeight) + 16;
    let e = Math.min(2, (sec.clientHeight - usado) / (FILAS * T), (sec.clientWidth - 8) / (COLS * T));
    if (e < 2) e = Math.max(1, Math.floor(e * 4) / 4);
    canvas.style.width = COLS * T * e + 'px';
    canvas.style.height = FILAS * T * e + 'px';
  }

  function tocarMapa(ev) {
    ev.preventDefault();
    if (!activo) return;
    const r = canvas.getBoundingClientRect();
    const tx = Math.floor(((ev.clientX - r.left) / r.width) * COLS);
    const ty = Math.floor(((ev.clientY - r.top) / r.height) * FILAS);
    const ini = jug.mov ? { x: jug.mov.x1, y: jug.mov.y1 } : { x: jug.x, y: jug.y };
    const camino = bfs(ini, { x: tx, y: ty });
    if (!camino || !camino.length) return;
    sostenida = null;
    ruta = camino;
    destino = { x: tx, y: ty };
  }

  function empezarPaso(x1, y1, ahora) {
    const dx = x1 - jug.x, dy = y1 - jug.y;
    jug.dir = dx < 0 ? 'izquierda' : dx > 0 ? 'derecha' : dy < 0 ? 'arriba' : 'abajo';
    jug.mov = { x0: jug.x, y0: jug.y, x1, y1, t0: ahora };
    alterna = !alterna;
  }

  function actualizar(ahora) {
    if (jug.mov) {
      if (ahora - jug.mov.t0 < PASO_MS) return;
      jug.x = jug.mov.x1;
      jug.y = jug.mov.y1;
      jug.mov = null;
    }
    if (sostenida) {
      const [dx, dy] = DIRS[sostenida];
      ruta = [];
      destino = null;
      jug.dir = sostenida;
      if (libre(jug.x + dx, jug.y + dy)) empezarPaso(jug.x + dx, jug.y + dy, ahora);
    } else if (ruta.length) {
      const n = ruta.shift();
      if (libre(n.x, n.y)) empezarPaso(n.x, n.y, ahora);
      else { ruta = []; destino = null; }
    } else destino = null;
  }

  function dibujar(ahora) {
    ctx.drawImage(fondo, 0, 0);
    if (destino && Math.floor(ahora / 250) % 2) {
      ctx.fillStyle = ARTE.PALETA.Y;
      const x = destino.x * T, y = destino.y * T;
      [[0, 0], [T - 4, 0], [0, T - 1], [T - 4, T - 1]].forEach(([a, b]) => ctx.fillRect(x + a, y + b, 4, 1));
      [[0, 0], [T - 1, 0], [0, T - 4], [T - 1, T - 4]].forEach(([a, b]) => ctx.fillRect(x + a, y + b, 1, 4));
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
  }

  function bucle(ahora) {
    if (!activo) return;
    actualizar(ahora);
    dibujar(ahora);
    requestAnimationFrame(bucle);
  }

  function iniciar(datos, av) {
    mapas = Object.fromEntries(datos.mapas.map((m) => [m.id, m]));
    avatar = av;
    canvas = $('mapa-canvas');
    ctx = canvas.getContext('2d');
    canvas.addEventListener('pointerdown', tocarMapa);
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    document.querySelectorAll('#controles .btn').forEach((b) => {
      const soltar = () => { if (sostenida === b.dataset.dir) sostenida = null; };
      b.addEventListener('pointerdown', (e) => { e.preventDefault(); sostenida = b.dataset.dir; });
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
    abrir(id) {
      const yaCorre = activo;
      activo = true;
      entrar(id);
      if (!yaCorre) requestAnimationFrame(bucle);
    },
    pausar() { activo = false; sostenida = null; },
    ajustar,
    get jugador() { return { x: jug.x, y: jug.y, dir: jug.dir, mov: !!jug.mov }; },
  };
})();
