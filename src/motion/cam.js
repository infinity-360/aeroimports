// A câmera: a peça em quatro fatias começa montada e se abre no eixo da lente (0 → 62% do pin).
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { splitLines, linesIn, linesOut } from './split.js';
import { IN, OUT, MOVE3, RM, MOBILE } from './ease.js';

const MONTADO = [35.6, 7.2, -5.5, -18.1];
const ABERTO = [-17.8, -3.6, 2.8, 9.1];
const FLUTUA = [-3, 2.5, -2, 3];

export function cam() {
  const root = document.querySelector('.cam');
  const view = root.querySelector('.cam__view');
  const g = root.querySelector('.gimbal');
  const parts = [...root.querySelectorAll('.gimbal__part')];
  const axis = root.querySelector('.gimbal__axis');
  const read = root.querySelector('.gimbal__read b');
  const labs = [...root.querySelectorAll('.glab')];
  const head = [...root.querySelectorAll('.cam__head .label, .cam__head [data-split]')].map(splitLines);
  const headTick = root.querySelector('.cam__head .label i');
  const labSplits = labs.map((l) => [...l.querySelectorAll('p')].map(splitLines));

  parts.forEach((p, i) => gsap.set(p, { xPercent: MONTADO[i], yPercent: 0 }));
  gsap.set(g, { scale: 0.9 });
  gsap.set(labs.map((l) => l.querySelector('i')), { scaleY: 0 });
  gsap.set(headTick, { scaleX: 0 });

  // decodifica as fatias 1,5 tela antes do pin
  ScrollTrigger.create({ trigger: root, start: () => `top bottom+=${1.5 * innerHeight}`, once: true, onEnter: () => parts.forEach((p) => p.decode?.().catch(() => {})) });

  const tl = gsap.timeline({ defaults: { ease: 'none' } });
  const mob = MOBILE();
  tl.to(g, { scale: 1, duration: 0.62, ease: MOVE3 }, 0);
  parts.forEach((p, i) => tl.to(p, { xPercent: ABERTO[i], yPercent: FLUTUA[i], duration: 0.6, ease: MOVE3 }, 0.02 * i));
  tl.fromTo(axis, { scaleX: 0 }, { scaleX: 1, duration: 0.62, ease: MOVE3 }, 0);
  // celular: trilho; a câmera aproxima até o tamanho real e corre da lente até a base
  if (mob) tl.fromTo(g, { x: 0 }, { scale: 1.5, x: () => -0.5 * innerWidth, duration: 0.95, ease: MOVE3, immediateRender: false }, 0.02);
  tl.set({}, {}, 1);

  let labsOn = false, headOn = false;
  ScrollTrigger.create({
    trigger: view,
    start: 'top top',
    end: () => '+=' + (mob ? 2.2 : 1.5) * innerHeight,
    pin: true,
    scrub: true,
    animation: RM ? null : tl,
    onUpdate(self) {
      const p = self.progress;
      const d = self.direction;
      // leitura do eixo oscila e assenta em zero
      const osc = p < 0.62 ? Math.sin(p * 38) * 2.4 * (1 - p / 0.62) : 0;
      read.textContent = osc.toFixed(1).replace('.', ',').replace('-0,0', '0,0');
      if (RM) parts.forEach((el, i) => gsap.set(el, { xPercent: p > 0.3 ? ABERTO[i] : MONTADO[i] }));
      const want = p > 0.64;
      if (want !== labsOn) {
        labsOn = want;
        labs.forEach((l, i) => {
          const tick = l.querySelector('i');
          if (want) {
            gsap.to(tick, { scaleY: 1, duration: RM ? 0 : 0.9, ease: IN, delay: i * 0.08, overwrite: true });
            labSplits[i].forEach((s, k) => linesIn(s, { dir: 1, delay: 0.1 + i * 0.08 + k * 0.06 }));
          } else {
            gsap.to(tick, { scaleY: 0, duration: 0.35, ease: OUT, overwrite: true });
            labSplits[i].forEach((s) => linesOut(s, { dir: -1 }));
          }
        });
      }
    },
  });

  // título da seção: por tempo, quando a seção chega
  ScrollTrigger.create({
    trigger: root, start: 'top 55%', end: 'bottom 30%',
    onToggle(self) {
      if (self.isActive === headOn) return;
      headOn = self.isActive;
      head.forEach((s, i) => (headOn ? linesIn(s, { dir: self.direction, delay: i * 0.08 }) : linesOut(s, { dir: self.direction })));
      gsap.to(headTick, { scaleX: headOn ? 1 : 0, duration: headOn ? 1.1 : 0.35, ease: headOn ? IN : OUT });
    },
  });
}
