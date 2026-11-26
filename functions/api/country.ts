// /api/country?code=EG&lang=en  -> Wikipedia overview + tourism summary (matches the live site's response shape).
const UA = { 'User-Agent': 'CheatTheSky/1.0 (https://davinci-sky.netlify.app)', Accept: 'application/json' };
const LANGS = ['en', 'ar', 'tr', 'fr', 'es', 'ru', 'de'];
const hits = new Map<string, { n: number; t: number }>();
function limited(ip: string) {
  const now = Date.now(); const r = hits.get(ip);
  if (!r || now - r.t > 60_000) { hits.set(ip, { n: 1, t: now }); return false; }
  r.n++; return r.n > 60;
}
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-cache' } });

async function summary(lang: string, title: string) {
  try {
    const r = await fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}?redirect=true`, { headers: UA, cf: { cacheTtl: 86400, cacheEverything: true } } as RequestInit);
    if (!r.ok) return null;
    const j: any = await r.json();
    if (!j.extract || j.type === 'disambiguation') return null;
    return { text: j.extract as string, url: (j.content_urls?.desktop?.page as string) || `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title)}`, lang };
  } catch { return null; }
}
async function localTitle(title: string, lang: string): Promise<string | null> {
  try {
    const r = await fetch(`https://en.wikipedia.org/w/api.php?action=query&prop=langlinks&titles=${encodeURIComponent(title)}&lllang=${lang}&format=json&redirects=1&origin=*`, { headers: UA, cf: { cacheTtl: 86400, cacheEverything: true } } as RequestInit);
    const j: any = await r.json();
    const p: any = Object.values(j?.query?.pages || {})[0];
    return p?.langlinks?.[0]?.['*'] || null;
  } catch { return null; }
}

export const onRequestGet = async ({ request }: { request: Request }) => {
  const ip = request.headers.get('cf-connecting-ip') || 'anon';
  if (limited(ip)) return json({ error: 'rate_limited' }, 429);
  const sp = new URL(request.url).searchParams;
  const code = (sp.get('code') || '').toUpperCase();
  let lang = (sp.get('lang') || 'en').toLowerCase();
  if (!/^[A-Z]{2}$/.test(code)) return json({ error: 'invalid_code' }, 400);
  if (!LANGS.includes(lang)) lang = 'en';
  let name: string | undefined;
  try { name = new Intl.DisplayNames(['en'], { type: 'region' }).of(code); } catch {}
  if (!name || name === code) return json({ error: 'unknown_country' }, 404);

  const overviewEn = await summary('en', name);
  const tourismTitle = `Tourism in ${name.replace(/^The /, '')}`;
  const tourismEn = await summary('en', tourismTitle);
  let overview = overviewEn, tourism = tourismEn;
  if (lang !== 'en') {
    const [lo, lt] = await Promise.all([localTitle(name, lang), localTitle(tourismTitle, lang)]);
    const [o, t] = await Promise.all([lo ? summary(lang, lo) : null, lt ? summary(lang, lt) : null]);
    overview = o || overviewEn; tourism = t || tourismEn;
  }
  if (!overview && !tourism) return json({ error: 'not_found' }, 404);
  return json({ code, lang, overview, overviewEn, tourism, source: 'Wikipedia' });
};
