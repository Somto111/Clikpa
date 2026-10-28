import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../../utils/cn'
import { useLiveDotPulse } from '../../utils/motion'
import { Icon } from '../Icons'
import { Button } from '../ui'

const STEPS = [
  { id: 'waiting_deposit', label: 'Waiting for deposit' },
  { id: 'swapping', label: 'Swapping' },
  { id: 'delivered', label: 'Delivered' },
]

function resolveActiveStepIndex(status) {
  if (status === 'delivered' || status === 'overpaid') return 2
  if (status === 'swapping') return 1
  return 0
}

// Rule 6: Never mark anything Paid on the client. Checking status only queries the API.
export function LiveStatusTracker({ payment, invoiceId, onCheckStatus, checking }) {
  const pulseDotRef = useRef(null)
  const activeIdx = resolveActiveStepIndex(payment?.status)
  const isComplete = payment?.status === 'delivered'
  const isPulsing = !isComplete && payment?.status !== 'swap_failed' && payment?.status !== 'quote_ended'

  useLiveDotPulse(pulseDotRef, isPulsing)

  return (
    <div className="sticky bottom-3 z-20 rounded-2xl border border-border-strong bg-surface/95 p-4 shadow-lg backdrop-blur-xs">
      <div className="space-y-3">
        {/* Stepper: Waiting for deposit -> Swapping -> Delivered */}
        <ol aria-label="Live payment progress" className="grid grid-cols-3 gap-2">
          {STEPS.map((step, idx) => {
            const done = idx < activeIdx || isComplete
            const current = idx === activeIdx && !isComplete
            return (
              <li key={step.id} className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  {done ? (
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-status-paid-bg text-status-paid-text border border-status-paid-border">
                      <Icon name="check-circle" className="h-4 w-4" />
                    </span>
                  ) : current ? (
                    <span className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber/25 border border-amber">
                      <span
                        ref={pulseDotRef}
                        className="h-2.5 w-2.5 rounded-full bg-amber"
                        aria-hidden="true"
                      />
                    </span>
                  ) : (
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-subtle border border-border-strong text-xs font-semibold text-ink-muted">
                      {idx + 1}
                    </span>
                  )}

                  {idx < STEPS.length - 1 && (
                    <span
                      aria-hidden="true"
                      className={cn(
                        'h-0.5 flex-1 rounded-full',
                        idx < activeIdx || isComplete ? 'bg-status-paid-border' : 'bg-border-muted',
                      )}
                    />
                  )}
                </div>

                <span
                  className={cn(
                    'text-xs sm:text-sm font-medium leading-tight',
                    current || done ? 'text-ink font-semibold' : 'text-ink-muted',
                  )}
                >
                  {step.label}
                </span>
              </li>
            )
          })}
        </ol>

        {isComplete ? (
          <Button
            as={Link}
            to={`/receipt/${invoiceId}?paymentId=${payment.id}`}
            variant="primary"
            size="lg"
            fullWidth
          >
            <Icon name="doc" className="h-5 w-5" />
            <span>View payment receipt</span>
          </Button>
        ) : (
          <Button
            variant={payment?.method === 'qr' ? 'primary' : 'secondary'}
            size="lg"
            fullWidth
            onClick={onCheckStatus}
            loading={checking}
          >
            I&apos;ve already sent payment, check status
          </Button>
        )}
      </div>
    </div>
  )
}
