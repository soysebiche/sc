import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const UrlStateContext = createContext(null);

const readParam = (search, key, defaultValue, validate) => {
  const value = new URLSearchParams(search).get(key);
  if (value === null || value === '' || (validate && !validate(value))) return defaultValue;
  return value;
};

export function UrlStateProvider({ children, onUserChange }) {
  const [search, setSearch] = useState(() => window.location.search);

  useEffect(() => {
    const handlePopState = () => setSearch(window.location.search);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const assign = useCallback((updates, { history = 'replace' } = {}) => {
    const params = new URLSearchParams(window.location.search);
    const tracked = [];

    Object.entries(updates).forEach(([key, spec]) => {
      const { value, defaultValue, validate } = spec;
      if (validate && value !== '' && value != null && !validate(value)) return;
      if (value === '' || value === null || value === defaultValue) params.delete(key);
      else params.set(key, String(value));
      tracked.push([key, value !== '' && value !== null && value !== defaultValue]);
    });

    const query = params.toString();
    const nextUrl = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
    window.history[history === 'push' ? 'pushState' : 'replaceState']({}, '', nextUrl);
    setSearch(window.location.search);
    tracked.forEach(([key, isActive]) => onUserChange?.(key, isActive));
  }, [onUserChange]);

  const value = useMemo(() => ({ search, assign }), [assign, search]);
  return <UrlStateContext.Provider value={value}>{children}</UrlStateContext.Provider>;
}

export function useUrlState(key, defaultValue = '', options = {}) {
  const { validate, history = 'replace' } = options;
  const context = useContext(UrlStateContext);
  if (!context) throw new Error('useUrlState must be used within UrlStateProvider');

  const value = readParam(context.search, key, defaultValue, validate);

  const setValue = useCallback((nextValue, extras = {}) => {
    const resolved = typeof nextValue === 'function' ? nextValue(value) : nextValue;
    const updates = { [key]: { value: resolved, defaultValue, validate } };
    Object.entries(extras).forEach(([extraKey, spec]) => {
      updates[extraKey] = spec && typeof spec === 'object' && 'value' in spec
        ? spec
        : { value: spec };
    });
    context.assign(updates, { history });
  }, [context, defaultValue, history, key, validate, value]);

  return [value, setValue];
}
