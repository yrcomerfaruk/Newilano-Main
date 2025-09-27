import { NextRequest, NextResponse } from 'next/server';
import { searchProducts } from '@/lib/data';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q') ?? '';
  const results = await searchProducts(query, 12);
  return NextResponse.json({ results });
}
