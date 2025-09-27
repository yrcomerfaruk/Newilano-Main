'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { isAllowedImageUrl } from '@/lib/image-validation';

const fallbackLogo =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='60' viewBox='0 0 120 60'%3E%3Crect width='120' height='60' rx='12' fill='%23f3f4f6'/%3E%3Ctext x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23111111' font-family='Arial' font-size='12'%3ELOGO%3C/text%3E%3C/svg%3E";

type BrandListItem = {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  categories: string[];
  productCount: number;
};

export function AdminBrandList({ brands }: { brands: BrandListItem[] }) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = (brand: BrandListItem) => {
    if (brand.productCount > 0) {
      setFeedback(`${brand.name} markası ${brand.productCount} ürün ile ilişkili. Önce ürünleri güncelleyin.`);
      return;
    }

    const confirmed = window.confirm(
      `${brand.name} markasını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`
    );
    if (!confirmed) return;

    setPendingId(brand.id);
    setFeedback(null);

    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/brands/${brand.id}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          setFeedback(payload.message ?? 'Marka silinemedi.');
        } else {
          setFeedback(`${brand.name} markası silindi.`);
          router.refresh();
        }
      } catch (error) {
        console.error('Brand delete error', error);
        setFeedback('Marka silinemedi.');
      } finally {
        setPendingId(null);
      }
    });
  };

  if (brands.length === 0) {
    return <p className={styles.brandListEmpty}>Henüz kayıtlı bir marka yok.</p>;
  }

  return (
    <div className={styles.brandList}>
      {feedback ? <p className={styles.adminFormMessage}>{feedback}</p> : null}
      {brands.map((brand) => (
        <article key={brand.id} className={styles.brandListItem}>
          <div className={styles.brandListLogo}>
            <Image
              src={isAllowedImageUrl(brand.logo) ? brand.logo! : fallbackLogo}
              alt={`${brand.name} logosu`}
              fill
              sizes="80px"
              unoptimized={Boolean(brand.logo && brand.logo.startsWith('data:image/'))}
            />
          </div>
          <div className={styles.brandListInfo}>
            <div>
              <h4>{brand.name}</h4>
              <p>{brand.description ?? 'Açıklama yakında eklenecek.'}</p>
            </div>
            <div className={styles.brandListMeta}>
              <span className={styles.brandListProductCount}>{brand.productCount} ürün</span>
              <div className={styles.tags}>
                {brand.categories.length > 0 ? (
                  brand.categories.map((category) => <span key={category}>{category}</span>)
                ) : (
                  <span>Genel</span>
                )}
              </div>
            </div>
          </div>
          <div className={styles.brandListActions}>
            <button
              type="button"
              onClick={() => handleDelete(brand)}
              disabled={isPending && pendingId === brand.id}
            >
              {isPending && pendingId === brand.id ? 'Siliniyor…' : 'Sil'}
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
