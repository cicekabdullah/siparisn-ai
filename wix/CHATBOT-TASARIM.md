# Wix Studio — Açılır Sohbet Sekmesi Tasarım Reçetesi

Tasarımı Studio'da sen kuracaksın. Bu dosya hangi kutuyu nereye koyacağını,
hangi ölçü ve rengi vereceğini, hangi ID'yi yazacağını söyler.
Ölçü ve renkler Kurumsal Kimlik Kılavuzu Sürüm 1.0'dan gelir.

---

## Yapı: iki durum

```
KAPALI DURUM                     AÇIK DURUM
┌──────────────┐                 ┌──────────────────────┐
│              │                 │ SiparişN Asistanı  ✕ │
│   sayfa      │                 ├──────────────────────┤
│              │                 │                      │
│              │                 │   sohbet alanı       │
│         ┌──┐ │                 │                      │
│         │N │ │  ← tıkla →      ├──────────────────────┤
└─────────┴──┴─┘                 │ [yaz…]         [Sor] │
                                 └──────────────────────┘
```

Kapalıyken sadece rozet görünür. Tıklayınca panel açılır, ✕ ile kapanır.

---

## 1 · Rozet düğmesi (kapalı durum)

Studio'da **Add → Image** ile `siparisn-rozet.svg` dosyasını yükle
(`~/Documents/SiparisN_Kurumsal_Kimlik/logo/` içinde).

| Ayar | Değer |
|---|---|
| ID | `butonBalon` |
| Boyut | 56 × 56 px |
| Position (Inspector) | **Fixed** |
| Pin | Sağ alt köşe |
| Sağ boşluk | 24 px |
| Alt boşluk | 24 px |
| Köşe yarıçapı | **Dokunma** — rozetin kendi %6,4 yarıçapı var |
| Gölge | Y: 8, Blur: 24, Siyah %25 |

> Rozeti daire yapma, kırpma, esnetme. Kılavuz s.13: orantı bozulamaz.
> Rozet kendi turuncu zeminini taşıdığı için arkasına ayrı bir renk kutusu koymana gerek yok.

---

## 2 · Sohbet paneli (açık durum)

**Add → Box** ile bir kutu ekle. Bu kutu diğer her şeyin kabıdır.

| Ayar | Değer |
|---|---|
| ID | `kutuSohbet` |
| Boyut | 360 × 480 px (mobilde genişlik %90) |
| Position | **Fixed** |
| Pin | Sağ alt köşe |
| Sağ boşluk | 24 px |
| Alt boşluk | 92 px (rozetin üstünde kalsın) |
| Arka plan | `#1F2937` (Gece Lacivert) |
| Köşe yarıçapı | **8 px** — kılavuz s.26 |
| Kenarlık | 1 px, beyaz %14 opaklık |
| Gölge | Y: 18, Blur: 50, Siyah %35 |

### Panelin içine koyacakların

**a) Başlık şeridi** (kutunun üstü, yükseklik 52 px)

| Öğe | ID | Ayar |
|---|---|---|
| Metin | — | "SiparişN Asistanı" · Poppins Medium · 16 px · `#FFFFFF` |
| Kapat düğmesi | `butonKapat` | ✕ · 28 × 28 px · metin rengi `#9CA3AF` |

**b) Sohbet alanı**

| Öğe | ID | Ayar |
|---|---|---|
| Metin | `metinCevap` | Inter Regular · 15 px · `#E5E7EB` · satır aralığı 1,55 |

Arka planı siyah %24 opaklık, köşe 8 px, iç boşluk 14 px ver.
Yüksekliği sabitle (yaklaşık 300 px) ve **Scroll** özelliğini aç.

**c) Giriş şeridi** (kutunun altı)

| Öğe | ID | Ayar |
|---|---|---|
| Input | `girisMesaj` | Inter · 15 px · zemin beyaz %7 · kenarlık beyaz %18 · köşe 8 px · metin `#FFFFFF` · placeholder `#9CA3AF` · placeholder metni: "Sorunuzu yazın" |
| Button | `butonSor` | "Sor" · Poppins Medium · 15 px · **zemin `#C2410C`** · metin beyaz · köşe 8 px |

