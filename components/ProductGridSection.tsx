import Link from 'next/link';
import { ProductCard } from './ProductCard';
import type { Product } from '@/lib/data';

export function ProductGridSection({
  title,
  products,
  viewAllHref
}: {
  title: string;
  products: Product[];
  viewAllHref: string;
}) {
  return (
    <section style={{ marginTop: '3rem' }}>
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{title}</h2>
          <Link href={viewAllHref} className="section-link">
            Tümünü Gör
          </Link>
        </div>
        <div className="card-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
