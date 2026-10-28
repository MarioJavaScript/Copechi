// Motor de escenas mobile-first. Textos de escenas: solo de data/scenes.json.
(() => {
  const $ = (id) => document.getElementById(id);
  const pantallas = ['inicio', 'avatar', 'juego', 'final', 'debate'];
  const hayVoz = 'speechSynthesis' in window;
  const avatar = { piel: 0, pelo: 0, ropa: 0 };
  const TOTAL = { piel: ARTE.N_PIEL, pelo: ARTE.N_PELO, ropa: ARTE.N_ROPA };
  let datos = null;
  let estrellas = 0;
  let ultimaVoz = '';
  let voz = null;
  let preguntas = [];

  const mostrar = (nombre) => pantallas.forEach((p) => $(p).classList.toggle('activa', p === nombre));
  const vibrar = (ms) => { if (navigator.vibrate) navigator.vibrate(ms); };
  const expresion = (canvas, e) => { canvas.dataset.expr = e; ARTE.pintarCopechi(canvas, e, ARTE.frame); };

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
    ['avatar-grande', 'avatar-mini', 'avatar-final'].forEach((id) => ARTE.pintarAvatar($(id), avatar));
  }
  document.querySelectorAll('.flecha').forEach((b) => b.addEventListener('click', () => {
    const c = b.dataset.campo;
    avatar[c] = (avatar[c] + +b.dataset.d + TOTAL[c]) % TOTAL[c];
    vibrar(15);
    pintarAvatares();
  }));

  // ---- Escenas ----
  function irA(id) {
    const esc = datos.escenas[id];
    if (esc.final) return pantallaFinal(esc);
    expresion($('copechi'), 'neutral');
    ARTE.pintarFondo($('fondo'), esc.fondo);
    $('texto').textContent = esc.text;
    const cont = $('opciones');
    cont.replaceChildren();
    esc.opciones.forEach((op) => {
      const b = document.createElement('button');
      b.className = 'btn opcion';
      const ic = document.createElement('span');
      ic.className = 'icono';
      ic.textContent = op.icono;
      const tx = document.createElement('span');
      tx.textContent = op.text;
      b.append(ic, tx);
      b.addEventListener('click', () => elegir(op));
      cont.append(b);
    });
    mostrar('juego');
    hablar(esc.voz || esc.text);
  }

  function elegir(op) {
    vibrar(30);
    if (op.badge && !op.triste) estrellas++;
    const expr = op.triste ? 'triste' : 'contenta';
    const fb = document.createElement('div');
    fb.className = 'feedback';
    const cop = document.createElement('canvas');
    cop.className = 'copechi grande';
    cop.width = cop.height = 32;
    expresion(cop, expr);
    const ic = document.createElement('div');
    ic.style.fontSize = '48px';
    ic.textContent = op.icono;
    const tx = document.createElement('p');
    tx.className = 'tarjeta';
    tx.textContent = op.feedback;
    const bv = document.createElement('button');
    bv.className = 'btn bocina';
    bv.textContent = '🔊';
    bv.setAttribute('aria-label', 'Escuchar otra vez');
    bv.addEventListener('click', () => hablar(op.feedback));
    const sig = document.createElement('button');
    sig.className = 'btn grande';
    sig.textContent = op.triste ? '🔁 Intentar otra vez' : '➡️ Seguir';
    sig.addEventListener('click', () => { fb.remove(); irA(op.next); });
    fb.append(cop, ic, tx, bv, sig);
    $('juego').append(fb);
    expresion($('copechi'), expr);
    hablar(op.feedback);
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
    try { datos = await (await fetch('data/scenes.json')).json(); return true; }
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
  $('btn-listo').addEventListener('click', () => { estrellas = 0; irA(datos.inicio); });
  $('btn-voz').addEventListener('click', () => hablar(ultimaVoz));
  $('btn-voz-final').addEventListener('click', () => hablar(ultimaVoz));
  $('btn-debate').addEventListener('click', () => { mostrar('debate'); hablar(preguntas.join(' ')); });
  $('btn-voz-debate').addEventListener('click', () => hablar(ultimaVoz));
  $('btn-reiniciar').addEventListener('click', () => { mostrar('avatar'); hablar('¡Crea tu personaje! Toca las flechas.'); });

  ARTE.animar();
})();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
