import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
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
import { formatDate, formatUsd } from '../utils/format'
import { useScreenReveal } from '../utils/motion'
import { cn } from '../utils/cn'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'Awaiting payment' },
  { id: 'draft', label: 'Drafts' },
  { id: 'paid', label: 'Paid' },
]

export function DashboardPage() {
  const pageRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [invoices, setInvoices] = useState([])
  const [balance, setBalance] = useState(null)
  const [filter, setFilter] = useState('all')

  useScreenReveal(pageRef, loading ? 'loading' : `${invoices.length}-${filter}`)

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [invRes, balRes] = await Promise.all([api.getInvoices(), api.getBalance()])
      setInvoices(invRes?.invoices || [])
      setBalance(balRes)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboard()
    const onMockChange = () => loadDashboard()
    window.addEventListener('clikpa-mock-change', onMockChange)
    return () => window.removeEventListener('clikpa-mock-change', onMockChange)
  }, [loadDashboard])

  const filteredInvoices = useMemo(() => {
    if (filter === 'all') return invoices
    if (filter === 'open') {
      return invoices.filter((i) =>
        ['unpaid', 'overdue', 'partial', 'pending'].includes(i.status),
      )
    }
    return invoices.filter((i) => i.status === filter)
  }, [invoices, filter])

  const openBalanceTotal = useMemo(
    () =>
      invoices
        .filter((i) => ['unpaid', 'overdue', 'partial', 'pending'].includes(i.status))
        .reduce((sum, i) => sum + Number(i.amountRemaining || 0), 0),
    [invoices],
  )

  return (
    <div ref={pageRef} className="space-y-6">
      {/* Page Header + Single Primary CTA */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-ink">Invoices</h1>
          <p className="text-base text-ink-muted">
            Create dollar invoices, share on WhatsApp, and withdraw to naira.
          </p>
        </div>

        <Button as={Link} to="/invoices/new" variant="primary" size="lg">
          <Icon name="plus" className="h-5 w-5" />
          <span>Create invoice</span>
        </Button>
      </div>

      {/* 1. LOADING */}
      {loading && <PageSkeleton lines={4} />}

      {/* 2. ERROR */}
      {!loading && error && (
        <Banner
          variant="error"
          title="Could not load your dashboard"
          reassurance="Your digital dollar balance and existing invoice links are safe."
          actionLabel="Try again"
          onAction={loadDashboard}
        >
          {error.message}
        </Banner>
      )}

      {/* 3. EMPTY STATE */}
      {!loading && !error && invoices.length === 0 && (
        <EmptyState
          icon="doc"
          title="Create your first invoice"
          description="Send a simple payment link on WhatsApp or email. Your customer pays in their preferred currency and you receive digital dollars."
          actionLabel="Create your first invoice"
          actionTo="/invoices/new"
        />
      )}

      {/* 4. SUCCESS */}
      {!loading && !error && invoices.length > 0 && (
        <>
          {/* Plain Business Language Balance Cards */}
          <div data-animate="section" className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="flex flex-col justify-between gap-4 border-brand-200 bg-brand-50/50">
              <div>
                <p className="text-base font-medium text-ink-muted">Available digital dollars</p>
                <p className="mt-1 font-heading text-3xl font-bold text-ink">
                  {formatUsd(balance?.availableUsd || 0)}
                </p>
                {balance?.pendingUsd > 0 && (
                  <p className="mt-1 text-base text-ink-muted">
                    + {formatUsd(balance.pendingUsd)} payment currently arriving
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button as={Link} to="/withdraw" variant="secondary">
                  <Icon name="bank" className="h-4 w-4" />
                  <span>Withdraw to Naira</span>
                </Button>
                <Button as={Link} to="/wallet" variant="ghost">
                  View wallet
                </Button>
              </div>
            </Card>

            <Card className="flex flex-col justify-between gap-3">
              <div>
                <p className="text-base font-medium text-ink-muted">Owed by customers</p>
                <p className="mt-1 font-heading text-3xl font-bold text-ink">
                  {formatUsd(openBalanceTotal)}
                </p>
              </div>
              <p className="text-base text-ink-muted">
                Invoice amounts stay fixed in dollars until paid or cancelled.
              </p>
            </Card>
          </div>

          {/* Filter Tabs */}
          <div data-animate="section" className="flex flex-wrap gap-2" role="tablist" aria-label="Filter invoices">
            {FILTERS.map((f) => {
              const active = filter === f.id
              return (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    'min-h-11 rounded-xl border px-4 py-2 text-base font-medium',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300',
                    active
                      ? 'border-brand-300 bg-brand text-on-brand font-semibold'
                      : 'border-white/15 bg-white/[0.04] text-ink hover:bg-white/[0.08] hover:border-white/25',
                  )}
                >
                  {f.label}
                </button>
              )
            })}
          </div>

          {/* Filtered Invoice List */}
          {filteredInvoices.length === 0 ? (
            <EmptyState
              icon="doc"
              title="No invoices match this filter"
              description="Switch to another tab or create a new invoice."
              actionLabel="Show all invoices"
              onAction={() => setFilter('all')}
            />
          ) : (
            <div data-animate="section" className="space-y-3">
              {filteredInvoices.map((inv) => (
                <Link
                  key={inv.id}
                  to={`/invoices/${inv.id}`}
                  className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-muted"
                >
                  <Card className="hover:border-brand-300 space-y-3">
                    {/* Consistent top-right StatusPill on every invoice card */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-heading text-lg font-semibold text-ink truncate">
                          {inv.customerName || 'Unnamed customer'}
                        </p>
                        <p className="text-base text-ink-muted">
                          {inv.invoiceNumber}
                          {inv.dueDate ? ` • Due ${formatDate(inv.dueDate)}` : ''}
                        </p>
                      </div>

                      <StatusPill status={inv.status} />
                    </div>

                    <div className="flex flex-wrap items-baseline justify-between gap-2 border-t border-border-muted pt-3">
                      <div>
                        <span className="font-heading text-xl font-bold text-ink">
                          {formatUsd(inv.total)}
                        </span>
                        {inv.status === 'partial' && (
                          <span className="ml-2 text-base text-ink-muted">
                            ({formatUsd(inv.amountPaid)} received • {formatUsd(inv.amountRemaining)} left)
                          </span>
                        )}
                      </div>

                      <span className="inline-flex items-center gap-1 text-base font-semibold text-link">
                        <span>Open details</span>
                        <Icon name="arrow-right" className="h-4 w-4" />
                      </span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
