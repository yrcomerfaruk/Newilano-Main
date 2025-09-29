import Link from 'next/link';
import styles from '@/app/admin/page.module.css';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Markaları Yönet | Admin Paneli'
};

export default async function AdminBrandsPage() {
  return (
    <div className={styles.managementStack}>
      <section className={styles.panel}>
        <h3>Marka Yönetimi</h3>
        <ul className={styles.actionList}>
          <li>
            <Link href="/admin/brands/add" className={styles.action}>Marka Ekle</Link>
          </li>
          <li>
            <Link href="/admin/brands/list" className={styles.action}>Markaları Yönet</Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
