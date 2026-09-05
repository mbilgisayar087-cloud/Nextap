# NOTINGO

İşletmeler için NFC + QR destekli dijital işletme kartı yönetim sistemi.

React + TypeScript (Vite) frontend, Supabase (PostgreSQL + Auth + Storage) backend.
Fake demo / localStorage YOK — her işlem gerçek veritabanına yazılır.

## 1. Supabase projesi kurulumu (elle yapmanız gereken adımlar)

1. https://supabase.com üzerinde yeni bir proje oluşturun.
2. Proje ayarlarından **Project URL** ve **anon public key** değerlerini alın.
3. Supabase Dashboard → **SQL Editor** açın, sırasıyla şu dosyaları tam olarak çalıştırın:
   - `supabase/migrations/0001_init.sql` → tüm tabloları, RLS politikalarını, storage bucket'ını ve kategori seed verisini oluşturur.
   - `supabase/migrations/0003_extended_fields.sql` → slogan, SMS iletişim kanalı, Google puanı, kampanya kupon kodu gibi genişletilmiş alanları ekler (mevcut kuruluma ek migration; `0002`'den önce veya sonra çalıştırılabilir).
4. Dashboard → **Authentication → Users → Add user** ile kendinize bir admin kullanıcı oluşturun (e-posta + şifre). Bu proje Supabase Auth kullanır; ayrı bir admin sistemi yoktur — oluşturduğunuz her kullanıcı panele giriş yapabilir.
5. (Opsiyonel, test verisi) `supabase/migrations/0002_seed_dev.sql` dosyasını SQL Editor'de çalıştırın. Bu dosya ilk `auth.users` kaydını sahibi kabul ederek örnek "ABC KEBAP" işletmesini ve `NFC-000001` kartını oluşturur. **Sadece geliştirme ortamında** çalıştırın.

## 2. Ortam değişkenleri

```
cp .env.example .env
```

`.env` içine adım 1'de aldığınız `VITE_SUPABASE_URL` ve `VITE_SUPABASE_ANON_KEY` değerlerini, ve NFC kartlara yazılacak `VITE_PUBLIC_BASE_URL` (production domaininiz, örn. `https://notingo.com`) değerini girin.

Service Role Key frontend'e **asla** verilmez — bu projede kullanılmıyor.

## 3. Çalıştırma

```
npm install
npm run dev
```

`http://localhost:5173/admin/login` üzerinden adım 1.4'te oluşturduğunuz kullanıcıyla giriş yapın.

Production build: `npm run build` (çıktı `dist/` klasöründe; Vercel/Netlify gibi herhangi bir statik hosting'e deploy edilebilir).

## 4. Proje yapısı

```
src/
  types/       veritabanı tiplerini yansıtan TypeScript tipleri
  lib/         Supabase client kurulumu
  services/    tüm CRUD işlemleri (business, section, nfc, auth, ...)
  hooks/       useAuth (Supabase session context)
  components/
    layout/    AdminLayout (sidebar+drawer), RequireAuth
    cards/     SectionCardShell (sürüklenebilir kart), AddSectionMenu
    sections/  her bölüm tipi için editör (İletişim, Sosyal, Galeri, ...)
    public/    BusinessPublicView — hem canlı önizlemede hem /k/[code] sayfasında kullanılan tek bileşen
    ui/        Toast, Modal, Switch, Spinner, EmptyState
  pages/
    admin/     Login, Dashboard, Businesses, BusinessEditor, NfcCards, Categories, Settings
    public/    PublicBusinessPage (/k/:cardCode), PreviewBusinessPage (/k/preview/:businessId, sahibi için)
supabase/
  migrations/  0001_init.sql (şema+RLS+storage+kategori seed), 0002_seed_dev.sql (opsiyonel test verisi)
```

## 5. Nasıl çalışır (uçtan uca akış)

1. `/admin/login` → Supabase Auth ile giriş.
2. `/admin/businesses` → **+ Yeni İşletme** → isim/kategori/aktiflik girilir → `businesses` tablosuna kaydolur, varsayılan olarak "İşletme Bilgileri" ve "İletişim" bölümleri `business_sections` tablosuna eklenir.
3. `/admin/businesses/:id` (editör):
   - Sol tarafta bölüm kartları (`⋮⋮` tutamacından sürüklenip bırakılabilir — sıra `business_sections.sort_order`'a anında kaydedilir).
   - Her kartın sağındaki switch, `business_sections.is_active`'i günceller.
   - "+ Bölüm Ekle" ile yeni bölüm tipleri (Konum, Ödeme, Galeri, Hizmetler, ...) eklenir.
   - Sağ tarafta telefon çerçevesi içinde canlı önizleme (`BusinessPublicView`) — kaydedilen her değişiklik anında yansır.
4. `/admin/nfc-cards` → **+ NFC Kart Ekle** (kod otomatik üretilir: `NFC-000001`, `NFC-000002`, ...) → **Yönet** → bir işletmeye bağlanır (`nfc_cards.business_id`, `status='active'`).
5. Fiziksel NFC karta **sadece** `https://DOMAIN/k/NFC-000001` URL'si yazılır (panelde "Kopyala" / "QR İndir" ile alınır).
6. Müşteri kartı okuttuğunda `/k/NFC-000001` açılır → `nfc_cards.card_code` → `business_id` → `businesses` + tüm alt tablolar çekilir → sadece **aktif** bölümler, admin panelindeki sırayla gösterilir. Login yok, sidebar yok, admin arayüzü yok.
7. Kart pasifleştirilirse / bağlantısı kaldırılırsa / hiç yoksa, public sayfa buna göre bilgilendirici bir mesaj gösterir (bkz. `PublicBusinessPage.tsx`).

## 6. Test senaryosu (proje talebindeki 31 adım)

Kurulumdan sonra sırayla deneyin:
admin girişi → işletme oluştur → düzenle (logo/kapak yükle) → iletişim/sosyal/IBAN/hizmet/galeri/kampanya/çalışma saatleri ekle → bir bölümü pasifleştir → kartları sürükle-bırak ile sırala → sayfayı yenile (sıra korunur, çünkü veritabanına yazıldı) → NFC kart oluştur → işletmeye bağla → `/k/NFC-000001` adresini yeni sekmede aç → IBAN kopyala, rehbere ekle, WhatsApp/telefon/Maps/sosyal linklerini dene → panelden kartı pasifleştir → `/k/NFC-000001`'i tekrar aç → pasif mesajını gör → kartı başka bir işletmeye bağla → aynı URL'nin artık yeni işletmeyi gösterdiğini doğrula.

## 8. Önizleme / Public sayfa tasarımı

Public sayfa (`/k/[card_code]`) ve editördeki canlı önizleme **birebir aynı bileşeni** (`src/components/public/BusinessPublicView.tsx`) kullanır — Tailwind CSS v4 + lucide-react ile yazılmıştır (admin panelinin geri kalanı kendi tasarım sistemini kullanmaya devam eder, ikisi `.legacy-ui` sınıfıyla birbirinden izole edilmiştir). Editördeki "Canlı Önizleme" paneli, gerçek bir telefon genişliğinde (390px) ayrı bir `<iframe>` içinde render edilir — böylece Tailwind'in mobil kırılım noktaları (`sm:` vb.) gerçek bir telefonda göründüğü gibi devreye girer ve önizleme public sayfayla piksel bazında aynı olur.

## 9. Bilinen sınırlamalar / sonraki adımlar

- Galeri fotoğraf sıralaması sürükle-bırak yerine ↑/↓ butonlarıyla yapılır (bölüm kartları için tam sürükle-bırak `@dnd-kit` ile mevcuttur; galeri içi liste için basitleştirilmiştir).
- E-posta/parola sıfırlama akışı eklenmedi — kullanıcılar Supabase Dashboard üzerinden yönetilir.
- Bu, birden fazla admin kullanıcısının aynı işletmeleri paylaşabildiği bir "team" sistemi değildir; her işletme tek bir `owner_id`'ye bağlıdır (RLS bunu zorunlu kılar).
