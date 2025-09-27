
import { connectToDatabase } from '@/lib/db';
import { Product } from '@/models/Product';

async function addHypeTag() {
  await connectToDatabase();

  const product = await Product.findOne({ tags: { $ne: 'HYPE' } });

  if (product) {
    product.tags.push('HYPE');
    await product.save();
    console.log(`'HYPE' tag added to product: ${product.name}`);
  } else {
    console.log('No product found to add HYPE tag to.');
  }

  process.exit(0);
}

addHypeTag();
