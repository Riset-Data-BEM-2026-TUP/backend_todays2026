# backend_todays2026

## Deployment (ringkas)

Backend berjalan sebagai Node.js app dengan PostgreSQL eksternal.

Environment variables:

- `DATABASE_URL` — koneksi PostgreSQL
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` — secret token JWT
- `FRONTEND_ORIGIN` — origin frontend (untuk CORS)
- `PORT` — di-set otomatis oleh host (jangan diisi manual)

Build & start:

    npm install    # menjalankan prisma generate (postinstall)
    npm run build  # menghasilkan dist/
    npm start      # node dist/main.js
