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
    const formData = new FormData(event.currentTarget);
    const title = (formData.get('title') as string)?.trim();
    const description = (formData.get('description') as string)?.trim();
    const ctaLabel = (formData.get('ctaLabel') as string)?.trim();
    const ctaHref = (formData.get('ctaHref') as string)?.trim();

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
          imageData,
          ctaLabel,
          ctaHref
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        setMessage(payload.message ?? 'Kampanya oluşturulamadı.');
        return;
      }

      event.currentTarget.reset();
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

  return (
    <form className={styles.adminForm} onSubmit={handleSubmit}>
      <label>
        Kampanya Başlığı
        <input name="title" type="text" placeholder="Örn. Yaz İndirimi" required disabled={submitting} />
      </label>
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
      <button type="submit" disabled={submitting}>
        {submitting ? 'Kaydediliyor…' : 'Kampanyayı Kaydet'}
      </button>
      {message ? <p className={styles.adminFormMessage}>{message}</p> : null}
    </form>
  );
}
