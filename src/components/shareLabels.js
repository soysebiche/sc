export const buildCardParamsLabel = (type, { rival, name } = {}) => ({
  result: 'Último resultado de Sporting Cristal',
  efemeride: 'Efeméride celeste de hoy',
  h2h: `Sporting Cristal vs. ${rival || ''}: historial completo`,
  scorer: `${name || ''}: sus goles con Sporting Cristal`,
}[type] || 'Sebiche Celeste');
