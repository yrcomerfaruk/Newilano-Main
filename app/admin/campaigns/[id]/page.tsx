import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CampaignModel } from '@/models/Campaign';
import { connectToDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

async function getCampaignById(id: string) {
  await connectToDatabase();
  const doc = await CampaignModel.findById(id).lean();
  if (!doc) return null;
  return {
    id: String(doc._id),
    title: doc.title as string,
    description: doc.description as string,
    longDescription: (doc as any).longDescription ?? '',
    productSlugs: Array.isArray((doc as any).productSlugs) ? (doc as any).productSlugs as string[] : [],
    productIds: Array.isArray((doc as any).productIds) ? ((doc as any).productIds as any[]).map(String) : [],
    image: doc.image as string,
    ctaLabel: (doc as any).ctaLabel ?? '',
    ctaHref: (doc as any).ctaHref ?? ''
  };
}

export default async function AdminCampaignEditPage({ params }: { params: { id: string } }) {
  const campaign = await getCampaignById(params.id);
  if (!campaign) return notFound();

  return (
    <main style={{ display: 'grid', gap: '1rem' }}>
      <h2>Kampanya Düzenle</h2>
      <form
        action={`/api/admin/campaigns/${campaign.id}`}
        method="post"
        style={{ display: 'grid', gap: '0.75rem', maxWidth: 720 }}
        onSubmit={(e) => {
          // noop: next will send via method override below
        }}
      >
        <input type="hidden" name="_method" value="PUT" />
        <label>
          Başlık
          <input name="title" type="text" defaultValue={campaign.title} />
        </label>
        <label>
          Kısa Açıklama
          <textarea name="description" rows={2} defaultValue={campaign.description} />
        </label>
        <label>
          Detaylı Açıklama (uzun)
          <textarea name="longDescription" rows={8} defaultValue={campaign.longDescription} />
        </label>
        <label>
          Ürün Slugları (virgülle)
          <input name="productSlugs" type="text" defaultValue={campaign.productSlugs.join(', ')} />
        </label>
        <label>
          Ürün ID'leri (virgülle)
          <input name="productIds" type="text" defaultValue={campaign.productIds.join(', ')} />
        </label>
        <label>
          CTA Metni
          <input name="ctaLabel" type="text" defaultValue={campaign.ctaLabel ?? ''} />
        </label>
        <label>
          CTA Linki
          <input name="ctaHref" type="text" defaultValue={campaign.ctaHref ?? ''} />
        </label>
        <button
          formAction={async (formData) => {
            'use server';
            const id = campaign.id;
            // Convert multipart form to JSON and call PUT
            const payload: any = {
              title: String(formData.get('title') || ''),
              description: String(formData.get('description') || ''),
              longDescription: String(formData.get('longDescription') || ''),
              ctaLabel: String(formData.get('ctaLabel') || ''),
              ctaHref: String(formData.get('ctaHref') || '')
            };
            const slugs = String(formData.get('productSlugs') || '').split(',').map((s) => s.trim()).filter(Boolean);
            const ids = String(formData.get('productIds') || '').split(',').map((s) => s.trim()).filter(Boolean);
            if (slugs.length) payload.productSlugs = slugs;
            if (ids.length) payload.productIds = ids;

            await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/admin/campaigns/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
          }}
          type="submit"
        >
          Kaydet
        </button>
      </form>
      <Link href="/app/admin/campaigns">← Geri</Link>
    </main>
  );
}
