const TONE_CLASS = {
  celeste: 'stat-tile--celeste',
  win: 'stat-tile--win',
  draw: 'stat-tile--draw',
  loss: 'stat-tile--loss',
};

function StatTile({ label, value, detail, tone, align = 'center' }) {
  const toneClass = TONE_CLASS[tone] || '';
  return (
    <div className={`stat-tile ${toneClass} ${align === 'left' ? 'text-left' : ''}`.trim()}>
      <p className="stat-label">{label}</p>
      <p className="stat-value stat-number">{value}</p>
      {detail && <p className="stat-detail">{detail}</p>}
    </div>
  );
}

export default StatTile;
