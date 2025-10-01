'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import styles from './page.module.css';
import type { HeroSlide } from '@/lib/data';
import { isAllowedImageUrl } from '@/lib/image-validation';

const fallback =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='180' viewBox='0 0 320 180'%3E%3Crect width='320' height='180' rx='16' fill='%23f3f4f6'/%3E%3Ctext x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23111111' font-family='Arial' font-size='18'%3EHero%3C/text%3E%3C/svg%3E";

type HeroListItem = HeroSlide;

export function AdminHeroList({ slides }: { slides: HeroListItem[] }) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (slides.length === 0) {
    return <p className={styles.brandListEmpty}>Henüz hero görseli eklenmemiş.</p>;
  }

  const handleDelete = (slide: HeroListItem) => {
    const confirmed = window.confirm(`${slide.title} slaytını silmek istediğinize emin misiniz?`);
    if (!confirmed) return;

    setPendingId(slide.id);
    setFeedback(null);
    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/hero-slides/${slide.id}`, { method: 'DELETE' });
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          setFeedback(payload.message ?? 'Hero slaytı silinemedi.');
        } else {
          setFeedback(`${slide.title} slaytı silindi.`);
          router.refresh();
        }
      } catch (error) {
        console.error('Hero delete error', error);
        setFeedback('Hero slaytı silinemedi.');
      } finally {
        setPendingId(null);
      }
    });
  };

  return (
    <div className={styles.campaignList}>
      {feedback ? <p className={styles.adminFormMessage}>{feedback}</p> : null}
      {slides.map((slide) => (
        <article key={slide.id} className={styles.campaignCard}>
          <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
            <div className={styles.campaignImage} style={{ position: 'relative', flex: '1 1 0' }}>
              <Image
                src={slide.image.startsWith('data:image/') ? slide.image : isAllowedImageUrl(slide.image) ? slide.image : fallback}
                alt={slide.title}
                fill
                sizes="260px"
                unoptimized={slide.image.startsWith('data:image/')}
              />
            </div>
            {slide.mobileImage ? (
              <div className={styles.campaignImage} style={{ position: 'relative', flex: '1 1 0' }}>
                <Image
                  src={slide.mobileImage.startsWith('data:image/') ? slide.mobileImage : isAllowedImageUrl(slide.mobileImage) ? slide.mobileImage : fallback}
                  alt={`${slide.title} (mobil)`}
                  fill
                  sizes="260px"
                  unoptimized={slide.mobileImage.startsWith('data:image/')}
                />
              </div>
            ) : null}
          </div>
          <div className={styles.campaignContent}>
            <div>
              <h4>{slide.title}</h4>
              <p>{slide.subtitle}</p>
            </div>
            <span className={styles.campaignMeta}>{slide.ctaLabel} · {slide.ctaHref}</span>
          </div>
          <div className={styles.brandListActions}>
            <button
              type="button"
              onClick={() => handleDelete(slide)}
              disabled={isPending && pendingId === slide.id}
            >
              {isPending && pendingId === slide.id ? 'Siliniyor…' : 'Sil'}
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
