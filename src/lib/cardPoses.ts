// Section 5: card poses. All geometry is physical (screen left/right), never RTL-flipped.
import { lerp } from './utils';

export interface Pose { x: number; y: number; rot: number; opacity: number; }

export const step = (R: number, cw: number) => 2 * Math.asin((1.05 * cw) / (2 * R));

export function fanPose(i: number, W: number, H: number, cw: number, isMobile: boolean): Pose {
  if (i > 5) return { x: W * 0.5, y: H * 1.4, rot: 0, opacity: 0 };
  const R = isMobile ? W * 1.35 : (1250 * W) / 1440;
  const th = (i - 2.5) * step(R, cw);
  const cx = isMobile ? W * 0.5 : W * 0.55;
  const cy = H * 0.86 + R;
  const y = cy - R * Math.cos(th) + (isMobile ? cw * 0.2 : 0);
  return { x: cx + R * Math.sin(th) - (isMobile ? 0 : W * 0.02), y, rot: (th * 180) / Math.PI, opacity: 1 };
}

const SCATTER_D: [number, number, number][] = [
  [0.08, 0.46, -20], [0.2, 0.86, -12], [0.8, 0.84, 14],
  [0.38, 1.04, -8], [0.92, 0.42, 16], [0.62, 1.04, 9],
];
const SCATTER_M: [number, number, number][] = [
  [0.06, 0.6, -20], [0.45, 0.66, 12], [0.94, 0.6, 16],
  [0.22, 0.93, -14], [0.72, 0.96, 9], [0.5, 1.3, 0],
];

export function scatterPose(
  i: number, W: number, H: number, cw: number, isMobile: boolean,
  avoid?: { left: number; top: number; right: number; bottom: number } | null,
): Pose {
  if (i > 5) return { x: W * 0.5, y: H * 1.4, rot: 0, opacity: 0 };
  const table = isMobile ? SCATTER_M : SCATTER_D;
  let [fx, fy, r] = table[i];
  if (H < 500 && fy < 0.1) fy += 0.08; // (spec: lift scatter y values below .1 -- kept as written)
  let x = fx * W;
  let y = fy * H;
  // Never cover the search card (measured at runtime) or the nav band.
  if (avoid) {
    const half = cw / 2;
    const guard = 12;
    let tries = 0;
    while (
      x + half > avoid.left - guard && x - half < avoid.right + guard &&
      y + half * 1.32 > avoid.top - guard && y - half * 1.32 < avoid.bottom + guard &&
      tries < 8
    ) {
      y += cw * 0.5;
      if (y > H * 1.3) { y = avoid.bottom + half * 1.32 + guard; break; }
      tries++;
    }
  }
  return { x, y, rot: r, opacity: 1 };
}

export function pilePose(i: number, W: number, H: number, cw: number): Pose {
  const sign = i % 2 === 0 ? 1 : -1;
  return {
    x: W * 0.5 + ((i % 3) - 1) * cw * 0.08,
    y: H * 0.62 + (((i * 7) % 5) - 2) * cw * 0.04,
    rot: sign * (4 + i * 1.3),
    opacity: 1,
  };
}

export function wheelPose(i: number, rot: number, W: number, H: number, cw: number, isMobile: boolean): Pose {
  const R = isMobile ? W * 1.2 : (900 * W) / 1440;
  const slot = ((i + rot) % 12 + 12) % 12 - 5.5;
  const ang = slot * step(R, cw);
  const deg = (ang * 180) / Math.PI;
  const cx = W * 0.5;
  const cy = (isMobile ? H * 0.76 : H * 0.82) + R;
  return {
    x: cx + R * Math.sin(ang),
    y: cy - R * Math.cos(ang),
    rot: deg,
    opacity: Math.abs(deg) < 62 ? 1 : 0,
  };
}

export function lerpPose(a: Pose, b: Pose, t: number): Pose {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    rot: lerp(a.rot, b.rot, t),
    opacity: lerp(a.opacity, b.opacity, t),
  };
}
