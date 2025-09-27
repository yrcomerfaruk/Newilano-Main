import Image from 'next/image';
import Link from 'next/link';
import styles from './BrandGrid.module.css';
import type { BrandSummary } from '@/lib/data';
import { isAllowedImageUrl } from '@/lib/image-validation';
import { ExternalLinkIcon } from '@/components/icons';

const placeholderLogo = 
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='70' viewBox='0 0 140 70'%3E%3Crect width='140' height='70' rx='12' fill='%23eff2f7'/%3E%3Ctext x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23111111' font-family='Arial' font-size='14'%3ELOGO%3C/text%3E%3C/svg%3E";

export function BrandGrid({ brands }: { brands: BrandSummary[] }) {
  return (
    <div className={styles.grid}>
      {brands.map((brand) => (
        <article key={brand.id} className={styles.card}>
          <div>
            <div className={styles.cardHeader}>
              <div className={styles.logoWrap}>
                <Image
                  src={isAllowedImageUrl(brand.logo) ? brand.logo! : placeholderLogo}
                  alt={`${brand.name} logosu`}
                  fill
                  sizes="60px"
                  unoptimized={Boolean(brand.logo && brand.logo.startsWith('data:image/'))}
                />
              </div>
              <div className={styles.nameAndTags}>
                <h3 className={styles.brandName}>{brand.name}</h3>
                <div className={styles.tags}>
                  {brand.categories.map((category) => (
                    <span key={category}>#{category}</span>
                  ))}
                </div>
              </div>
            </div>
            <p className={styles.info}>{brand.description ?? 'Marka açıklaması yakında eklenecek.'}</p>
          </div>
          <Link href={`/vitrin?brand=${brand.slug}`} className={styles.button}>
            <span>Ürünleri Gör</span>
            <ExternalLinkIcon width={16} height={16} />
          </Link>
        </article>
      ))}
    </div>
  );
}
