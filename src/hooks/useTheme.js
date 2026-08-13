import { useEffect, useRef, useState } from 'react';
import archiveMetadata from '../data/archive-metadata.json';
import { trackThemeChange } from '../services/analytics';

function readInitialTheme() {
  return document.documentElement.getAttribute('data-theme')
    || localStorage.getItem('sc-theme')
    || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
}

export function useTheme() {
  const [theme, setTheme] = useState(readInitialTheme);
  const timeoutRef = useRef(0);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.dataset.revision = archiveMetadata.datasetRevision;
    localStorage.setItem('sc-theme', theme);
  }, [theme]);

  useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  const toggleTheme = () => {
    document.documentElement.classList.add('theme-transition');
    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
    }, 350);
    setTheme(current => {
      const nextTheme = current === 'light' ? 'dark' : 'light';
      trackThemeChange(nextTheme);
      return nextTheme;
    });
  };

  return [theme, toggleTheme];
}
