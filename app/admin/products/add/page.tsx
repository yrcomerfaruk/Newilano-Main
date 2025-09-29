import { AdminProductForm } from '@/app/admin/ProductForm';
import { getBrands } from '@/lib/data';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Ürün Ekle | Admin Paneli'
};

export default async function AdminProductAddPage() {
  const brands = await getBrands();

  return (
    <section>
      <h2>Ürün Ekle</h2>
      <AdminProductForm brands={brands} />
    </section>
  );
}
