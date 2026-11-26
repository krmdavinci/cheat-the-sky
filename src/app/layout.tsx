import type { Metadata, Viewport } from 'next';
import { Inter, Cairo } from 'next/font/google';
import './globals.css';
import { LangProvider } from '@/components/LangProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const cairo = Cairo({ subsets: ['arabic', 'latin'], variable: '--font-cairo', display: 'swap' });

const SITE_URL = process.env.SITE_URL || 'https://rehlaty.example.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Rehlaty | رحلتي - سافر أبعد، وادفع أقل', template: '%s | Rehlaty' },
  description: 'Cheapest flights and hotels we found, a day plan and country notes, in one search. أرخص تذاكر وفنادق، وخطة يومية وملاحظات عن البلد، في بحث واحد.',
  openGraph: {
    title: 'Rehlaty | رحلتي',
    description: 'Go far. Pay less. سافر أبعد. وادفع أقل.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#F1ECEA',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${inter.variable} ${cairo.variable}`}>
      <body>
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
