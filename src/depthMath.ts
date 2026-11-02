/**
 * Pure math and interpolation logic for Maison Vell runway depth lookbook
 */

export const LOOKS: [number, number][] = [
  [12, 176],
  [178, 330],
  [331, 470],
  [476, 633],
  [634, 767],
  [767, 956],
];

export const Y0 = 48;
export const Y1 = 496;
export const FIRST = 15;

export const ITEMS: [number, number, number, number, string, string][] = [
  [26, 224, 28, 214, 'Feather Jacket', '$2,900'],
  [304, 412, 22, 236, 'Satin Wide Leg Trousers', '$1,450'],
  [530, 666, 12, 242, 'Pleated Dress', '$2,200'],
  [752, 922, 100, 146, 'Gold Waist Belt', '$420'],
  [70, 176, 246, 466, 'Satin Trench Dress', '$2,350'],
  [294, 422, 294, 432, 'Top Handle Bag', '$980'],
  [508, 688, 240, 452, 'Billow Sleeve Blouse', '$860'],
  [780, 890, 252, 466, 'Tie Waist Trousers', '$740'],
  [64, 178, 484, 698, 'Powder Long Coat', '$1,980'],
  [316, 396, 482, 698, 'Ivory Straight Trousers', '$690'],
  [530, 672, 508, 682, 'Sculpted Ruffle Top', '$1,120'],
  [754, 916, 484, 700, 'Pleated Maxi Skirt', '$1,340'],
];

// depth stops from d = -1 (leaving past the rail) to d = 5 (arriving out of the haze)
export const KX = [1.2, 0.744, 0.496, 0.346, 0.235, 0.15, 0.085];
export const KF = [1.14, 0.89, 0.777, 0.704, 0.651, 0.616, 0.59];
export const KH = [1.18, 0.832, 0.574, 0.436, 0.334, 0.258, 0.19];
export const KB = [0, 0, 1.5, 4, 8, 12, 17];
export const KO = [1, 1, 1, 1, 0.86, 0.5, 0];

export const wrap = (x: number, n: number): number => ((x % n) + n) % n;
export const clamp = (x: number, a: number, b: number): number => Math.min(b, Math.max(a, x));

export interface DepthState {
  d: number;
  x: number;
  y: number;
  scale: number;
  blur: number;
  opacity: number;
  zIndex: number;
}

export function computeDepthState(
  modelIndex: number,
  p: number,
  numModels: number,
  W: number,
  H: number,
  ratio: number,
  base: number
): DepthState {
  let d = wrap(modelIndex - p, numModels);
  if (d > numModels - 1) d -= numModels;

  const k = clamp(d + 1, 0, 6);
  const a = Math.floor(k);
  const b = Math.min(6, a + 1);
  const t = k - a;
  const mix = (arr: number[]) => arr[a] + (arr[b] - arr[a]) * t;

  const h = mix(KH) * H;
  const s = h / base;
  const w = h * ratio;
  const x = mix(KX) * W - w / 2;
  const y = mix(KF) * H - h;
  const blurVal = mix(KB) / s;
  const opacity = mix(KO);
  const zIndex = 100 - Math.round(d * 10);

  return {
    d,
    x,
    y,
    scale: s,
    blur: blurVal,
    opacity,
    zIndex,
  };
}

export function computeCardOffset(cardIndex: number, p: number, cardS: number, totalCards: number): number {
  const all = cardS * totalCards;
  let y = wrap(cardIndex * cardS - p * 2 * cardS, all);
  if (y > all - cardS) y -= all;
  return y;
}
