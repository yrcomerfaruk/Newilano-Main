import styles from './HowItWorks.module.css';
import { EyeIcon, ExternalLinkIcon, BagIcon } from './icons';

const steps = [
  {
    icon: <EyeIcon width={20} height={20} />,
    title: '1. Ürünü İncele',
    description: 'Platformumuzdaki kürate edilmiş ürünleri ve marka hikayelerini keşfedin. Beğendiğiniz ürünlerin detaylarına göz atın.',
  },
  {
    icon: <ExternalLinkIcon width={20} height={20} />,
    title: '2. Markanın Sitesine Git',
    description: "Ürünü satın almak için 'Ürünü İncele' butonuyla doğrudan markanın kendi resmi web sitesine güvenle yönlendirilirsiniz.",
  },
  {
    icon: <BagIcon width={20} height={20} />,
    title: '3. Satın Al',
    description: 'Alışverişinizi markanın kendi platformu üzerinden tamamlayarak hem markaya doğrudan destek olun hem de güvenli alışverişin tadını çıkarın.',
  },
];

export function HowItWorks() {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Nasıl Çalışır?</h2>
        <p className={styles.subtitle}>
          Newilano, sizi doğrudan markalarla buluşturan bir keşif platformudur. Alışveriş süreci üç basit adımdan oluşur.
        </p>
      </div>
      <div className={styles.grid}>
        {steps.map((step) => (
          <div key={step.title} className={styles.step}>
            <div className={styles.iconWrapper}>{step.icon}</div>
            <h3 className={styles.stepTitle}>{step.title}</h3>
            <p className={styles.stepDescription}>{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
