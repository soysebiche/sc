import fs from 'fs';
import path from 'path';
import { parseMatch } from '../../src/domain/matches.js';
import { buildCard } from '../../src/domain/share.js';

let cache;
const readJson = file => JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src', 'data', file), 'utf8'));

export function loadShareData() {
  if (!cache) cache = { matches: readJson('historico_completo_sc.json').map(parseMatch), aliases: readJson('scorer-aliases.json') };
  return cache;
}

export const pickParams = query => {
  const one = v => (Array.isArray(v) ? v[0] : v);
  return { type: one(query.type) || 'result', rival: one(query.rival), name: one(query.name), date: one(query.date) };
};

export function cardFor(query) {
  const { matches, aliases } = loadShareData();
  const params = pickParams(query);
  return { params, card: buildCard(matches, aliases, params) };
}
