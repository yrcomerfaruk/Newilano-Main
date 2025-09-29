'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from '@/app/admin/page.module.css';
import { AdminProductList } from '@/app/admin/ProductList';

export type ProductListItem = {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: string;
  image: string;
  slug: string;
};

export function ListClient({ initialProducts }: { initialProducts: ProductListItem[] }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProductListItem[]>(initialProducts);
  const [loading, setLoading] = useState(false);

  // Debounce query
  const debounced = useMemo(() => query.trim(), [query]);

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    async function run() {
      const q = debounced;
      if (!q) {
        setResults(initialProducts);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(q)}`, {
          method: 'GET',
          signal: controller.signal,
        });
        if (!res.ok) throw new Error('Search failed');
        const data: { results: Array<{ id: string; slug: string; name: string; brand: string; price: string; image?: string; category?: string }> } = await res.json();
        if (ignore) return;
        const mapped: ProductListItem[] = data.results.map((p) => ({
          id: p.id,
          name: p.name,
          brand: p.brand,
          category: p.category ?? '',
          price: p.price,
          image: p.image ?? '',
          slug: p.slug,
        }));
        setResults(mapped);
      } catch (e) {
        if (ignore) return;
        console.error('Search error', e);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    const t = setTimeout(run, 300);
    return () => {
      ignore = true;
      controller.abort();
      clearTimeout(t);
    };
  }, [debounced, initialProducts]);

  return (
    <section>
      <h2>Ürünleri Gör</h2>
      <div className={styles.adminForm} style={{ maxWidth: 520 }}>
        <label>
          Arama
          <input
            type="text"
            placeholder="Ürün adı veya marka ara"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        {loading ? <p className={styles.adminFormMessage}>Aranıyor…</p> : null}
      </div>
      <AdminProductList products={results} />
    </section>
  );
}
