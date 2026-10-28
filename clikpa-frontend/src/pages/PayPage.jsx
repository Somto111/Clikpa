import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { SUPPORTED_NETWORKS } from '../api/mock'
import { Logo } from '../components/Logo'
import { PillHeader } from '../components/PillHeader'
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
import { AlreadyPaidState } from '../components/pay/AlreadyPaidState'
import { InvoiceCancelledState } from '../components/pay/InvoiceCancelledState'
import { InvoiceOverdueState } from '../components/pay/InvoiceOverdueState'
import { QuoteEndedState } from '../components/pay/QuoteEndedState'
import { UnderpaidState } from '../components/pay/UnderpaidState'
import { OverpaidState } from '../components/pay/OverpaidState'
import { SwapFailedReturningState } from '../components/pay/SwapFailedReturningState'
import { SlowNetworkState } from '../components/pay/SlowNetworkState'
import { WrongChainRiskState } from '../components/pay/WrongChainRiskState'
import { QuoteCard } from '../components/pay/QuoteCard'
import { DepositBlock } from '../components/pay/DepositBlock'
import { ReturnAddressCard } from '../components/pay/ReturnAddressCard'
import { LiveStatusTracker } from '../components/pay/LiveStatusTracker'
import { usePolling } from '../hooks/usePolling'
import { formatDate, formatUsd } from '../utils/format'
import { useScreenReveal } from '../utils/motion'
import {
  getStoredPaymentId,
  getStoredReturnAddressState,
  setStoredPaymentId,
  setStoredReturnAddressState,
} from '../utils/paymentStorage'
import { cn } from '../utils/cn'

const MOCK_WALLET_BY_CHAIN = {
  tron: 'TMuA6YqfCeX8EhbfYEg5y7S4DqzSJireY9',
  base: '0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE',
  bsc: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  polygon: '0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE',
  solana: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
}

