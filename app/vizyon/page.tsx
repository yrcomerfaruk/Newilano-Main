import { Breadcrumbs } from '@/components/Breadcrumbs';
import styles from './page.module.css';

const pillars = [
  {
    title: 'Türk Markalarına Destek',
    description:
      '2025 yılında kurulan Newilano, yerli markaların emeğini görünür kılmak için kar gözetmeyen bir vitrin oluşturur.'
  },
  {
    title: 'Şeffaf Hikaye Anlatımı',
    description:
      'Markaların tasarım hikayelerini ve üretim süreçlerini sponsorluk almadan, olduğu gibi topluluğumuzla paylaşırız.'
  },
  {
    title: 'Erişilebilir Tanıtım',
    description:
      'Ürünleri değerlendirme, deneme ve içerik üretimindeki maliyetleri biz üstlenir, üreticilerin yükünü hafifletiriz.'
  }
];

const roadmap = [
  {
    year: '2025',
    text: 'Newilano, Türk markalarının hikayelerini kar amacı gütmeden tanıtmak amacıyla kuruldu.'
  },
  {
    year: 'Bugün',
    text: 'Topluluğumuza güvenilir içerik sağlamak için koleksiyonları tanıtmaya ve üreticilerle dayanışmaya devam ediyoruz.'
  },
  {
    year: 'Gelecek',
    text: 'Planlanmış bir takvim yok; ihtiyaca göre projeler geliştirip markaların yanında olmayı sürdüreceğiz.'
  }
];

export default function VizyonPage() {
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className="container">

          <div className={styles.heroContent}>
            <h1>Vizyon</h1>
            <p>
              Newilano, 2025 yılında kurulmuş kar amacı gütmeyen bir vitrin olarak Türk markalarının ürünlerini
              tanıtmayı ve hikayelerini görünür kılmayı amaçlar. Gelir hedefi olmadan üreticilerin emeğini anlatır,
              topluluğumuza güvenilir bir keşif alanı sunar.
            </p>
          </div>
        </div>
      </section>

      <div className="container">
        <section className={styles.columns}>
          {pillars.map((pillar) => (
            <article key={pillar.title} className={styles.block}>
              <h2>{pillar.title}</h2>
              <p>{pillar.description}</p>
            </article>
          ))}
        </section>

        <section className={styles.timeline}>
          {roadmap.map((item) => (
            <article key={item.year} className={styles.timelineItem}>
              <h3>{item.year}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
