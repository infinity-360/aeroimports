// Contador mecânico: cada dígito é uma coluna (vazio + quatro voltas de 0–9) atrás de uma janela de 1em.
import { gsap } from 'gsap';
import { RM } from './ease.js';

const ROWS = 41; // 1 vazio + 40

export function odometer(el) {
  const value = String(el.dataset.odo);
  el.textContent = '';
  el.setAttribute('aria-label', value);
  const cols = [...value].map((ch) => {
    const d = document.createElement('span');
    d.className = 'odo__d';
    d.setAttribute('aria-hidden', 'true');
    const col = document.createElement('span');
    col.className = 'odo__col';
    col.innerHTML = '<span>&nbsp;</span>' + Array.from({ length: 40 }, (_, i) => `<span>${i % 10}</span>`).join('');
    d.appendChild(col);
    el.appendChild(d);
    return { col, n: +ch };
  });
  gsap.set(cols.map((c) => c.col), { yPercent: 0 });
  return {
    run() {
      cols.forEach(({ col, n }, i) => {
        const idx = 1 + 20 + n; // uma volta inteira antes de parar no valor
        const y = (-idx / ROWS) * 100;
        if (RM) return gsap.set(col, { yPercent: y });
        gsap.to(col, { yPercent: y, duration: 1.9, ease: 'expo.out', delay: (cols.length - 1 - i) * 0.09 });
      });
    },
  };
}
