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
    const formEl = event.currentTarget;
    const formData = new FormData(formEl);
    const name = (formData.get('name') as string)?.trim();
    const description = (formData.get('description') as string)?.trim();
    const website = (formData.get('website') as string)?.trim();
    const instagram = (formData.get('instagram') as string)?.trim();
    const tiktok = (formData.get('tiktok') as string)?.trim();
    const x = (formData.get('x') as string)?.trim();
    const linkedin = (formData.get('linkedin') as string)?.trim();
    const story = (formData.get('story') as string)?.trim();
    const categoriesInput = (formData.get('categories') as string)?.trim();
    const categories = categoriesInput
      ? categoriesInput.split(',').map((category) => category.trim()).filter(Boolean)
      : [];

    if (!name) {
      setMessage('Marka adı boş olamaz.');
      return;
    }

    // Logo yeni marka oluştururken zorunlu (backend de aynı şekilde doğrular)
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
        body: JSON.stringify({
          name,
          description,
          logoData,
          categories,
          website: website || undefined,
          instagram: instagram || undefined,
          tiktok: tiktok || undefined,
          x: x || undefined,
          linkedin: linkedin || undefined,
          story: story || undefined
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        setMessage(payload.message ?? 'Marka oluşturulamadı.');
        return;
      }

      formEl.reset();
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
      <div className={styles.adminFormInline}>
        <span>
          <label>Website
            <input name="website" type="url" placeholder="https://example.com" disabled={submitting} />
          </label>
        </span>
        <span>
          <label>Instagram
            <input name="instagram" type="url" placeholder="https://instagram.com/brand" disabled={submitting} />
          </label>
        </span>
        <span>
          <label>TikTok
            <input name="tiktok" type="url" placeholder="https://tiktok.com/@brand" disabled={submitting} />
          </label>
        </span>
        <span>
          <label>X (Twitter)
            <input name="x" type="url" placeholder="https://x.com/brand" disabled={submitting} />
          </label>
        </span>
        <span>
          <label>LinkedIn
            <input name="linkedin" type="url" placeholder="https://linkedin.com/company/brand" disabled={submitting} />
          </label>
        </span>
      </div>
      <label>
        Kısa Bilgi (Markalar sayfasında görünecek)
        <textarea name="description" rows={3} placeholder="Marka hakkında kısa bilgi" disabled={submitting} />
      </label>
      <label>
        Marka Hikayesi
        <textarea name="story" rows={5} placeholder="Markanın hikayesini anlatın" disabled={submitting} />
      </label>
      <button type="submit" disabled={submitting}>
        {submitting ? 'Kaydediliyor…' : 'Markayı Kaydet'}
      </button>
      {message ? <p className={styles.adminFormMessage}>{message}</p> : null}
    </form>
  );
}
