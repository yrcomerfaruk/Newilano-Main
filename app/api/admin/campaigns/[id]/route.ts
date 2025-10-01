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

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const authResult = await requireAdmin();
  if (!authResult.ok) {
    return authResult.error;
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ message: 'Kampanya belirtilmedi.' }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const { title, description, longDescription, image, ctaLabel, ctaHref, productSlugs, productIds } = body ?? {};

  await connectToDatabase();
  const campaign = await CampaignModel.findById(id);
  if (!campaign) {
    return NextResponse.json({ message: 'Kampanya bulunamadı.' }, { status: 404 });
  }

  if (typeof title === 'string' && title.trim()) campaign.title = title.trim();
  if (typeof description === 'string' && description.trim()) campaign.description = description.trim();
  if (typeof longDescription === 'string') campaign.longDescription = longDescription;
  if (typeof image === 'string' && image.trim()) campaign.image = image.trim();
  if (typeof ctaLabel === 'string') campaign.ctaLabel = ctaLabel;
  if (typeof ctaHref === 'string') campaign.ctaHref = ctaHref;
  if (Array.isArray(productSlugs)) {
    campaign.productSlugs = productSlugs.filter((s: unknown) => typeof s === 'string' && s.trim()).map((s: string) => s.trim());
  }
  if (Array.isArray(productIds)) {
    campaign.productIds = productIds.filter((s: unknown) => typeof s === 'string' && s.trim());
  }

  await campaign.save();
  return NextResponse.json({ success: true });
}
