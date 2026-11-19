import { useEffect, useRef, useState } from 'react';

const TILE = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

const LOSS = '#B4232C';
const DRAW = '#8A4B00';
const WIN = '#0A7FA8';

function prefersReducedMotion() {
  return Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);
}

function markerColor(city) {
  const played = city.away.played || (city.id === 'lima' ? city.home.played : 0);
  if (!played) return DRAW;
  const rate = city.away.played ? city.away.V / city.away.played : city.home.V / city.home.played;
  if (rate >= 0.5) return WIN;
  if (rate >= 0.33) return DRAW;
  return LOSS;
}

function markerRadius(city) {
  const played = Math.max(city.away.played, city.id === 'lima' ? Math.min(city.home.played, 80) : 0);
  return Math.min(18, 5 + Math.sqrt(Math.max(played, 1)));
}

function addTiles(L, map) {
  return L.tileLayer(TILE, {
    attribution: ATTRIBUTION,
    subdomains: 'abc',
    maxZoom: 12,
    minZoom: 2,
  }).addTo(map);
}

function CityMap({ cities, selectedId, onSelect }) {
  const hostRef = useRef(null);
  const mapRef = useRef(null);
  const tilesRef = useRef(null);
  const markersRef = useRef(null);
  const leafletRef = useRef(null);
  const onSelectRef = useRef(onSelect);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const leaflet = await import('leaflet');
        await import('leaflet/dist/leaflet.css');
        if (cancelled || !hostRef.current) return;
        const L = leaflet.default;
        leafletRef.current = L;
        const map = L.map(hostRef.current, {
          center: [-9.2, -75],
          zoom: 5,
          scrollWheelZoom: false,
          worldCopyJump: true,
        });
        mapRef.current = map;
        tilesRef.current = addTiles(L, map);
        markersRef.current = L.layerGroup().addTo(map);
        setStatus('ready');
        requestAnimationFrame(() => map.invalidateSize());
      } catch {
        if (!cancelled) setStatus('error');
      }
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      tilesRef.current = null;
      markersRef.current = null;
    };
  }, []);


  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    const group = markersRef.current;
    if (status !== 'ready' || !L || !map || !group) return;
    group.clearLayers();
    const latLngs = [];
    cities.forEach((city) => {
      if (!Number.isFinite(city.lat) || !Number.isFinite(city.lng)) return;
      const selected = city.id === selectedId;
      const marker = L.circleMarker([city.lat, city.lng], {
        radius: markerRadius(city) + (selected ? 3 : 0),
        color: selected ? '#111A40' : '#1B265C',
        weight: selected ? 3 : 1,
        fillColor: markerColor(city),
        fillOpacity: selected ? 0.95 : 0.8,
        title: city.name,
      });
      marker.bindTooltip(
        `${city.name} · ${city.away.played} PJ de visita ${city.away.V}V ${city.away.E}E ${city.away.P}P`,
        { direction: 'top', opacity: 0.95 },
      );
      marker.on('click', () => onSelectRef.current?.(city.id));
      marker.addTo(group);
      latLngs.push([city.lat, city.lng]);
    });
    if (!selectedId && latLngs.length) {
      map.fitBounds(latLngs, { padding: [28, 28], maxZoom: 6, animate: !prefersReducedMotion() });
    }
    requestAnimationFrame(() => map.invalidateSize());
  }, [cities, selectedId, status]);

  useEffect(() => {
    const map = mapRef.current;
    if (status !== 'ready' || !map || !selectedId) return;
    const city = cities.find(item => item.id === selectedId);
    if (!city || !Number.isFinite(city.lat)) return;
    map.flyTo([city.lat, city.lng], Math.max(map.getZoom(), 6), { animate: !prefersReducedMotion() });
  }, [selectedId, cities, status]);

  return (
    <div className="city-map-frame">
      <p className="sr-only">Mapa ilustrativo por ciudades. Usa la lista para elegir una ciudad.</p>
      {status === 'loading' && <div className="city-map-skeleton" role="status">Cargando mapa…</div>}
      {status === 'error' && (
        <p className="city-map-fallback">No se pudo cargar el mapa. La lista de ciudades sigue disponible.</p>
      )}
      <div ref={hostRef} className="city-map" aria-hidden="true" />
    </div>
  );
}

export default CityMap;
