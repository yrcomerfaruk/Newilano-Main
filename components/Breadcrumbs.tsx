import Link from 'next/link';
import styles from './Breadcrumbs.module.css';

type Crumb = {
  label: string;
  href?: string;
};

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className={styles.breadcrumbs} aria-label="Navigasyon yolu">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        if (isLast || !item.href) {
          return (
            <span key={item.label} className={styles.current} aria-current="page">
              {item.label}
            </span>
          );
        }

        return (
          <Link key={item.label} href={item.href} className={styles.link}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
