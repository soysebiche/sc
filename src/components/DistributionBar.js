function DistributionBar({ stats }) {
  if (!stats?.total) return null;

  const parts = [
    { key: 'victories', short: 'V', percentage: stats.winPercentage },
    { key: 'draws', short: 'E', percentage: stats.drawPercentage },
    { key: 'defeats', short: 'P', percentage: stats.defeatPercentage },
  ];

  return (
    <div>
      <div className="distribution-bar" aria-label={`${stats.victories} victorias, ${stats.draws} empates y ${stats.defeats} derrotas`}>
        {parts.map(part => (
          <div
            key={part.key}
            className={`distribution-bar__fill--${part.key}`}
            style={{ width: `${part.percentage}%` }}
          >
            {Number(part.percentage) > 10 && `${part.percentage}%`}
          </div>
        ))}
      </div>
      <div className="distribution-legend">
        {parts.map(part => (
          <span key={part.key} className={`distribution-legend__item--${part.key}`}>
            {part.short}: {stats[part.key]}
          </span>
        ))}
      </div>
    </div>
  );
}

export default DistributionBar;
