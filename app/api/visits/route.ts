import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Product } from '@/models/Product';
import { VisitEvent } from '@/models/VisitEvent';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { slug } = await request.json();
    if (!slug) {
      return NextResponse.json({ message: 'Geçerli bir ürün belirtilmedi.' }, { status: 400 });
    }

    await connectToDatabase();
    const product = await Product.findOne({ slug }).select({ _id: 1 }).lean();
    if (!product?._id) {
      return NextResponse.json({ message: 'Ürün bulunamadı.' }, { status: 404 });
    }

    await VisitEvent.create({ product: product._id });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Visit POST error', err);
    return NextResponse.json({ message: 'Ziyaret kaydedilemedi.' }, { status: 500 });
  }
}
