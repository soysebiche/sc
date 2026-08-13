import DistributionBar from '../components/DistributionBar';
import StatTile from '../components/StatTile';

function DashboardView({ overview }) {
  const goalDifference = overview.goalsFor - overview.goalsAgainst;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="stat-strip stat-strip--4">
        <StatTile label="Partidos" value={overview.total || 0} color="var(--color-celeste)" />
        <StatTile label="Victorias" value={overview.victories || 0} detail={`${overview.winPercentage}%`} color="var(--color-win)" />
        <StatTile label="Empates" value={overview.draws || 0} detail={`${overview.drawPercentage}%`} color="var(--color-draw)" />
        <StatTile label="Derrotas" value={overview.defeats || 0} detail={`${overview.defeatPercentage}%`} color="var(--color-loss)" />
      </div>

      <div className="stat-strip stat-strip--3">
        <StatTile label="Goles a favor" value={overview.goalsFor || 0} color="var(--color-celeste)" />
        <StatTile label="Goles en contra" value={overview.goalsAgainst || 0} />
        <StatTile label="Diferencia de goles" value={`${goalDifference > 0 ? '+' : ''}${goalDifference}`} color="var(--color-celeste)" />
      </div>

      <div className="stat-strip stat-strip--3 stat-strip--context">
        <StatTile label="Mejor rival" value={overview.bestRival?.name || '-'} detail={overview.bestRival ? `${overview.bestRival.ganados}V · ${overview.bestRival.empatados}E · ${overview.bestRival.perdidos}P` : '-'} align="left" />
        <StatTile label="Rival más difícil" value={overview.worstRival?.name || '-'} detail={overview.worstRival ? `${overview.worstRival.ganados}V · ${overview.worstRival.empatados}E · ${overview.worstRival.perdidos}P` : '-'} align="left" />
        <StatTile label="Países jugados" value={overview.totalIntlCountries || 0} detail="selecciones y equipos" align="left" />
      </div>

      <section className="archive-section">
        <p className="stat-label mb-3">Distribución de resultados</p>
        <DistributionBar stats={overview} />
      </section>
    </div>
  );
}

export default DashboardView;
