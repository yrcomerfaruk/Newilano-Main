import { NextResponse } from 'next/server';
import { auth } from './auth';

export async function requireAdmin() {
  const session = await auth();

  if (!session?.user?.email) {
    return {
      ok: false as const,
      error: NextResponse.json({ message: 'Yetkisiz erişim.' }, { status: 401 }),
      session: null
    };
  }

  if (session.user.role !== 'admin') {
    return {
      ok: false as const,
      error: NextResponse.json({ message: 'Bu işlem için yetkiniz yok.' }, { status: 403 }),
      session
    };
  }

  return { ok: true as const, session };
}
