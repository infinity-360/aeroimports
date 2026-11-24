// O palco: um pin só de 9,4 telas (u). Roteiro:
//   0 → 0,35     hero no 1º quadro; u > 0,03 o nome afunda letra por letra
//   0,35 → 4,5   decolagem: 192 quadros (8 s) em 4,15 u → 0,51875 u por segundo de clipe
//                altímetro: ALT = 0 até LIFTOFF (1,5 s); depois ALT_MAX × ((t − 1,5) / 6,1)^1,4 → 120 m em TOP (7,6 s)
//                marcos A t 1,0–3,6 s (u 0,869–2,218) · B 3,9–6,5 s (u 2,373–3,722) · C 6,8 s → u 4,95
//   4,5 → 5,0    último quadro parado; altímetro sai em 4,95
//   5,0 → 5,55   a tela do controle sobe (108% → 0, power3.out); paisagem sobe 12%, cresce 20%, escurece 45%
//                marco D 5,2 → 5,75
//   5,55 → 6,25  a tela abre até a borda (power2.inOut); contorno some nos primeiros 60%; REC em 6,2
//   6,25 → 9,4   o que ele vê (HUD); marcos E 6,35 → 7,35 · F 7,45 → fim; filmagem corre de u 5,0 a 9,4
//   8,4 → 9,4    a seção seguinte sobe por cima com a borda em duna
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { framePlayer } from './frame-scroll.js';
import { beats } from './beats.js';
import { IN, OUT, RM, MOBILE, clamp01, range, p3out, p2inOut } from './ease.js';
import { splitLines, linesIn, linesOut } from './split.js';

gsap.registerPlugin(ScrollTrigger);

export const TOTAL = 9.4;
const U0 = 0.35, U1 = 4.5, CLIP = 8;
const LIFTOFF = 1.5, TOP = 7.6, ALT_MAX = 120;
const BASE = import.meta.env.BASE_URL;
const HD = new URLSearchParams(location.search).has('hd');
const dir = (name) => `${BASE}frames/${name}${HD ? '-hd' : ''}`;

