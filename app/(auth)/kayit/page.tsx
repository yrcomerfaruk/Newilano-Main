'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import styles from '../auth.module.css';

export default function KayitPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message ?? 'Kayıt başarısız.');
        setLoading(false);
        return;
      }

      setSuccess('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
      setLoading(false);
      setTimeout(() => {
        router.push('/giris');
      }, 1200);
    } catch (err) {
      setError('Beklenmeyen bir hata oluştu.');
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h1>Kaydol</h1>
          <p>Newilano’ya katıl ve sneaker dünyasının ayrıcalıklarını keşfet.</p>
        </div>
        {error ? <div className={`${styles.feedback} ${styles.error}`}>{error}</div> : null}
        {success ? <div className={`${styles.feedback} ${styles.success}`}>{success}</div> : null}
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="name">Ad Soyad</label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              minLength={2}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="password">Şifre</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
            />
          </div>
          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'Kaydediliyor…' : 'Kaydol'}
          </button>
        </form>
        <p className={styles.helper}>
          Zaten hesabın var mı? <Link href="/giris">Giriş yap</Link>
        </p>
      </div>
    </main>
  );
}
