import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

function ScorerYearChart({ data }) {
  return (
    <div className="chart-container">
      <h3 className="chart-title text-base font-bold mb-3">Goles por año</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
          <XAxis dataKey="year" stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
          <YAxis allowDecimals={false} stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
          <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }} formatter={v => [v, 'Goles']} />
          <Bar dataKey="goals" name="Goles" fill="var(--color-celeste)" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ScorerYearChart;
