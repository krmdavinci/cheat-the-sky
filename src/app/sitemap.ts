import type { MetadataRoute } from 'next';
import { DESTINATIONS } from '@/lib/destinations';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.SITE_URL || 'https://rehlaty.example.com';
  return [
    { url: base, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/trip`, changeFrequency: 'weekly', priority: 0.7 },
    ...DESTINATIONS.map((d) => ({
      url: `${base}/destinations/${d.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
}
