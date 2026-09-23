import wixLocation from 'wix-location';

/* SiparişN — masterPage.js
   Bu dosyadaki kod sitenin BÜTÜN sayfalarında çalışır.
   Header her sayfada ortak olduğu için buradaki bağlantılar
   tek yerden tanımlanır. */

$w.onReady(function () {
  // Yönetici Girişi -> lead kayıtlarının listelendiği Panel sayfası
  $w('#button11').link = '/panel';
  $w('#button11').target = '_self';

  /* Header'daki logoya tıklayınca Ana Sayfa'ya dön.
     Logo iki parçadan oluşuyor; ikisi de tıklanabilir olsun:
       #box290         "SiparişN" kelime markası
       #vectorImage39  logo işareti (turuncu/sarı simge)
     İkisi de Header'ın içinde, yani masterPage'e ait — bu yüzden
     bağlantıları sayfa kodlarında değil burada tanımlıyoruz.

     NOT: #vectorImage38 bilerek listede YOK. O, sohbet kartının
     içindeki küçük logo; ona tıklayınca sayfadan çıkmak istemiyoruz. */
  anaSayfayaBagla('#box290');
  anaSayfayaBagla('#vectorImage39');
});

/* Verilen öğeyi Ana Sayfa'ya bağlar.
   Wix'te olmayan bir öğe üzerinde onClick çağırmak TypeError fırlatır
   ve o sayfanın kodunu tamamen durdurur. Bu yüzden bağlamadan önce
   öğenin gerçekten var olduğunu doğruluyoruz. */
function anaSayfayaBagla(secici) {
  const oge = $w(secici);
  if (!oge || typeof oge.onClick !== 'function') {
    console.log('Ana sayfa baglantisi kurulamadi, oge yok:', secici);
    return;
  }
  oge.onClick(function () {
    wixLocation.to('/');
  });
}
