import { leadleriGetir } from 'backend/siparisn.jsw';

/* SiparişN — Yönetici Paneli
   Bileşenler: #tabloKayitlar (Table), #butonYenile (Button), #metinOzet (Text)

   Kayıtlar artık gerçek bir tablo bileşeninde gösteriliyor: her kayıt bir
   satır, her bilgi ayrı bir hücre. Sütunlar koddan tanımlanıyor ki başlık
   adı ile Flask API'sinin döndürdüğü alan adı (dataPath) tek yerde eşleşsin.

   F-Pattern: en önemli kolon (ad soyad) en solda. */

const SUTUNLAR = [
  { id: 'isim',    dataPath: 'isim',    label: 'Ad Soyad',     type: 'string', width: 230 },
  { id: 'telefon', dataPath: 'telefon', label: 'Numara',       type: 'string', width: 180 },
  { id: 'isletme', dataPath: 'isletme', label: 'İşletme Adı',  type: 'string', width: 230 },
  { id: 'tarih',   dataPath: 'tarih',   label: 'Kayıt Tarihi', type: 'string', width: 160 }
];

$w.onReady(function () {
  $w('#butonYenile').label = 'Yenile';
  $w('#tabloKayitlar').columns = SUTUNLAR;

  $w('#butonYenile').onClick(listeyiYukle);
  listeyiYukle();
});

async function listeyiYukle() {
  $w('#metinOzet').text = 'Yükleniyor...';

  try {
    const veri = await leadleriGetir();

    if (veri.basari) {
      // Backend kayıtları en yeniden eskiye sıralı döndürüyor.
      $w('#tabloKayitlar').rows = veri.leadler.map(satirHazirla);
      $w('#metinOzet').text = veri.adet > 0
        ? 'Toplam ' + veri.adet + ' kayıt'
        : 'Henüz kayıt yok.';
    } else {
      $w('#tabloKayitlar').rows = [];
      $w('#metinOzet').text = veri.hata || 'Kayıtlar getirilemedi.';
    }
  } catch (hata) {
    console.error('Liste hatasi:', hata);
    $w('#tabloKayitlar').rows = [];
    $w('#metinOzet').text = 'Sunucuya ulaşılamadı.';
  }
}

/* API'den gelen kaydı tablonun beklediği satır nesnesine çevirir.
   _id alanı zorunlu ve METİN olmalı; backend zaten metin olarak gönderiyor.
   Boş kalan hücreye tire koyuyoruz ki tablo delik görünmesin. */
function satirHazirla(lead) {
  return {
    _id: String(lead._id),
    isim: lead.isim || '—',
    telefon: lead.telefon || '—',
    isletme: lead.isletme || '—',
    tarih: tarihBicimle(lead.tarih)
  };
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
