import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { Icon } from '../components/Icons'
import {
  Banner,
  Button,
  Card,
  EmptyState,
  Input,
  PageSkeleton,
  StatusPill,
} from '../components/ui'
import { usePolling } from '../hooks/usePolling'
import { formatNgn, formatUsd } from '../utils/format'
import { useLiveDotPulse, useScreenReveal } from '../utils/motion'
import { cn } from '../utils/cn'

const WITHDRAWAL_STAGES = [
  'Awaiting approval',
  'Sending payment',
  'Bank payout processing',
  'Paid to your bank',
]

export function WithdrawPage() {
  const pageRef = useRef(null)
  const pulseDotRef = useRef(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [options, setOptions] = useState(null)

  const [amountInput, setAmountInput] = useState('200')
  const [selectedBankId, setSelectedBankId] = useState('')
  const [quote, setQuote] = useState(null)
  const [quoting, setQuoting] = useState(false)
  const [quoteError, setQuoteError] = useState(null)

  const [activeWithdrawal, setActiveWithdrawal] = useState(null)
  const [approving, setApproving] = useState(false)

  // Partner-driven KYC & Bank Linking state
  const [partnerFieldValues, setPartnerFieldValues] = useState({})
  const [partnerBusy, setPartnerBusy] = useState(false)
  const [showLinkBank, setShowLinkBank] = useState(false)
  const [newBankName, setNewBankName] = useState('')
  const [newAccountNumber, setNewAccountNumber] = useState('')
  const [newAccountName, setNewAccountName] = useState('')
  const [bankError, setBankError] = useState('')

  useScreenReveal(pageRef, loading ? 'loading' : activeWithdrawal?.id || 'form')

  const isLiveProcessing =
    Boolean(activeWithdrawal) &&
    activeWithdrawal.status !== 'Paid to your bank' &&
    activeWithdrawal.status !== 'Failed'

  useLiveDotPulse(pulseDotRef, isLiveProcessing)

  const loadOptions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.getWithdrawalOptions()
      setOptions(res)
      if (res?.linkedBanks?.length) {
        setSelectedBankId((curr) => curr || res.linkedBanks[0].id)
      }
      if (res?.supportedBanks?.length) {
        setNewBankName((curr) => curr || res.supportedBanks[0])
      }
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadOptions()
    const onMockChange = () => {
      setActiveWithdrawal(null)
      setQuote(null)
      loadOptions()
    }
    window.addEventListener('clikpa-mock-change', onMockChange)
    return () => window.removeEventListener('clikpa-mock-change', onMockChange)
  }, [loadOptions])

  // Poll active withdrawal status (Rule 9: statuses come strictly from API)
  const pollWithdrawal = useCallback(async () => {
    if (!activeWithdrawal?.id) return
    const latest = await api.getWithdrawal(activeWithdrawal.id)
    setActiveWithdrawal(latest)
  }, [activeWithdrawal?.id])

  usePolling(pollWithdrawal, {
    enabled: Boolean(activeWithdrawal?.id) && activeWithdrawal?.status !== 'Paid to your bank',
    intervalMs: 3200,
  })

  // Live transparent calculation BEFORE approval (charges ALWAYS visible)
  const previewBreakdown = useMemo(() => {
    if (!options) return null
    const amt = Math.max(0, Number(amountInput) || 0)
    const fee = amt > 0 ? Number((options.flatFeeUsd + (amt * options.percentFee) / 100).toFixed(2)) : 0
    const totalLeaving = Number((amt + fee).toFixed(2))
    const expectedNgn = Number((amt * options.rateNgnPerUsd).toFixed(2))
    const destinationBank =
      options.linkedBanks?.find((b) => b.id === selectedBankId) || options.linkedBanks?.[0] || null
    return {
      amountUsd: amt,
      feeUsd: fee,
      totalLeavingWalletUsd: totalLeaving,
      expectedNgn,
      rateNgnPerUsd: options.rateNgnPerUsd,
      destinationBank,
    }
  }, [options, amountInput, selectedBankId])

  const handleGetQuote = async (e) => {
    e.preventDefault()
    setQuoting(true)
    setQuoteError(null)
    try {
      const q = await api.getWithdrawalQuote({
        amountUsd: Number(amountInput),
        bankId: selectedBankId,
      })
      setQuote(q)
    } catch (err) {
      setQuoteError(err)
      setQuote(null)
    } finally {
      setQuoting(false)
    }
  }

  const handleApproveWithdrawal = async () => {
    if (!quote) return
    setApproving(true)
    setQuoteError(null)
    try {
      const wd = await api.createWithdrawal({
        quoteId: quote.quoteId,
        amountUsd: quote.amountUsd,
        bankId: quote.destinationBank.id,
      })
      setActiveWithdrawal(wd)
    } catch (err) {
      setQuoteError(err)
    } finally {
      setApproving(false)
    }
  }

  const handlePartnerStepAction = async (step) => {
    setPartnerBusy(true)
    setQuoteError(null)
    try {
      if (step.type === 'identity') {
        await api.getWithdrawalQuote({
          partnerAction: 'complete_kyc',
          fields: partnerFieldValues,
        })
      }
      await loadOptions()
    } catch (err) {
      setQuoteError(err)
    } finally {
      setPartnerBusy(false)
    }
  }

  const handleLinkPartnerBank = async (e) => {
    e.preventDefault()
    setBankError('')
    setPartnerBusy(true)
    try {
      const res = await api.getWithdrawalQuote({
        partnerAction: 'link_bank',
        bankName: newBankName,
        accountNumber: newAccountNumber,
        accountName: newAccountName,
      })
      await loadOptions()
      if (res?.linkedBank?.id) {
        setSelectedBankId(res.linkedBank.id)
      }
      setShowLinkBank(false)
      setNewAccountNumber('')
      setNewAccountName('')
    } catch (err) {
      setBankError(err.message)
    } finally {
      setPartnerBusy(false)
    }
  }

  const displayedSummary = quote || previewBreakdown

  return (
    <div ref={pageRef} className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link
            to="/wallet"
            className="inline-flex min-h-11 items-center gap-1.5 text-base font-medium text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-lg"
          >
            <Icon name="arrow-left" className="h-4 w-4" />
            <span>Back to wallet</span>
          </Link>
          <h1 className="mt-1 font-heading text-2xl sm:text-3xl font-bold text-ink">
            Withdraw to Naira
          </h1>
        </div>

        {activeWithdrawal && <StatusPill status={activeWithdrawal.status} />}
      </div>

      {/* 1. LOADING */}
      {loading && <PageSkeleton lines={3} />}

      {/* 2. ERROR */}
      {!loading && error && (
        <Banner
          variant="error"
          title="Could not load withdrawal options"
          reassurance="No money has left your wallet."
          actionLabel="Try again"
          onAction={loadOptions}
        >
          {error.message}
        </Banner>
      )}

      {/* 3. EMPTY BALANCE & PARTNER ONBOARDING */}
      {!loading &&
        !error &&
        options &&
        !activeWithdrawal &&
        Number(options.availableUsd || 0) <= 0 &&
        (!options.partnerSteps || options.partnerSteps.length === 0) && (
          <EmptyState
            icon="bank"
            title="No digital dollars available to withdraw yet"
            description="Once a customer pays one of your invoices, you can withdraw your balance to your Nigerian bank here."
            actionLabel="Create an invoice"
            actionTo="/invoices/new"
          />
        )}

      {/* 4. ACTIVE WITHDRAWAL LIVE STATUS VIEW (Rule 9) */}
      {!loading && !error && activeWithdrawal && (
        <Card data-animate="section" className="space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border-muted pb-4">
            <div>
              <p className="text-base text-ink-muted">Payout to {activeWithdrawal.destinationBank?.bankName}</p>
              <p className="font-heading text-3xl font-bold text-ink">
                {formatNgn(activeWithdrawal.expectedNgn)}
              </p>
              <p className="text-base text-ink-muted">
                Total leaving wallet: {formatUsd(activeWithdrawal.totalLeavingWalletUsd)} (includes{' '}
                {formatUsd(activeWithdrawal.feeUsd)} charges)
              </p>
            </div>
            <StatusPill status={activeWithdrawal.status} />
          </div>

          {/* Exact API Status Stepper */}
          <ol aria-label="Withdrawal progress" className="space-y-3">
            {WITHDRAWAL_STAGES.map((stage, idx) => {
              const currentIdx = WITHDRAWAL_STAGES.indexOf(activeWithdrawal.status)
              const failedIdx = activeWithdrawal.stoppedAt
                ? WITHDRAWAL_STAGES.indexOf(activeWithdrawal.stoppedAt)
                : -1

              const isFailedStage = activeWithdrawal.status === 'Failed' && idx === failedIdx
              const isCompleted =
                activeWithdrawal.status === 'Paid to your bank' ||
                (currentIdx > idx && activeWithdrawal.status !== 'Failed') ||
                (activeWithdrawal.status === 'Failed' && idx < failedIdx)
              const isCurrent = activeWithdrawal.status === stage && stage !== 'Paid to your bank'

              return (
                <li key={stage} className="flex items-center gap-3">
                  {isCompleted ? (
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-status-paid-bg text-status-paid-text border border-status-paid-border">
                      <Icon name="check-circle" className="h-4 w-4" />
                    </span>
                  ) : isFailedStage ? (
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-status-failed-bg text-status-failed-text border border-status-failed-border">
                      <Icon name="alert" className="h-4 w-4" />
                    </span>
                  ) : isCurrent ? (
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber/25 border border-amber">
                      <span ref={pulseDotRef} className="h-2.5 w-2.5 rounded-full bg-amber" />
                    </span>
                  ) : (
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-subtle border border-border-strong text-xs font-semibold text-ink-muted">
                      {idx + 1}
                    </span>
                  )}

                  <span
                    className={cn(
                      'text-base',
                      isCurrent || isCompleted || isFailedStage
                        ? 'font-semibold text-ink'
                        : 'text-ink-muted',
                    )}
                  >
                    {stage}
                    {isFailedStage ? ' (stopped here)' : ''}
                  </span>
                </li>
              )
            })}
          </ol>

          {/* Rule 9: Failure banner — explain where it stopped, next step, and NEVER claim returned until API confirms */}
          {activeWithdrawal.status === 'Failed' && (
            <Banner
              variant="error"
              title={`Payout stopped during "${activeWithdrawal.stoppedAt || 'Bank payout processing'}"`}
              reassurance={
                activeWithdrawal.fundsReturnedToWallet
                  ? `Confirmed: ${formatUsd(activeWithdrawal.totalLeavingWalletUsd)} has been returned to your wallet balance.`
                  : `Your money is safe with our licensed payout partner while the reversal is processed. We have not yet confirmed the return to your wallet.`
              }
              actionLabel={activeWithdrawal.nextActionLabel || 'Check return status'}
              onAction={async () => {
                if (activeWithdrawal.fundsReturnedToWallet) {
                  setActiveWithdrawal(null)
                  setQuote(null)
                  await loadOptions()
                } else {
                  await pollWithdrawal()
                }
              }}
            >
              {activeWithdrawal.failureExplanation ||
                'Your destination bank could not accept the transfer right now.'}
            </Banner>
          )}

          {activeWithdrawal.status === 'Paid to your bank' && (
            <Banner
              variant="success"
              title="Paid to your bank"
              reassurance={`${formatNgn(activeWithdrawal.expectedNgn)} was sent to ${activeWithdrawal.destinationBank?.bankName} (${activeWithdrawal.destinationBank?.accountNumber}).`}
              actionLabel="Back to wallet"
              actionTo="/wallet"
            >
              Your naira transfer is complete.
            </Banner>
          )}
        </Card>
      )}

      {/* 4. PARTNER STEPS + WITHDRAWAL QUOTE & APPROVAL FORM */}
      {!loading && !error && options && !activeWithdrawal && (
        <>
          {/* Rule 9: Render partner-driven KYC / identity steps dynamically from API */}
          {options.partnerSteps?.map((step) => (
            <Card key={step.id} data-animate="section" variant="amber" className="space-y-4">
              <div className="space-y-1">
                <p className="text-base font-semibold text-ink">
                  Partner requirement • {options.partnerName}
                </p>
                <h2 className="font-heading text-lg font-bold text-ink">{step.title}</h2>
                <p className="text-base text-ink-muted">{step.description}</p>
              </div>

              {step.fields?.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {step.fields.map((field) => (
                    <Input
                      key={field.name}
                      label={field.label}
                      placeholder={field.placeholder}
                      value={partnerFieldValues[field.name] || ''}
                      onChange={(e) =>
                        setPartnerFieldValues((c) => ({ ...c, [field.name]: e.target.value }))
                      }
                    />
                  ))}
                </div>
              )}

              <Button
                variant="primary"
                onClick={() => handlePartnerStepAction(step)}
                loading={partnerBusy}
              >
                {step.actionLabel || 'Continue'}
              </Button>
            </Card>
          ))}

          {options.kycStatus === 'verified' && Number(options.availableUsd) > 0 && (
            <>
              {quoteError && (
                <Banner
                  variant="error"
                  title="Could not prepare withdrawal"
                  reassurance="Nothing has left your wallet."
                  actionLabel="Dismiss"
                  onAction={() => setQuoteError(null)}
                >
                  {quoteError.message}
                </Banner>
              )}

              <Card data-animate="section" className="space-y-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-base font-medium text-ink-muted">Available in wallet</span>
                  <span className="font-heading text-xl font-bold text-ink">
                    {formatUsd(options.availableUsd)}
                  </span>
                </div>

                <form onSubmit={handleGetQuote} className="space-y-4">
                  <Input
                    label="Amount to convert to naira (USD)"
                    type="number"
                    inputMode="decimal"
                    min={options.minAmountUsd}
                    max={options.availableUsd}
                    step="0.01"
                    value={amountInput}
                    onChange={(e) => {
                      setAmountInput(e.target.value)
                      setQuote(null)
                    }}
                    hint={`Partner rate: ${formatNgn(options.rateNgnPerUsd)} per $1.00`}
                  />

                  {/* Partner-driven Bank Selection + Add Bank */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <label htmlFor="dest-bank" className="text-base font-medium text-ink">
                        Destination Nigerian bank
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowLinkBank((v) => !v)}
                        className="min-h-11 text-base font-semibold text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-lg px-2"
                      >
                        {showLinkBank ? 'Close' : '+ Link another bank'}
                      </button>
                    </div>

                    {options.linkedBanks?.length > 0 ? (
                      <select
                        id="dest-bank"
                        value={selectedBankId}
                        onChange={(e) => {
                          setSelectedBankId(e.target.value)
                          setQuote(null)
                        }}
                        className="min-h-11 w-full rounded-xl border border-border-strong bg-surface px-3.5 py-2.5 text-base text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                      >
                        {options.linkedBanks.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.bankName} • {b.accountNumber} ({b.accountName})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-base text-ink-muted">
                        No Nigerian bank account linked yet. Link your bank below to continue.
                      </p>
                    )}
                  </div>

                  {/* Rule 9: BEFORE approval show ALL 4 items with charges ALWAYS visible */}
                  {displayedSummary && (
                    <div className="rounded-xl border border-brand-200 bg-brand-50/60 p-4 space-y-2.5">
                      <p className="font-heading text-base font-semibold text-ink">
                        Summary before you approve
                      </p>

                      <div className="flex justify-between gap-2 text-base">
                        <span className="text-ink-muted">Withdrawal amount</span>
                        <span className="font-medium text-ink">
                          {formatUsd(displayedSummary.amountUsd)}
                        </span>
                      </div>

                      <div className="flex justify-between gap-2 text-base">
                        <span className="text-ink-muted">Charges (partner + network)</span>
                        <span className="font-semibold text-ink">
                          + {formatUsd(displayedSummary.feeUsd)}
                        </span>
                      </div>

                      <div className="flex justify-between gap-2 border-t border-brand-200 pt-2 text-base font-bold text-ink">
                        <span>Total leaving wallet</span>
                        <span>{formatUsd(displayedSummary.totalLeavingWalletUsd)}</span>
                      </div>

                      <div className="flex justify-between gap-2 border-t border-brand-200 pt-2 text-lg font-bold text-brand-900">
                        <span>Naira expected</span>
                        <span>{formatNgn(displayedSummary.expectedNgn)}</span>
                      </div>

                      {displayedSummary.destinationBank && (
                        <div className="border-t border-brand-200 pt-2 text-base">
                          <span className="text-ink-muted">Destination bank: </span>
                          <strong className="font-semibold text-ink">
                            {displayedSummary.destinationBank.bankName} •{' '}
                            {displayedSummary.destinationBank.accountNumber} (
                            {displayedSummary.destinationBank.accountName})
                          </strong>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Single Primary Button per step: Lock Quote -> Approve in Wallet */}
                  {!quote ? (
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      fullWidth
                      loading={quoting}
                      disabled={!options.linkedBanks?.length}
                    >
                      Review &amp; lock naira quote
                    </Button>
                  ) : (
                    <div className="space-y-2.5">
                      <Button
                        type="button"
                        variant="primary"
                        size="lg"
                        fullWidth
                        loading={approving}
                        onClick={handleApproveWithdrawal}
                      >
                        Approve {formatUsd(quote.totalLeavingWalletUsd)} withdrawal
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        fullWidth
                        onClick={() => setQuote(null)}
                      >
                        Change amount or bank
                      </Button>
                    </div>
                  )}
                </form>

                {/* Partner Bank Linking Drawer */}
                {showLinkBank && (
                  <form
                    onSubmit={handleLinkPartnerBank}
                    className="rounded-xl border border-border-muted bg-surface-muted p-4 space-y-3"
                  >
                    <h3 className="font-heading text-base font-semibold text-ink">
                      Link bank via {options.partnerName}
                    </h3>
                    <div>
                      <label htmlFor="new-bank-select" className="block text-base font-medium text-ink mb-1">
                        Bank name
                      </label>
                      <select
                        id="new-bank-select"
                        value={newBankName}
                        onChange={(e) => setNewBankName(e.target.value)}
                        className="min-h-11 w-full rounded-xl border border-border-strong bg-surface px-3.5 text-base text-ink"
                      >
                        {options.supportedBanks?.map((bn) => (
                          <option key={bn} value={bn}>
                            {bn}
                          </option>
                        ))}
                      </select>
                    </div>

                    <Input
                      label="10-digit NUBAN account number"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="0123456789"
                      value={newAccountNumber}
                      onChange={(e) => setNewAccountNumber(e.target.value)}
                      error={bankError}
                    />

                    <Input
                      label="Account holder name"
                      placeholder="ADEBAYO FABRICS & TAILORING"
                      value={newAccountName}
                      onChange={(e) => setNewAccountName(e.target.value)}
                    />

                    <Button type="submit" variant="secondary" loading={partnerBusy}>
                      Verify &amp; save bank account
                    </Button>
                  </form>
                )}
              </Card>
            </>
          )}
        </>
      )}
    </div>
  )
}
