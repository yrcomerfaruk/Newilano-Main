'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './page.module.css';
import type { ProductDetail } from '@/lib/data';
import Link from 'next/link';
import { FavoriteButton } from '@/components/FavoriteButton';
import { ShareIcon, ProductIcon, LeftArrowIcon } from '@/components/icons';

type Props = { products: ProductDetail[]; brandMap?: Record<string, { name: string; logo?: string; slug: string }> };

export default function KesfetClient({ products, brandMap = {} }: Props) {
  const [index, setIndex] = useState(0); // vertical index
  const [x, setX] = useState(0); // horizontal gallery offset in px
  const startY = useRef<number | null>(null);
  const startX = useRef<number | null>(null);
  const [imageIndex, setImageIndex] = useState(0);

  // Like counts state
  const [likeCount, setLikeCount] = useState<number>(0);
  const [visitCount, setVisitCount] = useState<number>(0);
  const [isMobile, setIsMobile] = useState(false);

  const current = products[index];
  const gallery = current?.gallery?.length ? current.gallery : [current?.image].filter(Boolean) as string[];

  // Preload next product image(s)
  useEffect(() => {
    const next = products[index + 1];
    if (next) {
      const imgs = next.gallery?.length ? next.gallery : [next.image];
      imgs.slice(0, 2).forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    }
  }, [index, products]);

  // Reset gallery position when product changes
  useEffect(() => {
    setImageIndex(0);
    setX(0);
  }, [index]);

  // Clamp imageIndex if gallery length shrinks
  useEffect(() => {
    if (imageIndex > 0 && imageIndex > gallery.length - 1) {
      setImageIndex(Math.max(0, gallery.length - 1));
    }
  }, [gallery.length, imageIndex]);

  const onTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    startX.current = e.touches[0].clientX;
  };


  const onTouchMove = (e: React.TouchEvent) => {
    if (startY.current == null || startX.current == null) return;
    const dy = e.touches[0].clientY - startY.current;
    const dx = e.touches[0].clientX - startX.current;
    // Decide axis by larger movement
    if (gallery.length > 1 && Math.abs(dx) > Math.abs(dy)) {
      // horizontal gallery; no preventDefault (touch-action: pan-y handles scroll behavior)
      setX(dx);
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const touch = e.changedTouches && e.changedTouches.length > 0 ? e.changedTouches[0] : null;
    const dy = touch && startY.current != null ? (touch.clientY - startY.current) : 0;
    const dx = touch && startX.current != null ? (touch.clientX - startX.current) : 0;

    // Horizontal swipe for gallery (only if more than 1 image)
    if (gallery.length > 1 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < -40 && imageIndex < gallery.length - 1) {
        setImageIndex((i) => Math.min(i + 1, gallery.length - 1));
      } else if (dx > 40 && imageIndex > 0) {
        setImageIndex((i) => Math.max(i - 1, 0));
      }
      setX(0);
      startY.current = null;
      startX.current = null;
      return;
    }

    // Vertical swipe for product
    if (dy < -80 && index < products.length - 1) {
      setIndex((i) => Math.min(i + 1, products.length - 1));
    } else if (dy > 80 && index > 0) {
      setIndex((i) => Math.max(i - 1, 0));
    }

    startY.current = null;
    startX.current = null;
    setX(0);
  };

  // Keyboard support for desktop
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' && index < products.length - 1) setIndex((i) => i + 1);
      if (e.key === 'ArrowUp' && index > 0) setIndex((i) => i - 1);
      if (e.key === 'ArrowRight' && imageIndex < gallery.length - 1) setImageIndex((i) => Math.min(i + 1, gallery.length - 1));
      if (e.key === 'ArrowLeft' && imageIndex > 0) setImageIndex((i) => Math.max(i - 1, 0));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [index, products.length, gallery.length, imageIndex]);

  // Desktop wheel scrolling support
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      // horizontal scroll for gallery if applicable
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && gallery.length > 1) {
        if (e.deltaX > 20 && imageIndex < gallery.length - 1) setImageIndex((i) => Math.min(i + 1, gallery.length - 1));
        if (e.deltaX < -20 && imageIndex > 0) setImageIndex((i) => Math.max(i - 1, 0));
        return;
      }
      // vertical for product navigation
      if (e.deltaY > 30 && index < products.length - 1) setIndex((i) => Math.min(i + 1, products.length - 1));
      if (e.deltaY < -30 && index > 0) setIndex((i) => Math.max(i - 1, 0));
    };
    window.addEventListener('wheel', onWheel, { passive: true });
    return () => window.removeEventListener('wheel', onWheel as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, products.length, gallery.length, imageIndex]);

  // no comment sheet => no body scroll lock

  // Load like count when product changes
  useEffect(() => {
    if (!current?.slug) return;
    let active = true;
    (async () => {
      try {
        const [likesRes, visitsRes] = await Promise.all([
          fetch(`/api/favorites/count?slug=${encodeURIComponent(current.slug)}`, { cache: 'no-store' }),
          fetch(`/api/visits/count?slug=${encodeURIComponent(current.slug)}`, { cache: 'no-store' })
        ]);
        if (active) {
          const likesJson = likesRes.ok ? await likesRes.json() : { count: 0 };
          setLikeCount(typeof likesJson.count === 'number' ? likesJson.count : 0);
          const visitsJson = visitsRes.ok ? await visitsRes.json() : { count: 0 };
          setVisitCount(typeof visitsJson.count === 'number' ? visitsJson.count : 0);
        }
      } catch (_) {
        if (active) {
          setLikeCount(0);
          setVisitCount(0);
        }
      } finally {
        // no-op
      }
    })();
    return () => { active = false; };
  }, [current?.slug]);

  // Determine mobile vs desktop to control comment action behavior
  useEffect(() => {
    const apply = () => setIsMobile(window.innerWidth < 768);
    apply();
    window.addEventListener('resize', apply);
    return () => window.removeEventListener('resize', apply);
  }, []);

  // comments removed

  if (!current) return null;

  const transform = `translateX(${-imageIndex * 100}%) translateX(${x}px)`;

  // Truncated description with toggle
  const [expanded, setExpanded] = useState(false);
  const shortDesc = useMemo(() => (current.description || '').slice(0, 120), [current?.description]);

  return (
    <div className={styles.root}>
      {/* Desktop layout: left panel + right visual channel */}
      {!isMobile ? (
        <div className={styles.desktopGrid}>
          <aside className={styles.leftPanel}>
            <div className={styles.productName}>{current.brand} {current.name}</div>
            <div className={styles.productDescSide}>
              {current.description}
            </div>
          </aside>
          <section className={styles.centerPanel}>
            <div className={styles.fixedChannel}>
              <Link href="/" className={`${styles.backButton} ${styles.imageBack}`}>
                <LeftArrowIcon width={14} height={14} />
              </Link>
              <div className={styles.slide}>
                <div className={styles.galleryTrack} style={{ transform }}>
                  {gallery.map((src, i) => (
                    <div className={styles.galleryImageWrapper} key={`${current.slug}-${i}`}>
                      <img className={styles.galleryImage} src={src} alt={current.name} />
                    </div>
                  ))}
                </div>
                {/* Dots indicator (desktop) */}
                {gallery.length > 1 && (
                  <div className={styles.dots}>
                    {gallery.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        className={i === imageIndex ? styles.dotActive : styles.dot}
                        onClick={() => setImageIndex(i)}
                        aria-label={`Görsel ${i + 1}`}
                      />
                    ))}
                  </div>
                )}

                {/* Desktop arrow nav */}
                {gallery.length > 1 && !isMobile && (
                  <>
                    <button
                      className={`${styles.navArrow} ${styles.navLeft}`}
                      aria-label="Önceki görsel"
                      onClick={() => setImageIndex((i) => Math.max(0, i - 1))}
                    >
                      ‹
                    </button>
                    <button
                      className={`${styles.navArrow} ${styles.navRight}`}
                      aria-label="Sonraki görsel"
                      onClick={() => setImageIndex((i) => Math.min(gallery.length - 1, i + 1))}
                    >
                      ›
                    </button>
                  </>
                )}
              </div>
            </div>
          </section>

          <aside className={styles.actionsCol}>
            <div className={styles.actionsGroup}>
              {(() => {
                const key = (current.brand || '').toLowerCase();
                const b = brandMap[key] || brandMap[current.brand?.toLowerCase?.() || ''];
                const href = b?.slug ? `/markalar/${encodeURIComponent(b.slug)}` : `/markalar`;
                return (
                  <Link href={href} className={styles.brandButton} aria-label={`Marka: ${current.brand}`}>
                    {b?.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className={styles.brandLogo} src={b.logo} alt={b.name} />
                    ) : (
                      <span>{(current.brand || '?').charAt(0)}</span>
                    )}
                  </Link>
                );
              })()}

              <div className={styles.actionItem}>
                <FavoriteButton
                  productSlug={current.slug}
                  className={`${styles.iconButton}`}
                  activeClassName={styles.iconActive}
                  showLabel={false}
                  iconWidth={26}
                  iconHeight={26}
                  onToggle={async () => {
                    try {
                      const res = await fetch(`/api/favorites/count?slug=${encodeURIComponent(current.slug)}`, { cache: 'no-store' });
                      if (res.ok) {
                        const data = await res.json();
                        setLikeCount(typeof data.count === 'number' ? data.count : 0);
                      }
                    } catch (_) {}
                  }}
                />
                <span className={styles.countLabel}>{likeCount}</span>
              </div>

              <div className={styles.actionItem}>
                <Link
                  href={`/vitrin/${current.slug}`}
                  className={styles.iconButton}
                  aria-label="Ürüne Git"
                  onClick={() => {
                    try {
                      fetch('/api/visits', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ slug: current.slug }),
                        keepalive: true
                      }).catch(() => {});
                      setVisitCount((c) => c + 1);
                    } catch {}
                  }}
                >
                  <ProductIcon width={22} height={22} />
                </Link>
                <span className={styles.countLabel}>{visitCount}</span>
              </div>

              <button
                className={styles.iconButton}
                aria-label="Paylaş"
                onClick={async () => {
                  const url = typeof window !== 'undefined' ? window.location.origin + `/vitrin/${current.slug}` : `/vitrin/${current.slug}`;
                  if (navigator.share) {
                    try {
                      await navigator.share({
                        title: `${current.brand} ${current.name}`,
                        text: current.description?.slice(0, 100) || 'Harika bir ürün keşfettim!',
                        url
                      });
                    } catch (_) {
                      // user cancelled
                    }
                  } else if (navigator.clipboard) {
                    try {
                      await navigator.clipboard.writeText(url);
                    } catch (_) {}
                  }
                }}
              >
                <ShareIcon width={18} height={18} />
              </button>
            </div>
          </aside>
        </div>
      ) : (
        /* Mobile layout (unchanged) */
        <>
          <div className={styles.slide} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
            <div className={styles.topBar}>
              <Link href="/" className={styles.backButton}>
                <LeftArrowIcon width={14} height={14} />
              </Link>
            </div>

            <div className={styles.galleryTrack} style={{ transform }}>
            {gallery.map((src, i) => (
              <div className={styles.galleryImageWrapper} key={`${current.slug}-${i}`}>
                <img className={styles.galleryImage} src={src} alt={current.name} />
              </div>
            ))}
          </div>
          {/* Dots indicator (mobile) */}
          {gallery.length > 1 && (
            <div className={styles.dots}>
              {gallery.map((_, i) => (
                <span key={i} className={i === imageIndex ? styles.dotActive : styles.dot} />
              ))}
            </div>
          )}

            <div className={styles.actions} aria-label="Aksiyonlar">
              <div className={styles.actionsGroup}>
                {(() => {
                  const key = (current.brand || '').toLowerCase();
                  const b = brandMap[key] || brandMap[current.brand?.toLowerCase?.() || ''];
                  const href = b?.slug ? `/markalar/${encodeURIComponent(b.slug)}` : `/markalar`;
                  return (
                    <Link href={href} className={styles.brandButton} aria-label={`Marka: ${current.brand}`}>
                      {b?.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img className={styles.brandLogo} src={b.logo} alt={b.name} />
                      ) : (
                        <span>{(current.brand || '?').charAt(0)}</span>
                      )}
                    </Link>
                  );
                })()}

                <div className={styles.actionItem}>
                  <FavoriteButton
                    productSlug={current.slug}
                    className={`${styles.iconButton}`}
                    activeClassName={styles.iconActive}
                    showLabel={false}
                    iconWidth={26}
                    iconHeight={26}
                    onToggle={async () => {
                      try {
                        const res = await fetch(`/api/favorites/count?slug=${encodeURIComponent(current.slug)}`, { cache: 'no-store' });
                        if (res.ok) {
                          const data = await res.json();
                          setLikeCount(typeof data.count === 'number' ? data.count : 0);
                        }
                      } catch (_) {}
                    }}
                  />
                  <span className={styles.countLabel}>{likeCount}</span>
                </div>

                <div className={styles.actionItem}>
                  <Link
                    href={`/vitrin/${current.slug}`}
                    className={styles.iconButton}
                    aria-label="Ürüne Git"
                    onClick={() => {
                      try {
                        fetch('/api/visits', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ slug: current.slug }),
                          keepalive: true
                        }).catch(() => {});
                        setVisitCount((c) => c + 1);
                      } catch {}
                    }}
                  >
                    <ProductIcon width={22} height={22} />
                  </Link>
                  <span className={styles.countLabel}>{visitCount}</span>
                </div>

                <button
                  className={styles.iconButton}
                  aria-label="Paylaş"
                  onClick={async () => {
                    const url = typeof window !== 'undefined' ? window.location.origin + `/vitrin/${current.slug}` : `/vitrin/${current.slug}`;
                    if (navigator.share) {
                      try {
                        await navigator.share({
                          title: `${current.brand} ${current.name}`,
                          text: current.description?.slice(0, 100) || 'Harika bir ürün keşfettim!',
                          url
                        });
                      } catch (_) {
                        // user cancelled
                      }
                    } else if (navigator.clipboard) {
                      try {
                        await navigator.clipboard.writeText(url);
                      } catch (_) {}
                    }
                  }}
                >
                  <ShareIcon width={18} height={18} />
                </button>
              </div>
            </div>

            <div className={styles.bottomInfo}>
              <div className={styles.productName}>{current.brand} {current.name}</div>
              <div className={styles.productDesc}>
                {expanded ? current.description : shortDesc}
                {current.description && current.description.length > shortDesc.length && (
                  <>
                    {!expanded && '... '}
                    <button className={styles.moreLess} onClick={() => setExpanded((v) => !v)}>
                      {expanded ? 'Daha az' : 'Daha fazla'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* comments removed */}
    </div>
  );
}
