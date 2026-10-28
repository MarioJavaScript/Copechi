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

  // ---------- Personajes (32x32, mitad izquierda de 16 columnas) ----------
  // S = piel, H = pelo, C = color de ropa (se sustituyen al dibujar)
  const PJ = {
    base: {
      3: '...........kkkkk', 4: '.........kkSSSSS', 5: '........kSSSSSSS', 6: '........kSSSSSSS', 7: '........kSSSSSSS',
      8: '........kSSSSSSS', 9: '........kSSSSSSS', 10: '........kSSSSSSS', 11: '........kSSSSSSS', 12: '........kSSSSSSS',
      13: '........kSSSSSSS', 14: '.........kSSSSSS', 15: '..........kkSSSS', 16: '............kkkk',
    },
    cara: { // de frente, por expresión
      neutral: { 9: '..........kw....', 10: '..........kk....', 11: '..........kk....', 12: '.........pp.....', 13: '..............kk' },
      contenta: { 10: '..........kk....', 11: '.........k..k...', 12: '.........pp.....', 13: '............k...', 14: '.............kkk' },
      triste: {
        8: '...........kk...', 9: '..........kw....', 10: '..........kk....', 11: '..........kk....',
        12: '.........bp.....', 13: '.........b...kkk', 14: '............k...',
      },
    },
    pelo: {
      corto: {
        2: '..........kkkkkk', 3: '........kkHHHHHH', 4: '........kHHHHHHH', 5: '........kHHHHHHH', 6: '........kHHHHHHH',
        7: '........kHHHHHHH', 8: '........kHHHHH..', 9: '........kH......', 10: '........kH......', 11: '........kH......',
      },
      largo: {
        2: '..........kkkkkk', 3: '........kkHHHHHH', 4: '........kHHHHHHH', 5: '........kHHHHHHH', 6: '........kHHHHHHH',
        7: '........kHHHHHHH', 8: '........kHHHHH..', 9: '........kH......', 10: '........kH......', 11: '........kH......',
        12: '.....kHHk.......', 13: '.....kHHk.......', 14: '.....kHHk.......', 15: '.....kHHk.......', 16: '.....kHHk.......',
        17: '.....kHHk.......', 18: '.....kHHk.......', 19: '.....kHHk.......', 20: '.....kHHk.......', 21: '.....kkkk.......',
      },
      chongos: {
        0: '....kkkk........', 1: '...kHHHHk.......', 2: '...kHHHHk.kkkkkk', 3: '....kkkkkkkHHHHH', 4: '........kHHHHHHH',
        5: '........kHHHHHHH', 6: '........kHHHHHHH', 7: '........kHHHHHHH', 8: '........kHHHHH..', 9: '........kH......',
        10: '........kH......', 11: '........kH......',
      },
    },
    ropa: {
      camiseta: {
        17: '.......kkCCCCCCC', 18: '......kCCCCCCCCC', 19: '......kCCCCCCCCC', 20: '......kSkCCCCCCC', 21: '......kSkCCCCCCC',
        22: '......kSkCCCCCCC', 23: '.......kkCCCCCCC', 24: '.........koooooo', 25: '.........koooooo',
        26: '.........kooook.', 27: '.........kooook.', 28: '.........kkkkkk.',
      },
      vestido: {
        17: '.......kkCCCCCCC', 18: '......kCCCCCCCCC', 19: '......kCCCCCCCCC', 20: '......kSkCCCCCCC', 21: '......kSkCCCCCCC',
        22: '.....kCCCCCCCCCC', 23: '....kCCCCCCCCCCC', 24: '....kCCCCCCCCCCC', 25: '....kkkkkkkkkkkk',
        26: '.........kSSSk..', 27: '.........kSSSk..', 28: '.........kkkkkk.',
      },
      overol: {
        17: '.......kkwwwwwww', 18: '......kwwwCwwwww', 19: '......kwwwCwwwww', 20: '......kSkCCCCCCC', 21: '......kSkCCCCCCC',
        22: '......kSkCCCCCCC', 23: '.......kkCCCCCCC', 24: '.........kCCCCCC', 25: '.........kCCCCCC',
        26: '.........kCCCCk.', 27: '.........kCCCCk.', 28: '.........kkkkkk.',
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

  // dir: 'abajo' | 'arriba' | 'izquierda' | 'derecha'. paso: 0 quieto, 1 y 2 alternan la pierna levantada al caminar.
  function pintarPersonaje(canvas, a, dir = 'abajo', paso = 0, expr = 'neutral') {
    canvas.width = canvas.height = 32;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 32, 32);
    const pelo = PELO[a.pelo], ropa = ROPA[a.ropa];
    const sust = { S: PIEL[a.piel], H: pelo.color, C: ropa.color };
    ctx.save();
    if (dir === 'derecha') { ctx.translate(32, 0); ctx.scale(-1, 1); }
    ctx.translate(0, paso ? 0 : 1); // al caminar el cuerpo "rebota" 1 px
    capaEspejo(ctx, 32, PJ.base, dir === 'arriba' ? { ...sust, S: pelo.color } : sust);
    if (dir === 'abajo') capaEspejo(ctx, 32, PJ.cara[expr] || PJ.cara.neutral, sust);
    else if (dir !== 'arriba') { // de lado: los dos ojos del lado de la cara, boca al frente
      pt(ctx, 'k', 10, 9, 2, 3); pt(ctx, 'w', 11, 9); pt(ctx, 'k', 14, 9, 2, 3); pt(ctx, 'w', 15, 9);
      pt(ctx, 'p', 9, 12, 2, 1); pt(ctx, 'k', 9, 13, 3, 1);
    }
    capaEspejo(ctx, 32, PJ.ropa[ropa.estilo], sust);
    capaEspejo(ctx, 32, PJ.pelo[pelo.estilo], sust);
    ctx.restore();
    if (paso === 1) ctx.clearRect(9, 27, 6, 2);   // pierna izquierda levantada
    if (paso === 2) ctx.clearRect(17, 27, 6, 2);  // pierna derecha levantada
  }

  // Personajes (NPC): mismas piezas del avatar.
  const NPCS = {
    sofi: { piel: 1, pelo: 1, ropa: 3 },
    leo: { piel: 0, pelo: 3, ropa: 2 },
    maestra: { piel: 2, pelo: 4, ropa: 1 },
    amigo: { piel: 1, pelo: 3, ropa: 5 },
  };

  // ---------- Tiles del mapa (32x32): rectas de colores y azar repetible ----------
  const disco32 = (ctx, cx, cy, rad, c) => {
    ctx.fillStyle = PALETA[c];
    for (let y = Math.floor(cy - rad); y <= Math.ceil(cy + rad); y++) for (let x = Math.floor(cx - rad); x <= Math.ceil(cx + rad); x++) {
      if ((x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2 <= rad * rad) ctx.fillRect(x, y, 1, 1);
    }
  };
  const rr = (n, s) => Math.floor(az(n + s * 7.31) * 1000);
  function pasto(ctx, s) {
    R(ctx, 'g', 0, 0, 32, 32);
    for (let i = 0; i < 12; i++) {
      const x = 1 + rr(i * 3, s) % 28, y = 2 + rr(i * 3 + 1, s) % 27;
      R(ctx, 'G', x, y, 1, 2); R(ctx, 'G', x + 2, y + 1, 1, 1);
    }
  }
  function flores(ctx, s, colores) {
    pasto(ctx, s);
    for (let i = 0; i < 3; i++) {
      const x = 3 + rr(i * 5 + 40, s) % 24, y = 3 + rr(i * 5 + 41, s) % 22, c = colores[i % colores.length];
      R(ctx, 'G', x + 1, y + 3, 1, 4);
      R(ctx, c, x + 1, y, 1, 3); R(ctx, c, x, y + 1, 3, 1); R(ctx, 'Y', x + 1, y + 1, 1, 1);
    }
  }
  const sombraSuelo = (ctx, x, y, w) => { R(ctx, 'G', x, y, w, 3); R(ctx, 'G', x + 2, y + 3, w - 4, 1); };
  const pisoMadera = (ctx, v) => {
    R(ctx, 'y', 0, 0, 32, 32);
    for (let i = 0; i < 4; i++) {
      const y = i * 8;
      R(ctx, 'Y', 0, y + 7, 32, 1);
      const x = [10, 22, 4, 16][(i + v) % 4];
      R(ctx, 'Y', x, y, 1, 7);
      R(ctx, 'o', x + 3, y + 3, 1, 1); R(ctx, 'o', (x + 15) % 30 + 1, y + 3, 1, 1);
    }
  };
  const paredCara = (ctx) => { // pared vista de frente: papel rosa con rayas y zócalo de madera
    R(ctx, 'p', 0, 0, 32, 32);
    for (let x = 3; x < 32; x += 8) R(ctx, 'w', x, 0, 1, 26);
    for (let x = 7; x < 32; x += 8) for (let y = 3; y < 24; y += 8) R(ctx, 'r', x, y, 2, 2);
    R(ctx, 'k', 0, 25, 32, 1); R(ctx, 'o', 0, 26, 32, 6); R(ctx, 'Y', 0, 26, 32, 1); R(ctx, 'k', 0, 31, 32, 1);
  };
  const ladrillos = (ctx) => {
    R(ctx, 'o', 0, 0, 32, 32);
    for (let f = 0; f < 4; f++) {
      R(ctx, 'k', 0, f * 8, 32, 1);
      const o = f % 2 ? 8 : 0;
      R(ctx, 'k', o, f * 8, 1, 8); R(ctx, 'k', o + 16, f * 8, 1, 8);
      R(ctx, 'Y', 1 + o, f * 8 + 1, 14, 1); R(ctx, 'Y', 17 + o > 31 ? 1 : 17 + o, f * 8 + 1, 14, 1);
    }
  };

  const PINTORES = {
    exterior: {
      '.': (c, i) => (i.v === 1 ? flores(c, i.s, ['r', 'p', 'w']) : i.v === 2 ? flores(c, i.s, ['w', 'u', 'y']) : pasto(c, i.s)),
      '#': (c) => {
        R(c, 'G', 0, 0, 32, 32);
        [[6, 8, 6], [18, 6, 7], [27, 14, 6], [10, 20, 7], [23, 24, 6], [4, 28, 4]].forEach(([x, y, r]) => { disco32(c, x, y + 1, r, 'k'); disco32(c, x, y, r, 'g'); disco32(c, x + 1, y + 1, r - 2, 'G'); disco32(c, x - 2, y - 2, 2, 'g'); });
        R(c, 'r', 8, 12, 2, 2); R(c, 'r', 20, 11, 2, 2); R(c, 'r', 14, 24, 2, 2); R(c, 'k', 0, 31, 32, 1);
      },
      T: (c, i) => {
        pasto(c, i.s);
        R(c, 'G', 5, 24, 22, 5); R(c, 'G', 8, 29, 16, 2);
        R(c, 'k', 12, 17, 8, 12); R(c, 'o', 13, 18, 6, 10); R(c, 'Y', 13, 18, 2, 10);
        disco32(c, 16, 12, 14, 'k'); disco32(c, 16, 12, 13, 'G'); disco32(c, 12, 8, 7, 'g'); disco32(c, 21, 10, 4, 'g'); disco32(c, 10, 16, 3, 'g');
        R(c, 'r', 10, 13, 2, 2); R(c, 'r', 21, 16, 2, 2); R(c, 'r', 16, 6, 2, 2);
      },
      B: (c, i) => {
        pasto(c, i.s);
        sombraSuelo(c, 3, 27, 26);
        R(c, 'k', 2, 5, 28, 8); R(c, 'o', 3, 6, 26, 6); R(c, 'k', 3, 9, 26, 1);
        R(c, 'k', 5, 20, 5, 8); R(c, 'o', 6, 21, 3, 6); R(c, 'k', 22, 20, 5, 8); R(c, 'o', 23, 21, 3, 6);
        R(c, 'k', 2, 12, 28, 9); R(c, 'Y', 3, 13, 26, 7); R(c, 'y', 3, 13, 26, 2);
      },
      E: (c) => { R(c, 'y', 0, 0, 32, 32); for (let k = 0; k < 14; k++) R(c, 'Y', 1 + rr(k, 1) % 30, 1 + rr(k + 20, 1) % 30, 2, 1); estera(c); },
      S: (c, i) => { // columpio
        pasto(c, i.s); sombraSuelo(c, 3, 27, 26);
        R(c, 'k', 3, 3, 26, 6); R(c, 'r', 4, 4, 24, 4); R(c, 'k', 4, 3, 5, 25); R(c, 'o', 5, 8, 3, 19); R(c, 'k', 23, 3, 5, 25); R(c, 'o', 24, 8, 3, 19);
        R(c, 'k', 11, 8, 1, 13); R(c, 'k', 20, 8, 1, 13); R(c, 'k', 9, 20, 13, 4); R(c, 'y', 10, 21, 11, 2);
      },
      D: (c, i) => { // resbaladilla
        pasto(c, i.s); sombraSuelo(c, 3, 27, 26);
        R(c, 'k', 3, 5, 5, 23); R(c, 'o', 4, 6, 3, 21); for (let y = 9; y < 26; y += 4) R(c, 'k', 4, y, 3, 1);
        R(c, 'k', 3, 3, 11, 5); R(c, 'y', 4, 4, 9, 3);
        for (let k = 0; k < 17; k++) { R(c, 'k', 11 + k, 7 + k, 8, 3); }
        for (let k = 0; k < 17; k++) { R(c, 'B', 12 + k, 8 + k, 6, 1); R(c, 'b', 13 + k, 8 + k, 2, 1); }
      },
      a: (c) => { // arenero
        R(c, 'y', 0, 0, 32, 32); for (let k = 0; k < 22; k++) R(c, 'Y', 1 + rr(k, 3) % 30, 1 + rr(k + 30, 3) % 30, 1, 1);
        R(c, 'w', 5, 22, 2, 1); R(c, 'w', 22, 8, 2, 1);
      },
    },
    interior: {
      '.': (c, i) => pisoMadera(c, i.v),
      '#': (c, i) => (i.arriba ? paredCara(c) : ladrillos(c)),
      W: (c, i) => {
        paredCara(c);
        const x0 = i.izq ? 0 : 3, x1 = i.der ? 32 : 29;
        R(c, 'k', x0, 4, x1 - x0, 19);
        const g0 = x0 + (i.izq ? 0 : 2), g1 = x1 - (i.der ? 0 : 2);
        R(c, 'B', g0, 6, g1 - g0, 7); R(c, 'b', g0, 13, g1 - g0, 8);
        R(c, 'w', g0 + 3, 8, 6, 2); R(c, 'w', g0 + 5, 7, 3, 1);
        R(c, 'k', g0, 13, g1 - g0, 1);
        if (!i.der) R(c, 'k', 15, 6, 1, 15);
        R(c, 'w', x0 - 1 < 0 ? 0 : x0 - 1, 23, x1 - x0 + (i.izq ? 0 : 2), 2); R(c, 'k', x0 - 1 < 0 ? 0 : x0 - 1, 25, x1 - x0 + 2, 1);
      },
      Z: (c, i) => {
        paredCara(c);
        const x0 = i.izq ? 0 : 2, x1 = i.der ? 32 : 30;
        R(c, 'k', x0, 3, x1 - x0, 20); R(c, 'o', x0 + (i.izq ? 0 : 1), 4, x1 - x0 - (i.izq ? 0 : 1) - (i.der ? 0 : 1), 18);
        R(c, 'G', x0 + (i.izq ? 0 : 3), 6, x1 - x0 - (i.izq ? 0 : 3) - (i.der ? 0 : 3), 14);
        if (!i.izq) { R(c, 'w', 6, 9, 10, 1); R(c, 'w', 6, 13, 18, 1); R(c, 'w', 6, 16, 8, 1); }
        else if (!i.der) { R(c, 'w', 4, 10, 6, 1); R(c, 'p', 14, 13, 8, 1); R(c, 'y', 20, 8, 3, 3); }
        else { R(c, 'w', 4, 9, 20, 1); R(c, 'w', 8, 14, 12, 1); }
        R(c, 'Y', x0, 22, x1 - x0, 2); R(c, 'k', x0, 24, x1 - x0, 1);
        if (!i.der) { R(c, 'w', x1 - 8, 22, 4, 1); R(c, 'p', x1 - 14, 22, 3, 1); }
      },
      B: (c, i) => { // pupitre con silla
        pisoMadera(c, i.v);
        R(c, 'k', 8, 23, 16, 8); R(c, 'u', 9, 24, 14, 6); R(c, 'k', 6, 21, 3, 5); R(c, 'k', 23, 21, 3, 5);
        R(c, 'k', 4, 6, 24, 16); R(c, 'Y', 5, 7, 22, 14); R(c, 'y', 5, 7, 22, 2); R(c, 'o', 5, 18, 22, 3);
        R(c, 'B', 8, 10, 6, 5); R(c, 'w', 9, 11, 4, 1); R(c, 'r', 18, 12, 6, 1); R(c, 'w', 18, 14, 3, 2);
      },
      L: (c, i) => { // librero
        pisoMadera(c, i.v);
        R(c, 'k', 2, 2, 28, 28); R(c, 'o', 3, 3, 26, 26); R(c, 'k', 3, 11, 26, 1); R(c, 'k', 3, 19, 26, 1);
        const col = ['r', 'B', 'g', 'y', 'u', 'e', 'p'];
        [[3, 11], [11, 19], [19, 27]].forEach(([top, base], fila) => {
          for (let x = 4, n = 0; x < 28; x += 4, n++) { const h = 5 + rr(n + fila * 9, 2) % 3; R(c, 'k', x - 1, base - h - 1, 4, h + 1); R(c, col[(n + fila * 3) % col.length], x, base - h, 2, h); }
        });
      },
      C: (c, i) => { // cama
        pisoMadera(c, i.v);
        R(c, 'k', 3, 2, 26, 28); R(c, 'o', 4, 3, 24, 26);
        R(c, 'k', 6, 4, 20, 9); R(c, 'w', 7, 5, 18, 7);
        R(c, 'k', 5, 12, 22, 17); R(c, 'B', 6, 13, 20, 15); R(c, 'b', 6, 17, 20, 2); R(c, 'b', 6, 22, 20, 2);
      },
      M: (c, i) => { // escritorio con compu y chat
        pisoMadera(c, i.v);
        R(c, 'k', 2, 12, 28, 15); R(c, 'Y', 3, 13, 26, 13); R(c, 'y', 3, 13, 26, 2);
        R(c, 'k', 7, 2, 18, 13); R(c, 'B', 9, 4, 14, 8); R(c, 'w', 10, 5, 7, 2); R(c, 'y', 14, 8, 8, 2); R(c, 'k', 14, 15, 4, 2);
        R(c, 'k', 9, 19, 14, 5); R(c, 'w', 10, 20, 12, 3); R(c, 'k', 12, 21, 8, 1); R(c, 'r', 25, 20, 3, 4);
      },
      E: (c, i) => { pisoMadera(c, i.v); estera(c); },
    },
  };
  function estera(c) { // tapete de salida
    R(c, 'k', 3, 9, 26, 15); R(c, 'r', 5, 11, 22, 11); R(c, 'y', 5, 15, 22, 3); R(c, 'w', 8, 13, 2, 1); R(c, 'w', 22, 19, 2, 1);
  }

  const tilesCache = {};
  // clave: carácter del mapa. info: { x, y, izq, der } (izq/der: el vecino es el mismo tile, para objetos de varios tiles).
  function tile(clave, estilo, info = {}) {
    const est = estilo === 'interior' ? 'interior' : 'exterior';
    const p = PINTORES[est][clave] ? clave : '.';
    const x = info.x || 0, y = info.y || 0;
    const v = est === 'exterior' ? ((x * 31 + y * 17) % 11 < 2 ? 1 : (x * 31 + y * 17) % 11 === 2 ? 2 : 0) : (x + y) % 2;
    const i = { x, y, v, s: (x * 7 + y * 13) % 5, izq: !!info.izq, der: !!info.der, arriba: info.y === 0 };
    const k = [est, p, v, i.s, i.izq ? 1 : 0, i.der ? 1 : 0, i.arriba ? 1 : 0].join(':');
    if (!tilesCache[k]) {
      const c = document.createElement('canvas');
      c.width = c.height = 32;
      PINTORES[est][p](c.getContext('2d'), i);
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
    tmp.width = tmp.height = 32;
    if (quien === 'copechi') {
      pintarCopechi(tmp, expr, 0);
      ctx.drawImage(tmp, 0, 0);
    } else {
      pintarPersonaje(tmp, NPCS[quien], 'abajo', 0, expr);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(tmp, 8, 2, 16, 16, 0, 0, 32, 32); // la cabeza, al doble
    }
  }

  const disco = (ctx, cx, cy, r, c) => {
    ctx.fillStyle = PALETA[c];
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) if ((x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2 <= r * r) ctx.fillRect(x, y, 1, 1);
  };
  const pt = (ctx, c, x, y, w = 1, h = 1) => { ctx.fillStyle = PALETA[c]; ctx.fillRect(x, y, w, h); };
  const cabezaAv = (ctx, quien) => { // cabeza de un personaje como ícono
    const t = document.createElement('canvas');
    pintarPersonaje(t, NPCS[quien], 'abajo', 0, 'contenta');
    ctx.drawImage(t, 8, 2, 16, 16, 0, 0, 16, 16);
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
    PALETA, COP, PJ, ESTRELLA, NPCS, ICONOS_MATRIZ, FONDOS: Object.keys(FONDOS),
    N_PIEL: PIEL.length, N_PELO: PELO.length, N_ROPA: ROPA.length,
    tile, pintarRetrato, pintarIcono, pintarTitulo, pintarInicio, pintarNube, pintarMini, CHISPA, FLOR, FUENTE, pintarCopechi, pintarPersonaje, pintarEstrella, pintarFondo, repintarCopechis, animar,
    get frame() { return frame; },
  };
})();
