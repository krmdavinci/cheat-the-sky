// Section 10: SEO destination pages (static, JSON-LD, OpenGraph).
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DESTINATIONS, buildPlan, destinationBySlug } from '@/lib/destinations';

export function generateStaticParams() {
  return DESTINATIONS.map((d) => ({ slug: d.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const dest = destinationBySlug(params.slug);
  if (!dest) return {};
  return {
    title: `${dest.nameAr} (${dest.name}) - رحلتي`,
    description: dest.blurbAr,
    openGraph: { title: `${dest.name} | Rehlaty`, description: dest.blurb },
    alternates: { canonical: `/destinations/${dest.slug}` },
  };
}

export default function DestinationPage({ params }: { params: { slug: string } }) {
  const dest = destinationBySlug(params.slug);
  if (!dest) notFound();
  const plan = buildPlan(dest, 3, 'ar');
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: dest.name,
    description: dest.blurb,
    url: `${process.env.SITE_URL || 'https://rehlaty.example.com'}/destinations/${dest.slug}`,
  };
  return (
    <div className="min-h-screen px-4 py-10" dir="rtl" style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-sm underline" style={{ color: 'var(--muted)' }}>رحلتي ←</Link>
        <h1 className="mt-4" style={{ fontSize: 44, fontWeight: 700 }}>{dest.nameAr}</h1>
        <p className="text-lg" style={{ color: 'var(--muted)' }}>{dest.countryAr} · <bdi>{dest.iata}</bdi></p>
        <p className="mt-4 text-lg leading-relaxed">{dest.blurbAr}</p>

        <div className="mt-8 rounded-3xl bg-white/70 p-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-bold">ابحث رحلة لـ{dest.nameAr}</div>
            <div className="text-sm" style={{ color: 'var(--muted)' }}>أرخص تذاكر وفنادق + خطة يومية في بحث واحد</div>
          </div>
          <Link href={`/?lang=ar`} className="search-submit" style={{ textDecoration: 'none' }}>ابحث عن رحلة</Link>
        </div>

        <h2 className="mt-10 mb-3" style={{ fontSize: 26, fontWeight: 700 }}>خطة 3 أيام مقترحة</h2>
        <div className="space-y-3">
          {plan.map((day) => (
            <div key={day.day} className="rounded-3xl bg-white/70 p-5">
              <div className="font-bold mb-2">اليوم {day.day}</div>
              <p className="text-sm"><b>الصبح:</b> {day.morning}</p>
              <p className="text-sm"><b>الظهر:</b> {day.afternoon}</p>
              <p className="text-sm"><b>بالليل:</b> {day.evening}</p>
              <p className="text-sm" style={{ color: 'var(--harbour)' }}><b>نصيحة:</b> {day.tip}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-10 mb-3" style={{ fontSize: 26, fontWeight: 700 }}>ملاحظات عن {dest.countryAr}</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {([
            ['العملة', dest.notesAr.currency], ['اللغة', dest.notesAr.language], ['الفيش', dest.notesAr.plugs],
            ['الأمان', dest.notesAr.safety], ['العادات', dest.notesAr.customs], ['المواصلات', dest.notesAr.transport],
            ['أحسن وقت', dest.notesAr.bestSeason], ['ميزانية اليوم', dest.notesAr.dailyBudget],
          ] as const).map(([label, value]) => (
            <div key={label} className="rounded-3xl bg-white/70 p-4">
              <div className="text-sm font-semibold mb-1">{label}</div>
              <div className="text-sm" style={{ color: 'var(--sub-line-grey)' }}>{value}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-sm space-x-3" style={{ direction: 'rtl' }}>
          {dest.notesAr.officialLinks.map((l) => (
            <a key={l.url} href={l.url} target="_blank" rel="noopener" className="underline" style={{ color: 'var(--harbour)' }}>{l.label}</a>
          ))}
        </div>
        <p className="mt-3 text-xs" style={{ color: 'var(--muted)' }}>القواعد بتتغير. اتأكد من المصدر الرسمي قبل السفر.</p>
      </div>
    </div>
  );
}
