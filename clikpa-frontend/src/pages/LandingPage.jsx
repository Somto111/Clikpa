import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { IS_MOCK_ENABLED, api } from '../api/client'
import { getMockOverrides } from '../api/mock'
import { useAuth } from '../context/AuthContext'
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
import { useScreenReveal } from '../utils/motion'

const HOW_IT_WORKS = [
  {
    step: '1',
    title: 'Create a dollar invoice',
    body: 'Enter your items in US dollars. Add an optional discount or allow part payments if you agree with your buyer.',
  },
  {
    step: '2',
    title: 'Share on WhatsApp or email',
    body: 'Open a prepared WhatsApp message or copy the link. Your customer pays with no ClikPa account needed.',
  },
  {
    step: '3',
    title: 'Keep 100% & withdraw to naira',
    body: 'Your customer covers payment charges so you receive the full agreed amount in digital dollars, ready to withdraw to your bank.',
  },
]

export function LandingPage() {
  const { isAuthenticated } = useAuth()
  const pageRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [emptyDemo, setEmptyDemo] = useState(false)

  useScreenReveal(pageRef, loading ? 'loading' : 'ready')

  const syncMockState = useCallback(async () => {
    if (!IS_MOCK_ENABLED) return
    const ov = getMockOverrides()
    setError(null)
    setEmptyDemo(ov.screenState === 'empty')
    if (ov.screenState === 'loading' || ov.screenState === 'error') {
      setLoading(true)
      try {
        await api.getPublicInvoice('inv-101')
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    syncMockState()
    const onMockChange = () => syncMockState()
    window.addEventListener('clikpa-mock-change', onMockChange)
    return () => window.removeEventListener('clikpa-mock-change', onMockChange)
  }, [syncMockState])

  return (
    <div ref={pageRef} className="min-h-screen bg-surface-muted flex flex-col">
      <header className="border-b border-border-muted bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
          <Logo to="/" />
          <div className="flex items-center gap-2">
            <Button
              as={Link}
              to={isAuthenticated ? '/dashboard' : '/signin'}
              variant="secondary"
            >
              {isAuthenticated ? 'Dashboard' : 'Sign in'}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 space-y-10 px-4 py-8 sm:px-6 md:py-14">
        {loading && <PageSkeleton lines={3} />}

        {!loading && error && (
          <Banner
            variant="error"
            title="Could not load ClikPa preview"
            reassurance="Existing payment links and merchant accounts remain unaffected."
            actionLabel="Retry"
            onAction={syncMockState}
          >
            {error.message}
          </Banner>
        )}

        {!loading && !error && emptyDemo && (
          <EmptyState
            icon="doc"
            title="No featured invoices right now"
            description="Sign in to create your first dollar invoice and share it on WhatsApp."
            actionLabel={isAuthenticated ? 'Open dashboard' : 'Sign in to get started'}
            actionTo={isAuthenticated ? '/dashboard' : '/signin'}
          />
        )}

        {!loading && !error && !emptyDemo && (
          <>
            {/* Hero Section — Mobile First, Plain Business Language, One Primary CTA */}
            <section
              data-animate="section"
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              <div className="lg:col-span-7 space-y-5">
                <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3.5 py-1.5 text-base font-semibold text-ink border border-amber">
                  <Icon name="shield" className="h-4 w-4 text-ink" />
                  <span>Built for African businesses billing globally</span>
                </span>

                <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ink leading-tight">
                  Send a simple invoice link. Receive digital dollars. Withdraw to naira.
                </h1>

                <p className="text-lg text-ink-muted leading-relaxed">
                  Bill customers in Accra, London, or Lagos without needing to learn crypto. Share a link on WhatsApp, receive the full dollar amount you agreed, and cash out to your bank when ready.
                </p>

                {/* Single Primary Button + Secondary Customer Demo Link */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                  <Button
                    as={Link}
                    to={isAuthenticated ? '/invoices/new' : '/signin'}
                    variant="primary"
                    size="lg"
                  >
                    <span>{isAuthenticated ? 'Create an invoice' : 'Start invoicing for free'}</span>
                    <Icon name="arrow-right" className="h-5 w-5" />
                  </Button>

                  <Button as={Link} to="/pay/inv-101" variant="secondary" size="lg">
                    See a customer pay page
                  </Button>
                </div>

                <p className="text-base text-ink-muted">
                  You stay in full control: ClikPa never sees your wallet&apos;s secret key and never moves money without your approval.
                </p>
              </div>

              {/* Realistic Merchant Invoice Preview Card */}
              <div className="lg:col-span-5">
                <Card className="space-y-4 border-brand-200 shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-medium text-ink-muted">INV-2026-101</p>
                      <h2 className="font-heading text-xl font-bold text-ink">
                        Adebayo Fabrics &amp; Tailoring
                      </h2>
                      <p className="text-base text-ink-muted">Billed to Kwame Mensah (Accra)</p>
                    </div>
                    <StatusPill status="paid" />
                  </div>

                  <div className="rounded-xl bg-surface-muted p-4 border border-border-muted space-y-2">
                    <div className="flex justify-between text-base">
                      <span className="text-ink-muted">Indigo Adire Yardage × 2</span>
                      <span className="font-medium text-ink">$170.00</span>
                    </div>
                    <div className="flex justify-between text-base">
                      <span className="text-ink-muted">Handwoven Aso-Oke Trim</span>
                      <span className="font-medium text-ink">$70.00</span>
                    </div>
                    <div className="flex justify-between border-t border-border-muted pt-2 text-lg font-bold text-ink">
                      <span>Merchant received</span>
                      <span>$240.00</span>
                    </div>
                  </div>

                  <p className="text-base text-ink-muted">
                    Customer paid processing charges separately — Ngozi received the exact $240.00 agreed.
                  </p>
                </Card>
              </div>
            </section>

            {/* How It Works */}
            <section data-animate="section" className="space-y-4">
              <h2 className="font-heading text-2xl font-bold text-ink">
                How ClikPa works
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {HOW_IT_WORKS.map((item) => (
                  <Card key={item.step} className="space-y-2.5">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber text-ink font-heading text-base font-bold">
                      {item.step}
                    </span>
                    <h3 className="font-heading text-lg font-semibold text-ink">{item.title}</h3>
                    <p className="text-base text-ink-muted leading-relaxed">{item.body}</p>
                  </Card>
                ))}
              </div>
            </section>

            {/* Non-Custodial Trust Section (Rule 1) */}
            <section data-animate="section">
              <Card variant="brand" className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="font-heading text-lg font-semibold text-ink">
                    Your money only moves when you approve
                  </h2>
                  <p className="text-base text-ink-muted">
                    ClikPa never asks for or stores secret recovery words. Even if you recover your ClikPa business profile by email, you alone hold access to any wallet you connect.
                  </p>
                </div>
                <Button as={Link} to="/receipt/inv-104" variant="secondary" className="shrink-0">
                  Preview sample receipt
                </Button>
              </Card>
            </section>
          </>
        )}
      </main>
    </div>
  )
}
