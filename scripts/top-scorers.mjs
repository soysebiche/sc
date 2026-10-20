// Usage: node scripts/top-scorers.mjs [limit]
import fs from 'node:fs';
import { topScorers } from '../src/domain/scorers.js';
const read = (p) => JSON.parse(fs.readFileSync(new URL(p, import.meta.url)));
const matches = read('../src/data/historico_completo_sc.json');
const aliases = read('../src/data/scorer-aliases.json');
const limit = Number(process.argv[2] || 20);
topScorers(matches, aliases, { limit }).forEach((r, i) => console.log(`${String(i + 1).padStart(2)}. ${r.name} — ${r.goals}`));
