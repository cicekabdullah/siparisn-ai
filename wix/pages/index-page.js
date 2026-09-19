/* =============================================================
   WIX STUDIO — ANA SAYFA kodu
   Studio'da yeri: Ana Sayfa seçiliyken Code paneli > Page Code
   =============================================================

   Bu sayfada iki ayrı iş var:
     1) Köşede duran AÇILIR SOHBET SEKMESİ (chatbot)
     2) Sayfa içindeki LEAD FORMU

   Gereken bileşen ID'leri ve tasarım ölçüleri: CHATBOT-TASARIM.md

   Sohbet sekmesi:  #butonBalon · #kutuSohbet · #butonKapat
                    #metinCevap · #girisMesaj · #butonSor
   Lead formu:      #girisIsim · #girisTelefon · #girisIsletme
                    #butonKaydet · #metinDurum

   Dış API doğrudan buradan çağrılmaz; backend web module üzerinden
   çağrılır. Böylece CORS sorunu oluşmaz ve Render adresi tarayıcıya sızmaz.
============================================================= */

import { sohbetGonder, leadKaydet, sunucuyuUyandir } from 'backend/siparisn.web';

// Konuşma geçmişi: asistanın bağlamı hatırlaması için backend'e gönderilir.
let gecmis = [];

// Sohbet penceresinde biriken yazışma. Wix Text bileşeni HTML kabul ettiği
// için balonları basit satırlar hâlinde tutuyoruz.
let yazisma = [];

$w.onReady(function () {
  // --- Başlangıç durumu: panel kapalı, sadece rozet görünüyor ---
  $w('#kutuSohbet').collapse();
  $w('#metinDurum').text = '';

  yaz('bot', 'Merhaba. SiparişN\'in merkezi sipariş yönetimi, platform entegrasyonları ve kurulum süreci hakkındaki sorularınızı yanıtlayabilirim.');

  // --- Sohbet sekmesini aç / kapat ---
  $w('#butonBalon').onClick(sekmeyiAc);
  $w('#butonKapat').onClick(sekmeyiKapat);

  // --- Sohbet ---
  $w('#butonSor').onClick(soruSor);
  $w('#girisMesaj').onKeyPress((olay) => {
    if (olay.key === 'Enter') soruSor();
  });

  // --- Lead formu ---
  $w('#butonKaydet').onClick(formuGonder);

  // Render ücretsiz planda uykuya geçer; sayfa açılır açılmaz uyandır ki
  // kullanıcı ilk soruyu sorduğunda 50 saniye beklemesin.
  sunucuyuUyandir().catch(() => { /* kritik değil, sessizce geç */ });
});

/* ---------------------------------------------------------------
   SOHBET SEKMESİNİN AÇILIP KAPANMASI
   collapse() öğeyi yerleşimden çıkarır, expand() geri getirir.
   Fixed konumlu bir kutuda istediğimiz davranış budur.
   --------------------------------------------------------------- */
function sekmeyiAc() {
  $w('#kutuSohbet').expand();
  $w('#butonBalon').collapse();   // panel açıkken rozet gizlensin
  $w('#girisMesaj').focus();
}

function sekmeyiKapat() {
  $w('#kutuSohbet').collapse();
  $w('#butonBalon').expand();
}

/* ---------------------------------------------------------------
   YAZIŞMAYI EKRANA BASMA
   Wix Text bileşeni sınırlı HTML destekler; her satırı <p> olarak
   veriyoruz. Kullanıcıdan gelen metni ham HTML olarak basmıyoruz —
   önce kaçırıyoruz (XSS koruması).
   --------------------------------------------------------------- */
function kacir(metin) {
  return String(metin).replace(/[&<>"']/g, k => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[k]
  ));
}

function yaz(kim, metin) {
  yazisma.push({ kim: kim, metin: metin });

  const html = yazisma.map(s => {
    // Kullanıcı satırı sağa ve turuncu, asistan satırı sola ve açık gri.
    const renk = s.kim === 'ben' ? '#FF8A5B' : '#E5E7EB';
    const hiza = s.kim === 'ben' ? 'right' : 'left';
    return `<p style="color:${renk};text-align:${hiza};margin:0 0 10px 0;">${kacir(s.metin)}</p>`;
  }).join('');

  $w('#metinCevap').html = html;
}

// Son satırı değiştirir ("Yazıyor…" yerine gelen cevabı koymak için).
function sonSatiriDegistir(metin) {
  if (yazisma.length) yazisma.pop();
  yaz('bot', metin);
}

/* ---------------------------------------------------------------
   1) AI SOHBETİ
   KRİTİK: backend ile birebir aynı kelimeler -> mesaj / cevap
   --------------------------------------------------------------- */
async function soruSor() {
  const mesaj = $w('#girisMesaj').value.trim();
  if (!mesaj) return;

  yaz('ben', mesaj);
  $w('#girisMesaj').value = '';
  $w('#butonSor').disable();
  yaz('bot', 'Yazıyor…');

  try {
    const veri = await sohbetGonder(mesaj, gecmis);

    if (veri.basari) {
      sonSatiriDegistir(veri.cevap);

      // Geçmişi son 10 mesajla sınırla: istek gövdesi şişmesin.
      gecmis.push({ role: 'user', content: mesaj });
      gecmis.push({ role: 'assistant', content: veri.cevap });
      gecmis = gecmis.slice(-10);
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

/* ---------------------------------------------------------------
   2) LEAD KAYDI
   Gönderilen alanlar: isim, telefon, isletme, mesaj
   --------------------------------------------------------------- */
async function formuGonder() {
  const isim    = $w('#girisIsim').value.trim();
  const telefon = $w('#girisTelefon').value.trim();
  const isletme = $w('#girisIsletme').value.trim();

  // İstemci tarafı ön kontrol; backend ve Flask zaten tekrar doğruluyor.
  if (!isim || !telefon) {
    $w('#metinDurum').text = 'Ad ve telefon alanları zorunludur.';
    return;
  }

  $w('#butonKaydet').disable();
  $w('#metinDurum').text = 'Kaydediliyor…';

  try {
    const veri = await leadKaydet({
      isim: isim,
      telefon: telefon,
      isletme: isletme,
      mesaj: ''   // sohbet penceresi ayrı olduğu için not alanı boş
    });

    if (veri.basari) {
      $w('#metinDurum').text = veri.mesaj;
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
