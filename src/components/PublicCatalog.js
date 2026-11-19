import { createContext, useContext, useMemo } from 'react';
import aliases from '../data/scorer-aliases.json';
import { buildCatalogLookups, buildPublicCatalog } from '../domain/publicRoutes';

const EMPTY_LOOKUPS = {
  matchPathByKey: new Map(),
  rivalPathByName: new Map(),
  countryPathByName: new Map(),
  playerPathByName: new Map(),
};

const PublicCatalogContext = createContext(EMPTY_LOOKUPS);

export function PublicCatalogProvider({ matches, children }) {
  const value = useMemo(() => {
    if (!matches?.length) return EMPTY_LOOKUPS;
    return buildCatalogLookups(buildPublicCatalog(matches, aliases));
  }, [matches]);

  return <PublicCatalogContext.Provider value={value}>{children}</PublicCatalogContext.Provider>;
}

export function usePublicCatalog() {
  return useContext(PublicCatalogContext);
}
