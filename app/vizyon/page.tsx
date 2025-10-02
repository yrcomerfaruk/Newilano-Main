import styles from './page.module.css';

export const metadata = {
  title: 'Vizyon | Newilano',
};

export default function VizyonPage() {
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
            <h1>Vizyonumuz</h1>
            <p>
              Türkiye'nin değerli moda markalarını dünyaya açılan bir vitrinde buluşturuyoruz.
            </p>
          </div>
        </div>
      </section>

      <div className={styles.content}>
        <article className={styles.article}>
          <section>
            <h2>Hikayemiz</h2>
            <p>
              Newilano, 2022 yılında Türk moda markalarının özgün tasarımlarını ve kaliteli ürünlerini daha geniş kitlelere ulaştırma tutkusuyla kuruldu. Yolculuğumuz, yerel üreticilerin emeğini ve yaratıcılığını hem yurt içinde hem de uluslararası arenada sergilemek için bir platform oluşturma fikriyle başladı. Sadece bir e-ticaret sitesi değil, aynı zamanda markaların hikayelerini anlatan bir topluluk olmayı hedefledik.
            </p>
          </section>

          <section>
            <h2>Misyonumuz</h2>
            <p>
              Temel misyonumuz, özenle seçilmiş Türk moda markalarını keşfedilir kılmak ve onların global pazarda hak ettikleri yeri almalarına yardımcı olmaktır. Bu doğrultuda, platformumuzda yalnızca estetik ve kalite standartlarımıza uygun, kendi alanında fark yaratan markalara yer veriyoruz. Amacımız, müşterilerimize benzersiz bir seçki sunarken, iş ortaklarımızın da sürdürülebilir bir büyüme yakalamasını sağlamaktır.
            </p>
          </section>

          <section>
            <h2>Gelecek Vizyonumuz</h2>
            <p>
              İlerleyen süreçte Newilano'yu, daha fazla Türk markasının katılabileceği dinamik bir pazaryerine dönüştürmeyi hedefliyoruz. Bu dönüşümle birlikte, üreticilere daha fazla kontrol ve esneklik sunarak kendi mağazalarını yönetmelerine olanak tanıyacağız. Teknolojiyi ve yenilikçi pazarlama stratejilerini kullanarak, Türkiye'nin moda endüstrisine hizmet eden lider bir ekosistem yaratmayı ve markalarımızın global başarı hikayelerine yenilerini eklemeyi amaçlıyoruz.
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}