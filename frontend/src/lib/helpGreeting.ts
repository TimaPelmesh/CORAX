/** Time-of-day greeting for the public /h form (office hours, Russian). */

export function dayPartGreeting(date: Date = new Date()): string {
  const h = date.getHours()
  if (h >= 5 && h < 12) return 'Доброго утра'
  if (h >= 12 && h < 18) return 'Доброго дня'
  if (h >= 18 && h < 23) return 'Доброго вечера'
  return 'Доброй ночи'
}

/** «Доброго дня, Иван Иванов» — без учётки в скобках. */
export function helpGreeting(person: string, date: Date = new Date()): string {
  const hi = dayPartGreeting(date)
  const name = person.trim()
  return name ? `${hi}, ${name}` : hi
}
