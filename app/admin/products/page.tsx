import Link from 'next/link';
import styles from '@/app/admin/page.module.css';
import { getProductMetrics } from '@/lib/data';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Ürünleri Yönet | Admin Paneli'
};

export default async function AdminProductsPage() {
  const metrics = await getProductMetrics();
  return (
    <div className={styles.managementStack}>
      <section className={styles.panel}>
        <h3>Ürün İstatistikleri</h3>
        <div className={styles.metricSection}>
          <div className={styles.metricCard}>
            <h2>Toplam Ürün</h2>
            <div className={styles.metricValue}><span>{metrics.totalProducts}</span><small>adet</small></div>
          </div>
          <div className={styles.metricCard}>
            <h2>HYPE</h2>
            <div className={styles.metricValue}><span>{metrics.hypeCount}</span><small>adet</small></div>
          </div>
          <div className={styles.metricCard}>
            <h2>Öne Çıkan</h2>
            <div className={styles.metricValue}><span>{metrics.oneCikanCount}</span><small>adet</small></div>
          </div>
          <div className={styles.metricCard}>
            <h2>Toplam Görüntülenme</h2>
            <div className={styles.metricValue}><span>{metrics.totalViews}</span><small>adet</small></div>
          </div>
          <div className={styles.metricCard}>
            <h2>Toplam Beğeni</h2>
            <div className={styles.metricValue}><span>{metrics.totalFavorites}</span><small>adet</small></div>
          </div>
        </div>
      </section>
      <section className={styles.panel}>
        <h3>Ürün Yönetimi</h3>
        <ul className={styles.actionList}>
          <li>
            <Link href="/admin/products/add" className={styles.action}>Ürün Ekle</Link>
          </li>
          <li>
            <Link href="/admin/products/list" className={styles.action}>Ürünleri Gör</Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
