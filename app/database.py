"""
MODUL B - Veri Katmani
----------------------
MIMARI SOZLESME: Bu dosyanin DISINDA hicbir yerde SQL yazilmaz.
routes.py sadece buradaki fonksiyonlari cagirir; sorgunun nasil
yazildigini bilmez. Boylece yarin SQLite yerine PostgreSQL'e gecersek
sadece bu dosya degisir.
"""

import sqlite3
from datetime import datetime

from flask import current_app, g


# ---------------------------------------------------------------------------
# Baglanti yonetimi
# ---------------------------------------------------------------------------
def get_db():
    """
    Istek basina TEK bir veritabani baglantisi acar ve onu Flask'in `g`
    nesnesinde saklar. Ayni istek icinde tekrar cagrilirsa yeni baglanti
    acmaz, var olani dondurur.

    row_factory = sqlite3.Row sayesinde satirlara sutun adiyla erisebiliriz:
    satir["isim"] gibi. Bu, sonuclari dogrudan sozluge cevirmeyi kolaylastirir.
    """
    if "db" not in g:
        g.db = sqlite3.connect(
            current_app.config["DATABASE_URL"],
            detect_types=sqlite3.PARSE_DECLTYPES,
        )
        g.db.row_factory = sqlite3.Row
    return g.db


def close_db(e=None):
    """Istek bittiginde baglantiyi kapatir. create_app() icinde kaydedilir."""
    db = g.pop("db", None)
    if db is not None:
        db.close()


# ---------------------------------------------------------------------------
# Tablo kurulumu
# ---------------------------------------------------------------------------
def init_db(app):
    """
    'leads' tablosunu yoksa olusturur (varsa dokunmaz).

    Sema (Teknik Rehber Envanteri, Bolum 8):
        id       INTEGER  - otomatik artan kayit kimligi
        isim     TEXT     - zorunlu, lead / musteri adi
        telefon  TEXT     - zorunlu, iletisim telefonu
        mesaj    TEXT     - opsiyonel, kullanicinin mesaji
        tarih    DATETIME - zorunlu, kayit zamani

    SiparisN'e ozgu ek alan:
        isletme  TEXT     - opsiyonel, restoranin / kafenin adi.
        Yonerge Modul B, "istege bagli kisisellestirme" maddesi bu ek sutuna
        izin verir; mimariyi bozmadigi icin form ve panel de buna gore guncellendi.
    """
    with app.app_context():
        db = get_db()
        db.execute(
            """
            CREATE TABLE IF NOT EXISTS leads (
                id       INTEGER  PRIMARY KEY AUTOINCREMENT,
                isim     TEXT     NOT NULL,
                telefon  TEXT     NOT NULL,
                isletme  TEXT,
                mesaj    TEXT,
                tarih    DATETIME NOT NULL
            )
            """
        )
        db.commit()
        close_db()


# ---------------------------------------------------------------------------
# Veri islemleri
# ---------------------------------------------------------------------------
def lead_ekle(isim, telefon, mesaj=None, isletme=None):
    """
    Yeni bir musteri adayi (lead) kaydeder ve olusan kaydin id'sini dondurur.

    GUVENLIK ZORUNLULUGU (Yonerge, Bolum 2):
    Degerler SQL metnine string birlestirmeyle EKLENMEZ. Her deger icin `?`
    yer tutucusu kullanilir ve gercek degerler ayri bir demet olarak gecilir.
    Boylece kullanici "'; DROP TABLE leads; --" yazsa bile bu metin sorgu
    olarak degil, duz veri olarak islenir -> SQL Injection engellenir.
    """
    db = get_db()
    imlec = db.execute(
        """
        INSERT INTO leads (isim, telefon, isletme, mesaj, tarih)
        VALUES (?, ?, ?, ?, ?)
        """,
        (isim, telefon, isletme, mesaj, datetime.now()),
    )
    db.commit()
    return imlec.lastrowid


def tum_leadler():
    """
    Tum kayitlari EN YENIDEN ESKIYE dogru sirali olarak dondurur.

    Donus tipi: sozluk listesi. sqlite3.Row nesnelerini dogrudan
    dondurseydik routes.py bunlari JSON'a cevirmek zorunda kalirdi ve
    veri katmaninin detayi ust katmana sizardi. Donusumu burada yapariz.
    """
    db = get_db()
    satirlar = db.execute(
        """
        SELECT id, isim, telefon, isletme, mesaj, tarih
        FROM leads
        ORDER BY id DESC
        """
    ).fetchall()

    # Dongu: her satiri sozluge cevir. Wix Repeater her nesnede _id bekledigi
    # icin id degerini ayrica metin olarak _id alaninda da veriyoruz.
    leadler = []
    for satir in satirlar:
        leadler.append(
            {
                "_id": str(satir["id"]),
                "id": satir["id"],
                "isim": satir["isim"],
                "telefon": satir["telefon"],
                "isletme": satir["isletme"] or "",
                "mesaj": satir["mesaj"] or "",
                "tarih": str(satir["tarih"]),
            }
        )
    return leadler


def lead_sayisi():
    """Panelde ozet kart icin toplam kayit sayisini dondurur."""
    db = get_db()
    satir = db.execute("SELECT COUNT(*) AS adet FROM leads").fetchone()
    return satir["adet"]
