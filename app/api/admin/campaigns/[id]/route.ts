import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { connectToDatabase } from '@/lib/db';
import { CampaignModel } from '@/models/Campaign';

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const authResult = await requireAdmin();
  if (!authResult.ok) {
    return authResult.error;
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ message: 'Kampanya belirtilmedi.' }, { status: 400 });
  }

  await connectToDatabase();

  const campaign = await CampaignModel.findById(id).lean();
  if (!campaign) {
    return NextResponse.json({ message: 'Kampanya bulunamadı.' }, { status: 404 });
  }

  await CampaignModel.deleteOne({ _id: campaign._id });

  return NextResponse.json({ success: true });
}
