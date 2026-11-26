'use client';
// Sections 4-8: the scroll story + manifesto, one rAF loop, no animation libraries.
import { useEffect, useMemo, useRef } from 'react';
import { useLang, dict } from './LangProvider';
import { computeScale, applyScale, Scale } from '@/lib/scaling';
import { fanPose, scatterPose, pilePose, wheelPose, lerpPose, Pose } from '@/lib/cardPoses';
import { PIXEL_ICONS, PIXEL_COLORS, headlineUnits } from '@/lib/morph';
import { clamp, lerp, easeInOut, easeOutCubic, backOut, easeGlide } from '@/lib/utils';
import { gridUrl, skyUrl, skyVideoUrl, cameraUrl, stickerUrl, spriteStyle, CROPS, CARD_CELLS, CARD_DESTINATIONS } from '@/lib/assets';
import { destinationBySlug } from '@/lib/destinations';
import Nav from './Nav';
import SearchCard from './SearchCard';
import VisaExplorer from './VisaExplorer';
import Footer from './Footer';

const RISE_ORDER: Record<number, number> = { 5: 0.53, 2: 0.6, 0: 0.63, 1: 0.7, 3: 0.8, 4: 0.86 };
const PLANE_PATH: [number, number, number][] = [
  [0.33, -3, 73], [0.45, 4, 71], [0.6, 13, 65], [0.7, 22, 55], [0.8, 31, 44],
  [0.87, 32.5, 47.5], [0.93, 26, 48], [1.0, 21.5, 45], [1.07, 22.5, 51.5], [1.15, 27, 52],
];

function catmull(points: [number, number][], u: number): [number, number, number] {
  const n = points.length - 1;
  const f = clamp(u, 0, 1) * n;
  const i = Math.min(n - 1, Math.floor(f));
  const t = f - i;
  const p0 = points[Math.max(0, i - 1)], p1 = points[i], p2 = points[Math.min(n, i + 1)], p3 = points[Math.min(n, i + 2)];
  const cr = (a: number, b: number, c: number, d: number) =>
    0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t);
  const x = cr(p0[0], p1[0], p2[0], p3[0]);
  const y = cr(p0[1], p1[1], p2[1], p3[1]);
  // derivative for rotation
  const e = 0.001;
  const f2 = clamp(u + e, 0, 1) * n;
  const i2 = Math.min(n - 1, Math.floor(f2));
  const t2 = f2 - i2;
  const q0 = points[Math.max(0, i2 - 1)], q1 = points[i2], q2 = points[Math.min(n, i2 + 1)], q3 = points[Math.min(n, i2 + 2)];
  const x2 = cr(q0[0], q1[0], q2[0], q3[0]);
  const y2 = cr(q0[1], q1[1], q2[1], q3[1]);
  return [x, y, (Math.atan2(y2 - y, x2 - x) * 180) / Math.PI];
}

const CAMERA_CAPTION = { ar: 'ملاحظات الرحلة: تأشيرة، عملة، فيشة، أمان', en: 'Trip notes: visa, money, plugs, safety' };

interface ManifestoItem {
  type: 'words' | 'object' | 'sparkle' | 'intro';
  words?: { text: string; grey?: boolean }[];
  obj?: 'conch' | 'pearl' | 'capsule' | 'plane';
  size?: number;
  angle?: number;
  labels?: { text: string; bg: string; top?: string; bottom?: string; left?: string; angle: number; dot?: boolean }[];
  rows?: { words: { text: string; grey?: boolean }[] }[];
}

