/* =============================================================
   WIX STUDIO — KARŞILAMA SAYFASI (B2C) sayfa kodu
   Konumu: Studio Editor > sayfayı aç > Code sidebar > Page Code
   (Git entegrasyonu: src/pages/<SayfaAdi>.<id>.js)
   =============================================================

   BU SAYFADA OLMASI GEREKEN BİLEŞENLER VE ID'LERİ
   (ID'yi Studio'da bileşeni seçip sağdaki Properties panelinden verirsiniz)

     #girisMesaj      Input        — kullanıcının sorusu
     #butonSor        Button       — "Sor"
     #metinCevap      Text         — AI yanıtı
     #girisIsim       Input        — Ad Soyad
     #girisTelefon    Input        — Telefon
     #girisIsletme    Input        — İşletme adı
     #butonKaydet     Button       — "Kaydet"
     #metinDurum      Text         — form geri bildirimi

   Bu dosya dış API'yi DOĞRUDAN çağırmaz; backend web module'ünü çağırır.
   Böylece CORS sorunu oluşmaz ve Render adresi tarayıcıya sızmaz.

   UX (yönerge): Z-Pattern — logo sol üst, sohbet kartı sağ üst,
   iletişim formu gözün indiği sağ alt bölge. Sohbet kartına
   Glassmorphism: %8–12 opaklıkta beyaz dolgu + blur + ince kenarlık.
============================================================= */

import { sohbetGonder, leadKaydet, sunucuyuUyandir } from 'backend/siparisn.web';

// Konuşma geçmişi: asistanın bağlamı hatırlaması için backend'e gönderilir.
let gecmis = [];

$w.onReady(function () {
  $w('#metinCevap').text = 'Merhaba! SiparişN hakkında merak ettiklerinizi sorabilirsiniz.';
  $w('#metinDurum').text = '';

  $w('#butonSor').onClick(soruSor);
  $w('#butonKaydet').onClick(formuGonder);

  // Enter'a basınca da soru sorulsun.
  $w('#girisMesaj').onKeyPress((olay) => {
    if (olay.key === 'Enter') soruSor();
  });

  // Render ücretsiz planda uykuya geçer; sayfa açılır açılmaz uyandır ki
  // kullanıcı ilk soruyu sorduğunda 50 saniye beklemesin.
  sunucuyuUyandir().catch(() => { /* sessizce geç, kritik değil */ });
});

/* ---------- AI SOHBETİ ---------- */
async function soruSor() {
  const mesaj = $w('#girisMesaj').value.trim();

  if (!mesaj) {
    $w('#metinCevap').text = 'Lütfen bir soru yazın.';
    return;
  }

  $w('#butonSor').disable();
  $w('#metinCevap').text = 'Yazıyor…';

  // Web module çağrısı: arka planda Wix sunucusunda çalışır.
  const veri = await sohbetGonder(mesaj, gecmis);

  if (veri.basari) {
    $w('#metinCevap').text = veri.cevap;
    $w('#girisMesaj').value = '';

    // Geçmişi son 10 mesajla sınırla: istek gövdesi şişmesin.
    gecmis.push({ role: 'user', content: mesaj });
    gecmis.push({ role: 'assistant', content: veri.cevap });
    gecmis = gecmis.slice(-10);
  } else {
    $w('#metinCevap').text = veri.hata || 'Yanıt alınamadı.';
  }

  $w('#butonSor').enable();
}

/* ---------- LEAD KAYDI ---------- */
async function formuGonder() {
  const isim    = $w('#girisIsim').value.trim();
  const telefon = $w('#girisTelefon').value.trim();
  const isletme = $w('#girisIsletme').value.trim();

  // İstemci tarafı ön kontrol; backend ve Flask zaten tekrar doğruluyor.
  if (!isim || !telefon) {
    $w('#metinDurum').text = 'Ad ve telefon alanları zorunludur.';
    return;
  }

  $w('#butonKaydet').disable();
  $w('#metinDurum').text = 'Kaydediliyor…';

  const veri = await leadKaydet({
    isim: isim,
    telefon: telefon,
    isletme: isletme,
    mesaj: $w('#girisMesaj').value.trim()   // son sorusunu not olarak sakla
  });

  if (veri.basari) {
    $w('#metinDurum').text = '✓ ' + veri.mesaj;
    $w('#girisIsim').value = '';
    $w('#girisTelefon').value = '';
    $w('#girisIsletme').value = '';
  } else {
    $w('#metinDurum').text = veri.hata || 'Kayıt oluşturulamadı.';
  }

  $w('#butonKaydet').enable();
}
