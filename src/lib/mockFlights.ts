// Mock flight dataset generator (used when TRAVELPAYOUTS_TOKEN is not set).
// Deterministic per route+date so results are stable between reloads.
export interface FlightOffer {
  price: number;
  currency: string;
  airline: string;
  airlineName: string;
  stops: number;
  departDate: string;
  returnDate: string | null;
  link: string;
  foundDaysAgo: number;
  mock: true;
}

const AIRLINES: [string, string][] = [
  ['PC', 'Pegasus'], ['TK', 'Turkish Airlines'], ['MS', 'EgyptAir'],
  ['EK', 'Emirates'], ['QR', 'Qatar Airways'], ['FZ', 'flydubai'],
  ['W6', 'Wizz Air'], ['FR', 'Ryanair'], ['U2', 'easyJet'], ['XY', 'flynas'],
];

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return Math.abs(h);
}

const BASE: Record<string, number> = {
  DEFAULT: 180, DXB: 220, IST: 150, CDG: 260, BKK: 420, FCO: 210, HND: 780,
  BCN: 230, LHR: 290, KUL: 480, GYD: 160, LIS: 300, MLE: 520, DPS: 540,
  CAI: 120, JED: 190, RUH: 210, DOH: 240, ATH: 170, PRG: 200, RAK: 190,
  JTR: 220, JFK: 650,
};

export function mockFlights(
  origin: string, destination: string, departDate: string,
  returnDate: string | null, currency: string, marker?: string,
): FlightOffer[] {
  const h = hash(`${origin}${destination}${departDate}`);
  const base = BASE[destination] ?? BASE.DEFAULT;
  const count = 5 + (h % 4);
  const offers: FlightOffer[] = [];
  for (let i = 0; i < count; i++) {
    const [airline, airlineName] = AIRLINES[(h + i * 3) % AIRLINES.length];
    const factor = 0.82 + (((h >> (i + 2)) % 100) / 100) * 0.9;
    const stops = (h >> (i + 6)) % 3 === 0 ? 0 : ((h >> (i + 4)) % 2) + 0 + ((h >> i) % 2);
    const price = Math.round(base * factor * (stops === 0 ? 1.25 : 1));
    const dd = new Date(departDate);
    dd.setDate(dd.getDate() + ((h >> i) % 3));
    const rd = returnDate ? new Date(returnDate) : null;
    if (rd) rd.setDate(rd.getDate() + ((h >> (i + 1)) % 2));
    const link = `https://www.aviasales.com/search/${origin}${dd.getUTCDate().toString().padStart(2, '0')}${(dd.getUTCMonth() + 1).toString().padStart(2, '0')}${destination}1${marker ? `?marker=${marker}` : ''}`;
    offers.push({
      price, currency, airline, airlineName, stops,
      departDate: dd.toISOString().slice(0, 10),
      returnDate: rd ? rd.toISOString().slice(0, 10) : null,
      link, foundDaysAgo: (h >> (i + 3)) % 5, mock: true,
    });
  }
  return offers.sort((a, b) => a.price - b.price);
}
