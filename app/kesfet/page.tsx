import { getAllProducts, getBrands, type ProductDetail } from '@/lib/data';
import KesfetClient from './KesfetClient';

export const dynamic = 'force-dynamic';

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default async function KesfetPage() {
  const [products, brands] = await Promise.all([getAllProducts(), getBrands()]);
  const randomized = shuffle(products).slice(0, Math.max(12, Math.min(50, products.length)));
  const brandMap: Record<string, { name: string; logo?: string; slug: string }> = {};
  for (const b of brands) {
    brandMap[b.slug] = { name: b.name, logo: b.logo, slug: b.slug };
    brandMap[b.name.toLowerCase()] = { name: b.name, logo: b.logo, slug: b.slug };
  }
  return <KesfetClient products={randomized} brandMap={brandMap} />;
}
