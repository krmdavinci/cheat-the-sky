'use client';
// Section 4.1: fixed nav. Physical geometry; mirrored in Arabic.
import { useEffect, useRef } from 'react';
import { useLang, dict } from './LangProvider';

interface Props {
  onNavClick: (target: 'home' | 'destinations' | 'whatYouGet' | 'plan' | 'contact' | 'cta') => void;
  revealRef: React.MutableRefObject<number>; // seconds since mount, drives intro fades
}

export default function Nav({ onNavClick, revealRef }: Props) {
  const { lang, setLang, isAr } = useLang();
  const d = dict;
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const t = revealRef.current;
      const root = rootRef.current;
      if (!root) return;
      const fade = (el: HTMLElement | null, start: number, end: number) => {
        if (!el) return;
        const p = Math.min(1, Math.max(0, (t - start) / (end - start)));
        const e = 1 - Math.pow(1 - p, 3);
        el.style.opacity = String(e);
        el.style.transform = `translateY(${(1 - e) * 6}px)`;
      };
      fade(root.querySelector('[data-logo]'), 0.15, 0.35);
      root.querySelectorAll('[data-navlink]').forEach((el, i) => fade(el as HTMLElement, 0.2 + i * 0.03, 0.42 + i * 0.03));
      const btn = root.querySelector('[data-cta]') as HTMLElement | null;
      if (btn) {
        const p = Math.min(1, Math.max(0, (t - 0.23) / (0.42 - 0.23)));
        const e = 1 - Math.pow(1 - p, 3);
        btn.style.clipPath = isAr
          ? `inset(0 0 0 ${(1 - e) * 100}%)`
          : `inset(0 ${(1 - e) * 100}% 0 0)`;
        btn.style.opacity = String(Math.min(1, e + 0.01));
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isAr, revealRef]);

  return (
    <nav ref={rootRef} className="nav-root fixed top-0 left-0 right-0 z-50 flex items-center justify-between pointer-events-none"
      style={{ height: 'calc(86 * var(--n) * 1px)', paddingInline: 'calc(40 * var(--n) * 1px)' }}>
      <a href="#" data-logo aria-label={d.nav.logoAria[lang]} className="pointer-events-auto inline-flex"
        onClick={(e) => { e.preventDefault(); onNavClick('home'); }}>
        <svg width="46" height="46" viewBox="0 0 48 48" style={{ color: 'currentColor', transform: 'scale(var(--n))', transformOrigin: isAr ? 'top right' : 'top left' }}>
          <circle cx="24" cy="12.5" r="8.5" fill="currentColor" />
          <path d="M6 27c6-5 13-5 18 0s12 5 18 0v6c-6 5-13 5-18 0S12 28 6 33z" fill="currentColor" />
          <path d="M10 39c5-3.6 10-3.6 14 0s9 3.6 14 0" stroke="currentColor" strokeWidth="4.2" strokeLinecap="round" fill="none" />
        </svg>
      </a>
      <div className="nav-links hidden md:flex items-center" style={{ gap: 'calc(28 * var(--n) * 1px)', fontSize: 'calc(15 * var(--n) * 1px)' }}>
        {([
          ['home', d.nav.home[lang]], ['destinations', d.nav.destinations[lang]],
          ['whatYouGet', d.nav.whatYouGet[lang]], ['plan', d.nav.plan[lang]], ['contact', d.nav.contact[lang]],
        ] as const).map(([k, label]) => (
          <a key={k} data-navlink href="#" className="pointer-events-auto text-muted hover:text-ink transition-colors"
            onClick={(e) => { e.preventDefault(); onNavClick(k); }}>{label}</a>
        ))}
      </div>
      <div className="flex items-center" style={{ gap: 'calc(14 * var(--n) * 1px)' }}>
        <button
          className="pointer-events-auto text-muted hover:text-ink"
          style={{ fontSize: 'calc(15 * var(--n) * 1px)' }}
          onClick={() => setLang(isAr ? 'en' : 'ar')}
          aria-label="Switch language"
        >{d.nav.langSwitch[lang]}</button>
        <button
          data-cta
          className="nav-cta pointer-events-auto flex items-center text-bg"
          style={{
            background: 'var(--ink)', height: 'calc(42 * var(--n) * 1px)',
            paddingInline: 'calc(20 * var(--n) * 1px) calc(16 * var(--n) * 1px)',
            borderRadius: 'calc(12 * var(--n) * 1px)', fontSize: 'calc(15 * var(--n) * 1px)', fontWeight: 500,
            gap: 6,
          }}
          onClick={() => onNavClick('cta')}
        >
          {d.nav.cta[lang]}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={isAr ? { transform: 'scaleX(-1)' } : undefined}>
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </nav>
  );
}
