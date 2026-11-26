'use client';
// Section 10: results page. Same premium look, no scroll hijacking.
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLang, dict } from '@/components/LangProvider';
import SearchCard from '@/components/SearchCard';
import { countryName, flagEmoji } from '@/lib/countries';
import { destinationByIata } from '@/lib/destinations';

interface Flight { price: number; currency: string; airline: string; airlineName: string; stops: number | null; departDate: string; returnDate: string | null; link: string; foundDaysAgo: number | null }
interface Provider { provider: string; url: string }
interface DayPlan { day: number; morning: string; afternoon: string; evening: string; tip: string }
interface Notes { currency: string; language: string; plugs: string; safety: string; customs: string; transport: string; best_season: string; daily_budget_range: string; official_links: { label: string; url: string }[] }

type Tab = 'flights' | 'hotels' | 'plan' | 'notes';

function TripInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const { lang, isAr } = useLang();
  const d = dict.trip;
  const from = sp.get('from') || '';
  const to = sp.get('to') || '';
  const depart = sp.get('depart') || '';
  const ret = sp.get('return') || '';
  const currency = sp.get('currency') || 'USD';
  const passport = sp.get('passport') || (typeof window !== 'undefined' ? window.localStorage.getItem('rehlaty-passport') || '' : '');
  const [tab, setTab] = useState<Tab>((sp.get('tab') as Tab) || 'flights');
  const [editOpen, setEditOpen] = useState(false);
  const [savedState, setSavedState] = useState(false);
  const [copied, setCopied] = useState(false);

  const [flights, setFlights] = useState<Flight[] | null>(null);
  const [flightsMock, setFlightsMock] = useState(false);
  const [flightsErr, setFlightsErr] = useState(false);
  const [hotels, setHotels] = useState<{ providers: Provider[]; nights: number } | null>(null);
  const [guide, setGuide] = useState<{ plan: DayPlan[]; notes: Notes } | null>(null);
  const [guideAi, setGuideAi] = useState(false);
  const [guideErr, setGuideErr] = useState(false);
  const [visa, setVisa] = useState<{ primaryRule: { name: string; category: string; duration: string | null } | null; stale: boolean; fetchedAt: string; source: string } | null>(null);

  const toDest = useMemo(() => destinationByIata(to), [to]);
  const nights = useMemo(() => (depart && ret ? Math.max(1, Math.round((Date.parse(ret) - Date.parse(depart)) / 86400000)) : 3), [depart, ret]);

  const loadFlights = useCallback(async (dd?: string, rr?: string | null) => {
    setFlightsErr(false); setFlights(null);
    try {
      const q = new URLSearchParams({ from, to, depart: dd || depart, currency });
      const rrUse = rr !== undefined ? rr : ret;
      if (rrUse) q.set('return', rrUse);
      const res = await fetch(`/api/flights?${q}`);
      const json = await res.json();
      if (!res.ok) throw new Error();
      setFlights(json.flights || []);
      setFlightsMock(!!json.mock);
    } catch { setFlightsErr(true); }
  }, [from, to, depart, ret, currency]);

  useEffect(() => { if (from && to && depart) loadFlights(); }, [from, to, depart, loadFlights]);

  useEffect(() => {
    if (!to || !depart) return;
    const city = toDest?.name || to;
    const checkout = ret || new Date(Date.parse(depart) + nights * 86400000).toISOString().slice(0, 10);
    fetch(`/api/hotels?city=${encodeURIComponent(city)}&checkin=${depart}&checkout=${checkout}`)
      .then((r) => r.json()).then((j) => !j.error && setHotels(j)).catch(() => {});
    const destSlug = toDest?.slug;
    if (destSlug) {
      const days = ret ? nights + 1 : 3;
      fetch(`/api/guide?destination=${destSlug}&days=${Math.min(days, 14)}&lang=${lang}`)
        .then((r) => r.json()).then((j) => { if (j.guide) { setGuide(j.guide); setGuideAi(!!j.ai); } else setGuideErr(true); })
        .catch(() => setGuideErr(true));
    } else setGuideErr(true);
  }, [to, depart, ret, toDest, lang, nights]);

  useEffect(() => {
    if (!passport || !toDest) return;
    // country ISO of the destination: map from slug via a small table
    const DEST_ISO: Record<string, string> = {
      istanbul: 'TR', dubai: 'AE', rome: 'IT', bangkok: 'TH', paris: 'FR', tokyo: 'JP',
      barcelona: 'ES', cairo: 'EG', london: 'GB', 'kuala-lumpur': 'MY', baku: 'AZ', lisbon: 'PT',
      maldives: 'MV', bali: 'ID', santorini: 'GR', marrakech: 'MA', 'sharm-el-sheikh': 'EG', prague: 'CZ',
      athens: 'GR', 'new-york': 'US',
    };
    const iso = DEST_ISO[toDest.slug];
    if (!iso) return;
    fetch(`/api/visa/check?passport=${passport}&destination=${iso}`)
      .then((r) => r.json()).then((j) => { if (!j.error) setVisa(j); }).catch(() => {});
  }, [passport, toDest]);

  const switchTab = (t2: Tab) => {
    setTab(t2);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', t2);
    window.history.replaceState(null, '', url.toString());
  };

  const save = () => {
    try {
      const raw = window.localStorage.getItem('rehlaty-saved-trips');
      const arr = raw ? JSON.parse(raw) : [];
      arr.unshift({ from, to, depart, ret, currency, label: `${from} → ${to} · ${depart}` });
      window.localStorage.setItem('rehlaty-saved-trips', JSON.stringify(arr.slice(0, 10)));
      setSavedState(true);
    } catch { /* ignore */ }
  };
  const share = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* ignore */ }
  };

  // price calendar strip: cheapest days +/- 7 around depart (from the same API)
  const [calendar, setCalendar] = useState<{ date: string; price: number }[]>([]);
  useEffect(() => {
    if (!from || !to || !depart) return;
    const days: Promise<{ date: string; price: number } | null>[] = [];
    for (let i = -7; i <= 7; i += 2) {
      const dt = new Date(Date.parse(depart) + i * 86400000);
      if (dt.getTime() < Date.now() - 86400000) continue;
      const ds = dt.toISOString().slice(0, 10);
      days.push(
        fetch(`/api/flights?from=${from}&to=${to}&depart=${ds}&currency=${currency}`)
          .then((r) => r.json())
          .then((j) => (j.flights?.[0] ? { date: ds, price: j.flights[0].price } : null))
          .catch(() => null),
      );
    }
    Promise.all(days).then((rows) => setCalendar(rows.filter((r): r is { date: string; price: number } => !!r)));
  }, [from, to, depart, currency]);

  const minCal = calendar.length ? Math.min(...calendar.map((c) => c.price)) : 0;
  const tabs: { key: Tab; label: string }[] = [
    { key: 'flights', label: d.flights[lang] },
    { key: 'hotels', label: d.hotels[lang] },
    { key: 'plan', label: d.planTab[lang] },
    { key: 'notes', label: d.notes[lang] },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--ink)', direction: isAr ? 'rtl' : 'ltr' }}>
      {/* sticky summary bar */}
      <div className="sticky top-0 z-40 px-4 py-3 backdrop-blur-md" style={{ background: 'rgba(241,236,234,.85)', borderBottom: '1px solid rgba(31,36,48,.08)' }}>
        <div className="max-w-4xl mx-auto flex items-center gap-3 flex-wrap">
          <button onClick={() => router.push(`/?lang=${lang}`)} className="text-sm underline" style={{ color: 'var(--muted)' }}>{d.back[lang]}</button>
          <div className="font-semibold text-sm">
            <bdi>{from}</bdi> → <bdi>{to}</bdi> · {depart}{ret ? ` – ${ret}` : ` · ${d.oneWayTrip[lang]}`} · <bdi>{currency}</bdi>
            {passport && <span className="ms-2">{flagEmoji(passport)}</span>}
          </div>
          <div className="ms-auto flex items-center gap-2">
            <button onClick={() => setEditOpen(!editOpen)} className="rounded-full px-4 py-2 text-sm" style={{ background: 'rgba(31,36,48,.06)', minHeight: 40 }}>{d.edit[lang]}</button>
            <button onClick={save} aria-label={d.save[lang]} className="rounded-full px-4 py-2 text-sm" style={{ background: 'rgba(31,36,48,.06)', minHeight: 40 }}>
              {savedState ? '♥' : '♡'} {savedState ? d.saved[lang] : d.save[lang]}
            </button>
            <button onClick={share} className="rounded-full px-4 py-2 text-sm" style={{ background: 'rgba(31,36,48,.06)', minHeight: 40 }}>{copied ? d.copied[lang] : d.share[lang]}</button>
          </div>
        </div>
        {editOpen && <div className="max-w-4xl mx-auto mt-3 flex justify-center"><SearchCard idPrefix="edit" /></div>}
      </div>

      {/* tabs */}
      <div className="max-w-4xl mx-auto px-4 mt-4">
        <div className="flex gap-1 border-b" style={{ borderColor: 'rgba(31,36,48,.1)' }} role="tablist">
          {tabs.map((t2) => (
            <button key={t2.key} role="tab" aria-selected={tab === t2.key} onClick={() => switchTab(t2.key)}
              className="px-4 py-3 text-sm font-medium relative"
              style={{ color: tab === t2.key ? 'var(--ink)' : 'var(--muted)', minHeight: 44 }}>
              {t2.label}
              {tab === t2.key && <span className="absolute bottom-0 inset-x-2 h-0.5 rounded" style={{ background: 'var(--ink)' }} />}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {flightsMock && tab === 'flights' && (
          <div className="mb-4"><span className="visa-badge unknown">🧪 {d.sampleData[lang]}</span></div>
        )}

        {tab === 'flights' && (
          <div className="space-y-6">
            {calendar.length > 2 && (
              <div>
                <h3 className="text-sm font-semibold mb-1">{d.cheapestDays[lang]}</h3>
                <p className="text-xs mb-2" style={{ color: 'var(--muted)' }}>{d.calendarHint[lang]}</p>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {calendar.map((c) => (
                    <button key={c.date} onClick={() => loadFlights(c.date, ret || null)}
                      className="rounded-xl px-3 py-2 text-center shrink-0"
                      style={{
                        background: c.price === minCal ? 'var(--ice)' : 'rgba(255,255,255,.6)',
                        border: c.date === depart ? '2px solid var(--ink)' : '1px solid rgba(31,36,48,.08)',
                        minWidth: 84, minHeight: 44,
                      }}>
                      <div className="text-xs" style={{ color: 'var(--muted)' }}>{c.date.slice(5)}</div>
                      <div className="font-bold text-sm"><bdi>{c.price} {currency}</bdi></div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {!flights && !flightsErr && (
              <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-3xl bg-white/60 animate-pulse" />)}</div>
            )}
            {flightsErr && (
              <div className="rounded-3xl bg-white/70 p-6 text-center">
                <p>{d.error[lang]}</p>
                <button onClick={() => loadFlights()} className="search-submit mt-3">{d.retry[lang]}</button>
              </div>
            )}
            {flights && flights.length === 0 && <p className="text-center py-8" style={{ color: 'var(--muted)' }}>{d.noFares[lang]}</p>}
            <div className="space-y-3">
              {flights?.map((f, i) => (
                <div key={i} className="rounded-3xl bg-white/70 p-4 flex flex-wrap items-center gap-3" style={{ borderRadius: 24 }}>
                  <div className="flex-1 min-w-[140px]">
                    <div className="font-semibold">{f.airlineName || f.airline}</div>
                    <div className="text-sm" style={{ color: 'var(--muted)' }}>
                      {f.departDate}{f.returnDate ? ` → ${f.returnDate}` : ''} · {f.stops === 0 ? d.stops0[lang] : f.stops === 1 ? d.stops1[lang] : f.stops === 2 ? d.stops2[lang] : ''}
                    </div>
                    {f.foundDaysAgo != null && (
                      <div className="text-xs" style={{ color: 'var(--muted)' }}>
                        {f.foundDaysAgo === 0 ? d.foundToday[lang] : d.foundAgo[lang].replace('{n}', String(f.foundDaysAgo))}
                      </div>
                    )}
                  </div>
                  <div className="text-end">
                    <div className="text-xl font-bold"><bdi>{d.from[lang]} {f.price} {f.currency}</bdi></div>
                    <div className="text-xs" style={{ color: 'var(--muted)' }}>{d.priceMayChange[lang]}</div>
                    <a href={f.link} target="_blank" rel="sponsored noopener" className="search-submit inline-block mt-2 text-sm" style={{ textDecoration: 'none' }}>{d.book[lang]}</a>
                    <div className="text-[10px] mt-1" style={{ color: 'var(--muted)' }}>{d.affiliateLine[lang]}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'hotels' && (
          <div className="space-y-3">
            {!hotels && <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-24 rounded-3xl bg-white/60 animate-pulse" />)}</div>}
            {hotels?.providers.map((p) => (
              <div key={p.provider} className="rounded-3xl bg-white/70 p-5 flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold">{p.provider}</div>
                  <div className="text-sm" style={{ color: 'var(--muted)' }}>
                    {d.checkIn[lang]} {hotels && depart} · {d.checkOut[lang]} {ret || ''} · {hotels.nights} {isAr ? 'ليالي' : 'nights'}
                  </div>
                </div>
                <div className="text-end">
                  <a href={p.url} target="_blank" rel="sponsored noopener" className="search-submit inline-block text-sm">{d.compareHotels[lang]}</a>
                  <div className="text-[10px] mt-1" style={{ color: 'var(--muted)' }}>{d.affiliateLine[lang]}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'plan' && (
          <div className="space-y-3">
            {guideAi && <div className="text-xs mb-2" style={{ color: 'var(--muted)' }}>✨ {d.aiDisclaimer[lang]}</div>}
            {!guide && !guideErr && <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-28 rounded-3xl bg-white/60 animate-pulse" />)}</div>}
            {guideErr && <p className="text-center py-8" style={{ color: 'var(--muted)' }}>{d.error[lang]}</p>}
            {guide?.plan.map((day) => (
              <div key={day.day} className="rounded-3xl bg-white/70 p-5">
                <div className="font-bold mb-2">{d.day[lang]} {day.day}</div>
                <div className="grid gap-2 text-sm">
                  <p><b>{d.morning[lang]}:</b> {day.morning}</p>
                  <p><b>{d.afternoon[lang]}:</b> {day.afternoon}</p>
                  <p><b>{d.evening[lang]}:</b> {day.evening}</p>
                  <p style={{ color: 'var(--harbour)' }}><b>{d.tip[lang]}:</b> {day.tip}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'notes' && (
          <div>
            {/* visa line from /api/visa/check (Addendum A6) */}
            <div className="rounded-3xl bg-white/70 p-5 mb-4">
              <h3 className="font-bold mb-2">{d.visaNotesTitle[lang]}</h3>
              {!passport && <p className="text-sm" style={{ color: 'var(--muted)' }}>{d.pickPassport[lang]}</p>}
              {passport && !visa && <div className="h-6 rounded bg-bg animate-pulse" />}
              {visa && (
                <div className="text-sm space-y-1">
                  <p>
                    {flagEmoji(passport)} {countryName(passport, lang)} → {toDest ? (isAr ? toDest.nameAr : toDest.name) : to}:{' '}
                    <span className={`visa-badge ${visa.primaryRule?.category || 'unknown'}`}>{visa.primaryRule?.name || '?'}</span>
                    {visa.primaryRule?.duration && <span className="ms-2">{visa.primaryRule.duration}</span>}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>{d.officialSource[lang]}</p>
                  <a className="text-sm underline" style={{ color: 'var(--harbour)' }}
                    href={`/?lang=${lang}&passport=${passport}#visa-explorer`}>{dict.visa.seeRequirements[lang]}</a>
                </div>
              )}
            </div>
            {!guide && !guideErr && <div className="grid sm:grid-cols-2 gap-3">{[1, 2, 3, 4].map((i) => <div key={i} className="h-24 rounded-3xl bg-white/60 animate-pulse" />)}</div>}
            {guide && (
              <div className="grid sm:grid-cols-2 gap-3">
                {([
                  ['💵', d.currency[lang], guide.notes.currency],
                  ['🗣️', d.language[lang], guide.notes.language],
                  ['🔌', d.plugs[lang], guide.notes.plugs],
                  ['🛡️', d.safety[lang], guide.notes.safety],
                  ['🤝', d.customs[lang], guide.notes.customs],
                  ['🚇', d.transport[lang], guide.notes.transport],
                  ['🌤️', d.bestSeason[lang], guide.notes.best_season],
                  ['💰', d.dailyBudget[lang], guide.notes.daily_budget_range],
                ] as const).map(([icon, label, value], i) => (
                  <div key={i} className="rounded-3xl bg-white/70 p-4">
                    <div className="text-sm font-semibold mb-1">{icon} {label}</div>
                    <div className="text-sm" style={{ color: 'var(--sub-line-grey)' }}>{value}</div>
                  </div>
                ))}
                <div className="rounded-3xl bg-white/70 p-4 sm:col-span-2">
                  <div className="text-sm font-semibold mb-1">🔗 {d.officialLinks[lang]}</div>
                  <ul className="text-sm space-y-1">
                    {guide.notes.official_links.map((l, i) => (
                      <li key={i}><a href={l.url} target="_blank" rel="noopener" className="underline" style={{ color: 'var(--harbour)' }}>{l.label}</a></li>
                    ))}
                  </ul>
                  <p className="text-xs mt-2" style={{ color: 'var(--muted)' }}>{d.officialSource[lang]}{guideAi ? ` · ${d.aiDisclaimer[lang]}` : ''}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TripPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: 'var(--bg)' }} />}>
      <TripInner />
    </Suspense>
  );
}