export default function HomeClient() {
  const { lang, isAr } = useLang();
  const d = dict;
  const mountRef = useRef(0);
  const revealT = useRef(0);
  const scaleRef = useRef<Scale | null>(null);
  const tyRef = useRef(0);
  const syRef = useRef(0);
  const lastWheelRef = useRef(0);
  const lastFrameRef = useRef(0);
  const cardStateRef = useRef<Pose[]>([]);
  const processStartRef = useRef(-1);
  const skyFullRef = useRef(-1);
  const skyDispRef = useRef(0);
  const morphDoneRef = useRef(false);
  const reducedRef = useRef(false);

  const storyRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const unitsHolderRef = useRef<HTMLDivElement>(null);
  const iconsHolderRef = useRef<HTMLDivElement>(null);
  const sublineRef = useRef<HTMLDivElement>(null);
  const processRef = useRef<HTMLDivElement>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const searchFocusRef = useRef<(() => void) | null>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const skyRef = useRef<HTMLDivElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraRef = useRef<HTMLDivElement>(null);
  const blackoutRef = useRef<HTMLDivElement>(null);
  const manifestoRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const headline = d.hero.headline[lang];
  const units = useMemo(() => headlineUnits(headline, isAr), [headline, isAr]);

  const manifestoItems: ManifestoItem[] = useMemo(() => {
    const W = (text: string, grey = false) => ({ text, grey });
    const items: ManifestoItem[] = [
      {
        type: 'intro',
        rows: [
          { words: isAr ? [W('خطّط', true), W('للرحلة')] : [W('Plan', true), W('the trip')] },
          { words: isAr ? [W('اللي'), W('تناسب ميزانيتك.', true)] : [W('that fits'), W('your wallet.', true)] },
        ],
        labels: [
          { text: isAr ? 'أرخص ما لقينا' : 'cheapest we found', bg: '#EFCEBE', top: '-.95em', left: '0', angle: -6 },
          { text: isAr ? 'من غير حساب' : 'no account needed', bg: '#EBC9AE', top: '-1.1em', left: '3.4em', angle: -4 },
          { text: isAr ? 'تقويم الأسعار' : 'price calendar', bg: '#BAD9E6', bottom: '-1em', left: '.6em', angle: 4 },
        ],
      },
      { type: 'object', obj: 'conch', size: 1.25, angle: -12 },
      { type: 'words', words: isAr ? [W('تذاكر', true)] : [W('Flights', true)] },
      {
        type: 'intro',
        rows: [
          { words: isAr ? [W('فنادق')] : [W('hotels')] },
          { words: isAr ? [W('بالإجمالي')] : [W('with totals')] },
        ],
        labels: [
          { text: isAr ? 'فنادق' : 'hotels', bg: '#DDAD95', top: '-.8em', left: '0', angle: -8, dot: true },
          { text: isAr ? 'بالإجمالي' : 'with totals', bg: '#B0AEC6', top: '.2em', left: '.9em', angle: 6 },
        ],
      },
      { type: 'words', words: isAr ? [W('خطة', true), W('يوم'), W('بيوم.')] : [W('day', true), W('by day'), W('plans.')] },
      { type: 'sparkle', size: 0.8 },
      {
        type: 'words',
        words: isAr ? [W('ملاحظات'), W('التأشيرة', true), W('–', true), W('مع', true), W('روابط', true), W('رسمية', true)]
          : [W('Visa'), W('notes'), W('–', true), W('with', true), W('official', true), W('links', true)],
      },
      {
        type: 'intro',
        rows: [[{ words: [] }][0]],
        words: [],
        labels: [
          { text: isAr ? 'العملة' : 'currency', bg: '#EFCEBE', top: '-.6em', left: '0', angle: -8 },
          { text: isAr ? 'الفيش' : 'plugs', bg: '#B0AEC6', bottom: '-.6em', left: '2.2em', angle: 3 },
        ],
        obj: 'conch', size: 1.05, angle: 10,
      },
      {
        type: 'words',
        words: isAr ? [W('وكمان', true)] : [W('and', true), W('a', true)],
        labels: [{ text: isAr ? 'الأمان' : 'safety', bg: '#BAD9E6', top: '-.7em', left: '.4em', angle: -10 }],
        obj: 'capsule', size: 1.05, angle: -8,
      },
      {
        type: 'words',
        words: isAr ? [W('بحث'), W('واحد،', true), W('صفحة'), W('واحدة،', true), W('من غير'), W('وجع دماغ.', true)]
          : [W('one'), W('search,'), W('one'), W('page,'), W('no', true), W('stress.', true)],
      },
    ];
    return items;
  }, [isAr]);

  useEffect(() => {
    mountRef.current = performance.now();
    lastFrameRef.current = performance.now();
    reducedRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const measure = () => {
      const W = window.innerWidth, H = window.innerHeight;
      const s = computeScale(W, H, isAr);
      scaleRef.current = s;
      applyScale(s);
      fitHeadline();
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => fitHeadline());
    };
    const fitHeadline = () => {
      const holder = unitsHolderRef.current;
      const s = scaleRef.current;
      if (!holder || !s) return;
      const row = holder.parentElement as HTMLElement;
      if (!row) return;
      row.style.transform = '';
      const w = row.getBoundingClientRect().width;
      const avail = s.W * (s.isMobile ? 0.94 : 0.9);
      if (w > avail && w > 0) row.style.transform = `scale(${avail / w})`;
    };
    measure();
    window.addEventListener('resize', measure);

    // Smooth scrolling: desktop, fine pointer only (section 7).
    const fine = window.matchMedia('(pointer: fine)').matches;
    tyRef.current = window.scrollY;
    syRef.current = window.scrollY;
    const onWheel = (e: WheelEvent) => {
      if (!fine || reducedRef.current) return;
      const target = e.target as HTMLElement;
      // Never intercept over the search card, autocomplete, date picker or select
      if (target.closest('[data-search-card], .autocomplete-list, input, select, textarea, [data-visa-sheet]')) return;
      if (document.activeElement && /^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement.tagName)) return;
      e.preventDefault();
      const dy = e.deltaMode === 1 ? e.deltaY * 32 : e.deltaY;
      tyRef.current = clamp(tyRef.current + dy * 0.75, 0, document.documentElement.scrollHeight - window.innerHeight);
      lastWheelRef.current = performance.now();
      window.scrollTo(0, tyRef.current);
    };
    window.addEventListener('wheel', onWheel, { passive: false });

    let raf = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(64, now - lastFrameRef.current);
      lastFrameRef.current = now;
      const s = scaleRef.current;
      if (!s) return;
      const { W, H, isMobile, n, cw } = s;
      const t = reducedRef.current ? 99 : (now - mountRef.current) / 1000;
      revealT.current = t;

      if (performance.now() - lastWheelRef.current > 250) {
        tyRef.current = window.scrollY;
      }
      syRef.current += (tyRef.current - syRef.current) * (1 - Math.pow(1 - 0.06, dt / 16.67));
      const sy = syRef.current;

      const story = storyRef.current;
      const storyTop = story ? story.offsetTop : 0;
      const storyH = story ? story.offsetHeight : H * 16;
      const p = clamp((sy - storyTop) / Math.max(1, storyH - H), 0, 1);

      // ---- Hero fade (phase 0 -> .06) ----
      if (unitsHolderRef.current && sublineRef.current) {
        const navH = 86 * n;
        const heroY = 0.41 * H - sy; // headline viewport y
        const fade = clamp((navH + 1.9 * s.hfs - heroY) / (1.35 * s.hfs), 0, 1);
        const op = p > 0.001 ? 1 - fade : 1;
        unitsHolderRef.current.style.opacity = String(op);
        iconsHolderRef.current!.style.opacity = String(op);
        sublineRef.current.style.opacity = String(op * (t > 5.3 ? clamp((t - 5.3) / 0.5) : 0));
        if (planeRef.current) planeRef.current.style.opacity = String(op);
      }

      // ---- Paper plane flight (0.33 - 1.27) ----
      const plane = planeRef.current;
      if (plane && !morphDoneRef.current) {
        if (t < 0.33) {
          plane.style.opacity = '0';
        } else if (t <= 1.27) {
          const u = (t - 0.33) / (1.27 - 0.33);
          const pts = PLANE_PATH.map(([, x, y]) => (isAr ? [100 - x, y] : [x, y])) as [number, number][];
          const [x, y, rot] = catmull(pts, u);
          const size = 62 * s.u;
          plane.style.opacity = '1';
          plane.style.transform = `translate(${(x / 100) * W - size / 2}px, ${(y / 100) * H - size / 2}px) rotate(${rot + 18}deg)`;
        } else if (t <= 1.33) {
          const q = (t - 1.27) / 0.06;
          const iconEl = iconsHolderRef.current?.children[0] as HTMLElement | undefined;
          const stageRect = story!.getBoundingClientRect();
          let x = 27, y = 41;
          if (iconEl) {
            const r = iconEl.getBoundingClientRect();
            x = ((r.left + r.width / 2) / W) * 100;
            y = ((r.top - stageRect.top + r.height / 2) / H) * 100;
          }
          const size = 62 * s.u * (1 - q * 0.4);
          plane.style.opacity = String(1 - q);
          plane.style.transform = `translate(${(x / 100) * W - size / 2}px, ${(y / 100) * H - size / 2}px) scale(${1 - q * 0.4})`;
        } else {
          plane.style.opacity = '0';
        }
      }

      // ---- Icon pop + morph (1.9 -> ~5.2) ----
      const stepLen = isAr ? 0.62 : 0.22;
      const U = units.length;
      const unitsShown = reducedRef.current ? U : clamp(Math.floor((t - 1.9) / stepLen) + 1, 0, U);
      const iconsLeft = Math.ceil((7 * (U - unitsShown)) / U);
      if (unitsShown >= U && t > 5.2) morphDoneRef.current = true;
      const iconEls = iconsHolderRef.current?.children;
      if (iconEls) {
        for (let j = 0; j < 7; j++) {
          const el = iconEls[j] as HTMLElement;
          // consumption order: EN leftmost first, AR rightmost first
          const orderIdx = isAr ? 6 - j : j;
          const consumed = orderIdx < 7 - iconsLeft;
          const consuming = orderIdx === 7 - iconsLeft && unitsShown < U;
          // pop-in time
          const popStart = j === 0 ? 1.27 : 1.27 + (0.03 + (j - 1) * 0.07);
          const pop = j === 0 ? (t >= 1.27 ? 1 : 0) : clamp((t - popStart) / 0.32);
          if (consumed) {
            // squash animation during its consumption step
            const stepIdx = U - Math.max(1, iconsLeft); // approx current unit
            const local = clamp((t - 1.9 - stepIdx * stepLen) / stepLen, 0, 1);
            if (local < 0.45) {
              const q = local / 0.45;
              el.style.transform = `scaleX(${1 + q * 0.25}) scaleY(${1 - q * 0.84}) rotate(${-28 * q}deg)`;
              el.style.opacity = '1';
            } else {
              const q = (local - 0.45) / 0.55;
              el.style.transform = `scaleX(1.25) scaleY(.16) rotate(${-28 - 62 * q}deg)`;
              el.style.opacity = String(1 - q);
            }
            el.style.filter = 'brightness(0)';
          } else if (consuming) {
            el.style.opacity = String(pop);
            el.style.transform = `scale(${backOut(clamp(pop))})`;
            el.style.filter = 'none';
          } else {
            el.style.opacity = String(pop > 0 ? Math.min(1, pop * 8) : 0);
            el.style.transform = `scale(${backOut(clamp(pop))})`;
            el.style.filter = 'none';
          }
        }
      }
      const unitEls = unitsHolderRef.current?.children;
      if (unitEls) {
        for (let i = 0; i < unitEls.length; i++) {
          const el = unitEls[i] as HTMLElement;
          const local = reducedRef.current ? 1 : (t - 1.9 - i * stepLen) / stepLen;
          if (local <= 0.32) {
            el.style.opacity = '0';
            el.style.clipPath = isAr ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)';
          } else {
            const cp = clamp((local - 0.32) / 0.58);
            el.style.opacity = '1';
            el.style.clipPath = isAr ? `inset(0 0 0 ${(1 - cp) * 100}%)` : `inset(0 ${(1 - cp) * 100}% 0 0)`;
          }
        }
      }

      // ---- Card poses ----
      const fanT = easeInOut(clamp((p - 0.004) / (0.085 - 0.004)));
      const pileT = easeInOut(clamp((p - 0.21) / (0.31 - 0.21)));
      const wheelT = easeGlide(clamp((p - 0.31) / (0.41 - 0.31)));
      const wheelRot = -3 * easeInOut(clamp((p - 0.41) / (0.57 - 0.41)));
      // measure search card rect to keep scatter clear of it
      let avoid: { left: number; top: number; right: number; bottom: number } | null = null;
      if (searchWrapRef.current) {
        const r = searchWrapRef.current.getBoundingClientRect();
        avoid = { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
      }
      const states = cardStateRef.current;
      if (states.length !== 12) {
        cardStateRef.current = Array.from({ length: 12 }, (_, i) => fanPose(i, W, H, cw, isMobile));
      }
      let allSettled = true;
      for (let i = 0; i < 12; i++) {
        // base: fan -> scatter
        let target = lerpPose(fanPose(i, W, H, cw, isMobile), scatterPose(i, W, H, cw, isMobile, avoid), fanT);
        if (i > 5) target = { ...target, opacity: fanT > 0.5 ? 0 : 0 };
        // -> pile
        if (pileT > 0) {
          const pp = pilePose(i, W, H, cw);
          target = lerpPose(target, { ...pp, opacity: 1 }, pileT);
        }
        // -> wheel
        if (wheelT > 0) {
          target = lerpPose(target, wheelPose(i, 0, W, H, cw, isMobile), wheelT);
        }
        // wheel turning
        if (wheelRot !== 0) {
          target = lerpPose(target, wheelPose(i, wheelRot, W, H, cw, isMobile), clamp(Math.abs(wheelRot) / 3));
          target = wheelPose(i, wheelRot, W, H, cw, isMobile);
          if (wheelT < 1) target = lerpPose(target, wheelPose(i, wheelRot, W, H, cw, isMobile), wheelT);
        }
        // hero entrance rise (time-based, overrides at p ~ 0)
        const riseStart = RISE_ORDER[i];
        if (p < 0.004 && riseStart !== undefined) {
          const local = clamp((t - riseStart) / 0.7);
          if (local < 1) {
            const e = backOut(local);
            target = { ...target, y: lerp(H + cw * 1.2, target.y, e), rot: lerp(8, target.rot, e), opacity: local > 0 ? 1 : 0 };
          }
        } else if (p < 0.004 && riseStart === undefined) {
          target = { ...target, opacity: 0 };
        }
        // inertia chase
        const st = cardStateRef.current[i];
        const w = 0.055 + (i % 4) * 0.008;
        const k = p < 0.001 || reducedRef.current ? 1 : 1 - Math.pow(1 - w, dt / 16.67);
        const next = lerpPose(st, target, k);
        if (Math.abs(next.x - target.x) > 3 || Math.abs(next.y - target.y) > 3 || Math.abs(next.rot - target.rot) > 1) {
          allSettled = false;
        }
        cardStateRef.current[i] = next;
        const el = cardRefs.current[i];
        if (el) {
          el.style.transform = `translate(${next.x - cw / 2}px, ${next.y - cw * 0.66}px) rotate(${next.rot}deg)`;
          el.style.opacity = String(next.opacity);
          el.style.pointerEvents = next.opacity > 0.5 ? 'auto' : 'none';
        }
      }

      // ---- Process block (fade .05->.075, reveal >.078, search card hide .17->.21) ----
      const proc = processRef.current;
      if (proc) {
        const fadeIn = p <= 0.05 ? 0 : clamp((p - 0.05) / 0.025);
        proc.style.opacity = String(fadeIn);
        if (p > 0.078 && processStartRef.current < 0) processStartRef.current = t;
        if (p < 0.05) processStartRef.current = -1; // reset word reveal below .05
        const pt = processStartRef.current >= 0 ? t - processStartRef.current : -1;
        proc.querySelectorAll<HTMLElement>('[data-pword]').forEach((el, i) => {
          const local = reducedRef.current ? 1 : clamp((pt - i * 0.11) / 0.55);
          const e = easeOutCubic(clamp(local));
          el.style.opacity = String(pt < 0 ? 0 : e);
          el.style.transform = `translateY(${(1 - e) * 0.35}em)`;
          el.style.filter = `blur(${(1 - e) * 6}px)`;
        });
        const sub = proc.querySelector<HTMLElement>('[data-psub]');
        if (sub) {
          const e = reducedRef.current ? 1 : clamp((pt - 0.7) / 0.5);
          sub.style.opacity = String(pt < 0 ? 0 : easeOutCubic(e));
        }
        const scWrap = searchWrapRef.current;
        if (scWrap) {
          const vis = reducedRef.current ? 1 : clamp((pt - 1.0) / 0.5);
          const hide = clamp((p - 0.17) / 0.04);
          const op = easeOutCubic(vis) * (1 - hide);
          scWrap.style.opacity = String(pt < 0 ? 0 : op);
          scWrap.style.transform = `translateY(${(1 - easeOutCubic(vis)) * 8}px)`;
          scWrap.style.pointerEvents = op > 0.5 ? 'auto' : 'none';
        }
      }

      // ---- Sky panel (gated, .62 -> .74) ----
      const allowed = wheelRot <= -2.99 && allSettled;
      const skyTarget = allowed || reducedRef.current ? easeInOut(clamp((p - 0.62) / 0.12)) : 0;
      skyDispRef.current += (skyTarget - skyDispRef.current) * (1 - Math.pow(1 - 0.09, dt / 16.67));
      const g = reducedRef.current ? skyTarget : skyDispRef.current;
      const sky = skyRef.current;
      if (sky) {
        if (g <= 0.001) {
          sky.style.opacity = '0';
          sky.style.pointerEvents = 'none';
        } else {
          sky.style.opacity = '1';
          const winW = isMobile ? 42 : 17;
          const winH = isMobile ? 16 : 20;
          const off = isMobile ? 6 : 12;
          const sideI = (100 - winW) / 2;
          const topI = 50 - off - winH / 2;
          const botI = 100 - (topI + winH);
          const e = g;
          const l = lerp(sideI, 0, e), tp = lerp(topI, 0, e), bt = lerp(botI, 0, e);
          sky.style.clipPath = `inset(${tp}% ${l}% ${bt}% ${l}% round ${14 * (1 - e)}px)`;
          if (plateRef.current) plateRef.current.style.transform = `scale(${1.18 - 0.18 * e})`;
          if (videoRef.current) videoRef.current.style.transform = `scale(${1.18 - 0.18 * e})`;
          if (g > 0.02 && videoRef.current && !reducedRef.current) {
            videoRef.current.playbackRate = 0.6;
            videoRef.current.play().catch(() => {});
            videoRef.current.style.opacity = '0.78';
          } else if (videoRef.current) {
            videoRef.current.pause();
          }
        }
        // camera scale .5 -> 1 during grow
        const camScale = 0.5 + 0.5 * g;
        // yaw .74 -> .88 + bob
        const yawT = clamp((p - 0.74) / 0.14);
        const yaw = lerp(-10, 10, yawT);
        const bob = 6 * n * Math.sin(t * 1.6);
        // zoom .88 -> .97, gated by sky full
        const gate = g >= 0.9 ? 1 : 0;
        const q = Math.pow(clamp((p - 0.88) / 0.09), 1.6) * gate;
        const zoom = 1 + q * q * 28;
        if (cameraRef.current) {
          cameraRef.current.style.transform =
            `translateY(${yawT > 0 && yawT < 1 ? bob : 0}px) perspective(900px) rotateY(${yaw}deg) scale(${camScale * zoom})`;
          cameraRef.current.style.transformOrigin = '54% 31%';
        }
        if (blackoutRef.current) {
          blackoutRef.current.style.opacity = String(clamp((q - 0.45) / 0.4));
        }
        // sky words reveal once full
        if (g >= 0.99 && skyFullRef.current < 0) skyFullRef.current = t;
        if (g < 0.5) skyFullRef.current = -1;
        const swt = skyFullRef.current >= 0 ? t - skyFullRef.current : -1;
        const times = [0, 0.12, 0.24, 0.45, 0.57, 0.69, 0.81];
        sky.querySelectorAll<HTMLElement>('[data-skyw]').forEach((el) => {
          const idx = parseInt(el.dataset.skyw || '0', 10);
          const local = reducedRef.current ? 1 : clamp((swt - times[Math.min(idx, 6)]) / 0.6);
          const e2 = easeOutCubic(clamp(local));
          el.style.opacity = String(swt < 0 ? 0 : e2);
          el.style.transform = `translateY(${(1 - e2) * 0.3}em)`;
          el.style.filter = `blur(${(1 - e2) * 6}px)`;
        });
        const cap = sky.querySelector<HTMLElement>('[data-skycap]');
        if (cap) cap.style.opacity = String(swt < 0 ? 0 : easeOutCubic(clamp((swt - 0.9) / 0.5)));
      }

      // ---- dark nav ----
      const manifesto = manifestoRef.current;
      const mTop = manifesto ? manifesto.offsetTop : Infinity;
      document.body.classList.toggle('dark-nav', p > 0.985 || sy >= mTop - H * 0.2);

      // ---- Manifesto ----
      if (manifesto && trackRef.current) {
        const mH = manifesto.offsetHeight;
        const mp = clamp((sy - mTop) / Math.max(1, mH - H), 0, 1);
        const track = trackRef.current;
        const trackW = track.scrollWidth;
        const start = isMobile ? W * 0.08 : W * 0.06;
        const end = trackW - W * 0.9;
        const x = isAr ? lerp(-start, end, mp) : lerp(start, -end, mp);
        track.style.transform = `translate(${isAr ? -x : x}px, -50%)`;
        // item reveals
        const within = sy > mTop - H * 1.2;
        if (within || reducedRef.current) {
          track.querySelectorAll<HTMLElement>('[data-mitem]').forEach((el) => {
            if (el.dataset.revealed === '1') return;
            const r = el.getBoundingClientRect();
            const pass = isAr ? r.right > W * (isMobile ? 0.08 : 0.14) : r.left < W * (isMobile ? 0.92 : 0.86);
            if (pass) el.dataset.revealed = '1';
          });
        }
      }
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', measure);
      window.removeEventListener('wheel', onWheel);
      document.body.classList.remove('dark-nav');
    };
  }, [isAr, units]);

  const scrollToStory = (pp: number, focusSearch = false) => {
    const story = storyRef.current;
    if (!story) return;
    const target = story.offsetTop + pp * (story.offsetHeight - window.innerHeight);
    tyRef.current = target;
    window.scrollTo({ top: target, behavior: 'smooth' });
    if (focusSearch) setTimeout(() => searchFocusRef.current?.(), 700);
  };

  const onNavClick = (target: string) => {
    switch (target) {
      case 'home': window.scrollTo({ top: 0, behavior: 'smooth' }); tyRef.current = 0; break;
      case 'destinations': scrollToStory(0.45); break;
      case 'whatYouGet': scrollToStory(0.74); break;
      case 'plan': manifestoRef.current && window.scrollTo({ top: manifestoRef.current.offsetTop, behavior: 'smooth' }); break;
      case 'contact': window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' }); break;
      case 'cta': scrollToStory(0.09, true); break;
    }
  };

  const onCardClick = (i: number) => {
    const dest = CARD_DESTINATIONS[i];
    const full = destinationBySlug(dest.slug);
    const airport = full
      ? { iata: full.iata, city: full.name, cityAr: full.nameAr, country: full.country, countryAr: full.countryAr }
      : { iata: '', city: dest.city, cityAr: dest.cityAr, country: dest.country, countryAr: dest.countryAr };
    window.dispatchEvent(new CustomEvent('rehlaty:set-destination', { detail: airport }));
    scrollToStory(0.09, true);
  };

  const chipStyle = spriteStyle([0.5, 0, 1, 0.5], gridUrl('C', 300));
  const skyWordsTop = isAr ? [d.sky.topA.ar, d.sky.topB.ar, d.sky.topC.ar] : [d.sky.topA.en, d.sky.topB.en, d.sky.topC.en];
  const skyWordsBot = isAr ? [d.sky.botA.ar, d.sky.botB.ar, d.sky.botC.ar, d.sky.botD.ar] : [d.sky.botA.en, d.sky.botB.en, d.sky.botC.en, d.sky.botD.en];
  const greySet = new Set(isAr ? d.sky.grey.ar : (d.sky.grey.en as readonly string[]));

  return (
    <>
      <Nav onNavClick={onNavClick} revealRef={revealT} />

      <section id="story" ref={storyRef} className="story-section relative" style={{ height: '1600vh' }}>
        {/* Hero */}
        <header ref={heroRef} className="absolute top-0 left-0 w-full pointer-events-none" style={{ height: '100vh', zIndex: 9 }}>
          <div className="absolute left-0 right-0 text-center" style={{ top: '41%', height: 0 }}>
            <div className="inline-flex items-center justify-center" style={{ gap: 'calc(var(--ic) * 0.2)', direction: isAr ? 'rtl' : 'ltr' }}>
              <div ref={unitsHolderRef} role="heading" aria-level={1} aria-label={headline}
                className="inline-flex items-baseline justify-center"
                style={{ fontSize: 'var(--hfs)', fontWeight: isAr ? 700 : 560, lineHeight: 1, color: 'var(--ink)', whiteSpace: 'pre' }}>
                {units.map((u, i) => (
                  <span key={`${lang}-${i}`} style={{ display: 'inline-block', opacity: 0 }}>{u}{i < units.length - 1 ? ' ' : ''}</span>
                ))}
              </div>
              <div ref={iconsHolderRef} className="inline-flex items-center" style={{ gap: 'calc(var(--ic) * 0.2)', marginInlineStart: 'calc(var(--ic) * 0.32)' }}>
                {PIXEL_ICONS.map((icon, j) => (
                  <svg key={j} width={0} height={0} viewBox="0 0 9 9" shapeRendering="crispEdges"
                    style={{ width: 'var(--ic)', height: 'var(--ic)', opacity: 0 }} aria-hidden="true">
                    {icon.flatMap((row, y) =>
                      row.split('').map((c, x) =>
                        c === '.' ? null : (
                          <rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} fill={PIXEL_COLORS[c]} />
                        ),
                      ),
                    )}
                  </svg>
                ))}
              </div>
            </div>
            <div ref={sublineRef} style={{ fontSize: 'calc(var(--hfs) * 0.17)', color: 'var(--muted)', fontWeight: 400, marginTop: 'calc(var(--hfs) * 0.3)', opacity: 0 }}>
              {d.hero.subline[lang]}
            </div>
          </div>
          <div ref={planeRef} className="absolute" style={{ width: 'calc(62 * var(--u))', height: 'calc(62 * var(--u))', opacity: 0, zIndex: 10, ...spriteStyle(CROPS.plane, stickerUrl(1200)) }} />
        </header>

        {/* Pinned stage */}
        <div className="story-stage sticky top-0 overflow-hidden" style={{ height: '100vh', background: 'var(--bg)' }}>
          {/* Process block */}
          <div ref={processRef} className="absolute left-0 right-0 z-[4] text-center px-4" style={{ top: '17%', opacity: 0 }}>
            <h2 style={{ fontSize: 'var(--pfs)', fontWeight: 500, lineHeight: 1.12 }}>
              <span className="block">
                <span data-pword className="inline-block" style={{ color: 'var(--muted)', fontWeight: 700 }}>{isAr ? 'من' : 'From'}</span>{' '}
                <span data-pword className="inline-block">{isAr ? 'البحث' : 'search'}</span>{' '}
                <span data-pword className="inline-block align-middle" style={{
                  width: '1.05em', height: '0.92em', borderRadius: '.16em',
                  verticalAlign: '-.12em', margin: '0 .14em',
                  boxShadow: '0 .06em .18em rgba(31,36,48,.18)',
                  ...chipStyle,
                }} />{' '}
                <span data-pword className="inline-block" style={{ color: 'var(--muted)', fontWeight: 700 }}>{isAr ? 'للرحلة' : 'to trip'}</span>
              </span>
              <span className="block">
                {isAr ? (
                  <>
                    <span data-pword className="inline-block">مبنية</span>{' '}
                    <span data-pword className="inline-block" style={{ color: 'var(--muted)', fontWeight: 700 }}>على</span>{' '}
                    <span data-pword className="inline-block">أسعار</span>{' '}
                    <span data-pword className="inline-block" style={{ color: 'var(--muted)', fontWeight: 700 }}>حقيقية</span>
                  </>
                ) : (
                  <>
                    <span data-pword className="inline-block">built</span>{' '}
                    <span data-pword className="inline-block" style={{ color: 'var(--muted)', fontWeight: 700 }}>around</span>{' '}
                    <span data-pword className="inline-block">real prices</span>
                  </>
                )}
              </span>
            </h2>
            <p data-psub style={{ fontSize: 'calc(var(--pfs) * 0.27)', fontWeight: 400, color: 'var(--sub-line-grey)', marginTop: 'calc(var(--pfs) * 0.42)', opacity: 0 }}>
              {d.hero.subline[lang]}
            </p>
            <div ref={searchWrapRef} className="mt-4 flex flex-col items-center gap-2" style={{ opacity: 0, pointerEvents: 'none' }}>
              <SearchCard onFocusTargetRef={searchFocusRef} idPrefix="hero" />
              <a
                href="#visa-explorer"
                className="text-[13px] underline decoration-dotted underline-offset-4"
                style={{ color: 'var(--harbour)' }}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('visa-explorer')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {d.search.visaLink[lang]}
              </a>
            </div>
          </div>

          {/* Cards layer */}
          <div className="cards-layer absolute inset-0 z-[2]">
            {CARD_DESTINATIONS.map((dest, i) => {
              const [g, cx, cy] = CARD_CELLS[i];
              return (
                <button
                  key={dest.slug}
                  ref={(el) => { cardRefs.current[i] = el; }}
                  className="card-item"
                  aria-label={`${isAr ? dest.cityAr : dest.city}, ${isAr ? dest.countryAr : dest.country}`}
                  onClick={() => onCardClick(i)}
                  style={{
                    backgroundImage: `url(${gridUrl(g as 'A' | 'B' | 'C')})`,
                    backgroundPosition: `${cx * 100}% ${cy * 100}%`,
                    opacity: 0,
                  }}
                >
                  <span className="card-label" style={{ direction: isAr ? 'rtl' : 'ltr' }}>
                    {isAr ? dest.cityAr : dest.city}
                    <span className="country">{isAr ? dest.countryAr : dest.country}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sky panel */}
          <div ref={skyRef} className="absolute inset-0 z-[6]" style={{ opacity: 0, clipPath: 'inset(28% 41.5% 52% 41.5% round 14px)' }}>
            <div ref={plateRef} className="absolute" style={{ inset: '-4%', backgroundImage: `url(${skyUrl()})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: 'var(--sky1)' }} />
            <video ref={videoRef} muted loop playsInline preload="none"
              className="absolute object-cover"
              style={{ left: '-4%', top: '-4%', width: '108%', height: '108%', opacity: 0, transition: 'opacity 1.2s' }}
              src={skyVideoUrl()} />
            <div ref={cameraRef} className="absolute" style={{ left: '50%', top: '51%', width: 'var(--camw)', aspectRatio: '1.094', transform: 'translate(-50%,-50%)', marginLeft: 'calc(var(--camw) / -2)', marginTop: 'calc(var(--camw) / -2.188)' }}>
              <div className="w-full h-full" style={{ ...spriteStyle(CROPS.camera, cameraUrl()), filter: 'drop-shadow(0 calc(var(--camw) * .12) calc(var(--camw) * .08) rgba(60,52,70,.22))' }} />
              <div data-skycap className="text-center" style={{ fontSize: 'calc(var(--camw) * .07)', color: 'var(--ink)', fontWeight: 500, opacity: 0, marginTop: 8 }}>
                {CAMERA_CAPTION[lang]}
              </div>
            </div>
            <div className="absolute" style={{ [isAr ? 'right' : 'left']: 'calc(40 * var(--n) * 1px)', top: 'calc(104 * var(--n) * 1px)', fontSize: 'var(--sfs)', color: 'var(--ink)', direction: isAr ? 'rtl' : 'ltr' } as React.CSSProperties}>
              {skyWordsTop.map((w, i) => (
                <span key={i} data-skyw={i} className="inline-block" style={{ opacity: 0, marginInlineEnd: '.25em', color: greySet.has(w) ? 'var(--sky-grey-words)' : 'var(--ink)' }}>{w}</span>
              ))}
            </div>
            <div className="absolute" style={{ [isAr ? 'left' : 'right']: 'calc(40 * var(--n) * 1px)', bottom: 'calc(46 * var(--n) * 1px)', fontSize: 'var(--sfs)', color: 'var(--ink)', direction: isAr ? 'rtl' : 'ltr' } as React.CSSProperties}>
              {skyWordsBot.map((w, i) => (
                <span key={i} data-skyw={i + 3} className="inline-block" style={{ opacity: 0, marginInlineEnd: '.25em', color: greySet.has(w) ? 'var(--sky-grey-words)' : 'var(--ink)' }}>{w}</span>
              ))}
            </div>
          </div>

          {/* Blackout */}
          <div ref={blackoutRef} className="absolute inset-0 z-[8] pointer-events-none" style={{ background: 'var(--dark)', opacity: 0 }} />
        </div>
      </section>

      {/* Visa explorer: new normal-flow section after the sky panel, before the manifesto (Addendum A4) */}
      <VisaExplorer />

      {/* Manifesto */}
      <section id="manifesto" ref={manifestoRef} className="manifesto-section relative" style={{ height: '950vh', background: 'var(--dark)' }}>
        <div className="manifesto-stage sticky top-0 h-screen overflow-hidden">
          <div
            ref={trackRef}
            className="manifesto-track"
            style={{
              [isAr ? 'right' : 'left']: 0,
              direction: isAr ? 'rtl' : 'ltr',
              transform: 'translate(0,-50%)',
              fontWeight: 500,
            } as React.CSSProperties}
          >
            {(isAr ? [...manifestoItems].reverse() : manifestoItems).map((item, idx) => (
              <span key={idx} data-mitem className="mitem" data-revealed="0">
                {item.rows && item.rows.length > 0 && item.rows[0].words.length > 0 ? (
                  <span className="inline-flex flex-col" style={{ fontSize: '.72em', gap: '.26em', lineHeight: 1.15 }}>
                    {item.rows.map((row, ri) => (
                      <span key={ri} className="block">
                        {row.words.map((w, wi) => (
                          <ManifestoWord key={wi} text={w.text} grey={w.grey} isAr={isAr} index={wi} />
                        ))}
                      </span>
                    ))}
                  </span>
                ) : null}
                {item.words && item.words.length > 0 && (
                  <span>
                    {item.words.map((w, wi) => (
                      <ManifestoWord key={wi} text={w.text} grey={w.grey} isAr={isAr} index={wi} />
                    ))}
                  </span>
                )}
                {item.obj && (
                  <span
                    className="mobj"
                    style={{
                      width: `${item.size || 1}em`,
                      height: `${item.size || 1}em`,
                      ...spriteStyle(CROPS[item.obj === 'plane' ? 'plane' : item.obj], stickerUrl(700)),
                      transform: `rotate(${item.angle || 0}deg)`,
                    }}
                  />
                )}
                {item.type === 'sparkle' && (
                  <>
                    <svg viewBox="0 0 20 20" style={{ width: '.34em', height: '.34em' }}>
                      <path d="M10 0c.8 5.6 3.6 8.6 10 10-6.4 1.4-9.2 4.4-10 10-.8-5.6-3.6-8.6-10-10 6.4-1.4 9.2-4.4 10-10z" fill="#F4E3D3" />
                    </svg>
                    <span className="mobj" style={{ width: '.8em', height: '.8em', ...spriteStyle(CROPS.pearl, stickerUrl(700)) }} />
                  </>
                )}
                {item.labels?.map((lb, li) => (
                  <span key={li} className="mlabel" style={{
                    background: lb.bg,
                    top: lb.top, bottom: lb.bottom, left: lb.left,
                    transform: `rotate(${lb.angle}deg)`,
                  }}>
                    {lb.text}
                    {lb.dot && <span style={{ position: 'absolute', top: -3, insetInlineEnd: -3, width: 8, height: 8, borderRadius: 8, background: 'var(--ink)' }} />}
                  </span>
                ))}
              </span>
            ))}
            <span style={{ display: 'inline-block', width: '30vw' }} />
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

function ManifestoWord({ text, grey, isAr, index }: { text: string; grey?: boolean; isAr: boolean; index: number }) {
  // EN: per letter, 35ms stagger. AR: whole word, 90ms stagger (never split letters).
  const chars = isAr ? [text] : text.split('');
  return (
    <span className={`mword ${grey ? 'mgrey' : ''}`} style={{ marginInlineEnd: '.22em' }}>
      {chars.map((c, i) => (
        <span
          key={i}
          className="inline-block mchar"
          style={{
            transition: `opacity .5s ${(index * 3 + i) * (isAr ? 90 : 35)}ms, transform .5s ${(index * 3 + i) * (isAr ? 90 : 35)}ms`,
          }}
        >
          {c}
        </span>
      ))}
      <style jsx global>{`
        [data-mitem][data-revealed='0'] .mchar { opacity: 0; transform: translateY(.55em) rotate(${isAr ? 8 : 14}deg); }
        [data-mitem][data-revealed='1'] .mchar { opacity: 1; transform: translateY(0) rotate(0); }
        [data-mitem][data-revealed='0'] .mobj, [data-mitem][data-revealed='0'] .mlabel { opacity: 0; transform: scale(0) rotate(-14deg); }
        [data-mitem][data-revealed='1'] .mobj, [data-mitem][data-revealed='1'] .mlabel { opacity: 1; transform: scale(1); transition: transform .5s cubic-bezier(.34,1.56,.64,1) .12s, opacity .3s .12s; }
      `}</style>
    </span>
  );
}
