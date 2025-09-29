import { connectToDatabase } from './db';
import type { PipelineStage } from 'mongoose';
import { Product } from '@/models/Product';
import { Brand } from '@/models/Brand';
import { CampaignModel } from '@/models/Campaign';
import { AnnouncementModel } from '@/models/Announcement';
import { HeroSlideModel } from '@/models/HeroSlide';
import { User } from '@/models/User';
import { FavoriteEvent } from '@/models/FavoriteEvent';
import { VisitEvent } from '@/models/VisitEvent';

export type Product = {
  id: string;
  brandId: string;
  slug: string;
  brand: string;
  name: string;
  category: string;
  price: string;
  priceValue: number;
  currency: string;
  image: string;
  gender?: 'ERKEK' | 'KADIN' | 'UNISEX';
  tags?: ('HYPE' | 'ONE_CIKAN' | 'YENI' | 'INDIRIMDE')[];
  productUrl?: string;
  favoriteCount?: number;
};

export type Announcement = {
  id: string;
  message: string;
  active: boolean;
  order: number;
};

export async function getActiveAnnouncements(): Promise<Announcement[]> {
  await connectToDatabase();
  const docs = await AnnouncementModel.find({ active: true }).sort({ order: 1, createdAt: 1 }).lean();
  return docs.map((d: any) => ({ id: d._id.toString(), message: d.message, active: !!d.active, order: Number(d.order) || 0 }));
}

export type ProductMetrics = {
  totalProducts: number;
  totalFavorites: number;
  totalViews: number;
  hypeCount: number;
  oneCikanCount: number;
};

export async function getProductMetrics(): Promise<ProductMetrics> {
  await connectToDatabase();
  const [totalProducts, totalFavorites, totalViews, hypeCount, oneCikanCount] = await Promise.all([
    Product.countDocuments({}),
    FavoriteEvent.countDocuments({}),
    VisitEvent.countDocuments({}),
    Product.countDocuments({ tags: 'HYPE' }),
    Product.countDocuments({ tags: 'ONE_CIKAN' })
  ]);

  return { totalProducts, totalFavorites, totalViews, hypeCount, oneCikanCount };
}

export async function getProductsByBrandSlug(slug: string, limit = 10): Promise<ProductDetail[]> {
  if (!slug) return [];
  await connectToDatabase();
  const brand = await Brand.findOne({ slug }).lean();
  if (!brand) return [];
  // Products store brand name in brandName; use that to filter
  const docs = await Product.find({ brandName: brand.name }).sort({ createdAt: -1 }).limit(limit).lean();
  return docs.map(mapProduct);
}

export async function getBrandBySlug(slug: string): Promise<BrandSummary | null> {
  if (!slug) return null;
  await connectToDatabase();
  const doc = await Brand.findOne({ slug }).lean();
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
    logo: doc.logo ?? undefined,
    description: doc.description ?? undefined,
    categories: doc.categories ?? [],
    website: doc.website ?? undefined,
    instagram: doc.instagram ?? undefined,
    facebook: doc.facebook ?? undefined,
    x: doc.x ?? undefined,
    youtube: doc.youtube ?? undefined,
    tiktok: doc.tiktok ?? undefined,
    linkedin: doc.linkedin ?? undefined,
    story: doc.story ?? undefined
  };
}

export type ProductDetail = Product & {
  description: string;
  gallery: string[];
  sizes: string[];
  colors: string[];
  features: string[];
  createdAt: Date;
};

export type Campaign = {
  id: string;
  title: string;
  description: string;
  image: string;
  ctaLabel?: string;
  ctaHref?: string;
  createdAt?: string;
};

export type HeroSlide = {
  id: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  image: string;
  mobileImage?: string;
  tabletImage?: string;
  desktopImage?: string;
};

export type BrandSummary = {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  categories: string[];
  website?: string;
  instagram?: string;
  facebook?: string;
  x?: string;
  youtube?: string;
  tiktok?: string;
  linkedin?: string;
  story?: string;
};

