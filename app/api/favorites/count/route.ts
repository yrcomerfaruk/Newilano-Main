import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Product } from '@/models/Product';
import { FavoriteEvent } from '@/models/FavoriteEvent';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const slug = request.nextUrl.searchParams.get('slug');
    if (!slug) {
      return NextResponse.json({ message: 'Geçerli bir ürün belirtilmedi.' }, { status: 400 });
    }

    await connectToDatabase();
    const product = await Product.findOne({ slug }).select({ _id: 1 }).lean();
    if (!product?._id) {
      return NextResponse.json({ message: 'Ürün bulunamadı.' }, { status: 404 });
    }

    const result = await FavoriteEvent.aggregate([
      { $match: { product: product._id } },
      { $group: { _id: '$user' } },
      { $count: 'count' }
    ]);

    const count = result?.[0]?.count ?? 0;
    return NextResponse.json({ slug, count });
  } catch (err) {
    console.error('Favorites count error', err);
    return NextResponse.json({ message: 'Beğeni sayısı alınamadı.' }, { status: 500 });
  }
}
