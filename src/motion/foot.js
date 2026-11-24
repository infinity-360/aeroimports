// Rodapé "volta sozinho": a página levanta e revela o último quadro da decolagem.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { splitLines, linesIn, linesOut } from './split.js';
import { IN, OUT, RM } from './ease.js';

const KM = 1.8;

export function foot() {
  const root = document.querySelector('.foot');
  const page = document.querySelector('.page');
  const bg = root.querySelector('.foot__bg img');
  const km = root.querySelector('.foot__kmtxt');
  const title = splitLines(root.querySelector('.foot__t'));
  const letters = [...root.querySelectorAll('.foot__word .wm__l > span')];
  gsap.set(letters, { yPercent: RM ? 0 : -135 });

  let tIn = false, wIn = false, landed = false;
  ScrollTrigger.create({
    trigger: page,
    start: 'bottom bottom',
    end: 'bottom top',
    scrub: true,
    onUpdate(self) {
      const p = self.progress;
      gsap.set(bg, { scale: RM ? 1 : 1.16 - 0.16 * p });
      const left = KM * (1 - Math.min(1, p / 0.95));
      if (p >= 0.95 && !landed) { landed = true; km.textContent = 'Pousou na loja'; }
      else if (p < 0.95) { landed = false; km.innerHTML = `Voltando para a loja · <b>${left.toFixed(1).replace('.', ',')}</b> km`; }
      const wantT = p > 0.3;
      if (wantT !== tIn) { tIn = wantT; wantT ? linesIn(title, { dir: 1 }) : linesOut(title, { dir: -1 }); }
      const wantW = p > 0.62;
      if (wantW !== wIn && !RM) {
        wIn = wantW;
        gsap.to(letters, wantW
          ? { yPercent: 0, duration: 1.15, ease: IN, stagger: 0.045, overwrite: true }
          : { yPercent: -135, duration: 0.6, ease: OUT, stagger: 0.025, overwrite: true });
      }
    },
  });
}
