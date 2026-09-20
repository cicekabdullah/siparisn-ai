/* =============================================================
   AŞAMA 1 — ANA SAYFA kodu (yalnızca lead formu, chatbot YOK)
   Studio'da yeri: Ana Sayfa seçiliyken Code paneli > Page Code
   =============================================================

   Amaç: Wix ile Render'daki backend arasındaki köprünün çalıştığını
   kanıtlamak. Chatbot bu aşamada yok; Aşama 2'de eklenecek.

   BU SAYFADA OLMASI GEREKEN 5 BİLEŞEN:
     #girisIsim      Input   — Ad Soyad
     #girisTelefon   Input   — Telefon
     #girisIsletme   Input   — İşletme adı
     #butonKaydet    Button  — Kaydet
     #metinDurum     Text    — geri bildirim (başlangıçta boş)

   ÖNEMLİ: Kod yalnızca yukarıdaki beş bileşene dokunur. Sayfada
   olmayan bir bileşeni çağırsaydı Velo hata verir ve form da çalışmazdı.
   Bu yüzden chatbot kodu bilerek bu dosyada yok.
============================================================= */

import { leadKaydet, sunucuyuUyandir } from 'backend/siparisn.web';

$w.onReady(function () {
  $w('#metinDurum').text = '';
  $w('#butonKaydet').onClick(formuGonder);

  // Render ücretsiz planda uykuya geçer; ilk istek 50 saniye sürebilir.
  // Sayfa açılır açılmaz sunucuya dokunup uyandırıyoruz ki kullanıcı
  // formu doldurup "Kaydet"e bastığında beklemesin.
  sunucuyuUyandir().catch(() => { /* kritik değil, sessizce geç */ });
});

/* ---------------------------------------------------------------
   LEAD KAYDI  ->  backend/siparisn.web.js  ->  POST /api/leads

   KRİTİK: Gönderilen alan adları backend ile BİREBİR aynı olmalı:
   isim · telefon · isletme · mesaj
   Bir harf farkı bağlantıyı koparır.
   --------------------------------------------------------------- */
async function formuGonder() {
  const isim    = $w('#girisIsim').value.trim();
  const telefon = $w('#girisTelefon').value.trim();
  const isletme = $w('#girisIsletme').value.trim();

  // İstemci tarafı ön kontrol.
  // Not: Bu kontrol kullanıcıya hızlı geri bildirim içindir, güvenlik
  // için değildir. Asıl doğrulama Flask'taki routes.py içinde yapılır;
  // orada eksik veri 400, geçersiz telefon yine 400 döner.
  if (!isim || !telefon) {
    $w('#metinDurum').text = 'Ad ve telefon alanları zorunludur.';
    return;
  }

  // Çift tıklamayı engelle ve kullanıcıya ne olduğunu söyle.
  $w('#butonKaydet').disable();
  $w('#metinDurum').text = 'Kaydediliyor…';

  try {
    const veri = await leadKaydet({
      isim: isim,
      telefon: telefon,
      isletme: isletme,
      mesaj: ''
    });

    if (veri.basari) {
      // Backend'in döndürdüğü mesajı gösteriyoruz; metin tek yerde dursun.
      $w('#metinDurum').text = veri.mesaj;
      $w('#girisIsim').value = '';
      $w('#girisTelefon').value = '';
      $w('#girisIsletme').value = '';
    } else {
      $w('#metinDurum').text = veri.hata || 'Kayıt oluşturulamadı.';
    }
  } catch (hata) {
    // Ağ hatası: kullanıcıya teknik ayrıntı gösterme, konsola yaz.
    console.error('Kayit hatasi:', hata);
    $w('#metinDurum').text = 'Sunucuya ulaşılamadı, lütfen tekrar deneyin.';
  } finally {
    // Sonuç ne olursa olsun buton tekrar kullanılabilir olmalı.
    $w('#butonKaydet').enable();
  }
}
