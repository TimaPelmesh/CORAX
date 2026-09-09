import { describe, expect, it } from 'vitest'
import { helpTicketAssigneesLine, helpTicketStatusLabel, helpTicketTakenLine } from './helpTickets'

describe('helpTickets', () => {
  it('labels statuses in Russian', () => {
    expect(helpTicketStatusLabel('open')).toBe('Ожидает')
    expect(helpTicketStatusLabel('in_progress')).toBe('В работе')
    expect(helpTicketStatusLabel('done')).toBe('Готово')
    expect(helpTicketStatusLabel('cancelled')).toBe('Отменена')
  })

  it('summarizes who took the ticket', () => {
    expect(helpTicketTakenLine('open', [])).toBe('Ещё не взята в работу')
    expect(helpTicketTakenLine('in_progress', ['Иван Петров'])).toBe('Взяли: Иван Петров')
    expect(helpTicketAssigneesLine(['Анна', 'Борис', 'Виктор'])).toBe('IT-поддержка')
  })
})
