'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { FilterBar, type Filter } from '@/components/FilterBar';
import { ProductCard } from '@/components/ProductCard';
import styles from './page.module.css';
import type { ProductDetail } from '@/lib/data';
import { FilterIcon, SortIcon } from '@/components/icons';
import { slugify } from '@/lib/slugify';

// --- Helper Functions ---
function parseFilter(searchParams: URLSearchParams): Filter {
  const search = searchParams.get('search') ?? undefined;
  const category = searchParams.get('category')?.split(',') ?? [];
  const brand = searchParams.get('brand')?.split(',') ?? [];
  const gender = (searchParams.get('gender')?.split(',') ?? []).map(g => g.toUpperCase());
  const size = searchParams.get('size')?.split(',') ?? [];
  const shoeSize = searchParams.get('shoeSize')?.split(',') ?? [];
  const color = searchParams.get('color')?.split(',') ?? [];
  const tag = searchParams.get('tag')?.split(',') ?? [];
  return {
    search: search?.trim() || undefined,
    category: category.filter(Boolean),
    brand: brand.filter(Boolean),
    gender: gender.filter(Boolean),
    size: size.filter(Boolean),
    shoeSize: shoeSize.filter(Boolean),
    color: color.filter(Boolean),
    tag: tag.filter(Boolean)
  };
}

function setUrl(filter: Filter) {
  const params = new URLSearchParams();
  if (filter.search) params.set('search', filter.search);
  if (filter.category?.length) params.set('category', filter.category.join(','));
  if (filter.brand?.length) params.set('brand', filter.brand.join(','));
  if (filter.gender?.length) params.set('gender', filter.gender.join(','));
  if (filter.size?.length) params.set('size', filter.size.join(','));
  if (filter.shoeSize?.length) params.set('shoeSize', filter.shoeSize.join(','));
  if (filter.color?.length) params.set('color', filter.color.join(','));
  if (filter.tag?.length) params.set('tag', filter.tag.join(','));
  const query = params.toString();
  const nextUrl = query ? `/vitrin?${query}` : '/vitrin';
  window.history.replaceState(null, '', nextUrl);
}

type SortKey = 'default' | 'price-asc' | 'price-desc' | 'newest';

function applyFilterAndSort(products: ProductDetail[], filter: Filter, sortBy: SortKey) {
  const filtered = products.filter((product) => {
    if (filter.tag?.length) {
      const tags = product.tags ?? [];
      if (!filter.tag.some(t => tags.includes(t as any))) return false;
    }
    if (filter.gender?.length) {
      const selected = filter.gender.map(g => g.toUpperCase());
      const raw = (product.gender ?? '').toUpperCase();
      const prodGender = raw || (selected.includes('UNISEX') ? 'UNISEX' : '');
      if (!prodGender || !selected.includes(prodGender)) return false;
    }
    if (filter.category?.length && !filter.category.includes(product.category)) return false;
    if (filter.brand?.length && !filter.brand.includes(slugify(product.brand))) return false;
    
    const selectedSizes = [...(filter.size ?? []), ...(filter.shoeSize ?? [])];
    if (selectedSizes.length && !product.sizes.some(s => selectedSizes.includes(s))) return false;
    if (filter.color?.length && !product.colors.some(c => filter.color?.includes(c))) return false;

    if (filter.search) {
      const term = filter.search.toLowerCase();
      const searchable = `${product.brand} ${product.name}`.toLowerCase();
      if (!searchable.includes(term)) return false;
    }
    return true;
  });

  switch (sortBy) {
    case 'price-asc':
      return filtered.sort((a, b) => a.priceValue - b.priceValue);
    case 'price-desc':
      return filtered.sort((a, b) => b.priceValue - a.priceValue);
    case 'newest':
      return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    default:
      // Önerilen sıralama: Etiket ağırlıkları (HYPE > ONE_CIKAN > YENI > INDIRIMDE) + yakın tarihli ürünlere hafif boost
      // Eşitliklerde küçük bir deterministik tie-breaker uygula (slug tabanlı)
      const tagWeight = (p: ProductDetail) => {
        let w = 0;
        const tags = p.tags ?? [];
        if (tags.includes('HYPE')) w += 80;
        if (tags.includes('ONE_CIKAN')) w += 60;
        if (tags.includes('YENI')) w += 30;
        if (tags.includes('INDIRIMDE')) w += 60;
        return w;
      };
      const recencyBoost = (p: ProductDetail) => {
        const days = Math.max(0, (Date.now() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24));
        // 0 günde +20, 30 günde 0'a yaklaşan lineer bir azalış
        return Math.max(0, 20 - days * 0.7);
      };
      const favoriteBoost = (p: ProductDetail) => {
        const c = p.favoriteCount ?? 0;
        // Logaritmik ölçek: her ek favori daha az ek katkı yapsın
        return Math.log1p(c) * 50; // katsayı istenirse ayarlanabilir
      };
      const tieBreaker = (slug: string) => {
        // Basit deterministic hash
        let h = 0;
        for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) | 0;
        return (h >>> 0) % 1000; // 0..999
      };
      return filtered.sort((a, b) => {
        const sa = tagWeight(a) + recencyBoost(a) + favoriteBoost(a);
        const sb = tagWeight(b) + recencyBoost(b) + favoriteBoost(b);
        if (sb !== sa) return sb - sa;
        // İkinci kriter: daha yeni öne gelsin
        const d = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (d !== 0) return d;
        // Son çare: slug tabanlı deterministic tie-breaker
        return tieBreaker(b.slug) - tieBreaker(a.slug);
      });
  }
}

