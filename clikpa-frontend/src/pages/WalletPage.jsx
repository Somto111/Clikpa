import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
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
import {
  formatDateTime,
  formatNgn,
  formatTokenAmount,
  formatUsd,
  truncateMiddle,
} from '../utils/format'
import { useScreenReveal } from '../utils/motion'

export function WalletPage() {
  const { user, setUser } = useAuth()
  const pageRef = useRef(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [balance, setBalance] = useState(null)
  const [ledger, setLedger] = useState({ payments: [], withdrawals: [] })
  const [expandedProofs, setExpandedProofs] = useState({})

  // Profile & Security settings (PATCH /me + Passkey placeholder)
  const [editingProfile, setEditingProfile] = useState(false)
  const [businessNameInput, setBusinessNameInput] = useState('')
  const [phoneInput, setPhoneInput] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSavedMsg, setProfileSavedMsg] = useState('')
  const [passkeyNotice, setPasskeyNotice] = useState(false)

  useScreenReveal(pageRef, loading ? 'loading' : 'ready')

  const loadWallet = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [balRes, payRes, meRes] = await Promise.all([
        api.getBalance(),
        api.getPayments(),
        api.getMe(),
      ])
      setBalance(balRes)
      setLedger({
        payments: payRes?.payments || [],
        withdrawals: payRes?.withdrawals || [],
      })
      if (meRes) {
        setUser(meRes)
        setBusinessNameInput(meRes.businessName || '')
        setPhoneInput(meRes.phone || '')
      }
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [setUser])

  useEffect(() => {
    loadWallet()
    const onMockChange = () => loadWallet()
    window.addEventListener('clikpa-mock-change', onMockChange)
    return () => window.removeEventListener('clikpa-mock-change', onMockChange)
  }, [loadWallet])

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    setProfileSavedMsg('')
    try {
      const updated = await api.updateMe({
        businessName: businessNameInput.trim(),
        phone: phoneInput.trim(),
      })
      setUser(updated)
      setEditingProfile(false)
      setProfileSavedMsg('Business profile updated.')
      setTimeout(() => setProfileSavedMsg(''), 3000)
    } catch (err) {
      setError(err)
    } finally {
      setSavingProfile(false)
    }
  }

  const isEmpty =
    !loading &&
    !error &&
    Number(balance?.availableUsd || 0) === 0 &&
    ledger.payments.length === 0 &&
    ledger.withdrawals.length === 0

  return (
    <div ref={pageRef} className="mx-auto max-w-3xl space-y-6">
      {/* Header + Single Primary CTA */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-ink">Wallet</h1>
          <p className="text-base text-ink-muted">
            Your digital dollar balance and payout activity.
          </p>
        </div>

        <Button as={Link} to="/withdraw" variant="primary" size="lg">
          <Icon name="bank" className="h-5 w-5" />
          <span>Withdraw to Naira</span>
        </Button>
      </div>

      {/* 1. LOADING */}
      {loading && <PageSkeleton lines={3} />}

      {/* 2. ERROR */}
      {!loading && error && (
        <Banner
          variant="error"
          title="Could not load wallet details"
          reassurance="Your digital dollars remain safe in your non-custodial wallet."
          actionLabel="Try again"
          onAction={loadWallet}
        >
          {error.message}
        </Banner>
      )}

      {/* 3. EMPTY STATE */}
      {isEmpty && (
        <EmptyState
          icon="wallet"
          title="Your wallet balance is $0.00"
          description="Send an invoice to start receiving digital dollars directly into your wallet."
          actionLabel="Create an invoice"
          actionTo="/invoices/new"
        />
      )}

      {/* 4. SUCCESS */}
      {!loading && !error && !isEmpty && balance && (
        <>
          {/* Balance Card + Non-Custodial Guarantee (Rule 1) */}
          <Card data-animate="section" className="space-y-4 border-brand-200 bg-brand-50/50">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-base font-medium text-ink-muted">Available digital dollars</p>
                <p className="mt-1 font-heading text-3xl sm:text-4xl font-bold text-ink">
                  {formatUsd(balance.availableUsd)}
                </p>
                {balance.pendingUsd > 0 && (
                  <p className="mt-1 text-base text-ink-muted">
                    + {formatUsd(balance.pendingUsd)} payment currently confirming
                  </p>
                )}
              </div>

              <StatusPill status="paid" customLabel="Self-custody active" />
            </div>

            <div className="rounded-xl border border-white/10 bg-black/25 p-3.5 space-y-1.5 text-base">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-ink-muted">Connected business wallet</span>
                <span className="font-mono font-semibold text-ink">
                  {truncateMiddle(balance.walletAddress, 8, 6)}
                </span>
              </div>
              <p className="text-ink-muted">
                ClikPa never sees or stores your wallet&apos;s secret key and never moves money without your approval.
              </p>
            </div>
          </Card>

          {/* Activity History (Plain business language; proof of payment behind link) */}
          <Card data-animate="section" className="space-y-4">
            <h2 className="font-heading text-lg font-semibold text-ink">Recent activity</h2>

            {ledger.payments.length === 0 && ledger.withdrawals.length === 0 ? (
              <p className="text-base text-ink-muted">No completed transactions yet.</p>
            ) : (
              <ul className="space-y-3">
                {ledger.payments.map((p) => {
                  const openProof = Boolean(expandedProofs[p.id])
                  return (
                    <li
                      key={p.id}
                      className="rounded-xl border border-border-muted bg-surface-muted p-4 space-y-2.5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-ink">
                            + {formatUsd(p.merchantReceivesUsd)} • {p.customerName || 'Customer'} (
                            {p.invoiceNumber})
                          </p>
                          <p className="text-base text-ink-muted">
                            {formatDateTime(p.completedAt || p.createdAt)}
                          </p>
                        </div>
                        <StatusPill status={p.status === 'delivered' ? 'paid' : p.status} />
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-base">
                        <Link
                          to={`/invoices/${p.invoiceId}`}
                          className="font-semibold text-link underline underline-offset-2"
                        >
                          Open invoice
                        </Link>
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedProofs((c) => ({ ...c, [p.id]: !c[p.id] }))
                          }
                          aria-expanded={openProof}
                          className="min-h-11 font-semibold text-link hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 rounded-sm"
                        >
                          {openProof ? 'Hide proof of payment' : 'Proof of payment'}
                        </button>
                      </div>

                      {openProof && (
                        <div className="rounded-lg border border-white/10 bg-black/25 p-3 space-y-1 text-base">
                          <p className="text-ink">
                            Customer sent {formatTokenAmount(p.totalToSendToken, p.token)} on{' '}
                            {p.chainName}.
                          </p>
                          {p.txHashOut && (
                            <p className="font-mono text-ink-muted">
                              Settlement ref: {truncateMiddle(p.txHashOut, 10, 8)}
                            </p>
                          )}
                        </div>
                      )}
                    </li>
                  )
                })}

                {ledger.withdrawals.map((wd) => (
                  <li
                    key={wd.id}
                    className="rounded-xl border border-border-muted bg-surface-muted p-4 space-y-2"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-ink">
                          - {formatUsd(wd.totalLeavingWalletUsd)} → {formatNgn(wd.expectedNgn)}
                        </p>
                        <p className="text-base text-ink-muted">
                          {wd.destinationBank?.bankName} • {formatDateTime(wd.createdAt)}
                        </p>
                      </div>
                      <StatusPill status={wd.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Business Profile & Security Settings (includes "Add a passkey" placeholder) */}
          <Card data-animate="section" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-heading text-lg font-semibold text-ink">
                  Business profile &amp; sign-in security
                </h2>
                <p className="text-base text-ink-muted">
                  {user?.businessName} • {user?.email}
                </p>
              </div>
              {!editingProfile && (
                <Button variant="secondary" onClick={() => setEditingProfile(true)}>
                  Edit business info
                </Button>
              )}
            </div>

            {profileSavedMsg && (
              <p role="status" className="text-base font-medium text-status-paid-text">
                {profileSavedMsg}
              </p>
            )}

            {editingProfile && (
              <form onSubmit={handleSaveProfile} className="space-y-3 border-t border-border-muted pt-3">
                <Input
                  label="Business name"
                  value={businessNameInput}
                  onChange={(e) => setBusinessNameInput(e.target.value)}
                  required
                />
                <Input
                  label="Business WhatsApp / phone"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                />
                <div className="flex flex-wrap gap-2">
                  <Button type="submit" variant="secondary" loading={savingProfile}>
                    Save changes
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setEditingProfile(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            {/* Passkey Placeholder required by spec */}
            <div className="rounded-xl border border-border-muted bg-surface-muted p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-0.5">
                <p className="font-semibold text-ink">Sign in faster with fingerprint or face</p>
                <p className="text-base text-ink-muted">
                  Passkey support is coming soon for one-tap ClikPa profile sign-in on Android.
                </p>
              </div>
              <Button variant="secondary" onClick={() => setPasskeyNotice(true)}>
                Add a passkey
              </Button>
            </div>

            {passkeyNotice && (
              <p role="status" className="text-base text-ink-muted">
                Passkeys will be enabled in an upcoming update. Note: passkeys and email sign-in unlock your ClikPa business profile only and never store or recover external wallet keys.
              </p>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
