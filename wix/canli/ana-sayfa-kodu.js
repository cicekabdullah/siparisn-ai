import { leadKaydet, sohbetGonder, sunucuyuUyandir } from 'backend/siparisn.jsw';

/* =========================================================
   SiparişN — Ana Sayfa

   Chatbot (section19 > box201)
     #button21  kartın DIŞINDA — sohbeti açar
     #box291    sohbet kartı, içinde:
       #textBox1  AI cevapları (yazışma dökümü)
       #textBox2  kullanıcının sorusu
       #button20  soruyu gönderir
       #button22  sohbeti kapatır

   İletişim formu : #girisIsim #girisTelefon #butonKaydet #metinDurum
   Backend        : backend/siparisn.jsw -> https://siparisn-ai.onrender.com

   NOT — yazışma neden baloncuklu değil:
   #textBox1 bir Text öğesi değil, çok satırlı GİRİŞ KUTUSU (Text Box).
   Giriş kutuları yalnızca düz metin taşır (.value); .html kabul etmediği
   için renkli baloncuk çizilemiyor. Bu yüzden yazışma 'Siz:' / 'SiparişN:'
   satırları hâlinde yazılıyor ve kullanıcı içine yazamasın diye readOnly.
   ========================================================= */

const KARSILAMA = 'Merhaba. SiparişN\'in merkezi sipariş yönetimi, platform ' +
                  'entegrasyonları ve kurulum süreci hakkındaki sorularınızı ' +
                  'yanıtlayabilirim.';

/* Giriş kutusu kendi kendine en alta kaymadığı için yazışmayı kısa
   tutuyoruz; böylece en son cevap kutunun içinde görünür kalıyor. */
const EKRANDA_TUTULACAK = 4;

let gecmis = [];     // asistanın bağlamı hatırlaması için (backend'e gider)
let yazisma = [];    // ekrana basılan konuşma

$w.onReady(function () {
  // --- Arayüz metinleri tek yerden (marka dili tutarlı kalsın) ---
  $w('#button21').label = 'Asistana sor';
  $w('#button20').label = 'Gönder';
  $w('#button22').label = 'Kapat';
  $w('#textBox1').label = 'SiparişN Asistanı';
  $w('#textBox1').placeholder = '';
  $w('#textBox1').readOnly = true;
  $w('#textBox2').placeholder = 'Sorunuzu buraya sorun';

  $w('#metinDurum').text = '';

  // --- Başlangıç: sohbet kapalı, sadece açma düğmesi görünür ---
  yazisma = [{ kim: 'bot', metin: KARSILAMA }];
  ekranaBas();
  sekmeyiKapat();

  // --- Olaylar ---
  $w('#button21').onClick(sekmeyiAc);
  $w('#button22').onClick(sekmeyiKapat);
  $w('#button20').onClick(soruSor);

  /* Enter gönderir, Shift+Enter alt satıra geçer.
     Çok satırlı kutuda Enter normalde satır atlar; sohbet alışkanlığına uyduruyoruz. */
  $w('#textBox2').onKeyPress(function (olay) {
    if (olay.key === 'Enter' && !olay.shiftKey) soruSor();
  });

  $w('#butonKaydet').onClick(formuGonder);
  $w('#girisTelefon').onKeyPress(function (olay) {
    if (olay.key === 'Enter') formuGonder();
  });

  // Render ücretsiz planda uyur; ilk istek 50 sn sürebilir.
  sunucuyuUyandir().catch(function () {});
});

/* ---------- Sohbet kartını aç / kapat ----------
   #button21 kartın dışında durduğu için kartla birlikte gizlenmiyor;
   biri görünürken diğeri gizli oluyor. collapse() öğeyi yerinden de
   kaldırır, hide() ise boş yer bırakırdı. */
function sekmeyiAc() {
  $w('#box291').expand();
  $w('#button21').collapse();
  $w('#textBox2').focus();
}

function sekmeyiKapat() {
  $w('#box291').collapse();
  $w('#button21').expand();
}

/* ---------- Yazışmayı ekrana basma ---------- */
function ekranaBas() {
  $w('#textBox1').value = yazisma.map(function (s) {
    return (s.kim === 'ben' ? 'Siz' : 'SiparişN') + ': ' + s.metin;
  }).join('\n\n');
}

function yaz(kim, metin) {
  yazisma.push({ kim: kim, metin: metin });
  if (yazisma.length > EKRANDA_TUTULACAK) {
    yazisma = yazisma.slice(-EKRANDA_TUTULACAK);
  }
  ekranaBas();
}

// 'Yazıyor...' satırını gerçek cevapla değiştirir.
function sonSatiriDegistir(metin) {
  if (yazisma.length) yazisma.pop();
  yaz('bot', metin);
}

/* ---------- 1) AI SOHBETİ ----------
   KRİTİK: backend ile birebir aynı kelimeler -> mesaj / cevap */
async function soruSor() {
  const mesaj = $w('#textBox2').value.trim();
  if (!mesaj) return;

  yaz('ben', mesaj);
  $w('#textBox2').value = '';
  $w('#button20').disable();
  yaz('bot', 'Yazıyor...');

  try {
    const veri = await sohbetGonder(mesaj, gecmis);

    if (veri.basari) {
      sonSatiriDegistir(veri.cevap);
      gecmis.push({ role: 'user', content: mesaj });
      gecmis.push({ role: 'assistant', content: veri.cevap });
      gecmis = gecmis.slice(-10);   // istek gövdesi şişmesin
    } else {
      sonSatiriDegistir(veri.hata || 'Yanıt alınamadı.');
    }
  } catch (hata) {
    console.error('Sohbet hatasi:', hata);
    sonSatiriDegistir('Sunucuya ulaşılamadı, lütfen tekrar deneyin.');
  } finally {
    $w('#button20').enable();
    $w('#textBox2').focus();
  }
}

/* ---------- 2) LEAD KAYDI ----------
   İşletme alanı sayfadan kaldırıldı; backend ve Flask bu alanı
   isteğe bağlı kabul ettiği için boş gönderiyoruz. */
async function formuGonder() {
  const isim = $w('#girisIsim').value.trim();
  const telefon = $w('#girisTelefon').value.trim();

  // İstemci tarafı ön kontrol; backend ve Flask zaten tekrar doğruluyor.
  if (!isim || !telefon) {
    $w('#metinDurum').text = 'Ad ve telefon alanları zorunludur.';
    return;
  }

  $w('#butonKaydet').disable();
  $w('#metinDurum').text = 'Gönderiliyor...';

  try {
    const veri = await leadKaydet({ isim: isim, telefon: telefon, isletme: '' });

    if (veri.basari) {
      $w('#metinDurum').text = veri.mesaj;
      $w('#girisIsim').value = '';
      $w('#girisTelefon').value = '';
    } else {
      $w('#metinDurum').text = veri.hata || 'Kayıt oluşturulamadı.';
    }
  } catch (hata) {
    console.error('Kayit hatasi:', hata);
    $w('#metinDurum').text = 'Sunucuya ulaşılamadı, lütfen tekrar deneyin.';
  } finally {
    $w('#butonKaydet').enable();
  }
}
