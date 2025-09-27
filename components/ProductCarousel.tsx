'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { ProductCard } from './ProductCard';
import styles from './ProductCarousel.module.css';
import type { Product } from '@/lib/data';

export function ProductCarousel({
  title,
  products,
  viewAllHref,
  viewAllLabel
}: {
  title: string;
  products: Product[];
  viewAllHref: string;
  viewAllLabel?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollRef.current;
    if (!container) return;
    const amount = direction === 'left' ? -container.clientWidth : container.clientWidth;
    container.scrollBy({ left: amount, behavior: 'smooth' });
  };

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.arrow}
              aria-label="Önceki ürünler"
              onClick={() => scroll('left')}
            >
              &lt;
            </button>
            <button
              type="button"
              className={styles.arrow}
              aria-label="Sonraki ürünler"
              onClick={() => scroll('right')}
            >
              &gt;
            </button>
            <Link href={viewAllHref} className={styles.link}>
              {viewAllLabel ?? 'Tümünü Gör'}
            </Link>
          </div>
        </div>
        <div className={styles.carouselWrap}>
          <div className={styles.scroller} ref={scrollRef}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} showFavoriteButton={false} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
