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
            const isProducts = link.href === '/admin/products';
            const isBrands = link.href === '/admin/brands';
            // Parent is active only on exact route
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link href={link.href} className={isActive ? styles.navLinkActive : styles.navLink}>
                  {link.label}
                </Link>
                {isProducts ? (
                  <ul className={styles.navSubList}>
                    <li>
                      <Link
                        href="/admin/products/add"
                        className={pathname === '/admin/products/add' ? styles.navSubLinkActive : styles.navSubLink}
                      >
                        Ürün Ekle
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/admin/products/list"
                        className={pathname === '/admin/products/list' ? styles.navSubLinkActive : styles.navSubLink}
                      >
                        Ürünleri Gör
                      </Link>
                    </li>
                  </ul>
                ) : null}
                {isBrands ? (
                  <ul className={styles.navSubList}>
                    <li>
                      <Link
                        href="/admin/brands/add"
                        className={pathname === '/admin/brands/add' ? styles.navSubLinkActive : styles.navSubLink}
                      >
                        Marka Ekle
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/admin/brands/list"
                        className={pathname === '/admin/brands/list' ? styles.navSubLinkActive : styles.navSubLink}
                      >
                        Markaları Yönet
                      </Link>
                    </li>
                  </ul>
                ) : null}
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
