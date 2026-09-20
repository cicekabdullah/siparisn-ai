# Aşama 1 — Wix ↔ Render köprüsü (chatbot yok)

Amaç: Wix sitesinin Render'daki backend'inle konuştuğunu kanıtlamak.
Chatbot bu aşamada yok; [CHATBOT-TASARIM.md](CHATBOT-TASARIM.md) Aşama 2'de devreye girer.

Bu aşama bittiğinde elinde şu olur: Wix sayfasındaki formdan bilgi bırakırsın,
kayıt Render'daki veritabanına düşer, Wix'teki panel sayfasında görünür.
Yönergenin "uçtan uca çalışırlık" kriterinin karşılığı budur.

---

## Toplam 11 bileşen

### Ana Sayfa — 5 bileşen

Mevcut tek sayfanın altına yeni bir **Section** ekle, içine şunları koy:

| # | Bileşen | ID | Ayarlar |
|---|---|---|---|
| 1 | Input | `girisIsim` | Placeholder: `Ad Soyad *` |
| 2 | Input | `girisTelefon` | Placeholder: `Telefon *` · tür: Phone |
| 3 | Input | `girisIsletme` | Placeholder: `İşletme adı` |
| 4 | Button | `butonKaydet` | Metin: `Kaydet` · zemin `#C2410C` · köşe 8 px |
| 5 | Text | `metinDurum` | **Metnini sil, boş bırak** · Inter 14 px · `#9CA3AF` |

Bölüm başlığı: "Ücretsiz demo talep edin" — Poppins SemiBold 22 px
Alt metin: "Bilgilerinizi bırakın, kurulumu işletmenize göre birlikte planlayalım."

> Bölümü sayfanın **sağ alt** bölgesine yerleştir. Yönergedeki Z-Pattern
> gözün sayfada indiği son noktanın form olmasını istiyor.

### Panel sayfası — 6 bileşen

Pages panelinden **+ Add Page** → adı `Panel`.

| # | Bileşen | ID | Ayarlar |
|---|---|---|---|
| 1 | Repeater | `tekrarlayici` | Lead listesi |
| 2 | Text (Repeater İÇİNDE) | `metinIsim` | Poppins SemiBold 15 px · `#1F2937` |
| 3 | Text (Repeater İÇİNDE) | `metinTelefon` | Inter 15 px · `#374151` |
| 4 | Text (Repeater İÇİNDE) | `metinIsletme` | Inter 15 px · `#374151` |
| 5 | Text (Repeater İÇİNDE) | `metinTarih` | Inter 14 px · `#6B7280` |
| 6 | Button | `butonYenile` | Metin: `Yenile` · zemin `#C2410C` |
| + | Text | `metinOzet` | Boş bırak — kod "Toplam X kayıt" yazacak |

> 2–5 numaralı metinler Repeater'ın **içinde** olmalı; dışına koyarsan
> tüm satırlar aynı veriyle dolar.
>
> İsim kolonu **en solda** olsun — F-Pattern kuralı.

---

## Kod — üç dosya

Studio'da sol taraftaki **`</>` Code** ikonu → **Start Coding**.

| Sıra | Bizdeki dosya | Studio'da yeri |
|---|---|---|
| 1 | `backend/siparisn.web.js` | Code sidebar → **Backend** → yeni dosya, adı tam olarak `siparisn.web.js` |
| 2 | `pages/index-page-ASAMA1-form.js` | Ana Sayfa seçiliyken **Page Code** |
| 3 | `pages/dashboard-page.js` | Panel sayfası seçiliyken **Page Code** |

Backend dosyasını **önce** oluştur; sayfa kodları onu `import` ediyor.

API adresi zaten dolu: `https://siparisn-ai.onrender.com`

---

## Panel sayfasının yetkisi

`leadleriGetir` fonksiyonu `Permissions.Admin` ile korunuyor — lead listesi ad ve
telefon içerdiği için KVKK kapsamında kişisel veridir, herkese açık olamaz.

Bunun sonucu: Panel sayfasını Wix'te de **üye girişi arkasına** almalısın
(sayfa ayarları → Permissions → Members only). Almazsan sayfa açılır ama
veri gelmez — bu bir hata değil, doğru davranıştır.

Sunumda hızlı bir gösterim istiyorsan geçici olarak `Permissions.Anyone`
yapabilirsin, ama sunumdan sonra geri al ve bunu savunmanda belirt.

---

## Test

**1. Önce backend ayakta mı?**
Tarayıcıda: https://siparisn-ai.onrender.com/health
`{"durum":"aktif"}` görmelisin. İlk açılış 50 saniye sürebilir (ücretsiz plan uykuya geçer).

**2. Wix'te Preview'a gir**, formu doldur, Kaydet'e bas.
Beklenen: `metinDurum` alanında "Kaydınız alındı, ekibimiz en kısa sürede dönüş yapacak."

**3. Panel sayfasına geç.** Az önceki kayıt listede görünmeli.

**4. Çapraz kontrol:** https://siparisn-ai.onrender.com/dashboard
Flask'ın kendi paneli. Aynı kayıt burada da görünüyorsa köprü gerçekten çalışıyor demektir.

---

## Bir şey çalışmazsa bakılacak sıra

| Belirti | Muhtemel sebep |
|---|---|
| `The selector "#..." did not match any elements` | ID yanlış yazılmış veya bileşen o sayfada değil |
| "Sunucuya ulaşılamadı" | Render uyuyor olabilir — `/health`'i bir kez aç, tekrar dene |
| Form çalışıyor ama panel boş | Panel sayfası Members only değil, `Permissions.Admin` veri döndürmüyor |
| Repeater'da tüm satırlar aynı | Satır içinde `$w` kullanılmış, `$item` olmalı |
| Hiçbir şey olmuyor, hata da yok | Backend dosyasının adı `siparisn.web.js` değil |

Tarayıcı konsolunu (F12) açık tut; Velo hataları oraya düşer.

---

## Aşama 1 bittiğinde

Elinde uçtan uca çalışan bir sistem olur. Chatbot'u eklemek için
[CHATBOT-TASARIM.md](CHATBOT-TASARIM.md) dosyasına geç: altı bileşen daha
koyup Ana Sayfa'nın kodunu `pages/index-page.js` ile değiştirmen yeterli.
Backend dosyası aynı kalır — sohbet fonksiyonu zaten içinde duruyor.
