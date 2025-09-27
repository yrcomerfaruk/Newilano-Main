'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';
import styles from './layout.module.css';
import { Logo } from '@/components/Logo';
import { ExternalLinkIcon } from '@/components/icons';

const navLinks = [
  { href: '/admin', label: 'Anasayfa' },
  { href: '/admin/products', label: 'Ürünler' },
  { href: '/admin/brands', label: 'Markalar' },
  { href: '/admin/campaigns', label: 'Kampanyalar' },
  { href: '/admin/hero', label: 'Hero Görselleri' },
  { href: '/admin/announcements', label: 'Duyurular' },
];

export function SideNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut({ callbackUrl: '/' });
  };

  return (
    <nav className={styles.sideNav}>
      <div className={styles.navMain}>
        <div className={styles.navTop}>
          <Logo />
        </div>
        <div className={styles.navHeader}>
          <strong>Yönetim Paneli</strong>
        </div>
        <ul className={styles.navList}>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link href={link.href} className={isActive ? styles.navLinkActive : styles.navLink}>
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className={styles.navFooter}>
        {session?.user && (
          <div className={styles.userInfo}>
            <span>{session.user.name}</span>
            <button onClick={handleSignOut} disabled={signingOut} className={styles.logoutButton}>
              {signingOut ? 'Çıkılıyor...' : 'Çıkış Yap'}
            </button>
          </div>
        )}
        <Link href="/" target="_blank" className={styles.viewSiteLink}>
          <ExternalLinkIcon width={18} height={18} />
          <span>Siteyi Görüntüle</span>
        </Link>
      </div>
    </nav>
  );
}
