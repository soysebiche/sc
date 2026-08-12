# AGENTS.md

## Cursor Cloud specific instructions

This is a **Vite + React 19** project for viewing Sporting Cristal football club historical match statistics ("Sebiche Celeste"). All data is static JSON bundled at `src/data/historico_completo_sc.json` — no database or external API is needed for local development.

### Running the app

- **Install:** `npm ci` (npm + `package-lock.json`; Node.js 20+)
- **Dev server:** `npm start` or `npm run dev` (Vite on port 5173, bound to `0.0.0.0`)
- **Build:** `npm run build` (runs `generate:calendar` first, output in `dist/`)
- **Preview:** `npm run preview`
- **Lint:** `npm run lint`
- **Tests:** `npm run test:ci` (non-interactive Vitest). Use `npm test` for watch mode.
- **Full gate:** `npm run check` (lint + data audit + tests + build)

See `README.md` for full script documentation.

### Environment notes

- No environment variables are required for local development.
- Optional: copy `env.example` to `.env.local` and set `VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX` to enable GA4 after visitor consent.
- The Vercel serverless API (`/api/data`) is not needed locally; the app imports data directly from the bundled JSON file.

### Cloud Agent notes

- Preferred install command: `npm ci` (idempotent; do not rewrite the lockfile unless intentionally upgrading deps).
- No secrets or Docker services are required for install, lint, tests, or the Vite app.
- Upcoming-fixture assertions in UI tests must match `src/data/upcoming-fixtures.json` after calendar updates.
