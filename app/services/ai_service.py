"""
MODUL C - Yapay Zeka Servisi
----------------------------
MIMARI SOZLESME: Yapay zeka API cagrisi SADECE bu dosyada yapilir.

Bu dosya Flask'i, HTTP rotalarini ve veritabanini BILMEZ. Sadece
"metin al -> metin uret" isini yapar. Bu izolasyon sayesinde saglayiciyi
Groq'tan baskasina tasimak, yalnizca bu dosyada bir metodu degistirmek
demektir; routes.py'ye dokunulmaz.
"""

import requests
from flask import current_app


class AIServiceError(Exception):
    """
    Servise ozel hata sinifi.

    Neden? routes.py'nin requests kutuphanesinin hatalarini yakalamasi
    gerekseydi, HTTP istemcisinin detayi rota katmanina sizardi. Bunun
    yerine tum dis hatalari burada yakalayip tek bir tipe cevirir,
    routes.py sadece AIServiceError'u tanir.
    """


class AIService:
    """Groq uzerinden calisan SiparisN satis asistani."""

    # -- Yardimci metotlar --------------------------------------------------
    def _sistem_talimati(self):
        """
        Yapay zekanin kisiligini (BUSINESS_CONTEXT) config'den okur.
        Bu metin degistiginde asistanin kim oldugu degisir; kod degismez.
        """
        return current_app.config["BUSINESS_CONTEXT"]

    # .env'de unutulan ornek/yer tutucu degerler. Bunlar gercek anahtar
    # sayilmaz; aksi halde Groq'a bos yere istek atip 401 aliriz.
    YER_TUTUCULAR = (
        "gsk_buraya_kendi_anahtariniz",
        "gsk_xxx",
        "gsk_...",
    )

    def _anahtar_var_mi(self):
        """
        Gercek bir API anahtari tanimli mi? (demo modu karari icin)
        Groq anahtarlari 'gsk_' onekiyle baslar ve makul uzunluktadir.
        """
        anahtar = (current_app.config.get("GROQ_API_KEY") or "").strip()
        if not anahtar or not anahtar.startswith("gsk_"):
            return False
        if anahtar.lower() in self.YER_TUTUCULAR:
            return False
        # Gercek anahtarlar 'gsk_' + uzun bir govdeden olusur.
        return len(anahtar) > 20

    def _demo_yaniti(self, mesaj):
        """
        Anahtar yoksa uygulama COKMEZ; kibar bir demo yaniti doner.
        Boylece sunumda anahtar sorunu yasansa bile arayuz calisir durumda kalir.
        """
        return (
            "[DEMO MODU] SiparişN asistanı şu an örnek yanıt veriyor. "
            "Gerçek yapay zekâ yanıtları için .env dosyasına GROQ_API_KEY "
            "eklenmelidir. Sorunuz: "
            f"\"{mesaj}\" — SiparişN, Trendyol Yemek ve Getir Yemek gibi farklı "
            "platformlardan gelen siparişleri tek ekranda toplar. Demo için "
            "ad, telefon ve işletme adınızı bırakabilirsiniz."
        )

    def _mesajlari_hazirla(self, mesaj, gecmis):
        """
        Groq'a gonderilecek 'messages' dizisini DOGRU SIRAYLA kurar:
          1) sistem talimati (role: system)
          2) onceki konusma (role: user / assistant)
          3) en sonda yeni kullanici mesaji
        Sira bozulursa model rolunu unutur veya son soruyu kacirir.
        """
        mesajlar = [{"role": "system", "content": self._sistem_talimati()}]

        # Gecmis, frontend'den gelen bir liste olabilir; guvenli sekilde gez.
        for eski in (gecmis or []):
            rol = eski.get("role")
            icerik = eski.get("content")
            # Sadece bekledigimiz rollere izin ver (savunmaci programlama).
            if rol in ("user", "assistant") and icerik:
                mesajlar.append({"role": rol, "content": icerik})

        mesajlar.append({"role": "user", "content": mesaj})
        return mesajlar

    def _groq_cagir(self, mesajlar):
        """
        Groq API'sine HTTP POST atar ve model yanitini metin olarak dondurur.
        Tum ag/servis hatalari AIServiceError'a cevrilir.
        """
        basliklar = {
            "Authorization": f"Bearer {current_app.config['GROQ_API_KEY']}",
            "Content-Type": "application/json",
        }
        govde = {
            "model": current_app.config["GROQ_MODEL"],
            "messages": mesajlar,
            "max_tokens": current_app.config["AI_MAX_TOKENS"],
            "temperature": current_app.config["AI_TEMPERATURE"],
        }

        try:
            yanit = requests.post(
                current_app.config["GROQ_API_URL"],
                headers=basliklar,
                json=govde,
                timeout=current_app.config["AI_TIMEOUT"],
            )
            # 4xx/5xx durumunda istisna firlatir.
            yanit.raise_for_status()
            veri = yanit.json()
            return veri["choices"][0]["message"]["content"].strip()

        except requests.exceptions.Timeout as hata:
            raise AIServiceError(
                "Yapay zekâ servisi zaman aşımına uğradı, lütfen tekrar deneyin."
            ) from hata
        except requests.exceptions.HTTPError as hata:
            raise AIServiceError(
                f"Yapay zekâ servisi hata döndürdü (HTTP {yanit.status_code})."
            ) from hata
        except requests.exceptions.RequestException as hata:
            raise AIServiceError(
                "Yapay zekâ servisine şu an ulaşılamıyor."
            ) from hata
        except (KeyError, IndexError, ValueError) as hata:
            # Yanit bekledigimiz JSON yapisinda degilse buraya duseriz.
            raise AIServiceError(
                "Yapay zekâ servisinden beklenmeyen bir yanıt alındı."
            ) from hata

    # -- Disariya acik metotlar --------------------------------------------
    def demo_modunda_mi(self):
        """
        /health ucunun gercek durumu bildirmesi icin. Sadece anahtarin dolu
        olup olmadigina bakmak yaniltici olurdu: .env'de unutulmus bir yer
        tutucu da "dolu" gorunur ama calismaz.
        """
        return not self._anahtar_var_mi()


    def yanit_uret(self, mesaj, gecmis=None):
        """
        Kullanici mesajini alir, asistanin yanitini dondurur.
        routes.py bu metottan baska hicbir seyi bilmek zorunda degildir.
        """
        if not mesaj or not mesaj.strip():
            raise AIServiceError("Boş mesaj gönderilemez.")

        if not self._anahtar_var_mi():
            return self._demo_yaniti(mesaj.strip())

        mesajlar = self._mesajlari_hazirla(mesaj.strip(), gecmis)
        return self._groq_cagir(mesajlar)


# Dosya sonunda TEK bir ornek (singleton). routes.py bunu import eder;
# her istekte yeni nesne uretilmez.
ai_service = AIService()
