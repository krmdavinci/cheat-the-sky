// Section 3: scaling system. All sizes computed in JS, written as CSS custom properties.
export interface Scale {
  W: number;
  H: number;
  isMobile: boolean;
  u: number;
  n: number;
  hfs: number;
  ic: number;
  pfs: number;
  sfs: number;
  mfs: number;
  camw: number;
  cw: number;
}

export function computeScale(W: number, H: number, isArabic: boolean): Scale {
  const isMobile = W < 820 && W < H * 1.1;
  const u = Math.min(W / 1440, H / 800);
  const n = isMobile ? Math.min(1, W / 560) : Math.min(Math.max(W / 1440, 0.62), 1.25);
  let hfs = isMobile ? Math.min(W * 0.12, H * 0.09) : Math.min(W * 0.074, H * 0.135);
  if (isArabic) hfs *= 0.9;
  const ic = hfs * 0.62;
  const pfs = isMobile ? Math.min(W * 0.085, 40) : Math.min(W * 0.0335, H * 0.062);
  const sfs = isMobile ? Math.min(W * 0.09, 44) : Math.min(W * 0.042, H * 0.078);
  const mfs = isMobile ? Math.min(W * 0.11, H * 0.075) : Math.min(W * 0.05, H * 0.1);
  const camw = isMobile ? Math.min(W * 0.62, H * 0.34) : Math.min(W * 0.19, H * 0.36);
  const cw = isMobile ? Math.min(W * 0.3, H * 0.2) : Math.min(W / 1440, H / 780) * 218;
  return { W, H, isMobile, u, n, hfs, ic, pfs, sfs, mfs, camw, cw };
}

export function applyScale(s: Scale) {
  const r = document.documentElement.style;
  r.setProperty('--u', `${s.u}px`);
  r.setProperty('--n', `${s.n}`);
  r.setProperty('--hfs', `${s.hfs}px`);
  r.setProperty('--ic', `${s.ic}px`);
  r.setProperty('--pfs', `${s.pfs}px`);
  r.setProperty('--sfs', `${s.sfs}px`);
  r.setProperty('--mfs', `${s.mfs}px`);
  r.setProperty('--camw', `${s.camw}px`);
  r.setProperty('--cw', `${s.cw}`);
}
