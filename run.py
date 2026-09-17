"""
MODUL E - Giris Noktasi
-----------------------
Sunucuyu baslatan tek dosya. Icinde hicbir is mantigi YOKTUR;
sadece fabrikadan uygulamayi alir ve calistirir.

Yerelde : python run.py
Render'da: gunicorn run:app   (asagidaki `app` degiskenini kullanir)
"""

import os

from app import create_app

# gunicorn "run:app" derken bu modul seviyesindeki degiskeni arar.
app = create_app()

if __name__ == "__main__":
    # Render gibi platformlar portu PORT ortam degiskeniyle bildirir.
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=app.config["DEBUG"])
