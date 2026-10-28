import { Banner } from '../ui'

// Rule 3: Never call an invoice "expired" when a payment quote ends.
export function QuoteEndedState({ onRefresh, loading }) {
  return (
    <Banner
      variant="warning"
      title="Payment quote ended"
      reassurance="Your invoice amount has not changed, and if you have not sent funds yet your money is safe in your wallet."
      actionLabel="Get new payment details"
      onAction={onRefresh}
      actionLoading={loading}
    >
      Exchange rates for payment quotes refresh every 15 minutes. Request fresh payment details before sending.
    </Banner>
  )
}
