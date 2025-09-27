import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { connectToDatabase } from '@/lib/db';
import { Brand } from '@/models/Brand';
import { Product } from '@/models/Product';

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const authResult = await requireAdmin();
  if (!authResult.ok) {
    return authResult.error;
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ message: 'Marka belirtilmedi.' }, { status: 400 });
  }

  await connectToDatabase();

  const brand = await Brand.findById(id).lean();
  if (!brand) {
    return NextResponse.json({ message: 'Marka bulunamadı.' }, { status: 404 });
  }

  const linkedProduct = await Product.exists({ brand: brand._id });
  if (linkedProduct) {
    return NextResponse.json(
      { message: 'Bu markaya bağlı ürünler var. Lütfen önce ürünleri güncelleyin veya silin.' },
      { status: 409 }
    );
  }

  await Brand.deleteOne({ _id: brand._id });

  return NextResponse.json({ success: true });
}