export function stage({ onHeroReady } = {}) {
  const root = document.querySelector('.stage');
  const q = (s) => root.querySelector(s);
  const takeoffCanvas = q('.stage__takeoff');
  const dim = q('.stage__dim');
  const remote = q('.remote');
  const lencoisCanvas = q('.stage__lencois');
  const alti = q('.alti'), altiVal = q('.alti__val b'), altiT = q('.alti__t'), ticks = q('.alti__ticks');
  const hudTime = q('.hud__time'), hudAlt = q('.hud__alt'), hudD = q('.hud__d'), hudBat = q('.hud__bat'), hudBi = q('.hud__bicon i');
  const prog = q('.hud__prog i'), reticle = q('.hud__reticle');

  // régua do altímetro: 0–160 m, traço a cada 5 m, número a cada 20 m
  const PX = 6; // px por metro
  for (let m = 0; m <= 160; m += 5) {
    const t = document.createElement('span');
    t.className = 'alti__tick' + (m % 20 === 0 ? ' is-big' : '');
    t.style.top = `${-m * PX}px`;
    if (m % 20 === 0) t.innerHTML = `<b>${m}</b>`;
    ticks.appendChild(t);
  }

  const takeoff = framePlayer({ canvas: takeoffCanvas, base: dir('decolagem'), fallback: HD ? dir('decolagem').replace('-hd', '') : undefined });
  const lencois = framePlayer({ canvas: lencoisCanvas, base: dir('lencois'), fallback: HD ? `${BASE}frames/lencois` : undefined, lazy: true });
  takeoff.first.then(() => onHeroReady?.());
  takeoff.ready.then(() => lencois.load());

  // ===== hero =====
  const letters = [...root.querySelectorAll('.hero__word .wm__l > span')];
  const heroP = splitLines(q('.hero__p'));
  const pill = q('.hero__pill'), badge = q('.hero__badge'), cue = q('.hero__scroll');
  let heroIn = false, introDone = false;
  gsap.set(letters, { yPercent: 135 });
  gsap.set(pill, { clipPath: 'inset(100% 0% 0% 0% round 99px)' });
  gsap.set([badge, cue], { autoAlpha: 0 });

  function heroShow(intro = false) {
    heroIn = true;
    gsap.to(letters, { yPercent: 0, duration: intro ? 1.15 : 1, ease: IN, stagger: 0.045, overwrite: true });
    linesIn(heroP, { dir: intro ? 1 : -1, delay: intro ? 0.35 : 0.1 });
    gsap.to(pill, { clipPath: 'inset(0% 0% 0% 0% round 99px)', duration: 1.1, ease: IN, delay: intro ? 0.6 : 0.15, overwrite: true });
    gsap.to([badge, cue], { autoAlpha: 1, duration: 0.8, ease: IN, delay: intro ? 0.7 : 0.1, overwrite: true });
  }
  function heroHide() {
    heroIn = false;
    gsap.to(letters, { yPercent: 135, duration: 0.7, ease: OUT, stagger: 0.032, overwrite: true });
    linesOut(heroP, { dir: 1 });
    gsap.to(pill, { clipPath: 'inset(100% 0% 0% 0% round 99px)', duration: 0.45, ease: OUT, overwrite: true });
    gsap.to([badge, cue], { autoAlpha: 0, duration: 0.35, ease: OUT, overwrite: true });
  }

  // ===== marcos =====
  const at = (t) => U0 + (t / CLIP) * (U1 - U0);
  const b = (k) => q(`[data-beat="${k}"]`);
  const marks = beats([
    { el: b('A'), a: at(1.0), b: at(3.6) },
    { el: b('B'), a: at(3.9), b: at(6.5) },
    { el: b('C'), a: at(6.8), b: 4.95 },
    { el: b('D'), a: 5.2, b: 5.75 },
    { el: b('E'), a: 6.35, b: 7.35 },
    { el: b('F'), a: 7.45, b: 99 },
  ]);

  // ===== gimbal da mira: segue a velocidade e volta =====
  const rotTo = gsap.quickTo(reticle, 'rotation', { duration: 0.9, ease: 'expo.out' });
  const yTo = gsap.quickTo(reticle, 'y', { duration: 0.9, ease: 'expo.out' });
  let settle;

  // ===== REC: o tempo corre de verdade enquanto a tela está aberta =====
  let recSec = 41, recTimer = null;
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  function rec(on) {
    root.classList.toggle('is-rec', on);
    if (on && !recTimer) recTimer = setInterval(() => (hudTime.textContent = fmt(++recSec)), 1000);
    if (!on && recTimer) clearInterval(recTimer), (recTimer = null);
  }

  let altiShown = false, remoteShown = false, lastDir = 1;

  function render(u, velocity = 0) {
    // decolagem
    const t = range(u, U0, U1) * CLIP;
    takeoff.seek(t / CLIP);
    const alt = t < LIFTOFF ? 0 : ALT_MAX * Math.pow(Math.min(1, (t - LIFTOFF) / (TOP - LIFTOFF)), 1.4);
    altiVal.textContent = String(Math.round(alt)).padStart(3, '0');
    altiT.textContent = `T+${t.toFixed(1).replace('.', ',').padStart(4, '0')} s`;
    ticks.style.transform = `translateY(${alt * PX}px)`;
    const wantAlti = u > U0 - 0.05 && u < 4.95;
    if (wantAlti !== altiShown) {
      altiShown = wantAlti;
      gsap.to(alti, { autoAlpha: wantAlti ? 1 : 0, duration: wantAlti ? 0.9 : 0.4, ease: wantAlti ? IN : OUT, overwrite: true });
    }

    // hero
    if (introDone) {
      if (u > 0.03 && heroIn) heroHide();
      else if (u <= 0.03 && !heroIn) heroShow();
    }

    // tela do controle
    const s0 = MOBILE() ? 0.56 : 0.46;
    const rise = RM ? (u >= 5 ? 1 : 0) : p3out(range(u, 5.0, 5.55));
    const openP = range(u, 5.55, 6.25);
    const open = RM ? (u >= 5.9 ? 1 : 0) : p2inOut(openP);
    const s = s0 + (1 - s0) * open;
    const wantRemote = u >= 5.0;
    if (wantRemote !== remoteShown) { remoteShown = wantRemote; remote.style.visibility = wantRemote ? 'visible' : 'hidden'; if (wantRemote) lencois.load(); }
    remote.style.transform = `translateY(${(1 - rise) * 108}%) scale(${s})`;
    remote.style.setProperty('--s', s.toFixed(4));
    remote.style.setProperty('--rad', `${(22 * (1 - open)).toFixed(2)}px`);
    remote.style.setProperty('--frame', (1 - clamp01(openP / 0.6)).toFixed(3));
    takeoffCanvas.style.transform = `translateY(${-12 * rise}%) scale(${1 + 0.2 * rise})`;
    dim.style.opacity = (0.45 * rise).toFixed(3);

    // filmagem
    const f = range(u, 5.0, TOTAL);
    lencois.seek(f);
    lencoisCanvas.style.transform = `scale(${1.04 + 0.18 * f})`;
    rec(u >= 6.2);
    const h = range(u, 6.25, TOTAL);
    hudAlt.textContent = Math.round(120 + 16 * h);
    hudD.textContent = (1.2 + 0.6 * h).toFixed(1).replace('.', ',');
    const bat = Math.round(71 - 3 * h);
    hudBat.textContent = bat;
    hudBi.style.width = `calc(${bat}% - 3px)`;
    prog.style.transform = `scaleX(${h})`;
    root.classList.toggle('is-hud', u > 6.25 && u < 8.4);
    document.body.classList.toggle('in-screen', u >= 5 && u < 8.6);

    if (!RM && u > 6 && u < 9.4) {
      const v = gsap.utils.clamp(-1, 1, velocity / 2600);
      rotTo(v * 7); yTo(v * 18);
      clearTimeout(settle);
      settle = setTimeout(() => { rotTo(0); yTo(0); }, 90);
    }

    marks.update(u, lastDir);
  }

  const trigger = ScrollTrigger.create({
    trigger: root,
    start: 'top top',
    end: () => '+=' + TOTAL * innerHeight,
    pin: true,
    scrub: true,
    refreshPriority: 1,
    anticipatePin: 1,
    onUpdate(self) {
      lastDir = self.direction;
      const u = self.progress * TOTAL;
      if (u > 2.5) lencois.load();
      render(u, self.getVelocity());
    },
  });

  addEventListener('resize', () => { takeoff.resize(); lencois.resize(); });
  render(0);

  return {
    trigger,
    takeoff,
    intro() { introDone = true; if (trigger.progress * TOTAL <= 0.03) heroShow(true); },
    scrollFor: (u) => trigger.start + (u / TOTAL) * (trigger.end - trigger.start),
  };
}