function formatPrice(value: number, currency: string) {
  const fraction = Math.round((value % 1) * 100) !== 0;
  const formatted = value.toLocaleString('tr-TR', {
    minimumFractionDigits: fraction ? 2 : 0,
    maximumFractionDigits: fraction ? 2 : 0
  });
  const symbol = currency === 'TRY' ? 'TL' : currency;
  return `${formatted} ${symbol}`;
}

function mapProduct(doc: any): ProductDetail {
  const priceValue = typeof doc.price === 'number' ? doc.price : Number(doc.price ?? 0);
  const currency = typeof doc.currency === 'string' ? doc.currency : 'TRY';

  return {
    id: doc._id.toString(),
    brandId: doc.brand?.toString?.() ?? '',
    slug: doc.slug,
    brand: doc.brandName,
    name: doc.name,
    category: doc.category,
    price: formatPrice(priceValue, currency),
    priceValue,
    currency,
    image: doc.image,
    gender: typeof doc.gender === 'string'
      ? ((): 'ERKEK' | 'KADIN' | 'UNISEX' | undefined => {
          const g = doc.gender.trim().toUpperCase();
          if (g === 'ERKEK' || g === 'KADIN' || g === 'UNISEX') return g;
          return undefined;
        })()
      : undefined,
    tags: doc.tags,
    productUrl: typeof doc.productUrl === 'string' && doc.productUrl.trim() ? doc.productUrl.trim() : undefined,
    description: doc.description,
    gallery: Array.isArray(doc.gallery) ? doc.gallery : [],
    sizes: Array.isArray(doc.sizes) ? doc.sizes : [],
    colors: Array.isArray(doc.colors) ? doc.colors : [],
    features: Array.isArray(doc.features) ? doc.features : [],
    createdAt: doc.createdAt ?? new Date()
  };
}

const defaultHeroSlides: HeroSlide[] = [
  {
    id: 'samba-release',
    title: 'Samba Drop',
    subtitle: 'Sezonun en hype adidas Samba seçkisi şimdi Newilano vitrininde.',
    ctaLabel: 'Koleksiyonu Keşfet',
    ctaHref: '/vitrin',
    image: 'https://images.unsplash.com/photo-1523380744952-b7fbffab9856?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'nike-run',
    title: 'Koşu Koleksiyonu',
    subtitle: 'Koşu antrenmanlarına hafiflik ve konfor katan Nike koşu koleksiyonu.',
    ctaLabel: 'Hemen İncele',
    ctaHref: '/kampanyalar',
    image: 'https://images.unsplash.com/photo-1528701800489-20be3c0bd36c?auto=format&fit=crop&w=1600&q=80'
  }
];

function mapCampaign(doc: any): Campaign {
  return {
    id: doc._id.toString(),
    title: doc.title,
    description: doc.description,
    image: doc.image,
    ctaLabel: doc.ctaLabel ?? undefined,
    ctaHref: doc.ctaHref ?? undefined,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : undefined
  };
}

export async function getBrands(): Promise<BrandSummary[]> {
  await connectToDatabase();
  const docs = await Brand.find().sort({ name: 1 }).lean();
  return docs.map((doc) => ({
    id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
    logo: doc.logo ?? undefined,
    description: doc.description ?? undefined,
    categories: doc.categories ?? [],
    website: doc.website ?? undefined,
    instagram: doc.instagram ?? undefined,
    facebook: doc.facebook ?? undefined,
    x: doc.x ?? undefined,
    youtube: doc.youtube ?? undefined,
    tiktok: doc.tiktok ?? undefined,
    linkedin: doc.linkedin ?? undefined,
    story: doc.story ?? undefined
  }));
}

export async function getAllProducts(): Promise<ProductDetail[]> {
  await connectToDatabase();
  const docs = await Product.find().sort({ createdAt: -1 }).lean();
  // Favori sayıları (toplam) için aggregate
  const favCounts = await FavoriteEvent.aggregate<{ _id: any; count: number }>([
    { $group: { _id: '$product', count: { $sum: 1 } } }
  ]);
  const favMap = new Map<string, number>(favCounts.map(fc => [String(fc._id), fc.count]));
  return docs.map((doc) => {
    const mapped = mapProduct(doc);
    // _id üzerinden eşleştir
    const id = doc._id?.toString?.() ?? mapped.id;
    mapped.favoriteCount = favMap.get(id) ?? 0;
    return mapped;
  });
}

