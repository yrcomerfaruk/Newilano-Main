'use client';

import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import styles from './FilterBar.module.css';
import type { ProductDetail } from '@/lib/data';
import { CloseIcon } from './icons';
import { slugify } from '@/lib/slugify';

export type Filter = {
  gender?: string[];
  category?: string[];
  brand?: string[];
  size?: string[];
  shoeSize?: string[];
  color?: string[];
  search?: string;
  tag?: string[]; // product groups: HYPE, ONE_CIKAN, YENI, INDIRIMDE
};

type Props = {
  products: ProductDetail[];
  onFilterChange: (filter: Filter) => void;
  initialFilter?: Filter;
  onClose: () => void;
};

export function FilterBar({ products, onFilterChange, initialFilter, onClose }: Props) {
  const categories = useMemo(
    () => Array.from(new Set(products.map((product) => product.category))).sort(),
    [products]
  );
  const brands = useMemo(() => {
    const brandMap = new Map<string, string>();
    products.forEach(p => {
        if (!brandMap.has(p.brand)) {
            brandMap.set(p.brand, slugify(p.brand));
        }
    });
    return Array.from(brandMap.entries()).map(([name, slug]) => ({ name, slug })).sort((a, b) => a.name.localeCompare(b.name));
  }, [products]);
  const sizes = useMemo(
    () => Array.from(new Set(products.flatMap((product) => product.sizes))).sort(),
    [products]
  );
  const shoeSizes = useMemo(
    () => sizes.filter((size) => !isNaN(Number(size))).sort((a, b) => Number(a) - Number(b)),
    [sizes]
  );
  const clothingSizes = useMemo(
    () => sizes.filter((size) => isNaN(Number(size))).sort(),
    [sizes]
  );
  const colors = useMemo(
    () => Array.from(new Set(products.flatMap((product) => product.colors))).sort(),
    [products]
  );
  const genders = useMemo(
    () => {
      const set = new Set<string>();
      for (const p of products) {
        if (p.gender) set.add(p.gender.toUpperCase());
      }
      // Yalnızca veride bulunan cinsiyetleri göster (UNISEX varsa eklenir)
      return Array.from(set).sort();
    },
    [products]
  );
  const genderLabel = (g: string) => {
    switch (g) {
      case 'ERKEK':
        return 'Erkek';
      case 'KADIN':
        return 'Kadın';
      case 'UNISEX':
        return 'Unisex';
      default:
        return g;
    }
  };
  const [filter, setFilter] = useState<Filter>(initialFilter ?? { gender: [], category: [], brand: [], size: [], shoeSize: [], color: [], tag: [] });

  useEffect(() => {
    setFilter(initialFilter ?? { gender: [], category: [], brand: [], size: [], shoeSize: [], color: [], tag: [] });
  }, [initialFilter]);

  const handleListToggle = (key: 'gender' | 'category' | 'brand' | 'size' | 'shoeSize' | 'color' | 'tag', value: string) => {
    const normalizedValue = key === 'gender' ? value.toUpperCase() : value;
    const currentValues = filter[key] ?? [];
    const newValues = currentValues.includes(normalizedValue)
      ? currentValues.filter((item) => item !== normalizedValue)
      : [...currentValues, normalizedValue];
    
    const nextFilter = { ...filter, [key]: newValues };
    setFilter(nextFilter);
    onFilterChange(nextFilter);
  };

  const handleSearchChange = (value: string) => {
    const nextFilter = { ...filter, search: value || undefined };
    setFilter(nextFilter);
    onFilterChange(nextFilter);
  };

  const clearFilters = () => {
    const nextFilter = { gender: [], category: [], brand: [], size: [], shoeSize: [], color: [], tag: [], search: undefined };
    setFilter(nextFilter);
    onFilterChange(nextFilter);
  };

  const handlePanelClick = (e: MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.panel} onClick={handlePanelClick}>
        <div className={styles.panelHeader}>
          <h3>Filtrele</h3>
          <button type="button" onClick={onClose} className={styles.closeButton} aria-label="Filtreyi kapat">
            <CloseIcon width={20} height={20} />
          </button>
        </div>

        <div className={styles.actions}>
          <button type="button" onClick={clearFilters} className={styles.clearButton}>
            Filtreleri Temizle
          </button>
        </div>

        <div className={styles.scrollArea}>
          <div className={styles.group}>
            <label className={styles.label} htmlFor="search-input">
              Arama
            </label>
            <input
              id="search-input"
              type="search"
              value={filter.search ?? ''}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Ürün veya marka ara"
            />
          </div>

          {genders.length > 0 && (
            <div className={styles.group}>
              <span className={styles.label}>Cinsiyet</span>
              <div className={styles.checkboxList}>
                {genders.map((gender) => (
                  <label key={gender} className={styles.checkboxItem}>
                    <input
                      type="checkbox"
                      checked={filter.gender?.some(g => g.toUpperCase() === gender.toUpperCase()) ?? false}
                      onChange={() => handleListToggle('gender', gender)}
                    />
                    <span className={styles.checkboxLabel}>{genderLabel(gender)}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className={styles.group}>
            <span className={styles.label}>Kategori</span>
            <div className={styles.checkboxList}>
              {categories.map((category) => (
                <label key={category} className={styles.checkboxItem}>
                  <input
                    type="checkbox"
                    checked={filter.category?.includes(category) ?? false}
                    onChange={() => handleListToggle('category', category)}
                  />
                  <span className={styles.checkboxLabel}>{category}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.group}>
            <span className={styles.label}>Marka</span>
            <div className={styles.checkboxList}>
              {brands.map((brand) => (
                <label key={brand.slug} className={styles.checkboxItem}>
                  <input
                    type="checkbox"
                    checked={filter.brand?.includes(brand.slug) ?? false}
                    onChange={() => handleListToggle('brand', brand.slug)}
                  />
                  <span className={styles.checkboxLabel}>{brand.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.group}>
            <span className={styles.label}>Renk</span>
            <div className={styles.checkboxList}>
              {colors.map((color) => (
                <label key={color} className={styles.checkboxItem}>
                  <input
                    type="checkbox"
                    checked={filter.color?.includes(color) ?? false}
                    onChange={() => handleListToggle('color', color)}
                  />
                  <span className={styles.checkboxLabel}>{color}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.group}>
            <span className={styles.label}>Beden</span>
            <div className={styles.checkboxList}>
              {clothingSizes.map((size) => (
                <label key={size} className={styles.checkboxItem}>
                  <input
                    type="checkbox"
                    checked={filter.size?.includes(size) ?? false}
                    onChange={() => handleListToggle('size', size)}
                  />
                  <span className={styles.checkboxLabel}>{size}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.group}>
            <span className={styles.label}>Ayakkabı Numarası</span>
            <div className={styles.checkboxList}>
              {shoeSizes.map((size) => (
                <label key={size} className={styles.checkboxItem}>
                  <input
                    type="checkbox"
                    checked={filter.shoeSize?.includes(size) ?? false}
                    onChange={() => handleListToggle('shoeSize', size)}
                  />
                  <span className={styles.checkboxLabel}>{size}</span>
                </label>
              ))}
            </div>
          </div>
          {/* Product Groups moved to bottom */}
          <div className={styles.group}>
            <span className={styles.label}>Ürün Grupları</span>
            <div className={styles.checkboxList}>
              {['HYPE','ONE_CIKAN','YENI','INDIRIMDE'].map((t) => (
                <label key={t} className={styles.checkboxItem}>
                  <input
                    type="checkbox"
                    checked={filter.tag?.includes(t) ?? false}
                    onChange={() => handleListToggle('tag', t)}
                  />
                  <span className={styles.checkboxLabel}>
                    {t === 'HYPE' ? 'Hype' : t === 'ONE_CIKAN' ? 'Öne Çıkan' : t === 'YENI' ? 'Yeni' : 'İndirimde'}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
