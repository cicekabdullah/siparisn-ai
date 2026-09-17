"""
MODUL E - Uygulama Fabrikasi
----------------------------
Parcalari birlestiren tek yer. Sira onemlidir:
    ayarlari yukle -> CORS ac -> veritabanini kur -> blueprint'leri kaydet
    -> uygulamayi dondur

Fabrika deseni (create_app) kullanmamizin sebebi: uygulamayi farkli
ayarlarla (gelistirme / test / yayin) birden fazla kez uretebilmek.
Modul seviyesinde tek bir global `app` olsaydi bu mumkun olmazdi.
"""

from flask import Flask, jsonify
from flask_cors import CORS

from config import get_config


def create_app(config_sinifi=None):
    """Yapilandirilmis bir Flask uygulamasi uretir ve dondurur."""

    app = Flask(__name__)

    # 1) Ayarlari yukle (Modul A)
    app.config.from_object(config_sinifi or get_config())

    # 2) CORS'u ac.
    # Wix sitesi backend'den farkli bir alan adinda calisir; bu izin olmadan
    # tarayici wix-fetch isteklerini engeller. Sadece /api/* yollari acilir.
    CORS(
        app,
        resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}},
    )

    # 3) Veritabanini hazirla (Modul B).
    # init_db kendi icinde app.app_context() kullanir; get_db() current_app'e
    # bagli oldugu icin uygulama baglami olmadan calisamaz.
    from app import database

    database.init_db(app)

    # Her istegin sonunda baglantiyi kapat.
    app.teardown_appcontext(database.close_db)

    # 4) Blueprint'leri kaydet (Modul D).
    # API blueprint'i /api onekiyle baglanir: /sohbet -> /api/sohbet
    from app.routes import api_bp, sayfa_bp

    app.register_blueprint(sayfa_bp)
    app.register_blueprint(api_bp, url_prefix="/api")

    # 5) Canlilik kontrolu.
    # Render ve Wix baglantisini dogrularken ilk bakilacak uc nokta budur.
    @app.route("/health", methods=["GET"])
    def health():
        # AI durumunu servis katmanina sorariz; anahtarin "dolu gorunmesi"
        # calisiyor oldugu anlamina gelmez.
        from app.services.ai_service import ai_service

        return jsonify(
            {
                "basari": True,
                "durum": "aktif",
                "servis": app.config["BRAND_NAME"],
                "ai_saglayici": app.config["AI_PROVIDER"],
                "ai_modu": "demo" if ai_service.demo_modunda_mi() else "canli",
            }
        ), 200

    # 6) Uygulama genelinde JSON hata yanitlari.
    # Boylece API'ye yanlis adresten istek atilsa bile HTML degil JSON doner.
    @app.errorhandler(404)
    def bulunamadi(e):
        return jsonify({"basari": False, "hata": "Adres bulunamadı."}), 404

    @app.errorhandler(405)
    def yanlis_metot(e):
        return jsonify({"basari": False, "hata": "Bu adres için geçersiz metot."}), 405

    return app
