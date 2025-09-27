import { Logo } from './Logo';
import styles from './SiteFooter.module.css';

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.inner}>
          <Logo />
          <p className={styles.copy}>© {new Date().getFullYear()} Newilano. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
}
