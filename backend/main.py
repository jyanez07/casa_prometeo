"""Casa Prometeo — Landing Page API.

FastAPI sirve el frontend estático y expone los datos de los profesores
desde un archivo JSON editable (backend/data/profesores.json).

Correr en local:
    cd backend
    pip install -r requirements.txt
    uvicorn main:app --reload
Luego abre http://127.0.0.1:8000
"""

import json
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BASE_DIR.parent / "frontend"
PROFESORES_FILE = BASE_DIR / "data" / "profesores.json"

app = FastAPI(title="Casa Prometeo API", version="1.0.0")

# CORS abierto: el front se sirve desde el mismo origen, pero esto facilita
# desarrollarlo por separado si más adelante separas front y back.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/api/profesores")
def get_profesores():
    """Devuelve la lista de profesores para el carrusel."""
    if not PROFESORES_FILE.exists():
        raise HTTPException(status_code=404, detail="profesores.json no encontrado")
    try:
        with PROFESORES_FILE.open(encoding="utf-8") as f:
            return json.load(f)
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=500, detail=f"JSON inválido: {exc}")


@app.get("/api/health")
def health():
    return {"status": "ok"}


# --- Servir el frontend estático ---------------------------------------------
# /assets, /css, /js se sirven como archivos estáticos.
app.mount("/assets", StaticFiles(directory=FRONTEND_DIR / "assets"), name="assets")
app.mount("/css", StaticFiles(directory=FRONTEND_DIR / "css"), name="css")
app.mount("/js", StaticFiles(directory=FRONTEND_DIR / "js"), name="js")


@app.get("/")
def index():
    return FileResponse(FRONTEND_DIR / "index.html")
