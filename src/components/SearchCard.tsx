'use client';
// Section 9.1: search form used in the story and the footer (dark variant).
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLang, dict } from './LangProvider';
import type { Airport } from '@/lib/airports';

interface Props {
  dark?: boolean;
  onFocusTargetRef?: React.MutableRefObject<(() => void) | null>;
  idPrefix?: string;
}

export default function SearchCard({ dark, onFocusTargetRef, idPrefix = 'sc' }: Props) {
  const { lang, isAr } = useLang();
  const d = dict;
  const router = useRouter();
  const [from, setFrom] = useState<Airport | null>(null);
  const [to, setTo] = useState<Airport | null>(null);
  const [fromQ, setFromQ] = useState('');
  const [toQ, setToQ] = useState('');
  const [depart, setDepart] = useState('');
  const [ret, setRet] = useState('');
  const [oneWay, setOneWay] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [listFor, setListFor] = useState<'from' | 'to' | null>(null);
  const [results, setResults] = useState<Airport[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passport, setPassport] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const toInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const f = window.localStorage.getItem('rehlaty-from');
      if (f) { const a = JSON.parse(f); setFrom(a); setFromQ(`${a.city} (${a.iata})`); }
      const c = window.localStorage.getItem('rehlaty-currency');
      if (c) setCurrency(c);
      const p = window.localStorage.getItem('rehlaty-passport');
      if (p) setPassport(p);
      const t = window.sessionStorage.getItem('rehlaty-prefill-to');
      if (t) { const a = JSON.parse(t); setTo(a); setToQ(`${a.city} (${a.iata})`); window.sessionStorage.removeItem('rehlaty-prefill-to'); }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (onFocusTargetRef) {
      onFocusTargetRef.current = () => {
        if (!to) { setListFor('to'); toInputRef.current?.focus(); }
        else dateInputRef.current?.focus();
      };
    }
  }, [onFocusTargetRef, to]);

  // Prefill "To" when a destination card is tapped (custom event)
  useEffect(() => {
    const handler = (e: Event) => {
      const a = (e as CustomEvent).detail as Airport;
      setTo(a); setToQ(`${a.city} (${a.iata})`);
      setTimeout(() => dateInputRef.current?.focus(), 400);
    };
    window.addEventListener('rehlaty:set-destination', handler);
    return () => window.removeEventListener('rehlaty:set-destination', handler);
  }, []);

  const search = useCallback((q: string, which: 'from' | 'to') => {
    clearTimeout(debounceRef.current);
    if (q.trim().length < 2) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/places?q=${encodeURIComponent(q)}`);
        const json = await res.json();
        setResults(json.places || []);
        setListFor(which);
      } catch { setResults([]); }
    }, 200);
  }, []);

  const submit = () => {
    const errs: Record<string, string> = {};
    if (!from) errs.from = d.search.errFrom[lang];
    if (!to) errs.to = d.search.errTo[lang];
    if (from && to && from.iata === to.iata) errs.to = d.search.errSame[lang];
    if (!depart) errs.depart = d.search.errDepart[lang];
    if (!oneWay && ret && ret < depart) errs.ret = d.search.errReturn[lang];
    setErrors(errs);
    if (Object.keys(errs).length) return;
    window.localStorage.setItem('rehlaty-from', JSON.stringify(from));
    window.localStorage.setItem('rehlaty-currency', currency);
    const sp = new URLSearchParams({ from: from!.iata, to: to!.iata, depart, currency, lang });
    if (!oneWay && ret) sp.set('return', ret);
    if (passport) sp.set('passport', passport);
    router.push(`/trip?${sp.toString()}`);
  };

  const today = new Date().toISOString().slice(0, 10);
  const swap = () => {
    const a = from, aq = fromQ;
    setFrom(to); setFromQ(toQ); setTo(a); setToQ(aq);
  };

  return (
    <div className={`search-card ${dark ? 'dark' : ''}`} data-search-card>
      <div className="flex flex-col gap-2 lg:flex-row lg:items-end">
        <div className="flex gap-2 flex-1 items-end">
          <div className="relative flex-1">
            <label htmlFor={`${idPrefix}-from`}>{d.search.from[lang]}</label>
            <input
              id={`${idPrefix}-from`}
              value={fromQ}
              autoComplete="off"
              placeholder={d.search.fromPh[lang]}
              onChange={(e) => { setFromQ(e.target.value); setFrom(null); search(e.target.value, 'from'); }}
              onFocus={() => fromQ.trim().length >= 2 && setListFor('from')}
              onBlur={() => setTimeout(() => setListFor((v) => (v === 'from' ? null : v)), 150)}
            />
            {listFor === 'from' && results.length > 0 && (
              <div className="autocomplete-list">
                {results.map((a) => (
                  <button key={a.iata} type="button" onMouseDown={() => { setFrom(a); setFromQ(`${a.city} (${a.iata})`); setListFor(null); }}>
                    <bdi className="iata">{a.iata}</bdi>
                    <span>{isAr ? a.cityAr : a.city}, {isAr ? a.countryAr : a.country}</span>
                  </button>
                ))}
              </div>
            )}
            <div className="search-err">{errors.from || ''}</div>
          </div>
          <button type="button" aria-label={d.search.swap[lang]} onClick={swap}
            className="shrink-0 mb-5 h-[40px] w-[40px] rounded-full border border-ink/15 bg-white/60 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={isAr ? { transform: 'scaleX(-1)' } : undefined}>
              <path d="M2 6h9M8 3l3 3-3 3M14 10H5M8 7l-3 3 3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="relative flex-1">
            <label htmlFor={`${idPrefix}-to`} className="flex items-center gap-2">
              {d.search.to[lang]}
              {passport && <span className="visa-badge free" style={{ fontSize: 10 }}>{d.search.visaBadge[lang]}</span>}
            </label>
            <input
              id={`${idPrefix}-to`}
              ref={toInputRef}
              value={toQ}
              autoComplete="off"
              placeholder={d.search.toPh[lang]}
              onChange={(e) => { setToQ(e.target.value); setTo(null); search(e.target.value, 'to'); }}
              onFocus={() => toQ.trim().length >= 2 && setListFor('to')}
              onBlur={() => setTimeout(() => setListFor((v) => (v === 'to' ? null : v)), 150)}
            />
            {listFor === 'to' && results.length > 0 && (
              <div className="autocomplete-list">
                {results.map((a) => (
                  <button key={a.iata} type="button" onMouseDown={() => { setTo(a); setToQ(`${a.city} (${a.iata})`); setListFor(null); }}>
                    <bdi className="iata">{a.iata}</bdi>
                    <span>{isAr ? a.cityAr : a.city}, {isAr ? a.countryAr : a.country}</span>
                  </button>
                ))}
              </div>
            )}
            <div className="search-err">{errors.to || ''}</div>
          </div>
        </div>
        <div className="flex gap-2 flex-1 items-end">
          <div className="flex-1">
            <label htmlFor={`${idPrefix}-depart`}>{d.search.depart[lang]}</label>
            <input id={`${idPrefix}-depart`} ref={dateInputRef} type="date" min={today} value={depart}
              onChange={(e) => { setDepart(e.target.value); if (ret && e.target.value > ret) setRet(''); }} />
            <div className="search-err">{errors.depart || ''}</div>
          </div>
          {!oneWay && (
            <div className="flex-1">
              <label htmlFor={`${idPrefix}-return`}>{d.search.return[lang]}</label>
              <input id={`${idPrefix}-return`} type="date" min={depart || today} value={ret} onChange={(e) => setRet(e.target.value)} />
              <div className="search-err">{errors.ret || ''}</div>
            </div>
          )}
        </div>
        <div className="flex gap-2 items-end">
          <div>
            <label htmlFor={`${idPrefix}-cur`}>{d.search.currency[lang]}</label>
            <select id={`${idPrefix}-cur`} value={currency} onChange={(e) => setCurrency(e.target.value)} style={{ minWidth: 84 }}>
              {['USD', 'EUR', 'TRY', 'EGP', 'SAR', 'AED'].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="search-err" />
          </div>
          <div>
            <label className="invisible">.</label>
            <button type="button" className="search-submit w-full" onClick={submit}>{d.search.submit[lang]}</button>
            <div className="search-err" />
          </div>
        </div>
      </div>
      <label className="flex items-center gap-2 mt-1 text-[12px] cursor-pointer select-none">
        <input type="checkbox" checked={oneWay} onChange={(e) => setOneWay(e.target.checked)} style={{ width: 16, height: 16, minHeight: 0 }} />
        {d.search.oneWay[lang]}
      </label>
    </div>
  );
}
