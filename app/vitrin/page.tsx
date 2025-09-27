import { getAllProducts } from '@/lib/data';
import { VitrinClient } from './VitrinClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Vitrin | Newilano'
};

export default async function VitrinPage() {
  const products = await getAllProducts();
  return <VitrinClient products={products} />;
}
