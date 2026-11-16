import { PUBLIC_NAV } from '../domain/publicRoutes';

function PublicArchiveNav({ className = 'seo-nav' }) {
  return (
    <nav className={className} aria-label="Archivo público">
      {PUBLIC_NAV.map(item => (
        <a key={item.path} href={item.path}>{item.label}</a>
      ))}
    </nav>
  );
}

export default PublicArchiveNav;
