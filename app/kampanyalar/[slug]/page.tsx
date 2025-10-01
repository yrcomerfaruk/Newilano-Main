import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCampaignBySlug, getCampaignProductsBySlug } from '@/lib/data';
import { ProductCard } from '@/components/ProductCard';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export default async function CampaignDetailPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const campaign = await getCampaignBySlug(slug);
  if (!campaign) return notFound();

  const products = await getCampaignProductsBySlug(slug);

  return (
    <main className={`container ${styles.main}`}>
      <section className={styles.header}>
        <div className={styles.headerGrid}>
          <div className={styles.banner}>
            <Image src={campaign.image} alt={campaign.title} fill sizes="100vw" unoptimized={campaign.image.startsWith('data:image/')} />
          </div>
          <div className={styles.content}>
            <h1 className={styles.title}>{campaign.title}</h1>
            {typeof campaign.longDescription === 'string' && campaign.longDescription.trim().length > 0 ? (
              <article className={styles.longText}>{campaign.longDescription}</article>
            ) : (
              <p className={styles.lead}>{campaign.description}</p>
            )}
          </div>
        </div>
      </section>

      {products.length > 0 ? (
        <section>
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
        </section>
      ) : (
        <p className={styles.lead}>Bu kampanyaya bağlı ürün bulunmuyor.</p>
      )}

      <div>
        <Link href="/kampanyalar" className={styles.backLink}>
          ← Tüm kampanyalara dön
        </Link>
      </div>
    </main>
  );
}
