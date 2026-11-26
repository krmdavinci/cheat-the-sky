'use client';
// Addendum A: "Where can I go?" visa explorer. Normal-flow section between the sky panel and the manifesto.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLang, dict } from './LangProvider';
import { countryName, flagEmoji } from '@/lib/countries';

interface MapEntry { code: string; category: 'free' | 'permit' | 'visa' | 'unknown'; label: string; days: number | null }
interface MapResponse { entries: MapEntry[]; source: string; fetchedAt: string; stale: boolean; error?: string }
interface CheckDetail {
  primaryRule: { name: string; duration: string | null; category: string } | null;
  secondaryRule: { name: string; duration: string | null; category: string } | null;
  exceptions: { number: number; name: string; duration: string | null; condition: string | null; note: string | null; link: string | null }[];
  mandatoryRegistrations: { name: string; link?: string }[];
  passportValidity: string | null;
  embassyUrl: string | null;
  source: string; fetchedAt: string; stale: boolean;
}

const PASSPORTS = 'EG SA AE TR SY JO MA DZ TN IQ LB SD LY YE KW QA BH OM PS US GB DE FR IT ES NL RU CN JP KR IN PK BR CA AU TH ID MY'.split(' ');

export default function VisaExplorer() {
  const { lang, isAr } = useLang();
  const d = dict.visa;
  const [passport, setPassport] = useState<string>('');
  const [passportQ, setPassportQ] = useState('');
  const [showList, setShowList] = useState(false);
  const [data, setData] = useState<MapResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<'all' | 'free' | 'permit' | 'visa' | 'unknown'>('all');
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState<{ code: string; data: CheckDetail | null; loading: boolean } | null>(null);
  const [visibleCount, setVisibleCount] = useState(24);
  const sheetRef = useRef<HTMLDivElement>(null);

  // restore saved passport (localStorage + URL param)
  useEffect(() => {
    const url = new URL(window.location.href);
    const p = url.searchParams.get('passport');
    const saved = window.localStorage.getItem('rehlaty-passport');
    const initial = p && /^[A-Z]{2}$/.test(p) ? p : saved && /^[A-Z]{2}$/.test(saved) ? saved : '';
    if (initial) setPassport(initial);
  }, []);

  const load = useCallback(async (pp: string) => {
    setLoading(true); setError(false); setData(null); setFilter('all'); setSearch(''); setVisibleCount(24);
    try {
      const res = await fetch(`/api/visa/map?passport=${pp}`);
      const json = await res.json();
      if (!res.ok || json.error) { setError(true); setData(null); }
      else setData(json);
    } catch { setError(true); }
    setLoading(false);
  }, []);

  useEffect(() => { if (passport) load(passport); }, [passport, load]);

  const choose = (code: string) => {
    setPassport(code); setPassportQ(''); setShowList(false);
    window.localStorage.setItem('rehlaty-passport', code);
    const url = new URL(window.location.href);
    url.searchParams.set('passport', code);
    window.history.replaceState(null, '', url.toString());
  };
  const clear = () => {
    setPassport(''); setData(null);
    window.localStorage.removeItem('rehlaty-passport');
    const url = new URL(window.location.href);
    url.searchParams.delete('passport');
    window.history.replaceState(null, '', url.toString());
  };

  const openDetail = async (code: string) => {
    setDetail({ code, data: null, loading: true });
    try {
      const res = await fetch(`/api/visa/check?passport=${passport}&destination=${code}`);
      const json = await res.json();
      setDetail({ code, data: res.ok ? json : null, loading: false });
    } catch { setDetail({ code, data: null, loading: false }); }
  };

  // focus trap basics for the sheet
  useEffect(() => {
    if (!detail) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setDetail(null); };
    window.addEventListener('keydown', onKey);
    sheetRef.current?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [detail]);

  const passportOptions = useMemo(() => {
    const names = PASSPORTS.map((c) => ({ code: c, name: countryName(c, lang), flag: flagEmoji(c) }));
    names.sort((a, b) => a.name.localeCompare(b.name, lang));
    names.sort((a, b) => (a.code === 'EG' ? -1 : b.code === 'EG' ? 1 : 0));
    const q = passportQ.trim().toLowerCase();
    return q ? names.filter((n) => n.name.toLowerCase().includes(q) || n.code.toLowerCase().includes(q) || countryName(n.code, 'en').toLowerCase().includes(q)) : names;
  }, [passportQ, lang]);

  const groups = useMemo(() => {
    if (!data) return null;
    const g: Record<string, MapEntry[]> = { free: [], permit: [], visa: [], unknown: [] };
    for (const e of data.entries) {
      const name = countryName(e.code, lang);
      if (search && !name.toLowerCase().includes(search.toLowerCase()) && !countryName(e.code, 'en').toLowerCase().includes(search.toLowerCase())) continue;
      (g[e.category] || g.unknown).push(e);
    }
    for (const k of Object.keys(g)) g[k].sort((a, b) => countryName(a.code, lang).localeCompare(countryName(b.code, lang), lang));
    return g;
  }, [data, lang, search]);

  const counts = { free: groups?.free.length || 0, permit: groups?.permit.length || 0, visa: groups?.visa.length || 0, unknown: groups?.unknown.length || 0 };
  const fmt = (s: string, vars: Record<string, string | number>) => Object.entries(vars).reduce((acc, [k, v]) => acc.replace(`{${k}}`, String(v)), s);
  const groupMeta = [
    { key: 'free' as const, title: d.gFree[lang], icon: '✓', countLabel: fmt(d.countFree[lang], { n: counts.free }) },
    { key: 'permit' as const, title: d.gPermit[lang], icon: '◍', countLabel: fmt(d.countPermit[lang], { n: counts.permit }) },
    { key: 'visa' as const, title: d.gVisa[lang], icon: '✦', countLabel: fmt(d.countVisa[lang], { n: counts.visa }) },
    { key: 'unknown' as const, title: d.gUnknown[lang], icon: '?', countLabel: String(counts.unknown) },
  ];

  return (
    <section id="visa-explorer" className="relative py-16 px-4" style={{ background: 'var(--bg)', direction: isAr ? 'rtl' : 'ltr' }}>
      <div className="max-w-5xl mx-auto">
        <p className="text-sm font-semibold" style={{ color: 'var(--harbour)' }}>{d.eyebrow[lang]}</p>
        <h2 className="mt-1" style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: isAr ? 700 : 600 }}>{d.title[lang]}</h2>
        <p className="mt-2 max-w-2xl" style={{ color: 'var(--sub-line-grey)' }}>{d.sub[lang]}</p>

        {/* passport select */}
        <div className="mt-6 relative max-w-md">
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--sub-line-grey)' }}>{d.selectLabel[lang]}</label>
          <input
            value={passport ? `${flagEmoji(passport)} ${countryName(passport, lang)}` : passportQ}
            placeholder={d.selectPh[lang]}
            onFocus={() => setShowList(true)}
            onChange={(e) => { setPassport(''); setPassportQ(e.target.value); setShowList(true); }}
            className="w-full rounded-xl border border-ink/15 bg-white/70 px-4 py-3 outline-none focus:border-harbour"
            style={{ minHeight: 48 }}
            aria-label={d.selectLabel[lang]}
          />
          {showList && (
            <div className="autocomplete-list" role="listbox" onMouseDown={(e) => e.preventDefault()}>
              {passportOptions.map((o) => (
                <button key={o.code} type="button" onClick={() => choose(o.code)} role="option" aria-selected={o.code === passport}>
                  <span>{o.flag}</span><span>{o.name}</span><bdi className="iata">{o.code}</bdi>
                </button>
              ))}
              {passportOptions.length === 0 && <div className="px-4 py-3 text-sm" style={{ color: 'var(--muted)' }}>{d.empty[lang]}</div>}
            </div>
          )}
        </div>
        {passport && (
          <button className="mt-2 text-sm underline" style={{ color: 'var(--muted)' }} onClick={clear}>{d.clear[lang]}</button>
        )}

        {/* disclaimer - always visible */}
        <p className="mt-4 text-xs leading-relaxed rounded-xl p-3" style={{ background: 'rgba(31,36,48,.05)', color: 'var(--sub-line-grey)' }}>
          {d.disclaimer[lang]}
        </p>

        {/* summary chips */}
        {data && (
          <>
            <div className="mt-6 flex flex-wrap gap-2">
              {groupMeta.map((g) => (
                <button key={g.key} onClick={() => setFilter(filter === g.key ? 'all' : g.key)}
                  className={`visa-badge ${g.key}`} style={{ minHeight: 36, fontSize: 13, outline: filter === g.key ? '2px solid var(--ink)' : 'none' }}>
                  <span aria-hidden>{g.icon}</span> {g.countLabel}
                </button>
              ))}
              <div className="relative flex-1 min-w-[180px]">
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={d.searchBox[lang]}
                  className="w-full rounded-full border border-ink/15 bg-white/70 px-4 py-2 text-sm outline-none" style={{ minHeight: 36 }} />
              </div>
            </div>
            <p className="mt-2 text-xs" style={{ color: 'var(--muted)' }}>
              {fmt(d.lastUpdate[lang], { d: String(data.fetchedAt).slice(0, 10) })} · {fmt(d.source[lang], { s: data.source })}
              {data.stale && <> · {fmt(d.staleNote[lang], { d: String(data.fetchedAt).slice(0, 10) })}</>}
            </p>
          </>
        )}

        {/* loading skeletons */}
        {loading && (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-white/50 animate-pulse" style={{ height: 88 }} />
            ))}
          </div>
        )}
        {error && <p className="mt-6" style={{ color: '#B3463C' }}>{d.errorState[lang]}</p>}

        {/* grouped cards */}
        {data && groups && (
          <div className="mt-6 space-y-8">
            {groupMeta.filter((g) => (filter === 'all' || filter === g.key) && groups[g.key].length > 0).map((g) => (
              <div key={g.key}>
                <h3 className="mb-3 flex items-center gap-2" style={{ fontSize: 20, fontWeight: 700 }}>
                  <span className={`visa-badge ${g.key}`}>{g.icon} {g.title}</span>
                  <span className="text-sm font-normal" style={{ color: 'var(--muted)' }}>{groups[g.key].length} {d.countries[lang]}</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {groups[g.key].slice(0, visibleCount).map((e) => (
                    <button key={e.code} onClick={() => openDetail(e.code)}
                      className="rounded-2xl bg-white/70 p-3 text-start shadow-sm hover:shadow-md transition-shadow"
                      style={{ minHeight: 44, contentVisibility: 'auto' }}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold truncate">{flagEmoji(e.code)} {countryName(e.code, lang)}</span>
                        <span className={`visa-badge ${e.category}`} style={{ fontSize: 10 }}>{groupMeta.find((m) => m.key === e.category)?.icon}</span>
                      </div>
                      {e.days != null && <div className="mt-1 text-xs" style={{ color: 'var(--sub-line-grey)' }}>{fmt(d.stayDays[lang], { n: e.days })}</div>}
                    </button>
                  ))}
                </div>
                {groups[g.key].length > visibleCount && (
                  <button className="mt-3 text-sm underline" style={{ color: 'var(--harbour)' }} onClick={() => setVisibleCount((v) => v + 48)}>
                    +{groups[g.key].length - visibleCount}
                  </button>
                )}
              </div>
            ))}
            {Object.values(groups).every((arr) => arr.length === 0) && <p style={{ color: 'var(--muted)' }}>{d.empty[lang]}</p>}
          </div>
        )}
      </div>

      {/* detail sheet (bottom on mobile, side panel on desktop) */}
      {detail && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-stretch sm:justify-end" role="dialog" aria-modal="true"
          style={{ background: 'rgba(18,20,27,.4)' }} onClick={() => setDetail(null)}>
          <div
            ref={sheetRef}
            data-visa-sheet
            tabIndex={-1}
            className="bg-white w-full sm:max-w-md max-h-[85vh] sm:max-h-none sm:h-full overflow-y-auto rounded-t-3xl sm:rounded-none p-5 outline-none"
            style={{ direction: isAr ? 'rtl' : 'ltr' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">{flagEmoji(detail.code)} {countryName(detail.code, lang)}</h3>
              <button onClick={() => setDetail(null)} aria-label="Close" className="w-10 h-10 rounded-full bg-bg flex items-center justify-center">✕</button>
            </div>
            {detail.loading && <div className="mt-4 space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-5 rounded bg-bg animate-pulse" />)}</div>}
            {!detail.loading && !detail.data && <p className="mt-4" style={{ color: '#B3463C' }}>{d.errorState[lang]}</p>}
            {!detail.loading && detail.data && (
              <div className="mt-4 space-y-4">
                <div>
                  <span className={`visa-badge ${detail.data.primaryRule?.category || 'unknown'}`}>
                    {detail.data.primaryRule?.name || d.gUnknown[lang]}
                  </span>
                  {detail.data.secondaryRule && (
                    <span className={`visa-badge ${detail.data.secondaryRule.category} ms-2`}>{detail.data.secondaryRule.name}</span>
                  )}
                  {(detail.data.primaryRule?.duration || detail.data.secondaryRule?.duration) && (
                    <p className="mt-2 text-sm">{fmt(d.stayDays[lang], { n: parseInt((detail.data.primaryRule?.duration || detail.data.secondaryRule?.duration || '0'), 10) || 0 })}</p>
                  )}
                  {detail.data.passportValidity && <p className="text-sm mt-1">{fmt(d.passportValidity[lang], { x: detail.data.passportValidity })}</p>}
                </div>

                {detail.data.mandatoryRegistrations.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-1">{d.mandatoryForm[lang]}</h4>
                    {detail.data.mandatoryRegistrations.map((m, i) => (
                      <p key={i} className="text-sm">
                        {m.name}{' '}
                        {m.link && <a href={m.link} target="_blank" rel="sponsored noopener" className="underline" style={{ color: 'var(--harbour)' }}>{d.officialSite[lang]}</a>}
                      </p>
                    ))}
                  </div>
                )}

                {detail.data.exceptions.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-1">{d.exceptions[lang]}</h4>
                    <ul className="text-sm space-y-1 list-disc ps-5">
                      {detail.data.exceptions.map((e) => (
                        <li key={e.number}>
                          {e.name}{e.duration ? ` – ${e.duration}` : ''}{e.condition ? ` (${e.condition})` : ''}
                          {e.link && <> · <a href={e.link} target="_blank" rel="sponsored noopener" className="underline" style={{ color: 'var(--harbour)' }}>{d.officialSite[lang]}</a></>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {(detail.data.primaryRule?.category === 'visa' || detail.data.primaryRule?.category === 'permit') && (
                  <div>
                    <h4 className="font-semibold text-sm mb-1">{d.howToVisa[lang]}</h4>
                    <ol className="text-sm space-y-1 list-decimal ps-5">
                      {detail.data.secondaryRule?.category === 'permit' && (
                        <li>{detail.data.secondaryRule.name}</li>
                      )}
                      {detail.data.mandatoryRegistrations.map((m, i) => (
                        <li key={i}>{m.name}</li>
                      ))}
                      {detail.data.embassyUrl && (
                        <li>
                          <a href={detail.data.embassyUrl} target="_blank" rel="sponsored noopener" className="underline" style={{ color: 'var(--harbour)' }}>{d.embassy[lang]}</a>
                        </li>
                      )}
                      {!detail.data.embassyUrl && detail.data.mandatoryRegistrations.length === 0 && !detail.data.secondaryRule && (
                        <li>{isAr ? 'اتأكد من الموقع الرسمي أو السفارة' : 'Check the official site or embassy'}</li>
                      )}
                    </ol>
                  </div>
                )}

                <p className="text-xs leading-relaxed rounded-xl p-3" style={{ background: 'rgba(31,36,48,.05)', color: 'var(--sub-line-grey)' }}>
                  {d.disclaimer[lang]}
                </p>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>
                  {fmt(d.lastUpdate[lang], { d: String(detail.data.fetchedAt).slice(0, 10) })} · {fmt(d.source[lang], { s: detail.data.source })}
                </p>
                <div className="flex gap-2 pb-4">
                  <a
                    className="search-submit flex items-center justify-center flex-1"
                    href={`/trip?to=&depart=&lang=${lang}&destinationName=${encodeURIComponent(countryName(detail.code, 'en'))}&passport=${passport}`}
                    onClick={(e) => {
                      e.preventDefault();
                      window.dispatchEvent(new CustomEvent('rehlaty:visa-destination', { detail: { code: detail.code, name: countryName(detail.code, 'en'), nameAr: countryName(detail.code, 'ar') } }));
                      setDetail(null);
                      document.querySelector('[data-search-card] input')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      window.dispatchEvent(new CustomEvent('rehlaty:focus-search'));
                    }}
                  >
                    {d.searchFlights[lang]}
                  </a>
                  {detail.data.embassyUrl && (
                    <a href={detail.data.embassyUrl} target="_blank" rel="sponsored noopener"
                      className="flex-1 text-center rounded-xl border border-ink/15 py-3">
                      {d.embassy[lang]}
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
