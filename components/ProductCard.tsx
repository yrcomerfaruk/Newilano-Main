import Image from 'next/image';
import Link from 'next/link';
import styles from './ProductCard.module.css';
import type { Product } from '@/lib/data';
import { FavoriteButton } from './FavoriteButton';
import { CloseIcon } from './icons';

export type ProductCardProps = {
  product: Product;
  onRemove?: (productId: string) => void;
  showFavoriteButton?: boolean;
  showFavoriteLabel?: boolean;
  showBadges?: boolean;
};

export function ProductCard({ product, onRemove, showFavoriteButton = true, showFavoriteLabel = true, showBadges = true }: ProductCardProps) {
  const isDataImage = product.image.startsWith('data:image/');

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove?.(product.id);
  };

  return (
    <Link href={`/vitrin/${product.slug}`} className={styles.card}>
      <div className={styles.imageWrap}>
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 90vw, 220px"
          className={styles.image}
          unoptimized={isDataImage}
        />
        {showBadges && Array.isArray(product.tags) && product.tags.length > 0 ? (
          <div className={styles.badges} aria-hidden="true">
            {product.tags.slice(0, 2).map((t) => (
              <span
                key={t}
                className={
                  t === 'HYPE'
                    ? `${styles.badge} ${styles.badgeHype}`
                    : t === 'ONE_CIKAN'
                    ? `${styles.badge} ${styles.badgeOne}`
                    : t === 'YENI'
                    ? `${styles.badge} ${styles.badgeNew}`
                    : t === 'INDIRIMDE'
                    ? `${styles.badge} ${styles.badgeSale}`
                    : styles.badge
                }
              >
                {t === 'HYPE'
                  ? 'Hype'
                  : t === 'ONE_CIKAN'
                  ? 'Öne Çıkan'
                  : t === 'YENI'
                  ? 'Yeni'
                  : t === 'INDIRIMDE'
                  ? 'İndirimde'
                  : t}
              </span>
            ))}
          </div>
        ) : null}
        {onRemove ? (
          <button type="button" className={styles.removeButton} onClick={handleRemove} aria-label="Favorilerden kaldır">
            <CloseIcon width={16} height={16} />
          </button>
        ) : showFavoriteButton ? (
          <FavoriteButton
            productSlug={product.slug}
            showLabel={showFavoriteLabel}
            className={styles.favoriteButton}
            activeClassName={styles.favoriteButtonActive}
            iconWidth={22}
            iconHeight={22}
          />
        ) : null}
      </div>
      <div className={styles.info}>
        <span className={styles.brand}>{product.brand}</span>
        <h3>{product.name}</h3>
        <div className={styles.bottomRow}>
          <span className={styles.price}>{product.price}</span>
        </div>
      </div>
    </Link>
  );
}
