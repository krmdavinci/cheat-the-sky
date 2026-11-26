export class NextRequest extends Request {
  nextUrl: URL;
  constructor(input: Request) { super(input); this.nextUrl = new URL(input.url); }
}
export const NextResponse = {
  json(body: unknown, init?: ResponseInit) {
    const h = new Headers(init?.headers);
    if (!h.has('content-type')) h.set('content-type', 'application/json');
    return new Response(JSON.stringify(body), { ...init, headers: h });
  },
};
