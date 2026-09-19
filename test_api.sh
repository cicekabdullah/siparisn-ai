#!/usr/bin/env bash
# =============================================================
# MODUL F — Uctan uca API testi
# Kullanim:  ./test_api.sh                 (yerel, http://127.0.0.1:5001)
#            ./test_api.sh https://... (canli Render adresi)
# =============================================================
set -u
B="${1:-http://127.0.0.1:5001}"
gecti=0; kaldi=0

kontrol() { # kontrol "<aciklama>" "<beklenen kod>" "<alinan kod>"
  if [ "$2" = "$3" ]; then echo "  ✓ $1 ($3)"; gecti=$((gecti+1))
  else echo "  ✗ $1 — beklenen $2, alinan $3"; kaldi=$((kaldi+1)); fi
}

kod() { curl -s -o /dev/null -w "%{http_code}" "$@"; }

echo "SiparisN API testi -> $B"
echo

echo "1) Canlilik"
kontrol "GET /health" 200 "$(kod $B/health)"

echo "2) Sayfalar"
kontrol "GET /" 200 "$(kod $B/)"
kontrol "GET /dashboard" 200 "$(kod $B/dashboard)"

echo "3) Lead kaydi"
kontrol "POST /api/leads (gecerli)" 201 "$(kod -X POST $B/api/leads -H 'Content-Type: application/json' \
  -d '{"isim":"Test Kullanici","telefon":"05551234567","isletme":"Test Restoran","mesaj":"otomatik test"}')"
kontrol "POST /api/leads (eksik telefon)" 400 "$(kod -X POST $B/api/leads -H 'Content-Type: application/json' \
  -d '{"isim":"Test"}')"
kontrol "POST /api/leads (gecersiz telefon)" 400 "$(kod -X POST $B/api/leads -H 'Content-Type: application/json' \
  -d '{"isim":"Test","telefon":"123"}')"

echo "4) Lead listesi"
kontrol "GET /api/leads" 200 "$(kod $B/api/leads)"

echo "5) Sohbet"
kontrol "POST /api/sohbet (gecerli)" 200 "$(kod -X POST $B/api/sohbet -H 'Content-Type: application/json' \
  -d '{"mesaj":"Merhaba, SiparisN ne yapar?"}')"
kontrol "POST /api/sohbet (bos mesaj)" 400 "$(kod -X POST $B/api/sohbet -H 'Content-Type: application/json' \
  -d '{"mesaj":"   "}')"

echo "6) Guvenlik: SQL Injection denemesi"
enjeksiyon=$(kod -X POST $B/api/leads -H 'Content-Type: application/json' \
  -d "{\"isim\":\"x'); DROP TABLE leads; --\",\"telefon\":\"05000000000\"}")
# Iki sonuc da BASARILIDIR ve ikisi de savunmanin calistigini gosterir:
#   201 -> istek uygulamaya ulasti; parametreli sorgu sayesinde zararli metin
#          SQL olarak degil, duz veri olarak kaydedildi (bizim korumamiz).
#   403 -> istek uygulamaya hic ulasmadi; Render onundeki Cloudflare guvenlik
#          duvari engelledi (altyapi korumasi). Yayinda beklenen davranis budur.
if [ "$enjeksiyon" = "201" ]; then
  echo "  ✓ zararli girdi duz metin olarak kaydedildi — parametreli sorgu korudu (201)"
  gecti=$((gecti+1))
elif [ "$enjeksiyon" = "403" ]; then
  echo "  ✓ zararli istek uygulamaya ulasmadan engellendi — Cloudflare WAF (403)"
  gecti=$((gecti+1))
else
  echo "  ✗ SQL Injection korumasi — beklenen 201 veya 403, alinan $enjeksiyon"
  kaldi=$((kaldi+1))
fi
kontrol "tablo hala ayakta (GET /api/leads)" 200 "$(kod $B/api/leads)"

echo "7) Hata yonetimi"
kontrol "GET /api/olmayan (404 JSON)" 404 "$(kod $B/api/olmayan)"
kontrol "GET /api/sohbet (yanlis metot)" 405 "$(kod $B/api/sohbet)"

echo
echo "SONUC: $gecti gecti, $kaldi kaldi"
[ "$kaldi" -eq 0 ]
