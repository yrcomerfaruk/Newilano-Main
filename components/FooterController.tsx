'use client';

import { usePathname } from 'next/navigation';
import { SiteFooter } from './SiteFooter';

export function FooterController() {
  const pathname = usePathname();

  if (pathname.startsWith('/admin') || pathname.startsWith('/kesfet')) {
    return null; // Don't render footer on admin pages
  }

  return <SiteFooter />;
}
