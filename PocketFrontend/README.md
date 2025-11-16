# PocketFrontend

Minimal React + Vite frontend for the PocketBackend project.

Features:
- Login and Signup pages that POST to the backend `/api/auth/login` and `/api/auth/register`.
- Stores returned JWT token in `localStorage` under `token`.
- Home page shows a curved card labeled "Login" and shows whether a token is present.

Quick start:
1. cd PocketFrontend
2. npm install
3. npm run dev

The dev server (Vite) proxies `/api` requests to `http://localhost:8080` (see `vite.config.js`).
