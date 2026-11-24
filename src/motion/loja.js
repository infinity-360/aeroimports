// A loja: vista 360° (Pannellum, carregado só quando a seção se aproxima).
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { revealOnce } from './split.js';
import { IN, MOVE, RM } from './ease.js';

const BASE = import.meta.env.BASE_URL;

function loadPannellum() {
  if (window.pannellum) return Promise.resolve(window.pannellum);
  return new Promise((resolve, reject) => {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = `${BASE}vendor/pannellum/pannellum.css`;
    document.head.appendChild(css);
    const s = document.createElement('script');
    s.src = `${BASE}vendor/pannellum/pannellum.js`;
    s.onload = () => resolve(window.pannellum);
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

export function loja() {
  const root = document.querySelector('.loja');
  const pano = root.querySelector('#pano');
  const tick = root.querySelector('.label i');
  root.querySelectorAll('[data-reveal]').forEach((el) => revealOnce(el, ScrollTrigger));
  gsap.set(tick, { scaleX: 0 });

  let viewer;
  ScrollTrigger.create({
    trigger: root, start: () => `top bottom+=${innerHeight}`, once: true,
    onEnter: () =>
      loadPannellum().then((p) => {
        viewer = p.viewer(pano, {
          type: 'equirectangular',
          panorama: `${BASE}img/loja-360.jpg`,
          autoLoad: true,
          yaw: 112, pitch: 2, hfov: 100, minHfov: 50, maxHfov: 110,
          minPitch: -25, maxPitch: 60,
          mouseZoom: false, // a roda continua rolando a página
          showZoomCtrl: true, showFullscreenCtrl: true,
          autoRotate: RM ? 0 : -1.6, autoRotateInactivityDelay: 4000,
          compass: false, friction: 0.12,
        });
      }).catch(() => {}),
  });

  ScrollTrigger.create({
    trigger: root, start: 'top 70%', once: true,
    onEnter() {
      gsap.to(pano, { clipPath: 'inset(0% 0 0 0 round 6px)', duration: RM ? 0 : 1.5, ease: MOVE });
      gsap.to(tick, { scaleX: 1, duration: 1.1, ease: IN, delay: 0.2 });
    },
  });
  return () => viewer;
}
