import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { connectToDatabase } from '@/lib/db';
import { Product } from '@/models/Product';
import { Brand } from '@/models/Brand';
import { slugify } from '@/lib/slugify';
import { recordAdminAudit } from '@/lib/audit';

const MAX_IMAGE_DATA_SIZE = 4 * 1024 * 1024; // 4MB

type NormalizeResult = { ok: true; value: string } | { ok: false; error: string };

function normalizeProductUrlInput(input: unknown): NormalizeResult {
  if (input === undefined || input === null) {
    return { ok: true, value: '' };
  }

  if (typeof input !== 'string') {
    return { ok: false, error: 'Geçerli bir ürün linki girin.' };
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: true, value: '' };
  }

  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('/')) {
    return { ok: true, value: trimmed };
  }

  return { ok: true, value: `https://${trimmed}` };
}

export async function GET() {
  await connectToDatabase();
  const products = await Product.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({ products });
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin();
  if (!authResult.ok) {
    return authResult.error;
  }
  const { session } = authResult;
  const user = session!.user!;

  const body = await request.json();
  const {
    name,
    brandId,
    gender,
    category,
    price,
    currency = 'TRY',
    imageData,
    description,
    galleryData = [],
    sizes = [],
    colors = [],
    features = [],
    productUrl,
    tags = [],
    discoverTags = []
  } = body ?? {};

  if (!name || typeof name !== 'string') {
    return NextResponse.json({ message: 'Ürün adı gereklidir.' }, { status: 400 });
  }

  if (!brandId || typeof brandId !== 'string') {
    return NextResponse.json({ message: 'Geçerli bir marka seçmelisiniz.' }, { status: 400 });
  }

  if (!category || typeof category !== 'string') {
    return NextResponse.json({ message: 'Kategori gereklidir.' }, { status: 400 });
  }

  if (typeof price !== 'number' || Number.isNaN(price) || price <= 0) {
    return NextResponse.json({ message: 'Geçerli bir fiyat girin.' }, { status: 400 });
  }

  if (typeof imageData !== 'string' || !imageData.startsWith('data:image/')) {
    return NextResponse.json({ message: 'Lütfen bir ürün görseli yükleyin.' }, { status: 400 });
  }

  if (imageData.length > MAX_IMAGE_DATA_SIZE * 1.4) {
    return NextResponse.json({ message: 'Görsel boyutu 4MB sınırını aşıyor.' }, { status: 413 });
  }

  if (!description || typeof description !== 'string') {
    return NextResponse.json({ message: 'Ürün açıklaması gereklidir.' }, { status: 400 });
  }

  const normalizedProductUrlResult = normalizeProductUrlInput(productUrl);
  if (!normalizedProductUrlResult.ok) {
    return NextResponse.json({ message: normalizedProductUrlResult.error }, { status: 400 });
  }
  const normalizedProductUrl = normalizedProductUrlResult.value || undefined;

  await connectToDatabase();

  const normalizedCurrency = String(currency).toUpperCase();

  const brand = await Brand.findById(brandId).lean();
  if (!brand) {
    return NextResponse.json({ message: 'Marka bulunamadı.' }, { status: 404 });
  }

  let baseSlug = slugify(name);
  let slug = baseSlug;
  // ensure uniqueness by incrementing suffix
  let counter = 2;
  // Using exists for performance
  while (await Product.exists({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
    if (counter > 200) {
      return NextResponse.json({ message: 'Benzersiz slug üretilemedi.' }, { status: 500 });
    }
  }

  const galleryList = (Array.isArray(galleryData) ? galleryData : []).slice(0, 15);

  let product;
  try {
    product = await Product.create({
      name,
      slug,
      brand: brand._id,
      brandName: brand.name,
      gender,
      category,
      price,
      currency: normalizedCurrency,
      image: imageData,
      description: description?.slice(0, 1200) ?? '',
      gallery: galleryList,
      sizes,
      colors,
      features,
      productUrl: normalizedProductUrl,
      tags,
      discoverTags: Array.isArray(discoverTags) ? discoverTags : []
    });
  } catch (err: any) {
    const message = err?.message || 'Ürün oluşturulamadı.';
    return NextResponse.json({ message }, { status: 400 });
  }

  void recordAdminAudit(
    {
      actorId: String(user.id ?? user.email),
      actorEmail: String(user.email ?? ''),
      action: 'product_create',
      resource: product._id.toString(),
      method: request.method,
      status: 201,
      metadata: {
        slug,
        brandId,
        category,
        tags,
        discoverTags
      }
    },
    request.headers
  );

  return NextResponse.json({ product }, { status: 201 });
}
