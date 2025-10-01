import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { connectToDatabase } from '@/lib/db';
import { HeroSlideModel } from '@/models/HeroSlide';
import { slugify } from '@/lib/slugify';

const MAX_IMAGE_DATA_SIZE = 4 * 1024 * 1024; // 4MB

export async function GET() {
  await connectToDatabase();
  const slides = await HeroSlideModel.find().sort({ order: 1, createdAt: -1 }).lean();
  return NextResponse.json({ slides });
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin();
  if (!authResult.ok) {
    return authResult.error;
  }

  const body = await request.json();
  const { title, subtitle, ctaLabel, ctaHref, imageData, order, mobileImageData } = body ?? {};

  if (!title || typeof title !== 'string') {
    return NextResponse.json({ message: 'Başlık gereklidir.' }, { status: 400 });
  }

  if (!subtitle || typeof subtitle !== 'string') {
    return NextResponse.json({ message: 'Alt başlık gereklidir.' }, { status: 400 });
  }

  if (!ctaLabel || typeof ctaLabel !== 'string') {
    return NextResponse.json({ message: 'CTA metni gereklidir.' }, { status: 400 });
  }

  if (!ctaHref || typeof ctaHref !== 'string') {
    return NextResponse.json({ message: 'CTA bağlantısı gereklidir.' }, { status: 400 });
  }

  if (typeof imageData !== 'string' || !imageData.startsWith('data:image/')) {
    return NextResponse.json({ message: 'Lütfen bir hero görseli yükleyin.' }, { status: 400 });
  }

  if (imageData.length > MAX_IMAGE_DATA_SIZE * 1.4) {
    return NextResponse.json({ message: 'Görsel boyutu 4MB sınırını aşıyor.' }, { status: 413 });
  }

  const variants: { mobileImage?: string } = {};
  if (typeof mobileImageData === 'string' && mobileImageData.startsWith('data:image/')) {
    if (mobileImageData.length > MAX_IMAGE_DATA_SIZE * 1.4) {
      return NextResponse.json({ message: 'Mobil görsel boyutu 4MB sınırını aşıyor.' }, { status: 413 });
    }
    variants.mobileImage = mobileImageData;
  }

  await connectToDatabase();

  const slug = slugify(title);
  const existing = await HeroSlideModel.findOne({ slug }).lean();
  if (existing) {
    return NextResponse.json({ message: 'Bu başlıkla bir hero görseli zaten var.' }, { status: 409 });
  }

  const slide = await HeroSlideModel.create({
    title,
    slug,
    subtitle,
    ctaLabel,
    ctaHref,
    image: imageData,
    ...variants,
    order: typeof order === 'number' ? order : 0
  });

  return NextResponse.json({ slide }, { status: 201 });
}
