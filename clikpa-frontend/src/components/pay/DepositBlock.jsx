import { useRef, useState } from 'react'
import { formatTokenAmount, truncateMiddle } from '../../utils/format'
import { popElement } from '../../utils/motion'
import { Icon } from '../Icons'
import { Button, Card, QrCodeBox } from '../ui'

export function DepositBlock({
  payment,
  method,
  connectedWallet,
  onConnectWallet,
  onSendViaWallet,
  walletBusy,
}) {
  const [copiedField, setCopiedField] = useState(null)
  const addressFeedbackRef = useRef(null)
  const amountFeedbackRef = useRef(null)

  const copyValue = async (text, field, feedbackRef) => {
    try {
      await navigator.clipboard.writeText(String(text))
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = String(text)
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    setCopiedField(field)
    popElement(feedbackRef)
    setTimeout(() => {
      setCopiedField((curr) => (curr === field ? null : curr))
    }, 2400)
  }

  return (
    <Card className="space-y-5">
      {/* Mandatory network/coin safety warning */}
      <div
        role="note"
        className="flex items-start gap-3 rounded-xl border border-amber/45 bg-amber-50 p-3.5 text-ink"
      >
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber text-on-amber">
          <Icon name="alert" className="h-4 w-4" />
        </span>
        <p className="text-base font-semibold leading-snug text-ink">
          Only send {payment.token} on the {payment.chainName} network
          {payment.chainBadge ? ` (${payment.chainBadge})` : ''}.
        </p>
      </div>

      {method === 'wallet' ? (
        <div className="space-y-4">
          {!connectedWallet ? (
            <div className="rounded-xl border border-border-muted bg-surface-muted p-4 space-y-3">
              <p className="text-base font-medium text-ink">
                Connect your {payment.chainName}-compatible wallet to approve this exact transfer.
              </p>
              <p className="text-base text-ink-muted">
                ClikPa never sees your secret words and cannot move funds without your approval.
              </p>
              <Button variant="primary" fullWidth onClick={onConnectWallet} loading={walletBusy}>
                <Icon name="wallet" className="h-5 w-5" />
                <span>Connect {payment.chainName} wallet</span>
              </Button>
            </div>
          ) : (
            <div className="rounded-xl border border-brand-200 bg-brand-50/60 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-base font-medium text-ink-muted">Connected wallet</span>
                <span className="rounded-lg border border-white/10 bg-black/25 px-2.5 py-1 font-mono text-base font-semibold text-ink">
                  {truncateMiddle(connectedWallet.address, 7, 6)}
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-base">
                <span className="text-ink-muted">Receiving address ({payment.chainName})</span>
                <span className="font-mono font-medium text-ink">
                  {truncateMiddle(payment.depositAddress, 7, 6)}
                </span>
              </div>
              <Button variant="primary" size="lg" fullWidth onClick={onSendViaWallet} loading={walletBusy}>
                Approve {formatTokenAmount(payment.totalToSendToken, payment.token)} in wallet
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {/* QR Code */}
          <QrCodeBox
            value={payment.depositAddress}
            label={`QR code for ${payment.chainName} ${payment.token} deposit address`}
          />

          {/* Deposit address: truncated in middle, copies full value, chain name right next to it */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-base font-medium text-ink">Deposit address</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-base font-semibold text-link border border-brand-200">
                {payment.chainName}
                {payment.chainBadge ? ` • ${payment.chainBadge}` : ''}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 rounded-xl border border-white/12 bg-black/25 p-3">
              <div className="min-w-0">
                <p
                  className="font-mono text-base font-semibold text-ink"
                  title={payment.depositAddress}
                >
                  {truncateMiddle(payment.depositAddress, 9, 8)}
                </p>
                <p className="text-base text-ink-muted">Full address copies to clipboard</p>
              </div>

              <Button
                ref={addressFeedbackRef}
                variant="secondary"
                onClick={() => copyValue(payment.depositAddress, 'address', addressFeedbackRef)}
                aria-label={`Copy full ${payment.chainName} deposit address`}
              >
                <Icon name={copiedField === 'address' ? 'check-circle' : 'copy'} className="h-4 w-4" />
                <span>{copiedField === 'address' ? 'Copied' : 'Copy'}</span>
              </Button>
            </div>
          </div>

          {/* Exact amount copy */}
          <div className="space-y-2">
            <span className="block text-base font-medium text-ink">Exact amount to send</span>
            <div className="flex items-center justify-between gap-2 rounded-xl border border-white/12 bg-black/25 p-3">
              <span className="font-mono text-lg font-bold text-ink">
                {payment.totalToSendToken} {payment.token}
              </span>
              <Button
                ref={amountFeedbackRef}
                variant="secondary"
                onClick={() => copyValue(payment.totalToSendToken, 'amount', amountFeedbackRef)}
                aria-label={`Copy exact amount ${payment.totalToSendToken} ${payment.token}`}
              >
                <Icon name={copiedField === 'amount' ? 'check-circle' : 'copy'} className="h-4 w-4" />
                <span>{copiedField === 'amount' ? 'Copied' : 'Copy amount'}</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
