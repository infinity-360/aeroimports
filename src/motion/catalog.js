// Produtos DJI: abas (Novidades, Drones, Câmeras, Estabilizadores e áudio, Acessórios).
// Sem preço: cada item abre o WhatsApp da loja com o nome do produto.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { revealOnce } from './split.js';
import { IN, OUT, RM } from './ease.js';

const WA = '5544991375357';
const BASE = import.meta.env.BASE_URL;

// n: nome · f: arquivo em public/img/dji · d: descrição curta · c: abas · novo: lançamento
const P = [
  { n: 'DJI Osmo Pocket 4P', f: 'pocket-4p.jpg', d: 'Câmera de bolso com gimbal de 3 eixos, a mais nova da linha Pocket.', c: ['novidades', 'cameras'], novo: true },
  { n: 'DJI Osmo 360 II', f: 'osmo-360-ii.jpg', d: 'Grava tudo em volta em 8K. Você escolhe o enquadramento depois.', c: ['novidades', 'cameras'], novo: true },
  { n: 'DJI Lito X1', f: 'lito-x1.png', d: 'Drone premium para iniciantes, com sensor de 1/1,3″.', c: ['novidades', 'drones'], novo: true },
  { n: 'DJI Lito 1', f: 'lito-1.png', d: 'O jeito mais fácil de começar: detecção omnidirecional e ActiveTrack.', c: ['novidades', 'drones'], novo: true },
  { n: 'DJI Mic Mini 2S', f: 'mic-mini-2s.jpg', d: 'Microfone sem fio pequeno e leve, para celular e câmera.', c: ['novidades', 'audio'], novo: true },
  { n: 'DJI Osmo Mobile 8P', f: 'mobile-8p.jpg', d: 'Estabilizador de celular com rastreamento inteligente.', c: ['novidades', 'audio'], novo: true },
  { n: 'DJI Osmo Pocket 4', f: 'pocket-4.jpg', d: 'Vlog estável sem esforço: gimbal de 3 eixos na palma da mão.', c: ['novidades', 'cameras'], novo: true },
  { n: 'DJI Avata 2 + Goggles N3', f: 'avata-2.jpg', d: 'Voo FPV imersivo com óculos e controle por movimento.', c: ['novidades', 'drones'], novo: true },
  { n: 'DJI Mini 5 Pro', f: 'mini-5-pro.jpg', d: 'Sensor de 1 polegada e detecção de obstáculos num drone de bolso.', c: ['drones'] },
  { n: 'DJI Neo 2', f: 'neo-2.jpg', d: 'O mais compacto da DJI, agora com detecção de obstáculos em todas as direções.', c: ['drones'] },
  { n: 'DJI Flip', f: 'flip.jpg', d: 'Dobrável e com protetor de hélices: feito para vlog.', c: ['drones'] },
  { n: 'DJI Air 3S', f: 'air-3s.jpg', d: 'Duas câmeras: paisagem aberta e zoom no mesmo voo.', c: ['drones'] },
  { n: 'DJI Mavic 4 Pro', f: 'mavic-4-pro.jpg', d: 'Três câmeras, com a principal Hasselblad de 100 MP.', c: ['drones'] },
  { n: 'DJI Neo', f: 'neo.jpg', d: 'Decola e pousa na palma da mão e segue você filmando em 4K.', c: ['drones'] },
  { n: 'DJI Mini 3', f: 'mini-3.jpg', d: 'Ultraleve, 4K HDR e gravação vertical para o Instagram.', c: ['drones'] },
  { n: 'DJI Osmo Action 6', f: 'action-6.jpg', d: 'Câmera de ação para água, trilha e moto.', c: ['cameras'] },
  { n: 'DJI RS 5', f: 'rs-5.jpg', d: 'Estabilizador profissional para câmeras mirrorless.', c: ['audio'] },
  { n: 'DJI Mic 3', f: 'mic-3.jpg', d: 'Dois microfones sem fio, receptor e case de carga.', c: ['audio'] },
  { n: 'DJI Goggles N3', f: 'goggles-n3.jpg', d: 'Óculos FPV para DJI Neo, Neo 2 e Avata 2.', c: ['acessorios'] },
  { n: 'Controle DJI RC 2', f: 'rc-2.jpg', d: 'Controle com tela Full HD de 5,5″ para Mini, Air, Flip e Mavic.', c: ['acessorios'] },
];

