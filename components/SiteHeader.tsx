'use client';

import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Logo } from './Logo';
import { CloseIcon } from './icons';
import { FiHeart, FiSearch } from 'react-icons/fi';
import { AuthButtons } from './AuthButtons';
import styles from './SiteHeader.module.css';
import { AnnouncementBar } from './AnnouncementBar';
type SearchResult = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  price: string;
};

const links = [
  { href: '/', label: 'Ana Sayfa' },
  { href: '/vitrin', label: 'Vitrin' },
  { href: '/markalar', label: 'Markalar' },
  { href: '/kampanyalar', label: 'Kampanyalar' },
  { href: '/vizyon', label: 'Vizyon' }
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Platform class on <html> for platform-specific CSS tweaks (e.g., iOS vs Android)
  useEffect(() => {
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isAndroid = /Android/.test(ua);
    const root = document.documentElement;
    if (isIOS) root.classList.add('is-ios'); else root.classList.remove('is-ios');
    if (isAndroid) root.classList.add('is-android'); else root.classList.remove('is-android');
  }, []);

  const trimmedQuery = searchTerm.trim();

  useEffect(() => {
    if (!isSearchOpen) {
      return;
    }

    const timer = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isSearchOpen]);

  useEffect(() => {
    if (!isSearchOpen) {
      return;
    }

    const hasQuery = trimmedQuery.length >= 2;
    if (!hasQuery) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    let cancelled = false;
    setSearchLoading(true);

    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      fetch(`/api/products/search?q=${encodeURIComponent(trimmedQuery)}`, { signal: controller.signal })
        .then((response) => response.json())
        .then((payload) => {
          if (cancelled) return;
          const results = Array.isArray(payload.results) ? payload.results : [];
          setSearchResults(
            results.map((item: any) => ({
              id: String(item.id ?? ''),
              slug: String(item.slug ?? ''),
              name: String(item.name ?? ''),
              brand: String(item.brand ?? ''),
              price: String(item.price ?? '')
            }))
          );
        })
        .catch((error) => {
          if (error.name === 'AbortError') return;
          console.error('Search error', error);
          if (!cancelled) {
            setSearchResults([]);
          }
        })
        .finally(() => {
          if (!cancelled) {
            setSearchLoading(false);
          }
        });
    }, 200);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [trimmedQuery, isSearchOpen]);

  useEffect(() => {
    if (!isSearchOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  useEffect(() => {
    if (!isSearchOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isSearchOpen]);

  useEffect(() => {
    setIsSearchOpen(false);
  }, [pathname]);

  const handleFavoritesClick = () => {
    if (status !== 'authenticated') {
      const callback = encodeURIComponent('/favoriler');
      router.push(`/giris?callbackUrl=${callback}`);
      return;
    }

    router.push('/favoriler');
  };

  const handleSearchOpen = () => {
    const existingQuery = searchParams.get('search') ?? '';
    setSearchTerm(existingQuery);
    setIsSearchOpen(true);
  };

  const handleSearchClose = () => {
    setIsSearchOpen(false);
    setSearchResults([]);
    setSearchLoading(false);
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = trimmedQuery;
    if (!normalized) {
      return;
    }

    router.push(`/vitrin?search=${encodeURIComponent(normalized)}`);
    setIsSearchOpen(false);
  };

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      setIsSearchOpen(false);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    searchInputRef.current?.focus();
    setSearchResults([]);
  };

  const searchAllHref = trimmedQuery ? `/vitrin?search=${encodeURIComponent(trimmedQuery)}` : '/vitrin';
  const hasMinimumQuery = trimmedQuery.length >= 2;

  return (
    <>
      <AnnouncementBar />
      <header className={styles.header}>
        <div className={styles.inner}>
          <Logo />
          <nav className={styles.nav} aria-label="Ana menü">
            {links.map((link) => {
              const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={isActive ? styles.linkActive : styles.link}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className={styles.actions}>
            <button className={styles.iconButton} aria-label="Arama" type="button" onClick={handleSearchOpen}>
              <FiSearch />
            </button>
            <button className={`${styles.iconButton} ${styles.favoriteButton}`} aria-label="Favoriler" type="button" onClick={handleFavoritesClick}>
              <FiHeart />
            </button>
            <AuthButtons />
          </div>
        </div>
      </header>
      {isSearchOpen ? (
        <div className={styles.searchOverlay} role="dialog" aria-modal="true" onClick={handleOverlayClick}>
          <div className={styles.searchPanel} role="document">
            <div className={styles.searchHeader}>
              <form className={styles.searchForm} onSubmit={handleSearchSubmit}>
                <FiSearch />
                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Ürün veya marka ara"
                  aria-label="Ürün veya marka ara"
                />
                {searchTerm ? (
                  <button
                    type="button"
                    className={styles.clearButton}
                    aria-label="Aramayı temizle"
                    onClick={handleClearSearch}
                  >
                    <CloseIcon width={16} height={16} />
                  </button>
                ) : null}
              </form>
              <button
                type="button"
                className={styles.closeButton}
                aria-label="Aramayı kapat"
                onClick={handleSearchClose}
              >
                <CloseIcon width={20} height={20} />
              </button>
            </div>
            <div className={styles.searchContent}>
              {hasMinimumQuery ? (
                searchLoading ? (
                  <p className={styles.searchHint}>Aranıyor…</p>
                ) : searchResults.length > 0 ? (
                  <>
                    <ul className={styles.searchResults}>
                      {searchResults.map((product) => (
                        <li key={product.id}>
                          <Link
                            href={`/vitrin/${product.slug}`}
                            className={styles.searchResult}
                            onClick={handleSearchClose}
                          >
                            <div className={styles.searchResultInfo}>
                              <span className={styles.searchResultBrand}>{product.brand}</span>
                              <span className={styles.searchResultName}>{product.name}</span>
                            </div>
                            <span className={styles.searchResultPrice}>{product.price}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <Link href={searchAllHref} className={styles.searchAllLink} onClick={handleSearchClose}>
                      Tüm sonuçları gör
                    </Link>
                  </>
                ) : (
                  <p className={styles.searchEmpty}>
                    "{trimmedQuery}" için sonuç bulunamadı. Başka bir terim deneyin.
                  </p>
                )
              ) : (
                <p className={styles.searchHint}>Aramaya başlamak için en az 2 karakter yazın.</p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}