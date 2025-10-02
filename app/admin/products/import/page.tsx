import { ImportProductClient } from './ImportProductClient';
import { getBrands } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function ImportProductPage() {
  const brands = await getBrands();
  return <ImportProductClient brands={brands} />;
}
