import { leadKaydet, sohbetGonder, sunucuyuUyandir } from 'backend/siparisn.jsw';

/* =========================================================
   SiparişN — Ana Sayfa
   Lead formu : #metinBaslik #girisIsim #girisTelefon #butonKaydet #metinDurum
   Chatbot    : #butonBalon #kutuSohbet #butonKapat #metinCevap #girisMesaj #butonSor
   Backend    : backend/siparisn.jsw -> https://siparisn-ai.onrender.com
   ========================================================= */

let gecmis = [];      // asistanın bağlamı hatırlaması için
let yazisma = [];     // ekrana basılan konuşma

$w.onReady(function () {
  // --- Arayüz metinleri tek yerden (marka dili tutarlı kalsın) ---
  $w('#metinBaslik').text = 'Ücretsiz demo talep edin';
  $w('#butonKaydet').label = 'Kaydet';
  $w('#girisIsim').placeholder = 'Ad Soyad *';
  $w('#girisTelefon').placeholder = 'Telefon *';
  $w('#metinDurum').text = '';

  $w('#butonBalon').label = 'Asistana sor';
  $w('#butonSor').label = 'Sor';
  $w('#butonKapat').label = 'Kapat';
  $w('#girisMesaj').placeholder = 'Sorunuzu yazın';

  // --- Başlangıç: sohbet kapalı, sadece açma düğmesi görünür ---
  sekmeyiKapat();
  yaz('bot', 'Merhaba. SiparişN\'in merkezi sipariş yönetimi, platform entegrasyonları ve kurulum süreci hakkındaki sorularınızı yanıtlayabilirim.');

  // --- Olaylar ---
  $w('#butonBalon').onClick(sekmeyiAc);
  $w('#butonKapat').onClick(sekmeyiKapat);
  $w('#butonSor').onClick(soruSor);
  $w('#butonKaydet').onClick(formuGonder);

  $w('#girisMesaj').onKeyPress(function (olay) {
    if (olay.key === 'Enter') soruSor();
  });
  $w('#girisTelefon').onKeyPress(function (olay) {
    if (olay.key === 'Enter') formuGonder();
  });

  // Render ücretsiz planda uyur; ilk istek 50 sn sürebilir.
  sunucuyuUyandir().catch(function () {});
});

/* ---------- Sohbet sekmesini aç / kapat ---------- */
function sekmeyiAc() {
  $w('#kutuSohbet').expand();
  $w('#metinCevap').expand();
  $w('#girisMesaj').expand();
  $w('#butonSor').expand();
  $w('#butonKapat').expand();
  $w('#butonBalon').collapse();
}

function sekmeyiKapat() {
  $w('#kutuSohbet').collapse();
  $w('#metinCevap').collapse();
  $w('#girisMesaj').collapse();
  $w('#butonSor').collapse();
  $w('#butonKapat').collapse();
  $w('#butonBalon').expand();
}

/* ---------- Yazışmayı ekrana basma ----------
   Kullanıcıdan gelen metni ham HTML olarak basmıyoruz; önce kaçırıyoruz. */
function kacir(metin) {
  return String(metin)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function yaz(kim, metin) {
  yazisma.push({ kim: kim, metin: metin });
  if (yazisma.length > 12) yazisma = yazisma.slice(-12);

  const html = yazisma.map(function (s) {
    const renk = s.kim === 'ben' ? '#FF8A5B' : '#374151';
    const hiza = s.kim === 'ben' ? 'right' : 'left';
    return '<p style="color:' + renk + ';text-align:' + hiza + ';margin:0 0 8px 0;">' + kacir(s.metin) + '</p>';
  }).join('');

  $w('#metinCevap').html = html;
}

function sonSatiriDegistir(metin) {
  if (yazisma.length) yazisma.pop();
  yaz('bot', metin);
}

/* ---------- 1) AI SOHBETİ ----------
   KRİTİK: backend ile birebir aynı kelimeler -> mesaj / cevap */
async function soruSor() {
  const mesaj = $w('#girisMesaj').value.trim();
  if (!mesaj) return;

  yaz('ben', mesaj);
  $w('#girisMesaj').value = '';
  $w('#butonSor').disable();
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
    $w('#butonSor').enable();
  }
}

/* ---------- 2) LEAD KAYDI ---------- */
async function formuGonder() {
  const isim = $w('#girisIsim').value.trim();
  const telefon = $w('#girisTelefon').value.trim();

  // İstemci tarafı ön kontrol; backend ve Flask zaten tekrar doğruluyor.
  if (!isim || !telefon) {
    $w('#metinDurum').text = 'Ad ve telefon alanları zorunludur.';
    return;
  }

  $w('#butonKaydet').disable();
  $w('#metinDurum').text = 'Kaydediliyor...';

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
