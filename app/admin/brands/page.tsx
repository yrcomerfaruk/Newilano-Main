import { AdminBrandForm } from '@/app/admin/BrandForm';
import { AdminBrandList } from '@/app/admin/BrandList';
import { getAllProducts, getBrands } from '@/lib/data';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Markaları Yönet | Admin Paneli'
};

export default async function AdminBrandsPage() {
  const [allProducts, brands] = await Promise.all([getAllProducts(), getBrands()]);

  const brandStats = brands.map((brand) => ({
    ...brand,
    productCount: allProducts.filter((product) => product.brandId === brand.id).length
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <section>
        <h2>Marka Ekle</h2>
        <AdminBrandForm />
      </section>
      <section>
        <h2>Markaları Yönet</h2>
        <AdminBrandList brands={brandStats} />
      </section>
    </div>
  );
}
