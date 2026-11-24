// As curvas da página. Nada de power1 nem "ease" padrão.
export const IN = 'expo.out';        // entradas
export const OUT = 'power3.in';      // saídas (sempre mais curtas)
export const MOVE = 'expo.inOut';    // deslocamentos grandes
export const MOVE3 = 'power3.inOut';

export const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const MOBILE = () => innerWidth <= 700;

export const clamp01 = (v) => Math.min(1, Math.max(0, v));
export const range = (v, a, b) => clamp01((v - a) / (b - a));
export const p3out = (p) => 1 - Math.pow(1 - p, 3);
export const p2inOut = (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
export const easeInOutCubic = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
