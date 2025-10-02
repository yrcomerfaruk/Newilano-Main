import type { Metadata } from 'next';
import type { Viewport } from 'next';
import { Providers } from '@/components/Providers';
import { FooterController } from '@/components/FooterController';
import { HeaderController } from '@/components/HeaderController';
import { CookieBanner } from '@/components/CookieBanner';
import { ScrollToTopButton } from '@/components/ScrollToTopButton';
import { auth } from '@/lib/auth';
import './globals.css';

// Using system font stack via globals.css

export const metadata: Metadata = {
  title: 'Newilano | Sneaker & Lifestyle Store',
  description: 'Newilano ile en hype sneaker ve lifestyle ürünlerini keşfedin.',
  // iOS Safari ve genel mobil uyumluluk için meta
  formatDetection: {
    telephone: false,
    email: false,
    address: false
  },
  other: {
    'apple-mobile-web-app-capable': 'yes'
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  userScalable: false,
  maximumScale: 1,
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="tr">
      <body>
        <Providers session={session}>
          <HeaderController />
          {children}
          <FooterController />
          <CookieBanner />
          <ScrollToTopButton />
        </Providers>
      </body>
    </html>
  );
}
