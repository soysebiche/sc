import { clubOf } from '../domain/matches';
import { usePublicCatalog } from './PublicCatalog';

function RivalLink({ name, className = 'link-accent', children }) {
  const { rivalPathByName } = usePublicCatalog();
  if (!name) return children ?? null;
  const path = rivalPathByName.get(name) || rivalPathByName.get(clubOf(name));
  const label = children ?? name;
  if (!path) return label;
  return <a className={className} href={path}>{label}</a>;
}

export default RivalLink;
