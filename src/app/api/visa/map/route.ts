// Addendum A3: GET /api/visa/map?passport=EG
// Validates against an ISO alpha-2 allowlist, calls the vendor once, normalises.
// Cache: 24h per passport. Snapshot fallback marked with its date.
import { NextRequest, NextResponse } from 'next/server';
import { categorizeRule, categorizeSnapshot, parseDays } from '@/lib/visaCategories';
import snapshot from '@/lib/visa-snapshot.json';

export const runtime = 'edge';

const ISO2 = /^[A-Z]{2}$/;
const hits = new Map<string, { n: number; t: number }>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const rec = hits.get(ip);
  if (!rec || now - rec.t > 60_000) { hits.set(ip, { n: 1, t: now }); return false; }
  rec.n++;
  return rec.n > 30;
}

interface MapEntry { code: string; category: string; label: string; days: number | null }

function fromSnapshot(passport: string): { entries: MapEntry[]; updatedAt: string } | null {
  const table = (snapshot as { passports: Record<string, Record<string, string>> }).passports[passport];
  if (!table) return null;
  const entries = Object.entries(table).map(([code, req]) => {
    const c = categorizeSnapshot(req);
    return { code, category: c.category, label: req, days: c.days };
  });
  return { entries, updatedAt: (snapshot as { updatedAt: string }).updatedAt };
}

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'anon';
  if (rateLimited(ip)) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  const passport = (req.nextUrl.searchParams.get('passport') || '').toUpperCase();
  if (!ISO2.test(passport)) return NextResponse.json({ error: 'invalid_passport' }, { status: 400 });

  const apiKey = process.env.VISA_API_KEY;
  const apiHost = process.env.VISA_API_HOST || 'visa-requirement.p.rapidapi.com';
  if (apiKey && process.env.VISA_DATA_MODE !== 'snapshot') {
    try {
      const res = await fetch(`https://${apiHost}/v2/visa/map`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-RapidAPI-Proxy-Secret': apiKey },
        body: JSON.stringify({ passport }),
        // 24h edge cache per passport (protects the free quota)
        next: { revalidate: 86400 },
      });
      if (res.ok) {
        const json = await res.json();
        const data = json.data || {};
        // Vendor returns destinations grouped by color/category; tolerate both shapes.
        const entries: MapEntry[] = [];
        const push = (code: string, name: string, duration?: string | null) => {
          entries.push({
            code: code.toUpperCase(),
            category: categorizeRule(name, parseDays(duration)),
            label: name || 'unknown',
            days: parseDays(duration),
          });
        };
        if (Array.isArray(data.destinations)) {
          for (const d of data.destinations) push(d.code || d.country || '', d.rule || d.name, d.duration);
        } else if (data.colors && typeof data.colors === 'object') {
          for (const [color, list] of Object.entries(data.colors as Record<string, Array<{ code: string; name?: string; duration?: string }>>)) {
            for (const d of list || []) push(d.code, d.name || color, d.duration);
          }
        }
        if (entries.length) {
          return NextResponse.json({
            passport, entries, source: 'travel-buddy', fetchedAt: new Date().toISOString(), stale: false,
          });
        }
      }
    } catch {
      // fall through to snapshot
    }
    const snap = fromSnapshot(passport);
    if (snap) {
      return NextResponse.json({
        passport, entries: snap.entries, source: 'passport-index (snapshot)',
        fetchedAt: snap.updatedAt, stale: true,
      });
    }
    return NextResponse.json({ error: 'upstream_failed' }, { status: 502 });
  }

  const snap = fromSnapshot(passport);
  if (!snap) return NextResponse.json({ error: 'no_data' }, { status: 404 });
  return NextResponse.json({
    passport, entries: snap.entries, source: 'passport-index (snapshot)',
    fetchedAt: snap.updatedAt, stale: true,
  });
}
