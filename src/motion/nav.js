// Nav: some ao descer, volta ao subir. Ponto azul embaixo do link da seção da vez.
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function nav(lenis) {
  const el = document.querySelector('.nav');
  const links = [...el.querySelectorAll('[data-sec]')];
  const wa = document.querySelector('.wa-float');
  let last = 0;

  const onScroll = (y) => {
    const d = y - last;
    if (Math.abs(d) > 4) {
      el.classList.toggle('is-hidden', d > 0 && y > 120);
      last = y;
    }
    wa.classList.toggle('is-on', y > innerHeight * 0.5);
  };
  if (lenis) lenis.on('scroll', ({ scroll }) => onScroll(scroll));
  else addEventListener('scroll', () => onScroll(scrollY), { passive: true });

  const set = (id) => links.forEach((a) => a.classList.toggle('is-on', a.dataset.sec === id));
  const map = [
    ['.stage', 'voo'], ['.spec', 'drone'], ['.unfold', 'drone'], ['.cam', 'camera'], ['.price', 'comprar'], ['.loja', 'loja'], ['.foot', 'loja'],
  ];
  map.forEach(([sel, id]) => {
    ScrollTrigger.create({
      trigger: sel, start: 'top 50%', end: 'bottom 50%',
      onToggle: (self) => self.isActive && set(id),
    });
  });
  set('voo');

  // links internos pela rolagem suave
  document.querySelectorAll('a[href^="#"]:not([data-autopilot])').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      const t = id.length > 1 && document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      const top = id === '#voo' ? 0 : ScrollTrigger.getAll().find((s) => s.pin && s.trigger === t)?.start ?? t.getBoundingClientRect().top + scrollY;
      lenis ? lenis.scrollTo(top, { duration: 1.6 }) : scrollTo({ top });
    });
  });

  return {
    show() {
      el.classList.remove('is-still');
      requestAnimationFrame(() => requestAnimationFrame(() => el.classList.remove('is-hidden')));
    },
  };
}
