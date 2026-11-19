import { Fragment, useMemo } from 'react';
import aliases from '../data/scorer-aliases.json';
import { goalNoteParts } from '../domain/players';
import { buildResolver } from '../domain/scorers';
import { usePublicCatalog } from './PublicCatalog';

const resolve = buildResolver(aliases);

function PlayerLink({ name, className = 'link-accent', children }) {
  const { playerPathByName } = usePublicCatalog();
  if (!name) return children ?? null;
  const path = playerPathByName.get(name) || playerPathByName.get(resolve(name));
  const label = children ?? name;
  if (!path) return label;
  return <a className={className} href={path}>{label}</a>;
}

function GoalsNote({ match }) {
  const { playerPathByName } = usePublicCatalog();
  const parts = useMemo(
    () => goalNoteParts(match.goalsNote, match.date, resolve, playerPathByName),
    [match.date, match.goalsNote, playerPathByName],
  );
  if (!match.goalsNote) return null;
  if (!parts.length) return match.goalsNote;
  return parts.map((part, index) => (
    <Fragment key={`${part.text}-${index}`}>
      {index ? ', ' : ''}
      {part.href
        ? <>{part.before}<a className="link-accent" href={part.href}>{part.name}</a>{part.after}</>
        : part.text}
    </Fragment>
  ));
}

export { GoalsNote };
export default PlayerLink;
