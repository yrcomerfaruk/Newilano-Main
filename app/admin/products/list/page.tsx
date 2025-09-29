import { getAllProducts } from '@/lib/data';
import { ListClient } from './ListClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Ürünleri Gör | Admin Paneli',
};

export default async function AdminProductListPage() {
  const allProducts = await getAllProducts();
  const initialProducts = allProducts.map((p) => ({
    id: p.id,
    name: p.name,
    brand: p.brand,
    category: p.category,
    price: p.price,
    image: p.image,
    slug: p.slug,
  }));

  return <ListClient initialProducts={initialProducts} />;
}
