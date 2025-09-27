import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { AnnouncementModel } from '@/models/Announcement';
import { requireAdmin } from '@/lib/auth-helpers';

export async function GET() {
  await connectToDatabase();
  const docs = await AnnouncementModel.find({ active: true }).sort({ order: 1, createdAt: 1 }).lean();
  const announcements = docs.map((d: any) => ({ id: d._id.toString(), message: String(d.message) }));
  return NextResponse.json({ announcements });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.error;
  const body = await req.json().catch(() => ({}));
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  const active = typeof body.active === 'boolean' ? body.active : true;
  if (!message) return NextResponse.json({ message: 'Mesaj gerekli.' }, { status: 400 });
  await connectToDatabase();
  const last = await AnnouncementModel.findOne().sort({ order: -1 }).lean();
  const order = last ? (Number(last.order) || 0) + 1 : 0;
  const doc = await AnnouncementModel.create({ message, active, order });
  return NextResponse.json({ announcement: { id: doc._id.toString(), message: doc.message, active: doc.active, order: doc.order } }, { status: 201 });
}
