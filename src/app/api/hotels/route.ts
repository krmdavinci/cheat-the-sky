// Section 9.3: /api/hotels - affiliate deep links (Booking.com / Agoda) with dates pre-filled.
// No invented hotel prices in live mode. Mock mode adds sample prices with the sample badge.
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const city = sp.get('city') || '';
  const checkin = sp.get('checkin') || '';
  const checkout = sp.get('checkout') || '';
  if (!city || !/^\d{4}-\d{2}-\d{2}$/.test(checkin) || !/^\d{4}-\d{2}-\d{2}$/.test(checkout)) {
    return NextResponse.json({ error: 'invalid_params' }, { status: 400 });
  }
  const nights = Math.max(1, Math.round((Date.parse(checkout) - Date.parse(checkin)) / 86400000));
  const aid = process.env.HOTEL_AFFILIATE_ID || '';
  const providers = [
    {
      provider: 'Booking.com',
      url: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(city)}&checkin=${checkin}&checkout=${checkout}${aid ? `&aid=${aid}` : ''}`,
    },
    {
      provider: 'Agoda',
      url: `https://www.agoda.com/search?city=${encodeURIComponent(city)}&checkIn=${checkin}&checkOut=${checkout}`,
    },
  ];
  return NextResponse.json({ providers, nights, city, checkin, checkout });
}