export async function getProductsByTag(tag: string, limit = 8): Promise<ProductDetail[]> {
  await connectToDatabase();
  const docs = await Product.find({ tags: tag }).sort({ createdAt: -1 }).limit(limit).lean();
  return docs.map(mapProduct);
}

export async function getCampaigns(limit?: number): Promise<Campaign[]> {
  await connectToDatabase();
  const docs = await CampaignModel.find().sort({ createdAt: -1 }).lean();
  const campaigns = docs.map(mapCampaign);
  return typeof limit === 'number' ? campaigns.slice(0, limit) : campaigns;
}

function mapHeroSlide(doc: any): HeroSlide {
  return {
    id: doc._id.toString(),
    title: doc.title,
    subtitle: doc.subtitle,
    ctaLabel: doc.ctaLabel,
    ctaHref: doc.ctaHref,
    image: doc.image,
    mobileImage: doc.mobileImage ?? undefined,
    tabletImage: doc.tabletImage ?? undefined,
    desktopImage: doc.desktopImage ?? undefined
  };
}

export async function getHeroSlides(options?: { includeDefaults?: boolean }): Promise<HeroSlide[]> {
  await connectToDatabase();
  const docs = await HeroSlideModel.find().sort({ order: 1, createdAt: -1 }).lean();
  if (!docs.length) {
    return options?.includeDefaults ? defaultHeroSlides : [];
  }
  return docs.map(mapHeroSlide);
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  if (!slug) return null;
  await connectToDatabase();
  const doc = await Product.findOne({ slug }).lean();
  return doc ? mapProduct(doc) : null;
}

export async function getProductsBySlugs(slugs: string[]): Promise<ProductDetail[]> {
  if (!slugs.length) return [];
  await connectToDatabase();
  const docs = await Product.find({ slug: { $in: slugs } }).lean();
  const productMap = new Map(docs.map((doc) => [doc.slug, mapProduct(doc)]));
  return slugs.map((slug) => productMap.get(slug)).filter((item): item is ProductDetail => Boolean(item));
}

export async function getProductById(id: string): Promise<ProductDetail | null> {
  if (!id) return null;
  await connectToDatabase();
  const doc = await Product.findById(id).lean();
  return doc ? mapProduct(doc) : null;
}

export async function getNewProducts(limit = 8): Promise<ProductDetail[]> {
  await connectToDatabase();
  const docs = await Product.find().sort({ createdAt: -1 }).limit(limit).lean();
  return docs.map(mapProduct);
}

export async function getMostFavoritedProducts(limit = 8): Promise<ProductDetail[]> {
  await connectToDatabase();
  const pipeline: PipelineStage[] = [
    { $match: { favorites: { $exists: true, $not: { $size: 0 } } } },
    { $unwind: '$favorites' },
    {
      $group: {
        _id: '$favorites',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: limit * 2 },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: 'slug',
        as: 'product'
      }
    },
    { $unwind: '$product' },
    {
      $project: {
        product: 1,
        count: 1
      }
    },
    { $sort: { count: -1, 'product.createdAt': -1 } },
    { $limit: limit }
  ];

  const favorites = await User.aggregate(pipeline);
  const seen = new Set<string>();
  const mapped: ProductDetail[] = [];

  for (const item of favorites) {
    const product = mapProduct(item.product);
    if (!seen.has(product.id)) {
      mapped.push(product);
      seen.add(product.id);
    }
  }

  if (mapped.length < limit) {
    const fallback = await Product.find()
      .sort({ createdAt: -1 })
      .limit(limit - mapped.length)
      .lean();
    fallback.map(mapProduct).forEach((product) => {
      if (!seen.has(product.id)) {
        mapped.push(product);
        seen.add(product.id);
      }
    });
  }

  return mapped.slice(0, limit);
}

