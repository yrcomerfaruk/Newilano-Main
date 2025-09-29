import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { ExploreComment } from '@/models/ExploreComment';
import { User } from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug');
  if (!slug) {
    return NextResponse.json({ message: 'Geçerli bir ürün belirtilmedi.' }, { status: 400 });
  }
  await connectToDatabase();
  const comments = await ExploreComment.find({ productSlug: slug })
    .populate({ path: 'user', select: { name: 1, email: 1 } })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
  const mapped = comments.map((c) => ({
    _id: String(c._id),
    productSlug: c.productSlug,
    content: c.content,
    createdAt: c.createdAt,
    user: {
      name: (c as any).user?.name || (c as any).user?.email?.split('@')[0] || 'Kullanıcı'
    }
  }));
  return NextResponse.json({ slug, comments: mapped });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Yetkisiz erişim.' }, { status: 401 });
  }

  const { slug, content } = await request.json();
  if (!slug || typeof slug !== 'string' || !content || typeof content !== 'string') {
    return NextResponse.json({ message: 'Geçerli veri gönderin.' }, { status: 400 });
  }
  const trimmed = content.trim();
  if (!trimmed) {
    return NextResponse.json({ message: 'Yorum boş olamaz.' }, { status: 400 });
  }

  await connectToDatabase();
  const user = await User.findOne({ email: session.user.email }).select({ _id: 1, name: 1, email: 1 }).lean();
  if (!user?._id) {
    return NextResponse.json({ message: 'Kullanıcı bulunamadı.' }, { status: 404 });
  }

  const doc = await ExploreComment.create({ productSlug: slug, user: user._id, content: trimmed });
  return NextResponse.json({
    comment: {
      _id: String(doc._id),
      productSlug: slug,
      content: trimmed,
      createdAt: doc.createdAt,
      user: { name: user.name || user.email?.split('@')[0] || 'Kullanıcı' }
    }
  });
}
