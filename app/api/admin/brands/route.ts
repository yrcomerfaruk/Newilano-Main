import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { connectToDatabase } from '@/lib/db';
import { Brand } from '@/models/Brand';
import { slugify } from '@/lib/slugify';
const MAX_LOGO_DATA_SIZE = 2 * 1024 * 1024; // 2MB

export async function GET() {
  await connectToDatabase();
  const brands = await Brand.find().sort({ name: 1 }).lean();
  return NextResponse.json({ brands });
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin();
  if (!authResult.ok) {
    return authResult.error;
  }

  const body = await request.json();
  const { name, description, logoData, categories } = body ?? {};

  if (!name || typeof name !== 'string') {
    return NextResponse.json({ message: 'Marka adı gereklidir.' }, { status: 400 });
  }

  await connectToDatabase();

  const slug = slugify(name);

  const existing = await Brand.findOne({ slug }).lean();
  if (existing) {
    return NextResponse.json({ message: 'Bu marka zaten mevcut.' }, { status: 409 });
  }

  if (typeof logoData !== 'string' || !logoData.startsWith('data:image/')) {
    return NextResponse.json({ message: 'Lütfen geçerli bir logo dosyası yükleyin.' }, { status: 400 });
  }

  if (logoData.length > MAX_LOGO_DATA_SIZE * 1.4) {
    return NextResponse.json({ message: 'Logo boyutu 2MB sınırını aşıyor.' }, { status: 413 });
  }

  const brand = await Brand.create({
    name,
    slug,
    description,
    logo: logoData,
    categories: Array.isArray(categories) ? categories : []
  });

  return NextResponse.json({ brand }, { status: 201 });
}
