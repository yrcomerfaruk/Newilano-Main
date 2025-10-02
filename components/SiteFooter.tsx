import Link from 'next/link';
import { Logo } from './Logo';
import styles from './SiteFooter.module.css';

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.cols}>
          <div className={styles.brandCol}>
            <Logo />
            <p className={styles.tagline}>Sneaker ve lifestyle dünyasını keşfet.</p>
          </div>

          <nav className={`${styles.col} ${styles.pagesCol}`} aria-label="Sayfalar">
            <h4>Sayfalar</h4>
            <ul>
              <li><Link href="/vizyon">Vizyon</Link></li>
              <li><Link href="/markalar">Markalar</Link></li>
              <li><Link href="/kampanyalar">Kampanyalar</Link></li>
              <li><Link href="/vitrin">Vitrin</Link></li>
              <li><Link href="/kesfet">Keşfet</Link></li>
            </ul>
          </nav>

          <nav className={styles.col} aria-label="Hesap">
            <h4>Hesap</h4>
            <ul>
              <li><Link href="/giris">Giriş</Link></li>
              <li><Link href="/kayit">Kayıt Ol</Link></li>
            </ul>
          </nav>

          <nav className={styles.col} aria-label="Politikalar">
            <h4>Politikalar</h4>
            <ul>
              <li><Link href="/gizlilik">Gizlilik</Link></li>
              <li><Link href="/kosullar">Kullanım Koşulları</Link></li>
              <li><Link href="/cerezler">Çerezler</Link></li>
            </ul>
          </nav>
        </div>

        <div className={styles.bottomBar}>
          <p className={styles.copy}>© {new Date().getFullYear()} Newilano. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
}
