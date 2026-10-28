import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { IS_MOCK_ENABLED } from '../api/client'
import { getMockOverrides, resetMockDatabase, setMockOverrides } from '../api/mock'
import { Button, Card } from './ui'

export function MockScenarioBar() {
  const [open, setOpen] = useState(false)
  const [overrides, setOverrides] = useState(() => getMockOverrides())

  useEffect(() => {
    const onUpdate = (e) => setOverrides(e.detail || getMockOverrides())
    window.addEventListener('clikpa-mock-change', onUpdate)
    return () => window.removeEventListener('clikpa-mock-change', onUpdate)
  }, [])

  if (!IS_MOCK_ENABLED) return null

  const update = (patch) => {
    setMockOverrides(patch)
    setOverrides(getMockOverrides())
  }

  return (
    <div className="fixed bottom-20 right-3 z-40 md:bottom-4 md:right-4 print:hidden">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open mock API state inspector"
          className="min-h-11 rounded-full border border-border-strong bg-surface px-3.5 py-2 text-base font-medium text-ink shadow-md hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          Mock states
          {overrides.screenState !== 'normal' || overrides.payEdgeState !== 'none' ? ' • Active' : ''}
        </button>
      ) : (
        <Card className="w-80 sm:w-96 max-h-[80vh] overflow-y-auto shadow-xl border-brand-200 space-y-4">
          <div className="flex items-center justify-between gap-2 border-b border-border-muted pb-2.5">
            <div>
              <p className="font-heading text-base font-semibold text-ink">Mock API Inspector</p>
              <p className="text-base text-ink-muted">Test all 4 screen states &amp; edge cases</p>
            </div>
            <Button variant="ghost" size="md" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="mock-screen-state" className="block text-base font-medium text-ink">
              Screen state (all routes)
            </label>
            <select
              id="mock-screen-state"
              value={overrides.screenState}
              onChange={(e) => update({ screenState: e.target.value })}
              className="min-h-11 w-full rounded-xl border border-border-strong bg-surface px-3 text-base text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <option value="normal">Success (Realistic data)</option>
              <option value="loading">Loading (Slow 3G skeletons)</option>
              <option value="error">Error (Inline banner + retry)</option>
              <option value="empty">Empty state</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="mock-pay-edge" className="block text-base font-medium text-ink">
              Pay page edge state
            </label>
            <select
              id="mock-pay-edge"
              value={overrides.payEdgeState}
              onChange={(e) => update({ payEdgeState: e.target.value })}
              className="min-h-11 w-full rounded-xl border border-border-strong bg-surface px-3 text-base text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <option value="none">Normal live flow</option>
              <option value="quote_ended">Quote ended (Get new payment details)</option>
              <option value="underpaid">Underpaid (Short deposit)</option>
              <option value="overpaid_returning">Overpaid (Returning excess)</option>
              <option value="overpaid_returned">Overpaid (API confirmed return)</option>
              <option value="swap_failed">Swap failed &amp; returning funds</option>
              <option value="slow_network">Slow network congestion</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label htmlFor="mock-kyc" className="block text-base font-medium text-ink">
                Partner KYC
              </label>
              <select
                id="mock-kyc"
                value={overrides.kycMode}
                onChange={(e) => update({ kycMode: e.target.value })}
                className="min-h-11 w-full rounded-xl border border-border-strong bg-surface px-2.5 text-base text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <option value="verified">Verified</option>
                <option value="action_required">Needs ID</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="mock-wd" className="block text-base font-medium text-ink">
                Payout result
              </label>
              <select
                id="mock-wd"
                value={overrides.withdrawalMode}
                onChange={(e) => update({ withdrawalMode: e.target.value })}
                className="min-h-11 w-full rounded-xl border border-border-strong bg-surface px-2.5 text-base text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <option value="normal">Succeeds</option>
                <option value="fail_bank">Fails (unreturned)</option>
                <option value="fail_returned">Fails (returned)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5 border-t border-border-muted pt-3">
            <p className="text-base font-medium text-ink">Quick test links</p>
            <div className="flex flex-wrap gap-1.5">
              <Link
                to="/pay/inv-101"
                onClick={() => setOpen(false)}
                className="min-h-11 inline-flex items-center rounded-lg bg-brand-50 px-3 text-base font-medium text-brand hover:bg-brand-100"
              >
                Pay (Unpaid)
              </Link>
              <Link
                to="/pay/inv-102"
                onClick={() => setOpen(false)}
                className="min-h-11 inline-flex items-center rounded-lg bg-brand-50 px-3 text-base font-medium text-brand hover:bg-brand-100"
              >
                Pay (Instalment)
              </Link>
              <Link
                to="/pay/inv-103"
                onClick={() => setOpen(false)}
                className="min-h-11 inline-flex items-center rounded-lg bg-brand-50 px-3 text-base font-medium text-brand hover:bg-brand-100"
              >
                Pay (Overdue)
              </Link>
              <Link
                to="/pay/inv-104"
                onClick={() => setOpen(false)}
                className="min-h-11 inline-flex items-center rounded-lg bg-brand-50 px-3 text-base font-medium text-brand hover:bg-brand-100"
              >
                Pay (Paid)
              </Link>
              <Link
                to="/pay/inv-105"
                onClick={() => setOpen(false)}
                className="min-h-11 inline-flex items-center rounded-lg bg-brand-50 px-3 text-base font-medium text-brand hover:bg-brand-100"
              >
                Pay (Cancelled)
              </Link>
              <Link
                to="/receipt/inv-104"
                onClick={() => setOpen(false)}
                className="min-h-11 inline-flex items-center rounded-lg bg-brand-50 px-3 text-base font-medium text-brand hover:bg-brand-100"
              >
                Receipt
              </Link>
            </div>
          </div>

          <Button
            variant="secondary"
            fullWidth
            onClick={() => {
              resetMockDatabase()
              setOverrides(getMockOverrides())
            }}
          >
            Reset demo data
          </Button>
        </Card>
      )}
    </div>
  )
}
