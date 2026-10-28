import { cn } from '../../utils/cn'
import { Icon } from '../Icons'

const STATUS_MAP = {
  draft: {
    label: 'Draft',
    icon: 'doc',
    classes: 'bg-white/[0.06] text-status-draft-text border border-white/15',
  },
  unpaid: {
    label: 'Unpaid',
    icon: 'clock',
    classes: 'bg-status-unpaid-bg/80 text-status-unpaid-text border border-status-unpaid-border',
  },
  pending: {
    label: 'Payment underway',
    icon: 'clock',
    // Amber rule: amber fill always carries dark ink text.
    classes: 'bg-amber text-on-amber border border-amber-300/50',
  },
  partial: {
    label: 'Partially paid',
    icon: 'half-circle',
    classes: 'bg-status-partial-bg text-status-partial-text border border-status-partial-border/70',
  },
  paid: {
    label: 'Paid',
    icon: 'check-circle',
    classes: 'bg-status-paid-bg text-status-paid-text border border-status-paid-border/70',
  },
  // Rule 3: Passing due date makes an invoice "Overdue", never "Expired".
  overdue: {
    label: 'Overdue',
    icon: 'alert',
    classes: 'bg-status-overdue-bg text-status-overdue-text border border-status-overdue-border/80',
  },
  cancelled: {
    label: 'Cancelled',
    icon: 'x-circle',
    classes: 'bg-status-cancelled-bg text-status-cancelled-text border border-white/15',
  },
  failed: {
    label: 'Failed',
    icon: 'alert',
    classes: 'bg-status-failed-bg text-status-failed-text border border-status-failed-border/80',
  },

  // Pay page granular statuses
  waiting_deposit: {
    label: 'Waiting for deposit',
    icon: 'clock',
    classes: 'bg-status-unpaid-bg/80 text-status-unpaid-text border border-status-unpaid-border',
  },
  swapping: {
    label: 'Swapping',
    icon: 'refresh',
    classes: 'bg-amber text-on-amber border border-amber-300/50',
  },
  delivered: {
    label: 'Delivered',
    icon: 'check-circle',
    classes: 'bg-status-paid-bg text-status-paid-text border border-status-paid-border/70',
  },
  underpaid: {
    label: 'Short payment',
    icon: 'alert',
    classes: 'bg-status-partial-bg text-status-partial-text border border-status-partial-border/70',
  },
  overpaid: {
    label: 'Overpaid',
    icon: 'alert',
    classes: 'bg-status-pending-soft text-amber border border-status-pending-border/60',
  },
  swap_failed: {
    label: 'Returning funds',
    icon: 'alert',
    classes: 'bg-status-failed-bg text-status-failed-text border border-status-failed-border/80',
  },
  quote_ended: {
    label: 'New quote needed',
    icon: 'refresh',
    classes: 'bg-status-unpaid-bg/80 text-status-unpaid-text border border-status-unpaid-border',
  },

  // Rule 9: Exact API-reported withdrawal statuses
  'Awaiting approval': {
    label: 'Awaiting approval',
    icon: 'clock',
    classes: 'bg-status-partial-bg text-status-partial-text border border-status-partial-border/70',
  },
  'Sending payment': {
    label: 'Sending payment',
    icon: 'refresh',
    classes: 'bg-amber text-on-amber border border-amber-300/50',
  },
  'Bank payout processing': {
    label: 'Bank payout processing',
    icon: 'bank',
    classes: 'bg-amber text-on-amber border border-amber-300/50',
  },
  'Paid to your bank': {
    label: 'Paid to your bank',
    icon: 'check-circle',
    classes: 'bg-status-paid-bg text-status-paid-text border border-status-paid-border/70',
  },
  Failed: {
    label: 'Failed',
    icon: 'alert',
    classes: 'bg-status-failed-bg text-status-failed-text border border-status-failed-border/80',
  },
}

export function StatusPill({ status, customLabel, className }) {
  const config = STATUS_MAP[status] || STATUS_MAP.unpaid

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-base font-semibold leading-tight whitespace-nowrap',
        'print:border print:border-black print:bg-white print:text-black print:shadow-none',
        config.classes,
        className,
      )}
    >
      <Icon name={config.icon} className="h-4 w-4 shrink-0" />
      <span>{customLabel || config.label}</span>
    </span>
  )
}
