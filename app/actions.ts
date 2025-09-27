'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { Product } from '@/models/Product';

export async function removeFavorite(productId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Yetkisiz işlem.' };
  }

  try {
    await connectToDatabase();

    const product = await Product.findById(productId).lean();
    if (!product) {
      return { error: 'Ürün bulunamadı.' };
    }

    await User.updateOne(
      { _id: session.user.id },
      { $pull: { favorites: product.slug } }
    );

    revalidatePath('/favoriler');
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: 'Bir hata oluştu.' };
  }
}
