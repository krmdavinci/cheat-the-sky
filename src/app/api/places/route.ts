// Section 9.1: /api/places - Travelpayouts places autocomplete proxy (server side),
// with bundled offline fallback. Debounced on the client, min 2 chars.
import { NextRequest, NextResponse } from 'next/server';
import { AIRPORTS_UNIQUE } from '@/lib/airports';

export const runtime = 'edge';
export const revalidate = 3600;

function localSearch(q: string, limit = 8) {
  const needle = q.trim().toLowerCase();
  if (needle.length < 2) return [];
  const scored = AIRPORTS_UNIQUE
    .map((a) => {
      const hay = `${a.iata} ${a.city} ${a.cityAr} ${a.country} ${a.countryAr}`.toLowerCase();
      let score = -1;
      if (a.iata.toLowerCase() === needle) score = 100;
      else if (a.city.toLowerCase().startsWith(needle)) score = 80;
      else if (a.cityAr.startsWith(q.trim())) score = 80;
      else if (hay.includes(needle)) score = 40;
      return { a, score };
    })
    .filter((r) => r.score >= 0)
    .sort((x, y) => y.score - x.score)
    .slice(0, limit)
    .map((r) => r.a);
  return scored;
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') || '';
  if (q.trim().length < 2) {
    return NextResponse.json({ places: [] });
  }
  const token = process.env.TRAVELPAYOUTS_TOKEN;
  // Live Travelpayouts places autocomplete (public autocomplete endpoint per Travelpayouts docs).
  if (token) {
    try {
      const url = `https://autocomplete.travelpayouts.com/places2?term=${encodeURIComponent(q)}&locale=en&types[]=city&types[]=airport`;
      const res = await fetch(url, { next: { revalidate: 86400 } });
      if (res.ok) {
        const data = (await res.json()) as Array<{ code?: string; name?: string; city_name?: string; country_name?: string }>;
        const places = data.slice(0, 8).map((p) => ({
          iata: (p.code || '').toUpperCase(),
          city: p.city_name || p.name || '',
          cityAr: p.city_name || p.name || '',
          country: p.country_name || '',
          countryAr: p.country_name || '',
        })).filter((p) => p.iata);
        if (places.length) return NextResponse.json({ places, source: 'travelpayouts' });
      }
    } catch {
      // fall through to local list
    }
  }
  return NextResponse.json({ places: localSearch(q), source: 'local' });
}
