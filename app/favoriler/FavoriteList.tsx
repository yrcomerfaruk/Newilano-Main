'use client';

import { useState, useTransition } from 'react';
import { ProductCard } from '@/components/ProductCard';
import type { ProductDetail } from '@/lib/data';
import { removeFavorite } from '@/app/actions';
import styles from './page.module.css';

export type FavoriteListProps = {
  initialProducts: ProductDetail[];
};

export function FavoriteList({ initialProducts }: FavoriteListProps) {
  const [products, setProducts] = useState(initialProducts);
  const [isPending, startTransition] = useTransition();

  const handleRemove = (productId: string) => {
    startTransition(async () => {
      setProducts((currentProducts) => currentProducts.filter((p) => p.id !== productId));
      await removeFavorite(productId);
    });
  };

  if (products.length === 0) {
    return (
      <div className={styles.emptyState}>Favorilerine eklenmiş bir ürünün yok. Vitrin sayfasından keşfetmeye başla.</div>
    );
  }

  return (
    <div className={styles.grid}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onRemove={handleRemove} />
      ))}
    </div>
  );
}
