import '@fontsource-variable/inter-tight';
import '@fontsource-variable/jetbrains-mono';
import './styles/tokens.css';
import './styles/base.css';
import './sections/nav.css';
import './sections/stage.css';
import './sections/spec.css';
import './sections/unfold.css';
import './sections/cam.css';
import './sections/price.css';
import './sections/loja.css';
import './sections/foot.css';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { stage } from './motion/stage.js';
import { spec } from './motion/spec.js';
import { unfold } from './motion/unfold.js';
import { cam } from './motion/cam.js';
import { price } from './motion/price.js';
import { loja } from './motion/loja.js';
import { foot } from './motion/foot.js';
import { nav } from './motion/nav.js';
import { smooth } from './motion/smooth.js';
import { cursor } from './motion/cursor.js';
import { easeInOutCubic } from './motion/ease.js';

gsap.registerPlugin(ScrollTrigger);
history.scrollRestoration = 'manual';
scrollTo(0, 0);

// a seção depois do palco sobe por cima dele (margem de −1 tela)
const specEl = document.querySelector('.spec');
const overlap = () => (specEl.style.marginTop = `${-innerHeight}px`);
overlap();
ScrollTrigger.addEventListener('refreshInit', overlap);

let reveal;
const heroReady = new Promise((r) => (reveal = r));

// pins na ordem da página, antes do Lenis
const st = stage({ onHeroReady: () => reveal() });
spec();
unfold();
cam();
price();
loja();
foot();
const lenis = smooth();
const n = nav(lenis);
cursor();

// "Ver o voo": piloto automático até a filmagem abrir (u 6,5) em 7,5 s
document.querySelector('[data-autopilot]').addEventListener('click', (e) => {
  e.preventDefault();
  const y = st.scrollFor(6.5);
  if (lenis) lenis.scrollTo(y, { duration: 7.5, easing: easeInOutCubic, lock: false });
  else scrollTo({ top: y });
});

// abertura: sem loading; aparece quando o 1º quadro estiver desenhado (no máximo 1,5 s)
Promise.race([heroReady, new Promise((r) => setTimeout(r, 1500))]).then(() => {
  document.documentElement.classList.remove('js-wait');
  n.show();
  st.intro();
});

// fontes e alturas: refresh dois quadros depois
const refresh = () => requestAnimationFrame(() => requestAnimationFrame(() => { ScrollTrigger.refresh(); lenis?.resize(); }));
document.fonts?.ready.then(refresh);
let rt;
const ro = new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(refresh, 200); });
document.querySelectorAll('.spec, .price, .loja').forEach((s) => ro.observe(s));
