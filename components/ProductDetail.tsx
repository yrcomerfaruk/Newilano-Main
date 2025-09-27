 'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './ProductDetail.module.css';
import type { ProductDetail } from '@/lib/data';
import { EyeIcon } from './icons';
import { FavoriteButton } from './FavoriteButton';
import { ShareButtons } from './ShareButtons';
 

type Props = {
  product: ProductDetail;
};

export function ProductDetailView({ product }: Props) {
  const galleryImages = useMemo(() => {
    const unique = [product.image, ...product.gallery];
    return unique.filter((image, index, arr) => arr.indexOf(image) === index);
  }, [product]);

  const [activeImage, setActiveImage] = useState(() => galleryImages[0] ?? product.image);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const deltaXRef = useRef(0);
  const thumbsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setActiveImage(galleryImages[0] ?? product.image);
  }, [galleryImages, product.image]);

  // --- Helpers for swipe navigation on main image ---
  const goNext = () => {
    const idx = Math.max(0, galleryImages.indexOf(activeImage));
    const next = galleryImages[(idx + 1) % galleryImages.length] ?? activeImage;
    setActiveImage(next);
  };

  const goPrev = () => {
    const idx = Math.max(0, galleryImages.indexOf(activeImage));
    const prev = galleryImages[(idx - 1 + galleryImages.length) % galleryImages.length] ?? activeImage;
    setActiveImage(prev);
  };

  const onStart = (clientX: number) => {
    setIsDragging(true);
    startXRef.current = clientX;
    deltaXRef.current = 0;
  };

  const onMove = (clientX: number) => {
    if (!isDragging) return;
    deltaXRef.current = clientX - startXRef.current;
  };

  const onEnd = () => {
    if (!isDragging) return;
    const threshold = 50;
    const dx = deltaXRef.current;
    setIsDragging(false);
    startXRef.current = 0;
    deltaXRef.current = 0;
    if (Math.abs(dx) > threshold) {
      if (dx < 0) goNext();
      else goPrev();
    }
  };

  // --- URLs and utilities ---
  const isDataImage = (src: string) => src.startsWith('data:image/');
  const shareUrl = `https://newilano.com/vitrin/${product.slug}`;
  const detailHref = product.productUrl?.trim() ? product.productUrl.trim() : `/vitrin/${product.slug}`;
  const isExternalLink = /^https?:\/\//i.test(detailHref);

  // React onWheel ile yatay kaydırma (manual add/remove yok)

  return (
    <section className={styles.section}>
      <div className={styles.gallery}>
        <div
          className={styles.mainImage}
          onMouseDown={(e) => onStart(e.clientX)}
          onMouseMove={(e) => onMove(e.clientX)}
          onMouseUp={onEnd}
          onMouseLeave={onEnd}
          onTouchStart={(e) => onStart(e.touches[0]?.clientX ?? 0)}
          onTouchMove={(e) => onMove(e.touches[0]?.clientX ?? 0)}
          onTouchEnd={onEnd}
        >
          <Image
            src={activeImage}
            alt={product.name}
            fill
            sizes="(max-width: 1024px) 100vw, 60vw"
            priority
            unoptimized={isDataImage(activeImage)}
          />
        </div>
        <div
          className={styles.thumbnailRow}
          ref={thumbsRef}
          onWheel={(e) => {
            if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
              (e.currentTarget as HTMLDivElement).scrollLeft += e.deltaY;
              e.preventDefault();
            }
          }}
        >
          {galleryImages.map((image, index) => {
            const isActive = image === activeImage;
            return (
              <button
                key={`${image}-${index}`}
                type="button"
                className={isActive ? `${styles.thumbnail} ${styles.thumbnailActive}` : styles.thumbnail}
                onClick={() => setActiveImage(image)}
                aria-label={`${product.name} görsel ${index + 1}`}
                aria-current={isActive ? 'true' : undefined}
              >
                <Image
                  src={image}
                  alt=""
                  fill
                  sizes="120px"
                  unoptimized={isDataImage(image)}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.info}>
        <span className={styles.brand}>{product.brand}</span>
        <h1 className={styles.title}>{product.name}</h1>
        <p className={styles.price}>{product.price}</p>
        <p className={styles.description}>{product.description}</p>

        <div className={styles.ctaGroup}>
          <Link
            href={detailHref}
            className={styles.primaryButton}
            prefetch={false}
            target={isExternalLink ? '_blank' : undefined}
            rel={isExternalLink ? 'noopener noreferrer' : undefined}
          >
            <EyeIcon width={18} height={18} aria-hidden="true" />
            Ürünü İncele
          </Link>
          <FavoriteButton
            productSlug={product.slug}
            className={styles.secondaryButton}
            activeClassName={styles.secondaryButtonActive}
          />
        </div>

        <div className={styles.share}>
          <span>Paylaş</span>
          <ShareButtons productUrl={shareUrl} />
        </div>

        <div className={styles.metaList}>
          <div>
            <span>Marka</span>
            <strong>{product.brand}</strong>
          </div>
          <div>
            <span>Kategori</span>
            <strong>{product.category}</strong>
          </div>
          <div>
            <span>Renk</span>
            <strong>{product.colors.join(', ')}</strong>
          </div>
          <div>
            <span>Materyal</span>
            <strong>-</strong>
          </div>
        </div>

        <div className={styles.features}>
          <h2>Öne Çıkan Özellikler</h2>
          <ul>
            {product.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
