// Máscara de linha. Texto nunca é scrubado: entra e sai por tempo.
// O estado (dentro/fora) fica guardado para sobreviver ao re-split (autoSplit em resize/fonte).
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { IN, OUT, RM } from './ease.js';

gsap.registerPlugin(SplitText);

const HIDE = 140;

export function splitLines(el) {
  const st = { el, shown: false, lines: [] };
  SplitText.create(el, {
    type: 'lines',
    mask: 'lines',
    linesClass: 'ln',
    autoSplit: true,
    onSplit(self) {
      st.lines = self.lines;
      gsap.set(st.lines, RM ? { autoAlpha: st.shown ? 1 : 0, yPercent: 0 } : { yPercent: st.shown ? 0 : HIDE });
    },
  });
  return st;
}

// dir 1: rolando para baixo (entra de baixo, sai por cima); -1: o contrário.
export function linesIn(st, { dir = 1, delay = 0, duration = 1.05, stagger = 0.075 } = {}) {
  st.shown = true;
  gsap.killTweensOf(st.lines);
  if (RM) return gsap.to(st.lines, { autoAlpha: 1, duration: 0.3, delay });
  return gsap.fromTo(st.lines, { yPercent: dir > 0 ? HIDE : -HIDE }, { yPercent: 0, duration, ease: IN, stagger, delay, overwrite: true });
}

export function linesOut(st, { dir = 1, delay = 0, duration = 0.42, stagger = 0.035 } = {}) {
  st.shown = false;
  gsap.killTweensOf(st.lines);
  if (RM) return gsap.to(st.lines, { autoAlpha: 0, duration: 0.2, delay });
  return gsap.to(st.lines, { yPercent: dir > 0 ? -HIDE : HIDE, duration, ease: OUT, stagger, delay, overwrite: true });
}

// Bloco fora de pin: entra uma vez quando o scroll cruza o marco.
export function revealOnce(el, ScrollTrigger, start = 'top 84%') {
  const st = splitLines(el);
  ScrollTrigger.create({ trigger: el, start, once: true, onEnter: () => linesIn(st) });
  return st;
}
