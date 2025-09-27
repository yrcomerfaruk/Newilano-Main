import { redirect } from 'next/navigation';
import styles from './page.module.css';
import { auth } from '@/lib/auth';
import {
  getAllProducts,
  getCampaigns,
  getMostFavoritedProducts,
  getNewProducts
} from '@/lib/data';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admin Paneli | Newilano'
};

export default async function AdminPage() {
  const session = await auth();

  if (!session) {
    redirect(`/giris?callbackUrl=${encodeURIComponent('/admin')}`);
  }

  if (session.user?.role !== 'admin') {
    redirect('/');
  }

  const [allProducts, hypeProducts, newestProducts, campaignData] = await Promise.all([
    getAllProducts(),
    getMostFavoritedProducts(6),
    getNewProducts(6),
    getCampaigns()
  ]);

  const totalProducts = allProducts.length;
  const hypeCount = hypeProducts.length;
  const newCollectionCount = newestProducts.length;
  const uniqueBrands = new Set(allProducts.map((product) => product.brandId || product.brand)).size;
  const uniqueCategories = new Set(allProducts.map((product) => product.category)).size;
  const highlightedCampaigns = campaignData.slice(0, 3);

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div>
            <span className={styles.heroEyebrow}>Hoş geldin, {session.user?.name?.split(' ')[0] ?? 'Admin'}</span>
            <h1>Newilano Yönetim Paneli</h1>
            <p>
              Stok trendlerini, kampanya performansını ve vitrin hareketlerini tek ekrandan takip edin. Bu panel
              yalnızca yönetici hesapları tarafından görüntülenebilir.
            </p>
          </div>
          <div className={styles.heroStats}>
            <div>
              <span>Aktif Ürün</span>
              <strong>{totalProducts}</strong>
            </div>
            <div>
              <span>Marka</span>
              <strong>{uniqueBrands}</strong>
            </div>
            <div>
              <span>Kategori</span>
              <strong>{uniqueCategories}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.metricSection}>
          <div className={styles.metricCard}>
            <div>
              <h2>Hype Koleksiyonu</h2>
              <p>Premium talep gören ürünleriniz. Stok planlarını haftalık olarak gözden geçirin.</p>
            </div>
            <div className={styles.metricValue}>
              <span>{hypeCount}</span>
              <small>ürün</small>
            </div>
          </div>
          <div className={styles.metricCard}>
            <div>
              <h2>Yeni Sezon</h2>
              <p>Son eklenen ürünler. Vitrindeki yenilikleri öne çıkarmayı unutmayın.</p>
            </div>
            <div className={styles.metricValue}>
              <span>{newCollectionCount}</span>
              <small>ürün</small>
            </div>
          </div>
          <div className={styles.metricCard}>
            <div>
              <h2>Kampanyalar</h2>
              <p>Takipte olan kampanya sayısı. Performans notlarını güncel tutun.</p>
            </div>
            <div className={styles.metricValue}>
              <span>{highlightedCampaigns.length}</span>
              <small>aktif</small>
            </div>
          </div>
        </section>

    </main>
  );
}
