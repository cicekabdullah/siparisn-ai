/* =============================================================
   MODUL G — WIX VELO: KARSILAMA SAYFASI (B2C)
   Dosya: Wix Editor > Sayfa Kodu (Karsilama sayfasi)
   =============================================================

   ONCE WIX EDITOR'DE SU BILESENLERI EKLEYIN ve ID'lerini birebir verin:
     #girisMesaj     Input      - kullanicinin sorusu
     #butonSor       Button     - "Sor"
     #metinCevap     Text       - AI yaniti (baslangicta bos/gizli)
     #girisIsim      Input      - Ad Soyad
     #girisTelefon   Input      - Telefon
     #girisIsletme   Input      - Isletme adi (opsiyonel)
     #butonKaydet    Button     - "Kaydet"
     #metinDurum     Text       - form geri bildirimi

   UX (yonerge): Z-Pattern -> logo sol ust, sohbet karti sag,
   iletisim formu gozun indigi sag alt bolgede. Sohbet kartina
   Glassmorphism: arka plan rengi %8-12 opaklik + blur.
============================================================= */

import { fetch } from 'wix-fetch';

// YAYINDAN ONCE: burayi Render'daki canli adresinizle degistirin.
// Ornek: 'https://siparisn-api.onrender.com'
const API_ADRESI = 'https://SIZIN-RENDER-ADRESINIZ.onrender.com';

// Konusma gecmisi: asistanin baglami hatirlamasi icin backend'e gonderilir.
let gecmis = [];

$w.onReady(function () {
  $w('#metinCevap').text = 'Merhaba! SiparişN hakkında merak ettiklerinizi sorabilirsiniz.';
  $w('#metinDurum').text = '';

  $w('#butonSor').onClick(soruSor);
  $w('#butonKaydet').onClick(leadKaydet);
});

/* ---------- 1) AI SOHBETI: POST /api/sohbet ----------
   KRITIK: gonderilen alan adi "mesaj", donen alan adi "cevap".
   Backend ile birebir ayni olmali; bir harf farki baglantiyi koparir. */
async function soruSor() {
  const mesaj = $w('#girisMesaj').value.trim();

  if (!mesaj) {
    $w('#metinCevap').text = 'Lütfen bir soru yazın.';
    return;
  }

  $w('#butonSor').disable();
  $w('#metinCevap').text = 'Yazıyor…';

  try {
    const yanit = await fetch(API_ADRESI + '/api/sohbet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mesaj: mesaj, gecmis: gecmis })
    });

    const veri = await yanit.json();

    if (veri.basari) {
      $w('#metinCevap').text = veri.cevap;
      $w('#girisMesaj').value = '';

      // Gecmisi son 10 mesajla sinirla: istek govdesi buyumesin.
      gecmis.push({ role: 'user', content: mesaj });
      gecmis.push({ role: 'assistant', content: veri.cevap });
      gecmis = gecmis.slice(-10);
    } else {
      $w('#metinCevap').text = veri.hata || 'Yanıt alınamadı.';
    }
  } catch (hata) {
    // Ag hatasi: kullaniciya teknik detay gosterme.
    console.error('Sohbet hatasi:', hata);
    $w('#metinCevap').text = 'Sunucuya ulaşılamadı, lütfen tekrar deneyin.';
  } finally {
    $w('#butonSor').enable();
  }
}

/* ---------- 2) LEAD KAYDI: POST /api/leads ----------
   Gonderilen alanlar: isim, telefon, isletme, mesaj */
async function leadKaydet() {
  const isim    = $w('#girisIsim').value.trim();
  const telefon = $w('#girisTelefon').value.trim();
  const isletme = $w('#girisIsletme').value.trim();

  // Istemci tarafi on kontrol (backend zaten tekrar dogruluyor).
  if (!isim || !telefon) {
    $w('#metinDurum').text = 'Ad ve telefon alanları zorunludur.';
    return;
  }

  $w('#butonKaydet').disable();
  $w('#metinDurum').text = 'Kaydediliyor…';

  try {
    const yanit = await fetch(API_ADRESI + '/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        isim: isim,
        telefon: telefon,
        isletme: isletme,
        mesaj: $w('#girisMesaj').value.trim()   // son sorusunu not olarak sakla
      })
    });

    const veri = await yanit.json();

    if (veri.basari) {
      $w('#metinDurum').text = '✓ ' + veri.mesaj;
      $w('#girisIsim').value = '';
      $w('#girisTelefon').value = '';
      $w('#girisIsletme').value = '';
    } else {
      $w('#metinDurum').text = veri.hata || 'Kayıt oluşturulamadı.';
    }
  } catch (hata) {
    console.error('Kayit hatasi:', hata);
    $w('#metinDurum').text = 'Sunucuya ulaşılamadı.';
  } finally {
    $w('#butonKaydet').enable();
  }
}
