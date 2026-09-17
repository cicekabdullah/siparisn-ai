# Wix Studio ↔ SiparişN Backend — Çalışma Düzeni

## Sıralama kritik

Wix siteleri **HTTPS**'tir ve `http://localhost:5001` adresine istek **atamaz**.
Bu yüzden iş sırası şudur:

```
1. Render'a deploy et  →  https://... adresin olsun
2. O adresi Wix koduna yaz
3. Wix sayfalarını kur ve bağla
```

Render adresi olmadan Wix tarafını bağlamaya çalışmak boşa zaman kaybıdır.
Tasarımı (bileşenler, renkler, yerleşim) Render beklerken paralel yapabilirsin.

---

## Hangi dosya nereye?

| Dosya | Wix Studio'da konumu |
|---|---|
| `backend/siparisn.web.js` | Code sidebar → **Backend** → yeni dosya: `siparisn.web.js` |
| `pages/index-page.js` | Karşılama sayfası → **Page Code** |
| `pages/dashboard-page.js` | Panel sayfası → **Page Code** |

Üç dosyada da `API_ADRESI` sabitini (`backend/siparisn.web.js` içinde) kendi
Render adresinle değiştir. Sayfa kodlarında adres yok — sadece backend'de var.

> `alternatif-dogrudan-fetch/` klasörü, backend web module kullanmadan
> doğrudan tarayıcıdan `wix-fetch` ile çağrı yapan sürümdür. Yönergedeki
> "Velo kodu wix-fetch ile istek atmalı" maddesini birebir karşılar, ancak
> CORS'a açıktır ve Render adresi tarayıcıda görünür. Önerilen sürüm backend'li olandır.

---

## Bileşen ID sözleşmesi

Studio'da bileşeni seç → sağdaki **Properties** panelinden ID ver.
Buradaki isimler kodla birebir aynı olmalı; bir harf farkı bağlantıyı koparır.

### Karşılama sayfası (B2C)

| ID | Bileşen türü | Görevi |
|---|---|---|
| `#girisMesaj` | Input | Kullanıcının sorusu |
| `#butonSor` | Button | "Sor" |
| `#metinCevap` | Text | AI yanıtı |
| `#girisIsim` | Input | Ad Soyad |
| `#girisTelefon` | Input | Telefon |
| `#girisIsletme` | Input | İşletme adı |
| `#butonKaydet` | Button | "Kaydet" |
| `#metinDurum` | Text | Form geri bildirimi |

**UX:** Z-Pattern → logo sol üst, sohbet kartı sağ üst, deger kartları sol alt,
form sağ alt. Sohbet kartı: beyaz %8–12 opaklık + blur + ince kenarlık (Glassmorphism).

### Yönetim paneli (B2B)

| ID | Bileşen türü | Görevi |
|---|---|---|
| `#tekrarlayici` | **Repeater** | Lead listesi |
| `#metinIsim` | Text (repeater İÇİNDE) | Ad Soyad |
| `#metinTelefon` | Text (repeater İÇİNDE) | Telefon |
| `#metinIsletme` | Text (repeater İÇİNDE) | İşletme |
| `#metinTarih` | Text (repeater İÇİNDE) | Tarih |
| `#butonYenile` | Button | "Yenile" |
| `#metinOzet` | Text | "Toplam X kayıt" |

**UX:** F-Pattern → en önemli kolon (isim) en solda.

**Repeater'ın iki altın kuralı:**
1. Her nesnede `_id` alanı zorunlu ve **metin** olmalı — backend zaten `_id` döndürüyor.
2. Satır içinde `$w` değil **`$item`** kullan; `$w` kullanılırsa bütün satırlar aynı veriyle dolar.

---

## Yetkilendirme (KVKK)

`leadleriGetir` fonksiyonu `Permissions.Admin` ile korunuyor: lead listesi ad ve
telefon içerdiği için kişisel veridir, herkese açılamaz.

Bunun sonucu: panel sayfasını Wix'te de **üye girişi arkasına** almalısın
(Studio → sayfa ayarları → Permissions → Members only). Aksi halde sayfa açılır
ama veri gelmez — bu bir hata değil, doğru davranıştır.

---

## Render ücretsiz planı ve sunum

Ücretsiz Render servisleri hareketsizlikte uykuya geçer; ilk istek ~50 saniye sürebilir.
Bunun için iki önlem var:

1. `sunucuyuUyandir()` sayfa açılır açılmaz `/health`'e istek atar — kullanıcı
   soruyu yazana kadar sunucu uyanmış olur.
2. **Sunumdan 5 dakika önce** siteyi bir kez aç. Demo sırasında beklememiş olursun.

---

## Bağlantıyı test etme

1. Flask sunucusu Render'da: `./test_api.sh https://<render-adresin>` → 13/13 geçmeli.
2. Wix'te sayfayı **Preview**'da aç, tarayıcı konsolunu (F12) açık tut.
3. Bir soru sor → yanıt geliyorsa köprü çalışıyor.
4. Formu doldur → panelde göründüğünü doğrula.

