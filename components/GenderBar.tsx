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
  const [available, setAvailable] = useState<Set<string> | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/genders', { cache: 'no-store' })
      .then((r) => r.json())
      .then((payload) => {
        if (cancelled) return;
        const list: Array<{ gender: string; count: number }> = Array.isArray(payload.genders)
          ? payload.genders
          : [];
        const set = new Set<string>(list.map((g) => String(g.gender).toUpperCase()));
        setAvailable(set);
      })
      .catch(() => {
        if (!cancelled) setAvailable(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Hide UNISEX by default until data arrives; show ERKEK/KADIN by default
  const has = (g: 'ERKEK' | 'KADIN' | 'UNISEX') => {
    if (!available) return g !== 'UNISEX';
    return available.has(g);
  };

  return (
    <nav className={styles.bar} aria-label="Cinsiyet">
      <div className={styles.list}>
        {has('ERKEK') && (
          <GenderTile
            href="/vitrin?gender=ERKEK"
            label="Erkek"
            jpgSrc="https://images.unsplash.com/photo-1606112219348-204d7d8b94ee?w=800&q=60&auto=format"
            jpgBackup="https://images.unsplash.com/photo-1516826957135-700dedea698c?w=800&q=60&auto=format"
          />
        )}
        {has('KADIN') && (
          <GenderTile
            href="/vitrin?gender=KADIN"
            label="Kadın"
            jpgSrc="https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=60&auto=format"
            jpgBackup="https://images.unsplash.com/photo-1520975922284-7b68332e3821?w=800&q=60&auto=format"
          />
        )}
        {has('UNISEX') && (
          <GenderTile
            href="/vitrin?gender=UNISEX"
            label="Unisex"
            jpgSrc="https://images.unsplash.com/photo-1562158070-4adf3b88b08d?w=800&q=60&auto=format"
            jpgBackup="https://images.unsplash.com/photo-1503342452485-86ff0a3b4b49?w=800&q=60&auto=format"
          />
        )}
      </div>
    </nav>
  );
}
