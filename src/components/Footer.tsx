'use client';
// Section 4.4: dark footer with second search card, disclosure, saved trips.
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLang, dict } from './LangProvider';
import SearchCard from './SearchCard';

interface SavedTrip { from: string; to: string; depart: string; ret?: string; currency: string; label: string; }

export default function Footer() {
  const { lang, isAr } = useLang();
  const d = dict;
  const [saved, setSaved] = useState<SavedTrip[]>([]);
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('rehlaty-saved-trips');
      if (raw) setSaved(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  return (
    <footer id="contact" className="min-h-screen py-16 px-4" style={{ background: 'var(--dark)', color: '#fff', direction: isAr ? 'rtl' : 'ltr' }}>
      <div className="max-w-5xl mx-auto flex flex-col items-center gap-8">
        <h2 className="text-center" style={{ fontSize: 'calc(var(--mfs, 48px) * 0.9)', fontWeight: isAr ? 700 : 560 }}>
          {d.footer.closing[lang]}
        </h2>
        <SearchCard dark idPrefix="footer" />

        {saved.length > 0 && (
          <div className="w-full mt-4">
            <h3 className="text-sm mb-2" style={{ color: 'var(--dark-nav-links)' }}>{d.footer.savedTrips[lang]}</h3>
            <div className="flex flex-wrap gap-2">
              {saved.map((s, i) => (
                <Link key={i} href={`/trip?from=${s.from}&to=${s.to}&depart=${s.depart}${s.ret ? `&return=${s.ret}` : ''}&currency=${s.currency}&lang=${lang}`}
                  className="rounded-full px-4 py-2 text-sm" style={{ background: 'rgba(255,255,255,.08)' }}>
                  {s.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="w-full mt-8 text-xs leading-relaxed" style={{ color: 'var(--dark-nav-links)' }}>
          <h3 className="font-semibold mb-1 text-white/80">{d.footer.disclosureTitle[lang]}</h3>
          <p>{d.footer.disclosure[lang]}</p>
        </div>

        <div className="w-full flex flex-wrap items-center justify-between gap-4 text-sm pt-6 border-t" style={{ borderColor: 'rgba(255,255,255,.1)', color: 'var(--dark-nav-links)' }}>
          <div className="flex gap-4">
            <a href="#">{d.footer.privacy[lang]}</a>
            <a href="#">{d.footer.terms[lang]}</a>
            <a href="#">{d.footer.about[lang]}</a>
          </div>
          <p>© {new Date().getFullYear()} {d.footer.copyright[lang]}</p>
        </div>
      </div>
    </footer>
  );
}
