import { Banner } from '../ui'
import { formatTokenAmount } from '../../utils/format'

export function UnderpaidState({ receivedToken, totalToSendToken, shortfallTokenAmount, token, chainName, onCheckStatus, checking }) {
  return (
    <Banner
      variant="warning"
      title={`Short payment received (${formatTokenAmount(receivedToken, token)} of ${formatTokenAmount(totalToSendToken, token)})`}
      reassurance="The amount you already sent is safely held and has not been lost."
      actionLabel="I sent the remaining amount, check status"
      onAction={onCheckStatus}
      actionLoading={checking}
    >
      Send the remaining{' '}
      <strong className="font-semibold">{formatTokenAmount(shortfallTokenAmount, token)}</strong> on the{' '}
      <strong className="font-semibold">{chainName}</strong> network to the same deposit address below to complete this payment.
    </Banner>
  )
}
