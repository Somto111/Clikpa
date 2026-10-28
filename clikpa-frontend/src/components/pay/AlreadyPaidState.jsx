import { Banner } from '../ui'
import { formatUsd } from '../../utils/format'

export function AlreadyPaidState({ invoiceId, total, businessName }) {
  return (
    <Banner
      variant="success"
      title="This invoice is already paid in full"
      reassurance="No payment is needed, and no money has left your wallet from this page."
      actionLabel="View payment receipt"
      actionTo={`/receipt/${invoiceId}`}
    >
      {businessName} has already received the full {formatUsd(total)} agreed on this invoice. Do not send another transfer.
    </Banner>
  )
}
