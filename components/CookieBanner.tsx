'use client';

import { useEffect, useState } from 'react';
import styles from './CookieBanner.module.css';

const COOKIE_CONSENT_KEY = 'cookie_consent_accepted';

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Tarayıcı ortamında olduğumuzdan emin olalım
    if (typeof window !== 'undefined') {
      const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (consent !== 'true') {
        // Gecikmeli gösterim, sayfa yüklenmesini engellememek için
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleAccept = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    }
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`${styles.banner} ${isVisible ? styles.bannerVisible : ''}`}>
      <p className={styles.text}>
        Sitemizde daha iyi bir kullanıcı deneyimi sunmak için çerezleri kullanıyoruz. Bu siteyi kullanarak çerez kullanımımızı kabul etmiş olursunuz.
      </p>
      <button type="button" className={styles.button} onClick={handleAccept}>
        Kabul Et
      </button>
    </div>
  );
}
