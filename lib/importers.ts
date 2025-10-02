import { NextResponse } from 'next/server';

// Lightweight HTML meta extraction without cheerio
function getMeta(content: string, property: string): string | undefined {
  const re = new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i');
  const m = content.match(re);
  return m?.[1];
}

function getNameMeta(content: string, name: string): string | undefined {
  const re = new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i');
  const m = content.match(re);
  return m?.[1];
}

function firstJsonLdProduct(content: string): any | null {
  const scripts = Array.from(content.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi));
  for (const s of scripts) {
    const raw = s[1];
    try {
      const json = JSON.parse(raw);
      // Could be an array or single object
      const cand = Array.isArray(json) ? json : [json];
      for (const item of cand) {
        if (item && (item['@type'] === 'Product' || (Array.isArray(item['@type']) && item['@type'].includes('Product')))) {
          return item;
        }
        if (item && item['@graph'] && Array.isArray(item['@graph'])) {
          const found = item['@graph'].find((n: any) => n['@type'] === 'Product' || (Array.isArray(n['@type']) && n['@type'].includes('Product')));
          if (found) return found;
        }
      }
    } catch {
      // ignore
    }
  }
  return null;
}

export type ExtractedProduct = {
  name?: string;
  description?: string;
  price?: number;
  currency?: string;
  imageUrl?: string;
  galleryUrls?: string[];
};

function resolveUrlMaybe(src: string, baseUrl: string): string {
  try {
    return new URL(src, baseUrl).toString();
  } catch {
    return src;
  }
}

function getMetaAll(content: string, property: string): string[] {
  const re = new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'gi');
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    if (m[1]) out.push(m[1]);
  }
  return out;
}

