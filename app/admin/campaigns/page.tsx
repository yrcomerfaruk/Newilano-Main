import { AdminCampaignForm } from '@/app/admin/CampaignForm';
import { AdminCampaignList } from '@/app/admin/CampaignList';
import { getCampaigns } from '@/lib/data';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Kampanyaları Yönet | Admin Paneli'
};

export default async function AdminCampaignsPage() {
  const campaignData = await getCampaigns();

  const dateFormatter = new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium' });
  const campaignsWithMeta = campaignData.map((campaign) => ({
    ...campaign,
    createdLabel: campaign.createdAt ? dateFormatter.format(new Date(campaign.createdAt)) : 'Tarih yok'
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <section>
        <h2>Kampanya Ekle</h2>
        <AdminCampaignForm />
      </section>
      <section>
        <h2>Kampanyaları Yönet</h2>
        <AdminCampaignList campaigns={campaignsWithMeta} />
      </section>
    </div>
  );
}
