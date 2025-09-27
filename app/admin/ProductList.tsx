'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import styles from './page.module.css';
import type { ProductDetail } from '@/lib/data';
import { isAllowedImageUrl } from '@/lib/image-validation';

const fallbackImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Crect width='160' height='160' rx='18' fill='%23f3f4f6'/%3E%3Ctext x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23111111' font-family='Arial' font-size='14'%3EÜrün%3C/text%3E%3C/svg%3E";

type ProductListItem = Pick<ProductDetail, 'id' | 'name' | 'brand' | 'category' | 'price' | 'image' | 'slug'> & {
  createdAt?: string;
};

export function AdminProductList({ products }: { products: ProductListItem[] }) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (products.length === 0) {
    return <p className={styles.brandListEmpty}>Henüz kayıtlı ürün yok.</p>;
  }

  const handleDelete = (product: ProductListItem) => {
    const confirmed = window.confirm(`${product.name} ürününü silmek istediğinize emin misiniz?`);
    if (!confirmed) return;

    setPendingId(product.id);
    setFeedback(null);
    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/products/${product.id}`, {
          method: 'DELETE'
        });
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          setFeedback(payload.message ?? 'Ürün silinemedi.');
        } else {
          setFeedback(`${product.name} ürünü silindi.`);
          router.refresh();
        }
      } catch (error) {
        console.error('Product delete error', error);
        setFeedback('Ürün silinemedi.');
      } finally {
        setPendingId(null);
      }
    });
  };

  return (
    <div className={styles.productListStack}>
      {feedback ? <p className={styles.adminFormMessage}>{feedback}</p> : null}
      {products.map((product) => (
        <article key={product.id} className={styles.productCard}>
          <div className={styles.productCardMedia}>
            <Image
              src={product.image?.startsWith('data:image/')
                ? product.image
                : isAllowedImageUrl(product.image)
                  ? product.image!
                  : fallbackImage}
              alt={product.name}
              fill
              sizes="160px"
              unoptimized={product.image?.startsWith('data:image/')}
            />
          </div>
          <div className={styles.productCardInfo}>
            <div>
              <span className={styles.productCardBrand}>{product.brand}</span>
              <h4>{product.name}</h4>
              <p>{product.category}</p>
            </div>
            <span className={styles.productCardPrice}>{product.price}</span>
          </div>
          <div className={styles.brandListActions}>
            <Link href={`/admin/products/${product.id}`} className={styles.editButton}>
              Düzenle
            </Link>
            <button
              type="button"
              onClick={() => handleDelete(product)}
              disabled={isPending && pendingId === product.id}
            >
              {isPending && pendingId === product.id ? 'Siliniyor…' : 'Sil'}
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
