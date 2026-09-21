import { leadleriGetir } from 'backend/siparisn.jsw';

/* =========================================================
   SiparişN — Yönetici Paneli

   #repeater1        lead listesi
     #box291           satır kutusu (repeater item)
       #metinIsim        Ad Soyad
       #metinTelefon     Telefon
   #butonYenile      listeyi yeniler
   #metinOzet        "Toplam X kayıt"

   Akış: Ana Sayfa'daki #butonKaydet'e basılınca #girisIsim ve
   #girisTelefon değerleri backend/siparisn.jsw üzerinden Flask
   API'sine gidip SQLite'a yazılıyor. Bu sayfa aynı API'den
   okuyup repeater'a basıyor; yani panel her açılışta güncel.
   ========================================================= */

$w.onReady(function () {
  $w('#butonYenile').label = 'Yenile';

  /* Repeater satırlarını doldurma kuralı:
     satır İÇİNDE $w değil $item kullanılır. $w kullanılırsa
     bütün satırlar aynı veriyle dolar — klasik Velo hatası. */
  $w('#repeater1').onItemReady(function ($item, veri) {
    $item('#metinIsim').text = veri.isim;
    $item('#metinTelefon').text = veri.telefon;
  });

  $w('#butonYenile').onClick(listeyiYukle);
  listeyiYukle();
});

async function listeyiYukle() {
  $w('#metinOzet').text = 'Yükleniyor...';

  try {
    const veri = await leadleriGetir();

    if (veri.basari) {
      // Backend kayıtları en yeniden eskiye sıralı döndürüyor.
      $w('#repeater1').data = veri.leadler.map(satirHazirla);
      $w('#metinOzet').text = veri.adet > 0
        ? 'Toplam ' + veri.adet + ' kayıt'
        : 'Henüz kayıt yok.';
    } else {
      $w('#repeater1').data = [];
      $w('#metinOzet').text = veri.hata || 'Kayıtlar getirilemedi.';
    }
  } catch (hata) {
    console.error('Liste hatasi:', hata);
    $w('#repeater1').data = [];
    $w('#metinOzet').text = 'Sunucuya ulaşılamadı.';
  }
}

/* API'den gelen kaydı repeater'ın beklediği satır nesnesine çevirir.
   _id alanı zorunlu ve METİN olmalı; backend zaten metin gönderiyor.
   Boş kalan alana tire koyuyoruz ki satır delik görünmesin. */
function satirHazirla(lead) {
  return {
    _id: String(lead._id),
    isim: lead.isim || '—',
    telefon: lead.telefon || '—'
  };
}
