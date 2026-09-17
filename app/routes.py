"""
MODUL D - Rota (Kontrolcu) Katmani
----------------------------------
MIMARI SOZLESME: Bu dosyada SQL ve yapay zeka API cagrisi YOKTUR.
Gorevi sadece sudur:
    1) Gelen istegi karsila
    2) Veriyi dogrula
    3) Dogru katmanin fonksiyonunu cagir
    4) Sonucu JSON / HTML olarak dondur

Iki Blueprint kullanilir:
    sayfa_bp -> HTML sayfalari (/, /dashboard)
    api_bp   -> JSON uc noktalari (create_app icinde /api onekiyle kaydedilir)
"""

from flask import Blueprint, current_app, jsonify, render_template, request

from app import database
from app.services.ai_service import AIServiceError, ai_service

# ---------------------------------------------------------------------------
# Blueprint tanimlari
# ---------------------------------------------------------------------------
sayfa_bp = Blueprint("sayfa", __name__)
api_bp = Blueprint("api", __name__)


# ---------------------------------------------------------------------------
# SAYFALAR (HTML)
# ---------------------------------------------------------------------------
@sayfa_bp.route("/", methods=["GET"])
def karsilama():
    """B2C karsilama sayfasi: AI sohbeti + iletisim formu (Z-Pattern)."""
    return render_template("index.html", marka=current_app.config["BRAND_NAME"])


@sayfa_bp.route("/dashboard", methods=["GET"])
def dashboard():
    """B2B yonetim paneli: toplanan lead kayitlari (F-Pattern)."""
    return render_template("dashboard.html", marka=current_app.config["BRAND_NAME"])


# ---------------------------------------------------------------------------
# API - SOHBET
# ---------------------------------------------------------------------------
@api_bp.route("/sohbet", methods=["POST"])
def sohbet():
    """
    Kullanici mesajini yapay zeka servisine iletir.

    Beklenen govde : {"mesaj": "...", "gecmis": [...]}   (gecmis opsiyonel)
    Donen govde    : {"basari": true, "cevap": "..."}

    KRITIK (Yonerge, Modul G): frontend ile birebir ayni kelimeler ->
    istek "mesaj", yanit "cevap". Bir harf farki baglantiyi koparir.
    """
    veri = request.get_json(silent=True) or {}
    mesaj = (veri.get("mesaj") or "").strip()

    # 1) Dogrulama: eksik veri -> 400
    if not mesaj:
        return jsonify({"basari": False, "hata": "Mesaj alanı boş olamaz."}), 400

    # 2) Yonlendirme: AI cagrisi try-except ile sarilir (Yonerge, Bolum 2)
    try:
        cevap = ai_service.yanit_uret(mesaj, veri.get("gecmis"))
        return jsonify({"basari": True, "cevap": cevap}), 200

    except AIServiceError as hata:
        # Dis servis kaynakli hata -> 503 Service Unavailable
        return jsonify({"basari": False, "hata": str(hata)}), 503

    except Exception:  # beklenmeyen her sey
        current_app.logger.exception("Sohbet ucunda beklenmeyen hata")
        return jsonify({"basari": False, "hata": "Beklenmeyen bir hata oluştu."}), 500


# ---------------------------------------------------------------------------
# API - LEAD KAYDI
# ---------------------------------------------------------------------------
@api_bp.route("/leads", methods=["POST"])
def lead_kaydet():
    """
    Yeni musteri adayini kaydeder.

    Beklenen govde : {"isim": "...", "telefon": "...", "isletme": "...", "mesaj": "..."}
    Donen govde    : {"basari": true, "id": 12, "mesaj": "..."}  -> 201 Created
    """
    veri = request.get_json(silent=True) or {}
    isim = (veri.get("isim") or "").strip()
    telefon = (veri.get("telefon") or "").strip()
    isletme = (veri.get("isletme") or "").strip() or None
    mesaj = (veri.get("mesaj") or "").strip() or None

    # Zorunlu alan kontrolu -> 400
    if not isim or not telefon:
        return (
            jsonify({"basari": False, "hata": "Ad ve telefon alanları zorunludur."}),
            400,
        )

    # Basit bicim kontrolu: telefon en az 10 rakam icermeli.
    rakamlar = [k for k in telefon if k.isdigit()]
    if len(rakamlar) < 10:
        return (
            jsonify({"basari": False, "hata": "Geçerli bir telefon numarası giriniz."}),
            400,
        )

    # Veritabani cagrisi da try-except ile sarilir.
    try:
        yeni_id = database.lead_ekle(isim, telefon, mesaj, isletme)
        return (
            jsonify(
                {
                    "basari": True,
                    "id": yeni_id,
                    "mesaj": "Kaydınız alındı, ekibimiz en kısa sürede dönüş yapacak.",
                }
            ),
            201,
        )
    except Exception:
        current_app.logger.exception("Lead kaydedilemedi")
        return jsonify({"basari": False, "hata": "Kayıt oluşturulamadı."}), 500


# ---------------------------------------------------------------------------
# API - LEAD LISTESI
# ---------------------------------------------------------------------------
@api_bp.route("/leads", methods=["GET"])
def lead_listesi():
    """
    Tum lead kayitlarini en yeniden eskiye dondurur.
    Donen govde: {"basari": true, "adet": 3, "leadler": [...]}
    """
    try:
        leadler = database.tum_leadler()
        return jsonify({"basari": True, "adet": len(leadler), "leadler": leadler}), 200
    except Exception:
        current_app.logger.exception("Lead listesi alinamadi")
        return jsonify({"basari": False, "hata": "Kayıtlar getirilemedi."}), 500
