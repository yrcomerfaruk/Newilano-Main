import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { AnnouncementModel } from '@/models/Announcement';
import { requireAdmin } from '@/lib/auth-helpers';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.error;
  const { id } = params;
  const body = await req.json().catch(() => ({}));
  const update: any = {};
  if (typeof body.message === 'string') update.message = body.message.trim();
  if (typeof body.active === 'boolean') update.active = body.active;
  if (typeof body.order === 'number') update.order = body.order;
  if (Object.keys(update).length === 0) return NextResponse.json({ message: 'Güncellenecek alan yok.' }, { status: 400 });
  await connectToDatabase();
  const doc = await AnnouncementModel.findByIdAndUpdate(id, { $set: update }, { new: true }).lean();
  if (!doc) return NextResponse.json({ message: 'Bulunamadı.' }, { status: 404 });
  return NextResponse.json({ announcement: { id: doc._id.toString(), message: doc.message, active: !!doc.active, order: Number(doc.order) || 0 } });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.error;
  const { id } = params;
  await connectToDatabase();
  const res = await AnnouncementModel.deleteOne({ _id: id });
  if (res.deletedCount === 0) return NextResponse.json({ message: 'Bulunamadı.' }, { status: 404 });
  return NextResponse.json({ success: true });
}
