import { memo, useEffect, useLayoutEffect, useRef, useState, type ComponentType, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { NavLink } from 'react-router-dom'
import { formatNavBadge } from '../../lib/navBadge'
import type { NavBadgeKey, NavCounts, NavItemDef, NavSectionDef } from './navTypes'

// Badge пересчитывается на каждый рендер Layout (навигация, любое setState),
// а меняется только когда меняется счётчик. memo ловит совпадающий value:number
// без дополнительной работы для React reconciler.
export const NavCountBadge = memo(function NavCountBadge({ value }: { value: number | undefined }) {
  if (value == null || value <= 0) return null
  return (
    <span className="ml-auto shrink-0 rounded-md bg-[var(--color-surface-muted)] px-1.5 py-px text-[10px] font-medium tabular-nums leading-[14px] text-[var(--color-fg-subtle)]">
      {formatNavBadge(value)}
    </span>
  )
})

export function SidebarNavLink({
  to,
  end,
  icon: Icon,
  children,
  badge,
  onNavigate,
}: {
  to: string
  end?: boolean
  icon: ComponentType<{ className?: string }>
  children: ReactNode
  badge?: number
  onNavigate?: () => void
}) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
    >
      <span className="sidebar-link-icon" aria-hidden>
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1 truncate">{children}</span>
      <NavCountBadge value={badge} />
    </NavLink>
  )
}

export function NavBlock({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div>
      {title ? <div className="sidebar-section-label">{title}</div> : null}
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  )
}

