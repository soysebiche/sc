import assert from 'node:assert/strict';
import test from 'node:test';
import { auditArchive } from './audit-data.mjs';

const validRecord = {
  Año: 2026,
  Mes: 'Agosto',
  Dia: 2,
  'Día de la Semana': 'Domingo',
  Fecha: '2026-08-02',
  Torneo: 'Clausura',
  'Número de Fecha': '3',
  'Equipo Local': 'Sporting Cristal',
  'Equipo Visita': 'Juan Pablo II',
  Marcador: '2-0',
  Resultado: 'V',
  'Goles (Solo SC)': 'Hernán Barcos (46), Santiago González (80)',
  País: 'Perú',
};

const metadata = {
  recordCount: 1,
  firstMatchDate: '2026-08-02',
  latestMatchDate: '2026-08-02',
  lastUpdated: '2026-08-04',
};

test('accepts a record that satisfies the archive contract', () => {
  assert.deepEqual(auditArchive([validRecord], metadata), []);
});

test('detects a deliberately seeded score/result anomaly', () => {
  const seeded = { ...validRecord, Marcador: '0-2', Resultado: 'V' };
  const codes = auditArchive([seeded], metadata).map(item => item.code);
  assert.ok(codes.includes('result'));
});
