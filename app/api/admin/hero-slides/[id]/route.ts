import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { connectToDatabase } from '@/lib/db';
import { HeroSlideModel } from '@/models/HeroSlide';

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const authResult = await requireAdmin();
  if (!authResult.ok) {
    return authResult.error;
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ message: 'Hero kaydı belirtilmedi.' }, { status: 400 });
  }

  await connectToDatabase();

  const slide = await HeroSlideModel.findById(id).lean();
  if (!slide) {
    return NextResponse.json({ message: 'Hero kaydı bulunamadı.' }, { status: 404 });
  }

  await HeroSlideModel.deleteOne({ _id: slide._id });

  return NextResponse.json({ success: true });
}
