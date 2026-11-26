// Section 9.2: /api/flights - Travelpayouts Data API with mock fallback.
// Sorted by price ascending. Prices are cached "from" prices - never guaranteed.
import { NextRequest, NextResponse } from 'next/server';
import { mockFlights } from '@/lib/mockFlights';

export const runtime = 'edge';

const IATA = /^[A-Z]{3}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const CURR = ['USD', 'EUR', 'TRY', 'EGP', 'SAR', 'AED'];

// naive per-IP rate limit (edge memory; best effort)
const hits = new Map<string, { n: number; t: number }>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const rec = hits.get(ip);
  if (!rec || now - rec.t > 60_000) { hits.set(ip, { n: 1, t: now }); return false; }
  rec.n++;
  return rec.n > 30;
}

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'anon';
  if (rateLimited(ip)) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  const sp = req.nextUrl.searchParams;
  const origin = (sp.get('from') || '').toUpperCase();
  const destination = (sp.get('to') || '').toUpperCase();
  const depart = sp.get('depart') || '';
  const ret = sp.get('return') || '';
  const currency = (sp.get('currency') || 'USD').toUpperCase();

  if (!IATA.test(origin) || !IATA.test(destination) || !DATE.test(depart)) {
    return NextResponse.json({ error: 'invalid_params' }, { status: 400 });
  }
  if (ret && !DATE.test(ret)) return NextResponse.json({ error: 'invalid_params' }, { status: 400 });
  if (!CURR.includes(currency)) return NextResponse.json({ error: 'invalid_currency' }, { status: 400 });
  if (Date.parse(depart) - Date.now() > 365 * 24 * 3600 * 1000) {
    return NextResponse.json({ error: 'window_too_far' }, { status: 400 });
  }

  const token = process.env.TRAVELPAYOUTS_TOKEN;
  const marker = process.env.TRAVELPAYOUTS_MARKER || '';
  if (token) {
    try {
      const params = new URLSearchParams({
        origin, destination, currency: currency.toLowerCase(),
        departure_at: depart, sorting: 'price', limit: '30', token,
      });
      if (ret) params.set('return_at', ret);
      const res = await fetch(`https://api.travelpayouts.com/aviasales/v3/prices_for_dates?${params}`, {
        next: { revalidate: 900 },
      });
      if (res.ok) {
        const json = await res.json();
        const data = (json.data || []) as Array<Record<string, unknown>>;
        const offers = data.map((d) => ({
          price: d.price as number,
          currency: (d.currency as string || currency).toUpperCase(),
          airline: (d.airline as string) || '',
          airlineName: (d.airline as string) || '',
          stops: typeof d.transfers === 'number' ? d.transfers : null,
          departDate: String(d.departure_at || depart).slice(0, 10),
          returnDate: d.return_at ? String(d.return_at).slice(0, 10) : null,
          link: `https://www.aviasales.com${d.link || ''}${marker ? `?marker=${marker}` : ''}`,
          foundDaysAgo: d.found_at ? Math.max(0, Math.round((Date.now() - Date.parse(String(d.found_at))) / 86400000)) : null,
          mock: false as const,
        }));
        return NextResponse.json({ flights: offers, mock: false });
      }
    } catch {
      // fall through to mock
    }
  }
  return NextResponse.json({
    flights: mockFlights(origin, destination, depart, ret || null, currency, marker || undefined),
    mock: true,
  });
}