// --- Main Component ---
export function VitrinClient({ products }: { products: ProductDetail[] }) {
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState<Filter>(() => parseFilter(searchParams));
  const [sortBy, setSortBy] = useState<SortKey>('default');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);

  // Unique categories from products for the pill list
  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))).sort(),
    [products]
  );

  useEffect(() => {
    setFilter(parseFilter(searchParams));
  }, [searchParams]);

  const finalProducts = useMemo(() => applyFilterAndSort(products, filter, sortBy), [products, filter, sortBy]);

  const handleFilterChange = (next: Filter) => {
    setFilter(next);
    setUrl(next);
  };

  const handleSortChange = (key: SortKey) => {
    setSortBy(key);
    setIsSortMenuOpen(false);
  };

  const handleCategoryToggle = (category: string) => {
    const current = filter.category ?? [];
    // Single-select behavior: if clicked category is already selected, clear; otherwise select only that category
    const nextCategories = current.includes(category) ? [] : [category];
    const next = { ...filter, category: nextCategories };
    setFilter(next);
    setUrl(next);
  };

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: 'default', label: 'Önerilen Sıralama' },
    { key: 'newest', label: 'En Yeni' },
    { key: 'price-asc', label: 'Fiyata Göre (Artan)' },
    { key: 'price-desc', label: 'Fiyata Göre (Azalan)' }
  ];

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
            <h1>Vitrin</h1>
            <p>
              Newilano vitrini ile sezonun favori sneaker, giyim ve aksesuar ürünlerini keşfedin. Filtreleri
              kullanarak aradığınız stile hızla ulaşın.
            </p>
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <div className={styles.categoriesWrapper}>
          <div className="container">
            <div className={styles.categoriesScroll}>
              {categories.map((cat) => {
                const active = filter.category?.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    className={`${styles.categoryPill} ${active ? styles.categoryActive : ''}`}
                    onClick={() => handleCategoryToggle(cat)}
                    aria-pressed={active}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="container">
        <section>
          <div className={styles.resultsHeader}>
            <h2 className={styles.resultsTitle}>{finalProducts.length} Ürün</h2>
            <div className={styles.headerActions}>
              <div className={styles.sortWrapper}>
                <button type="button" className={styles.headerButton} onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}>
                  <SortIcon width={18} height={18} />
                  <span>Sırala</span>
                </button>
                {isSortMenuOpen && (
                  <div className={styles.sortMenu}>
                    {sortOptions.map((opt) => (
                      <button key={opt.key} onClick={() => handleSortChange(opt.key)} className={sortBy === opt.key ? styles.sortActive : ''}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button type="button" className={styles.headerButton} onClick={() => setIsFilterOpen(true)}>
                <FilterIcon width={18} height={18} />
                <span>Filtrele</span>
              </button>
            </div>
          </div>
          <div className={styles.grid}>
            {finalProducts.map((product) => (
              <ProductCard key={product.id} product={product} showFavoriteButton={true} showFavoriteLabel={false} />
            ))}
          </div>
        </section>
      </div>

      {isFilterOpen && (
        <FilterBar
          products={products}
          onFilterChange={handleFilterChange}
          initialFilter={filter}
          onClose={() => setIsFilterOpen(false)}
        />
      )}
    </main>
  );
}
