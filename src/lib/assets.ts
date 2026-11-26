// Section 1: assets via the Higgsfield proxy. Fallback colour if an image fails.
const PREFIX = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/';
export const proxy = (source: string, w: number) =>
  `https://images.higgs.ai/?default=1&output=webp&url=${encodeURIComponent(PREFIX + source)}&w=${w}&q=85`;

export const ASSETS = {
  gridA: 'hf_20261118_061436_77e1a13d-60a0-4746-bf7b-53b2365609f5.png',
  gridB: 'hf_20261118_061435_8a1828bc-a149-44ea-80fd-c4c33eef7407.png',
  gridC: 'hf_20261118_061433_df51e37b-d8b8-40b1-9830-01ea6c20c83d.png',
  sky: 'hf_20261118_061434_a222c9d2-715b-44b7-873f-0548d1624211.png',
  skyVideo: 'hf_20261118_065029_a6ae2ebb-cd79-41fd-ae60-6b66fdda04ee.mp4',
  camera: 'hf_20261118_061547_10365665-40d3-4390-944f-7bcb10dc6d4a.png',
  stickers: 'hf_20261118_061547_979f8673-f904-4102-90a0-6458bce33bc8.png',
};

export const gridUrl = (g: 'A' | 'B' | 'C', w = 900) => proxy(ASSETS[`grid${g}`], w);
export const skyUrl = () => proxy(ASSETS.sky, 2400);
export const skyVideoUrl = () => PREFIX + ASSETS.skyVideo;
export const cameraUrl = () => proxy(ASSETS.camera, 1400);
export const stickerUrl = (w: number) => proxy(ASSETS.stickers, w);

// Sprite cropping: background-size (100/dx)% (100/dy)%, position (x0/(1-dx))*100%.
export function spriteStyle(crop: [number, number, number, number], url: string): React.CSSProperties {
  const [x0, y0, x1, y1] = crop;
  const dx = x1 - x0, dy = y1 - y0;
  return {
    backgroundImage: `url(${url})`,
    backgroundSize: `${(100 / dx).toFixed(2)}% ${(100 / dy).toFixed(2)}%`,
    backgroundPosition: `${dx === 1 ? 0 : (x0 / (1 - dx)) * 100}% ${dy === 1 ? 0 : (y0 / (1 - dy)) * 100}%`,
    backgroundRepeat: 'no-repeat',
  };
}

export const CROPS = {
  plane: [0.594, 0.613, 0.891, 0.816] as [number, number, number, number],
  conch: [0.109, 0.121, 0.43, 0.422] as [number, number, number, number],
  pearl: [0.625, 0.152, 0.863, 0.395] as [number, number, number, number],
  capsule: [0.094, 0.656, 0.418, 0.793] as [number, number, number, number],
  camera: [0.148, 0.141, 0.879, 0.809] as [number, number, number, number],
};

// Card art: index -> [grid, col(0 left/1 right), row(0 top/1 bottom)]
export const CARD_CELLS: [string, number, number][] = [
  ['B', 1, 1], ['A', 1, 0], ['A', 0, 1], ['A', 1, 1], ['B', 0, 0], ['B', 1, 0],
  ['C', 1, 0], ['C', 0, 0], ['B', 0, 1], ['A', 0, 0], ['C', 0, 1], ['C', 1, 1],
];

export const CARD_DESTINATIONS = [
  { slug: 'istanbul', city: 'Istanbul', cityAr: 'إسطنبول', country: 'Turkey', countryAr: 'تركيا' },
  { slug: 'dubai', city: 'Dubai', cityAr: 'دبي', country: 'UAE', countryAr: 'الإمارات' },
  { slug: 'rome', city: 'Rome', cityAr: 'روما', country: 'Italy', countryAr: 'إيطاليا' },
  { slug: 'bangkok', city: 'Bangkok', cityAr: 'بانكوك', country: 'Thailand', countryAr: 'تايلاند' },
  { slug: 'paris', city: 'Paris', cityAr: 'باريس', country: 'France', countryAr: 'فرنسا' },
  { slug: 'tokyo', city: 'Tokyo', cityAr: 'طوكيو', country: 'Japan', countryAr: 'اليابان' },
  { slug: 'barcelona', city: 'Barcelona', cityAr: 'برشلونة', country: 'Spain', countryAr: 'إسبانيا' },
  { slug: 'cairo', city: 'Cairo', cityAr: 'القاهرة', country: 'Egypt', countryAr: 'مصر' },
  { slug: 'london', city: 'London', cityAr: 'لندن', country: 'UK', countryAr: 'بريطانيا' },
  { slug: 'kuala-lumpur', city: 'Kuala Lumpur', cityAr: 'كوالالمبور', country: 'Malaysia', countryAr: 'ماليزيا' },
  { slug: 'baku', city: 'Baku', cityAr: 'باكو', country: 'Azerbaijan', countryAr: 'أذربيجان' },
  { slug: 'lisbon', city: 'Lisbon', cityAr: 'لشبونة', country: 'Portugal', countryAr: 'البرتغال' },
];
