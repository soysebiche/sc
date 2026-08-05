import DistributionBar from './DistributionBar';
import StatTile from './StatTile';

function BalanceSummary({ title, stats }) {
  return (
    <section className="archive-section">
      <h3 className="balance-title">{title}</h3>
      <div className="stat-strip stat-strip--5 mb-4">
        <StatTile label="Total" value={stats.total} detail="partidos" color="var(--color-celeste)" />
        <StatTile label="Ganados" value={stats.victories} detail={`${stats.winPercentage}%`} color="var(--color-win)" />
        <StatTile label="Empatados" value={stats.draws} detail={`${stats.drawPercentage}%`} color="var(--color-draw)" />
        <StatTile label="Perdidos" value={stats.defeats} detail={`${stats.defeatPercentage}%`} color="var(--color-loss)" />
        <StatTile label="Goles" value={`${stats.goalsFor} - ${stats.goalsAgainst}`} detail="a favor - en contra" color="var(--color-celeste)" />
      </div>
      <DistributionBar stats={stats} />
    </section>
  );
}

export default BalanceSummary;
