// Sobre a filmagem, no desktop com mouse, o cursor vira uma mira com coordenadas (Cianorte, PR).
import { gsap } from 'gsap';

export function cursor() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  document.documentElement.classList.add('has-cursor');
  const el = document.querySelector('.cursor');
  const read = el.querySelector('.cursor__read');
  const stage = document.querySelector('.stage');
  const xTo = gsap.quickTo(el, 'x', { duration: 0.25, ease: 'power3.out' });
  const yTo = gsap.quickTo(el, 'y', { duration: 0.25, ease: 'power3.out' });
  const dms = (v, a, b) => {
    const d = Math.floor(v), m = Math.floor((v - d) * 60);
    return `${d}°${String(m).padStart(2, '0')}′${v >= 0 ? a : b}`;
  };
  addEventListener('pointermove', (e) => {
    xTo(e.clientX); yTo(e.clientY);
    const on = stage.classList.contains('is-hud');
    el.classList.toggle('is-on', on);
    if (on) {
      const lat = 23.66 + (e.clientY / innerHeight - 0.5) * 0.02;
      const lon = 52.6 + (e.clientX / innerWidth - 0.5) * 0.03;
      read.textContent = `${dms(lat, 'S', 'S')} · ${dms(lon, 'O', 'O')}`;
    }
  });
}
