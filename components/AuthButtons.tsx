'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';
import { FiUser } from 'react-icons/fi';
import styles from './AuthButtons.module.css';

export function AuthButtons() {
  const { data: session, status } = useSession();
  const [signingOut, setSigningOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMenuOpen(false);
  }, [session?.user]);

  useEffect(() => {
    if (!menuOpen) return;

    const handleClick = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (wrapperRef.current && !wrapperRef.current.contains(target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, [menuOpen]);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut({ callbackUrl: '/' });
  };

  if (status === 'loading') {
    return <div className={styles.placeholder} aria-hidden="true" />;
  }

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button
        type="button"
        className={styles.mobileTrigger}
        aria-haspopup="true"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <FiUser size={22} />
      </button>

      {menuOpen ? (
        session?.user ? (
          <div className={styles.mobileMenu}>
            <span className={styles.mobileGreeting}>{session.user.name?.split(' ')[0] ?? 'Kullanıcı'}</span>
            <button type="button" className={styles.mobileLink} onClick={handleSignOut} disabled={signingOut}>
              {signingOut ? 'Çıkış yapılıyor…' : 'Çıkış Yap'}
            </button>
          </div>
        ) : (
          <div className={styles.mobileMenu}>
            <Link href="/giris" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
              Giriş Yap
            </Link>
            <Link href="/kayit" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
              Kaydol
            </Link>
          </div>
        )
      ) : null}
    </div>
  );
}
