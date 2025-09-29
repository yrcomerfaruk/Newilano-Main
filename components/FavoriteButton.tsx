'use client';

import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { HeartIcon } from './icons';
import styles from './FavoriteButton.module.css';

type FavoriteButtonProps = {
  productSlug: string;
  className?: string;
  activeClassName?: string;
  showLabel?: boolean;
  iconWidth?: number;
  iconHeight?: number;
  onToggle?: (isFavorite: boolean) => void;
};

export function FavoriteButton({ productSlug, className, activeClassName, showLabel = true, iconWidth = 18, iconHeight = 18, onToggle }: FavoriteButtonProps) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [isFavorite, setIsFavorite] = useState(false);
  const [pending, setPending] = useState(false);
  const [initialising, setInitialising] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== 'authenticated') {
      setIsFavorite(false);
      return;
    }

    let active = true;
    setInitialising(true);
    setError(null);

    fetch(`/api/favorites?slug=${productSlug}`, { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Favori bilgisi alınamadı');
        }
        const data = await response.json();
        if (active) {
          setIsFavorite(Boolean(data.favorite));
        }
      })
      .catch((err) => {
        console.error(err);
        if (active) {
          setError('Favoriler yüklenemedi.');
        }
      })
      .finally(() => {
        if (active) {
          setInitialising(false);
        }
      });

    return () => {
      active = false;
    };
  }, [status, productSlug]);

  const disabled = status === 'loading' || initialising || pending;

  const buttonClassName = useMemo(() => {
    const classes = [className];
    if (isFavorite) {
      classes.push(activeClassName);
    }
    if (pending || initialising) {
      classes.push(styles.buttonPending);
    }
    return classes.filter(Boolean).join(' ');
  }, [className, activeClassName, isFavorite, pending, initialising]);

  const label = useMemo(() => {
    if (pending) {
      return isFavorite ? 'Favoriden çıkarılıyor…' : 'Favoriye ekleniyor…';
    }

    if (status !== 'authenticated') {
      return 'Favorilere Ekle';
    }

    return isFavorite ? 'Favorilerde' : 'Favorilere Ekle';
  }, [pending, isFavorite, status]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (status !== 'authenticated') {
      const redirectTo = `/giris?callbackUrl=${encodeURIComponent(pathname)}`;
      router.push(redirectTo);
      return;
    }

    setPending(true);
    setError(null);

    try {
      if (isFavorite) {
        const response = await fetch(`/api/favorites?slug=${productSlug}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error('Favoriden çıkarılamadı');
        }

        const data = await response.json();
        const nextFav = Boolean(data.favorite) || Boolean(data.favorites?.includes(productSlug));
        setIsFavorite(nextFav);
        onToggle?.(nextFav);
      } else {
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: productSlug })
        });

        if (!response.ok) {
          throw new Error('Favoriye eklenemedi');
        }

        const data = await response.json();
        const nextFav = Boolean(data.favorite) || Boolean(data.favorites?.includes(productSlug));
        setIsFavorite(nextFav);
        onToggle?.(nextFav);
      }
    } catch (err) {
      console.error(err);
      setError('İşlem tamamlanamadı. Tekrar deneyin.');
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      className={buttonClassName}
      onClick={handleToggle}
      disabled={disabled}
      aria-pressed={isFavorite}
      aria-label={label}
    >
      <HeartIcon width={iconWidth} height={iconHeight} aria-hidden="true" fill={isFavorite ? 'currentColor' : 'none'} />
      {showLabel && <span>{label}</span>}
    </button>
  );
}