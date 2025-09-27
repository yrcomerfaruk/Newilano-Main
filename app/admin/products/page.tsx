import { AdminProductForm } from '@/app/admin/ProductForm';
import { AdminProductList } from '@/app/admin/ProductList';
import { getAllProducts, getBrands } from '@/lib/data';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Ürünleri Yönet | Admin Paneli'
};

export default async function AdminProductsPage() {
  const [allProducts, brands] = await Promise.all([getAllProducts(), getBrands()]);

  const productList = allProducts.map((product) => ({
    id: product.id,
    name: product.name,
    brand: product.brand,
    category: product.category,
    price: product.price,
    image: product.image,
    slug: product.slug
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <section>
        <h2>Ürün Ekle</h2>
        <AdminProductForm brands={brands} />
      </section>
      <section>
        <h2>Ürünleri Yönet</h2>
        <AdminProductList products={productList} />
      </section>
    </div>
  );
}
