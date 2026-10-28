import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import { getMockOverrides } from '../api/mock'
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
import { calculateInvoiceTotals, formatUsd } from '../utils/format'
import { useScreenReveal } from '../utils/motion'
import { cn } from '../utils/cn'

function defaultDueDateInput() {
  const d = new Date(Date.now() + 7 * 86400 * 1000)
  return d.toISOString().slice(0, 10)
}

export function CreateInvoicePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const draftId = searchParams.get('draft')
  const pageRef = useRef(null)

  const [loading, setLoading] = useState(Boolean(draftId))
  const [loadError, setLoadError] = useState(null)
  const [lockedIssuedInvoice, setLockedIssuedInvoice] = useState(null)

  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [dueDate, setDueDate] = useState(defaultDueDateInput)
  const [note, setNote] = useState('')

  const [items, setItems] = useState([
    { id: 'item-1', description: '', quantity: '1', unitPrice: '' },
  ])

  // Rule 10: Single optional Discount field with amount ($) or percent (%) toggle; NO tax calculation.
  const [discountType, setDiscountType] = useState('amount') // 'amount' | 'percent'
  const [discountValue, setDiscountValue] = useState('')

  // Rule 7: Default is Full payment only (allowInstalments = false)
  const [allowInstalments, setAllowInstalments] = useState(false)

  const [savingDraft, setSavingDraft] = useState(false)
  const [issuing, setIssuing] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  useScreenReveal(pageRef, loading ? 'loading' : draftId || 'new')

  const loadDraftIfNeeded = useCallback(async () => {
    const overrides = getMockOverrides()
    if (overrides.screenState === 'loading' || overrides.screenState === 'error' || draftId) {
      setLoading(true)
      setLoadError(null)
      try {
        if (draftId) {
          const inv = await api.getInvoice(draftId)
          // Rule 4: Issued invoices cannot be edited
          if (inv.status !== 'draft') {
            setLockedIssuedInvoice(inv)
            return
          }
          setCustomerName(inv.customerName || '')
          setCustomerPhone(inv.customerPhone || '')
          setCustomerEmail(inv.customerEmail || '')
          setDueDate(inv.dueDate ? inv.dueDate.slice(0, 10) : defaultDueDateInput())
          setNote(inv.note || '')
          setItems(
            inv.items?.length
              ? inv.items.map((it) => ({
                  id: it.id,
                  description: it.description,
                  quantity: String(it.quantity),
                  unitPrice: String(it.unitPrice),
                }))
              : [],
          )
          if (inv.discount?.value) {
            setDiscountType(inv.discount.type)
            setDiscountValue(String(inv.discount.value))
          }
          setAllowInstalments(Boolean(inv.allowInstalments))
        } else {
          // Respect mock loading/error/empty screen states even on /invoices/new
          await api.getMe()
          if (overrides.screenState === 'empty') {
            setItems([])
          }
        }
      } catch (err) {
        setLoadError(err)
      } finally {
        setLoading(false)
      }
    }
  }, [draftId])

  useEffect(() => {
    loadDraftIfNeeded()
    const onMockChange = () => loadDraftIfNeeded()
    window.addEventListener('clikpa-mock-change', onMockChange)
    return () => window.removeEventListener('clikpa-mock-change', onMockChange)
  }, [loadDraftIfNeeded])

  const totals = useMemo(() => {
    const discountObj =
      Number(discountValue) > 0 ? { type: discountType, value: Number(discountValue) } : null
    return calculateInvoiceTotals(items, discountObj)
  }, [items, discountType, discountValue])

  const updateItem = (id, key, val) => {
    setItems((curr) => curr.map((it) => (it.id === id ? { ...it, [key]: val } : it)))
    setFieldErrors((curr) => ({ ...curr, items: undefined }))
  }

  const addItem = () => {
    setItems((curr) => [
      ...curr,
      { id: `item-${Date.now()}`, description: '', quantity: '1', unitPrice: '' },
    ])
  }

  const removeItem = (id) => {
    setItems((curr) => curr.filter((it) => it.id !== id))
  }

  const buildPayload = () => ({
    customerName: customerName.trim(),
    customerPhone: customerPhone.trim(),
    customerEmail: customerEmail.trim(),
    dueDate: dueDate ? new Date(`${dueDate}T23:59:59Z`).toISOString() : null,
    note: note.trim(),
    allowInstalments,
    items: items
      .filter((it) => it.description.trim() || Number(it.unitPrice) > 0)
      .map((it) => ({
        id: it.id,
        description: it.description.trim() || 'Item',
        quantity: Math.max(1, Number(it.quantity) || 1),
        unitPrice: Math.max(0, Number(it.unitPrice) || 0),
      })),
    discount:
      Number(discountValue) > 0
        ? { type: discountType, value: Number(discountValue) }
        : null,
  })

  const validateForIssue = () => {
    const errs = {}
    if (!customerName.trim()) {
      errs.customerName = 'Enter your customer’s name.'
    }
    const validItems = items.filter(
      (it) => it.description.trim() && Number(it.quantity) > 0 && Number(it.unitPrice) > 0,
    )
    if (validItems.length === 0) {
      errs.items = 'Add at least one item with a description and dollar price.'
    }
    if (discountType === 'percent' && Number(discountValue) > 100) {
      errs.discount = 'Percentage discount cannot exceed 100%.'
    }
    if (totals.total <= 0) {
      errs.total = 'Final invoice total must be greater than $0.00.'
    }
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSaveDraft = async () => {
    setSavingDraft(true)
    setSubmitError(null)
    try {
      const payload = buildPayload()
      const saved = draftId
        ? await api.updateInvoiceDraft(draftId, payload)
        : await api.createInvoiceDraft(payload)
      navigate(`/invoices/${saved.id}`)
    } catch (err) {
      setSubmitError(err)
    } finally {
      setSavingDraft(false)
    }
  }

  const handleIssueAndShare = async (e) => {
    e.preventDefault()
    if (!validateForIssue()) return
    setIssuing(true)
    setSubmitError(null)
    try {
      const payload = buildPayload()
      const savedDraft = draftId
        ? await api.updateInvoiceDraft(draftId, payload)
        : await api.createInvoiceDraft(payload)
      const issued = await api.issueInvoice(savedDraft.id)
      navigate(`/invoices/${issued.id}/share`)
    } catch (err) {
      setSubmitError(err)
    } finally {
      setIssuing(false)
    }
  }

  return (
    <div ref={pageRef} className="mx-auto max-w-2xl space-y-5">
      {/* Header + Consistent Top-Right StatusPill */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link
            to="/dashboard"
            className="inline-flex min-h-11 items-center gap-1.5 text-base font-medium text-link hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 rounded-lg"
          >
            <Icon name="arrow-left" className="h-4 w-4" />
            <span>Back to invoices</span>
          </Link>
          <h1 className="mt-1 font-heading text-2xl sm:text-3xl font-bold text-ink">
            {draftId ? 'Edit draft invoice' : 'Create invoice'}
          </h1>
        </div>
        <StatusPill status="draft" />
      </div>

      {/* 1. LOADING */}
      {loading && <PageSkeleton lines={3} />}

      {/* 2. ERROR */}
      {!loading && loadError && (
        <Banner
          variant="error"
          title="Could not open invoice editor"
          reassurance="Any existing drafts or invoices in your account are untouched."
          actionLabel="Try again"
          onAction={loadDraftIfNeeded}
        >
          {loadError.message}
        </Banner>
      )}

      {/* Rule 4: Block editing if invoice was already issued */}
      {!loading && !loadError && lockedIssuedInvoice && (
        <Banner
          variant="warning"
          title="Issued invoices cannot be edited"
          reassurance="Keeping issued invoices fixed protects both you and your customer."
          actionLabel="Open invoice to cancel and replace"
          actionTo={`/invoices/${lockedIssuedInvoice.id}`}
        >
          Invoice {lockedIssuedInvoice.invoiceNumber} has already been issued. If no payment has started, you can cancel and replace it from its detail page.
        </Banner>
      )}

      {/* 4. FORM / EMPTY LINE ITEMS */}
      {!loading && !loadError && !lockedIssuedInvoice && (
        <form onSubmit={handleIssueAndShare} noValidate className="space-y-5">
          {submitError && (
            <Banner
              variant="error"
              title="Could not save invoice"
              reassurance="Nothing has been sent to your customer yet."
              actionLabel="Retry issuing"
              onAction={() => handleIssueAndShare({ preventDefault: () => {} })}
            >
              {submitError.message}
            </Banner>
          )}

          {/* Customer Details */}
          <Card data-animate="section" className="space-y-4">
            <h2 className="font-heading text-lg font-semibold text-ink">Customer details</h2>

            <Input
              label="Customer or business name"
              placeholder="e.g. Kwame Mensah"
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value)
                if (fieldErrors.customerName) {
                  setFieldErrors((c) => ({ ...c, customerName: undefined }))
                }
              }}
              error={fieldErrors.customerName}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="WhatsApp number (optional)"
                type="tel"
                placeholder="e.g. +233 24 481 9200"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                hint="Pre-fills WhatsApp when sharing"
              />
              <Input
                label="Email address (optional)"
                type="email"
                placeholder="e.g. kwame@accrastudio.gh"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
              />
            </div>

            <Input
              label="Due date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              hint="Passing the due date marks the invoice Overdue; the dollar amount stays fixed."
            />
          </Card>

          {/* Line Items (with Empty State if all items removed) */}
          <Card data-animate="section" className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-heading text-lg font-semibold text-ink">
                Items (priced in US dollars)
              </h2>
              <Button variant="secondary" onClick={addItem}>
                <Icon name="plus" className="h-4 w-4" />
                <span>Add item</span>
              </Button>
            </div>

            {items.length === 0 ? (
              <EmptyState
                icon="doc"
                title="No items on this invoice yet"
                description="Add at least one product or service in dollars."
                actionLabel="Add first item"
                onAction={addItem}
              />
            ) : (
              <div className="space-y-4">
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-border-muted bg-surface-muted p-3.5 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-base font-semibold text-ink">Item #{idx + 1}</span>
                      {items.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                          aria-label={`Remove item ${idx + 1}`}
                        >
                          <Icon name="trash" className="h-4 w-4 text-status-failed-text" />
                        </Button>
                      )}
                    </div>

                    <Input
                      label="Description"
                      placeholder="e.g. Handwoven Aso-Oke Bundle"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Quantity"
                        type="number"
                        inputMode="numeric"
                        min="1"
                        step="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                      />
                      <Input
                        label="Unit price (USD)"
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, 'unitPrice', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {fieldErrors.items && (
              <p role="alert" className="text-base font-medium text-status-failed-text">
                {fieldErrors.items}
              </p>
            )}
          </Card>

          {/* Rule 10: Single optional Discount field with $ / % toggle; NO tax calculation */}
          <Card data-animate="section" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="discount-input" className="font-heading text-lg font-semibold text-ink">
                Discount (optional)
              </label>

              <div className="inline-flex rounded-xl border border-white/12 bg-white/[0.03] p-1">
                <button
                  type="button"
                  onClick={() => setDiscountType('amount')}
                  aria-pressed={discountType === 'amount'}
                  className={cn(
                    'min-h-11 rounded-lg px-3.5 text-base font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300',
                    discountType === 'amount' ? 'bg-brand text-on-brand' : 'text-ink',
                  )}
                >
                  $ Amount
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountType('percent')}
                  aria-pressed={discountType === 'percent'}
                  className={cn(
                    'min-h-11 rounded-lg px-3.5 text-base font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300',
                    discountType === 'percent' ? 'bg-brand text-on-brand' : 'text-ink',
                  )}
                >
                  % Percent
                </button>
              </div>
            </div>

            <Input
              id="discount-input"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder={discountType === 'percent' ? 'e.g. 10' : 'e.g. 15.00'}
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              error={fieldErrors.discount}
              hint="Entered before issuing. Once issued, discounts and amounts stay locked."
            />

            {/* Totals Breakdown — Rule 2 & Rule 10 */}
            <div className="rounded-xl bg-brand-50/60 border border-brand-200 p-4 space-y-2">
              <div className="flex justify-between text-base text-ink-muted">
                <span>Subtotal</span>
                <span>{formatUsd(totals.subtotal)}</span>
              </div>
              {totals.discountAmount > 0 && (
                <div className="flex justify-between text-base text-ink-muted">
                  <span>Discount</span>
                  <span>- {formatUsd(totals.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-brand-200 pt-2 text-lg font-bold text-ink">
                <span>You will receive</span>
                <span>{formatUsd(totals.total)}</span>
              </div>
              <p className="text-base text-ink-muted">
                Your customer pays the payment processing charges — you receive the full{' '}
                <strong className="font-semibold text-ink">{formatUsd(totals.total)}</strong> in digital dollars.
              </p>
              {fieldErrors.total && (
                <p role="alert" className="text-base font-medium text-status-failed-text">
                  {fieldErrors.total}
                </p>
              )}
            </div>
          </Card>

          {/* Rule 7: Payment Schedule (Default: Full payment only) + Note */}
          <Card data-animate="section" className="space-y-4">
            <h2 className="font-heading text-lg font-semibold text-ink">Payment options &amp; note</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setAllowInstalments(false)}
                aria-pressed={!allowInstalments}
                className={cn(
                  'flex min-h-12 flex-col items-start justify-center rounded-xl border p-3.5 text-left',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300',
                  !allowInstalments
                    ? 'border-brand-300 bg-brand-50 ring-1 ring-brand-300'
                    : 'border-white/15 bg-white/[0.04]',
                )}
              >
                <span className="text-base font-semibold text-ink">Full payment only</span>
                <span className="text-xs text-ink-muted">Customer pays the entire amount at once</span>
              </button>

              <button
                type="button"
                onClick={() => setAllowInstalments(true)}
                aria-pressed={allowInstalments}
                className={cn(
                  'flex min-h-12 flex-col items-start justify-center rounded-xl border p-3.5 text-left',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300',
                  allowInstalments
                    ? 'border-brand-300 bg-brand-50 ring-1 ring-brand-300'
                    : 'border-white/15 bg-white/[0.04]',
                )}
              >
                <span className="text-base font-semibold text-ink">Allow instalments</span>
                <span className="text-xs text-ink-muted">Customer can pay in parts up to balance</span>
              </button>
            </div>

            <Input
              as="textarea"
              label="Note to customer (optional)"
              placeholder="e.g. Delivery leaves Lagos within 24 hours of payment."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </Card>

          {/* Actions: One Primary CTA ("Issue & share invoice"), One Secondary ("Save draft") */}
          <div className="flex flex-col sm:flex-row-reverse items-stretch sm:items-center gap-3 pt-1">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="sm:flex-1"
              loading={issuing}
            >
              Issue &amp; share invoice
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={handleSaveDraft}
              loading={savingDraft}
            >
              Save draft
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
