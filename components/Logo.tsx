import Image from 'next/image';
import Link from 'next/link';
import styles from './Logo.module.css';

export function Logo() {
  return (
    <Link href="/" className={styles.logo} aria-label="Newilano anasayfa">
      <span className={styles.imageWrap}>
        <Image src="/logo.png" alt="Newilano Originals" fill sizes="(max-width: 768px) 140px, 180px" priority />
      </span>
    </Link>
  );
}
