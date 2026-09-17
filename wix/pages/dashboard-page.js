/* =============================================================
   WIX STUDIO — YÖNETİM PANELİ (B2B) sayfa kodu
   =============================================================

   BU SAYFADA OLMASI GEREKEN BİLEŞENLER VE ID'LERİ

     #tekrarlayici    Repeater     — lead listesi
       Repeater'ın İÇİNDE (her satırda tekrarlanan):
         #metinIsim      Text
         #metinTelefon   Text
         #metinIsletme   Text
         #metinTarih     Text
     #butonYenile     Button       — "Yenile"
     #metinOzet       Text         — "Toplam X kayıt"

   KRİTİK — Repeater kuralları:
     1) Verilen her nesnede _id alanı ZORUNLUDUR ve METİN olmalıdır.
        Backend bunu zaten "_id" olarak döndürüyor.
     2) Satır içinde $w DEĞİL $item kullanılır. $w kullanılırsa
        bütün satırlar aynı veriyle dolar — klasik Velo hatası.

   GÜVENLİK: Liste verisi Permissions.Admin ile korunuyor. Bu sayfayı
   Wix'te de üye girişi arkasına almanız gerekir; aksi halde sayfa açılır
   ama veri gelmez (KVKK açısından doğru davranış budur).

   UX (yönerge): F-Pattern — en önemli kolon (isim) en solda.
============================================================= */

import { leadleriGetir } from 'backend/siparisn.web';

$w.onReady(function () {
  // Repeater satırlarını doldurma kuralı.
  $w('#tekrarlayici').onItemReady(($item, veri) => {
    $item('#metinIsim').text    = veri.isim;
    $item('#metinTelefon').text = veri.telefon;
    $item('#metinIsletme').text = veri.isletme || '—';
    $item('#metinTarih').text   = tarihBicimle(veri.tarih);
  });

  $w('#butonYenile').onClick(listeyiYukle);
  listeyiYukle();
});

async function listeyiYukle() {
  $w('#metinOzet').text = 'Yükleniyor…';

  const veri = await leadleriGetir();

  if (veri.basari) {
    // Backend kayıtları zaten en yeniden eskiye sıralıyor.
    $w('#tekrarlayici').data = veri.leadler;
    $w('#metinOzet').text = 'Toplam ' + veri.adet + ' kayıt';
  } else {
    $w('#tekrarlayici').data = [];
    $w('#metinOzet').text = veri.hata || 'Kayıtlar getirilemedi.';
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
