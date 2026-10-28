import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { Icon } from '../components/Icons'
import {
  Banner,
  Button,
  Card,
  EmptyState,
  PageSkeleton,
  StatusPill,
} from '../components/ui'
import {
  formatDate,
  formatDateTime,
  formatTokenAmount,
  formatUsd,
  truncateMiddle,
} from '../utils/format'
import { useScreenReveal } from '../utils/motion'

export function InvoiceDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const pageRef = useRef(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [invoice, setInvoice] = useState(null)
  const [actionBusy, setActionBusy] = useState(false)
  const [actionError, setActionError] = useState(null)
  const [expandedProofIds, setExpandedProofIds] = useState({})

  useScreenReveal(pageRef, loading ? 'loading' : invoice?.id || 'empty')

  const loadDetail = useCallback(async () => {
    setLoading(true)
    setError(null)
    setNotFound(false)
    try {
      const res = await api.getInvoice(id)
      setInvoice(res)
    } catch (err) {
      if (err.code === 'NOT_FOUND') {
        setNotFound(true)
      } else {
        setError(err)
      }
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadDetail()
    const onMockChange = () => loadDetail()
    window.addEventListener('clikpa-mock-change', onMockChange)
    return () => window.removeEventListener('clikpa-mock-change', onMockChange)
  }, [loadDetail])

  const handleIssueDraft = async () => {
    if (!invoice) return
    setActionBusy(true)
    setActionError(null)
    try {
      await api.issueInvoice(invoice.id)
      navigate(`/invoices/${invoice.id}/share`)
    } catch (err) {
      setActionError(err)
    } finally {
      setActionBusy(false)
    }
  }

  // Rule 4: Cancel and replace marks old link Cancelled and opens prefilled replacement draft.
  const handleCancelAndReplace = async () => {
    if (!invoice) return
    setActionBusy(true)
    setActionError(null)
    try {
      const res = await api.cancelAndReplaceInvoice(invoice.id)
      navigate(`/invoices/new?draft=${res.replacementInvoice.id}`)
    } catch (err) {
      setActionError(err)
    } finally {
      setActionBusy(false)
    }
  }

  const toggleProof = (paymentId) => {
    setExpandedProofIds((curr) => ({ ...curr, [paymentId]: !curr[paymentId] }))
  }

  // Rule 4: Determine whether Cancel and replace is blocked and explain why.
  const cancelBlockedReason =
    invoice?.status === 'pending'
      ? 'Cannot cancel while a customer payment is currently underway.'
      : invoice?.amountPaid > 0 || invoice?.status === 'paid' || invoice?.status === 'partial'
        ? 'Cannot cancel because payment has already been received on this invoice.'
        : null

  return (
    <div ref={pageRef} className="mx-auto max-w-2xl space-y-5">
      <div>
        <Link
          to="/dashboard"
          className="inline-flex min-h-11 items-center gap-1.5 text-base font-medium text-link hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 rounded-lg"
        >
          <Icon name="arrow-left" className="h-4 w-4" />
          <span>Back to invoices</span>
        </Link>
      </div>

      {/* 1. LOADING */}
      {loading && <PageSkeleton lines={3} />}

      {/* 2. ERROR */}
      {!loading && error && (
        <Banner
          variant="error"
          title="Could not load invoice"
          reassurance="Your invoice and payment records remain safe."
          actionLabel="Try again"
          onAction={loadDetail}
        >
          {error.message}
        </Banner>
      )}

      {/* 3. EMPTY / NOT FOUND */}
      {!loading && !error && notFound && (
        <EmptyState
          icon="doc"
          title="Invoice not found"
          description="This invoice could not be found in your account."
          actionLabel="Back to dashboard"
          actionTo="/dashboard"
        />
      )}

      {/* 4. SUCCESS */}
      {!loading && !error && !notFound && invoice && (
        <>
          {actionError && (
            <Banner
              variant="error"
              title="Action could not be completed"
              reassurance="Your invoice was not changed."
              actionLabel="Reload invoice"
              onAction={loadDetail}
            >
              {actionError.message}
            </Banner>
          )}

          {/* Header Summary Card + Consistent Top-Right StatusPill */}
          <Card data-animate="section" className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-base font-medium text-ink-muted">{invoice.invoiceNumber}</p>
                <h1 className="font-heading text-2xl sm:text-3xl font-bold text-ink truncate">
                  {invoice.customerName || 'Unnamed customer'}
                </h1>
                {(invoice.customerEmail || invoice.customerPhone) && (
                  <p className="mt-0.5 text-base text-ink-muted">
                    {[invoice.customerPhone, invoice.customerEmail].filter(Boolean).join(' • ')}
                  </p>
                )}
              </div>

              <StatusPill status={invoice.status} />
            </div>

            {/* Received & Remaining Amounts (Plain business language) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl bg-surface-muted p-4 border border-border-muted">
              <div>
                <p className="text-base text-ink-muted">Agreed total</p>
                <p className="font-heading text-xl font-bold text-ink">
                  {formatUsd(invoice.total)}
                </p>
              </div>
              <div>
                <p className="text-base text-ink-muted">Received</p>
                <p className="font-heading text-xl font-bold text-status-paid-text">
                  {formatUsd(invoice.amountPaid)}
                </p>
              </div>
              <div>
                <p className="text-base text-ink-muted">Remaining</p>
                <p className="font-heading text-xl font-bold text-ink">
                  {formatUsd(invoice.amountRemaining)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap justify-between gap-2 text-base text-ink-muted">
              <span>
                {invoice.allowInstalments ? 'Instalments allowed' : 'Full payment only'}
              </span>
              {invoice.dueDate && <span>Due {formatDate(invoice.dueDate)}</span>}
            </div>

            {invoice.replacesInvoiceId && (
              <p className="text-base text-ink-muted">
                Replaces cancelled invoice{' '}
                <Link
                  to={`/invoices/${invoice.replacesInvoiceId}`}
                  className="font-semibold text-link underline"
                >
                  {invoice.replacesInvoiceId}
                </Link>
                .
              </p>
            )}

            {invoice.status === 'cancelled' && invoice.replacementInvoiceId && (
              <Banner
                variant="warning"
                title="Cancelled and replaced"
                actionLabel="Open replacement invoice"
                actionTo={`/invoices/${invoice.replacementInvoiceId}`}
              >
                Customers who open the old payment link see that this invoice was cancelled and are guided to your replacement invoice.
              </Banner>
            )}

            {/* Primary & Secondary Actions (Strictly 1 primary button per view) */}
            {invoice.status === 'draft' && (
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleIssueDraft}
                  loading={actionBusy}
                >
                  Issue &amp; share invoice
                </Button>
                <Button
                  as={Link}
                  to={`/invoices/new?draft=${invoice.id}`}
                  variant="secondary"
                  size="lg"
                >
                  Edit draft
                </Button>
              </div>
            )}

            {invoice.status !== 'draft' && invoice.status !== 'cancelled' && (
              <div className="space-y-3 border-t border-border-muted pt-4">
                <div className="flex flex-wrap items-center gap-3">
                  {invoice.status === 'paid' ? (
                    <Button
                      as={Link}
                      to={`/receipt/${invoice.id}`}
                      variant="primary"
                      size="lg"
                    >
                      <Icon name="doc" className="h-5 w-5" />
                      <span>View official receipt</span>
                    </Button>
                  ) : (
                    <Button
                      as={Link}
                      to={`/invoices/${invoice.id}/share`}
                      variant="primary"
                      size="lg"
                    >
                      <Icon name="share" className="h-5 w-5" />
                      <span>Share payment link</span>
                    </Button>
                  )}

                  <Button
                    variant="secondary"
                    size="lg"
                    disabled={Boolean(cancelBlockedReason)}
                    loading={actionBusy}
                    onClick={handleCancelAndReplace}
                  >
                    Cancel and replace
                  </Button>
                </div>

                {cancelBlockedReason ? (
                  <p className="text-base text-ink-muted">{cancelBlockedReason}</p>
                ) : (
                  <p className="text-base text-ink-muted">
                    Issued invoices cannot be edited directly. Cancel and replace marks the old link cancelled and points customers to your updated invoice.
                  </p>
                )}
              </div>
            )}
          </Card>

          {/* Line Items Breakdown */}
          <Card data-animate="section" className="space-y-4">
            <h2 className="font-heading text-lg font-semibold text-ink">Items</h2>
            <ul className="space-y-3">
              {invoice.items?.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-3 text-base">
                  <div>
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
                      {invoice.discount?.type === 'percent' ? ` (${invoice.discount.value}%)` : ''}
                    </span>
                    <span>- {formatUsd(invoice.discountAmount)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between font-bold text-ink">
                <span>Total (you receive)</span>
                <span>{formatUsd(invoice.total)}</span>
              </div>
            </div>

            {invoice.note && (
              <p className="rounded-xl bg-surface-muted p-3 text-base text-ink-muted">
                Note: {invoice.note}
              </p>
            )}
          </Card>

          {/* Payments Received — Plain language first; chain/token/hash ONLY behind "Proof of payment" */}
          <Card data-animate="section" className="space-y-4">
            <h2 className="font-heading text-lg font-semibold text-ink">Payment history</h2>

            {!invoice.payments || invoice.payments.length === 0 ? (
              <p className="text-base text-ink-muted">
                No payments recorded yet. Share the payment link with your customer when ready.
              </p>
            ) : (
              <ul className="space-y-3">
                {invoice.payments.map((p, idx) => {
                  const proofOpen = Boolean(expandedProofIds[p.id])
                  return (
                    <li
                      key={p.id}
                      className="rounded-xl border border-border-muted bg-surface-muted p-4 space-y-3"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-ink">
                            Payment #{idx + 1} • {formatUsd(p.merchantReceivesUsd)}
                          </p>
                          <p className="text-base text-ink-muted">
                            {p.completedAt
                              ? `Received ${formatDateTime(p.completedAt)}`
                              : `Started ${formatDateTime(p.createdAt)}`}
                          </p>
                        </div>
                        <StatusPill status={p.status} />
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-base">
                        {p.status === 'delivered' && (
                          <Link
                            to={`/receipt/${invoice.id}?paymentId=${p.id}`}
                            className="font-semibold text-link underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 rounded-sm"
                          >
                            View receipt
                          </Link>
                        )}

                        <button
                          type="button"
                          onClick={() => toggleProof(p.id)}
                          aria-expanded={proofOpen}
                          className="min-h-11 font-semibold text-link hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 rounded-sm"
                        >
                          {proofOpen ? 'Hide proof of payment' : 'Proof of payment'}
                        </button>
                      </div>

                      {proofOpen && (
                        <div className="rounded-lg border border-white/10 bg-black/25 p-3 space-y-1.5 text-base">
                          <div className="flex flex-wrap justify-between gap-2">
                            <span className="text-ink-muted">Network &amp; currency sent</span>
                            <span className="font-medium text-ink">
                              {formatTokenAmount(p.totalToSendToken, p.token)} on {p.chainName}
                            </span>
                          </div>
                          {p.txHashIn && (
                            <div className="flex flex-wrap justify-between gap-2">
                              <span className="text-ink-muted">Incoming reference</span>
                              <span className="font-mono text-ink">
                                {truncateMiddle(p.txHashIn, 10, 8)}
                              </span>
                            </div>
                          )}
                          {p.txHashOut && (
                            <div className="flex flex-wrap justify-between gap-2">
                              <span className="text-ink-muted">Settlement reference</span>
                              <span className="font-mono text-ink">
                                {truncateMiddle(p.txHashOut, 10, 8)}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
