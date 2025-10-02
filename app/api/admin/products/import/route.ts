import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { extractProductFromUrl, fetchImageAsDataUrl } from '@/lib/importers';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin();
  if (!authResult.ok) {
    return authResult.error;
  }

  const body = await request.json().catch(() => ({}));
  const { url } = body ?? {};

  if (!url || typeof url !== 'string') {
    return NextResponse.json({ message: 'Geçerli bir ürün linki girin.' }, { status: 400 });
  }

  try {
    const data = await extractProductFromUrl(url);

    // Merge main + gallery, unique, cap 6
    const urlSet = new Set<string>();
    if (data.imageUrl) urlSet.add(data.imageUrl);
    if (Array.isArray(data.galleryUrls)) data.galleryUrls.forEach((g) => urlSet.add(g));
    const merged = Array.from(urlSet).slice(0, 15);

    // Fetch images as data URLs
    const galleryData: string[] = [];
    for (const g of merged) {
      const d = await fetchImageAsDataUrl(g);
      if (d) galleryData.push(d);
      else galleryData.push(g); // fallback to raw URL for preview
      if (galleryData.length >= 15) break;
    }

    // Ensure main image present
    // Prefer the first base64 item as main image; otherwise leave null
    const imageData = (galleryData.find((x) => x.startsWith('data:image/')) as string | undefined) ?? null;

    return NextResponse.json({
      data: {
        name: data.name ?? '',
        description: (data.description ?? '').slice(0, 1200),
        price: data.price ?? null,
        currency: (data.currency ?? 'TRY').toUpperCase(),
        imageData,
        galleryData,
        productUrl: url,
        imageUrlRaw: data.imageUrl ?? null,
        galleryUrlsRaw: merged
      }
    });
  } catch (e) {
    return NextResponse.json({ message: 'İçe aktarma başarısız oldu.' }, { status: 500 });
  }
}
