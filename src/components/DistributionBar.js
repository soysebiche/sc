function DistributionBar({ stats, wins, draws, losses, total }) {
  const resolved = stats || {
    total,
    victories: wins,
    draws,
    defeats: losses,
    winPercentage: total ? ((wins / total) * 100).toFixed(1) : '0.0',
    drawPercentage: total ? ((draws / total) * 100).toFixed(1) : '0.0',
    defeatPercentage: total ? ((losses / total) * 100).toFixed(1) : '0.0',
  };
  if (!resolved.total) return null;

  const parts = [
    { key: 'victories', short: 'V', percentage: resolved.winPercentage, color: 'var(--color-win-bar)', text: 'var(--color-win)' },
    { key: 'draws', short: 'E', percentage: resolved.drawPercentage, color: 'var(--color-draw-bar)', text: 'var(--color-draw)' },
    { key: 'defeats', short: 'P', percentage: resolved.defeatPercentage, color: 'var(--color-loss-bar)', text: 'var(--color-loss)' },
  ];

  return (
    <div>
      <div className="distribution-bar" aria-label={`${resolved.victories} victorias, ${resolved.draws} empates y ${resolved.defeats} derrotas`}>
        {parts.map(part => (
          <div key={part.key} style={{ width: `${part.percentage}%`, background: part.color }}>
            {Number(part.percentage) > 10 && `${part.percentage}%`}
          </div>
        ))}
      </div>
      <div className="distribution-legend">
        {parts.map(part => <span key={part.key} style={{ color: part.text }}>{part.short}: {resolved[part.key]}</span>)}
      </div>
    </div>
  );
}

export default DistributionBar;
