// "Hoy cumple": goleadores de Sporting Cristal con fecha de nacimiento confirmada (2 fuentes).
// Data: src/data/scorer-birthdays.json -> [{ name, birthDate: 'YYYY-MM-DD', goals }]

export function ageOn(birthDate, year, month, day) {
  const [by, bm, bd] = birthDate.split('-').map(Number);
  return year - by - (month < bm || (month === bm && day < bd) ? 1 : 0);
}

// date: Date (local) or { year, month, day }. 29-feb birthdays show on 28-feb in non-leap years.
export function birthdaysOn(entries, date) {
  const { year, month, day } = date instanceof Date
    ? { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() }
    : date;
  const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  return entries
    .filter((e) => {
      if (!e.birthDate) return false;
      const [, m, d] = e.birthDate.split('-').map(Number);
      if (m === month && d === day) return true;
      return !leap && m === 2 && d === 29 && month === 2 && day === 28;
    })
    .map((e) => ({ ...e, age: ageOn(e.birthDate, year, month, day) }))
    .sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name));
}
