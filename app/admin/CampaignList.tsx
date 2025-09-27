'use client';

import Image from 'next/image';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import type { Campaign } from '@/lib/data';
import { isAllowedImageUrl } from '@/lib/image-validation';

const fallback =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='180' viewBox='0 0 320 180'%3E%3Crect width='320' height='180' rx='16' fill='%23f3f4f6'/%3E%3Ctext x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23111111' font-family='Arial' font-size='18'%3EBanner%3C/text%3E%3C/svg%3E";

type CampaignListItem = Campaign & { createdLabel: string };

export function AdminCampaignList({ campaigns }: { campaigns: CampaignListItem[] }) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (campaigns.length === 0) {
    return <p className={styles.brandListEmpty}>Henüz kayıtlı bir kampanya yok.</p>;
  }

  const handleDelete = (campaign: CampaignListItem) => {
    const confirmed = window.confirm(`${campaign.title} kampanyasını silmek istediğinize emin misiniz?`);
    if (!confirmed) return;

    setPendingId(campaign.id);
    setFeedback(null);
    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/campaigns/${campaign.id}`, {
          method: 'DELETE'
        });
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          setFeedback(payload.message ?? 'Kampanya silinemedi.');
        } else {
          setFeedback(`${campaign.title} kampanyası silindi.`);
          router.refresh();
        }
      } catch (error) {
        console.error('Campaign delete error', error);
        setFeedback('Kampanya silinemedi.');
      } finally {
        setPendingId(null);
      }
    });
  };

  return (
    <div className={styles.campaignList}>
      {feedback ? <p className={styles.adminFormMessage}>{feedback}</p> : null}
      {campaigns.map((campaign) => (
        <article key={campaign.id} className={styles.campaignCard}>
          <div className={styles.campaignImage}>
            <Image
              src={campaign.image?.startsWith('data:image/') ? campaign.image : isAllowedImageUrl(campaign.image) ? campaign.image! : fallback}
              alt={campaign.title}
              fill
              sizes="260px"
              unoptimized={campaign.image?.startsWith('data:image/')}
            />
          </div>
          <div className={styles.campaignContent}>
            <div>
              <h4>{campaign.title}</h4>
              <p>{campaign.description}</p>
            </div>
            <span className={styles.campaignMeta}>{campaign.createdLabel}</span>
          </div>
          <div className={styles.brandListActions}>
            <button
              type="button"
              onClick={() => handleDelete(campaign)}
              disabled={isPending && pendingId === campaign.id}
            >
              {isPending && pendingId === campaign.id ? 'Siliniyor…' : 'Sil'}
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
