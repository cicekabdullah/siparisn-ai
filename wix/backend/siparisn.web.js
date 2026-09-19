/* =============================================================
   WIX BACKEND WEB MODULE — SiparişN API köprüsü
   Wix Studio'da konumu: Code sidebar > Backend > siparisn.web.js
   (Git entegrasyonu kullanılırsa: src/backend/siparisn.web.js)
   =============================================================

   NEDEN BACKEND?
   Wix'in kendi dokümantasyonu dış API çağrılarının backend'den
   yapılmasını öneriyor: hem CORS sorunlarını tamamen ortadan
   kaldırıyor hem de API adresi/anahtarı tarayıcıya sızmıyor.

   Bu dosyadaki fonksiyonlar "web method" olarak dışa açılır;
   sayfa kodu bunları normal bir fonksiyon gibi import edip çağırır,
   çağrı arka planda Wix sunucusunda çalışır.
============================================================= */

import { Permissions, webMethod } from 'wix-web-module';
import { fetch } from 'wix-fetch';

/* YAYINDAN ÖNCE: Render'daki canlı adresinizi yazın.
   ÖNEMLİ: Wix siteleri HTTPS'tir; http://localhost adresine İSTEK ATAMAZ.
   Bu yüzden önce Render'a deploy etmeniz, sonra Wix'i bağlamanız gerekir.

   İsterseniz bu adresi Wix Secrets Manager'da da tutabilirsiniz
   (import { getSecret } from 'wix-secrets-backend'). Adres gizli bir bilgi
   olmadığı için sabit tutmak da kabul edilebilir. */
const API_ADRESI = 'https://siparisn-ai.onrender.com';

/* ---------- 1) AI SOHBETİ -> POST /api/sohbet ----------
   Permissions.Anyone: siteyi ziyaret eden herkes çağırabilir.
   Sohbet herkese açık bir tanıtım özelliği olduğu için doğru seviye budur. */
export const sohbetGonder = webMethod(
  Permissions.Anyone,
  async (mesaj, gecmis = []) => {
    // Backend tarafında da doğrula: sayfa kodu atlatılabilir.
    if (!mesaj || !mesaj.trim()) {
      return { basari: false, hata: 'Mesaj alanı boş olamaz.' };
    }

    try {
      const yanit = await fetch(API_ADRESI + '/api/sohbet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mesaj: mesaj.trim(), gecmis: gecmis })
      });

      // Flask hata durumunda da JSON döndürdüğü için gövdeyi her hâlükârda okuruz.
      const veri = await yanit.json();
      return veri;   // { basari, cevap } veya { basari:false, hata }

    } catch (hata) {
      // Ağ/zaman aşımı hatası: kullanıcıya teknik ayrıntı gösterme.
      console.error('SiparisN API sohbet hatasi:', hata);
      return { basari: false, hata: 'Asistana şu an ulaşılamıyor, lütfen tekrar deneyin.' };
    }
  }
);

/* ---------- 2) LEAD KAYDI -> POST /api/leads ---------- */
export const leadKaydet = webMethod(
  Permissions.Anyone,
  async (lead) => {
    const isim = (lead?.isim || '').trim();
    const telefon = (lead?.telefon || '').trim();

    if (!isim || !telefon) {
      return { basari: false, hata: 'Ad ve telefon alanları zorunludur.' };
    }

    try {
      const yanit = await fetch(API_ADRESI + '/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isim: isim,
          telefon: telefon,
          isletme: (lead?.isletme || '').trim(),
          mesaj: (lead?.mesaj || '').trim()
        })
      });

      return await yanit.json();   // { basari, id, mesaj } veya { basari:false, hata }

    } catch (hata) {
      console.error('SiparisN API lead hatasi:', hata);
      return { basari: false, hata: 'Kayıt şu an oluşturulamıyor, lütfen tekrar deneyin.' };
    }
  }
);

/* ---------- 3) LEAD LİSTESİ -> GET /api/leads ----------
   DİKKAT — Permissions.Admin:
   Lead listesi müşteri adaylarının ad ve telefonlarını içerir; KVKK
   kapsamında kişisel veridir. Bu yüzden yönetim paneli verisi yalnızca
   site yöneticisine açılır. Anyone yapılırsa herkes listeyi çekebilir. */
export const leadleriGetir = webMethod(
  Permissions.Admin,
  async () => {
    try {
      const yanit = await fetch(API_ADRESI + '/api/leads', { method: 'GET' });
      return await yanit.json();   // { basari, adet, leadler: [...] }

    } catch (hata) {
      console.error('SiparisN API liste hatasi:', hata);
      return { basari: false, hata: 'Kayıtlara şu an ulaşılamıyor.' };
    }
  }
);

/* ---------- 4) CANLILIK KONTROLÜ -> GET /health ----------
   Render ücretsiz planda uyuyabilir; bu fonksiyon hem sunucuyu uyandırmak
   hem de sunum öncesi "ayakta mı?" kontrolü için kullanılabilir. */
export const sunucuyuUyandir = webMethod(
  Permissions.Anyone,
  async () => {
    try {
      const yanit = await fetch(API_ADRESI + '/health', { method: 'GET' });
      return await yanit.json();
    } catch (hata) {
      return { basari: false, hata: 'Sunucu yanıt vermiyor.' };
    }
  }
);
