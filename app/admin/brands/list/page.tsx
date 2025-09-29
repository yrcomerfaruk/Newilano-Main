import { getAllProducts, getBrands } from '@/lib/data';
import { AdminBrandList } from '@/app/admin/BrandList';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Markaları Yönet | Admin Paneli',
};

export default async function AdminBrandListPage() {
  const [allProducts, brands] = await Promise.all([getAllProducts(), getBrands()]);
  const brandStats = brands.map((brand) => ({
    ...brand,
    productCount: allProducts.filter((p) => p.brandId === brand.id).length,
  }));

  return (
    <section>
      <h2>Markaları Yönet</h2>
      <AdminBrandList brands={brandStats} />
    </section>
  );
}