const TABS = [
  ['novidades', 'Novidades'],
  ['drones', 'Drones'],
  ['cameras', 'Câmeras'],
  ['audio', 'Estabilizadores e áudio'],
  ['acessorios', 'Acessórios'],
];
const CAT = { drones: 'Drone', cameras: 'Câmera', audio: 'Estabilizador e áudio', acessorios: 'Acessório', novidades: 'Lançamento' };

const waHref = (name) =>
  `https://wa.me/${WA}?text=${encodeURIComponent(`Olá! Vim pelo site da Aeroimports e quero consultar o preço e a disponibilidade do ${name}.`)}`;

function tile(p) {
  const cat = CAT[p.c.find((c) => c !== 'novidades') || p.c[0]];
  return `<li class="prod">
    <a class="prod__a" href="${waHref(p.n)}" target="_blank" rel="noopener" aria-label="Consultar ${p.n} no WhatsApp">
      <span class="prod__media"><img src="${BASE}img/dji/${p.f}" width="640" height="640" alt="${p.n}" loading="lazy" decoding="async" />${p.novo ? '<span class="prod__new mono">Novo</span>' : ''}</span>
      <span class="prod__cat mono">${cat}</span>
      <span class="prod__name">${p.n}</span>
      <span class="prod__desc">${p.d}</span>
      <span class="prod__cta"><span class="roll" data-t="Consultar preço">Consultar preço</span><span class="prod__wa" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4" /></svg></span></span>
    </a>
  </li>`;
}

export function catalog() {
  const root = document.querySelector('.cat');
  const grid = root.querySelector('.cat__grid');
  const seg = root.querySelector('.cat__tabs');
  const pill = seg.querySelector('.seg__pill');
  seg.insertAdjacentHTML('beforeend', TABS.map(([k, l]) => `<button role="tab" aria-selected="false" data-tab="${k}">${l}</button>`).join(''));
  const btns = [...seg.querySelectorAll('button')];
  let tab = null, busy = null;

  root.querySelectorAll('[data-reveal]').forEach((el) => revealOnce(el, ScrollTrigger));
  const tick = root.querySelector('.label i');
  gsap.set(tick, { scaleX: 0 });

  function movePill(animate) {
    const b = btns.find((x) => x.dataset.tab === tab);
    if (!b) return;
    const vars = { x: b.offsetLeft, y: b.offsetTop, width: b.offsetWidth, height: b.offsetHeight };
    animate && !RM ? gsap.to(pill, { ...vars, duration: 0.8, ease: 'expo.inOut' }) : gsap.set(pill, vars);
  }

  const tilesIn = () => {
    const items = grid.querySelectorAll('.prod');
    if (RM) return gsap.set(items, { clipPath: 'inset(0% 0 0 0)' });
    gsap.fromTo(items, { clipPath: 'inset(100% 0 0 0)', y: 40 }, { clipPath: 'inset(0% 0 0 0)', y: 0, duration: 1.2, ease: IN, stagger: 0.06 });
  };

  function show(next, animate = true) {
    if (next === tab) return;
    tab = next;
    btns.forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === tab)));
    movePill(animate);
    const render = () => {
      grid.innerHTML = P.filter((p) => p.c.includes(tab)).map(tile).join('');
      if (animate) tilesIn();
      ScrollTrigger.refresh();
    };
    busy?.kill();
    const old = grid.querySelectorAll('.prod');
    if (animate && !RM && old.length) busy = gsap.to(old, { clipPath: 'inset(0 0 100% 0)', duration: 0.42, ease: OUT, stagger: 0.025, onComplete: render });
    else render();
  }

  btns.forEach((b) => b.addEventListener('click', () => show(b.dataset.tab)));
  seg.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const i = btns.findIndex((b) => b.dataset.tab === tab);
    const n = btns[(i + (e.key === 'ArrowRight' ? 1 : btns.length - 1)) % btns.length];
    show(n.dataset.tab); n.focus();
  });

  show('novidades', false);
  gsap.set(grid.querySelectorAll('.prod'), { clipPath: 'inset(100% 0 0 0)' });
  ScrollTrigger.create({
    trigger: grid, start: 'top 85%', once: true,
    onEnter() { tilesIn(); gsap.to(tick, { scaleX: 1, duration: 1.1, ease: IN }); },
  });
  addEventListener('resize', () => movePill(false));
  document.fonts?.ready.then(() => movePill(false));
}
