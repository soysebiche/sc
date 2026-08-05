function StatTile({ label, value, detail, sub, color, colorVar, align = 'center' }) {
  const resolvedColor = color || colorVar || 'var(--text-primary)';
  const resolvedDetail = detail || sub;
  return (
    <div className={`stat-tile ${align === 'left' ? 'text-left' : ''}`}>
      <p className="stat-label" style={{ color: resolvedColor }}>{label}</p>
      <p className="stat-value stat-number" style={{ color: resolvedColor }}>{value}</p>
      {resolvedDetail && <p className="stat-detail">{resolvedDetail}</p>}
    </div>
  );
}

export default StatTile;
