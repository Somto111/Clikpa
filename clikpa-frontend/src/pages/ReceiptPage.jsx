import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import { Logo } from '../components/Logo'
import { Icon } from '../components/Icons'
import {
  Banner,
  Button,
  Card,
  EmptyState,
  PageSkeleton,
  StatusPill,
} from '../components/ui'
import { formatDate, formatDateTime, formatTokenAmount, formatUsd, truncateMiddle } from '../utils/format'
import { useScreenReveal } from '../utils/motion'

export function ReceiptPage() {
  const { invoiceId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedPaymentId = searchParams.get('paymentId')
  const pageRef = useRef(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [showProof, setShowProof] = useState(false)
  const [copiedHash, setCopiedHash] = useState(false)

  useScreenReveal(pageRef, loading ? 'loading' : data?.invoice?.id || 'empty')

  const loadReceipt = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const lookupId = requestedPaymentId || invoiceId
      const res = await api.getPublicReceipt(lookupId)
      setData(res)
    } catch (err) {
      if (err.code === 'RECEIPT_NOT_FOUND' || err.code === 'NOT_FOUND') {
        setData(null)
      } else {
        setError(err)
      }
    } finally {
      setLoading(false)
    }
  }, [invoiceId, requestedPaymentId])

  useEffect(() => {
    loadReceipt()
    const onMockChange = () => loadReceipt()
    window.addEventListener('clikpa-mock-change', onMockChange)
    return () => window.removeEventListener('clikpa-mock-change', onMockChange)
  }, [loadReceipt])

  const invoice = data?.invoice
  const merchant = data?.merchant
  const receipts = data?.receipts || []
  const activeReceipt =
    (requestedPaymentId && receipts.find((r) => r.paymentId === requestedPaymentId)) ||
    data?.activeReceipt ||
    receipts[0] ||
    null

  const copyHash = async (hash) => {
    if (!hash) return
    try {
      await navigator.clipboard.writeText(hash)
      setCopiedHash(true)
      setTimeout(() => setCopiedHash(false), 2200)
    } catch {
      // Ignore clipboard restriction
    }
  }

  return (
    <div ref={pageRef} className="min-h-screen bg-surface-muted print:bg-white print:text-black">
      <header className="border-b border-border-muted bg-surface print:hidden">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3.5">
          <Logo to="/" />
          {invoice && (
            <Link
              to={`/pay/${invoice.id}`}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-base font-medium text-brand hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <Icon name="arrow-left" className="h-4 w-4" />
              <span>Invoice page</span>
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-5 px-4 py-6 sm:py-8 print:max-w-none print:p-0">
        {/* 1. LOADING */}
        {loading && <PageSkeleton lines={3} />}

        {/* 2. ERROR */}
        {!loading && error && (
          <Banner
            variant="error"
            title="Could not load receipt"
            reassurance="Confirmed payments remain permanently recorded on your invoice."
            actionLabel="Retry"
            onAction={loadReceipt}
          >
            {error.message}
          </Banner>
        )}

        {/* 3. EMPTY (No confirmed payment yet or unknown ID) */}
        {!loading && !error && (!invoice || !activeReceipt) && (
          <EmptyState
            icon="doc"
            title="No payment receipt yet"
            description="Receipts appear here as soon as a payment is confirmed."
            actionLabel="Go to payment page"
            actionTo={`/pay/${invoiceId}`}
          />
        )}

        {/* 4. SUCCESS */}
        {!loading && !error && invoice && activeReceipt && (
          <>
            {/* Multiple instalment receipt selector (hidden when printing) */}
            {receipts.length > 1 && (
              <Card data-animate="section" variant="muted" className="space-y-2 print:hidden">
                <p className="text-base font-semibold text-ink">
                  Instalment receipts ({receipts.length} payments recorded)
                </p>
                <div className="flex flex-wrap gap-2">
                  {receipts.map((rcp, idx) => {
                    const selected = rcp.paymentId === activeReceipt.paymentId
                    return (
                      <Button
                        key={rcp.paymentId}
                        variant={selected ? 'primary' : 'secondary'}
                        onClick={() => setSearchParams({ paymentId: rcp.paymentId })}
                      >
                        Payment #{idx + 1} • {formatUsd(rcp.invoiceAmountUsd)}
                      </Button>
                    )
                  })}
                </div>
              </Card>
            )}

            {/* Printable A4/Letter Receipt Sheet */}
            <Card
              data-animate="section"
              padding="lg"
              className="space-y-6 bg-surface print:rounded-none print:border-black/30 print:bg-white print:text-black print:shadow-none"
            >
              {/* Top Header + Consistent Top-Right StatusPill */}
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border-muted pb-5 print:border-black/25">
                <div className="space-y-1">
                  <p className="text-base font-medium text-ink-muted print:text-black">
                    Payment Receipt • {activeReceipt.receiptNumber}
                  </p>
                  <h1 className="font-heading text-2xl font-bold text-ink print:text-black">
                    {merchant?.businessName}
                  </h1>
                  <p className="text-base text-ink-muted print:text-black">
                    {merchant?.city} • Verified ID: {merchant?.verifiedMerchantId}
                  </p>
                </div>

                <StatusPill status={invoice.status} />
              </div>

              {/* Amount Paid Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl bg-surface-muted p-4 border border-border-muted print:bg-white print:border-black/25">
                <div>
                  <p className="text-base text-ink-muted print:text-black">This payment credited</p>
                  <p className="font-heading text-3xl font-bold text-ink print:text-black">
                    {formatUsd(activeReceipt.invoiceAmountUsd)}
                  </p>
                  <p className="mt-1 text-base text-ink-muted print:text-black">
                    Paid on {formatDateTime(activeReceipt.paidAt)}
                  </p>
                </div>

                {/* Rule 7: Show received and remaining amounts clearly */}
                <div className="space-y-1 sm:text-right">
                  <p className="text-base text-ink-muted print:text-black">
                    Invoice {invoice.invoiceNumber}
                  </p>
                  <p className="text-base font-medium text-ink print:text-black">
                    Total received: {formatUsd(invoice.amountPaid)} of {formatUsd(invoice.total)}
                  </p>
                  <p className="text-base font-semibold text-ink print:text-black">
                    Remaining balance: {formatUsd(invoice.amountRemaining)}
                  </p>
                </div>
              </div>

              {/* Payer & Invoice Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base">
                <div>
                  <p className="font-medium text-ink-muted print:text-black">Billed to</p>
                  <p className="font-semibold text-ink print:text-black">
                    {invoice.customerName || 'Customer'}
                  </p>
                  {invoice.customerEmail && (
                    <p className="text-ink-muted print:text-black">{invoice.customerEmail}</p>
                  )}
                </div>
                <div className="sm:text-right">
                  <p className="font-medium text-ink-muted print:text-black">Invoice date</p>
                  <p className="font-semibold text-ink print:text-black">
                    {formatDate(invoice.issuedAt || invoice.createdAt)}
                  </p>
                </div>
              </div>

              {/* Itemized Breakdown (Rule 10: Discount if present, NO tax calculation) */}
              <div className="space-y-3 border-t border-border-muted pt-5 print:border-black/25">
                <h2 className="font-heading text-base font-semibold text-ink print:text-black">
                  Invoice summary
                </h2>
                <ul className="space-y-2.5">
                  {invoice.items?.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-start justify-between gap-4 text-base"
                    >
                      <div>
                        <p className="font-medium text-ink print:text-black">{item.description}</p>
                        <p className="text-ink-muted print:text-black">
                          {item.quantity} × {formatUsd(item.unitPrice)}
                        </p>
                      </div>
                      <span className="font-semibold text-ink print:text-black">
                        {formatUsd(item.quantity * item.unitPrice)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="border-t border-border-muted pt-3 space-y-1.5 text-base print:border-black/25">
                  {invoice.discountAmount > 0 && (
                    <>
                      <div className="flex justify-between text-ink-muted print:text-black">
                        <span>Subtotal</span>
                        <span>{formatUsd(invoice.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-ink-muted print:text-black">
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
                  <div className="flex justify-between font-semibold text-ink print:text-black">
                    <span>Agreed invoice total</span>
                    <span>{formatUsd(invoice.total)}</span>
                  </div>
                  <div className="flex justify-between text-ink-muted print:text-black">
                    <span>Customer payment charges paid</span>
                    <span>{formatUsd(activeReceipt.feeUsd)}</span>
                  </div>
                </div>
              </div>

              {/* Chains, tokens & hashes tucked behind "Proof of payment" */}
              <div className="border-t border-border-muted pt-4 print:border-black/25">
                <button
                  type="button"
                  onClick={() => setShowProof((v) => !v)}
                  aria-expanded={showProof}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-base font-semibold text-brand hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand print:hidden"
                >
                  <span>{showProof ? 'Hide proof of payment' : 'Proof of payment'}</span>
                  <Icon
                    name="chevron-down"
                    className={`h-4 w-4 ${showProof ? 'rotate-180' : ''}`}
                  />
                </button>

                {showProof && (
                  <div className="mt-3 rounded-xl border border-border-muted bg-surface-muted p-4 space-y-2 text-base print:border-black/25 print:bg-white print:text-black">
                    <div className="flex flex-wrap justify-between gap-2">
                      <span className="text-ink-muted print:text-black">Sent by customer</span>
                      <span className="font-semibold text-ink print:text-black">
                        {formatTokenAmount(activeReceipt.totalSentToken, activeReceipt.token)} on{' '}
                        {activeReceipt.chainName} ({activeReceipt.chainBadge})
                      </span>
                    </div>
                    {activeReceipt.txHashIn && (
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-ink-muted print:text-black">Transaction reference</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-ink print:text-black">
                            {truncateMiddle(activeReceipt.txHashIn, 10, 8)}
                          </span>
                          <Button
                            variant="secondary"
                            onClick={() => copyHash(activeReceipt.txHashIn)}
                            aria-label="Copy full transaction hash"
                            className="print:hidden"
                          >
                            <Icon name={copiedHash ? 'check-circle' : 'copy'} className="h-4 w-4" />
                            <span>{copiedHash ? 'Copied' : 'Copy'}</span>
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Primary Action: Print Receipt (hidden in print) */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 print:hidden">
                <Button variant="primary" size="lg" onClick={() => window.print()}>
                  <Icon name="print" className="h-5 w-5" />
                  <span>Print or save PDF</span>
                </Button>

                {invoice.amountRemaining > 0 && (
                  <Button as={Link} to={`/pay/${invoice.id}`} variant="secondary" size="lg">
                    Pay remaining {formatUsd(invoice.amountRemaining)}
                  </Button>
                )}
              </div>
            </Card>
          </>
        )}
      </main>
    </div>
  )
}
