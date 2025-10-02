import { BrandGrid } from '@/components/BrandGrid';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import styles from './page.module.css';
import { getBrands } from '@/lib/data';

export const revalidate = 600; // cache for 10 minutes

export const metadata = {
  title: 'Markalar | Newilano'
};

export default async function MarkalarPage() {
  const brands = await getBrands();
  const sorted = brands
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, 'tr', { sensitivity: 'base' }));

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const displayAlphabet = [...alphabet, '#'];

  const letterMap = new Map<string, typeof sorted>();
  const letterFor = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return '#';
    const first = trimmed[0]?.toLocaleUpperCase('tr-TR');
    return alphabet.includes(first) ? first : '#';
  };

  sorted.forEach((brand) => {
    const letter = letterFor(brand.name);
    if (!letterMap.has(letter)) {
      letterMap.set(letter, []);
    }
    letterMap.get(letter)!.push(brand);
  });

  const grouped = alphabet
    .map((letter) => ({ letter, brands: letterMap.get(letter) ?? [] }))
    .filter((group) => group.brands.length > 0);

  if (letterMap.get('#')) {
    grouped.push({ letter: '#', brands: letterMap.get('#')! });
  }

  const activeLetters = new Set(grouped.map((group) => group.letter));

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className="container">

          <div className={styles.heroContent}>
            <h1>Markalar</h1>
            <p>
              İkonik sneaker markalarından günlük yaşamın vazgeçilmez aksesuarlarına kadar Newilano vitrininin
              merkezindeki markaları keşfedin.
            </p>
          </div>
        </div>
      </section>

      <div className="container">
        <div>
          <div className={styles.alphabet}>
            {displayAlphabet.map((letter) =>
              activeLetters.has(letter) ? (
                <a key={letter} href={`#brand-${letter}`} className={styles.alphabetLink}>
                  {letter}
                </a>
              ) : (
                <span key={letter} className={styles.alphabetDisabled}>
                  {letter}
                </span>
              )
            )}
          </div>
          {grouped.map((group) => (
            <section key={group.letter} id={`brand-${group.letter}`} className={styles.groupSection}>
              <h2 className={styles.sectionTitle}>{group.letter}</h2>
              <BrandGrid brands={group.brands} />
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
