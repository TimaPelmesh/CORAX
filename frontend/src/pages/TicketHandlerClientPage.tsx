import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { api, type TicketHandlerIntakeResult, type TicketHandlerPublicContext, type TicketHandlerPublicTicket } from '../api'
import { CoraxLogo } from '../components/CoraxLogo'
import { helpGreeting } from '../lib/helpGreeting'
import { helpTicketStatusLabel, helpTicketTakenLine, helpTicketWhen } from '../lib/helpTickets'

function hashParams() {
  return new URLSearchParams(window.location.hash.replace(/^#/, ''))
}

function friendlyError(raw: string): string {
  const s = (raw || '').toLowerCase()
  if (s.includes('выключен') || s.includes('disabled') || s.includes('404')) {
    return 'Сервис помощи сейчас выключен. Напишите в IT или попробуйте чуть позже.'
  }
  if (s.includes('локальной сети') || s.includes('секрет') || s.includes('403')) {
    return 'Форму нужно открыть с рабочего компьютера в офисной сети.'
  }
  if (s.includes('failed to fetch') || s.includes('network') || s.includes('нет связи')) {
    return 'Не удалось связаться с сервером. Проверьте сеть и попробуйте снова.'
  }
  return raw || 'Что-то пошло не так. Попробуйте ещё раз.'
}

function displayName(hint: string) {
  const trimmed = hint.trim()
  const m = trimmed.match(/^(.*)\s*\(([^)]+)\)\s*$/)
  return (m ? m[1] : trimmed).trim()
}

function shortPcName(name: string) {
  const raw = name.trim().replace(/\$+$/, '')
  if (!raw) return ''
  return raw.split('.')[0]
}

function ticketNo(row: TicketHandlerPublicTicket) {
  return row.ticket_no != null ? `№${row.ticket_no}` : `№${row.id}`
}

export function TicketHandlerClientPage() {
  const params = useMemo(() => hashParams(), [])
  const hintedHost = params.get('pc')?.trim() ?? ''
  const secret = params.get('secret')?.trim() || params.get('k')?.trim() || undefined

  const [context, setContext] = useState<TicketHandlerPublicContext | null>(null)
  const [error, setError] = useState('')
  const [result, setResult] = useState<TicketHandlerIntakeResult | null>(null)
  const [sending, setSending] = useState(false)
  const [titleDraft, setTitleDraft] = useState('')
  const [detecting, setDetecting] = useState(true)
  const [tickets, setTickets] = useState<TicketHandlerPublicTicket[]>([])

  const hostForApi = context?.hostname || hintedHost || undefined

  const loadTickets = useCallback(() => {
    return api
      .ticketHandlerPublicTickets(hostForApi, secret)
      .then((out) => setTickets(Array.isArray(out.items) ? out.items : []))
      .catch(() => {
        /* keep last known list — form still works */
      })
  }, [hostForApi, secret])

  useEffect(() => {
    let cancelled = false
    setDetecting(true)
    api
      .ticketHandlerPublicContext(hintedHost || undefined, secret)
      .then((ctx) => {
        if (!cancelled) {
          setContext(ctx)
          setError('')
        }
      })
      .catch((e) => {
        if (!cancelled) setError(friendlyError(e instanceof Error ? e.message : String(e)))
      })
      .finally(() => {
        if (!cancelled) setDetecting(false)
      })
    return () => {
      cancelled = true
    }
  }, [hintedHost, secret])

  useEffect(() => {
    if (!context) return
    void loadTickets()
    const timer = window.setInterval(() => {
      void loadTickets()
    }, 15000)
    return () => window.clearInterval(timer)
  }, [context, loadTickets])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (sending) return
    const form = event.currentTarget
    const data = new FormData(form)
    setSending(true)
    setError('')
    try {
      const out = await api.ticketHandlerIntake({
        hostname: context?.hostname || hintedHost || undefined,
        title: String(data.get('title') ?? ''),
        description: String(data.get('description') ?? ''),
        secret,
      })
      setResult(out)
      setTitleDraft('')
      form.reset()
      await loadTickets()
    } catch (e) {
      setError(friendlyError(e instanceof Error ? e.message : String(e)))
    } finally {
      setSending(false)
    }
  }

  const ticketLabel =
    result?.ticket_no != null
      ? `№${result.ticket_no}`
      : result?.request_id != null
        ? `№${result.request_id}`
        : null

  const person = context?.requester_hint ? displayName(context.requester_hint) : ''
  const pcName = shortPcName(context?.hostname || hintedHost)
  const place = (context?.location || '').trim()
  const blocked = Boolean(error && !context)
  const hello = helpGreeting(person)
  const highlightId = result?.request_id ?? null

  return (
    <main className="help-page">
      <div className="help-scene" aria-hidden>
        <span className="help-mesh" />
        <span className="help-glow help-glow-a" />
        <span className="help-glow help-glow-b" />
      </div>
      <section className="help-card">
        <header className="help-card-head">
          <div className="help-brand">
            <CoraxLogo variant="wordmark" alt="Corax" className="help-wordmark" />
          </div>
          <p className="help-hello">{hello}</p>
          <h1 className="help-title">Чем помочь?</h1>
          <p className="help-lead">Опишите проблему своими словами. Заявку сразу возьмут в работу — статус можно смотреть ниже.</p>
          {detecting && !pcName ? (
            <p className="help-device is-wait">Уточняем, с какого компьютера заявка…</p>
          ) : null}
          {pcName ? (
            <p className="help-device">
              Заявка уйдёт с компьютера <strong>{pcName}</strong>
              {place ? <span> · {place}</span> : null}
            </p>
          ) : null}
        </header>

        <div className="help-card-body">
          {blocked ? (
            <div className="help-alert" role="alert">
              {error}
            </div>
          ) : null}

          {result && !blocked ? (
            <div className="help-success help-success-banner" role="status">
              <p className="help-success-title">{ticketLabel ? `Заявка принята, ${ticketLabel}` : 'Заявка принята'}</p>
              <p className="help-success-text">Она уже в работе. Ниже можно следить, кто её ведёт.</p>
            </div>
          ) : null}

          {!blocked ? (
            <form className="help-form" onSubmit={submit}>
              {error && context ? (
                <div className="help-alert help-alert-soft" role="alert">
                  {error}
                </div>
              ) : null}

              <label className="help-field">
                <span>Что случилось</span>
                <input
                  required
                  minLength={3}
                  name="title"
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  placeholder="Например: поменять картридж в принтере"
                  autoComplete="off"
                  autoFocus
                />
              </label>

              <label className="help-field help-field-quiet">
                <span>
                  Подробности <em>по желанию</em>
                </span>
                <textarea
                  name="description"
                  placeholder="Когда началось, что уже пробовали, номер кабинета"
                  rows={4}
                />
              </label>

              <button type="submit" className="help-submit" disabled={sending}>
                {sending ? (
                  <>
                    <span className="help-spinner" aria-hidden />
                    Отправляем…
                  </>
                ) : (
                  'Отправить заявку'
                )}
              </button>
            </form>
          ) : null}

          {!blocked ? (
            <section className="help-tickets" aria-live="polite">
              <h2 className="help-tickets-title">Ваши заявки</h2>
              {tickets.length === 0 ? (
                <p className="help-tickets-empty">Пока нет заявок с этого компьютера. После отправки они появятся здесь.</p>
              ) : (
                <ul className="help-ticket-list">
                  {tickets.map((row) => {
                    const taken = helpTicketTakenLine(row.status, row.assignees)
                    const when = helpTicketWhen(row.closed_at || row.updated_at || row.opened_at)
                    const active = highlightId != null && row.id === highlightId
                    return (
                      <li
                        key={row.id}
                        className={`help-ticket${active ? ' is-new' : ''}${row.status === 'done' || row.status === 'cancelled' ? ' is-done' : ''}`}
                      >
                        <div className="help-ticket-top">
                          <span className="help-ticket-no">{ticketNo(row)}</span>
                          <span className={`help-ticket-status is-${row.status}`}>{helpTicketStatusLabel(row.status)}</span>
                        </div>
                        <p className="help-ticket-title">{row.title}</p>
                        <p className="help-ticket-meta">
                          {taken ? <span>{taken}</span> : null}
                          {taken && when ? <span aria-hidden> · </span> : null}
                          {when ? <span>{when}</span> : null}
                        </p>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
          ) : null}
        </div>
      </section>
    </main>
  )
}
