// Arte pixel de Misión Copechi: paleta de 16 colores, sprites como matrices y fondos de 72x40.
// Los sprites simétricos se guardan como MITAD izquierda y se espejan al dibujar.
(() => {
  const PALETA = {
    k: '#3b2210', w: '#ffffff', c: '#fff1c9', y: '#ffd25e', Y: '#f2a93b', o: '#b5541c',
    r: '#d9503a', p: '#f4a6a0', g: '#5fa83a', G: '#3d7a2a', b: '#8fd3ee', B: '#3a86c8',
    t: '#f0c090', T: '#b8764a', h: '#6b3d1e', s: '#e8c878',
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
        9: '...........kk...', 10: '.........wwww...', 11: '.........wkkw...', 12: '.........wkkw...',
        13: '.........wwww...', 14: '.........B..kkkk', 15: '...........k....',
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
    cara: { 4: '....k...', 5: '..p.k...', 6: '.......k' },                     // de frente (mitad)
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
    { estilo: 'vestido', color: 'y' }, { estilo: 'camiseta', color: 'p' }, { estilo: 'overol', color: 'B' },
  ];

  // dir: 'abajo' | 'arriba' | 'izquierda' | 'derecha'. paso: 0 quieto, 1 y 2 alternan el pie levantado al caminar.
  function pintarAvatar(canvas, a, dir = 'abajo', paso = 0) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 16, 16);
    const pelo = PELO[a.pelo], ropa = ROPA[a.ropa];
    const sust = { S: PIEL[a.piel], H: pelo.color, C: ropa.color };
    ctx.save();
    if (dir === 'derecha') { ctx.translate(16, 0); ctx.scale(-1, 1); }
    capaEspejo(ctx, 16, AV.base, dir === 'arriba' ? { ...sust, S: pelo.color } : sust);
    if (dir === 'abajo') capaEspejo(ctx, 16, AV.cara, sust);
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
    E: { fondo: 's', filas: { 0: 'YYYYYYYY', 7: '...YYYYY', 8: '...YYYYY', 15: 'YYYYYYYY' } },
  };
  const tilesCache = {};
  function tile(clave) {
    const def = TILES[clave] || TILES['.'];
    const k = TILES[clave] ? clave : '.';
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
  function pintarEstrella(canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 16, 16);
    capaEspejo(ctx, 16, ESTRELLA);
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
      R(ctx, 's', 26, 30, 36, 8); R(ctx, 'w', 43, 30, 1, 8);
      R(ctx, 'w', 52, 33, 5, 5); R(ctx, 'k', 53, 34, 3, 3); R(ctx, 'w', 54, 35, 1, 1);
      // portería
      R(ctx, 'w', 62, 22, 8, 1); R(ctx, 'w', 62, 22, 1, 10); R(ctx, 'w', 69, 22, 1, 10);
    },
    salon(ctx) {
      R(ctx, 'c', 0, 0, 72, 30);
      R(ctx, 's', 0, 30, 72, 10); R(ctx, 'o', 0, 30, 72, 1);
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
      R(ctx, 'c', 0, 0, 72, 40);
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
    PALETA, COP, AV, ESTRELLA, TILES, NPCS, FONDOS: Object.keys(FONDOS),
    N_PIEL: PIEL.length, N_PELO: PELO.length, N_ROPA: ROPA.length,
    tile, pintarCopechi, pintarAvatar, pintarEstrella, pintarFondo, repintarCopechis, animar,
    get frame() { return frame; },
  };
})();
