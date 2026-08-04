import React from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

function YearChart({ data }) {
  return (
    <div className="chart-container">
      <h3 className="text-base font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Evolución por año</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
          <XAxis dataKey="year" stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
          <YAxis stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
          <Tooltip
            contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '8px', boxShadow: 'var(--shadow-md)' }}
            labelStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
            formatter={(value, name) => [value, name === 'victories' ? 'Victorias' : name === 'draws' ? 'Empates' : 'Derrotas']}
          />
          <Legend />
          <Bar dataKey="victories" name="Victorias" stackId="a" fill="var(--color-win)" />
          <Bar dataKey="draws" name="Empates" stackId="a" fill="var(--color-draw)" />
          <Bar dataKey="defeats" name="Derrotas" stackId="a" fill="var(--color-loss)" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default YearChart;
