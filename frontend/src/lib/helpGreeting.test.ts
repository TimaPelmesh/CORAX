import { describe, expect, it } from 'vitest'
import { dayPartGreeting, helpGreeting } from './helpGreeting'

describe('dayPartGreeting', () => {
  it('maps office hours', () => {
    expect(dayPartGreeting(new Date(2026, 0, 1, 8))).toBe('Доброго утра')
    expect(dayPartGreeting(new Date(2026, 0, 1, 14))).toBe('Доброго дня')
    expect(dayPartGreeting(new Date(2026, 0, 1, 19))).toBe('Доброго вечера')
    expect(dayPartGreeting(new Date(2026, 0, 1, 1))).toBe('Доброй ночи')
  })
})

describe('helpGreeting', () => {
  it('appends the AD display name', () => {
    expect(helpGreeting('Иван Иванов', new Date(2026, 0, 1, 14))).toBe('Доброго дня, Иван Иванов')
  })

  it('works without a name', () => {
    expect(helpGreeting('  ', new Date(2026, 0, 1, 9))).toBe('Доброго утра')
  })
})
