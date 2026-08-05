import { useCallback, useEffect, useState } from 'react';
import { trackUrlControl } from '../services/analytics';

const readValue = (key, defaultValue, validate) => {
  const value = new URLSearchParams(window.location.search).get(key);
  if (value === null || value === '' || (validate && !validate(value))) return defaultValue;
  return value;
};

export function useUrlState(key, defaultValue = '', options = {}) {
  const { validate, history = 'replace' } = options;
  const [value, setValue] = useState(() => readValue(key, defaultValue, validate));

  useEffect(() => {
    const handlePopState = () => setValue(readValue(key, defaultValue, validate));
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [defaultValue, key, validate]);

  const updateValue = useCallback((nextValue) => {
    const resolved = typeof nextValue === 'function' ? nextValue(value) : nextValue;
    const params = new URLSearchParams(window.location.search);

    if (resolved === '' || resolved === null || resolved === defaultValue) params.delete(key);
    else params.set(key, String(resolved));

    const query = params.toString();
    const nextUrl = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
    window.history[history === 'push' ? 'pushState' : 'replaceState']({}, '', nextUrl);
    setValue(resolved);
    trackUrlControl(key, resolved !== '' && resolved !== null && resolved !== defaultValue);
  }, [defaultValue, history, key, value]);

  return [value, updateValue];
}