> **Butonun zemini neden `#C2410C`?** Kılavuz s.7: beyaz metin + `#FF6B35`
> zemin 2,8:1 kontrast verir ve "Kullanılmaz" olarak işaretlidir. Beyaz metinli
> buton gerektiğinde zemin `#C2410C` olur (5,2:1). s.21'de bu kural tüm web ve
> mobil arayüz için bağlayıcı.

---

## 3 · Lead formu (panelde değil, sayfada)

Form sohbet penceresinin içine değil, **Ana Sayfa'nın bir bölümüne** girer.
Yönergedeki Z-Pattern buna dayanır: göz sayfanın sağ altına indiğinde forma denk gelmeli.

| Öğe | ID | Placeholder |
|---|---|---|
| Input | `girisIsim` | Ad Soyad * |
| Input | `girisTelefon` | Telefon * |
| Input | `girisIsletme` | İşletme adı |
| Button | `butonKaydet` | Kaydet — zemin `#C2410C` |
| Metin | `metinDurum` | (boş bırak, kod dolduracak) |

Bölüm başlığı: "Ücretsiz demo talep edin" · Poppins SemiBold · 22 px
Alt metin: "Bilgilerinizi bırakın, kurulumu işletmenize göre birlikte planlayalım." · Inter · 16 px

---

## 4 · Panel sayfası (ikinci sayfa)

Pages panelinden **+ Add Page** → adı `Panel`.

| Öğe | ID | Not |
|---|---|---|
| Repeater | `tekrarlayici` | Lead listesi |
| Metin (Repeater İÇİNDE) | `metinIsim` | Poppins SemiBold · 15 px · `#1F2937` |
| Metin (Repeater İÇİNDE) | `metinTelefon` | Inter · 15 px · `#374151` |
| Metin (Repeater İÇİNDE) | `metinIsletme` | Inter · 15 px · `#374151` |
| Metin (Repeater İÇİNDE) | `metinTarih` | Inter · 14 px · `#6B7280` |
| Button | `butonYenile` | "Yenile" · zemin `#C2410C` |
| Metin | `metinOzet` | "Toplam X kayıt" |

Zemin `#F9FAFB`, kartlar beyaz, kenarlıklar `#E5E7EB`, köşeler 8 px.
En önemli kolon (isim) **en solda** — yönergedeki F-Pattern kuralı.

---

## 5 · Kodu nereye yapıştıracaksın

Studio'da sol taraftaki **`</>` Code** ikonu → **Start Coding**.

| Dosya | Studio'da yeri |
|---|---|
| `backend/siparisn.web.js` | Code sidebar → **Backend** → yeni dosya: `siparisn.web.js` |
| `pages/index-page.js` | Ana Sayfa seçiliyken **Page Code** |
| `pages/dashboard-page.js` | Panel sayfası seçiliyken **Page Code** |

GitHub bağlantısı kurmuyoruz; kod doğrudan Studio içinde yaşayacak.

---

## 6 · Kontrol listesi

Tasarımı bitirdiğinde şunları doğrula:

- [ ] 11 ID birebir yazıldı mı? (`butonBalon`, `kutuSohbet`, `butonKapat`, `metinCevap`, `girisMesaj`, `butonSor`, `girisIsim`, `girisTelefon`, `girisIsletme`, `butonKaydet`, `metinDurum`)
- [ ] Rozet ve panel **Fixed** pozisyonda mı? (sayfa kayınca yerinde kalmalı)
- [ ] Beyaz metinli butonların zemini `#C2410C` mi? (`#FF6B35` değil)
- [ ] Köşeler 8 px mi?
- [ ] Rozetin oranı bozulmamış mı?
- [ ] Mobil breakpoint'te panel ekranı taşmıyor mu?

Bir harf farkı bağlantıyı koparır: ID'ler koddaki isimlerle **birebir** aynı olmalı.
