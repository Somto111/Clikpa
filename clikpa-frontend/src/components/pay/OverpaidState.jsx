import { Banner } from '../ui'
import { formatTokenAmount, formatUsd, truncateMiddle } from '../../utils/format'

// Rule 8: Show return progress honestly; never claim funds have been returned until the API confirms `returned`.
export function OverpaidState({
  excessTokenAmount,
  token,
  merchantReceivesUsd,
  returnAddress,
  returnStatus,
  invoiceId,
  paymentId,
  onFocusReturnAddress,
  onCheckStatus,
  checking,
}) {
  const isConfirmedReturned = returnStatus === 'returned'
  const needsAddress = !returnAddress || returnStatus === 'needs_address'

  if (isConfirmedReturned) {
    return (
      <Banner
        variant="success"
        title={`Extra ${formatTokenAmount(excessTokenAmount, token)} returned`}
        reassurance={`The merchant received ${formatUsd(merchantReceivesUsd)}, and our system confirmed the return to ${truncateMiddle(returnAddress)}.`}
        actionLabel="View receipt"
        actionTo={`/receipt/${invoiceId}${paymentId ? `?paymentId=${paymentId}` : ''}`}
      >
        Your invoice payment is complete and the accidental excess has been sent back to your return address.
      </Banner>
    )
  }

  if (needsAddress) {
    return (
      <Banner
        variant="warning"
        title={`You sent ${formatTokenAmount(excessTokenAmount, token)} extra`}
        reassurance={`Your money is safe: ${formatUsd(merchantReceivesUsd)} goes to the merchant and the extra ${formatTokenAmount(excessTokenAmount, token)} is reserved for you.`}
        actionLabel="Enter return address below"
        onAction={onFocusReturnAddress}
      >
        Add a personal return address on the same network so we can send back the excess amount.
      </Banner>
    )
  }

  return (
    <Banner
      variant="info"
      title={`Returning extra ${formatTokenAmount(excessTokenAmount, token)}`}
      reassurance={`Your funds are safe. ${formatUsd(merchantReceivesUsd)} was credited to the invoice, and the excess return to ${truncateMiddle(returnAddress)} is currently in progress (not yet confirmed on-chain).`}
      actionLabel="Check return status"
      onAction={onCheckStatus}
      actionLoading={checking}
    >
      We will update this message only after the network confirms the return transfer.
    </Banner>
  )
}
