/** Full-viewport cinematic wipe between shell and game. */
export function runHandoff(mode: 'to-game' | 'to-shell'): Promise<void> {
  return new Promise((resolve) => {
    const el = document.createElement('div');
    el.className = `handoff handoff--${mode}`;
    el.innerHTML = `
      <div class="handoff__wash"></div>
      <p class="handoff__label">${mode === 'to-game' ? 'Entrando a Uruguay…' : 'Volviendo al portal…'}</p>
    `;
    document.body.append(el);
    // force reflow
    void el.offsetWidth;
    el.classList.add('handoff--play');

    window.setTimeout(() => {
      el.remove();
      resolve();
    }, mode === 'to-game' ? 900 : 700);
  });
}
