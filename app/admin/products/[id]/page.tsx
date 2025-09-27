import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getBrands, getProductById } from '@/lib/data';
import { AdminProductForm } from '../../ProductForm';

export const dynamic = 'force-dynamic';

type Props = {
  params: { id: string };
};

export default async function AdminProductEditPage({ params }: Props) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    redirect('/');
  }

  const [product, brands] = await Promise.all([getProductById(params.id), getBrands()]);

  if (!product) {
    redirect('/admin');
  }

  return (
    <main style={{ padding: '3rem 0', minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: '720px' }}>
        <h1 style={{ marginBottom: '2rem' }}>Ürünü Düzenle</h1>
        <AdminProductForm brands={brands} product={{
          id: product.id,
          name: product.name,
          brandId: product.brandId,
          gender: product.gender ?? 'UNISEX',
          category: product.category,
          priceValue: product.priceValue,
          currency: product.currency,
          image: product.image,
          description: product.description,
          gallery: product.gallery,
          sizes: product.sizes,
          colors: product.colors,
          features: product.features,
          productUrl: product.productUrl
        }} />
      </div>
    </main>
  );
}
