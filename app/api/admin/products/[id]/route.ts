import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { connectToDatabase } from '@/lib/db';
import { Product } from '@/models/Product';
import { Brand } from '@/models/Brand';
import { recordAdminAudit } from '@/lib/audit';

const MAX_IMAGE_DATA_SIZE = 4 * 1024 * 1024;

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

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const authResult = await requireAdmin();
  if (!authResult.ok) {
    return authResult.error;
  }
  const { session } = authResult;
  const user = session!.user!;

  const { id } = params;
  if (!id) {
    return NextResponse.json({ message: 'Ürün belirtilmedi.' }, { status: 400 });
  }

  await connectToDatabase();

  const product = await Product.findById(id).lean();
  if (!product) {
    return NextResponse.json({ message: 'Ürün bulunamadı.' }, { status: 404 });
  }

  await Product.deleteOne({ _id: product._id });

  void recordAdminAudit(
    {
      actorId: String(user.id ?? user.email),
      actorEmail: String(user.email ?? ''),
      action: 'product_delete',
      resource: product._id.toString(),
      method: 'DELETE',
      status: 200,
      metadata: { slug: product.slug }
    }
  );

  return NextResponse.json({ success: true });
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await requireAdmin();
  if (!authResult.ok) {
    return authResult.error;
  }
  const { session } = authResult;
  const user = session!.user!;

  const { id } = params;
  if (!id) {
    return NextResponse.json({ message: 'Ürün belirtilmedi.' }, { status: 400 });
  }

  const body = await request.json();
  const {
    name,
    brandId,
    gender,
    category,
    price,
    currency,
    imageData,
    description,
    galleryData,
    sizes,
    colors,
    features,
    productUrl,
    tags
  } = body ?? {};

  await connectToDatabase();

  const product = await Product.findById(id).lean();
  if (!product) {
    return NextResponse.json({ message: 'Ürün bulunamadı.' }, { status: 404 });
  }

  const update: Record<string, unknown> = {};

  if (typeof name === 'string' && name.trim()) update.name = name.trim();
  if (typeof category === 'string' && category.trim()) update.category = category.trim();
  if (typeof description === 'string' && description.trim()) update.description = description.trim();

  if (typeof gender === 'string' && ['ERKEK', 'KADIN', 'UNISEX'].includes(gender)) {
    update.gender = gender;
  }

  if (typeof price === 'number' && Number.isFinite(price) && price > 0) update.price = price;
  if (typeof currency === 'string' && currency.trim()) update.currency = currency.trim().toUpperCase();

  if (Array.isArray(sizes)) update.sizes = sizes;
  if (Array.isArray(colors)) update.colors = colors;
  if (Array.isArray(features)) update.features = features;
  if (Array.isArray(galleryData)) update.gallery = galleryData;
  if (Array.isArray(tags)) update.tags = tags;

  if (typeof imageData === 'string') {
    if (imageData.startsWith('data:image/')) {
      if (imageData.length > MAX_IMAGE_DATA_SIZE * 1.4) {
        return NextResponse.json({ message: 'Görsel boyutu 4MB sınırını aşıyor.' }, { status: 413 });
      }
      update.image = imageData;
    }
  }

  if (productUrl !== undefined) {
    const normalizedProductUrlResult = normalizeProductUrlInput(productUrl);
    if (!normalizedProductUrlResult.ok) {
      return NextResponse.json({ message: normalizedProductUrlResult.error }, { status: 400 });
    }
    update.productUrl = normalizedProductUrlResult.value || '';
  }

  if (typeof brandId === 'string' && brandId) {
    const brand = await Brand.findById(brandId).lean();
    if (!brand) {
      return NextResponse.json({ message: 'Marka bulunamadı.' }, { status: 404 });
    }
    update.brand = brand._id;
    update.brandName = brand.name;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ message: 'Güncellenecek veri bulunmadı.' }, { status: 400 });
  }

  await Product.updateOne({ _id: product._id }, { $set: update });

  const updated = await Product.findById(id).lean();
  void recordAdminAudit(
    {
      actorId: String(user.id ?? user.email),
      actorEmail: String(user.email ?? ''),
      action: 'product_update',
      resource: product._id.toString(),
      method: request.method,
      status: 200,
      metadata: { fields: Object.keys(update) }
    },
    request.headers
  );

  return NextResponse.json({ product: updated });
}
