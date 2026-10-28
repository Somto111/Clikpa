import { Banner } from '../ui'

export function SlowNetworkState({ chainName, onCheckStatus, checking }) {
  return (
    <Banner
      variant="warning"
      title={`${chainName} network is taking longer than usual`}
      reassurance="If you already sent payment, your money is safe in transit — do not send a second transfer."
      actionLabel="Check status now"
      onAction={onCheckStatus}
      actionLoading={checking}
    >
      Heavy traffic on {chainName} is delaying block confirmations. Keep this link or come back anytime; your payment progress is saved automatically.
    </Banner>
  )
}
