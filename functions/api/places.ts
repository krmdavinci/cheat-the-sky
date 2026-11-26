import { GET } from '../../src/app/api/places/route';
import { NextRequest } from 'next/server';
export const onRequestGet = ({ request }: { request: Request }) => GET(new NextRequest(request));
