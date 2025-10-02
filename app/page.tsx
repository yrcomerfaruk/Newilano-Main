import { CampaignSection } from '@/components/CampaignSection';
import { HeroSection } from '@/components/HeroSection';
import { ProductCarousel } from '@/components/ProductCarousel';
import { ProductGridSection } from '@/components/ProductGridSection';
import styles from './page.module.css';
import Link from 'next/link';
import { ExploreIcon } from '@/components/icons';
import { getCampaigns, getHeroSlides, getProductsByTag } from '@/lib/data';
import { slugify } from '@/lib/slugify';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [hype, featured, newest, discounted, campaignData, heroSlides] = await Promise.all([
    getProductsByTag('HYPE', 20),
    getProductsByTag('ONE_CIKAN', 20),
    getProductsByTag('YENI', 20),
    getProductsByTag('INDIRIMDE', 20),
    getCampaigns(8),
    getHeroSlides()
  ]);

  return (
    <main className={styles.main}>
      <HeroSection slides={heroSlides} />
      <ProductCarousel title="En Hype Ürünler" products={hype} viewAllHref="/vitrin?tag=HYPE" />
      <ProductCarousel title="Öne Çıkan Ürünler" products={featured} viewAllHref="/vitrin?tag=ONE_CIKAN" />
      <ProductCarousel title="En Yeni Ürünler" products={newest} viewAllHref="/vitrin?tag=YENI" />
      {discounted.length > 0 && <ProductCarousel title="İndirimdeki Ürünler" products={discounted} viewAllHref="/vitrin?tag=INDIRIMDE" />}
      {campaignData.length > 0 ? <CampaignSection campaigns={campaignData} /> : null}
      <Link href="/kesfet" className={styles.fabKesfet} aria-label="Keşfet">
        <ExploreIcon width={18} height={18} />
      </Link>
    </main>
  );
}
