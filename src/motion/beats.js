// Marcos de texto por janela de progresso (dentro dos pins).
// Lista { el, a, b }; a cada update acha a janela ativa e troca por tempo, com a direção da rolagem.
import { gsap } from 'gsap';
import { splitLines, linesIn, linesOut } from './split.js';
import { IN, OUT, RM } from './ease.js';

export function beats(list) {
  const items = list.map(({ el, a, b }) => ({
    el, a, b,
    splits: [...el.querySelectorAll('.label, [data-split]')].map(splitLines),
    tick: el.querySelector('.label i'),
  }));
  let active = -1;

  function show(it, dir) {
    gsap.killTweensOf(it.el);
    gsap.set(it.el, { visibility: 'visible' });
    it.splits.forEach((s, i) => linesIn(s, { dir, delay: i * 0.08 }));
    if (it.tick) gsap.fromTo(it.tick, { scaleX: 0 }, { scaleX: 1, duration: RM ? 0 : 1.1, ease: IN, delay: 0.15 });
  }
  function hide(it, dir) {
    it.splits.forEach((s) => linesOut(s, { dir }));
    if (it.tick) gsap.to(it.tick, { scaleX: 0, duration: 0.35, ease: OUT });
    gsap.delayedCall(0.75, () => { if (items[active] !== it) gsap.set(it.el, { visibility: 'hidden' }); });
  }

  return {
    update(u, dir = 1) {
      const i = items.findIndex((it) => u >= it.a && u < it.b);
      if (i === active) return;
      if (active > -1) hide(items[active], dir);
      active = i;
      if (i > -1) show(items[i], dir);
    },
  };
}
