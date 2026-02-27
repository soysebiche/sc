# AGENTS.md

## Cursor Cloud specific instructions

This is a **Create React App** project (React 19) for viewing Sporting Cristal football club historical match statistics ("Sebiche Celeste"). All data is static JSON bundled at `src/data/historico_completo_sc.json` — no database or external API is needed for local development.

### Running the app

- **Dev server:** `npm start` (port 3000)
- **Build:** `npm run build`
- **Tests:** `CI=true npm test` (use `CI=true` to run non-interactively)
- **Lint:** `npx eslint src/`

See `README.md` for full script documentation.

### Known issues

- The default test in `src/App.test.js` fails because it still looks for the CRA boilerplate "learn react" text, which no longer exists in the customized app. This is a pre-existing issue, not a regression.
- ESLint reports 1 pre-existing warning in `src/services/authService.js` (`import/no-anonymous-default-export`).

### Environment notes

- No environment variables are required for local development. `API_SECRET_TOKEN` and `REACT_APP_GA_MEASUREMENT_ID` are optional (see `env.example`).
- The Vercel serverless API (`/api/data`) is not needed locally; the app imports data directly from the bundled JSON file.
