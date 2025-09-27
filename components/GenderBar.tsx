'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './GenderBar.module.css';

function GenderTile({ href, label, jpgSrc, jpgBackup }: { href: string; label: string; jpgSrc: string; jpgBackup: string }) {
  const [src, setSrc] = useState<string>(jpgSrc);
  useEffect(() => {
    let alive = true;
    const img = new Image();
    img.onload = () => { if (alive) setSrc(jpgSrc); };
    img.onerror = () => { if (alive) setSrc(jpgBackup); };
    img.src = jpgSrc;
    return () => { alive = false; };
  }, [jpgSrc, jpgBackup]);

  return (
    <Link href={href} className={styles.item} prefetch={false}>
      <span className={styles.thumb} style={{ backgroundImage: `url('${src}')` }} />
      <span className={styles.label}>{label}</span>
    </Link>
  );
}

export function GenderBar() {
  return (
    <nav className={styles.bar} aria-label="Cinsiyet">
      <div className={styles.list}>
        <GenderTile href="/vitrin?gender=ERKEK" label="Erkek" jpgSrc="https://images.unsplash.com/photo-1606112219348-204d7d8b94ee?w=800&q=60&auto=format" jpgBackup="https://images.unsplash.com/photo-1516826957135-700dedea698c?w=800&q=60&auto=format" />
        <GenderTile href="/vitrin?gender=KADIN" label="Kadın" jpgSrc="https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=60&auto=format" jpgBackup="https://images.unsplash.com/photo-1520975922284-7b68332e3821?w=800&q=60&auto=format" />
        <GenderTile href="/vitrin?gender=UNISEX" label="Unisex" jpgSrc="https://images.unsplash.com/photo-1562158070-4adf3b88b08d?w=800&q=60&auto=format" jpgBackup="https://images.unsplash.com/photo-1503342452485-86ff0a3b4b49?w=800&q=60&auto=format" />
      </div>
    </nav>
  );
}
