# SiparişN — Akıllı Satış Asistanı

> SmartLead AI Öğrenci Proje Yönergesi'nin **SiparişN** markasına uyarlanmış uygulaması.
> Mimari yönergeyle birebir aynıdır; değişen tek şey konudur.

**Marka yöneticisi:** Abdullah ÇİÇEK · **Sektör:** Gıda / Restoran Teknolojileri ve Yazılım

SiparişN, restoranların Trendyol Yemek, Getir Yemek ve benzeri farklı sipariş
platformlarından gelen siparişleri **tek bir ekrandan** yönetmesini sağlayan
restoran sipariş yönetim yazılımıdır. Bu depo, markanın tanıtım sitesinde çalışan
**yapay zekâ destekli satış asistanını** ve toplanan müşteri adaylarının (lead)
görüntülendiği **yönetim panelini** içerir.

---

## 1. Ne yapar?

| Arayüz | Kim kullanır | Ne yapar |
|---|---|---|
| Karşılama sayfası (`/`) | Restoran sahibi / ziyaretçi (B2C) | Yapay zekâ ile sohbet eder, demo için iletişim bilgisi bırakır |
| Yönetim paneli (`/dashboard`) | SiparişN ekibi (B2B) | Gelen tüm lead kayıtlarını listeler, arar, özetler |

---

## 2. Mimari — Sorumlulukların Ayrılığı (SoC)

```
Wix / Tarayıcı Arayüzü
          ↓
Flask REST API (routes.py)      ← sadece yönlendirir
      ↙           ↘
AI Service        Database
ai_service.py     database.py
      ↓               ↓
   Groq AI          SQLite
```

**Mimari sözleşme — projenin en yüksek puanlı kısmı:**

| Kural | Nerede uygulanır |
|---|---|
| SQL **yalnızca** `app/database.py` içinde | `routes.py` hiç SQL görmez |
| Yapay zekâ API çağrısı **yalnızca** `app/services/ai_service.py` içinde | `routes.py` hiç `requests` kullanmaz |
| `routes.py` sadece doğrular ve doğru katmanı çağırır | 5 uç noktanın tamamı |
| Ayarlar **yalnızca** `config.py` içinde | Diğer katmanlar `os.environ`'a bakmaz |
| Konuya özel tek metin: `BUSINESS_CONTEXT` | `config.py` |

`ai_service.py`, Flask'ı ve veritabanını **bilmez**. Bu izolasyon sayesinde
sağlayıcıyı Groq'tan başkasına taşımak tek dosyayı değiştirmek demektir.

### Klasör yapısı

```
siparisn_ai/
├── run.py                   ← Sunucuyu başlatan giriş noktası
├── config.py                ← Tüm ayarlar + BUSINESS_CONTEXT (.env okur)
├── requirements.txt         ← Bağımlılıklar
├── test_api.sh              ← Uçtan uca API testi (13 kontrol)
├── .env                     ← Gizli anahtarlar (Git'e GİRMEZ)
├── .env.example             ← Örnek ayar dosyası (Git'e girer)
├── .gitignore
│
├── app/
│   ├── __init__.py          ← Uygulama fabrikası (create_app) + /health
│   ├── database.py          ← Veritabanı işlemleri (SADECE burada SQL)
│   ├── routes.py            ← HTTP rotaları (sadece yönlendirme)
│   ├── templates/
│   │   ├── index.html       ← Karşılama sayfası (Z-Pattern + Glassmorphism)
│   │   └── dashboard.html   ← Yönetim paneli (F-Pattern)
│   └── services/
│       ├── __init__.py
│       └── ai_service.py    ← Yapay zekâ çağrıları (SADECE burada)
│
└── wix/                     ← Wix Velo sayfa kodları
    ├── index-page.js
    └── dashboard-page.js
```

---

## 3. Kurulum

```bash
# 1) Sanal ortam
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 2) Bağımlılıklar
pip install -r requirements.txt

# 3) Ayarlar
cp .env.example .env
# .env içindeki GROQ_API_KEY satırına Groq anahtarınızı yazın (gsk_ ile başlar)

# 4) Çalıştır
python run.py
```

Tarayıcıda: **http://localhost:5001** (karşılama) · **/dashboard** (panel) · **/health** (canlılık)

