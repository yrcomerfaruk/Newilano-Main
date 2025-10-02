'use client';

import { useState, useMemo, FormEvent, useRef, useEffect } from 'react';
import styles from '@/app/admin/page.module.css';
import { useRouter } from 'next/navigation';
import type { BrandSummary } from '@/lib/data';

type ImportPayload = {
  name: string;
  description: string;
  price: number | null;
  currency: string;
  imageData: string | null;
  galleryData: string[];
  productUrl: string;
};

function normalizeUrl(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('/')) return trimmed;
  return `https://${trimmed}`;
}

function parseList(input: string) {
  return input
    .split(/[،,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function ImportProductClient({ brands }: { brands: BrandSummary[] }) {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [data, setData] = useState<ImportPayload | null>(null);

  // Editable fields for creation
  const sortedBrands = useMemo(() => brands.slice().sort((a, b) => a.name.localeCompare(b.name)), [brands]);
  const [name, setName] = useState('');
  const [brandId, setBrandId] = useState(sortedBrands[0]?.id ?? '');
  const [gender, setGender] = useState<'ERKEK' | 'KADIN' | 'UNISEX'>('UNISEX');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('TRY');
  const [description, setDescription] = useState('');
  const [sizes, setSizes] = useState('');
  const [colors, setColors] = useState('');
  const [features, setFeatures] = useState('');
  const [discoverTags, setDiscoverTags] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [imageData, setImageData] = useState<string | null>(null);
  const [galleryData, setGalleryData] = useState<string[]>([]);
  const dragFrom = useRef<number | null>(null);

  const TAG_OPTIONS = useMemo(() => ['HYPE', 'ONE_CIKAN', 'YENI', 'INDIRIMDE'] as const, []);

  // Remember user's previously used defaults
  const DEFAULTS_KEY = 'admin_import_defaults_v1';
  const [savedDefaults, setSavedDefaults] = useState<{
    gender?: typeof gender;
    category?: string;
    sizes?: string;
    colors?: string;
    features?: string;
    currency?: string;
    brandId?: string;
  }>({});
  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(DEFAULTS_KEY) : null;
      if (!raw) return;
      const d = JSON.parse(raw || '{}') as Partial<{
        gender: typeof gender;
        category: string;
        sizes: string;
        colors: string;
        features: string;
        currency: string;
        brandId: string;
      }>;
      // Keep a copy to show in UI
      setSavedDefaults(d);
      // Apply defaults only to empty fields, regardless of data state, to avoid overriding scraped values
      if (!category) setCategory(d.category ?? '');
      if (!sizes) setSizes(d.sizes ?? '');
      if (!colors) setColors(d.colors ?? '');
      if (!features) setFeatures(d.features ?? '');
      if (!currency && d.currency) setCurrency((d.currency || 'TRY').toUpperCase());
      if (gender === 'UNISEX' && d.gender) setGender(d.gender);
      if (!brandId && d.brandId) setBrandId(d.brandId);
    } catch {
      // ignore
    }
  }, [data, category, sizes, colors, features, currency, gender, brandId]);

  // Persist defaults whenever user edits these fields
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const toSave = {
        gender,
        category,
        sizes,
        colors,
        features,
        currency: (currency || 'TRY').toUpperCase(),
        brandId
      };
      localStorage.setItem(DEFAULTS_KEY, JSON.stringify(toSave));
      setSavedDefaults(toSave);
    } catch {
      // ignore
    }
  }, [gender, category, sizes, colors, features, currency, brandId]);

  const applySavedDefaults = () => {
    const d = savedDefaults || {};
    if (d.category) setCategory((v) => v || d.category!);
    if (d.sizes) setSizes((v) => v || d.sizes!);
    if (d.colors) setColors((v) => v || d.colors!);
    if (d.features) setFeatures((v) => v || d.features!);
    if (d.currency) setCurrency((v) => v || (d.currency as string));
    if (gender === 'UNISEX' && d.gender) setGender(d.gender);
    if (!brandId && d.brandId) setBrandId(d.brandId);
    setMessage('Varsayılanlar uygulandı.');
  };

  // Client-side helper: fetch an image URL and convert to base64 (limit ~4MB)
  const fetchToBase64 = async (urlStr: string): Promise<string | null> => {
    try {
      const res = await fetch(urlStr, { cache: 'no-store' });
      if (!res.ok) return null;
      const blob = await res.blob();
      const MAX = 4 * 1024 * 1024; // 4MB
      if (blob.size > MAX) return null;
      return await new Promise<string | null>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : null);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  };

  // DnD reordering
  const handleDragStart = (index: number) => (e: React.DragEvent<HTMLDivElement>) => {
    dragFrom.current = index;
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  const handleDrop = (toIndex: number) => (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const fromIndex = dragFrom.current;
    dragFrom.current = null;
    if (fromIndex == null || fromIndex === toIndex) return;
    setGalleryData((prev) => {
      const next = prev.slice();
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const handleDeleteGallery = (index: number) => {
    setGalleryData((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSetMainFromGallery = async (index: number) => {
    const item = galleryData[index];
    if (!item) return;
    if (item.startsWith('data:image/')) {
      setImageData(item);
      setMessage(null);
      return;
    }
    setMessage('Ana görsel hazırlanıyor…');
    const converted = await fetchToBase64(item);
    if (converted) {
      setImageData(converted);
      setMessage(null);
    } else {
      setMessage('Seçilen görsel base64\'e çevrilemedi (boyut >4MB veya engellendi). Lütfen farklı bir görsel deneyin.');
    }
  };

  const handleImport = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const normalized = normalizeUrl(url);
    if (!normalized) {
      setMessage('Lütfen bir ürün linki girin.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/admin/products/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalized })
      });
      if (!res.ok) {
        const p = await res.json().catch(() => ({}));
        setMessage(p.message ?? 'İçe aktarma başarısız.');
        return;
      }
      const payload = (await res.json()).data as ImportPayload;
      setData(payload);
      // Prefill fields
      setName(payload.name || '');
      setDescription(payload.description || '');
      setPrice(payload.price != null ? String(payload.price) : '');
      setCurrency(payload.currency || 'TRY');
      setImageData(payload.imageData ?? null);
      setGalleryData(payload.galleryData ?? []);
    } catch (err) {
      setMessage('İçe aktarma başarısız.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const priceValue = Number(String(price).replace(',', '.'));
    if (!name.trim() || !brandId || !category.trim() || !imageData || !description.trim()) {
      setMessage('Zorunlu alanları doldurun (Ad, Marka, Kategori, Görsel, Açıklama).');
      return;
    }
    if (!Number.isFinite(priceValue) || priceValue <= 0) {
      setMessage('Geçerli bir fiyat girin.');
      return;
    }

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          brandId,
          gender,
          category: category.trim(),
          price: priceValue,
          currency: (currency || 'TRY').toUpperCase(),
          imageData,
          description: description.trim(),
          galleryData,
          sizes: parseList(sizes),
          colors: parseList(colors),
          features: parseList(features),
          productUrl: data?.productUrl ?? normalizeUrl(url),
          tags,
          discoverTags: parseList(discoverTags)
        })
      });
      if (!res.ok) {
        const p = await res.json().catch(() => ({}));
        setMessage(p.message ?? 'Ürün oluşturulamadı.');
        return;
      }
      setMessage('Ürün başarıyla yüklendi. Bu sayfada kalabilirsiniz.');
    } catch (err) {
      setMessage('Ürün oluşturulamadı.');
    }
  };

  const handleResetImport = () => {
    // Clear all fields to start a fresh import
    setUrl('');
    setData(null);
    setName('');
    setBrandId(sortedBrands[0]?.id ?? '');
    setGender('UNISEX');
    setCategory('');
    setPrice('');
    setCurrency('TRY');
    setDescription('');
    setSizes('');
    setColors('');
    setFeatures('');
    setDiscoverTags('');
    setTags([]);
    setImageData(null);
    setGalleryData([]);
  };

  return (
    <section>
      <h2>Ürün İçe Aktar</h2>
      <form className={styles.adminForm} onSubmit={handleImport}>
        <label>
          Ürün Linki
          <input
            type="url"
            placeholder="https://..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </label>
        <button type="submit" disabled={loading}>{loading ? 'Alınıyor…' : 'Bilgileri Getir'}</button>
        {message ? (
          <div className={styles.adminFormMessage} role="status" aria-live="polite">
            {message}
            {message.includes('Ürün başarıyla yüklendi') ? (
              <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                <button type="button" className={styles.uploadButtonSecondary} onClick={handleResetImport}>
                  Yeni ürün içe aktar
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
        {/* Defaults helper panel */}
        <div className={styles.adminFormMessage} style={{ marginTop: 8 }}>
          <strong>Varsayılanlar:</strong>
          <div style={{ marginTop: 4, fontSize: 12, opacity: 0.85 }}>
            {savedDefaults.category ? `Kategori: ${savedDefaults.category} ` : ''}
            {savedDefaults.sizes ? ` | Bedenler: ${savedDefaults.sizes} ` : ''}
            {savedDefaults.colors ? ` | Renkler: ${savedDefaults.colors} ` : ''}
            {savedDefaults.features ? ` | Özellikler: ${savedDefaults.features} ` : ''}
            {savedDefaults.currency ? ` | Para Birimi: ${savedDefaults.currency}` : ''}
          </div>
          <div style={{ marginTop: 6 }}>
            <button type="button" className={styles.uploadButtonSecondary} onClick={applySavedDefaults}>
              Varsayılanları uygula
            </button>
          </div>
        </div>
      </form>

      {data ? (
        <form className={styles.adminForm} onSubmit={handleCreate}>
          <h3>Alanları Kontrol Et ve Oluştur</h3>
          <label>
            Ürün Adı
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label>
            Marka
            <select value={brandId} onChange={(e) => setBrandId(e.target.value)} required>
              {sortedBrands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </label>
          <label>
            Kategori
            <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} required />
          </label>
          <label>
            Cinsiyet
            <select value={gender} onChange={(e) => setGender(e.target.value as any)}>
              <option value="UNISEX">Unisex</option>
              <option value="KADIN">Kadın</option>
              <option value="ERKEK">Erkek</option>
            </select>
          </label>
          <label className={styles.adminFormInline}>
            <span>
              Fiyat
              <input type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </span>
            <span>
              Para Birimi
              <input type="text" value={currency} onChange={(e) => setCurrency(e.target.value)} />
            </span>
          </label>
          {data && !price && (
            <p className={styles.adminFormMessage} style={{ marginTop: 6 }}>Bu üründe fiyat otomatik bulunamadı. Lütfen manuel girin.</p>
          )}

          <label>
            Açıklama
            <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} required />
          </label>

          <label>
            Bedenler (virgülle)
            <input type="text" value={sizes} onChange={(e) => setSizes(e.target.value)} />
          </label>
          <label>
            Renkler (virgülle)
            <input type="text" value={colors} onChange={(e) => setColors(e.target.value)} />
          </label>
          <label>
            Öne çıkan özellikler (virgülle)
            <input type="text" value={features} onChange={(e) => setFeatures(e.target.value)} />
          </label>

          <fieldset>
            <legend>Ürün Etiketleri</legend>
            <div className={styles.adminFormInline}>
              {TAG_OPTIONS.map((t) => (
                <label key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <input
                    type="checkbox"
                    checked={tags.includes(t)}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setTags((prev) => {
                        const set = new Set(prev);
                        if (checked) set.add(t); else set.delete(t);
                        return TAG_OPTIONS.filter((x) => set.has(x));
                      });
                    }}
                  />
                  <span>{t === 'HYPE' ? 'Hype' : t === 'ONE_CIKAN' ? 'Öne Çıkan' : t === 'YENI' ? 'Yeni' : 'İndirimde'}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label>
            Keşfet Etiketleri (virgülle)
            <input type="text" value={discoverTags} onChange={(e) => setDiscoverTags(e.target.value)} />
          </label>

          {imageData ? (
            <div className={styles.previewBox}>
              <img src={imageData} alt="Ürün görseli" />
            </div>
          ) : (
            <p className={styles.adminFormMessage}>Ana görsel bulunamadı. Ürün ekleme sayfasından görsel seçmeniz gerekebilir.</p>
          )}

          {galleryData.length > 0 ? (
            <div className={styles.previewGrid}>
              {galleryData.map((g, i) => (
                <div
                  key={i}
                  className={styles.previewThumb}
                  style={{ position: 'relative', cursor: 'move' }}
                  draggable
                  onDragStart={handleDragStart(i)}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop(i)}
                >
                  <img src={g} alt={`Galeri ${i + 1}`} style={{ display: 'block', width: '100%', height: 'auto', userSelect: 'none', pointerEvents: 'none' }} />
                  <div style={{ display: 'flex', gap: 6, marginTop: 6, position: 'relative', zIndex: 1 }}>
                    <button
                      type="button"
                      className={styles.uploadButtonSecondary}
                      style={{ padding: '4px 8px', fontSize: 12, lineHeight: '16px' }}
                      onClick={() => handleSetMainFromGallery(i)}
                    >
                      Ana yap
                    </button>
                    <button
                      type="button"
                      className={styles.uploadButtonSecondary}
                      style={{ padding: '4px 8px', fontSize: 12, lineHeight: '16px' }}
                      onClick={() => handleDeleteGallery(i)}
                    >
                      Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          <button type="submit">Ürünü Oluştur</button>
        </form>
      ) : null}
    </section>
  );
}
