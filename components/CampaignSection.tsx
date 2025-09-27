import Image from 'next/image';
import Link from 'next/link';
import styles from './CampaignSection.module.css';
import type { Campaign } from '@/lib/data';

export function CampaignSection({ campaigns }: { campaigns: Campaign[] }) {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Kampanyalar</h2>
          <Link href="/kampanyalar" className="section-link">
            Tümünü Gör
          </Link>
        </div>
        <div className={styles.grid}>
          {campaigns.map((campaign) => (
            <article key={campaign.id} className={styles.card}>
              <div className={styles.imageWrap}>
                <Image
                  src={campaign.image}
                  alt={campaign.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  unoptimized={campaign.image.startsWith('data:image/')}
                />
              </div>
              <div className={styles.info}>
                <h3>{campaign.title}</h3>
                <p>{campaign.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
