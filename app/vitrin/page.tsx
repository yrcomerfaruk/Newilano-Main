import { getAllProducts } from '@/lib/data';
import { VitrinClient } from './VitrinClient';

export const revalidate = 600; // cache for 10 minutes

export const metadata = {
  title: 'Vitrin | Newilano'
};

export default async function VitrinPage() {
  const products = await getAllProducts();
  return <VitrinClient products={products} />;
}
