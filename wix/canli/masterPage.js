import wixLocation from 'wix-location';

/* SiparişN — masterPage.js
   Bu dosyadaki kod sitenin BÜTÜN sayfalarında çalışır.
   Header her sayfada ortak olduğu için buradaki bağlantılar
   tek yerden tanımlanır. */

$w.onReady(function () {
  // Yönetici Girişi -> lead kayıtlarının listelendiği Panel sayfası
  $w('#button11').link = '/panel';
  $w('#button11').target = '_self';

  // Logoya tıklayınca Ana Sayfa'ya dön.
  // Panelden çıkmak için ayrı bir 'geri' düğmesine gerek kalmaz.
  anaSayfayaBagla('#box290');
  anaSayfayaBagla('#vectorImage38');
});

/* Verilen öğeyi Ana Sayfa'ya bağlar.
   Öğe o sayfada yoksa sessizce geçer — kod hata vermesin. */
function anaSayfayaBagla(secici) {
  try {
    const oge = $w(secici);
    if (!oge) return;
    oge.onClick(function () {
      wixLocation.to('/');
    });
  } catch (hata) {
    console.log('Logo baglanamadi:', secici);
  }
}