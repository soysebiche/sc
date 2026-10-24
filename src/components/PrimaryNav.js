import { useEffect, useRef } from 'react';

function prefersReducedMotion() {
  return Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);
}

function scrollActiveTabIntoView(nav) {
  const active = nav.querySelector('[aria-current="page"]');
  if (!active) return;

  const navRect = nav.getBoundingClientRect();
  const tabRect = active.getBoundingClientRect();
  if (!navRect.width) return;

  const delta = tabRect.left - navRect.left - (navRect.width - tabRect.width) / 2;
  const nextLeft = nav.scrollLeft + delta;
  const behavior = prefersReducedMotion() ? 'auto' : 'smooth';

  if (typeof nav.scrollTo === 'function') {
    nav.scrollTo({ left: nextLeft, behavior });
    return;
  }

  nav.scrollLeft = nextLeft;
}

function PrimaryNav({ tabs, activeTab, onSelect }) {
  const navRef = useRef(null);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    scrollActiveTabIntoView(nav);
  }, [activeTab]);

  return (
    <nav ref={navRef} className="primary-nav" aria-label="Secciones principales">
      {tabs.map(tab => (
        <button
          type="button"
          key={tab.id}
          onClick={() => onSelect(tab.id)}
          className={`tab ${activeTab === tab.id ? 'tab-active' : 'tab-inactive'}`}
          aria-current={activeTab === tab.id ? 'page' : undefined}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}

export default PrimaryNav;
