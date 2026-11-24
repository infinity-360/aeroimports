// Comprar: seletor de kit; a foto troca por varredura diagonal (o vento cobre com areia),
// a lista e o texto trocam por máscara e o botão leva ao WhatsApp com o kit escolhido.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { revealOnce } from './split.js';
import { IN, OUT, MOVE, RM } from './ease.js';

const WA = '5544991375357';
const KITS = {
  ela: { nome: 'só o drone', sub: 'Drone, controle, 1 bateria e hélices extras.' },
  longo: { nome: 'Fly More (com 3 baterias e bolsa)', sub: 'Kit com 3 baterias, hub de carga e bolsa.' },
};

export function price() {
  const root = document.querySelector('.price');
  const clip = root.querySelector('.price__clip');
  const imgs = root.querySelectorAll('.price__img');
  const ela = root.querySelector('.price__img--ela');
  const tag = root.querySelector('.price__tag');
  const seg = root.querySelector('.seg');
  const pill = seg.querySelector('.seg__pill');
  const btns = [...seg.querySelectorAll('button')];
  const sub = root.querySelector('.price__subtxt');
  const items = [...root.querySelectorAll('.price__list li')];
  const buy = root.querySelector('[data-wa-buy]');
  let kit = 'longo';

  root.querySelectorAll('[data-reveal]').forEach((el) => revealOnce(el, ScrollTrigger));
  const tick = root.querySelector('.label i');
  gsap.set(tick, { scaleX: 0 });
  gsap.set(root.querySelectorAll('.price__list .ln'), { scaleX: 0 });

  // a foto abre de baixo para cima por recorte, com zoom de volta
  ScrollTrigger.create({
    trigger: root, start: 'top 70%', once: true,
    onEnter() {
      gsap.to(clip, { clipPath: 'inset(0% 0 0 0)', duration: RM ? 0 : 1.5, ease: MOVE });
      gsap.to(imgs, { scale: 1, duration: RM ? 0 : 1.9, ease: IN });
      gsap.to(tick, { scaleX: 1, duration: 1.1, ease: IN, delay: 0.2 });
      gsap.to(root.querySelectorAll('.price__list li:not(.is-off) .ln'), { scaleX: 1, duration: 1.3, ease: IN, stagger: 0.08, delay: 0.4 });
    },
  });

  function movePill(animate = true) {
    const b = btns.find((x) => x.dataset.kit === kit);
    const vars = { x: b.offsetLeft - 4 + 4, width: b.offsetWidth };
    animate && !RM ? gsap.to(pill, { ...vars, duration: 0.8, ease: 'expo.inOut' }) : gsap.set(pill, vars);
  }

  function waLink() {
    const msg = `Olá! Vim pelo site da Aeroimports e quero o preço do drone DJI: ${KITS[kit].nome}.`;
    buy.href = `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;
  }

  function apply(next, animate = true) {
    if (next === kit && animate) return;
    kit = next;
    btns.forEach((b) => b.setAttribute('aria-checked', String(b.dataset.kit === kit)));
    movePill(animate);
    waLink();
    // varredura diagonal no sentido das ondulações
    const to = kit === 'ela' ? '0% 0' : '100% 0';
    if (animate && !RM) gsap.to(ela, { maskPosition: to, webkitMaskPosition: to, duration: 1.3, ease: 'power3.inOut' });
    else gsap.set(ela, { maskPosition: to, webkitMaskPosition: to });
    gsap.to(tag, { autoAlpha: kit === 'ela' ? 1 : 0.0001, duration: 0.4 });
    // texto troca por máscara
    if (animate && !RM) {
      gsap.timeline()
        .to(sub, { yPercent: -110, duration: 0.35, ease: OUT })
        .add(() => (sub.textContent = KITS[kit].sub))
        .fromTo(sub, { yPercent: 110 }, { yPercent: 0, duration: 0.8, ease: IN });
    } else sub.textContent = KITS[kit].sub;
    items.forEach((li) => {
      const only = li.dataset.only;
      li.classList.toggle('is-off', !!only && only !== kit);
      if (only === kit && animate) gsap.fromTo(li.querySelector('.ln'), { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: IN });
    });
    ScrollTrigger.refresh();
  }

  btns.forEach((b) => b.addEventListener('click', () => apply(b.dataset.kit)));
  seg.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const next = kit === 'ela' ? 'longo' : 'ela';
    apply(next);
    btns.find((x) => x.dataset.kit === next).focus();
  });
  apply('longo', false);
  addEventListener('resize', () => movePill(false));
  document.fonts?.ready.then(() => movePill(false));
}
