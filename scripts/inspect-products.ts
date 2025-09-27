
import { connectToDatabase } from '@/lib/db';
import { Product } from '@/models/Product';

async function inspectProducts() {
  await connectToDatabase();

  console.log('--- Inspecting a product with HYPE tag ---');
  const hypeProduct = await Product.findOne({ tags: { $in: ['HYPE'] } });
  console.log(hypeProduct);

  console.log('\n--- Inspecting a product without HYPE tag ---');
  const nonHypeProduct = await Product.findOne({ tags: { $nin: ['HYPE'] } });
  console.log(nonHypeProduct);
  
  console.log('\n--- Inspecting all tags ---');
  const allTags = await Product.distinct('tags');
  console.log(allTags);

  process.exit(0);
}

inspectProducts();
