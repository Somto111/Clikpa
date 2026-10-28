import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { Icon } from '../components/Icons'
import {
  Banner,
  Button,
  Card,
  EmptyState,
  PageSkeleton,
  QrCodeBox,
  StatusPill,
} from '../components/ui'
import {
  buildEmailShareUrl,
  buildWhatsAppShareUrl,
  formatDate,
  formatUsd,
  getPayUrl,
  truncateMiddle,
} from '../utils/format'
import { popElement, useScreenReveal } from '../utils/motion'

export function ShareInvoicePage() {
  const { id } = useParams()
  const { user } = useAuth()
  const pageRef = useRef(null)
  const copyBtnRef = useRef(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [invoice, setInvoice] = useState(null)
  const [issuing, setIssuing] = useState(false)
  const [copied, setCopied] = useState(false)
  // Rule 5: Track prepared draft notice — NEVER claim "Sent".
  const [shareNotice, setShareNotice] = useState('')
  const [showQr, setShowQr] = useState(false)

  useScreenReveal(pageRef, loading ? 'loading' : invoice?.id || 'empty')

  const loadInvoice = useCallback(async () => {
    setLoading(true)
    setError(null)
    setNotFound(false)
    try {
      const inv = await api.getInvoice(id)
      setInvoice(inv)
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
    loadInvoice()
    const onMockChange = () => loadInvoice()
    window.addEventListener('clikpa-mock-change', onMockChange)
    return () => window.removeEventListener('clikpa-mock-change', onMockChange)
  }, [loadInvoice])

  const handleIssueDraftFirst = async () => {
    if (!invoice) return
    setIssuing(true)
    setError(null)
    try {
      const issued = await api.issueInvoice(invoice.id)
      setInvoice({ ...invoice, ...issued })
    } catch (err) {
      setError(err)
    } finally {
      setIssuing(false)
    }
  }

  const payUrl = invoice ? getPayUrl(invoice.id) : ''
  const businessName = user?.businessName || 'Adebayo Fabrics & Tailoring'

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(payUrl)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = payUrl
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    popElement(copyBtnRef)
    setTimeout(() => setCopied(false), 2400)
  }

  // Rule 5: Opening wa.me or mailto does NOT mean sent. Never show "Sent".
  const handleWhatsAppClick = () => {
    const url = buildWhatsAppShareUrl({
      phone: invoice.customerPhone,
      customerName: invoice.customerName,
      businessName,
      invoiceNumber: invoice.invoiceNumber,
      total: invoice.amountRemaining || invoice.total,
      dueDate: invoice.dueDate,
      payUrl,
    })
    window.open(url, '_blank', 'noopener,noreferrer')
    setShareNotice('Message ready, press send in WhatsApp.')
  }

  const handleEmailClick = () => {
    const url = buildEmailShareUrl({
      email: invoice.customerEmail,
      customerName: invoice.customerName,
      businessName,
      invoiceNumber: invoice.invoiceNumber,
      total: invoice.amountRemaining || invoice.total,
      dueDate: invoice.dueDate,
      payUrl,
    })
    window.location.href = url
    setShareNotice('Email draft ready, press send in your email app.')
  }

  return (
    <div ref={pageRef} className="mx-auto max-w-xl space-y-5">
      <div>
        <Link
          to={invoice ? `/invoices/${invoice.id}` : '/dashboard'}
          className="inline-flex min-h-11 items-center gap-1.5 text-base font-medium text-link hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 rounded-lg"
        >
          <Icon name="arrow-left" className="h-4 w-4" />
          <span>Back to invoice</span>
        </Link>
        <h1 className="mt-1 font-heading text-2xl sm:text-3xl font-bold text-ink">
          Share payment link
        </h1>
      </div>

      {/* 1. LOADING */}
      {loading && <PageSkeleton lines={3} />}

      {/* 2. ERROR */}
      {!loading && error && (
        <Banner
          variant="error"
          title="Could not load sharing options"
          reassurance="Your invoice and payment link have not changed."
          actionLabel="Try again"
          onAction={loadInvoice}
        >
          {error.message}
        </Banner>
      )}

      {/* 3. EMPTY / NOT FOUND */}
      {!loading && !error && notFound && (
        <EmptyState
          icon="doc"
          title="Invoice not found"
          description="Return to your dashboard to select an invoice to share."
          actionLabel="Back to dashboard"
          actionTo="/dashboard"
        />
      )}

      {/* 4. SUCCESS */}
      {!loading && !error && !notFound && invoice && (
        <>
          {/* Summary Card + Consistent Top-Right StatusPill */}
          <Card data-animate="section" className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-base text-ink-muted">{invoice.invoiceNumber}</p>
                <h2 className="font-heading text-xl font-bold text-ink">
                  {invoice.customerName || 'Customer'}
                </h2>
              </div>
              <StatusPill status={invoice.status} />
            </div>

            <div className="flex flex-wrap items-baseline justify-between gap-2 border-t border-border-muted pt-3">
              <div>
                <p className="text-base text-ink-muted">Amount to collect</p>
                <p className="font-heading text-2xl font-bold text-ink">
                  {formatUsd(invoice.amountRemaining || invoice.total)}
                </p>
              </div>
              {invoice.dueDate && (
                <p className="text-base text-ink-muted">Due {formatDate(invoice.dueDate)}</p>
              )}
            </div>
          </Card>

          {/* Rule 4: Drafts are not payable until issued */}
          {invoice.status === 'draft' ? (
            <Banner
              variant="warning"
              title="Issue this draft before sharing"
              reassurance="Drafts can still be edited and cannot accept customer payments yet."
              actionLabel="Issue invoice now"
              onAction={handleIssueDraftFirst}
              actionLoading={issuing}
            >
              Once you issue this invoice, its dollar amount locks and your customer can pay with the link.
            </Banner>
          ) : invoice.status === 'cancelled' ? (
            <Banner
              variant="warning"
              title="This invoice is cancelled"
              reassurance="Customers opening this old link are redirected to your replacement invoice."
              actionLabel={
                invoice.replacementInvoiceId ? 'Open replacement invoice' : 'Back to dashboard'
              }
              actionTo={
                invoice.replacementInvoiceId
                  ? `/invoices/${invoice.replacementInvoiceId}`
                  : '/dashboard'
              }
            >
              Share your updated replacement invoice instead of this cancelled one.
            </Banner>
          ) : (
            <Card data-animate="section" className="space-y-4">
              {shareNotice && (
                <Banner variant="info" title={shareNotice}>
                  Opening your messaging app prepares the message — remember to tap send inside the app so your customer receives it.
                </Banner>
              )}

              {/* Primary Button: WhatsApp-first for Ngozi */}
              <Button variant="primary" size="lg" fullWidth onClick={handleWhatsAppClick}>
                <Icon name="whatsapp" className="h-5 w-5" />
                <span>Prepare WhatsApp message</span>
              </Button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <Button variant="secondary" size="lg" onClick={handleEmailClick}>
                  <Icon name="mail" className="h-5 w-5" />
                  <span>Open email draft</span>
                </Button>

                <Button
                  ref={copyBtnRef}
                  variant="secondary"
                  size="lg"
                  onClick={handleCopyLink}
                  aria-label="Copy customer payment link"
                >
                  <Icon name={copied ? 'check-circle' : 'copy'} className="h-5 w-5" />
                  <span>{copied ? 'Link copied' : 'Copy payment link'}</span>
                </Button>
              </div>

              <div className="rounded-xl border border-border-muted bg-surface-muted p-3 flex items-center justify-between gap-2">
                <span className="font-mono text-base text-ink truncate" title={payUrl}>
                  {truncateMiddle(payUrl, 24, 12)}
                </span>
                <Link
                  to={`/pay/${invoice.id}`}
                  className="shrink-0 inline-flex min-h-11 items-center gap-1 text-base font-semibold text-link hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 rounded-lg px-2"
                >
                  <span>Preview pay page</span>
                  <Icon name="external" className="h-4 w-4" />
                </Link>
              </div>

              <div className="border-t border-border-muted pt-3">
                <Button
                  variant="ghost"
                  onClick={() => setShowQr((v) => !v)}
                  aria-label={showQr ? 'Hide in-person QR code' : 'Show in-person QR code for payment link'}
                >
                  <Icon name="qr" className="h-4 w-4" />
                  <span>{showQr ? 'Hide link QR code' : 'Show QR code for in-person customer'}</span>
                </Button>

                {showQr && (
                  <div className="pt-3">
                    <QrCodeBox value={payUrl} label="QR code for customer invoice link" />
                  </div>
                )}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
