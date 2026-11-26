export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const backOut = (t: number, s = 1.15) => {
  const u = t - 1;
  return 1 + (s + 1) * u * u * u + s * u * u;
};
// cubic-bezier(.25,.75,.2,1) approximation via bezier evaluation
export function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  return (t: number) => {
    // solve x(t) = t via Newton iterations
    let u = t;
    for (let i = 0; i < 6; i++) {
      const x =
        3 * (1 - u) * (1 - u) * u * x1 + 3 * (1 - u) * u * u * x2 + u * u * u - t;
      const dx =
        3 * (1 - u) * (1 - u) * x1 +
        6 * (1 - u) * u * (x2 - x1) +
        3 * u * u * (1 - x2);
      if (Math.abs(dx) < 1e-4) break;
      u -= x / dx;
      u = clamp(u, 0, 1);
    }
    return 3 * (1 - u) * (1 - u) * u * y1 + 3 * (1 - u) * u * u * y2 + u * u * u;
  };
}
export const easeGlide = cubicBezier(0.25, 0.75, 0.2, 1);