export async function extractProductFromUrl(url: string): Promise<ExtractedProduct> {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Sayfa alınamadı.');
  }
  const html = await res.text();

  const out: ExtractedProduct = {};

  // Try JSON-LD Product first
  const ld = firstJsonLdProduct(html);
  if (ld) {
    out.name = ld.name || out.name;
    out.description = (typeof ld.description === 'string' ? ld.description : undefined) || out.description;
    // offers may be array or object
    const offers = Array.isArray(ld.offers) ? ld.offers[0] : ld.offers;
    if (offers) {
      const priceStr = offers.price || offers.priceSpecification?.price;
      const priceNum = priceStr ? Number(String(priceStr).replace(',', '.')) : undefined;
      if (Number.isFinite(priceNum as number)) out.price = Number(priceNum);
      out.currency = offers.priceCurrency || offers.priceSpecification?.priceCurrency || out.currency;
    }
    if (ld.image) {
      if (typeof ld.image === 'string') out.imageUrl = resolveUrlMaybe(ld.image, url);
      else if (Array.isArray(ld.image) && ld.image.length > 0) {
        const imgs = ld.image.map((x: any) => resolveUrlMaybe(String(x), url));
        out.imageUrl = imgs[0];
        out.galleryUrls = imgs;
      }
    }
  }

  // Fallbacks via OpenGraph / standard metas
  out.name = out.name || getMeta(html, 'og:title') || getNameMeta(html, 'title');
  out.description = out.description || getMeta(html, 'og:description') || getNameMeta(html, 'description');
  const ogImages = [
    ...getMetaAll(html, 'og:image'),
    ...getMetaAll(html, 'og:image:secure_url'),
    ...getMetaAll(html, 'twitter:image')
  ].map((u) => resolveUrlMaybe(u, url));
  if (!out.imageUrl && ogImages[0]) out.imageUrl = ogImages[0];
  const gallerySet = new Set<string>([...(out.galleryUrls ?? []), ...ogImages]);

  const ogPrice = getMeta(html, 'product:price:amount');
  const ogCurrency = getMeta(html, 'product:price:currency') || getMeta(html, 'og:price:currency');
  if (!out.price && ogPrice) {
    const pn = Number(String(ogPrice).replace(',', '.'));
    if (Number.isFinite(pn)) out.price = pn;
  }
  if (!out.currency && ogCurrency) out.currency = ogCurrency;

  // Additional price sources: itemprop and visible TL/₺ patterns
  if (out.price == null) {
    // <meta itemprop="price" content="123.45">
    const mMeta = html.match(/<meta[^>]+itemprop=["']price["'][^>]+content=["']([^"']+)["'][^>]*>/i);
    const metaPrice = mMeta?.[1];
    if (metaPrice) {
      const pn = Number(String(metaPrice).replace(',', '.'));
      if (Number.isFinite(pn)) out.price = pn;
    }
    // <span itemprop="price">1.234,99</span> or with content attr
    if (out.price == null) {
      const mSpan = html.match(/<[^>]+itemprop=["']price["'][^>]*>([^<]{1,20})<\/[^>]+>/i);
      const spanText = mSpan?.[1]?.trim();
      if (spanText) {
        const cleaned = spanText.replace(/[^0-9.,]/g, '').replace(',', '.');
        const pn = Number(cleaned);
        if (Number.isFinite(pn)) out.price = pn;
      }
    }
    // Visible TL or ₺ amounts (first match)
    if (out.price == null) {
      const tlMatch = html.match(/(?:₺|TL)\s*([0-9]+[0-9.,]*)/i);
      if (tlMatch && tlMatch[1]) {
        const cleaned = tlMatch[1].replace(/\./g, '').replace(',', '.');
        const pn = Number(cleaned);
        if (Number.isFinite(pn)) {
          out.price = pn;
          out.currency = out.currency || 'TRY';
        }
      }
    }
  }
  // If currency still missing but TL symbol present
  if (!out.currency && /(?:₺|\bTL\b)/i.test(html)) out.currency = 'TRY';

  // Augment: scan DOM/script to enrich gallery up to 10
  const currentCount = (out.galleryUrls?.length ?? 0) + ogImages.length;
  if (currentCount < 10) {
    // <img src>, common lazy attributes
    const imgRe = /<img\s+[^>]*(?:src|data-src|data-original|data-lazy|data-zoom-image|data-large_image|data-image)=["']([^"']+)["'][^>]*>/gi;
    let m: RegExpExecArray | null;
    const found: string[] = [];
    while ((m = imgRe.exec(html)) !== null) {
      const src = m[1];
      if (src) {
        const abs = resolveUrlMaybe(src, url);
        found.push(abs);
      }
      if (found.length >= 24) break; // don't go crazy
    }
    for (const f of found) gallerySet.add(f);

    // Parse srcset from <img> and <source> tags (prefer largest descriptor)
    const srcsetRe = /<(?:img|source)[^>]*srcset=["']([^"']+)["'][^>]*>/gi;
    let sm: RegExpExecArray | null;
    const candidates: string[] = [];
    while ((sm = srcsetRe.exec(html)) !== null) {
      const srcset = sm[1];
      if (!srcset) continue;
      const parts = srcset.split(',').map((p) => p.trim()).filter(Boolean);
      // collect all candidates (not only last)
      for (const part of parts) {
        const urlPart = part.split(/\s+/)[0];
        if (urlPart) candidates.push(resolveUrlMaybe(urlPart, url));
        if (candidates.length >= 24) break;
      }
      if (candidates.length >= 24) break;
    }
    for (const c of candidates) gallerySet.add(c);

    // As a last resort, scan JSON blobs inside <script> tags for image URLs
    const scriptRe = /<script[^>]*>([\s\S]*?)<\/script>/gi;
    const urlInJsonRe = /https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp|gif)(?:\?[^\s"'<>]*)?/gi;
    let jsMatch: RegExpExecArray | null;
    const jsonFound: string[] = [];
    while ((jsMatch = scriptRe.exec(html)) !== null) {
      const content = jsMatch[1];
      if (!content) continue;
      const urls = content.match(urlInJsonRe) || [];
      for (const u of urls) {
        jsonFound.push(u);
        if (jsonFound.length >= 30) break;
      }
      if (jsonFound.length >= 30) break;
    }
    for (const jf of jsonFound) gallerySet.add(resolveUrlMaybe(jf, url));
  }

  const finalGallery = Array.from(gallerySet).filter(Boolean).slice(0, 15);
  if (!out.galleryUrls || out.galleryUrls.length === 0) out.galleryUrls = finalGallery;

  return out;
}

export async function fetchImageAsDataUrl(imageUrl: string): Promise<string | null> {
  try {
    const res = await fetch(imageUrl, { cache: 'no-store' });
    if (!res.ok) return null;
    const ct = res.headers.get('content-type') || 'image/jpeg';
    const ab = await res.arrayBuffer();
    const size = ab.byteLength;
    // 4MB limit approx (same as server validation)
    const MAX = 4 * 1024 * 1024;
    if (size > MAX) return null;
    const b64 = Buffer.from(ab).toString('base64');
    return `data:${ct};base64,${b64}`;
  } catch {
    return null;
  }
}
