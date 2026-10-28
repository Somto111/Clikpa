import { Banner } from '../ui'
import { formatDate, formatUsd } from '../../utils/format'

// Rule 3: Passing the due date makes an invoice "Overdue" (never "expired"); amount stays fixed.
export function InvoiceOverdueState({ dueDate, remainingAmount, onScrollToPay }) {
  return (
    <Banner
      variant="error"
      title={`This invoice is overdue (was due ${formatDate(dueDate)})`}
      reassurance={`The invoice balance stays fixed at ${formatUsd(remainingAmount)} and any payment you make goes securely to the merchant.`}
      actionLabel="Go to payment options"
      onAction={onScrollToPay}
    >
      You can still settle this overdue invoice using the payment details below.
    </Banner>
  )
}
