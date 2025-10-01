import { AdminHeroForm } from '@/app/admin/HeroForm';
import { AdminHeroList } from '@/app/admin/HeroList';
import { getHeroSlides } from '@/lib/data';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Hero Görsellerini Yönet | Admin Paneli'
};

export default async function AdminHeroPage() {
  const heroSlides = await getHeroSlides({ includeDefaults: false });

  const heroList = heroSlides.map((slide) => ({
    id: slide.id,
    title: slide.title,
    subtitle: slide.subtitle,
    image: slide.image,
    mobileImage: slide.mobileImage,
    ctaLabel: slide.ctaLabel,
    ctaHref: slide.ctaHref
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <section>
        <h2>Hero Görseli Ekle</h2>
        <AdminHeroForm />
      </section>
      <section>
        <h2>Hero Görselleri</h2>
        <AdminHeroList slides={heroList} />
      </section>
    </div>
  );
}
