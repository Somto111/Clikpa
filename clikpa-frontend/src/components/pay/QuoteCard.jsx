import { useEffect, useRef, useState } from 'react'
import { formatTokenAmount, formatUsd } from '../../utils/format'
import { useProgressRingAnimation } from '../../utils/motion'
import { Icon } from '../Icons'
import { Button, Card } from '../ui'

const RING_RADIUS = 18
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

function formatCountdown(secondsLeft) {
  const safe = Math.max(0, Math.floor(secondsLeft))
  const mins = Math.floor(safe / 60)
  const secs = safe % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

function computeRemainingSeconds(expiresAt) {
  if (!expiresAt) return 0
  return Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
}

// Rule 2 & Rule 3: Customer pays charges; merchant gets full agreed amount. Only quote has a countdown.
export function QuoteCard({
  payment,
  businessName,
  onRefreshQuote,
  onQuoteEnded,
  refreshing,
}) {
  const progressCircleRef = useRef(null)
  const endedCallbackRef = useRef(onQuoteEnded)
  const totalSec = payment?.quoteDurationSec || 900
  const expiresAt = payment?.quoteExpiresAt

  useEffect(() => {
    endedCallbackRef.current = onQuoteEnded
  }, [onQuoteEnded])

  const [nowTick, setNowTick] = useState(() => Date.now())

  useEffect(() => {
    if (!expiresAt) return undefined
    const id = setInterval(() => {
      const now = Date.now()
      setNowTick(now)
      if (new Date(expiresAt).getTime() <= now) {
        clearInterval(id)
        endedCallbackRef.current?.()
      }
    }, 1000)
    return () => clearInterval(id)
  }, [expiresAt])

  const secondsLeft = expiresAt
    ? Math.max(0, Math.floor((new Date(expiresAt).getTime() - nowTick) / 1000))
    : computeRemainingSeconds(expiresAt)

  const ratio = totalSec > 0 ? secondsLeft / totalSec : 0
  useProgressRingAnimation(progressCircleRef, ratio, RING_CIRCUMFERENCE)

  return (
    <Card className="space-y-4 rounded-3xl border-brand-200 bg-brand-50/40">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-medium text-ink-muted">Total to send</p>
          {/* Largest text on the Pay page: exact amount to send */}
          <p className="mt-0.5 font-heading text-3xl sm:text-4xl font-bold tracking-tight text-ink">
            {formatTokenAmount(payment.totalToSendToken, payment.token)}
          </p>
          {payment.token !== 'USDC' && payment.token !== 'USDT' && (
            <p className="text-base text-ink-muted">
              Approx. {formatUsd(payment.totalToSendUsd)}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-2 rounded-xl bg-surface-subtle px-2.5 py-1.5"
            aria-label={`Quote valid for ${formatCountdown(secondsLeft)}`}
          >
            <svg viewBox="0 0 44 44" className="h-9 w-9 -rotate-90" aria-hidden="true">
              <circle
                cx="22"
                cy="22"
                r={RING_RADIUS}
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className="text-border-muted"
              />
              <circle
                ref={progressCircleRef}
                cx="22"
                cy="22"
                r={RING_RADIUS}
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={0}
                className={secondsLeft <= 60 ? 'text-status-failed-border' : 'text-link'}
              />
            </svg>
            <span className="font-mono text-base font-semibold text-ink">
              {formatCountdown(secondsLeft)}
            </span>
          </div>

          <Button
            variant="secondary"
            size="icon"
            onClick={onRefreshQuote}
            loading={refreshing}
            aria-label="Refresh payment quote"
            title="Refresh quote"
          >
            {!refreshing && <Icon name="refresh" className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Rule 2: Explicit breakdown before payment: invoice payment + charges = total to send */}
      <div className="rounded-xl bg-surface-muted p-3.5 space-y-2 border border-border-muted">
        <div className="flex items-center justify-between gap-2 text-base">
          <span className="text-ink-muted">Invoice payment ({businessName} receives)</span>
          <span className="font-semibold text-ink">{formatUsd(payment.merchantReceivesUsd)}</span>
        </div>
        <div className="flex items-center justify-between gap-2 text-base">
          <span className="text-ink-muted">Processing &amp; conversion charges</span>
          <span className="font-medium text-ink">+ {formatUsd(payment.feeUsd)}</span>
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-border-muted pt-2 text-base font-semibold text-ink">
          <span>Total to send</span>
          <span>
            {formatTokenAmount(payment.totalToSendToken, payment.token)}{' '}
            <span className="font-normal text-ink-muted">({formatUsd(payment.totalToSendUsd)})</span>
          </span>
        </div>
      </div>

      <p className="text-base text-ink-muted">
        {businessName} receives the full <strong className="font-semibold text-ink">{formatUsd(payment.merchantReceivesUsd)}</strong>. Your own wallet or exchange may add a separate network or withdrawal charge.
      </p>
    </Card>
  )
}
