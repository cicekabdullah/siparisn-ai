import { leadleriGetir } from 'backend/siparisn.jsw';

/* SiparişN — Yönetim Paneli
   Bileşenler: #tekrarlayici (Repeater) + satır içinde
   #metinIsim #metinTelefon #metinIsletme #metinTarih
   Ayrıca: #butonYenile #metinOzet

   F-Pattern: en önemli kolon (isim) en üstte/solda. */

$w.onReady(function () {
  $w('#butonYenile').label = 'Yenile';
  $w('#metinOzet').text = 'Yükleniyor...';

  // Repeater satırlarını doldurma kuralı.
  // Satır içinde $w DEĞİL $item kullanılır; $w kullanılırsa
  // bütün satırlar aynı veriyle dolar (klasik Velo hatası).
  $w('#tekrarlayici').onItemReady(function ($item, veri) {
    $item('#metinIsim').text = veri.isim;
    $item('#metinTelefon').text = veri.telefon;
    $item('#metinIsletme').text = veri.isletme || '—';
    $item('#metinTarih').text = tarihBicimle(veri.tarih);
  });

  $w('#butonYenile').onClick(listeyiYukle);
  listeyiYukle();
});

async function listeyiYukle() {
  $w('#metinOzet').text = 'Yükleniyor...';

  try {
    const veri = await leadleriGetir();

    if (veri.basari) {
      // Backend kayıtları zaten en yeniden eskiye sıralıyor.
      // Her nesnede _id alanı zorunlu ve METİN olmalı — backend döndürüyor.
      $w('#tekrarlayici').data = veri.leadler;
      $w('#metinOzet').text = 'Toplam ' + veri.adet + ' kayıt';
    } else {
      $w('#tekrarlayici').data = [];
      $w('#metinOzet').text = veri.hata || 'Kayıtlar getirilemedi.';
    }
  } catch (hata) {
    console.error('Liste hatasi:', hata);
    $w('#tekrarlayici').data = [];
    $w('#metinOzet').text = 'Sunucuya ulaşılamadı.';
  }
}

// '2026-09-21 10:02:39.110' -> '21.09.2026 10:02'
function tarihBicimle(metin) {
  const t = new Date(String(metin).replace(' ', 'T'));
  if (isNaN(t)) return metin;
  return t.toLocaleString('tr-TR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}
