import { notFound } from 'next/navigation';
import { GoBackButton } from '@/components/GoBackButton';
import styles from './page.module.css';
import { ProductDetailView } from '@/components/ProductDetail';
import { ProductCarousel } from '@/components/ProductCarousel';
import { getProductBySlug, getProductRecommendations } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product) return {};
  return {
    title: `${product.name} | Newilano`,
    description: product.description
  };
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const showcase = await getProductRecommendations(product.slug, 8);

  return (
    <main className={styles.main}>
      <div className="container">
        <div className={styles.topBar}>
          <GoBackButton />
        </div>
        <ProductDetailView product={product} />
      </div>
      <ProductCarousel title="Sana Öneriyoruz" products={showcase} viewAllHref="/vitrin" viewAllLabel="Tüm Ürünler" />
    </main>
  );
}
