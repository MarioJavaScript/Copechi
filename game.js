// Fase 0: solo carga la escena de prueba. El motor llega en la Fase 1.
(async () => {
  const app = document.getElementById('app');
  try {
    const datos = await (await fetch('data/scenes.json')).json();
    app.textContent = datos.escenas[datos.inicio].text;
  } catch (e) {
    app.textContent = 'No se pudo cargar el juego.';
  }
})();
