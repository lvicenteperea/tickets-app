Implementado el MVP completo.

  Quedó creado el frontend en frontend/package.json con React + Vite + Tesseract.js, formulario en español, preview de
  imagen, OCR inicial, edición manual, validaciones y envío a la API. El backend quedó en backend/app/main.py con
  FastAPI, CORS local, POST /tickets/upload, validaciones mock y estructura futura para MariaDB/MySQL en db/ y
  services/.

  También añadí .gitignore, .env.example en ambos lados, requirements.txt, package-lock.json y actualicé el README.md.

  Verificado:

  - npm.cmd run build: OK.
  - Backend importa correctamente y el servicio mock responde.
  - GET /health: OK.
  - POST /tickets/upload probado con:
      - ticket válido: 200
      - USADO: 409
      - INVALIDO: 404
      - número vacío: 400
      - importe 0: 400
      - tipo no permitido: 400

  Servidores locales arrancados:

  - Frontend: http://localhost:5173
  - Backend: http://127.0.0.1:8000
  - Docs API: http://127.0.0.1:8000/docs

  Procesos escuchando ahora:

  - Frontend Vite: PID 12308
  - Backend Uvicorn: PID 13836

  Para pararlos:

  Stop-Process -Id 12308,13836 -ErrorAction SilentlyContinue


   run codex resume 019e3d67-613b-7532-82c4-26b651312581