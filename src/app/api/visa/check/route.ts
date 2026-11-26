// Addendum A3: GET /api/visa/check?passport=EG&destination=TR
// Full detail: rules, exceptions, passport validity, mandatory forms, links.
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
  return rec.n > 60;
}

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'anon';
  if (rateLimited(ip)) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  const sp = req.nextUrl.searchParams;
  const passport = (sp.get('passport') || '').toUpperCase();
  const destination = (sp.get('destination') || '').toUpperCase();
  if (!ISO2.test(passport) || !ISO2.test(destination)) {
    return NextResponse.json({ error: 'invalid_params' }, { status: 400 });
  }

  const apiKey = process.env.VISA_API_KEY;
  const apiHost = process.env.VISA_API_HOST || 'visa-requirement.p.rapidapi.com';
  if (apiKey && process.env.VISA_DATA_MODE !== 'snapshot') {
    try {
      const res = await fetch(`https://${apiHost}/v2/visa/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-RapidAPI-Proxy-Secret': apiKey },
        body: JSON.stringify({ passport, destination }),
        next: { revalidate: 86400 },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.error !== true && json.data) {
          const d = json.data;
          const vr = d.visa_rules || {};
          const primary = vr.primary_rule || null;
          return NextResponse.json({
            passport, destination,
            primaryRule: primary ? { name: primary.name, duration: primary.duration || null, category: categorizeRule(primary.name, parseDays(primary.duration)) } : null,
            secondaryRule: vr.secondary_rule ? { name: vr.secondary_rule.name, duration: vr.secondary_rule.duration || null, category: categorizeRule(vr.secondary_rule.name, parseDays(vr.secondary_rule.duration)) } : null,
            exceptions: (vr.exception_rules || []).map((e: Record<string, unknown>) => ({
              number: e.number, name: e.name, duration: e.duration || null,
              condition: e.exception_type_name || null, note: e.note || null, link: e.link || null,
            })),
            mandatoryRegistrations: d.mandatory_registrations || (d.mandatory_registration ? [d.mandatory_registration] : []),
            passportValidity: d.destination?.passport_validity || null,
            embassyUrl: d.destination?.embassy_url || null,
            destinationInfo: d.destination ? {
              capital: d.destination.capital, currency: d.destination.currency,
              currencyCode: d.destination.currency_code, phoneCode: d.destination.phone_code,
              timezone: d.destination.timezone,
            } : null,
            source: 'travel-buddy', fetchedAt: new Date().toISOString(), stale: false,
          });
        }
      }
    } catch {
      // fall through to snapshot
    }
  }

  const table = (snapshot as { passports: Record<string, Record<string, string>> }).passports[passport];
  const req0 = table?.[destination];
  if (!req0) return NextResponse.json({ error: 'no_data' }, { status: 404 });
  const c = categorizeSnapshot(req0);
  return NextResponse.json({
    passport, destination,
    primaryRule: { name: /^\d+$/.test(req0) ? 'visa free' : req0, duration: c.days ? `${c.days} days` : null, category: c.category },
    secondaryRule: null, exceptions: [], mandatoryRegistrations: [],
    passportValidity: null, embassyUrl: null, destinationInfo: null,
    source: 'passport-index (snapshot)',
    fetchedAt: (snapshot as { updatedAt: string }).updatedAt, stale: true,
  });
}
