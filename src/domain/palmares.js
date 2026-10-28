export function palmaresSummary(data) {
  const sum = key => data.competitions.reduce((n, c) => n + c[key].length, 0);
  const league = data.competitions.find(c => c.id === 'liga');
  return {
    titles: sum('titles'),
    runnersUp: sum('runnersUp'),
    leagueTitles: league?.titles.length ?? 0,
    topScorers: data.topScorers.length,
  };
}

export const seasonHref = (year, archiveYears) => (archiveYears.has(year) ? `/temporadas/${year}` : null);
