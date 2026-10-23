// Lightweight CSS bars for goal-minute buckets (no chart lib needed).
function MinuteBars({ buckets, caption }) {
  const max = Math.max(1, ...buckets.map(b => b.goals));
  return (
    <figure className="minute-bars">
      <ul>{buckets.map(b => (
        <li key={b.label}>
          <span className="minute-bars__label">{b.label}{"'"}</span>
          <span className="minute-bars__track"><span className="minute-bars__fill" style={{ width: `${(b.goals / max) * 100}%` }} /></span>
          <span className="minute-bars__value">{b.goals}</span>
        </li>
      ))}</ul>
      {caption && <figcaption className="text-xs copy-muted mt-2">{caption}</figcaption>}
    </figure>
  );
}

export default MinuteBars;
