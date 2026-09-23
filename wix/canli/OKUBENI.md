# Wix'te ÇALIŞAN kod (canlı kopya)

Bu klasördeki dosyalar Wix Studio'da fiilen çalışan kodun birebir kopyasıdır.
Kaynağın tek doğru hâli Wix'tir; burası kayıt ve sözlü savunma içindir.

| Dosya | Wix Studio'da yeri |
|---|---|
| `siparisn.jsw` | Code sidebar → Backend & Public → Backend |
| `masterPage.js` | Code sidebar → Page Code → masterPage (her sayfada çalışır) |
| `sohbet-ortak-kod.js` | **Üç sayfada da aynı dosya**: ana sayfa, hakkımızda, Merak Edilenler → Page Code |
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

**Sohbet bileşenleri — üç sayfada da AYNI ID'ler**

Wix bileşen ID'lerini sayfa başına üretir. Aynı kodun üç sayfada da
çalışabilmesi için ID'ler elle eşitlendi (ana sayfadaki sohbet kartı
`box291` iken `box297` olarak yeniden adlandırıldı).

| ID | Tür | Görev |
|---|---|---|
| `button21` | Button | "Asistana sor" — sohbeti açar (kartın DIŞINDA, sabitlenmiş) |
| `box297` | Container | Sohbet kartı (sabitlenmiş) |
| `textBox1` | Text Box | AI cevapları — yazışma dökümü, readOnly |
| `textBox2` | Text Box | Kullanıcının sorusu |
| `button20` | Button | "Gönder" |
| `button22` | Button | "Kapat" |

**İletişim formu — YALNIZCA ana sayfada**

| ID | Tür | Görev |
|---|---|---|
| `girisIsim` | Text Input | Ad Soyad |
| `girisTelefon` | Text Input | Telefon |
| `butonKaydet` | Button | Gönder — zemin `#C2410C` |
| `metinDurum` | Text | Form geri bildirimi |

Diğer iki sayfada bu öğeler yok. Wix'te olmayan bir öğeye **metot**
çağırmak (`$w('#butonKaydet').onClick(...)`) `TypeError` fırlatır ve
sayfanın tamamını kırar; **özellik ataması** (`.text = ''`) ise güvenlidir.
Bu yüzden kod, onClick bağlamadan önce öğenin varlığını doğrular.

`textBox1` bir Text öğesi değil, çok satırlı **giriş kutusu**. Giriş kutuları
yalnızca düz metin taşıdığı için (`.value`, `.html` yok) yazışma renkli
baloncuk yerine `Siz:` / `SiparişN:` satırları hâlinde yazılıyor.
Kutu kendi kendine en alta kaymadığından ekranda son 4 mesaj tutuluyor.

**Panel sayfası (5 bileşen)**

| ID | Tür | Görev |
|---|---|---|
| `repeater1` | Repeater | Lead listesi |
| `box291` | Container | Satır kutusu (repeater item) |
| `metinIsim` | Text (satır İÇİNDE) | Ad Soyad |
| `metinTelefon` | Text (satır İÇİNDE) | Telefon |
| `butonYenile` | Button | Listeyi yeniler |
| `metinOzet` | Text | "Toplam X kayıt" |

Satır içindeki metinler `$w` ile değil `$item` ile doldurulur; `$w`
kullanılırsa bütün satırlar aynı veriyle dolar (klasik Velo hatası).

Not: Wix ID'leri sayfa başına üretildiği için Home sayfasındaki `box291`
(sohbet kartı) ile Panel sayfasındaki `box291` (satır kutusu) farklı
öğelerdir; ikisi aynı ada sahip olsa da karışmaz.

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
