interface Env { TRAVELPAYOUTS_TOKEN?: string; TRAVELPAYOUTS_MARKER?: string }
import { GET as legacy } from '../../src/app/api/flights/route';
import { NextRequest } from 'next/server';
const IATA = /^[A-Z]{3}$/, DATE = /^\d{4}-\d{2}-\d{2}$/;
const CURR = ['USD','EUR','GBP','EGP','SAR','AED','TRY','KWD','QAR'];
const J = (o: unknown, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=300' } });
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
  const depart = sp.get('depart') || '', ret = sp.get('return') || '';
  const currency = (sp.get('currency') || 'USD').toUpperCase();
  if (!IATA.test(origin) || !IATA.test(destination) || !DATE.test(depart) || (ret && !DATE.test(ret))) return J({ error: 'invalid_params' }, 400);
  if (!CURR.includes(currency)) return J({ error: 'invalid_currency' }, 400);
  if (Date.parse(depart) - Date.now() > 365 * 864e5) return J({ error: 'window_too_far' }, 400);
  if (!env.TRAVELPAYOUTS_TOKEN) return legacy(new NextRequest(request));
  const marker = env.TRAVELPAYOUTS_MARKER || '';
  const q = async (dep: string, rt: string) => {
    const p = new URLSearchParams({ origin, destination, currency: currency.toLowerCase(), departure_at: dep, sorting: 'price', limit: '30', token: env.TRAVELPAYOUTS_TOKEN! });
    if (rt) p.set('return_at', rt);
    const r = await fetch(`https://api.travelpayouts.com/aviasales/v3/prices_for_dates?${p}`);
    if (!r.ok) throw new Error('upstream');
    return ((await r.json()) as { data?: Array<Record<string, unknown>> }).data || [];
  };
  try {
    let data = await q(depart, ret), monthWide = false;
    if (!data.length) { data = await q(depart.slice(0, 7), ''); monthWide = true; }
    const nm = await airlineNames();
    const flights = data.map(d => {
      const code = (d.airline as string) || '';
      const link = String(d.link || '');
      return {
        price: d.price, currency: String(d.currency || currency).toUpperCase(), airline: code, airlineName: nm[code] || code,
        stops: typeof d.transfers === 'number' ? d.transfers : null,
        departDate: String(d.departure_at || depart).slice(0, 10), returnDate: d.return_at ? String(d.return_at).slice(0, 10) : null,
        link: `https://www.aviasales.com${link}${marker ? (link.includes('?') ? '&' : '?') + 'marker=' + marker : ''}`,
        foundDaysAgo: d.found_at ? Math.max(0, Math.round((Date.now() - Date.parse(String(d.found_at))) / 864e5)) : null, mock: false,
      };
    });
    return J(monthWide ? { flights, mock: false, monthWide: true } : { flights, mock: false });
  } catch { return legacy(new NextRequest(request)); }
};
