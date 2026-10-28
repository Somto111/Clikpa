import { cn } from '../../utils/cn'
import { Icon } from '../Icons'

const STATUS_MAP = {
  draft: {
    label: 'Draft',
    icon: 'doc',
    classes: 'bg-status-draft-bg text-status-draft-text border border-status-draft-border',
  },
  unpaid: {
    label: 'Unpaid',
    icon: 'clock',
    classes: 'bg-status-unpaid-bg text-status-unpaid-text border border-status-unpaid-border',
  },
  pending: {
    label: 'Payment underway',
    icon: 'clock',
    classes: 'bg-status-pending-bg text-status-pending-text border border-status-pending-border',
  },
  partial: {
    label: 'Partially paid',
    icon: 'half-circle',
    classes: 'bg-status-partial-bg text-status-partial-text border-2 border-status-partial-border',
  },
  paid: {
    label: 'Paid',
    icon: 'check-circle',
    classes: 'bg-status-paid-bg text-status-paid-text border border-status-paid-border',
  },
  // Rule 3: Passing due date makes an invoice "Overdue", never "Expired".
  overdue: {
    label: 'Overdue',
    icon: 'alert',
    classes: 'bg-status-overdue-bg text-status-overdue-text border-2 border-status-overdue-border',
  },
  cancelled: {
    label: 'Cancelled',
    icon: 'x-circle',
    classes: 'bg-status-cancelled-bg text-status-cancelled-text border border-status-cancelled-border',
  },
  failed: {
    label: 'Failed',
    icon: 'alert',
    classes: 'bg-status-failed-bg text-status-failed-text border border-status-failed-border',
  },

  // Pay page granular statuses
  waiting_deposit: {
    label: 'Waiting for deposit',
    icon: 'clock',
    classes: 'bg-status-unpaid-bg text-status-unpaid-text border border-status-unpaid-border',
  },
  swapping: {
    label: 'Swapping',
    icon: 'refresh',
    classes: 'bg-status-pending-bg text-status-pending-text border border-status-pending-border',
  },
  delivered: {
    label: 'Delivered',
    icon: 'check-circle',
    classes: 'bg-status-paid-bg text-status-paid-text border border-status-paid-border',
  },
  underpaid: {
    label: 'Short payment',
    icon: 'alert',
    classes: 'bg-status-partial-bg text-status-partial-text border-2 border-status-partial-border',
  },
  overpaid: {
    label: 'Overpaid',
    icon: 'alert',
    classes: 'bg-status-pending-soft text-ink border-2 border-status-pending-border',
  },
  swap_failed: {
    label: 'Returning funds',
    icon: 'alert',
    classes: 'bg-status-failed-bg text-status-failed-text border border-status-failed-border',
  },
  quote_ended: {
    label: 'New quote needed',
    icon: 'refresh',
    classes: 'bg-status-unpaid-bg text-status-unpaid-text border border-status-unpaid-border',
  },

  // Rule 9: Exact API-reported withdrawal statuses
  'Awaiting approval': {
    label: 'Awaiting approval',
    icon: 'clock',
    classes: 'bg-status-partial-bg text-status-partial-text border-2 border-status-partial-border',
  },
  'Sending payment': {
    label: 'Sending payment',
    icon: 'refresh',
    classes: 'bg-status-pending-bg text-status-pending-text border border-status-pending-border',
  },
  'Bank payout processing': {
    label: 'Bank payout processing',
    icon: 'bank',
    classes: 'bg-status-pending-bg text-status-pending-text border border-status-pending-border',
  },
  'Paid to your bank': {
    label: 'Paid to your bank',
    icon: 'check-circle',
    classes: 'bg-status-paid-bg text-status-paid-text border border-status-paid-border',
  },
  Failed: {
    label: 'Failed',
    icon: 'alert',
    classes: 'bg-status-failed-bg text-status-failed-text border border-status-failed-border',
  },
}

export function StatusPill({ status, customLabel, className }) {
  const config = STATUS_MAP[status] || STATUS_MAP.unpaid

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-base font-semibold leading-tight whitespace-nowrap',
        'print:border-black print:bg-white print:text-black',
        config.classes,
        className,
      )}
    >
      <Icon name={config.icon} className="h-4 w-4 shrink-0" />
      <span>{customLabel || config.label}</span>
    </span>
  )
}