> **macOS notu:** 5000 portunu AirPlay Receiver kullanır ve isteklere 403 döner.
> Bu yüzden `.env` içinde `PORT=5001` tanımlıdır. Windows/Linux'ta 5000 de kullanılabilir.

> **Anahtar yoksa ne olur?** Uygulama çökmez, **demo modunda** çalışır: asistan
> örnek bir yanıt döndürür, arayüzün geri kalanı normal çalışır.
> `/health` çıktısındaki `ai_modu` alanı `demo` mu `canli` mi olduğunu söyler.

---

## 4. API uç noktaları

| Metot | Yol | Görev | Çağırdığı katman |
|---|---|---|---|
| GET | `/` | Karşılama sayfası | `render_template` |
| GET | `/dashboard` | Yönetim paneli | `render_template` |
| GET | `/health` | Canlılık kontrolü | — |
| POST | `/api/sohbet` | AI'a mesaj iletir | `ai_service.yanit_uret()` |
| POST | `/api/leads` | Yeni lead kaydeder | `database.lead_ekle()` |
| GET | `/api/leads` | Tüm lead'leri getirir | `database.tum_leadler()` |

Her API yanıtı `basari` alanı içerir.

**Durum kodları:** `201` yeni kayıt · `400` eksik/geçersiz veri · `404` adres yok ·
`405` yanlış metot · `503` yapay zekâ servisi hatası · `500` beklenmeyen hata.

### Örnek istek/yanıtlar

```jsonc
// POST /api/sohbet
{ "mesaj": "Getir Yemek entegrasyonu var mı?", "gecmis": [] }
→ 200 { "basari": true, "cevap": "..." }

// POST /api/leads
{ "isim": "Mehmet Kaya", "telefon": "0555 111 22 33",
  "isletme": "Kaya Kebap", "mesaj": "Trendyol ve Getir kullanıyoruz" }
→ 201 { "basari": true, "id": 1, "mesaj": "Kaydınız alındı..." }

// GET /api/leads
→ 200 { "basari": true, "adet": 1, "leadler": [
        { "_id": "1", "id": 1, "isim": "...", "telefon": "...",
          "isletme": "...", "mesaj": "...", "tarih": "..." } ] }
```

> **KRİTİK:** Frontend'in gönderdiği alan adları backend ile birebir aynıdır:
> sohbet → `mesaj` / `cevap`, kayıt → `isim`, `telefon`, `isletme`, `mesaj`.
> Bir harf farkı bağlantıyı koparır.

---

## 5. Veritabanı şeması (`leads`)

| Alan | Tür | Zorunlu | Açıklama |
|---|---|---|---|
| `id` | INTEGER | Evet | Otomatik artan kayıt kimliği |
| `isim` | TEXT | Evet | Lead / müşteri adı |
| `telefon` | TEXT | Evet | İletişim telefonu |
| `isletme` | TEXT | Hayır | **SiparişN'e özgü ek alan:** restoranın/kafenin adı |
| `mesaj` | TEXT | Hayır | Kullanıcının notu |
| `tarih` | DATETIME | Evet | Kayıt zamanı |

`isletme` alanı, yönergenin Modül B'deki "isteğe bağlı kişiselleştirme" iznine
dayanır: B2B bir üründe lead'in hangi işletmeden geldiği en kritik bilgidir.
Mimariyi bozmaz; form ve panel de buna göre güncellenmiştir.

---

## 6. Güvenlik

- **SQL Injection:** Tüm sorgularda `?` yer tutucusu kullanılır, kullanıcı verisi
  SQL metnine hiçbir zaman birleştirilmez. Test edilmiştir: `x'); DROP TABLE leads; --`
  girdisi düz metin olarak kaydedilir, tablo ayakta kalır.
- **Anahtar gizliliği:** `GROQ_API_KEY` yalnızca `.env` içindedir; `.env` `.gitignore`
  ile dışarıda bırakılır. Depoya sadece `.env.example` girer.
- **CORS:** Yalnızca `/api/*` yolları açılır. Yayında `CORS_ORIGINS` kendi Wix alan
  adınızla sınırlandırılmalıdır (`*` bırakılmamalı).
