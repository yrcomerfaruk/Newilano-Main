import { redirect } from 'next/navigation';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { getProductsBySlugs } from '@/lib/data';
import { User } from '@/models/User';
import styles from './page.module.css';
import { FavoriteList } from './FavoriteList';

export const metadata = {
  title: 'Favoriler | Newilano'
};

export default async function FavoritesPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect(`/giris?callbackUrl=${encodeURIComponent('/favoriler')}`);
  }

  await connectToDatabase();
  const user = await User.findOne({ email: session.user.email }).lean();

  const favoriteProducts = await getProductsBySlugs(user?.favorites ?? []);

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className="container">

          <div className={styles.heroContent}>
            <h1>Favoriler</h1>
            <p>Beğendiğin Newilano ürünlerini burada bir arada bul. Favoriye aldığın ürünler stokta oldukça seni bekler.</p>
          </div>
        </div>
      </section>

      <div className="container">
        <FavoriteList initialProducts={favoriteProducts} />
      </div>
    </main>
  );
}
