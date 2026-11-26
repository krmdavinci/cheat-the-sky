interface Env { TRAVELPAYOUTS_TOKEN?: string; TRAVELPAYOUTS_MARKER?: string }
const IATA = /^[A-Z]{3}$/;
const CURR = ['USD','EUR','GBP','EGP','SAR','AED','TRY','KWD','QAR'];
const J = (o: unknown, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json', 'cache-control': s === 200 ? 'public, max-age=600' : 'no-store' } });
let names: Record<string, string> | null = null;
async function airlineNames() {
  if (names) return names;
  try {
    const r = await fetch('https://api.travelpayouts.com/data/en/airlines.json', { cf: { cacheTtl: 86400, cacheEverything: true } } as RequestInit);
    const a = (await r.json()) as Array<{ code: string; name: string }>;
    names = Object.fromEntries(a.filter(x => x.name).map(x => [x.code, x.name]));
  } catch { names = {}; }
  return names!;
}
export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
  const sp = new URL(request.url).searchParams;
  const origin = (sp.get('from') || '').toUpperCase(), destination = (sp.get('to') || '').toUpperCase();
  const currency = (sp.get('currency') || 'USD').toUpperCase();
  const dep = sp.get('dep') || '', ret = sp.get('ret') || '';
  const MON = /^\d{4}-(0[1-9]|1[0-2])$/;
  if (!IATA.test(origin) || !IATA.test(destination) || origin === destination || !MON.test(dep) || (ret && !MON.test(ret))) return J({ error: 'invalid_params' }, 400);
  if (ret && ret < dep) return J({ error: 'return_before_departure' }, 400);
  if (!CURR.includes(currency)) return J({ error: 'invalid_currency' }, 400);
  if (!env.TRAVELPAYOUTS_TOKEN) return J({ error: 'unavailable' }, 503);
  const marker = env.TRAVELPAYOUTS_MARKER || '';
  const today = new Date().toISOString().slice(0, 10);
  const q = async (o: string, d: string, dat: string, extra: Record<string, string>) => {
    const p = new URLSearchParams({ origin: o, destination: d, currency: currency.toLowerCase(), departure_at: dat, sorting: 'price', unique: 'false', token: env.TRAVELPAYOUTS_TOKEN!, ...extra });
    const r = await fetch(`https://api.travelpayouts.com/aviasales/v3/prices_for_dates?${p}`);
    if (!r.ok) throw new Error('upstream');
    return ((await r.json()) as { data?: Array<Record<string, unknown>> }).data || [];
  };
  try {
    const [nm, rt, out, back] = await Promise.all([
      airlineNames(),
      ret ? q(origin, destination, dep, { return_at: ret, one_way: 'false', limit: '50' }) : Promise.resolve([]),
      q(origin, destination, dep, { one_way: 'true', limit: '1000' }),
      ret ? q(destination, origin, ret, { one_way: 'true', limit: '1000' }) : Promise.resolve([]),
    ]);
    const mk = (x: Record<string, unknown>) => {
      const code = (x.airline as string) || '', link = String(x.link || '');
      return {
        price: Number(x.price), currency, airline: code, airlineName: nm[code] || code,
        stops: typeof x.transfers === 'number' ? x.transfers : null,
        departDate: String(x.departure_at || '').slice(0, 10), returnDate: x.return_at ? String(x.return_at).slice(0, 10) : null,
        link: `https://www.aviasales.com${link}${marker ? (link.includes('?') ? '&' : '?') + 'marker=' + marker : ''}`,
      };
    };
    const perDay = (d: Array<Record<string, unknown>>) => {
      const best = new Map<string, ReturnType<typeof mk>>();
      for (const x of d) {
        const f = mk(x);
        if (!f.departDate || f.departDate < today || !Number.isFinite(f.price)) continue;
        const c = best.get(f.departDate);
        if (!c || f.price < c.price) best.set(f.departDate, f);
      }
      return [...best.values()].sort((a, b) => a.departDate.localeCompare(b.departDate));
    };
    const roundTrips = rt.map(mk).filter(f => f.departDate >= today && Number.isFinite(f.price)).slice(0, 15);
    return J({ currency, dep, ret, roundTrips, outbound: perDay(out), inbound: perDay(back) });
  } catch { return J({ error: 'upstream' }, 502); }
};
