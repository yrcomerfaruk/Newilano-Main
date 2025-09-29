import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { Product } from '@/models/Product';
import { FavoriteEvent } from '@/models/FavoriteEvent';

async function requireUser() {
  const session = await auth();

  if (!session?.user?.email) {
    return { email: null as null, response: NextResponse.json({ message: 'Yetkisiz erişim.' }, { status: 401 }) };
  }

  return { email: session.user.email, response: null };
}

export async function GET(request: NextRequest) {
  const { email, response } = await requireUser();
  if (!email) return response!;

  await connectToDatabase();
  const user = await User.findOne({ email }).lean();

  const favorites = user?.favorites ?? [];
  const slug = request.nextUrl.searchParams.get('slug');

  if (slug) {
    return NextResponse.json({ favorite: favorites.includes(slug) });
  }

  return NextResponse.json({ favorites });
}

export async function POST(request: NextRequest) {
  const { email, response } = await requireUser();
  if (!email) return response!;

  try {
    const { slug } = await request.json();

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ message: 'Geçerli bir ürün belirtilmedi.' }, { status: 400 });
    }

    await connectToDatabase();

    const product = await Product.findOne({ slug }).select({ _id: 1 }).lean();

    if (!product) {
      return NextResponse.json({ message: 'Ürün bulunamadı.' }, { status: 404 });
    }

    const updateResult = await User.updateOne({ email }, { $addToSet: { favorites: slug } });
    const userDoc = await User.findOne({ email }).select({ favorites: 1, _id: 1 }).lean();

    // Record lifetime unique favorite event (do not remove on unfavorite)
    if (userDoc?._id) {
      try {
        await FavoriteEvent.create({ user: userDoc._id, product: product._id });
      } catch (err: any) {
        // Ignore duplicate key error (already recorded lifetime favorite)
        if (!(err && err.code === 11000)) {
          throw err;
        }
      }
    }

    return NextResponse.json({ favorites: userDoc?.favorites ?? [], favorite: true });
  } catch (error) {
    console.error('Favorites POST error', error);
    return NextResponse.json({ message: 'Favori eklenemedi.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { email, response } = await requireUser();
  if (!email) return response!;

  const slug = request.nextUrl.searchParams.get('slug');

  if (!slug) {
    return NextResponse.json({ message: 'Geçerli bir ürün belirtilmedi.' }, { status: 400 });
  }

  await connectToDatabase();
  const result = await User.findOneAndUpdate(
    { email },
    { $pull: { favorites: slug } },
    { new: true, projection: { favorites: 1 } }
  ).lean();

  return NextResponse.json({ favorites: result?.favorites ?? [], favorite: false });
}
