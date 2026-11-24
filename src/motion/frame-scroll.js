// Vídeo no scroll por frames (derivado de tools/frames-lab/frame-scroll.js).
//
// framePlayer(): só o player. Baixa os frames (1º, último, depois grosso → fino), desenha em "cover" num
// <canvas> e expõe seek(fração). Quem decide a fração é você: aqui, o palco (stage.js) dirige dois players
// com um pin só. Opções:
//   base / fallback   pasta dos frames (com manifest.json) e a pasta reserva se a primeira não existir (?hd)
//   lazy              não baixa até chamar load()
//   onLoad(n, total)  progresso do download (a intro mostra a contagem)
//   maxDpr            teto de devicePixelRatio do canvas (o frame de 1.440/1.920 px é que manda na nitidez)
//
// frameScroll(): o player + um ScrollTrigger com pin, para quando a seção tem um vídeo só.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function framePlayer({ canvas, base, fallback, lazy = false, onLoad, concurrency = 6, maxDpr = 1.5 }) {
  const ctx = canvas.getContext('2d', { alpha: false });
  const api = { manifest: null, loaded: 0, count: 0 };
  let images = [], count = 0, drawn = -1, started = false, frac = 0;
  let resolveReady, resolveFirst;
  api.ready = new Promise((r) => (resolveReady = r));
  api.first = new Promise((r) => (resolveFirst = r));

  const wanted = () => Math.round(Math.min(1, Math.max(0, frac)) * (count - 1));

  function nearestLoaded(i) {
    for (let d = 0; d < count; d++) {
      if (images[i - d]) return i - d;
      if (images[i + d]) return i + d;
    }
    return -1;
  }

  function draw(force = false) {
    if (!count) return;
    const want = wanted();
    const i = images[want] ? want : nearestLoaded(want);
    if (i < 0 || (i === drawn && !force)) return;
    const img = images[i];
    const { width: cw, height: ch } = canvas;
    const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const w = img.naturalWidth * s, h = img.naturalHeight * s;
    ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    drawn = i;
  }

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, maxDpr);
    const w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
    if (!w || !h || (w === canvas.width && h === canvas.height)) return;
    canvas.width = w; canvas.height = h;
    draw(true);
  }
  resize();
  addEventListener('resize', resize);

  api.seek = (f) => { frac = f; draw(); };
  api.draw = () => draw(true);
  api.resize = resize;
  api.frame = () => wanted();

  api.load = async () => {
    if (started) return api.ready;
    started = true;
    // ?hd no site publicado: os conjuntos HD não sobem (vite.config.js); cai no normal.
    // Servidores com fallback de SPA respondem 200 com o index.html: vale o JSON, não o status.
    const getManifest = (b) => fetch(`${b}/manifest.json`).then((r) => r.json()).catch(() => null);
    let manifest = await getManifest(base);
    if (!manifest && fallback) manifest = await getManifest((base = fallback));
    api.manifest = manifest;
    count = api.count = manifest.count;
    images = new Array(count);
    const url = (i) => `${base}/${String(i + 1).padStart(4, '0')}.${manifest.ext}`;
    const load = (i) => new Promise((resolve) => {
      const img = new Image();
      img.src = url(i);
      img.decode().then(() => { images[i] = img; api.loaded++; onLoad?.(api.loaded, count); }, () => {}).finally(resolve);
    });

    await load(0);
    resize(); draw(true);
    resolveFirst();

    const order = [], seen = new Set([0]);
    if (count > 1) { order.push(count - 1); seen.add(count - 1); }
    for (let step = 16; step >= 1; step /= 2)
      for (let i = 0; i < count; i += step) if (!seen.has(i)) { seen.add(i); order.push(i); }

    await Promise.all(Array.from({ length: concurrency }, async () => {
      for (let i; (i = order.shift()) !== undefined; ) {
        await load(i);
        if (drawn !== wanted() && Math.abs(i - wanted()) < Math.abs(drawn - wanted())) draw(true);
      }
    }));
    resolveReady();
    return api.ready;
  };
  if (!lazy) api.load();
  return api;
}

// Uma seção, um vídeo: o pin é criado na hora, antes de baixar qualquer coisa (e antes do Lenis).
export function frameScroll({ section, end = '+=300%', scrub = true, remap = (p) => p, onProgress, ...opts }) {
  const player = framePlayer(opts);
  const trigger = ScrollTrigger.create({
    trigger: section, start: 'top top', end, pin: true, scrub, anticipatePin: 1,
    onUpdate: (self) => { player.seek(remap(self.progress)); onProgress?.(self.progress); },
  });
  return Object.assign(player, { trigger });
}