- **Hata yönetimi:** Veritabanı ve AI çağrıları `try-except` ile sarılıdır; dış
  servis hataları `AIServiceError`'a çevrilir ve kullanıcıya kibar JSON döner.
  Teknik ayrıntı sunucu günlüğüne yazılır, kullanıcıya gösterilmez.
- **XSS:** Panelde tablo satırları ekrana basılmadan önce kaçırılır (`kacir()`).
- **KVKK:** Toplanan veri ad, telefon, işletme adı ve serbest not ile sınırlıdır;
  SiparişN KVKK Politikası'ndaki veri minimizasyonu ilkesine uygundur. Ödeme
  bilgisi hiçbir koşulda toplanmaz.

---

## 7. Test

```bash
./test_api.sh                      # yerel sunucuya karşı
./test_api.sh https://<render-adresiniz>   # canlı ortama karşı
```

13 kontrol çalışır: canlılık, iki sayfa, lead ekleme/doğrulama/listeleme,
sohbet, SQL Injection denemesi ve hata kodları.

---

## 8. Yayınlama (GitHub + Render)

```bash
git init
git add .
git status          # .env BU LİSTEDE GÖRÜNMEMELİ
git commit -m "SiparisN akilli satis asistani"
git remote add origin https://github.com/<kullanici>/<depo>.git
git push -u origin main
```

Render → **New Web Service** → depoyu bağla:

| Ayar | Değer |
|---|---|
| Build Command | `pip install -r requirements.txt` |
| Start Command | `gunicorn run:app` |
| Environment | `GROQ_API_KEY`, `SECRET_KEY`, `FLASK_ENV=production`, `CORS_ORIGINS=<wix alan adınız>` |

Son adım: `wix/index-page.js` ve `wix/dashboard-page.js` içindeki `API_ADRESI`
sabitini Render adresinizle değiştirin.

> **Kritik kontrol:** GitHub deposunda `.env` görünüyorsa anahtarı **hemen**
> Groq konsolundan yenileyin ve `.gitignore`'u düzeltin.

---

## 9. Wix Velo bağlantısı

Ayrıntılı kurulum ve bileşen ID sözleşmesi: **[wix/OKUBENI.md](wix/OKUBENI.md)**

```
wix/
├── OKUBENI.md                    ← Bileşen ID sözleşmesi + çalışma düzeni
├── backend/siparisn.web.js       ← Wix backend web module (ÖNERİLEN: CORS yok, adres gizli)
├── pages/index-page.js           ← Karşılama sayfası kodu
├── pages/dashboard-page.js       ← Panel sayfası kodu
└── alternatif-dogrudan-fetch/    ← Backend'siz, doğrudan wix-fetch sürümü
```

Wix siteleri HTTPS'tir ve `http://localhost` adresine istek atamaz; bu yüzden
sıra **önce Render deploy, sonra Wix bağlantısı** olmalıdır.

- Karşılama sayfası: `#girisMesaj`, `#butonSor`, `#metinCevap`, `#girisIsim`,
  `#girisTelefon`, `#girisIsletme`, `#butonKaydet`, `#metinDurum`
- Panel: `#tekrarlayici` (Repeater) + satır içi `#metinIsim`, `#metinTelefon`,
  `#metinIsletme`, `#metinTarih`, ayrıca `#butonYenile`, `#metinOzet`

Repeater'a verilen her nesnede `_id` alanı zorunludur ve **metin** olmalıdır —
backend bunu zaten `_id` olarak döndürür. Satır içinde `$w` değil `$item` kullanın.

---

## 10. Marka kimliği

| | |
|---|---|
| Birincil renk | Turuncu `#FF6B35` — hız, enerji, yemek sektörü |
| İkincil renk | Koyu lacivert `#1F2937` — güven, teknoloji |
| Tipografi | Poppins |
| Ton | Pratik, hızlı, güvenilir, teknolojik, sade, çözüm odaklı |
| UX | Karşılama: Z-Pattern + Glassmorphism · Panel: F-Pattern |

---

## 11. Sonraki geliştirmeler

- Sipariş platformu entegrasyonlarının genişletilmesi
- Restoran bazlı sipariş ve raporlama ekranları
- Kullanıcı/işletme bazlı yetkilendirme (panel şu an herkese açık)
- SQLite → PostgreSQL geçişi (yalnızca `database.py` değişir)
