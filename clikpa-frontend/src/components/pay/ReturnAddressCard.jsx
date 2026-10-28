import { forwardRef, useEffect, useState } from 'react'
import { truncateMiddle } from '../../utils/format'
import { Button, Card, Input } from '../ui'

// Rule 8: Connected wallet prefills return address; QR/address asks once with exchange-address warning.
export const ReturnAddressCard = forwardRef(function ReturnAddressCard(
  {
    chainName,
    method,
    connectedWalletAddress,
    savedAddress,
    alreadyPrompted,
    forceExpand = false,
    onSaveReturnAddress,
    saving,
  },
  inputRef,
) {
  const [draft, setDraft] = useState(savedAddress || connectedWalletAddress || '')
  const [editing, setEditing] = useState(!alreadyPrompted && !savedAddress)
  const [validationError, setValidationError] = useState('')

  useEffect(() => {
    if (method === 'wallet' && connectedWalletAddress && !savedAddress) {
      setDraft(connectedWalletAddress)
    } else if (savedAddress) {
      setDraft(savedAddress)
    }
  }, [method, connectedWalletAddress, savedAddress])

  useEffect(() => {
    if (forceExpand) {
      setEditing(true)
    }
  }, [forceExpand])

  if (method === 'wallet' && connectedWalletAddress && !editing) {
    return (
      <Card variant="muted" className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-base font-semibold text-ink">Return address (for accidental excess)</p>
            <p className="text-base text-ink-muted">
              Prefilled from your connected {chainName} wallet:{' '}
              <span className="font-mono font-semibold text-ink">
                {truncateMiddle(savedAddress || connectedWalletAddress, 8, 6)}
              </span>
            </p>
          </div>
          <Button variant="ghost" onClick={() => setEditing(true)}>
            Change
          </Button>
        </div>
      </Card>
    )
  }

  if (!editing && (alreadyPrompted || savedAddress)) {
    return (
      <Card variant="muted" className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-ink">Return address for accidental excess</p>
          <p className="text-base text-ink-muted">
            {savedAddress ? (
              <>
                Saved on {chainName}:{' '}
                <span className="font-mono font-semibold text-ink">
                  {truncateMiddle(savedAddress, 8, 6)}
                </span>
              </>
            ) : (
              'Not added yet — you can add one anytime if needed.'
            )}
          </p>
        </div>
        <Button variant="secondary" onClick={() => setEditing(true)}>
          {savedAddress ? 'Edit' : 'Add address'}
        </Button>
      </Card>
    )
  }

  const handleSave = (e) => {
    e.preventDefault()
    const clean = draft.trim()
    if (!clean || clean.length < 16) {
      setValidationError(`Enter a valid personal ${chainName} wallet address.`)
      return
    }
    setValidationError('')
    onSaveReturnAddress(clean, true)
    setEditing(false)
  }

  const handleSkipOnce = () => {
    setValidationError('')
    onSaveReturnAddress('', true)
    setEditing(false)
  }

  return (
    <Card className="space-y-3.5">
      <div>
        <h2 className="font-heading text-base font-semibold text-ink">
          Return address (in case of accidental overpayment)
        </h2>
        <p className="mt-1 text-base text-ink-muted">
          Warning: Do not enter an exchange&apos;s sending address unless your exchange account supports receiving returns to that address. Use a personal {chainName} wallet you control.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-3">
        <Input
          ref={inputRef}
          label={`Your ${chainName} return address`}
          placeholder={`Paste your personal ${chainName} address`}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value)
            if (validationError) setValidationError('')
          }}
          error={validationError}
        />

        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" variant="secondary" loading={saving}>
            Save return address
          </Button>
          {!forceExpand && (
            <Button type="button" variant="ghost" onClick={handleSkipOnce}>
              Skip for now
            </Button>
          )}
        </div>
      </form>
    </Card>
  )
})
