'use client';

import Link from 'next/link';
import {
  ExternalLinkIcon,
  FacebookIcon,
  InstagramIcon,
  PinterestIcon,
  WhatsappIcon,
  XIconMark
} from './icons';
import styles from './ShareButtons.module.css';

const targets = (url: string) => [
  {
    id: 'facebook',
    label: 'Facebook',
    href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    icon: FacebookIcon,
    external: true
  },
  {
    id: 'x',
    label: 'X',
    href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`,
    icon: XIconMark,
    external: true
  },
  {
    id: 'instagram',
    label: 'Instagram',
    href: 'https://www.instagram.com/',
    icon: InstagramIcon,
    external: true
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    href: `https://api.whatsapp.com/send?text=${encodeURIComponent(url)}`,
    icon: WhatsappIcon,
    external: true
  },
  {
    id: 'pinterest',
    label: 'Pinterest',
    href: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}`,
    icon: PinterestIcon,
    external: true
  },
  {
    id: 'copy',
    label: 'Bağlantıyı Kopyala',
    href: url,
    icon: ExternalLinkIcon,
    external: false
  }
];

export function ShareButtons({ productUrl }: { productUrl: string }) {
  return (
    <div className={styles.shareList}>
      {targets(productUrl).map(({ id, label, href, icon: Icon, external }) => (
        <Link
          key={id}
          href={href}
          aria-label={label}
          className={styles.shareButton}
          target={external ? '_blank' : undefined}
          rel={external ? 'noreferrer' : undefined}
          onClick={(event) => {
            if (!external) {
              event.preventDefault();
              if (typeof navigator !== 'undefined' && navigator.clipboard) {
                navigator.clipboard.writeText(productUrl).catch(() => {});
              }
            }
          }}
        >
          <Icon width={16} height={16} />
        </Link>
      ))}
    </div>
  );
}