export function SidebarGroupButton({
  label,
  icon: Icon,
  open,
  badge,
  onToggle,
  to,
  chevronMode = 'down',
}: {
  label: string
  icon: ComponentType<{ className?: string }>
  open: boolean
  badge?: number
  onToggle: () => void
  to?: string
  /** 'down' rotates the caret up when open; 'side' points it right (open ⇒ down). */
  chevronMode?: 'down' | 'side'
}) {
  const body = (
    <span className="flex min-w-0 flex-1 items-center gap-[0.55rem]">
      <span className="sidebar-group-icon" aria-hidden>
        <Icon className="h-4 w-4" />
      </span>
      <span className="truncate">{label}</span>
      <NavCountBadge value={badge} />
    </span>
  )
  const chevron = (
    <span
      className={`sidebar-group-chevron ${chevronMode === 'down' && open ? 'sidebar-group-chevron-open' : ''}`}
      style={chevronMode === 'side' ? { transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' } : undefined}
      aria-hidden
    >
      <svg viewBox="0 0 20 20" fill="none" className="h-3 w-3">
        <path
          d="M5.5 7.5L10 12l4.5-4.5"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )

  if (!to) {
    return (
      <button type="button" onClick={onToggle} className="sidebar-group" aria-expanded={open}>
        {body}
        {chevron}
      </button>
    )
  }

  return (
    <div className="sidebar-group">
      <NavLink to={to} className="flex min-w-0 flex-1 items-center no-underline text-inherit">
        {body}
      </NavLink>
      <button type="button" onClick={onToggle} className="flex h-7 w-7 shrink-0 items-center justify-center" aria-expanded={open} aria-label={label}>
        {chevron}
      </button>
    </div>
  )
}

type FlyoutPos = { top: number; left: number; maxHeight: number; dock: boolean }

export function SidebarFlyoutGroup({
  label,
  icon: Icon,
  open,
  badge,
  items,
  navCounts,
  onToggle,
  onClose,
  onNavigate,
  t,
}: {
  label: string
  icon: ComponentType<{ className?: string }>
  open: boolean
  badge?: number
  items: NavItemDef[]
  navCounts: NavCounts | null
  onToggle: () => void
  onClose: () => void
  onNavigate: () => void
  t: (key: NavItemDef['labelKey']) => string
}) {
  const anchorRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<FlyoutPos | null>(null)

  useLayoutEffect(() => {
    if (!open) {
      setPos(null)
      return
    }
    const update = () => {
      const el = anchorRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const dock = window.matchMedia('(min-width: 1024px)').matches
      if (dock) {
        const sidebar = document.getElementById('app-sidebar')
        const sr = sidebar?.getBoundingClientRect()
        setPos({
          top: 0,
          left: Math.round(sr?.right ?? r.right),
          maxHeight: window.innerHeight,
          dock: true,
        })
        return
      }
      const gap = 8
      const margin = 8
      const panelWidth = 248
      const desiredMax = 460
      let left = r.right + gap
      if (left + panelWidth > window.innerWidth - margin) {
        left = Math.max(margin, r.left - gap - panelWidth)
      }
      let top = r.top
      const spaceBelow = window.innerHeight - margin - top
      if (spaceBelow < desiredMax) {
        top = Math.max(margin, window.innerHeight - margin - Math.min(desiredMax, window.innerHeight - margin * 2))
      }
      setPos({ top, left, maxHeight: window.innerHeight - margin - top, dock: false })
    }
    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (anchorRef.current?.contains(e.target as Node)) return
      if (panelRef.current?.contains(e.target as Node)) return
      onClose()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  const links = (
    <div className={`flex flex-col ${pos?.dock ? 'gap-1' : 'gap-0.5'}`}>
      {items.map((item) => (
        <SidebarNavLink
          key={item.to}
          to={item.to}
          end={item.end}
          icon={item.icon}
          badge={item.badgeKey ? navCounts?.[item.badgeKey] : undefined}
          onNavigate={() => {
            onNavigate()
            onClose()
          }}
        >
          {t(item.labelKey)}
        </SidebarNavLink>
      ))}
    </div>
  )

  return (
    <div ref={anchorRef}>
      <SidebarGroupButton
        label={label}
        icon={Icon}
        open={open}
        badge={badge}
        onToggle={onToggle}
        chevronMode="side"
      />
      {open && pos
        ? createPortal(
            <div
              ref={panelRef}
              className={
                pos.dock
                  ? 'sidebar-flyout-dock fixed z-[80] flex h-dvh w-[16rem] flex-col overflow-hidden border-y-0 border-l-0 border-r border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-4'
                  : 'sidebar-scroll fixed z-[80] w-[15.5rem] overflow-y-auto overscroll-contain rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-xl shadow-black/10'
              }
              style={
                pos.dock
                  ? { top: 0, left: pos.left }
                  : { top: pos.top, left: pos.left, maxHeight: pos.maxHeight }
              }
              role="menu"
            >
              <div className="sidebar-section-label">{label}</div>
              {links}
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}

export function SidebarSectionList({
  sections,
  navCounts,
  openGroups,
  onToggleGroup,
  onNavigate,
  t,
}: {
  sections: NavSectionDef[]
  navCounts: NavCounts | null
  openGroups: Record<string, boolean>
  onToggleGroup: (titleKey: string, currentlyOpen: boolean) => void
  onNavigate: () => void
  t: (key: NavSectionDef['titleKey'] | NavItemDef['labelKey']) => string
}) {
  return (
    <>
      {sections.map((section) => {
        const sectionTitle = t(section.titleKey)
        const open = section.collapsible === false || openGroups[section.titleKey] !== false
        const sectionBadge = section.badgeKey ? navCounts?.[section.badgeKey as NavBadgeKey] : undefined
        if (section.flyout) {
          const flyoutOpen = openGroups[section.titleKey] === true
          return (
            <div key={section.titleKey} className="mt-auto border-t border-[var(--color-border)] pt-2">
              <SidebarFlyoutGroup
                label={sectionTitle}
                icon={section.icon}
                open={flyoutOpen}
                badge={sectionBadge}
                items={section.items}
                navCounts={navCounts}
                onToggle={() => onToggleGroup(section.titleKey, flyoutOpen)}
                onClose={() => onToggleGroup(section.titleKey, true)}
                onNavigate={onNavigate}
                t={t}
              />
            </div>
          )
        }
        return (
          <div key={section.titleKey}>
            {section.collapsible === false ? (
              <NavBlock title={section.hideTitle ? undefined : sectionTitle}>
                {section.items.map((item) => (
                  <SidebarNavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    icon={item.icon}
                    badge={item.badgeKey ? navCounts?.[item.badgeKey] : undefined}
                    onNavigate={onNavigate}
                  >
                    {t(item.labelKey)}
                  </SidebarNavLink>
                ))}
              </NavBlock>
            ) : (
              <>
                <SidebarGroupButton
                  label={sectionTitle}
                  icon={section.icon}
                  open={open}
                  badge={sectionBadge}
                  to={section.hubTo}
                  onToggle={() => onToggleGroup(section.titleKey, open)}
                />
                <div
                  className={`ml-2 grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
                    open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                  aria-hidden={!open}
                >
                  <div className="overflow-hidden">
                    <div className="border-l border-[var(--color-border)] pl-1.5">
                      <div className="flex flex-col gap-0.5 py-0.5">
                        {section.items.map((item) => (
                          <SidebarNavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            icon={item.icon}
                            badge={item.badgeKey ? navCounts?.[item.badgeKey] : undefined}
                            onNavigate={onNavigate}
                          >
                            {t(item.labelKey)}
                          </SidebarNavLink>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )
      })}
    </>
  )
}
