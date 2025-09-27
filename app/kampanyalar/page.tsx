import Image from 'next/image';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import styles from './page.module.css';
import { getCampaigns } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function KampanyalarPage() {
  const campaigns = await getCampaigns();
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className="container">

          <div className={styles.heroContent}>
            <h1>Kampanyalar</h1>
            <p>
              Sezonluk kampanyalarımızı ve sınırlı süreli fırsatları keşfedin. Newilano topluluğuna özel indirimler ve
              ayrıcalıklar burada.
            </p>
          </div>
        </div>
      </section>

      <div className="container">
        {campaigns.length === 0 ? (
          <p className={styles.emptyState}>Henüz yayınlanmış bir kampanya yok.</p>
        ) : (
          <div className={styles.grid}>
            {campaigns.map((campaign) => (
              <article key={campaign.id} className={styles.card}>
                <div className={styles.image}>
                  <Image
                    src={campaign.image}
                    alt={campaign.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    unoptimized={campaign.image.startsWith('data:image/')}
                  />
                </div>
                <div className={styles.body}>
                  <h2>{campaign.title}</h2>
                  <p>{campaign.description}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
