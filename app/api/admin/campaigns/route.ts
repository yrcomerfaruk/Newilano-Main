import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { connectToDatabase } from '@/lib/db';
import { CampaignModel } from '@/models/Campaign';
import { slugify } from '@/lib/slugify';

const MAX_IMAGE_DATA_SIZE = 4 * 1024 * 1024; // 4MB

export async function GET() {
  await connectToDatabase();
  const campaigns = await CampaignModel.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({ campaigns });
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin();
  if (!authResult.ok) {
    return authResult.error;
  }

  const body = await request.json();
  const { title, description, imageData, ctaLabel, ctaHref } = body ?? {};

  if (!title || typeof title !== 'string') {
    return NextResponse.json({ message: 'Kampanya başlığı gereklidir.' }, { status: 400 });
  }

  if (!description || typeof description !== 'string') {
    return NextResponse.json({ message: 'Kampanya açıklaması gereklidir.' }, { status: 400 });
  }

  await connectToDatabase();

  const slug = slugify(title);
  const existing = await CampaignModel.findOne({ slug }).lean();
  if (existing) {
    return NextResponse.json({ message: 'Bu kampanya zaten mevcut.' }, { status: 409 });
  }

  if (typeof imageData !== 'string' || !imageData.startsWith('data:image/')) {
    return NextResponse.json({ message: 'Lütfen bir kampanya görseli yükleyin.' }, { status: 400 });
  }

  if (imageData.length > MAX_IMAGE_DATA_SIZE * 1.4) {
    return NextResponse.json({ message: 'Görsel boyutu 4MB sınırını aşıyor.' }, { status: 413 });
  }

  const campaign = await CampaignModel.create({
    title,
    slug,
    description,
    image: imageData,
    ctaLabel,
    ctaHref
  });

  return NextResponse.json({ campaign }, { status: 201 });
}
