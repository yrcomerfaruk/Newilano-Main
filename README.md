# Newilano

## Özellikler

- Ürün kataloğu ve arama sistemi
- Marka yönetimi ve vitrin sayfaları
- Kampanya sistemi
- Favoriler
- Admin paneli
- Güvenlik ve rate limiting

## Teknolojiler

- Next.js 14, TypeScript, CSS Modules
- MongoDB, NextAuth.js
- Middleware tabanlı güvenlik

## Kurulum

```bash
git clone https://github.com/avometre/newilano
cd newilano
npm install
cp .env.example .env.local
npm run dev
```

Gerekli ortam değişkenleri:
```env
MONGODB_URI=mongodb://localhost:27017/newilano
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
ADMIN_TRUSTED_ORIGIN=http://localhost:3000
```


## Proje Yapısı

```
app/            # Sayfalar ve API rotaları
components/     # UI bileşenleri
lib/           # Yardımcı fonksiyonlar
models/        # MongoDB şemaları
types/         # TypeScript tipleri
```

## Sorumluluk Reddi

Bu yazılım "OLDUĞU GİBİ" sunulmaktadır. Yazılımın kullanımından doğabilecek herhangi bir zarar, kayıp, veri kaybı, güvenlik açığı, finansal kayıp veya diğer olumsuz sonuçlardan dolayı geliştirici hiçbir sorumluluk kabul etmez.

Bu yazılımı kullanarak tüm riskleri kabul ettiğinizi beyan etmiş sayılırsınız. Production kullanımı tamamen kendi sorumluluğunuzdadır.

---
