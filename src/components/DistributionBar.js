function DistributionBar({ stats }) {
  if (!stats?.total) return null;

  const parts = [
    { key: 'victories', short: 'V', percentage: stats.winPercentage, color: 'var(--color-win-bar)', text: 'var(--color-win)' },
    { key: 'draws', short: 'E', percentage: stats.drawPercentage, color: 'var(--color-draw-bar)', text: 'var(--color-draw)' },
    { key: 'defeats', short: 'P', percentage: stats.defeatPercentage, color: 'var(--color-loss-bar)', text: 'var(--color-loss)' },
  ];

  return (
    <div>
      <div className="distribution-bar" aria-label={`${stats.victories} victorias, ${stats.draws} empates y ${stats.defeats} derrotas`}>
        {parts.map(part => (
          <div key={part.key} style={{ width: `${part.percentage}%`, background: part.color }}>
            {Number(part.percentage) > 10 && `${part.percentage}%`}
          </div>
        ))}
      </div>
      <div className="distribution-legend">
        {parts.map(part => <span key={part.key} style={{ color: part.text }}>{part.short}: {stats[part.key]}</span>)}
      </div>
    </div>
  );
}

export default DistributionBar;
