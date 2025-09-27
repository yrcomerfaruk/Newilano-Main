import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/Providers';
import { FooterController } from '@/components/FooterController';
import { HeaderController } from '@/components/HeaderController';
import { auth } from '@/lib/auth';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Newilano | Sneaker & Lifestyle Store',
  description: 'Newilano ile en hype sneaker ve lifestyle ürünlerini keşfedin.'
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="tr">
      <body className={inter.className}>
        <Providers session={session}>
          <HeaderController />
          {children}
          <FooterController />
        </Providers>
      </body>
    </html>
  );
}
