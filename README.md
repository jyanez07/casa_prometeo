# Casa Prometeo — Landing Page

Landing page para el **curso de ingreso a la universidad** y **clases particulares** de Casa Prometeo.

- **Backend:** FastAPI (sirve el frontend + API de profesores)
- **Frontend:** HTML + CSS + JavaScript vanilla (sin librerías)
- **Carrusel de profesores:** se llena solo desde `backend/data/profesores.json`
- **Formulario:** abre WhatsApp con el mensaje del prospecto listo para enviar

## Estructura

```
landing_page_cp/
├── backend/
│   ├── main.py                 # FastAPI: API + sirve el front
│   ├── requirements.txt
│   └── data/profesores.json    # ← edita aquí a tus profesores
└── frontend/
    ├── index.html
    ├── css/styles.css          # paleta del logo (azul + dorado)
    ├── js/main.js              # carrusel, WhatsApp, menú móvil
    └── assets/
        ├── logo.png            # ← coloca aquí tu logo
        └── profes/             # ← coloca aquí las fotos
```

## Cómo correrlo

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Abre 👉 http://127.0.0.1:8000

## Lo que TIENES que personalizar

1. **Número de WhatsApp** — en `frontend/js/main.js`, edita:
   ```js
   const WHATSAPP_NUMBER = "5210000000000"; // 52 + tus 10 dígitos
   ```
2. **Logo** — guarda tu logo como `frontend/assets/logo.png`.
3. **Profesores** — edita `backend/data/profesores.json` (nombre, materia, bio, foto)
   y coloca las fotos en `frontend/assets/profes/`. Si una foto no existe, se muestra
   un placeholder automáticamente.
4. **Textos** (estadísticas, testimonios, FAQ) — en `frontend/index.html`.

## Notas

- Los colores están como variables CSS en la parte superior de `styles.css`
  (`--blue: #1B5E8C`, `--gold: #E89A1C`), tomados del logo.
- El diseño es responsive: el carrusel muestra 3 tarjetas en escritorio,
  2 en tablet y 1 en móvil.
