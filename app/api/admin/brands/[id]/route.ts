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

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const authResult = await requireAdmin();
  if (!authResult.ok) {
    return authResult.error;
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ message: 'Marka belirtilmedi.' }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const { description, story, website, instagram, tiktok, x, linkedin, youtube, categories } = body ?? {};

  await connectToDatabase();
  const brand = await Brand.findById(id).lean();
  if (!brand) {
    return NextResponse.json({ message: 'Marka bulunamadı.' }, { status: 404 });
  }

  const updates: Record<string, any> = {};
  if (typeof description === 'string') updates.description = description.trim();
  if (typeof story === 'string') updates.story = story.trim();
  if (typeof website === 'string') updates.website = website.trim();
  if (typeof instagram === 'string') updates.instagram = instagram.trim();
  if (typeof tiktok === 'string') updates.tiktok = tiktok.trim();
  if (typeof x === 'string') updates.x = x.trim();
  if (typeof linkedin === 'string') updates.linkedin = linkedin.trim();
  if (typeof youtube === 'string') updates.youtube = youtube.trim();
  if (Array.isArray(categories)) {
    updates.categories = Array.from(new Set(categories.map((c: any) => String(c).trim()))).filter(Boolean);
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ message: 'Güncellenecek alan bulunamadı.' }, { status: 400 });
  }

  await Brand.updateOne({ _id: brand._id }, { $set: updates });
  return NextResponse.json({ success: true });
}
