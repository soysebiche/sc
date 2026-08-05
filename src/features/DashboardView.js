import DistributionBar from '../components/DistributionBar';
import StatTile from '../components/StatTile';

function DashboardView({ overview }) {
  const winRate = overview.totalMatches ? ((overview.victories / overview.totalMatches) * 100).toFixed(1) : '0.0';
  const drawRate = overview.totalMatches ? ((overview.draws / overview.totalMatches) * 100).toFixed(1) : '0.0';
  const lossRate = overview.totalMatches ? ((overview.defeats / overview.totalMatches) * 100).toFixed(1) : '0.0';
  const goalDifference = overview.totalScGoals - overview.totalOpponentGoals;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="stat-strip stat-strip--4">
        <StatTile label="Partidos" value={overview.totalMatches || 0} color="var(--color-celeste)" />
        <StatTile label="Victorias" value={overview.victories || 0} detail={`${winRate}%`} color="var(--color-win)" />
        <StatTile label="Empates" value={overview.draws || 0} detail={`${drawRate}%`} color="var(--color-draw)" />
        <StatTile label="Derrotas" value={overview.defeats || 0} detail={`${lossRate}%`} color="var(--color-loss)" />
      </div>

      <div className="stat-strip stat-strip--3">
        <StatTile label="Goles a favor" value={overview.totalScGoals || 0} color="var(--color-celeste)" />
        <StatTile label="Goles en contra" value={overview.totalOpponentGoals || 0} />
        <StatTile label="Diferencia de goles" value={`${goalDifference > 0 ? '+' : ''}${goalDifference}`} color="var(--color-celeste)" />
      </div>

      <div className="stat-strip stat-strip--3 stat-strip--context">
        <StatTile label="Mejor rival" value={overview.bestRival?.name || '-'} detail={overview.bestRival ? `${overview.bestRival.ganados}V · ${overview.bestRival.empatados}E · ${overview.bestRival.perdidos}P` : '-'} align="left" />
        <StatTile label="Rival más difícil" value={overview.worstRival?.name || '-'} detail={overview.worstRival ? `${overview.worstRival.ganados}V · ${overview.worstRival.empatados}E · ${overview.worstRival.perdidos}P` : '-'} align="left" />
        <StatTile label="Países jugados" value={overview.totalIntlCountries || 0} detail="selecciones y equipos" align="left" />
      </div>

      <section className="archive-section">
        <p className="stat-label mb-3">Distribución de resultados</p>
        <DistributionBar wins={overview.victories} draws={overview.draws} losses={overview.defeats} total={overview.totalMatches} />
      </section>
    </div>
  );
}

export default DashboardView;