Hata olursa bakılacak yer sırası: Render logları → Wix backend log'u
(Studio → Developer Tools → Site Monitoring) → tarayıcı konsolu.

---

# Git Entegrasyonu + Wix CLI ile Çalışma (seçilen yol)

## Neden bu sıra?

İki kural her şeyi belirliyor:

1. **Siteyi GitHub'a bağladığın anda Studio editörü salt-okunur moda geçer.**
   Tasarımı artık Local Editor'den yaparsın. Bu yüzden görsel işi *önce* bitir.
2. **IDE'den yeni sayfa kod dosyası oluşturulamaz.** Sayfa önce Wix editöründe
   yaratılmalı, sonra senkronize edilmeli. Yani iki sayfa da bağlanmadan önce var olmalı.

Buna Render kısıtı da eklenince sıra şu:

```
Aşama 0  Ortam hazırlığı (Node 20.11+, SSH anahtarı)         ← terminal
Aşama 1  Studio sitesi + 2 sayfa + bileşenler + ID'ler        ← tarayıcı
Aşama 2  Flask'ı Render'a deploy et → https adresi            ← tarayıcı
Aşama 3  Studio > Start Coding > GitHub > Connect             ← tarayıcı
Aşama 4  Depoyu klonla, CLI'yi kur, kodu yerleştir            ← terminal
Aşama 5  wix dev ile test → wix publish ile yayınla           ← terminal
```

---

## Aşama 0 — Ortam hazırlığı

Wix CLI **Node 20.11 veya üstünü** istiyor. Makinede Node yok.

```bash
# nvm ile (yönetici parolası gerektirmez)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
# terminali kapatıp aç, sonra:
nvm install 22 && node --version
```

Alternatif: nodejs.org'dan macOS arm64 `.pkg` kurulumu (yönetici parolası ister).

SSH anahtarı (Wix'in verdiği klonlama komutu SSH kullanır):

```bash
ssh-keygen -t ed25519 -C "chuckybebeklife@gmail.com"
cat ~/.ssh/id_ed25519.pub
```

Çıkan satırı GitHub → Settings → SSH and GPG keys → New SSH key ile ekle.

---

## Aşama 1 — Studio sitesi ve sayfalar

1. wix.com/studio → yeni site oluştur (boş şablon en temizi).
2. İki sayfa oluştur: **Ana Sayfa** (karşılama) ve **Panel** (yönetim).
3. Yukarıdaki *Bileşen ID sözleşmesi* tablosuna göre bileşenleri yerleştir ve
   her birine Properties panelinden ID ver.
4. Markayı uygula: turuncu `#FF6B35`, lacivert `#1F2937`, Poppins.
5. Studio responsive çalışır: Z-Pattern ve F-Pattern yerleşimini mobil
   breakpoint'te de kontrol et — masaüstünde çalışan yerleşim telefonda bozulabilir.
6. Panel sayfasını üye girişi arkasına al (sayfa ayarları → Permissions → Members only).

> Bu aşamada henüz kod yok. Sadece boş kutular ve doğru ID'ler.

---

## Aşama 4 — Kodun depoya yerleşmesi

Wix'in oluşturduğu depo klonlandığında yapı şöyledir:

```
<wix-deposu>/
└── src/
    ├── backend/          ← web module'ler buraya
    ├── pages/            ← sayfa kodları: <SayfaAdi>.<id>.js
    ├── public/
    └── styles/
```

Dosyalarımızın gideceği yerler:

| Bizdeki dosya | Wix deposunda |
|---|---|
| `wix/backend/siparisn.web.js` | `src/backend/siparisn.web.js` (yeni dosya, bu isimle) |
| `wix/pages/index-page.js` | `src/pages/AnaSayfa.<id>.js` **içeriği olarak** |
| `wix/pages/dashboard-page.js` | `src/pages/Panel.<id>.js` **içeriği olarak** |

> **Sayfa kod dosyalarını YENİDEN ADLANDIRMA.** Wix bu isimlerdeki kimlik
> dizisiyle dosyayı sayfayla eşleştirir. Adı değiştirirsen kodun yok sayılır
> ve sayfa için yeni bir boş dosya oluşturulur. Bizim sayfa kodlarımız, Wix'in
> ürettiği mevcut dosyanın *içine* yapıştırılır.

Bu depo, Flask deposundan **ayrıdır**. İki ayrı GitHub deposu olacak:
biri backend (bu proje), biri Wix sitesi.

---

## Aşama 5 — Test ve yayın

```bash
npm install -g @wix/cli   # bir kez
wix dev                   # Local Editor açılır, IDE ile canlı senkron
wix preview               # paylaşılabilir önizleme (önce bir kez publish gerekir)
wix publish               # yayına al
```

`wix publish` sorar: `Latest commit from origin/main` mı, `Local code` mu?
**Yerel koddan yayınlamak, canlı siteyi depoyla senkronsuz bırakır.** Sonradan
depodan yayınlarsan yerel kodun ezilir. Alışkanlık olarak: önce commit + push,
sonra `origin/main`'den yayınla.
