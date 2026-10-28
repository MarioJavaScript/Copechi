// Arte pixel de Misión Copechi: paleta de 16 colores, sprites como matrices y fondos de 72x40.
// Los sprites simétricos se guardan como MITAD izquierda y se espejan al dibujar.
(() => {
  const PALETA = {
    k: '#35203b', w: '#ffffff', y: '#ffd93b', Y: '#ff9f1c', o: '#a8531e', r: '#ff5e5b',
    p: '#ffa6c1', g: '#5ed04f', G: '#2a9d4b', b: '#8ad8ff', B: '#2e86de',
    t: '#ffd2a0', T: '#c98550', h: '#7a4a2a', u: '#8e5bd9', e: '#19b8a6',
  };

  // Dibuja capas de media-fila (objeto {fila: 'cadena'}) espejadas en un canvas de `ancho` px.
  function capaEspejo(ctx, ancho, filas, sustituir) {
    for (const y in filas) {
      const fila = filas[y];
      for (let x = 0; x < fila.length; x++) {
        let c = fila[x];
        if (c === '.') continue;
        if (sustituir && sustituir[c]) c = sustituir[c];
        ctx.fillStyle = PALETA[c];
        ctx.fillRect(x, +y, 1, 1);
        ctx.fillRect(ancho - 1 - x, +y, 1, 1);
      }
    }
  }

  // Igual que capaEspejo pero sin espejar (filas completas).
  function capa(ctx, filas, sustituir) {
    for (const y in filas) {
      const fila = filas[y];
      for (let x = 0; x < fila.length; x++) {
        let c = fila[x];
        if (c === '.') continue;
        if (sustituir && sustituir[c]) c = sustituir[c];
        ctx.fillStyle = PALETA[c];
        ctx.fillRect(x, +y, 1, 1);
      }
    }
  }

  // ---------- La Copechi (32x32, mitad izquierda de 16 columnas) ----------
  const COP = {
    alasA: { // alas arriba
      5: '..kk............', 6: '.kBBk...........', 7: '.kbbBk..........', 8: '.kbbbBk.........',
      9: '..kbbbBk........', 10: '..kbbbbBk.......', 11: '...kbbbbBk......', 12: '....kbbbbBk.....',
      13: '.....kbbbbk.....', 14: '......kbbbk.....', 15: '.......kbbk.....', 16: '........kbk.....',
      17: '.........kk.....',
    },
    alasB: { // alas abiertas hacia abajo
      13: '.kkkkkkkkk......', 14: 'kBbbbbbbbbk.....', 15: 'kBbbbbbbbbbk....', 16: 'kBbbbbbbbbbk....',
      17: '.kBbbbbbbbk.....', 18: '..kkkbbbbk......', 19: '.....kkkk.......',
    },
    cuerpo: {
      3: '.......yy.......', 4: '.........k......', 5: '..........k.....', 6: '...........k....',
      7: '...........kkkkk', 8: '.........kkggggg', 9: '........kggggggg', 10: '........kggggggg',
      11: '........kggggggg', 12: '........kggggggg', 13: '........kggggggg', 14: '.........kgggggg',
      15: '..........kkgggg', 16: '............kkkk',
      17: '...........kyyyy', 18: '...........kyyyy', 19: '...........kyyyy',
      20: '............kggg', 21: '............kyyy', 22: '............kggg', 23: '............kggg',
      24: '............kyyy', 25: '............kggg', 26: '............kggg', 27: '............kyyy',
      28: '.............kgg', 29: '..............kk',
    },
    cara: {
      neutral: {
        10: '.........wwww...', 11: '.........wkkw...', 12: '.........wkkw...', 13: '.........wwww...',
        14: '..............kk',
      },
      contenta: {
        10: '..........kk....', 11: '.........k..k...', 13: '.........pp.....',
        14: '...........k....', 15: '............kkkk',
      },
      triste: {
        8: '...........kk...', 9: '.........kk.....', 10: '.........wwww...', 11: '.........wwww...',
        12: '.........wkkw...', 13: '.........wkkw...', 14: '.........BB..kkk', 15: '............k...',
      },
    },
  };

  function pintarCopechi(canvas, expr, frame) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 32, 32);
    capaEspejo(ctx, 32, frame ? COP.alasB : COP.alasA);
    capaEspejo(ctx, 32, COP.cuerpo);
    capaEspejo(ctx, 32, COP.cara[expr] || COP.cara.neutral);
  }

  // ---------- Avatar (16x16, mitad de 8 columnas) ----------
  // S = piel, H = pelo, C = color de ropa (se sustituyen al dibujar)
  const AV = {
    base: {
      2: '..kSSSSS', 3: '.kSSSSSS', 4: '.kSSSSSS', 5: '.kSSSSSS', 6: '.kSSSSSS', 7: '..kSSSSS',
      8: '...kkkkk',
    },
    cara: { // de frente (mitad), por expresión
      neutral: { 4: '....k...', 5: '..p.k...', 6: '.......k' },
      contenta: { 4: '....k...', 5: '..p.k...', 6: '.....k..', 7: '......kk' },
      triste: { 4: '....k...', 5: '....k...', 6: '...b..kk', 7: '.....k..' },
    },
    caraLado: { 4: '...k..k.........', 5: '..pk..k.........', 6: '...kk...........' }, // mirando a la izquierda (completa)
    pelo: {
      corto: { 0: '...kkkkk', 1: '..kHHHHH', 2: '.kHHHHHH', 3: '.kHHHHHH', 4: '.kH.....' },
      largo: {
        0: '...kkkkk', 1: '..kHHHHH', 2: '.kHHHHHH', 3: '.kHHHHHH', 4: '.kHH....', 5: '.kHH....',
        6: '.kHH....', 7: '.kHH....', 8: '.kHH....', 9: '.kHH....', 10: '.kHH....',
      },
      chongos: { 0: '.kHHkkkk', 1: 'kHHHHHHH', 2: '.kHHHHHH', 3: '.kHHHHHH', 4: '.kH.....' },
    },
    ropa: {
      camiseta: {
        9: '..kCCCCC', 10: '.kCCCCCC', 11: '.kCCCCCC', 12: '..kCCCCC',
        13: '..kooooo', 14: '..kooook', 15: '..kkkkk.',
      },
      vestido: {
        9: '..kCCCCC', 10: '..kCCCCC', 11: '.kCCCCCC', 12: '.kCCCCCC', 13: 'kCCCCCCC',
        14: 'kkkkkkkk', 15: '...kSk..',
      },
      overol: {
        9: '..kwCwww', 10: '..kwCCCC', 11: '.kwwCCCC', 12: '..kwCCCC',
        13: '..kCCCCC', 14: '..kCCCCk', 15: '..kkkkk.',
      },
    },
  };

  const PIEL = ['t', 'T', 'h'];
  const PELO = [
    { estilo: 'corto', color: 'h' }, { estilo: 'largo', color: 'o' }, { estilo: 'chongos', color: 'Y' },
    { estilo: 'corto', color: 'k' }, { estilo: 'largo', color: 'h' }, { estilo: 'chongos', color: 'k' },
  ];
  const ROPA = [
    { estilo: 'camiseta', color: 'r' }, { estilo: 'vestido', color: 'B' }, { estilo: 'overol', color: 'g' },
    { estilo: 'vestido', color: 'y' }, { estilo: 'camiseta', color: 'p' }, { estilo: 'overol', color: 'u' },
  ];

  // dir: 'abajo' | 'arriba' | 'izquierda' | 'derecha'. paso: 0 quieto, 1 y 2 alternan el pie levantado al caminar.
  function pintarAvatar(canvas, a, dir = 'abajo', paso = 0, expr = 'neutral') {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 16, 16);
    const pelo = PELO[a.pelo], ropa = ROPA[a.ropa];
    const sust = { S: PIEL[a.piel], H: pelo.color, C: ropa.color };
    ctx.save();
    if (dir === 'derecha') { ctx.translate(16, 0); ctx.scale(-1, 1); }
    capaEspejo(ctx, 16, AV.base, dir === 'arriba' ? { ...sust, S: pelo.color } : sust);
    if (dir === 'abajo') capaEspejo(ctx, 16, AV.cara[expr] || AV.cara.neutral, sust);
    else if (dir !== 'arriba') capa(ctx, AV.caraLado, sust);
    capaEspejo(ctx, 16, AV.ropa[ropa.estilo], sust);
    capaEspejo(ctx, 16, AV.pelo[pelo.estilo], sust);
    ctx.restore();
    if (paso === 1) ctx.clearRect(2, 15, 5, 1);
    if (paso === 2) ctx.clearRect(9, 15, 5, 1);
  }

  // Personajes (NPC): mismas piezas del avatar.
  const NPCS = {
    sofi: { piel: 1, pelo: 1, ropa: 3 },
    leo: { piel: 0, pelo: 3, ropa: 2 },
    maestra: { piel: 2, pelo: 4, ropa: 1 },
    amigo: { piel: 0, pelo: 0, ropa: 0 },
  };

  // ---------- Tiles del mapa (16x16, mitad izquierda de 8 columnas) ----------
  const TILES = {
    '.': { fondo: 'g', filas: { 10: '...G....', 11: '...G....' } },
    f: { fondo: 'g', filas: { 6: '.....w..', 7: '....wyw.', 8: '.....w..' } },
    '#': { fondo: 'G', filas: { 2: '.gg...g.', 5: '...gg...', 7: 'g....gg.', 10: '.gg..g..', 13: '....gg..', 15: 'kkkkkkkk' } },
    T: {
      fondo: 'g',
      filas: {
        1: '....kkkk', 2: '..kkGGGG', 3: '.kGGGGgg', 4: 'kGGgGGGG', 5: 'kGGGGGgG', 6: 'kGgGGGGG',
        7: 'kGGGGGgg', 8: '.kGGGGGG', 9: '..kkGGGG', 10: '....kkkk', 11: '.....koo', 12: '.....koo',
        13: '.....koo', 14: '....kkkk',
      },
    },
    B: {
      fondo: 'g',
      filas: { 5: '.kkkkkkk', 6: '.kYYYYYY', 7: '.koooooo', 8: '.kkkkkkk', 9: '.kk.....', 10: '.kk.....' },
    },
    E: { fondo: 'y', filas: { 0: 'YYYYYYYY', 7: '...YYYYY', 8: '...YYYYY', 15: 'YYYYYYYY' } },
  };
  // Interior (salón): piso de madera, pared de ladrillo y pupitres. Lo demás se hereda de TILES.
  const TILES_INT = {
    '.': { fondo: 'y', filas: { 7: 'YYYYYYYY', 15: 'YYYYYYYY' } },
    '#': {
      fondo: 'o',
      filas: {
        0: 'kkkkkkkk', 1: '......k.', 2: '......k.', 3: '......k.', 4: '......k.', 5: '......k.', 6: '......k.', 7: '......k.',
        8: 'kkkkkkkk', 9: '..k.....', 10: '..k.....', 11: '..k.....', 12: '..k.....', 13: '..k.....', 14: '..k.....', 15: '..k.....',
      },
    },
    B: {
      fondo: 'y',
      filas: { 4: '.kkkkkkk', 5: '.kYYYYYY', 6: '.kYYYYYY', 7: '.kkkkkkk', 8: '.ko.....', 9: '.ko.....', 10: 'kkk.....' },
    },
  };
  const tilesCache = {};
  function tile(clave, estilo) {
    const interior = estilo === 'interior';
    const def = (interior && TILES_INT[clave]) || TILES[clave] || TILES['.'];
    const k = (interior && TILES_INT[clave] ? 'i' : '') + ((interior && TILES_INT[clave]) || TILES[clave] ? clave : '.');
    if (!tilesCache[k]) {
      const c = document.createElement('canvas');
      c.width = c.height = 16;
      const ctx = c.getContext('2d');
      ctx.fillStyle = PALETA[def.fondo];
      ctx.fillRect(0, 0, 16, 16);
      capaEspejo(ctx, 16, def.filas);
      tilesCache[k] = c;
    }
    return tilesCache[k];
  }

  // ---------- Estrella (16x16) ----------
  const ESTRELLA = {
    0: '.......k', 1: '......kY', 2: '.....kYY', 3: 'kkkkkYYY', 4: '.kYYwYYY', 5: '..kYYYYY',
    6: '...kYYYY', 7: '....kYYY', 8: '...kYYYY', 9: '..kYYkkk', 10: '..kYk...', 11: '.kYk....', 12: '.kk.....',
  };
  function pintarEstrella(canvas, vacia) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 16, 16);
    capaEspejo(ctx, 16, ESTRELLA, vacia ? { Y: 'u', w: 'u' } : null);
  }

  // ---------- Fondos (72x40) ----------
  function R(ctx, c, x, y, w, h) { ctx.fillStyle = PALETA[c]; ctx.fillRect(x, y, w, h); }
  const FONDOS = {
    patio(ctx) {
      R(ctx, 'b', 0, 0, 72, 26);
      R(ctx, 'Y', 56, 3, 8, 8); R(ctx, 'y', 57, 4, 6, 6);
      R(ctx, 'w', 8, 5, 12, 3); R(ctx, 'w', 11, 3, 7, 3); R(ctx, 'w', 34, 9, 10, 3); R(ctx, 'w', 37, 7, 5, 3);
      R(ctx, 'g', 0, 26, 72, 14);
      R(ctx, 'G', 0, 26, 72, 1);
      for (let x = 3; x < 72; x += 9) R(ctx, 'G', x, 31 + (x % 3) * 3, 3, 1);
      // árbol
      R(ctx, 'o', 8, 14, 4, 14); R(ctx, 'G', 3, 6, 14, 10); R(ctx, 'g', 5, 8, 10, 6);
      // cancha y balón
      R(ctx, 'y', 26, 30, 36, 8); R(ctx, 'w', 43, 30, 1, 8);
      R(ctx, 'w', 52, 33, 5, 5); R(ctx, 'k', 53, 34, 3, 3); R(ctx, 'w', 54, 35, 1, 1);
      // portería
      R(ctx, 'w', 62, 22, 8, 1); R(ctx, 'w', 62, 22, 1, 10); R(ctx, 'w', 69, 22, 1, 10);
    },
    salon(ctx) {
      R(ctx, 'p', 0, 0, 72, 30);
      R(ctx, 'y', 0, 30, 72, 10); R(ctx, 'o', 0, 30, 72, 1);
      // pizarrón
      R(ctx, 'o', 14, 5, 44, 20); R(ctx, 'G', 16, 7, 40, 16);
      R(ctx, 'w', 20, 11, 14, 1); R(ctx, 'w', 20, 15, 22, 1); R(ctx, 'y', 46, 18, 5, 1);
      // ventana
      R(ctx, 'B', 2, 6, 9, 11); R(ctx, 'b', 3, 7, 7, 9); R(ctx, 'B', 6, 7, 1, 9);
      // pupitres
      R(ctx, 'Y', 6, 32, 14, 3); R(ctx, 'o', 8, 35, 2, 4); R(ctx, 'o', 16, 35, 2, 4);
      R(ctx, 'Y', 50, 32, 14, 3); R(ctx, 'o', 52, 35, 2, 4); R(ctx, 'o', 60, 35, 2, 4);
    },
    celular(ctx) {
      R(ctx, 'e', 0, 0, 72, 40);
      R(ctx, 'Y', 0, 33, 72, 7); R(ctx, 'o', 0, 33, 72, 1);
      // teléfono a la izquierda (La Copechi va al centro y el avatar abajo)
      R(ctx, 'k', 3, 0, 22, 31); R(ctx, 'w', 5, 2, 18, 27); R(ctx, 'B', 5, 2, 18, 4);
      R(ctx, 'b', 6, 8, 12, 6); R(ctx, 'k', 8, 10, 8, 1); R(ctx, 'k', 8, 12, 5, 1);
      R(ctx, 'y', 10, 16, 12, 6); R(ctx, 'k', 12, 18, 8, 1); R(ctx, 'k', 12, 20, 4, 1);
      R(ctx, 'r', 6, 24, 12, 4); R(ctx, 'w', 8, 25, 8, 1);
    },
  };
  function pintarFondo(canvas, nombre) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 72, 40);
    (FONDOS[nombre] || FONDOS.patio)(ctx);
  }

  // ---------- Pantalla de inicio: título pixel, cielo en bandas, nubes, chispas y flores ----------
  const FUENTE = { // letras de 5x7
    A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
    C: ['.####', '#....', '#....', '#....', '#....', '#....', '.####'],
    E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
    H: ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
    I: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '#####'],
    M: ['#...#', '##.##', '#.#.#', '#.#.#', '#...#', '#...#', '#...#'],
    N: ['#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#', '#...#'],
    O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
    P: ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'],
    S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
  };
  const TITULO = [{ t: 'MISIÓN', y: 4 }, { t: 'COPECHI', y: 15 }];
  const COLORES_TITULO = ['r', 'y', 'g', 'e', 'Y', 'p'];
  const TITULO_W = 46, TITULO_H = 25;

  // Título en letras pixel de colores: relleno, contorno oscuro y sombra sólida morada desplazada.
  function pintarTitulo(canvas) {
    canvas.width = TITULO_W;
    canvas.height = TITULO_H;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, TITULO_W, TITULO_H);
    const px = new Map(); // "x,y" -> color de relleno
    let n = 0;
    TITULO.forEach(({ t, y }) => {
      const x0 = Math.floor((TITULO_W - 5 - (t.length - 1) * 6) / 2) - 1;
      [...t].forEach((ch, i) => {
        const x = x0 + i * 6, color = COLORES_TITULO[n++ % COLORES_TITULO.length];
        const g = FUENTE[ch === 'Ó' ? 'O' : ch];
        g.forEach((fila, dy) => [...fila].forEach((c, dx) => { if (c === '#') px.set((x + dx) + ',' + (y + dy), color); }));
        if (ch === 'Ó') { px.set((x + 3) + ',' + (y - 2), color); px.set((x + 2) + ',' + (y - 1), color); }
      });
    });
    const vecinos = (x, y) => { const v = []; for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) v.push([x + a, y + b]); return v; };
    const contorno = new Set();
    px.forEach((_, k) => { const [x, y] = k.split(',').map(Number); vecinos(x, y).forEach(([a, b]) => contorno.add(a + ',' + b)); });
    const poner = (k, color, dx = 0, dy = 0) => { const [x, y] = k.split(',').map(Number); ctx.fillStyle = PALETA[color]; ctx.fillRect(x + dx, y + dy, 1, 1); };
    contorno.forEach((k) => poner(k, 'u', 0, 2));
    contorno.forEach((k) => poner(k, 'k'));
    px.forEach((c, k) => poner(k, c));
  }

  const az = (n) => { const v = Math.sin(n * 12.9898) * 43758.5453; return v - Math.floor(v); }; // azar repetible

  // Cielo en bandas (azul, azul claro, blanco) con dithering entre bandas, sol, lomas y pasto con flores.
  function pintarInicio(canvas, W, H) {
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    const hor = Math.round(H * 0.66);
    const px = (x, y, c) => { ctx.fillStyle = PALETA[c]; ctx.fillRect(x, y, 1, 1); };
    const bandas = [[0, 'B'], [Math.round(H * 0.2), 'b'], [Math.round(H * 0.5), 'w']];
    for (let y = 0; y < hor; y++) {
      let i = 0;
      while (i + 1 < bandas.length && y >= bandas[i + 1][0]) i++;
      const sig = bandas[i + 1];
      for (let x = 0; x < W; x++) {
        let c = bandas[i][1];
        if (sig && y >= sig[0] - 4 && y < sig[0] && (x + y) % 2 === 0) c = sig[1]; // dithering
        px(x, y, c);
      }
    }
    // sol
    const sx = Math.round(W * 0.15), sy = Math.round(H * 0.5);
    for (let y = -9; y <= 9; y++) for (let x = -9; x <= 9; x++) {
      const d = x * x + y * y;
      if (d <= 81) px(sx + x, sy + y, d <= 49 ? 'y' : 'Y');
    }
    // lomas lejanas (verde azulado) y cercanas (verde oscuro)
    for (let x = 0; x < W; x++) {
      const a = Math.round(7 + 3 * Math.sin(x / 9) + 2 * Math.sin(x / 4.3));
      for (let y = hor - a; y < hor + 2; y++) px(x, y, 'e');
      const b = Math.round(2 + 2 * Math.sin(x / 6 + 1));
      for (let y = hor - b; y < hor + 3; y++) px(x, y, 'G');
    }
    // pasto con franjas, dithering y matitas
    for (let y = hor + 3; y < H; y++) {
      for (let x = 0; x < W; x++) {
        let c = 'g';
        if (y < hor + 7 && (x + y) % 2 === 0) c = 'G';          // dithering oscuro → claro
        else if (az(x * 7 + y * 131) < 0.09) c = 'G';           // motitas oscuras
        px(x, y, c);
      }
    }
    for (let k = 0; k < W * H / 80; k++) { // matitas y florecitas fijas
      const x = Math.floor(az(k * 2 + 1) * (W - 2)), y = hor + 10 + Math.floor(az(k * 2 + 2) * Math.max(1, H - hor - 12));
      if (k % 3 === 0) { px(x, y, 'G'); px(x, y - 1, 'G'); }
      else { px(x, y, ['r', 'y', 'p', 'w', 'u'][k % 5]); px(x + 1, y, ['y', 'w', 'y', 'p', 'w'][k % 5]); }
    }
  }

  function pintarNube(canvas, w, h, burbujas) {
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, w, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (!burbujas.some(([cx, cy, r]) => (x - cx) ** 2 + (y - cy) ** 2 <= r * r)) continue;
      ctx.fillStyle = PALETA[y >= h - 2 ? 'b' : 'w'];
      ctx.fillRect(x, y, 1, 1);
    }
  }

  const CHISPA = [
    ['...y...', '...y...', '..yyy..', 'yyywyyy', '..yyy..', '...y...', '...y...'],
    ['.......', '.y...y.', '..y.y..', '...w...', '..y.y..', '.y...y.', '.......'],
  ];
  const FLOR = [
    ['...P...', '..PPP..', '.PPyPP.', '..PPP..', '...P...', '...G...', '..GG...', '...GG..', '...G...'],
    ['.......', '...P...', '..PPP..', '..PyP..', '...P...', '...G...', '..GG...', '...GG..', '...G...'],
  ];
  function pintarMini(canvas, filas, sust) {
    canvas.width = filas[0].length;
    canvas.height = filas.length;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    capa(ctx, Object.assign({}, filas), sust);
  }

  // ---------- Retratos (32x32) e íconos (16x16) de los diálogos ----------
  // quien: 'copechi' o el nombre de un NPC (ver NPCS). expr: neutral | contenta | triste.
  function pintarRetrato(canvas, quien, expr) {
    canvas.width = canvas.height = 32;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = PALETA.b;
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = PALETA.w; // nubecita de fondo
    ctx.fillRect(3, 4, 6, 2); ctx.fillRect(5, 3, 3, 1);
    const tmp = document.createElement('canvas');
    tmp.width = tmp.height = quien === 'copechi' ? 32 : 16;
    if (quien === 'copechi') {
      pintarCopechi(tmp, expr, 0);
      ctx.drawImage(tmp, 0, 0);
    } else {
      pintarAvatar(tmp, NPCS[quien], 'abajo', 0, expr);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(tmp, 0, 0, 16, 12, 0, 8, 32, 24); // cabeza y hombros al doble
    }
  }

  const disco = (ctx, cx, cy, r, c) => {
    ctx.fillStyle = PALETA[c];
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) if ((x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2 <= r * r) ctx.fillRect(x, y, 1, 1);
  };
  const pt = (ctx, c, x, y, w = 1, h = 1) => { ctx.fillStyle = PALETA[c]; ctx.fillRect(x, y, w, h); };
  const cabezaAv = (ctx, quien) => { // cabeza de un personaje como ícono
    const t = document.createElement('canvas');
    t.width = t.height = 16;
    pintarAvatar(t, NPCS[quien], 'abajo', 0, 'contenta');
    ctx.drawImage(t, 0, 0, 16, 10, 0, 3, 16, 10);
  };
  const ICONOS_MATRIZ = { // mitades de 8 columnas
    corazon: {
      2: '..kkk...', 3: '.kyyyk..', 4: 'kyywyyk.', 5: 'kyyyyyyy', 6: 'kyyyyyyy', 7: '.kyyyyyy',
      8: '..kyyyyy', 9: '...kyyyy', 10: '....kyyy', 11: '.....kyy', 12: '......ky', 13: '.......k',
    },
    escudo: {
      1: 'kkkkkkkk', 2: 'kbbbBBBB', 3: 'kbbbBBBB', 4: 'kbbbBBBB', 5: 'kbbbBBBB', 6: 'kbbbBBBB', 7: '.kbbBBBB',
      8: '.kbbBBBB', 9: '..kbBBBB', 10: '...kBBBB', 11: '....kBBB', 12: '.....kBB', 13: '......kk',
    },
    pin: {
      1: '...kkkkk', 2: '..krrrrr', 3: '.krrwwrr', 4: '.krrwrrr', 5: '.krrrrrr', 6: '..krrrrr', 7: '...krrrr',
      8: '....krrr', 9: '.....krr', 10: '......kr', 11: '.......k',
    },
  };
  const ICONOS = {
    '⚽': (ctx) => {
      disco(ctx, 8, 8, 7.5, 'k'); disco(ctx, 8, 8, 6.5, 'w');
      pt(ctx, 'k', 7, 6, 2, 4); pt(ctx, 'k', 6, 7, 4, 2);
      [[3, 3], [12, 3], [3, 12], [12, 12]].forEach(([x, y]) => pt(ctx, 'k', x, y, 1, 1));
      [[4, 4], [11, 4], [4, 11], [11, 11]].forEach(([x, y]) => pt(ctx, 'k', x, y, 1, 1));
      pt(ctx, 'k', 5, 5); pt(ctx, 'k', 10, 5); pt(ctx, 'k', 5, 10); pt(ctx, 'k', 10, 10);
    },
    '🚫': (ctx) => {
      disco(ctx, 8, 8, 7.5, 'k'); disco(ctx, 8, 8, 6.5, 'r'); disco(ctx, 8, 8, 4.3, 'w');
      for (let i = 0; i < 9; i++) { pt(ctx, 'r', 4 + i, 4 + i, 2, 1); pt(ctx, 'r', 4 + i, 5 + i, 1, 1); }
    },
    '💛': (ctx) => capaEspejo(ctx, 16, ICONOS_MATRIZ.corazon),
    '🤐': (ctx) => {
      disco(ctx, 8, 8, 7.5, 'k'); disco(ctx, 8, 8, 6.5, 'y');
      pt(ctx, 'k', 4, 5, 2, 2); pt(ctx, 'k', 10, 5, 2, 2);
      pt(ctx, 'k', 4, 10, 8, 1);
      [5, 7, 9].forEach((x) => pt(ctx, 'k', x, 9, 1, 3));
    },
    '👧': (ctx) => cabezaAv(ctx, 'sofi'),
    '👦': (ctx) => cabezaAv(ctx, 'leo'),
    '🛡': (ctx) => capaEspejo(ctx, 16, ICONOS_MATRIZ.escudo),
    '📍': (ctx) => capaEspejo(ctx, 16, ICONOS_MATRIZ.pin),
    bocina: (ctx) => {
      pt(ctx, 'k', 2, 5, 4, 6); pt(ctx, 'y', 3, 6, 2, 4);
      for (let i = 0; i < 4; i++) { pt(ctx, 'k', 6 + i, 4 - i, 1, 8 + 2 * i); pt(ctx, 'y', 6 + i, 5 - i, 1, 6 + 2 * i); }
      pt(ctx, 'k', 12, 6, 1, 4); pt(ctx, 'k', 14, 4, 1, 8); pt(ctx, 'k', 13, 5, 1, 1); pt(ctx, 'k', 13, 10, 1, 1);
    },
    seguir: (ctx) => {
      pt(ctx, 'k', 2, 6, 7, 4);
      for (let i = 0; i < 5; i++) pt(ctx, 'k', 8 + i, 3 + i, 1, 10 - 2 * i);
    },
    repetir: (ctx) => {
      for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
        const d = Math.hypot(x + 0.5 - 8, y + 0.5 - 8), a = Math.atan2(y + 0.5 - 8, x + 0.5 - 8);
        if (d >= 3.8 && d <= 6 && !(a > -1.4 && a < -0.2)) pt(ctx, 'k', x, y);
      }
      pt(ctx, 'k', 11, 1, 1, 5); pt(ctx, 'k', 12, 2, 1, 3); pt(ctx, 'k', 13, 3, 1, 1); pt(ctx, 'k', 10, 1, 1, 1);
    },
    estrella: (ctx) => capaEspejo(ctx, 16, ESTRELLA),
  };
  function pintarIcono(canvas, nombre) {
    canvas.width = canvas.height = 16;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 16, 16);
    (ICONOS[String(nombre).replace(/\uFE0F/g, '')] || ICONOS.estrella)(ctx);
  }

  // ---------- Aleteo de 2 cuadros ----------
  let frame = 0;
  function repintarCopechis() {
    document.querySelectorAll('canvas.copechi').forEach((c) => pintarCopechi(c, c.dataset.expr, frame));
  }
  function animar() {
    const quieto = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    repintarCopechis();
    if (!quieto) setInterval(() => { frame ^= 1; repintarCopechis(); }, 300);
  }

  window.ARTE = {
    PALETA, COP, AV, ESTRELLA, TILES, TILES_INT, NPCS, ICONOS_MATRIZ, FONDOS: Object.keys(FONDOS),
    N_PIEL: PIEL.length, N_PELO: PELO.length, N_ROPA: ROPA.length,
    tile, pintarRetrato, pintarIcono, pintarTitulo, pintarInicio, pintarNube, pintarMini, CHISPA, FLOR, FUENTE, pintarCopechi, pintarAvatar, pintarEstrella, pintarFondo, repintarCopechis, animar,
    get frame() { return frame; },
  };
})();
