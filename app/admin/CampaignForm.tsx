'use client';

import { ChangeEvent, FormEvent, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

const MAX_IMAGE_SIZE = 4 * 1024 * 1024; // 4MB

export function AdminCampaignForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  // Product picker state
  type SearchItem = { id: string; slug: string; name: string; brand: string; price: string; image?: string };
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SearchItem[]>([]);

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setImageData(null);
      setImageName(null);
      setImageError(null);
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setImageError('Kampanya görseli 4MB sınırını aşmamalı.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        setImageData(result);
        setImageName(file.name);
        setImageError(null);
      }
    };
    reader.onerror = () => {
      setImageError('Görsel okunamadı.');
      setImageData(null);
      setImageName(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formEl = event.currentTarget;
    const formData = new FormData(formEl);
    const title = (formData.get('title') as string)?.trim();
    const description = (formData.get('description') as string)?.trim();
    const longDescription = (formData.get('longDescription') as string)?.trim();
    const ctaLabel = (formData.get('ctaLabel') as string)?.trim();
    const ctaHref = (formData.get('ctaHref') as string)?.trim();
    const endDate = (formData.get('endDate') as string)?.trim();

    if (!title) {
      setMessage('Başlık gereklidir.');
      return;
    }

    if (!description) {
      setMessage('Açıklama gereklidir.');
      return;
    }

    if (!imageData) {
      setMessage('Lütfen bir kampanya görseli yükleyin.');
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          longDescription,
          imageData,
          ctaLabel,
          ctaHref,
          endDate,
          productSlugs: selectedProducts.map((p) => p.slug),
          productIds: selectedProducts.map((p) => p.id)
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({} as any));
        setMessage((payload as any).message ?? 'Kampanya oluşturulamadı.');
        return;
      }

      formEl.reset();
      setImageData(null);
      setImageName(null);
      setImageError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setMessage('Kampanya başarıyla eklendi.');
      router.refresh();
    } catch (error) {
      console.error('Campaign create error', error);
      setMessage('Kampanya oluşturulamadı.');
    } finally {
      setSubmitting(false);
    }
  };

  // --- Product search helpers ---
  const handleSearchChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await fetch(`/api/products/search?q=${encodeURIComponent(q.trim())}`);
      if (res.ok) {
        const data = (await res.json()) as { results: SearchItem[] };
        // Filter out already selected
        const selectedIds = new Set(selectedProducts.map((p) => p.id));
        setSearchResults((data.results || []).filter((r) => !selectedIds.has(r.id)));
      }
    } catch {}
  };

  const addProduct = (item: SearchItem) => {
    if (selectedProducts.find((p) => p.id === item.id)) return;
    setSelectedProducts((prev) => [...prev, item]);
    setSearchResults((prev) => prev.filter((p) => p.id !== item.id));
  };

  const removeProduct = (id: string) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <form className={styles.adminForm} onSubmit={handleSubmit}>
      <label>
        Kampanya Başlığı
        <input name="title" type="text" placeholder="Örn. Yaz İndirimi" required disabled={submitting} />
      </label>
      {/* Product Picker */}
      <div style={{ display: 'grid', gap: '0.5rem' }}>
        <label>
          Ürün Ara (isim/marka)
          <input
            type="text"
            placeholder="Örn. Samba, Air Max..."
            value={searchQuery}
            onChange={handleSearchChange}
            disabled={submitting}
          />
        </label>
        {searchResults.length > 0 ? (
          <div style={{ display: 'grid', gap: '0.25rem', maxHeight: 240, overflow: 'auto', border: '1px solid #e5e7eb', borderRadius: 8, padding: '0.5rem' }}>
            {searchResults.map((r) => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                <span style={{ fontSize: 12, color: '#374151' }}>{r.brand} • {r.name} • {r.price}</span>
                <button type="button" onClick={() => addProduct(r)} disabled={submitting}>Ekle</button>
              </div>
            ))}
          </div>
        ) : null}
        {selectedProducts.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {selectedProducts.map((p) => (
              <span key={p.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 8px', border: '1px solid #e5e7eb', borderRadius: 999 }}>
                <span style={{ fontSize: 12 }}>{p.brand} • {p.name}</span>
                <button type="button" onClick={() => removeProduct(p.id)} aria-label="Kaldır" style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>✕</button>
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <label>
        Açıklama
        <textarea
          name="description"
          rows={3}
          placeholder="Kampanyaya dair kısa bir özet yazın."
          required
          disabled={submitting}
        />
      </label>
      <label>
        Detaylı Açıklama (uzun)
        <textarea
          name="longDescription"
          rows={6}
          placeholder="Kampanya detaylarını buraya girin. Satır sonları korunur."
          disabled={submitting}
        />
      </label>
      <div className={styles.uploadField}>
        <button
          type="button"
          className={styles.uploadButton}
          onClick={() => fileInputRef.current?.click()}
          disabled={submitting}
        >
          Görsel Yükle
        </button>
        <span className={styles.uploadText}>
          {imageName ? imageName : 'PNG/JPG önerilir. Önerilen boyut: 1200x600, maksimum 4MB.'}
        </span>
        <input
          ref={fileInputRef}
          className={styles.hiddenInput}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={submitting}
        />
      </div>
      {imageError ? <p className={styles.adminFormMessage}>{imageError}</p> : null}
      {imageData ? (
        <div className={styles.previewBox}>
          <img src={imageData} alt="Kampanya önizleme" />
        </div>
      ) : null}
      <label className={styles.adminFormInline}>
        <span>
          CTA Metni (opsiyonel)
          <input name="ctaLabel" type="text" placeholder="Detayları Gör" disabled={submitting} />
        </span>
        <span>
          CTA Linki (opsiyonel)
          <input name="ctaHref" type="url" placeholder="https://" disabled={submitting} />
        </span>
      </label>
      <label>
        Bitiş Tarihi (opsiyonel)
        <input name="endDate" type="date" disabled={submitting} />
      </label>
      <button type="submit" disabled={submitting}>
        {submitting ? 'Kaydediliyor…' : 'Kampanyayı Kaydet'}
      </button>
      {message ? <p className={styles.adminFormMessage}>{message}</p> : null}
    </form>
  );
}
