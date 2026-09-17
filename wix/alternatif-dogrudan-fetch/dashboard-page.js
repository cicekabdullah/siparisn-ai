/* =============================================================
   MODUL G — WIX VELO: YONETIM PANELI (B2B)
   Dosya: Wix Editor > Sayfa Kodu (Dashboard sayfasi)
   =============================================================

   WIX EDITOR'DE EKLENECEK BILESENLER:
     #tekrarlayici   Repeater   - lead listesi
       Repeater ICINDE (her satirda):
         #metinIsim     Text
         #metinTelefon  Text
         #metinIsletme  Text
         #metinTarih    Text
     #butonYenile    Button     - "Yenile"
     #metinOzet      Text       - "Toplam X kayit"

   KRITIK: Repeater'a verilen her nesnede _id alani ZORUNLUDUR ve
   METIN (string) olmalidir. Backend bunu zaten "_id" olarak donduruyor.

   UX (yonerge): F-Pattern -> en onemli kolon (isim) en solda.
============================================================= */

import { fetch } from 'wix-fetch';

const API_ADRESI = 'https://SIZIN-RENDER-ADRESINIZ.onrender.com';

$w.onReady(function () {
  // Repeater satirlarini doldurma kurali. Satir icinde DAIMA $item kullanilir;
  // $w kullanilirsa tum satirlar ayni veriyle dolar - klasik Velo hatasi.
  $w('#tekrarlayici').onItemReady(($item, itemData) => {
    $item('#metinIsim').text    = itemData.isim;
    $item('#metinTelefon').text = itemData.telefon;
    $item('#metinIsletme').text = itemData.isletme || '—';
    $item('#metinTarih').text   = tarihBicimle(itemData.tarih);
  });

  $w('#butonYenile').onClick(leadleriGetir);
  leadleriGetir();
});

/* ---------- GET /api/leads ----------
   Donen govde: { basari: true, adet: N, leadler: [ {...}, ... ] } */
async function leadleriGetir() {
  $w('#metinOzet').text = 'Yükleniyor…';

  try {
    const yanit = await fetch(API_ADRESI + '/api/leads', { method: 'GET' });
    const veri  = await yanit.json();

    if (veri.basari) {
      // Backend kayitlari zaten en yeniden eskiye siraliyor.
      $w('#tekrarlayici').data = veri.leadler;
      $w('#metinOzet').text = 'Toplam ' + veri.adet + ' kayıt';
    } else {
      $w('#metinOzet').text = veri.hata || 'Kayıtlar getirilemedi.';
    }
  } catch (hata) {
    console.error('Liste hatasi:', hata);
    $w('#metinOzet').text = 'Sunucuya ulaşılamadı.';
  }
}

// "2026-09-17 12:39:05.123" -> "17.09.2026 12:39"
function tarihBicimle(metin) {
  const t = new Date(String(metin).replace(' ', 'T'));
  if (isNaN(t)) return metin;
  return t.toLocaleString('tr-TR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}
