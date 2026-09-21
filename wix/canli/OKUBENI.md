# Wix'te ÇALIŞAN kod (canlı kopya)

Bu klasördeki dosyalar Wix Studio'da fiilen çalışan kodun birebir kopyasıdır.
Kaynağın tek doğru hâli Wix'tir; burası kayıt ve sözlü savunma içindir.

| Dosya | Wix Studio'da yeri |
|---|---|
| `siparisn.jsw` | Code sidebar → Backend & Public → Backend |
| `masterPage.js` | Code sidebar → Page Code → masterPage (her sayfada çalışır) |
| `ana-sayfa-kodu.js` | Home sayfası → Page Code |
| `panel-sayfa-kodu.js` | Panel sayfası → Page Code |

## Canlı adresler

| | |
|---|---|
| Wix sitesi | https://abdullahcicek20014.wixstudio.com/siparisn |
| Yönetici paneli | https://abdullahcicek20014.wixstudio.com/siparisn/panel |
| Backend | https://siparisn-ai.onrender.com |
| Kaynak kod | https://github.com/cicekabdullah/siparisn-ai |

## Sayfalar

| Sayfa | Slug | Görev |
|---|---|---|
| Home | `/` | Tanıtım + AI sohbet + iletişim formu |
| SSS | `/sss` | Sık sorulan sorular |
| Panel | `/panel` | Lead kayıtları tablosu |

Şablondan gelen "Ürünümüz" sayfası ve Wix Blog uygulaması (menüde
"Faaliyetlerimiz" adıyla görünen Knowledge sayfası) silindi; ikisi de
SiparişN'e ait içerik taşımıyordu.

## Wix'teki bileşen ID'leri

**Header (masterPage — her sayfada ortak)**

| ID | Tür | Görev |
|---|---|---|
| `button11` | Button | "Yönetici Girişi" → `/panel` |
| `box290` | Container | Logo kutusu → tıklayınca Ana Sayfa |
| `vectorImage38` | Vector Art | Logo işareti → tıklayınca Ana Sayfa |
| `text221` | Text | "SiparişN" kelime markası |
| `menu1` | Menu | Site menüsü (sayfalarla eşleşir) |

**Home sayfası (11 bileşen)**

| ID | Tür | Görev |
|---|---|---|
| `girisIsim` | Text Input | Ad Soyad |
| `girisTelefon` | Text Input | Telefon |
| `girisIsletme` | Text Input | İşletme adı |
| `butonKaydet` | Button | Gönder — zemin `#C2410C` |
| `metinDurum` | Text | Form geri bildirimi |
| `butonBalon` | Button | "Asistana sor" — sohbeti açar |
| `kutuSohbet` | Container | Sohbet paneli zemini |
| `butonKapat` | Button | Sohbeti kapatır |
| `metinCevap` | Text | Yazışma (HTML baloncuklar) |
| `girisMesaj` | Text Input | Soru alanı |
| `butonSor` | Button | Sor |

**Panel sayfası (3 bileşen)**

| ID | Tür | Görev |
|---|---|---|
| `tabloKayitlar` | Table | Lead kayıtları — Ad Soyad / Numara / İşletme Adı / Kayıt Tarihi |
| `butonYenile` | Button | Listeyi yeniler |
| `metinOzet` | Text | "Toplam X kayıt" |

Tablonun sütunları Repeater yerine **kod** tarafından tanımlanır
(`panel-sayfa-kodu.js` içindeki `SUTUNLAR`), böylece sütun başlığı ile
Flask API'sinin döndürdüğü alan adı tek yerde eşleşir.

Tablo renkleri Kurumsal Kimlik Kılavuzu'na göre:
başlık `#C2410C` + beyaz Poppins, satırlar beyaz / `#FFF4EE`,
ilk kolon `#1F2937`, diğer hücreler `#374151`, köşeler 8px.

## Veri akışı

```
Wix sayfası (Velo)
      ↓  import
Wix backend (siparisn.jsw)        ← CORS yok, adres tarayıcıda görünmez
      ↓  wix-fetch
Flask API (Render)
   ↙        ↘
ai_service   database
   ↓            ↓
Groq AI      SQLite
```
