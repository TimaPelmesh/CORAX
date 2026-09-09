export type HelpTicketStatus = 'open' | 'in_progress' | 'done' | 'cancelled' | string

export function helpTicketStatusLabel(status: HelpTicketStatus): string {
  switch (status) {
    case 'open':
      return 'Ожидает'
    case 'in_progress':
      return 'В работе'
    case 'done':
      return 'Готово'
    case 'cancelled':
      return 'Отменена'
    default:
      return status || '—'
  }
}

export function helpTicketAssigneesLine(assignees: string[]): string {
  const names = assignees.map((s) => s.trim()).filter(Boolean)
  if (names.length === 0) return ''
  if (names.length > 2) return 'IT-поддержка'
  return names.join(', ')
}

export function helpTicketTakenLine(status: HelpTicketStatus, assignees: string[]): string {
  const who = helpTicketAssigneesLine(assignees)
  if (who) return `Взяли: ${who}`
  if (status === 'open') return 'Ещё не взята в работу'
  if (status === 'in_progress') return 'Взята в работу'
  return ''
}

export function helpTicketWhen(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
