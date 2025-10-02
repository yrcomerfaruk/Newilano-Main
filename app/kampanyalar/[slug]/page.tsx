import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCampaignBySlug, getCampaignProductsBySlug } from '@/lib/data';
import { ProductCard } from '@/components/ProductCard';
import styles from './page.module.css';

export const revalidate = 600; // cache for 10 minutes

export default async function CampaignDetailPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const campaign = await getCampaignBySlug(slug);
  if (!campaign) return notFound();

  const products = await getCampaignProductsBySlug(slug);

  return (
    <main className={styles.main}>
      <section className={styles.header}>
        <div className="container">
          <div className={styles.topRight}>
            <Link href="/kampanyalar" className={styles.topRightLink}>
              Kampanyalara Dön
            </Link>
          </div>
          <div className={styles.headerGrid}>
            <div className={styles.content}>
              <h1 className={styles.title}>{campaign.title}</h1>
              {typeof campaign.longDescription === 'string' && campaign.longDescription.trim().length > 0 ? (
                <article className={styles.longText}>{campaign.longDescription}</article>
              ) : (
                <p className={styles.lead}>{campaign.description}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {products.length > 0 ? (
        <section>
          <div className="container">
            <h2 className={styles.sectionTitle}>Kampanyalı Ürünler</h2>
            <div className={styles.grid}>
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  showFavoriteButton={false}
                  showFavoriteLabel={false}
                  showBadges={false}
                />
              ))}
            </div>
          </div>
        </section>
      ) : (
        <p className={styles.lead}>Bu kampanyaya bağlı ürün bulunmuyor.</p>
      )}


    </main>
  );
}
