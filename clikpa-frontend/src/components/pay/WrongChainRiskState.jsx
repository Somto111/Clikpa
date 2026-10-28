import { Banner } from '../ui'

export function WrongChainRiskState({
  chainName,
  chainBadge,
  token,
  warningText,
  walletMismatch = false,
  onSwitchOrConfirm,
}) {
  return (
    <Banner
      variant="warning"
      title={
        walletMismatch
          ? `Your wallet is not on the ${chainName} network`
          : `Check the network before sending ${token}`
      }
      reassurance="Nothing has left your wallet yet — your funds are completely safe while you check."
      actionLabel={
        walletMismatch
          ? `Switch wallet to ${chainName}`
          : `I selected ${chainName} (${chainBadge}) in my wallet`
      }
      onAction={onSwitchOrConfirm}
    >
      {warningText ||
        `Sending ${token} on a different network than ${chainName} (${chainBadge}) can permanently misroute your funds.`}
    </Banner>
  )
}
