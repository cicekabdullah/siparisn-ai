# Wix'te ÇALIŞAN kod (canlı kopya)

Bu klasördeki dosyalar Wix Studio'da fiilen çalışan kodun birebir kopyasıdır.
Kaynağın tek doğru hâli Wix'tir; burası kayıt ve sözlü savunma içindir.

| Dosya | Wix Studio'da yeri |
|---|---|
| `siparisn.jsw` | Code sidebar → Backend & Public → Backend |
| `ana-sayfa-kodu.js` | Home sayfası → Page Code |
| `panel-sayfa-kodu.js` | Panel sayfası → Page Code |

## Canlı adresler

| | |
|---|---|
| Wix sitesi | https://abdullahcicek20014.wixstudio.com/siparisn |
| Backend | https://siparisn-ai.onrender.com |
| Kaynak kod | https://github.com/cicekabdullah/siparisn-ai |

## Wix'teki bileşen ID'leri

**Home sayfası (11 bileşen)**

| ID | Tür | Görev |
|---|---|---|
| `metinBaslik` | Title | "Ücretsiz demo talep edin" |
| `girisIsim` | Text Input | Ad Soyad |
| `girisTelefon` | Text Input | Telefon |
| `butonKaydet` | Button | Kaydet — zemin `#C2410C` |
| `metinDurum` | Text | Form geri bildirimi |
| `butonBalon` | Button | "Asistana sor" — sohbeti açar |
| `kutuSohbet` | Container | Sohbet paneli zemini |
| `butonKapat` | Button | Sohbeti kapatır |
| `metinCevap` | Text | Yazışma (HTML) |
| `girisMesaj` | Text Input | Soru alanı |
| `butonSor` | Button | Sor |

**Panel sayfası (7 bileşen)**

| ID | Tür | Görev |
|---|---|---|
| `tekrarlayici` | Repeater | Lead listesi |
| `metinIsim` | Text (repeater İÇİNDE) | Ad Soyad |
| `metinTelefon` | Text (repeater İÇİNDE) | Telefon |
| `metinIsletme` | Text (repeater İÇİNDE) | İşletme |
| `metinTarih` | Text (repeater İÇİNDE) | Tarih |
| `butonYenile` | Button | Listeyi yeniler |
| `metinOzet` | Text | "Toplam X kayıt" |

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
