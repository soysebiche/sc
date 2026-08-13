# AGENTS.md

## Cursor Cloud specific instructions

This is a **Vite 7 + React 19** project for viewing Sporting Cristal football club historical match statistics ("Sebiche Celeste"). All data is static JSON bundled at `src/data/historico_completo_sc.json` — no database or external API is needed for local development.

### Running the app

- **Dev server:** `npm start` (port 5173 unless Vite picks another free port)
- **Build:** `npm run build` (runs `scripts/generate-calendar.mjs` first)
- **Tests:** `npm run test:ci` (Vitest, non-interactive)
- **Lint:** `npm run lint` (`eslint src/ api/`)
- **Full gate:** `npm run check` (lint + data audit + tests + production build)

See `README.md` for full script documentation.

### Architecture notes

- Domain rules live in `src/domain/matches.js`. Do not re-parse scores, dates, or rival aliases in views.
- Shareable UI state lives in URL params via `src/hooks/useUrlState.js`.
- The Vercel serverless routes (`/api/data`, `/api/vitals`) are optional. The UI loads the dataset with a dynamic import, not `/api/data`.
- Files listed in `src/legacy-manifest.json` are **not mounted**. Do not revive Login, Trivia, or `authService` unless the task explicitly asks to restore them. Prefer deleting that tree over extending it.

### Environment notes

- No environment variables are required for local development.
- `VITE_GA_MEASUREMENT_ID` is optional and only used after explicit visitor consent (see `env.example`).
- Do not introduce `REACT_APP_*` variables; this is not Create React App.
