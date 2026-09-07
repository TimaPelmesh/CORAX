import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { api, type TicketHandlerIntakeResult, type TicketHandlerPublicContext } from '../api'
import { CoraxLogo } from '../components/CoraxLogo'
import { matchTitleHints } from '../lib/titleKeywordHints'

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

function InfoChip({ label, value, waiting }: { label: string; value: string; waiting?: boolean }) {
  return (
    <span className={`help-info ${waiting ? 'is-wait' : ''}`}>
      <span className="help-info-k">{label}</span>
      <span className="help-info-v">
        {waiting ? (
          <>
            <span className="help-dots" aria-hidden>
              <i />
              <i />
              <i />
            </span>
            {value}
          </>
        ) : (
          value
        )}
      </span>
    </span>
  )
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
  const titleHints = useMemo(() => matchTitleHints(titleDraft), [titleDraft])

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

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (sending || result) return
    const form = new FormData(event.currentTarget)
    setSending(true)
    setError('')
    try {
      const out = await api.ticketHandlerIntake({
        hostname: context?.hostname || hintedHost || undefined,
        title: String(form.get('title') ?? ''),
        description: String(form.get('description') ?? ''),
        secret,
      })
      setResult(out)
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
  const showChips = detecting || Boolean(pcName || person || place)

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
            <CoraxLogo variant="bird" animated alt="" className="help-bird" />
            <CoraxLogo variant="wordmark" alt="Corax" className="help-wordmark" />
          </div>
          <h1 className="help-title">Опишите проблему</h1>
          {showChips ? (
            <div className="help-info-row" aria-live="polite">
              {pcName ? <InfoChip label="ПК" value={pcName} /> : null}
              {!pcName && detecting ? <InfoChip label="ПК" value="определяем" waiting /> : null}
              {person ? <InfoChip label="Кто" value={person} /> : null}
              {place ? <InfoChip label="Где" value={place} /> : null}
            </div>
          ) : null}
        </header>

        <div className="help-card-body">
          {blocked ? (
            <div className="help-alert" role="alert">
              {error}
            </div>
          ) : null}

          {result ? (
            <div className="help-success" role="status">
              <span className="help-success-mark" aria-hidden>
                <svg viewBox="0 0 24 24" className="h-7 w-7">
                  <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6" />
                  <path
                    d="M8.2 12.4 11 15.1l4.8-5.6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <p className="help-success-title">{ticketLabel ? `Заявка принята, ${ticketLabel}` : 'Заявка принята'}</p>
              <p className="help-success-text">Специалист уже видит её и свяжется с вами при необходимости.</p>
              {result.requester_name ? (
                <p className="help-success-meta">Обращение от {displayName(result.requester_name)}</p>
              ) : null}
              <button
                type="button"
                className="help-btn-ghost"
                onClick={() => {
                  setResult(null)
                  setTitleDraft('')
                  setError('')
                }}
              >
                Создать ещё одну
              </button>
            </div>
          ) : null}

          {!blocked && !result ? (
            <form className="help-form" onSubmit={submit}>
              {error ? (
                <div className="help-alert help-alert-soft" role="alert">
                  {error}
                </div>
              ) : null}

              <label className="help-field">
                <span className="sr-only">Кратко, что случилось</span>
                <input
                  required
                  minLength={3}
                  name="title"
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  placeholder="Например: не открывается почта"
                  autoComplete="off"
                  autoFocus
                />
              </label>

              {titleHints.length > 0 ? (
                <div className="help-hints">
                  {titleHints.map((hint) => (
                    <button key={hint} type="button" className="help-hint" onClick={() => setTitleDraft(hint)}>
                      {hint}
                    </button>
                  ))}
                </div>
              ) : null}

              <label className="help-field help-field-quiet">
                <span>
                  Подробности <em>по желанию</em>
                </span>
                <textarea
                  name="description"
                  placeholder="Что происходит, когда началось и что уже пробовали"
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
        </div>
      </section>
    </main>
  )
}
