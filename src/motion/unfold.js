// "Abre": o macro do drone abrindo os braços, preso ao scroll (2,4 telas; 2,8 no celular).
// Fração do clipe = (p − CLIP.a) / CLIP.len: primeiro e último quadro param um pouco nas pontas.
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { frameScroll } from './frame-scroll.js';
import { beats } from './beats.js';
import { MOBILE, clamp01 } from './ease.js';

const CLIP = { a: 0.06, len: 0.84 };
const BASE = import.meta.env.BASE_URL;
const HD = new URLSearchParams(location.search).has('hd');

export function unfold() {
  const root = document.querySelector('.unfold');
  const view = root.querySelector('.unfold__view');
  const q = (k) => root.querySelector(`[data-ubeat="${k}"]`);
  const marks = beats([
    { el: q('A'), a: 0.1, b: 0.5 },
    { el: q('B'), a: 0.56, b: 2 },
  ]);
  const player = frameScroll({
    section: view,
    canvas: root.querySelector('.unfold__canvas'),
    base: `${BASE}frames/desdobra${HD ? '-hd' : ''}`,
    fallback: HD ? `${BASE}frames/desdobra` : undefined,
    lazy: true,
    end: () => '+=' + (MOBILE() ? 2.8 : 2.4) * innerHeight,
    remap: (p) => clamp01((p - CLIP.a) / CLIP.len),
    onProgress: (p) => marks.update(p, player?.trigger?.direction ?? 1),
  });
  // baixa 2 telas antes de aparecer
  ScrollTrigger.create({ trigger: root, start: () => `top bottom+=${2 * innerHeight}`, once: true, onEnter: () => player.load() });
  addEventListener('resize', () => player.resize());
  return player;
}
