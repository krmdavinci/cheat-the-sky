// Section 9.4: /api/guide - trip plan and country notes.
// Input is only a destination from the allowlist (slug) + day count 1-14.
// Never passes free user text into the LLM prompt. Strict JSON schema, one retry, static fallback.
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { DESTINATIONS, buildPlan, destinationBySlug, destinationByIata } from '@/lib/destinations';

export const runtime = 'edge';

const GuideSchema = z.object({
  plan: z.array(z.object({
    day: z.number(),
    morning: z.string(),
    afternoon: z.string(),
    evening: z.string(),
    tip: z.string(),
  })).max(14),
  notes: z.object({
    currency: z.string(),
    language: z.string(),
    plugs: z.string(),
    safety: z.string(),
    customs: z.string(),
    transport: z.string(),
    best_season: z.string(),
    daily_budget_range: z.string(),
    official_links: z.array(z.object({ label: z.string(), url: z.string() })),
  }),
});

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const slug = (sp.get('destination') || '').toLowerCase();
  const iata = (sp.get('iata') || '').toUpperCase();
  const days = Math.min(14, Math.max(1, parseInt(sp.get('days') || '3', 10) || 3));
  const lang = sp.get('lang') === 'en' ? 'en' : 'ar';

  const dest = destinationBySlug(slug) || destinationByIata(iata);
  if (!dest) return NextResponse.json({ error: 'unknown_destination' }, { status: 400 });

  const key = process.env.LLM_API_KEY;
  if (key && process.env.LLM_PROVIDER !== 'none') {
    try {
      const prompt = [
        `Write a ${days}-day tourist trip plan for ${dest.name}, ${dest.country}.`,
        `Return ONLY JSON matching this schema: {"plan":[{"day":number,"morning":string,"afternoon":string,"evening":string,"tip":string}],"notes":{"currency":string,"language":string,"plugs":string,"safety":string,"customs":string,"transport":string,"best_season":string,"daily_budget_range":string,"official_links":[{"label":string,"url":string}]}}.`,
        `Language: ${lang === 'ar' ? 'Egyptian Arabic' : 'English'}. Tourism purpose only. Do not include visa rules; point to the official source for entry rules.`,
      ].join(' ');
      for (let attempt = 0; attempt < 2; attempt++) {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            response_format: { type: 'json_object' },
            messages: [
              { role: 'system', content: 'You output strict JSON only.' },
              { role: 'user', content: prompt },
            ],
          }),
        });
        if (!res.ok) break;
        const json = await res.json();
        const text = json.choices?.[0]?.message?.content || '';
        try {
          const parsed = GuideSchema.parse(JSON.parse(text));
          return NextResponse.json({ guide: parsed, destination: dest.slug, ai: true });
        } catch {
          // retry once with the same prompt, then fall back
        }
      }
    } catch {
      // fall through to static
    }
  }
  const notes = lang === 'ar' ? dest.notesAr : dest.notes;
  return NextResponse.json({
    guide: {
      plan: buildPlan(dest, days, lang),
      notes: {
        currency: notes.currency, language: notes.language, plugs: notes.plugs,
        safety: notes.safety, customs: notes.customs, transport: notes.transport,
        best_season: notes.bestSeason, daily_budget_range: notes.dailyBudget,
        official_links: notes.officialLinks,
      },
    },
    destination: dest.slug,
    ai: false,
  });
}
