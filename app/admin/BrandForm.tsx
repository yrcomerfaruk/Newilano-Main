'use client';

import { ChangeEvent, FormEvent, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export function AdminBrandForm() {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [logoData, setLogoData] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [logoName, setLogoName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  const handleLogoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      setLogoData(null);
      setLogoName(null);
      setLogoError(null);
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setLogoError('Logo boyutu 2MB sınırını aşmamalı.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        setLogoData(result);
        setLogoName(file.name);
        setLogoError(null);
      }
    };
    reader.onerror = () => {
      setLogoError('Logo dosyası okunamadı.');
      setLogoData(null);
      setLogoName(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = (formData.get('name') as string)?.trim();
    const description = (formData.get('description') as string)?.trim();
    const categoriesInput = (formData.get('categories') as string)?.trim();
    const categories = categoriesInput
      ? categoriesInput.split(',').map((category) => category.trim()).filter(Boolean)
      : [];

    if (!name) {
      setMessage('Marka adı boş olamaz.');
      return;
    }

    if (!logoData) {
      setMessage('Lütfen bir logo dosyası yükleyin.');
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, logoData, categories })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        setMessage(payload.message ?? 'Marka oluşturulamadı.');
        return;
      }

      event.currentTarget.reset();
      setMessage('Marka başarıyla eklendi.');
      setLogoData(null);
      setLogoName(null);
      setLogoError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      router.refresh();
    } catch (error) {
      console.error('Brand create error', error);
      setMessage('Marka oluşturulamadı.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className={styles.adminForm} onSubmit={handleSubmit}>
      <label>
        Marka Adı
        <input name="name" type="text" placeholder="Örn. Nike" required disabled={submitting} />
      </label>
      <label>
        Logo Dosyası
        <div className={styles.uploadField}>
          <button
            type="button"
            className={styles.uploadButton}
            onClick={() => fileInputRef.current?.click()}
            disabled={submitting}
          >
            Logo Seç
          </button>
          <span className={styles.uploadText}>
            {logoName ? logoName : 'Şeffaf PNG/SVG önerilir. Önerilen boyut: 400x200, maksimum 2MB.'}
          </span>
          <input
            ref={fileInputRef}
            className={styles.hiddenInput}
            name="logo-file"
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            disabled={submitting}
          />
        </div>
      </label>
      {logoError ? <p className={styles.adminFormMessage}>{logoError}</p> : null}
      {logoData ? (
        <div className={styles.previewBox}>
          <img src={logoData} alt="Logo önizleme" />
        </div>
      ) : null}
      <label>
        Kategoriler (virgülle ayır)
        <input name="categories" type="text" placeholder="Sneaker, Lifestyle" disabled={submitting} />
      </label>
      <label>
        Açıklama
        <textarea name="description" rows={3} placeholder="Marka hakkında kısa bilgi" disabled={submitting} />
      </label>
      <button type="submit" disabled={submitting}>
        {submitting ? 'Kaydediliyor…' : 'Markayı Kaydet'}
      </button>
      {message ? <p className={styles.adminFormMessage}>{message}</p> : null}
    </form>
  );
}
