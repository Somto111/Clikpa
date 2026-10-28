import { Banner } from '../ui'
import { formatTokenAmount, truncateMiddle } from '../../utils/format'

// Rule 8: Never claim funds returned until API confirms returnStatus === 'returned'.
export function SwapFailedReturningState({
  receivedToken,
  token,
  chainName,
  returnAddress,
  returnStatus,
  onFocusReturnAddress,
  onCheckStatus,
  checking,
}) {
  const isConfirmedReturned = returnStatus === 'returned'
  const needsAddress = !returnAddress || returnStatus === 'needs_address'

  if (isConfirmedReturned) {
    return (
      <Banner
        variant="info"
        title="Conversion could not complete — your funds have been returned"
        reassurance={`Our system confirmed that ${formatTokenAmount(receivedToken, token)} was sent back to ${truncateMiddle(returnAddress)} on ${chainName}.`}
        actionLabel="Check invoice again"
        onAction={onCheckStatus}
        actionLoading={checking}
      >
        The automatic currency conversion paused, so your full deposit was returned. You can start a fresh payment when ready.
      </Banner>
    )
  }

  if (needsAddress) {
    return (
      <Banner
        variant="error"
        title="Conversion paused — add a return address for your refund"
        reassurance={`Your ${formatTokenAmount(receivedToken, token)} deposit arrived safely and is held for return.`}
        actionLabel="Add return address below"
        onAction={onFocusReturnAddress}
      >
        We could not convert your {token} automatically. Enter a personal {chainName} address below so we can send your funds back.
      </Banner>
    )
  }

  return (
    <Banner
      variant="error"
      title="Conversion could not complete — returning your funds"
      reassurance={`Your ${formatTokenAmount(receivedToken, token)} is safe. A return transfer to ${truncateMiddle(returnAddress)} on ${chainName} is in progress (not yet confirmed).`}
      actionLabel="Check return status"
      onAction={onCheckStatus}
      actionLoading={checking}
    >
      Do not send another payment right now. We will confirm here once your wallet return finishes on-chain.
    </Banner>
  )
}
