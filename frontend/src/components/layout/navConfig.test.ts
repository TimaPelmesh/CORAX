import { describe, expect, it } from 'vitest'
import { buildNavSections, prefsNavItems } from './navConfig'

describe('buildNavSections', () => {
  it('hides the inventory heading and puts Settings last as a flyout', () => {
    const sections = buildNavSections({ is_superuser: true, role: 'admin' })
    const inventory = sections.find((s) => s.titleKey === 'nav.inventory')
    const settings = sections[sections.length - 1]
    expect(inventory?.hideTitle).toBe(true)
    expect(settings?.titleKey).toBe('nav.settings')
    expect(settings?.flyout).toBe(true)
    expect(settings?.items[0]?.to).toBe('/settings/llm')
    expect(settings?.items.at(-1)?.to).toBe('/settings/https')
  })

  it('keeps knowledge-base tabs that the Guide documents', () => {
    const sections = buildNavSections({ is_superuser: true })
    const kb = sections.find((s) => s.titleKey === 'nav.knowledge')
    const paths = (kb?.items ?? []).map((i) => i.to)
    expect(paths).toEqual([
      '/knowledge-base/sitemap',
      '/knowledge-base/guide',
      '/knowledge-base/wikirag',
      '/knowledge-base/notes',
      '/knowledge-base/zabbix',
    ])
  })
})

describe('prefsNavItems', () => {
  it('includes guide and zabbix data for every role', () => {
    const paths = prefsNavItems({ role: 'observer' }).map((i) => i.path)
    expect(paths).toContain('/knowledge-base/guide')
    expect(paths).toContain('/knowledge-base/zabbix')
    expect(paths).not.toContain('/users')
  })
})
