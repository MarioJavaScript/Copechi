// Motor de escenas mobile-first. Textos de escenas: solo de data/scenes.json.
(() => {
  const $ = (id) => document.getElementById(id);
  const pantallas = ['inicio', 'avatar', 'mapa', 'juego', 'final', 'debate'];
  const hayVoz = 'speechSynthesis' in window;
  const avatar = { piel: 0, pelo: 0, ropa: 0 };
  const TOTAL = { piel: ARTE.N_PIEL, pelo: ARTE.N_PELO, ropa: ARTE.N_ROPA };
  let datos = null;
  let mapasDatos = null;
  const completadas = new Set();
  let episodio = null;    // escena (NPC) que se está jugando
  let estrellas = 0;
  let ultimaVoz = '';
  let voz = null;
  let preguntas = [];

  // El diálogo ('juego') se muestra encima del mapa, que sigue visible detrás.
  const mostrar = (nombre) => { document.body.classList.toggle('en-dialogo', nombre === 'juego'); pantallas.forEach((p) => $(p).classList.toggle('activa', p === nombre || (nombre === 'juego' && p === 'mapa'))); };
  const vibrar = (ms) => { if (navigator.vibrate) navigator.vibrate(ms); };
  const expresion = (canvas, e) => { canvas.dataset.expr = e; ARTE.pintarCopechi(canvas, e, ARTE.frame); };

  // ---- Pantalla de inicio (arte pixel) ----
  const NUBES = [ // [ancho, alto, burbujas, arriba %, duración s, desfase s]
    [26, 10, [[7, 6, 4], [13, 4, 5], [19, 6, 4], [13, 6, 6]], 10, 95, -20],
    [20, 8, [[6, 5, 3], [11, 3, 4], [15, 5, 3], [10, 5, 4]], 22, 130, -80],
    [30, 11, [[8, 7, 4], [15, 5, 6], [22, 7, 4], [15, 7, 6]], 33, 160, -45],
  ];
  const CHISPAS = [[10, 6], [88, 27], [14, 38], [74, 8], [92, 12], [30, 22]];
  const FLORES = [[6, 77, 'r'], [20, 90, 'y'], [80, 88, 'p'], [93, 78, 'u'], [38, 93, 'w']];
  function pintarInicio() {
    const W = Math.ceil(innerWidth / 4), H = Math.ceil(innerHeight / 4);
    const fondo = $('inicio-fondo');
    ARTE.pintarInicio(fondo, W, H);
    fondo.style.width = W * 4 + 'px';
    fondo.style.height = H * 4 + 'px';
  }
  function decorarInicio() {
    ARTE.pintarTitulo($('titulo'));
    const deco = $('inicio-deco');
    NUBES.forEach(([w, h, b, top, dur, delay]) => {
      const c = document.createElement('canvas');
      ARTE.pintarNube(c, w, h, b);
      c.className = 'nube';
      Object.assign(c.style, { width: w * 4 + 'px', height: h * 4 + 'px', top: top + '%', animationDuration: dur + 's', animationDelay: delay + 's' });
      deco.append(c);
    });
    const mini = (filas, sust, x, y, i, k) => {
      const caja = document.createElement('div');
      caja.className = 'chispa';
      const ancho = filas[0][0].length, alto = filas[0].length;
      Object.assign(caja.style, { left: x + '%', top: y + '%', width: ancho * 4 + 'px', height: alto * 4 + 'px' });
      filas.forEach((f) => { const c = document.createElement('canvas'); ARTE.pintarMini(c, f, sust); c.style.animationDelay = (-i * 0.37) + 's'; caja.append(c); });
      deco.append(caja);
    };
    CHISPAS.forEach(([x, y], i) => mini(ARTE.CHISPA, null, x, y, i));
    FLORES.forEach(([x, y, c], i) => mini(ARTE.FLOR, { P: c }, x, y, i + 3));
  }
  pintarInicio();
  decorarInicio();
  window.addEventListener('resize', pintarInicio);

  // ---- Voz ----
  function elegirVoz() {
    const vs = speechSynthesis.getVoices();
    voz = vs.find((v) => v.lang.replace('_', '-') === 'es-MX')
       || vs.find((v) => v.lang.toLowerCase().startsWith('es')) || null;
  }
  if (hayVoz) {
    elegirVoz();
    speechSynthesis.onvoiceschanged = elegirVoz;
  }
  function hablar(texto) {
    ultimaVoz = texto;
    if (!hayVoz || !texto) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = voz ? voz.lang : 'es-MX';
    if (voz) u.voice = voz;
    u.rate = 0.9;
    u.pitch = 1.3;
    speechSynthesis.speak(u);
  }

  // ---- Avatar ----
  function pintarAvatares() {
    ['avatar-grande', 'avatar-final'].forEach((id) => ARTE.pintarAvatar($(id), avatar));
  }
  document.querySelectorAll('.flecha').forEach((b) => b.addEventListener('click', () => {
    const c = b.dataset.campo;
    avatar[c] = (avatar[c] + +b.dataset.d + TOTAL[c]) % TOTAL[c];
    vibrar(15);
    pintarAvatares();
  }));

  // ---- Diálogos RPG (encima del mapa) ----
  let npcActual = null;      // NPC que habla en la escena (null: La Copechi)

  // Parte el texto en páginas de máximo 2 líneas: por frases y, si una no cabe, por palabras.
  function paginar(texto, el) {
    const cabe = (t) => { el.textContent = t; return el.scrollHeight <= el.clientHeight + 1; };
    const frases = (texto.match(/[^.!?]+[.!?»”]*/g) || [texto]).map((f) => f.trim()).filter(Boolean);
    const paginas = [];
    let cur = '';
    frases.forEach((f) => {
      const junto = cur ? cur + ' ' + f : f;
      if (cabe(junto)) { cur = junto; return; }
      if (cur) { paginas.push(cur); cur = ''; }
      if (cabe(f)) { cur = f; return; }
      f.split(' ').forEach((w) => {
        const c = cur ? cur + ' ' + w : w;
        if (cabe(c) || !cur) cur = c; else { paginas.push(cur); cur = w; }
      });
    });
    if (cur) paginas.push(cur);
    return paginas;
  }

  // Muestra un texto por páginas dentro de una caja; tocar la caja avanza. `alCambiar(ultima)` avisa si es la última.
  function cajaTexto(caja, el, mas, alCambiar) {
    let paginas = [], i = 0;
    const ver = () => {
      el.textContent = paginas[i] || '';
      mas.hidden = i >= paginas.length - 1;
      alCambiar(i >= paginas.length - 1);
    };
    caja.addEventListener('click', () => { if (i < paginas.length - 1) { i++; ver(); vibrar(10); } });
    return { poner(texto) { paginas = paginar(texto, el); i = 0; ver(); } };
  }
  const textoEscena = cajaTexto($('dlg-caja'), $('texto'), $('dlg-mas'), (ultima) => $('opciones').classList.toggle('oculta', !ultima));
  const textoFeedback = cajaTexto($('fb-caja'), $('fb-texto'), $('fb-mas'), () => {});

  function irA(id) {
    const esc = datos.escenas[id];
    if (esc.final) return pantallaFinal(esc);
    mostrar('juego');
    $('panel-fb').hidden = true;
    $('panel-escena').hidden = false;
    ARTE.pintarRetrato($('retrato'), npcActual ? npcActual.sprite : 'copechi', 'neutral');
    $('dlg-nombre').textContent = npcActual ? npcActual.nombre : 'La Copechi';
    const cont = $('opciones');
    cont.replaceChildren();
    esc.opciones.forEach((op, i) => {
      const b = document.createElement('button');
      b.className = 'btn-rpg c' + i;
      const ic = document.createElement('canvas');
      ic.className = 'ico';
      ARTE.pintarIcono(ic, op.icono);
      const tx = document.createElement('span');
      tx.textContent = op.text;
      b.append(ic, tx);
      b.addEventListener('click', () => elegir(op));
      cont.append(b);
    });
    textoEscena.poner(esc.text);
    hablar(esc.voz || esc.text);
  }

  const CHISPAS_FB = [[8, 12], [84, 8], [2, 52], [92, 48], [20, 80], [74, 78]];
  function elegir(op) {
    vibrar(30);
    if (op.badge && !op.triste) estrellas++;
    const expr = op.triste ? 'triste' : 'contenta';
    $('panel-escena').hidden = true;
    $('panel-fb').hidden = false;
    expresion($('fb-copechi'), expr);
    $('fb-chispas').replaceChildren(...(op.triste ? [] : CHISPAS_FB.map(([x, y], i) => {
      const caja = document.createElement('div');
      caja.className = 'chispa pop';
      Object.assign(caja.style, { left: x + '%', top: y + '%', width: '28px', height: '28px', animationDelay: i * 0.15 + 's' });
      ARTE.CHISPA.forEach((f) => { const c = document.createElement('canvas'); ARTE.pintarMini(c, f, null); c.style.animationDelay = (-i * 0.3) + 's'; caja.append(c); });
      return caja;
    })));
    const btn = $('btn-seguir');
    ARTE.pintarIcono(btn.querySelector('canvas'), op.triste ? 'repetir' : 'seguir');
    btn.querySelector('span').textContent = op.triste ? 'Intentar otra vez' : 'Seguir';
    btn.onclick = () => { if (op.next === 'mapa') cerrarEpisodio(); else irA(op.next); };
    textoFeedback.poner(op.feedback);
    hablar(op.feedback);
  }

  // Abre la escena de un NPC encima del mapa.
  function hablarConNpc(npc) {
    MAPA.pausar();
    npcActual = npc;
    episodio = npc.escena;
    irA(npc.escena);
  }

  // La escena terminó: se marca completada y se vuelve al mapa (o al final si ya están todas).
  function cerrarEpisodio() {
    completadas.add(episodio);
    episodio = null;
    npcActual = null;
    const todas = mapasDatos.mapas.flatMap((m) => m.npcs.map((n) => n.escena));
    if (todas.every((id) => completadas.has(id))) return pantallaFinal(datos.escenas[mapasDatos.final]);
    mostrar('mapa');
    MAPA.reanudar();
  }

  function pantallaFinal(esc) {
    $('texto-final').textContent = esc.text;
    preguntas = esc.preguntas || [];
    $('preguntas').replaceChildren(...preguntas.map((q) => { const li = document.createElement('li'); li.textContent = q; return li; }));
    const cont = $('estrellas');
    cont.replaceChildren();
    for (let i = 0; i < Math.max(1, estrellas); i++) {
      const c = document.createElement('canvas');
      c.width = c.height = 16;
      ARTE.pintarEstrella(c);
      cont.append(c);
    }
    mostrar('final');
    hablar(esc.voz || esc.text);
  }

  async function cargar() {
    if (datos) return true;
    try {
      [datos, mapasDatos] = await Promise.all(['data/scenes.json', 'data/maps.json'].map((u) => fetch(u).then((r) => r.json())));
      MAPA.iniciar(mapasDatos, avatar, { completadas, alHablar: hablarConNpc });
      return true;
    }
    catch (e) { $('btn-empezar').textContent = 'No se pudo cargar'; return false; }
  }

  // El primer toque desbloquea la voz en iOS/Android.
  $('btn-empezar').addEventListener('click', async () => {
    if (hayVoz) {
      const u = new SpeechSynthesisUtterance(' ');
      u.volume = 0;
      speechSynthesis.speak(u);
    }
    if (!(await cargar())) return;
    pintarAvatares();
    mostrar('avatar');
    hablar('¡Crea tu personaje! Toca las flechas.');
  });
  $('btn-listo').addEventListener('click', () => {
    estrellas = 0;
    completadas.clear();
    mostrar('mapa');
    MAPA.abrir(mapasDatos.inicio);
    hablar('¡Toca el mapa para caminar! Busca la flecha amarilla.');
  });
  $('btn-voz').addEventListener('click', () => hablar(ultimaVoz));
  $('btn-voz-final').addEventListener('click', () => hablar(ultimaVoz));
  $('btn-debate').addEventListener('click', () => { mostrar('debate'); hablar(preguntas.join(' ')); });
  $('btn-voz-debate').addEventListener('click', () => hablar(ultimaVoz));
  $('btn-reiniciar').addEventListener('click', () => { mostrar('avatar'); hablar('¡Crea tu personaje! Toca las flechas.'); });

  ['ico-bocina', 'ico-bocina-final', 'ico-bocina-debate'].forEach((id) => ARTE.pintarIcono($(id), 'bocina'));
  ARTE.animar();
})();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
