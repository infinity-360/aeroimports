import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { odometer } from './odometer.js';
import { revealOnce } from './split.js';
import { IN, RM } from './ease.js';

export function spec() {
  const root = document.querySelector('.spec');
  const dune = root.querySelector('.dune');
  const img = root.querySelector('.spec__img');

  // duna: achata até virar reta quando o topo da seção chega ao topo da tela
  if (!RM) {
    gsap.fromTo(dune, { scaleY: 1 }, { scaleY: 0, ease: 'none', scrollTrigger: { trigger: root, start: 'top bottom', end: 'top top', scrub: true } });
    gsap.fromTo(img, { scale: 1.18, yPercent: -3 }, { scale: 1, yPercent: 3, ease: 'none', scrollTrigger: { trigger: root, start: 'top 60%', end: 'bottom bottom', scrub: true } });
  } else gsap.set(img, { scale: 1 });

  root.querySelectorAll('[data-split][data-reveal], .label[data-reveal]').forEach((el) => revealOnce(el, ScrollTrigger));
  root.querySelectorAll('.label i').forEach((i) => gsap.set(i, { scaleX: 0 }));
  ScrollTrigger.create({ trigger: root.querySelector('.label'), start: 'top 84%', once: true, onEnter: () => gsap.to(root.querySelector('.label i'), { scaleX: 1, duration: 1.1, ease: IN }) });

  root.querySelectorAll('.spec__row').forEach((row) => {
    const odo = odometer(row.querySelector('.odo'));
    const line = row.querySelector('.spec__line');
    ScrollTrigger.create({
      trigger: row, start: 'top 84%', once: true,
      onEnter() {
        gsap.to(line, { scaleX: 1, duration: RM ? 0 : 1.3, ease: IN });
        odo.run();
      },
    });
  });
}
