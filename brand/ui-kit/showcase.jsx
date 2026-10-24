import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import fs from 'fs';
import { SiteHeader, StatTile, MatchCard, DistributionBar, DataTable, Button, Disclaimer, ResultBadge } from './components/index.jsx';
const data = JSON.parse(fs.readFileSync('/workspace/sc-research/src/data/historico_completo_sc.json', 'utf8'));
const efem = data.filter((m) => m['Fecha'].slice(5) === '10-24').slice(-3).reverse();
const last = data.slice(-1);
const tabs = [{ id: 'efem', label: 'Efemérides' }, { id: 'riv', label: 'Rivales' }, { id: 'anio', label: 'Año a año' }, { id: 'cal', label: 'Calendario' }];
function Panel({ theme }) {
  return (
    <div className="sc" data-theme={theme} style={{ flex: 1, minWidth: 0 }}>
      <SiteHeader logoSrc="../logo/svg/sebiche-celeste-lockup-horizontal-color.svg" tabs={tabs} current="efem" actions={<span style={{ font: '500 12px var(--sc-font-mono)', color: '#C9D3E6' }}>tema {theme === 'dark' ? 'oscuro' : 'claro'}</span>} />
      <main style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div><div className="sc-eyebrow">Efemérides · 24 de octubre</div><h1 className="sc-h" style={{ fontSize: 56 }}>Un día como hoy</h1></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          <StatTile label="Partidos" value="6" tone="accent" />
          <StatTile label="Victorias" value="5" tone="win" />
          <StatTile label="Empates" value="0" tone="draw" />
          <StatTile label="Derrotas" value="1" tone="loss" />
        </div>
        {efem.map((m) => <MatchCard key={m['Fecha']} match={m} />)}
        <div className="sc-card"><div className="sc-eyebrow" style={{ marginBottom: 10 }}>Clásico · vs Alianza Lima (140 PJ)</div><DistributionBar win={44} draw={52} loss={44} /></div>
        <div className="sc-card"><DataTable caption="Temporadas recientes" columns={[{ key: 'y', label: 'Año' }, { key: 'pj', label: 'PJ', num: true }, { key: 'v', label: 'V', num: true }, { key: 'e', label: 'E', num: true }, { key: 'p', label: 'P', num: true }]} rows={[{ y: '2026', pj: 44, v: 20, e: 8, p: 16 }, { y: '2025', pj: 46, v: 22, e: 10, p: 14 }]} /></div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}><Button>Suscribirme al calendario</Button><Button variant="ghost">Ver ficha</Button><ResultBadge result="V" /><ResultBadge result="E" /><ResultBadge result="P" /></div>
        {last.map((m) => <MatchCard key="l" match={m} />)}
        <Disclaimer />
      </main>
    </div>
  );
}
const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Sebiche Celeste — UI kit</title>
<link rel="stylesheet" href="../fonts/fonts.css"><link rel="stylesheet" href="../tokens/tokens.css"><link rel="stylesheet" href="ui-kit.css">
<style>body{margin:0;background:#5a6378}.wrap{display:flex;gap:2px}</style></head><body><div class="wrap">${renderToStaticMarkup(<><Panel theme="light" /><Panel theme="dark" /></>)}</div></body></html>`;
fs.writeFileSync('/workspace/sc-research/brand/ui-kit/showcase.html', html);
console.log('showcase ok');