export function PayPage() {
  const { invoiceId } = useParams()
  const pageRef = useRef(null)
  const paymentControlsRef = useRef(null)
  const returnInputRef = useRef(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [invoice, setInvoice] = useState(null)
  const [payment, setPayment] = useState(null)

  const [selectedChain, setSelectedChain] = useState('tron')
  const [selectedToken, setSelectedToken] = useState('USDT')
  const [method, setMethod] = useState('qr') // 'wallet' | 'qr'

  // Rule 7: Instalment state (only active when merchant enabled allowInstalments)
  const [payMode, setPayMode] = useState('full') // 'full' | 'instalment'
  const [customAmountInput, setCustomAmountInput] = useState('')
  const [instalmentError, setInstalmentError] = useState('')

  // Connected wallet state (Rule 1 & Rule 8: non-custodial, prefills return address)
  const [connectedWallet, setConnectedWallet] = useState(null)
  const [walletBusy, setWalletBusy] = useState(false)
  const [acknowledgedChains, setAcknowledgedChains] = useState({})

  // Return address persistence (Rule 8: ask once on QR/address payment)
  const [returnAddrState, setReturnAddrState] = useState(() => getStoredReturnAddressState(invoiceId))
  const [savingReturn, setSavingReturn] = useState(false)
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(false)
  const [inlineActionError, setInlineActionError] = useState(null)

  useScreenReveal(pageRef, loading ? 'loading' : invoice?.id || 'ready')

  const networks = invoice?.networks?.length ? invoice.networks : SUPPORTED_NETWORKS
  const activeNetwork = networks.find((n) => n.id === selectedChain) || networks[0]

  const resolveEffectiveAmount = useCallback(
    (inv, mode, rawInput) => {
      if (!inv) return 0
      if (!inv.allowInstalments || mode === 'full') {
        return Number(inv.amountRemaining || 0)
      }
      const parsed = Number(rawInput)
      return Number.isFinite(parsed) ? parsed : 0
    },
    [],
  )

  const requestOrRefreshPayment = useCallback(
    async ({
      inv,
      chainId,
      tokenSymbol,
      payMethod,
      amountUsd,
      returnAddress,
      refreshQuote = false,
    }) => {
      if (!inv || inv.status === 'paid' || inv.status === 'cancelled' || inv.status === 'draft') {
        return null
      }
      setQuoteLoading(true)
      setInlineActionError(null)
      try {
        const created = await api.createPublicPayment(inv.id, {
          chain: chainId,
          token: tokenSymbol,
          method: payMethod,
          amount: amountUsd,
          returnAddress,
          refreshQuote,
        })
        setPayment(created)
        setStoredPaymentId(inv.id, created.id)
        return created
      } catch (err) {
        setInlineActionError(err)
        return null
      } finally {
        setQuoteLoading(false)
      }
    },
    [],
  )

  const loadPage = useCallback(async () => {
    setLoading(true)
    setError(null)
    setNotFound(false)

    try {
      const inv = await api.getPublicInvoice(invoiceId)
      setInvoice(inv)
      setCustomAmountInput(String(inv.amountRemaining || inv.total || ''))

      const storedReturn = getStoredReturnAddressState(inv.id)
      setReturnAddrState(storedReturn)

      // Rule 4 & Rule 6: Do not start payments on cancelled, draft, or already-paid invoices.
      if (inv.status === 'paid' || inv.status === 'cancelled' || inv.status === 'draft') {
        setPayment(null)
        return
      }

      // Rule 6: Resume existing payment on reload or return; never start a second one.
      const existingPayId = inv.activePaymentId || getStoredPaymentId(inv.id)
      if (existingPayId) {
        try {
          const resumed = await api.getPublicPayment(existingPayId)
          if (resumed && resumed.invoiceId === inv.id && resumed.status !== 'delivered') {
            setPayment(resumed)
            setSelectedChain(resumed.chain)
            setSelectedToken(resumed.token)
            setMethod(resumed.method || 'qr')
            if (inv.allowInstalments && Math.abs(resumed.invoiceAmountUsd - inv.amountRemaining) > 0.01) {
              setPayMode('instalment')
              setCustomAmountInput(String(resumed.invoiceAmountUsd))
            }
            if (resumed.returnAddress && !storedReturn.address) {
              const nextRet = { address: resumed.returnAddress, prompted: true }
              setReturnAddrState(nextRet)
              setStoredReturnAddressState(inv.id, nextRet)
            }
            return
          }
        } catch {
          // Stored payment expired/removed on server; obtain fresh quote below
        }
      }

      const defaultNet = (inv.networks || SUPPORTED_NETWORKS)[0]
      const defaultTok = defaultNet.tokens[0].symbol
      setSelectedChain(defaultNet.id)
      setSelectedToken(defaultTok)

      await requestOrRefreshPayment({
        inv,
        chainId: defaultNet.id,
        tokenSymbol: defaultTok,
        payMethod: 'qr',
        amountUsd: inv.amountRemaining,
        returnAddress: storedReturn.address,
      })
    } catch (err) {
      if (err.code === 'INVOICE_NOT_FOUND' || err.code === 'NOT_FOUND') {
        setNotFound(true)
      } else {
        setError(err)
      }
    } finally {
      setLoading(false)
    }
  }, [invoiceId, requestOrRefreshPayment])

  useEffect(() => {
    loadPage()
    const onMockChange = () => loadPage()
    window.addEventListener('clikpa-mock-change', onMockChange)
    return () => window.removeEventListener('clikpa-mock-change', onMockChange)
  }, [loadPage])

  // Poll active payment status with backoff & hidden-tab pause
  const shouldPoll =
    Boolean(payment?.id) &&
    payment?.status !== 'delivered' &&
    payment?.status !== 'quote_ended' &&
    invoice?.status !== 'paid' &&
    invoice?.status !== 'cancelled'

  const pollPaymentStatus = useCallback(async () => {
    if (!payment?.id) return
    const latest = await api.getPublicPayment(payment.id)
    setPayment(latest)
    if (latest.status === 'delivered') {
      const updatedInv = await api.getPublicInvoice(invoiceId)
      setInvoice(updatedInv)
      setStoredPaymentId(invoiceId, null)
    }
  }, [payment?.id, invoiceId])

  usePolling(pollPaymentStatus, { enabled: shouldPoll, intervalMs: 5000 })

  const isPaymentLockedInFlight =
    payment?.status === 'swapping' ||
    payment?.status === 'underpaid' ||
    payment?.status === 'overpaid' ||
    payment?.status === 'swap_failed'

  const handleSelectChain = async (chainId) => {
    if (isPaymentLockedInFlight || chainId === selectedChain) return
    const nextNet = networks.find((n) => n.id === chainId) || networks[0]
    const nextToken = nextNet.tokens.some((t) => t.symbol === selectedToken)
      ? selectedToken
      : nextNet.tokens[0].symbol

    setSelectedChain(chainId)
    setSelectedToken(nextToken)

    const amountUsd = resolveEffectiveAmount(invoice, payMode, customAmountInput)
    if (amountUsd > 0 && amountUsd <= invoice.amountRemaining) {
      await requestOrRefreshPayment({
        inv: invoice,
        chainId,
        tokenSymbol: nextToken,
        payMethod: method,
        amountUsd,
        returnAddress:
          method === 'wallet' && connectedWallet?.chain === chainId
            ? connectedWallet.address
            : returnAddrState.address,
        refreshQuote: true,
      })
    }
  }

  const handleSelectToken = async (tokenSymbol) => {
    if (isPaymentLockedInFlight || tokenSymbol === selectedToken) return
    setSelectedToken(tokenSymbol)
    const amountUsd = resolveEffectiveAmount(invoice, payMode, customAmountInput)
    if (amountUsd > 0 && amountUsd <= invoice.amountRemaining) {
      await requestOrRefreshPayment({
        inv: invoice,
        chainId: selectedChain,
        tokenSymbol,
        payMethod: method,
        amountUsd,
        returnAddress: returnAddrState.address,
        refreshQuote: true,
      })
    }
  }

  const handleMethodChange = (nextMethod) => {
    setMethod(nextMethod)
    if (nextMethod === 'wallet' && connectedWallet?.chain === selectedChain) {
      handleSaveReturnAddress(connectedWallet.address, true)
    }
  }

  // Rule 7: Validate custom instalment amount inline and block amounts > remaining balance
  const handleCustomAmountChange = (val) => {
    setCustomAmountInput(val)
    const num = Number(val)
    if (!val || Number.isNaN(num) || num <= 0) {
      setInstalmentError('Enter an amount greater than $0.00.')
      return
    }
    if (num > invoice.amountRemaining + 0.004) {
      setInstalmentError(
        `Enter an amount up to ${formatUsd(invoice.amountRemaining)} (the remaining balance).`,
      )
      return
    }
    setInstalmentError('')
  }

  const handleApplyInstalmentAmount = async () => {
    const num = Number(customAmountInput)
    if (!num || num <= 0) {
      setInstalmentError('Enter an amount greater than $0.00.')
      return
    }
    if (num > invoice.amountRemaining + 0.004) {
      setInstalmentError(
        `Enter an amount up to ${formatUsd(invoice.amountRemaining)} (the remaining balance).`,
      )
      return
    }
    setInstalmentError('')
    await requestOrRefreshPayment({
      inv: invoice,
      chainId: selectedChain,
      tokenSymbol: selectedToken,
      payMethod: method,
      amountUsd: num,
      returnAddress: returnAddrState.address,
      refreshQuote: true,
    })
  }

  const handleConnectWallet = async () => {
    setWalletBusy(true)
    setInlineActionError(null)
    try {
      let addr = MOCK_WALLET_BY_CHAIN[selectedChain] || MOCK_WALLET_BY_CHAIN.base
      if (typeof window !== 'undefined' && window.ethereum && selectedChain !== 'tron' && selectedChain !== 'solana') {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
          if (accounts?.[0]) addr = accounts[0]
        } catch {
          // Fallback cleanly to non-custodial simulated connection when no injected wallet
        }
      }
      const walletInfo = { address: addr, chain: selectedChain }
      setConnectedWallet(walletInfo)
      // Rule 8: Prefill connected compatible wallet as the return address
      const nextRet = { address: addr, prompted: true }
      setReturnAddrState(nextRet)
      setStoredReturnAddressState(invoice.id, nextRet)
      if (payment?.id) {
        const updated = await api.createPublicPayment(invoice.id, {
          chain: selectedChain,
          token: selectedToken,
          method: 'wallet',
          amount: payment.invoiceAmountUsd,
          returnAddress: addr,
        })
        setPayment(updated)
      }
    } catch (err) {
      setInlineActionError(err)
    } finally {
      setWalletBusy(false)
    }
  }

  // Rule 6: Wallet approval submits transaction & queries API status; never marks Paid on client.
  const handleSendViaWallet = async () => {
    if (!payment?.id) return
    setWalletBusy(true)
    setInlineActionError(null)
    try {
      const checked = await api.checkPublicPayment(payment.id, {
        returnAddress: connectedWallet?.address || returnAddrState.address,
      })
      setPayment(checked)
      if (checked.status === 'delivered') {
        const updatedInv = await api.getPublicInvoice(invoice.id)
        setInvoice(updatedInv)
      }
    } catch (err) {
      setInlineActionError(err)
    } finally {
      setWalletBusy(false)
    }
  }

  const handleSaveReturnAddress = async (address, markPrompted = true) => {
    if (!invoice) return
    setSavingReturn(true)
    const nextState = { address, prompted: markPrompted }
    setReturnAddrState(nextState)
    setStoredReturnAddressState(invoice.id, nextState)
    try {
      if (payment?.id && address) {
        const checked = await api.checkPublicPayment(payment.id, { returnAddress: address })
        setPayment(checked)
      }
    } catch (err) {
      setInlineActionError(err)
    } finally {
      setSavingReturn(false)
    }
  }

  // Rule 6: "I've already sent payment, check status" only checks API status; never mutates status locally.
  const handleCheckStatus = async () => {
    if (!payment?.id) return
    setCheckingStatus(true)
    setInlineActionError(null)
    try {
      const checked = await api.checkPublicPayment(payment.id)
      setPayment(checked)
      if (checked.status === 'delivered') {
        const updatedInv = await api.getPublicInvoice(invoice.id)
        setInvoice(updatedInv)
        setStoredPaymentId(invoice.id, null)
      }
    } catch (err) {
      setInlineActionError(err)
    } finally {
      setCheckingStatus(false)
    }
  }

  const handleRefreshQuote = async () => {
    const amountUsd = resolveEffectiveAmount(invoice, payMode, customAmountInput)
    if (instalmentError || amountUsd <= 0) return
    await requestOrRefreshPayment({
      inv: invoice,
      chainId: selectedChain,
      tokenSymbol: selectedToken,
      payMethod: method,
      amountUsd,
      returnAddress: returnAddrState.address,
      refreshQuote: true,
    })
  }

  const walletChainMismatch =
    method === 'wallet' && connectedWallet && connectedWallet.chain !== selectedChain

  const showWrongChainRisk =
    walletChainMismatch ||
    (Boolean(activeNetwork?.wrongChainWarning) && !acknowledgedChains[selectedChain])

  const focusReturnAddress = () => {
    returnInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setTimeout(() => returnInputRef.current?.focus(), 250)
  }

  return (
    <div ref={pageRef} className="flex min-h-screen flex-col">
      {/* Floating pill header */}
      <PillHeader width="max-w-xl">
        <Logo to="/" />
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-base font-medium text-ink-muted">
          <Icon name="shield" className="h-4 w-4 text-brand-300" />
          <span>Secure pay link</span>
        </span>
      </PillHeader>

      <main className="mx-auto w-full max-w-xl flex-1 space-y-4 px-4 py-5 sm:py-7">
        {/* 1. LOADING STATE */}
        {loading && <PageSkeleton lines={4} />}

        {/* 2. ERROR STATE (Inline banner with retry, never a blank page) */}
        {!loading && error && (
          <Banner
            variant="error"
            title="Could not load payment details"
            reassurance="No money has moved from your wallet. If you already sent a transfer, your payment progress is safe on our servers."
            actionLabel="Try again"
            onAction={loadPage}
          >
            {error.message}
          </Banner>
        )}

        {/* 3. EMPTY / NOT FOUND STATE */}
        {!loading && !error && notFound && (
          <EmptyState
            icon="doc"
            title="Invoice link not found"
            description="Check that you opened the full link sent by the merchant, or ask them to share it again."
            actionLabel="Go to ClikPa home"
            actionTo="/"
          />
        )}

        {/* 4. SUCCESS STATE — Exact Mobile-First Order */}
        {!loading && !error && !notFound && invoice && (
          <>
            {/* SECTION 1: Merchant identity + verified payment ID + consistent top-right StatusPill */}
            <Card data-animate="section" className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h1 className="font-heading text-lg sm:text-xl font-bold text-ink truncate">
                      {invoice.merchant?.businessName || 'Verified Merchant'}
                    </h1>
                    <Icon name="verified" className="h-5 w-5 text-link" />
                  </div>
                  <p className="mt-0.5 text-base text-ink-muted">
                    Verified ID:{' '}
                    <span className="font-mono font-medium text-ink">
                      {invoice.merchant?.verifiedMerchantId || 'CLK-VERIFIED'}
                    </span>{' '}
                    • {invoice.invoiceNumber}
                  </p>
                </div>

                {/* Status is always text + icon + color in the top-right position */}
                <StatusPill status={payment?.status === 'delivered' ? 'paid' : invoice.status} />
              </div>

              {invoice.customerName && (
                <p className="text-base text-ink-muted border-t border-border-muted pt-2.5">
                  Billed to <strong className="font-semibold text-ink">{invoice.customerName}</strong>
                  {invoice.dueDate ? ` • Due ${formatDate(invoice.dueDate)}` : ''}
                </p>
              )}
            </Card>

            {/* SECTION 2: Total due and amount still owed (+ Instalments if merchant enabled) */}
            <Card data-animate="section" className="space-y-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <p className="text-base font-medium text-ink-muted">
                    {invoice.amountPaid > 0 ? 'Amount still owed' : 'Total invoice amount'}
                  </p>
                  <p className="font-heading text-2xl sm:text-3xl font-bold text-ink">
                    {formatUsd(invoice.status === 'paid' ? invoice.total : invoice.amountRemaining)}
                  </p>
                </div>
                {invoice.amountPaid > 0 && (
                  <div className="text-right">
                    <p className="text-base text-ink-muted">Agreed total: {formatUsd(invoice.total)}</p>
                    <p className="text-base font-semibold text-status-paid-text">
                      Paid so far: {formatUsd(invoice.amountPaid)}
                    </p>
                  </div>
                )}
              </div>

              {/* Rule 7: Show receipts per completed instalment payment */}
              {invoice.completedPayments?.length > 0 && (
                <div className="rounded-xl bg-surface-muted p-3 border border-border-muted space-y-2">
                  <p className="text-base font-semibold text-ink">Previous payments received</p>
                  <ul className="space-y-1.5">
                    {invoice.completedPayments.map((cp, idx) => (
                      <li key={cp.id} className="flex flex-wrap items-center justify-between gap-2 text-base">
                        <span className="text-ink-muted">
                          Payment #{idx + 1} ({formatDate(cp.completedAt)}) —{' '}
                          <strong className="font-semibold text-ink">{formatUsd(cp.amountUsd)}</strong>
                        </span>
                        <Link
                          to={`/receipt/${invoice.id}?paymentId=${cp.id}`}
                          className="font-semibold text-link underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 rounded-sm"
                        >
                          Receipt
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Rule 7: Instalments ONLY when merchant enabled them; block amounts above remaining balance */}
              {invoice.allowInstalments &&
                invoice.status !== 'paid' &&
                invoice.status !== 'cancelled' &&
                invoice.status !== 'draft' &&
                !isPaymentLockedInFlight && (
                  <div className="space-y-3 border-t border-border-muted pt-3.5">
                    <p className="text-base font-medium text-ink">Choose how much to pay today</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={payMode === 'full' ? 'primary' : 'secondary'}
                        onClick={async () => {
                          setPayMode('full')
                          setInstalmentError('')
                          setCustomAmountInput(String(invoice.amountRemaining))
                          await requestOrRefreshPayment({
                            inv: invoice,
                            chainId: selectedChain,
                            tokenSymbol: selectedToken,
                            payMethod: method,
                            amountUsd: invoice.amountRemaining,
                            returnAddress: returnAddrState.address,
                            refreshQuote: true,
                          })
                        }}
                      >
                        Full balance ({formatUsd(invoice.amountRemaining)})
                      </Button>
                      <Button
                        variant={payMode === 'instalment' ? 'primary' : 'secondary'}
                        onClick={() => setPayMode('instalment')}
                      >
                        Part payment
                      </Button>
                    </div>

                    {payMode === 'instalment' && (
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-2">
                        <div className="flex-1">
                          <Input
                            type="number"
                            inputMode="decimal"
                            step="0.01"
                            min="1"
                            max={invoice.amountRemaining}
                            label="Instalment amount (USD)"
                            value={customAmountInput}
                            onChange={(e) => handleCustomAmountChange(e.target.value)}
                            error={instalmentError}
                            hint={`Up to ${formatUsd(invoice.amountRemaining)} remaining`}
                          />
                        </div>
                        <div className="sm:pt-7">
                          <Button
                            variant="secondary"
                            fullWidth
                            disabled={Boolean(instalmentError)}
                            loading={quoteLoading}
                            onClick={handleApplyInstalmentAmount}
                          >
                            Update quote
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
            </Card>

            {/* Invoice-level Edge States */}
            {invoice.status === 'draft' && (
              <Banner
                variant="info"
                title="This invoice has not been issued yet"
                reassurance="No payment can be made yet — your money is untouched."
                actionLabel="Refresh status"
                onAction={loadPage}
              >
                {invoice.merchant?.businessName || 'The merchant'} saved this invoice as a draft and is still preparing it. Ask them to issue it when ready.
              </Banner>
            )}

            {invoice.status === 'paid' && (
              <AlreadyPaidState
                invoiceId={invoice.id}
                total={invoice.total}
                businessName={invoice.merchant?.businessName || 'The merchant'}
              />
            )}

            {invoice.status === 'cancelled' && (
              <InvoiceCancelledState
                businessName={invoice.merchant?.businessName || 'The merchant'}
                replacementInvoiceId={invoice.replacementInvoiceId}
              />
            )}

            {invoice.status === 'overdue' && (
              <InvoiceOverdueState
                dueDate={invoice.dueDate}
                remainingAmount={invoice.amountRemaining}
                onScrollToPay={() =>
                  paymentControlsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
              />
            )}

            {inlineActionError && (
              <Banner
                variant="error"
                title="Could not update payment details"
                reassurance="Your funds remain safe in your wallet."
                actionLabel="Retry"
                onAction={handleRefreshQuote}
              >
                {inlineActionError.message}
              </Banner>
            )}

            {/* Payable Interactive Flow */}
            {invoice.status !== 'paid' &&
              invoice.status !== 'cancelled' &&
              invoice.status !== 'draft' && (
                <div ref={paymentControlsRef} className="space-y-4">
                  {/* SECTION 3: Network picker */}
                  <Card data-animate="section" className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="font-heading text-base font-semibold text-ink">
                        1. Choose network
                      </h2>
                      {isPaymentLockedInFlight && (
                        <span className="text-base text-ink-muted">Locked during active transfer</span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {networks.map((net) => {
                        const selected = net.id === selectedChain
                        return (
                          <button
                            key={net.id}
                            type="button"
                            disabled={isPaymentLockedInFlight}
                            onClick={() => handleSelectChain(net.id)}
                            aria-pressed={selected}
                            className={cn(
                              'flex min-h-12 flex-col items-start justify-center rounded-xl border px-3 py-2 text-left',
                              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-1 focus-visible:ring-offset-surface-muted',
                              'disabled:cursor-not-allowed disabled:opacity-60',
                              selected
                                ? 'border-brand-300 bg-brand-50 text-ink ring-1 ring-brand-300'
                                : 'border-white/15 bg-white/[0.04] text-ink hover:bg-white/[0.08] hover:border-white/25',
                            )}
                          >
                            <span className="text-base font-semibold leading-tight">{net.name}</span>
                            <span className="text-xs font-medium text-ink-muted">
                              {net.badge} • {net.eta}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </Card>

                  {/* SECTION 4: Coin picker + Wrong chain risk edge state */}
                  <Card data-animate="section" className="space-y-3">
                    <h2 className="font-heading text-base font-semibold text-ink">
                      2. Choose coin on {activeNetwork.name}
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {activeNetwork.tokens.map((tok) => {
                        const selected = tok.symbol === selectedToken
                        return (
                          <button
                            key={tok.symbol}
                            type="button"
                            disabled={isPaymentLockedInFlight}
                            onClick={() => handleSelectToken(tok.symbol)}
                            aria-pressed={selected}
                            className={cn(
                              'inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 py-2 text-base font-semibold',
                              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-1 focus-visible:ring-offset-surface-muted',
                              'disabled:cursor-not-allowed disabled:opacity-60',
                              selected
                                ? 'border-brand-300 bg-brand text-on-brand'
                                : 'border-white/15 bg-white/[0.04] text-ink hover:bg-white/[0.08] hover:border-white/25',
                            )}
                          >
                            <span>{tok.symbol}</span>
                            <span
                              className={cn(
                                'text-xs font-normal',
                                selected ? 'text-on-brand/80' : 'text-ink-muted',
                              )}
                            >
                              {tok.name}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </Card>

                  {showWrongChainRisk && (
                    <WrongChainRiskState
                      chainName={activeNetwork.name}
                      chainBadge={activeNetwork.badge}
                      token={selectedToken}
                      warningText={activeNetwork.wrongChainWarning}
                      walletMismatch={Boolean(walletChainMismatch)}
                      onSwitchOrConfirm={() => {
                        if (walletChainMismatch) {
                          const switchedAddr =
                            MOCK_WALLET_BY_CHAIN[selectedChain] || connectedWallet.address
                          setConnectedWallet({ address: switchedAddr, chain: selectedChain })
                          handleSaveReturnAddress(switchedAddr, true)
                        } else {
                          setAcknowledgedChains((prev) => ({ ...prev, [selectedChain]: true }))
                        }
                      }}
                    />
                  )}

                  {/* SECTION 5: Choose "Pay with your wallet" or "Pay using an address or QR code" */}
                  <Card data-animate="section" className="space-y-3">
                    <h2 className="font-heading text-base font-semibold text-ink">
                      3. Choose how you want to pay
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleMethodChange('qr')}
                        aria-pressed={method === 'qr'}
                        className={cn(
                          'flex min-h-12 items-center gap-3 rounded-xl border px-3.5 py-3 text-left',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300',
                          method === 'qr'
                            ? 'border-brand-300 bg-brand-50 text-ink ring-1 ring-brand-300'
                            : 'border-white/15 bg-white/[0.04] text-ink hover:bg-white/[0.08] hover:border-white/25',
                        )}
                      >
                        <Icon name="qr" className="h-5 w-5 text-link" />
                        <span className="text-base font-semibold">
                          Pay using an address or QR code
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMethodChange('wallet')}
                        aria-pressed={method === 'wallet'}
                        className={cn(
                          'flex min-h-12 items-center gap-3 rounded-xl border px-3.5 py-3 text-left',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300',
                          method === 'wallet'
                            ? 'border-brand-300 bg-brand-50 text-ink ring-1 ring-brand-300'
                            : 'border-white/15 bg-white/[0.04] text-ink hover:bg-white/[0.08] hover:border-white/25',
                        )}
                      >
                        <Icon name="wallet" className="h-5 w-5 text-link" />
                        <span className="text-base font-semibold">Pay with your wallet</span>
                      </button>
                    </div>
                  </Card>

                  {/* SECTION 6: Quote Card OR Quote Ended State */}
                  {payment &&
                    (payment.status === 'quote_ended' ? (
                      <QuoteEndedState onRefresh={handleRefreshQuote} loading={quoteLoading} />
                    ) : (
                      <QuoteCard
                        payment={payment}
                        businessName={invoice.merchant?.businessName || 'the merchant'}
                        onRefreshQuote={handleRefreshQuote}
                        onQuoteEnded={() =>
                          setPayment((curr) =>
                            curr && curr.status === 'waiting_deposit'
                              ? { ...curr, status: 'quote_ended' }
                              : curr,
                          )
                        }
                        refreshing={quoteLoading}
                      />
                    ))}

                  {/* Payment-specific Edge States */}
                  {payment?.status === 'underpaid' && (
                    <UnderpaidState
                      receivedToken={payment.receivedToken}
                      totalToSendToken={payment.totalToSendToken}
                      shortfallTokenAmount={payment.shortfallTokenAmount}
                      token={payment.token}
                      chainName={payment.chainName}
                      onCheckStatus={handleCheckStatus}
                      checking={checkingStatus}
                    />
                  )}

                  {payment?.status === 'overpaid' && (
                    <OverpaidState
                      excessTokenAmount={payment.excessTokenAmount}
                      token={payment.token}
                      merchantReceivesUsd={payment.merchantReceivesUsd}
                      returnAddress={payment.returnAddress || returnAddrState.address}
                      returnStatus={payment.returnStatus}
                      invoiceId={invoice.id}
                      paymentId={payment.id}
                      onFocusReturnAddress={focusReturnAddress}
                      onCheckStatus={handleCheckStatus}
                      checking={checkingStatus}
                    />
                  )}

                  {payment?.status === 'swap_failed' && (
                    <SwapFailedReturningState
                      receivedToken={payment.receivedToken}
                      token={payment.token}
                      chainName={payment.chainName}
                      returnAddress={payment.returnAddress || returnAddrState.address}
                      returnStatus={payment.returnStatus}
                      onFocusReturnAddress={focusReturnAddress}
                      onCheckStatus={handleCheckStatus}
                      checking={checkingStatus}
                    />
                  )}

                  {payment?.slowNetwork && (
                    <SlowNetworkState
                      chainName={payment.chainName}
                      onCheckStatus={handleCheckStatus}
                      checking={checkingStatus}
                    />
                  )}

                  {/* SECTION 7: Deposit Block (shown when quote is active) */}
                  {payment &&
                    payment.status !== 'quote_ended' &&
                    payment.status !== 'delivered' &&
                    payment.status !== 'swap_failed' && (
                      <DepositBlock
                        payment={payment}
                        method={method}
                        connectedWallet={
                          connectedWallet?.chain === selectedChain ? connectedWallet : null
                        }
                        onConnectWallet={handleConnectWallet}
                        onSendViaWallet={handleSendViaWallet}
                        walletBusy={walletBusy}
                      />
                    )}

                  {/* SECTION 8: Return Address Field */}
                  {payment && payment.status !== 'delivered' && (
                    <ReturnAddressCard
                      ref={returnInputRef}
                      chainName={activeNetwork.name}
                      method={method}
                      connectedWalletAddress={
                        connectedWallet?.chain === selectedChain ? connectedWallet.address : ''
                      }
                      savedAddress={payment.returnAddress || returnAddrState.address}
                      alreadyPrompted={returnAddrState.prompted}
                      forceExpand={
                        (payment.status === 'overpaid' || payment.status === 'swap_failed') &&
                        !payment.returnAddress &&
                        !returnAddrState.address
                      }
                      onSaveReturnAddress={handleSaveReturnAddress}
                      saving={savingReturn}
                    />
                  )}

                  {/* SECTION 9: Sticky Live Status Tracker */}
                  {payment && (
                    <LiveStatusTracker
                      payment={payment}
                      invoiceId={invoice.id}
                      onCheckStatus={handleCheckStatus}
                      checking={checkingStatus}
                    />
                  )}
                </div>
              )}

            {/* SECTION 10: Collapsed Line Items */}
            <Card data-animate="section" padding="none">
              <details className="group">
                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 text-base font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 rounded-2xl">
                  <span>
                    Invoice items ({invoice.items?.length || 0}) • {formatUsd(invoice.total)}
                  </span>
                  <Icon
                    name="chevron-down"
                    className="h-5 w-5 text-ink-muted group-open:rotate-180"
                  />
                </summary>

                <div className="border-t border-border-muted px-4 py-4 space-y-3">
                  <ul className="space-y-2.5">
                    {invoice.items?.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-start justify-between gap-3 text-base"
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-ink">{item.description}</p>
                          <p className="text-ink-muted">
                            {item.quantity} × {formatUsd(item.unitPrice)}
                          </p>
                        </div>
                        <span className="font-semibold text-ink">
                          {formatUsd(item.quantity * item.unitPrice)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="border-t border-border-muted pt-3 space-y-1.5 text-base">
                    {invoice.discountAmount > 0 && (
                      <>
                        <div className="flex justify-between text-ink-muted">
                          <span>Subtotal</span>
                          <span>{formatUsd(invoice.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-ink-muted">
                          <span>
                            Discount
                            {invoice.discount?.type === 'percent'
                              ? ` (${invoice.discount.value}%)`
                              : ''}
                          </span>
                          <span>- {formatUsd(invoice.discountAmount)}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between font-semibold text-ink">
                      <span>Invoice total</span>
                      <span>{formatUsd(invoice.total)}</span>
                    </div>
                  </div>

                  {invoice.note && (
                    <p className="rounded-xl bg-surface-muted p-3 text-base text-ink-muted">
                      Note: {invoice.note}
                    </p>
                  )}
                </div>
              </details>
            </Card>

            {/* SECTION 11: Trust Footer (Rule 1: Non-custodial) */}
            <footer className="py-4 text-center space-y-1">
              <p className="inline-flex items-center justify-center gap-1.5 text-base font-semibold text-ink">
                <Icon name="shield" className="h-5 w-5 text-link" />
                <span>We&apos;ll never ask for your secret words.</span>
              </p>
              <p className="text-base text-ink-muted">
                ClikPa is non-custodial and never moves money without your approval.
              </p>
            </footer>
          </>
        )}
      </main>
    </div>
  )
}
