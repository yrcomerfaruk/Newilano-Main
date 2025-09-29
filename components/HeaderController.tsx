'use client';

import { usePathname } from 'next/navigation';
import { SiteHeader } from './SiteHeader';

export function HeaderController() {
  const pathname = usePathname();

  if (pathname.startsWith('/admin') || pathname.startsWith('/kesfet')) {
    return null; // Don't render header on admin pages
  }

  return <SiteHeader />;
}