export async function getTrendingProducts(limit = 8): Promise<ProductDetail[]> {
  await connectToDatabase();
  const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
  const events = await FavoriteEvent.aggregate<{
    _id: string;
    count: number;
    product: any;
  }>([
    { $match: { createdAt: { $gte: twelveHoursAgo } } },
    {
      $group: {
        _id: '$product',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: limit * 2 },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product'
      }
    },
    { $unwind: '$product' },
    { $sort: { count: -1, 'product.createdAt': -1 } },
    { $limit: limit }
  ]);

  const seen = new Set<string>();
  const mapped: ProductDetail[] = [];

  for (const item of events) {
    const product = mapProduct(item.product);
    if (!seen.has(product.id)) {
      mapped.push(product);
      seen.add(product.id);
    }
  }

  if (mapped.length < limit) {
    const fallback = await Product.find()
      .sort({ updatedAt: -1 })
      .limit(limit - mapped.length)
      .lean();
    fallback.map(mapProduct).forEach((product) => {
      if (!seen.has(product.id)) {
        mapped.push(product);
        seen.add(product.id);
      }
    });
  }

  return mapped.slice(0, limit);
}

export async function searchProducts(
  query: string,
  limit = 10
): Promise<{ id: string; slug: string; name: string; brand: string; price: string; image?: string; category?: string }[]> {
  await connectToDatabase();
  const trimmed = query.trim();

  const filter = trimmed
    ? {
        $or: [
          { name: { $regex: trimmed, $options: 'i' } },
          { brandName: { $regex: trimmed, $options: 'i' } }
        ]
      }
    : {};

  const docs = await Product.find(filter).sort({ createdAt: -1 }).limit(limit).lean();

  return docs.map((doc) => {
    const priceValue = typeof doc.price === 'number' ? doc.price : Number(doc.price ?? 0);
    const currency = typeof doc.currency === 'string' ? doc.currency : 'TRY';
    return {
      id: doc._id.toString(),
      slug: doc.slug,
      name: doc.name,
      brand: doc.brandName,
      price: formatPrice(priceValue, currency),
      image: doc.image ?? undefined,
      category: doc.category ?? undefined
    };
  });
}

export async function getProductRecommendations(slug: string, limit = 8): Promise<ProductDetail[]> {
  await connectToDatabase();
  const current = await Product.findOne({ slug }).lean();
  if (!current) {
    return [];
  }

  const recommendations: ProductDetail[] = [];
  const seen = new Set<string>();

  // 1) Aynı kategori + aynı cinsiyet (varsa)
  const sameCatGenderFilter: any = {
    _id: { $ne: current._id },
    category: current.category
  };
  if (typeof current.gender === 'string' && current.gender) {
    sameCatGenderFilter.gender = current.gender;
  }
  const sameCatGender = await Product.find(sameCatGenderFilter)
    .sort({ createdAt: -1 })
    .limit(limit * 2)
    .lean();
  for (const doc of sameCatGender) {
    const mapped = mapProduct(doc);
    if (!seen.has(mapped.id)) {
      recommendations.push(mapped);
      seen.add(mapped.id);
    }
    if (recommendations.length >= limit) break;
  }

  // 2) Eksikse: Aynı kategori (cinsiyet bağımsız)
  if (recommendations.length < limit) {
    const sameCategory = await Product.find({
      _id: { $ne: current._id },
      category: current.category
    })
      .sort({ createdAt: -1 })
      .limit(limit * 2)
      .lean();
    for (const doc of sameCategory) {
      const mapped = mapProduct(doc);
      if (!seen.has(mapped.id)) {
        recommendations.push(mapped);
        seen.add(mapped.id);
      }
      if (recommendations.length >= limit) break;
    }
  }

  // 3) Hâlâ eksikse: hype/popüler fallback
  if (recommendations.length < limit) {
    const hypeFallback = await getMostFavoritedProducts(limit + 4);
    for (const product of hypeFallback) {
      if (product.slug === slug) continue;
      if (!seen.has(product.id)) {
        recommendations.push(product);
        seen.add(product.id);
      }
      if (recommendations.length >= limit) break;
    }
  }

  return recommendations.slice(0, limit);
}
