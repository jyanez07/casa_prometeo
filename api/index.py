"""Punto de entrada para Vercel (función serverless).

Solo expone los endpoints /api/* — los archivos estáticos del frontend
los sirve Vercel directamente según las rewrites de vercel.json.
"""

import json
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# Vercel ejecuta desde la raíz del proyecto, así que la ruta es relativa a ella.
PROFESORES_FILE = Path(__file__).resolve().parent.parent / "backend" / "data" / "profesores.json"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/api/profesores")
def get_profesores():
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
