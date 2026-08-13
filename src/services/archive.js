import { parseMatch } from '../domain/matches';

export async function loadArchive() {
  const module = await import('../data/historico_completo_sc.json');
  return module.default.map(parseMatch);
}
