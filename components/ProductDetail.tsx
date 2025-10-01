 'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './ProductDetail.module.css';
import type { ProductDetail } from '@/lib/data';
import { EyeIcon, LeftArrowIcon, RightArrowIcon } from './icons';
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
  const [zoomOpen, setZoomOpen] = useState(false);
  const startXRef = useRef(0);
  const deltaXRef = useRef(0);

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
          onClick={() => setZoomOpen(true)}
          role="button"
          aria-label="Görseli büyüt"
        >
          <Image
            src={activeImage}
            alt={product.name}
            fill
            sizes="(max-width: 1024px) 100vw, 60vw"
            priority
            unoptimized={isDataImage(activeImage)}
          />
          {/* desktop nav arrows */}
          {galleryImages.length > 1 && (
            <>
              <button
                type="button"
                className={`${styles.navArrow} ${styles.navLeft}`}
                aria-label="Önceki görsel"
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
              >
                <LeftArrowIcon width={18} height={18} />
              </button>
              <button
                type="button"
                className={`${styles.navArrow} ${styles.navRight}`}
                aria-label="Sonraki görsel"
                onClick={(e) => { e.stopPropagation(); goNext(); }}
              >
                <RightArrowIcon width={18} height={18} />
              </button>
            </>
          )}
          {/* swipe dots hint */}
          {galleryImages.length > 1 && (
            <div className={styles.swipeHint} aria-hidden>
              {galleryImages.map((img, i) => (
                <span key={i} className={i === galleryImages.indexOf(activeImage) ? styles.hintDotActive : styles.hintDot} />
              ))}
            </div>
          )}
        </div>
      </div>

      {zoomOpen && (
        <div className={styles.zoomOverlay} role="dialog" aria-modal="true" aria-label="Büyük görsel">
          <div className={styles.zoomInner}>
            <button type="button" className={styles.zoomClose} aria-label="Kapat" onClick={() => setZoomOpen(false)}>×</button>
            <img
              src={activeImage}
              alt={product.name}
              className={styles.zoomImage}
              draggable={false}
            />
          </div>
        </div>
      )}

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
