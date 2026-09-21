"""
MODUL A - Yapilandirma Katmani
------------------------------
Tum ayarlar ve gizli anahtarlar SADECE bu dosyada toplanir.
Diger katmanlar (database, ai_service, routes) ayarlari buradan okur;
hicbiri os.environ'a dogrudan bakmaz. Boylece bir ayari degistirmek
icin tek bir dosyaya bakmak yeterli olur.
"""

import os

from dotenv import load_dotenv

# .env dosyasini ortam degiskenlerine yukler.
# DIKKAT: Bu cagri, asagidaki sinif govdeleri calismadan ONCE yapilmali;
# aksi halde os.environ.get(...) hep varsayilan degeri dondurur.
load_dotenv()


class Config:
    """Tum ortamlar icin gecerli olan temel ayarlar."""

    # --- Uygulama ---
    # Flask'in oturum/flash imzalamasi icin kullandigi anahtar.
    SECRET_KEY = os.environ.get("SECRET_KEY", "siparisn-gelistirme-anahtari")

    # --- Veritabani ---
    # SQLite dosyasinin adi/yolu. Render gibi ortamlarda degistirilebilir.
    DATABASE_URL = os.environ.get("DATABASE_URL", "siparisn.db")

    # --- Yapay zeka ---
    AI_PROVIDER = os.environ.get("AI_PROVIDER", "groq")
    GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
    # Groq, llama-3.1-8b-instant modelini Enterprise planina aldi; normal
    # hesaplarda cagrilinca HTTP 404 (model_not_found) doner. Developer
    # planinda acik olan hizli ve ucuz model gpt-oss-20b.
    GROQ_MODEL = os.environ.get("GROQ_MODEL", "openai/gpt-oss-20b")
    GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

    # Yapay zekanin uretebilecegi maksimum token ve yaraticilik seviyesi.
    AI_MAX_TOKENS = int(os.environ.get("AI_MAX_TOKENS", "800"))
    AI_TEMPERATURE = float(os.environ.get("AI_TEMPERATURE", "0.6"))
    AI_TIMEOUT = int(os.environ.get("AI_TIMEOUT", "20"))  # saniye

    # --- CORS ---
    # Wix sitesi baska bir alan adinda calistigi icin tarayici, backend'e
    # yapilan istekleri CORS izni olmadan engeller. Yayinda bu degeri
    # kendi Wix alan adinizla sinirlandirin (orn. https://siparisn.com).
    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "*")

    # --- Marka (arayuz metinleri buradan beslenir) ---
    BRAND_NAME = os.environ.get("BRAND_NAME", "SiparişN")
    BRAND_PRIMARY_COLOR = "#FF6B35"   # Turuncu: hiz, enerji, yemek sektoru
    BRAND_SECONDARY_COLOR = "#1F2937"  # Koyu lacivert: guven, teknoloji

    # --- Yapay zekanin kisiligi (KONUYA OZEL TEK METIN) ---
    # Yonergenin altin kurali: konuya ozel tek sey bu metindir.
    # database.py / routes.py / ai_service.py her konu icin aynidir.
    BUSINESS_CONTEXT = os.environ.get(
        "BUSINESS_CONTEXT",
        (
            "Sen SiparisN'in akilli satis asistanisin. SiparisN; restoranlarin "
            "Trendyol Yemek, Getir Yemek ve benzeri farkli yemek siparis "
            "platformlarindan gelen siparislerini tek bir ekrandan yonetmesini "
            "saglayan bir restoran siparis yonetim yazilimidir. "
            "Hedef kitlen yerel restoranlar, kafeler, fast-food ve paket servis "
            "isletmeleridir. "
            "Gorevin: merkezi siparis yonetimi, platform entegrasyonlari, "
            "kurulum ve fiyatlandirma sureci hakkinda sorulari yanitlamak. "
            "Uslubun pratik, hizli, guvenilir ve sade olsun; gereksiz teknik "
            "detaya girme, kisa ve net cevap ver. Turkce konus. "
            "Bilmedigin bir sey sorulursa uydurma; ekibin donus yapacagini soyle. "
            "Sana fiyat listesi VERILMEDI. Fiyat sorulursa rakam uydurma; "
            "paketlerin isletmenin siparis hacmine gore belirlendigini soyle ve "
            "net teklif icin iletisim bilgisi birakmasini iste. "
            "Sohbetin uygun bir yerinde kullaniciyi isletme adi, ad ve telefon "
            "birakarak demo talep etmeye yonlendir. "
            "Kisisel veri isleme KVKK kapsamindadir; gereginden fazla bilgi isteme. "
            # Yanit Wix'teki duz metin kutusuna (.value) yaziliyor; bicimlendirme
            # islenmeden oldugu gibi gorunur. Bu yuzden markdown yasak.
            "BICIM KURALI: Yanitini DUZ METIN olarak yaz. Markdown kullanma: "
            "yildiz, alt tire, diyez, tablo, kod blogu, yatay cizgi YOK. "
            "Madde gerekiyorsa satir basina '- ' koy. "
            "En fazla 4 cumle veya 4 madde yaz; uzun yanit verme."
        ),
    )


class DevelopmentConfig(Config):
    """Yerel gelistirme: hata ayiklama acik."""

    DEBUG = True


class ProductionConfig(Config):
    """Yayin (Render): hata ayiklama kapali."""

    DEBUG = False


# Ortam adina gore dogru sinifi secen sozluk.
# create_app() bu sozlugu kullanir: config[os.environ.get('FLASK_ENV')]
config = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "default": DevelopmentConfig,
}


def get_config():
    """FLASK_ENV degerine karsilik gelen yapilandirma sinifini dondurur."""
    ortam = os.environ.get("FLASK_ENV", "default")
    return config.get(ortam, config["default"])
