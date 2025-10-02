import styles from './page.module.css';
import Image from 'next/image';
import Link from 'next/link';
import { getBrandBySlug, getProductsByBrandSlug } from '@/lib/data';
import { ProductCarousel } from '@/components/ProductCarousel';
import { FiGlobe } from 'react-icons/fi';
import { FaInstagram, FaFacebook, FaYoutube, FaTiktok, FaLinkedin, FaXTwitter } from 'react-icons/fa6';

export const revalidate = 600; // cache for 10 minutes

export default async function BrandDetailPage({ params }: { params: { slug: string } }) {
  const [brand, products] = await Promise.all([
    getBrandBySlug(params.slug),
    getProductsByBrandSlug(params.slug, 10)
  ]);
  if (!brand) {
    return (
      <main className={styles.main}>
        <div className="container">
          <p>Marka bulunamadı.</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <section className={styles.header}>
        <div className="container">
          <div className={styles.topRight}>
            <Link href="/markalar" className={styles.topRightLink}>Markalara Dön</Link>
          </div>
          <div className={styles.headerInner}>
            {/* Left: logo + name + tags */}
            <div className={styles.headerInfo}>
              <div className={styles.logoWrap}>
                {brand.logo ? (
                  <Image src={brand.logo} alt={`${brand.name} logosu`} fill sizes="80px" />
                ) : null}
              </div>
              <div className="meta">
                <h1 className={styles.title}>{brand.name}</h1>
                {Array.isArray(brand.categories) && brand.categories.length > 0 ? (
                  <div className={styles.tags}>
                    {brand.categories.map((c) => (
                      <span key={c}>#{c}</span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            {/* Right: links removed to avoid duplication with Quick Links */}
          </div>
        </div>
      </section>

      <div className="container">
        <div className={styles.grid}>
          <article className={styles.storyCard}>
            <h2>Markanın Hikayesi</h2>
            {brand.story ? (
              <p className={styles.story}>{brand.story}</p>
            ) : (
              <p className={styles.storyPlaceholder}>Marka hikayesi yakında eklenecek.</p>
            )}
          </article>
          <aside className={styles.linksCard}>
            <h3>Hızlı Bağlantılar</h3>
            <div className={styles.links}>
              {brand.website ? (
                <a
                  href={brand.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${brand.name} websitesi`}
                  title={`${brand.name} websitesi`}
                >
                  <FiGlobe size={18} />
                </a>
              ) : null}
              {brand.instagram ? (
                <a
                  href={brand.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${brand.name} Instagram`}
                  title={`${brand.name} Instagram`}
                >
                  <FaInstagram size={18} />
                </a>
              ) : null}
              {brand.facebook ? (
                <a
                  href={brand.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${brand.name} Facebook`}
                  title={`${brand.name} Facebook`}
                >
                  <FaFacebook size={18} />
                </a>
              ) : null}
              {brand.x ? (
                <a
                  href={brand.x}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${brand.name} X`}
                  title={`${brand.name} X`}
                >
                  <FaXTwitter size={16} />
                </a>
              ) : null}
              {brand.youtube ? (
                <a
                  href={brand.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${brand.name} YouTube`}
                  title={`${brand.name} YouTube`}
                >
                  <FaYoutube size={18} />
                </a>
              ) : null}
              {brand.tiktok ? (
                <a
                  href={brand.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${brand.name} TikTok`}
                  title={`${brand.name} TikTok`}
                >
                  <FaTiktok size={18} />
                </a>
              ) : null}
              {brand.linkedin ? (
                <a
                  href={brand.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${brand.name} LinkedIn`}
                  title={`${brand.name} LinkedIn`}
                >
                  <FaLinkedin size={18} />
                </a>
              ) : null}
            </div>
          </aside>
        </div>
      </div>

      {/* Brand products carousel (first 10) */}
      <ProductCarousel
        title={`${brand.name} Ürünleri`}
        products={products}
        viewAllHref={`/vitrin?brand=${brand.slug}`}
        viewAllLabel="Tüm Ürünlerini Gör"
      />
    </main>
  );
}
