import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { IS_MOCK_ENABLED, api } from '../api/client'
import { getMockOverrides } from '../api/mock'
import { useAuth } from '../context/AuthContext'
import { Logo } from '../components/Logo'
import { Icon } from '../components/Icons'
import { PillHeader, PILL_NAV_LINK } from '../components/PillHeader'
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
    step: '01',
    title: 'Create a dollar invoice',
    body: 'Enter your items in US dollars. Add an optional discount or allow part payments if you agree with your buyer.',
    icon: 'doc',
  },
  {
    step: '02',
    title: 'Share on WhatsApp or email',
    body: 'Open a prepared WhatsApp message or copy the link. Your customer pays with no ClikPa account needed.',
    icon: 'share',
  },
  {
    step: '03',
    title: 'Keep 100% & withdraw to naira',
    body: 'Your customer covers payment charges so you receive the full agreed amount in digital dollars, ready to withdraw to your bank.',
    icon: 'bank',
  },
]

const PILLARS = [
  {
    icon: 'shield',
    title: 'Non-custodial by design',
    body: 'ClikPa never asks for or stores secret recovery words. Money moves only when you approve.',
  },
  {
    icon: 'doc',
    title: 'Fixed dollar invoices',
    body: 'Amounts stay in dollars until paid or cancelled — no exchange-rate surprises mid-deal.',
  },
  {
    icon: 'clock',
    title: 'Customer covers charges',
    body: 'Buyers pay the processing charge separately, so the full agreed total reaches you.',
  },
  {
    icon: 'bank',
    title: 'Cash out to naira',
    body: 'Withdraw digital dollars to your Nigerian bank account whenever you are ready.',
  },
]

/* Decorative isometric blueprint stack — the architectural signature of the page. */
function BlueprintStack() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute -right-6 top-2 hidden h-72 w-72 sm:block lg:-right-10 lg:h-80 lg:w-80">
      <div className="absolute inset-0 [perspective:1200px]">
        <div className="absolute inset-0 [transform-style:preserve-3d] [transform:rotateX(58deg)_rotateZ(-40deg)]">
          {[0, 46, 92, 138].map((z, idx) => (
            <div
              key={z}
              className="arch-grid absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-brand-300/25 bg-[#061024]/55"
              style={{
                transform: `translate(-50%, -50%) translateZ(${z}px)`,
                opacity: 0.9 - idx * 0.16,
                boxShadow: 'inset 0 0 40px rgba(0,64,168,0.28)',
              }}
            />
          ))}
          <div
            className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber shadow-[0_0_22px_6px_rgba(255,168,0,0.35)]"
            style={{ transform: 'translate(-50%, -50%) translateZ(150px)' }}
          />
        </div>
      </div>
    </div>
  )
}

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

  const primaryHref = isAuthenticated ? '/invoices/new' : '/signin'

  return (
    <div ref={pageRef} className="flex min-h-screen flex-col">
      <PillHeader>
        <div className="flex min-w-0 items-center gap-3">
          <Logo to="/" />
          <span className="hidden h-6 w-px bg-white/12 lg:block" aria-hidden="true" />
          <nav aria-label="Marketing" className="hidden items-center gap-0.5 lg:flex">
            <a href="#how-it-works" className={PILL_NAV_LINK}>
              How it works
            </a>
            <a href="#architecture" className={PILL_NAV_LINK}>
              Product
            </a>
            <Link to="/receipt/inv-104" className={PILL_NAV_LINK}>
              Sample receipt
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            as={Link}
            to={isAuthenticated ? '/dashboard' : '/signin'}
            variant="ghost"
            className="hidden rounded-full px-3.5 sm:inline-flex"
          >
            {isAuthenticated ? 'Dashboard' : 'Sign in'}
          </Button>
          <Button
            as={Link}
            to={primaryHref}
            variant="primary"
            className="rounded-full px-4 sm:px-5"
          >
            <span className="truncate">{isAuthenticated ? 'New invoice' : 'Get started'}</span>
            <Icon name="arrow-right" className="h-4 w-4" />
          </Button>
        </div>
      </PillHeader>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 pt-8 sm:px-6 md:pt-14">
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
          <div className="space-y-16 md:space-y-24">
            {/* ---------------------------------------------------------------- HERO */}
            <section
              data-animate="section"
              className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10"
            >
              <div className="space-y-6 lg:col-span-7">
                <span className="inline-flex items-center gap-2 rounded-full border border-amber/45 bg-amber-50 px-3.5 py-1.5 text-base font-semibold text-ink">
                  <Icon name="shield" className="h-4 w-4 text-amber" />
                  <span>Built for African businesses billing globally</span>
                </span>

                <h1 className="font-heading text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl">
                  Send a simple
                  <br className="hidden sm:block" /> invoice link.
                  <span className="text-gradient"> Receive digital dollars.</span>
                </h1>

                <p className="max-w-xl text-lg leading-relaxed text-ink-muted">
                  Bill customers in Accra, London, or Lagos without needing to learn crypto.
                  Share a link on WhatsApp, receive the full dollar amount you agreed, and cash
                  out to your bank when ready.
                </p>

                <div className="flex flex-col items-stretch gap-3 pt-1 sm:flex-row sm:items-center">
                  <Button as={Link} to={primaryHref} variant="primary" size="lg" className="rounded-full">
                    <span>{isAuthenticated ? 'Create an invoice' : 'Start invoicing for free'}</span>
                    <Icon name="arrow-right" className="h-5 w-5" />
                  </Button>

                  <Button
                    as={Link}
                    to="/pay/inv-101"
                    variant="secondary"
                    size="lg"
                    className="rounded-full"
                  >
                    See a customer pay page
                  </Button>
                </div>

                <p className="flex items-start gap-2 text-base text-ink-muted">
                  <Icon name="shield" className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
                  <span>
                    You stay in full control: ClikPa never sees your wallet&apos;s secret key and
                    never moves money without your approval.
                  </span>
                </p>
              </div>

              {/* Merchant invoice preview — glass bento floating over the blueprint */}
              <div className="relative lg:col-span-5">
                <BlueprintStack />
                <div
                  aria-hidden="true"
                  className="glow-blob -inset-10 bg-brand/35 lg:-inset-14"
                />
                <Card className="edge-light relative space-y-4 rounded-3xl">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink-muted">
                        INV-2026-101
                      </p>
                      <h2 className="mt-1 font-heading text-xl font-bold text-ink">
                        Adebayo Fabrics &amp; Tailoring
                      </h2>
                      <p className="text-base text-ink-muted">Billed to Kwame Mensah (Accra)</p>
                    </div>
                    <StatusPill status="paid" />
                  </div>

                  <div className="space-y-2 rounded-xl border border-white/10 bg-black/25 p-4">
                    <div className="flex justify-between gap-3 text-base">
                      <span className="text-ink-muted">Indigo Adire Yardage × 2</span>
                      <span className="font-medium text-ink">$170.00</span>
                    </div>
                    <div className="flex justify-between gap-3 text-base">
                      <span className="text-ink-muted">Handwoven Aso-Oke Trim</span>
                      <span className="font-medium text-ink">$70.00</span>
                    </div>
                    <div className="flex justify-between gap-3 border-t border-white/10 pt-2.5 text-lg font-bold text-ink">
                      <span>Merchant received</span>
                      <span className="font-heading">$240.00</span>
                    </div>
                  </div>

                  <p className="text-base leading-relaxed text-ink-muted">
                    Customer paid processing charges separately — the merchant received the exact
                    $240.00 agreed.
                  </p>
                </Card>
              </div>
            </section>

            {/* ------------------------------------------------------------ PILLARS BENTO */}
            <section id="architecture" data-animate="section" className="scroll-mt-28 space-y-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-1">
                  <p className="font-mono text-xs uppercase tracking-[0.22em] text-brand-300">
                    The structure
                  </p>
                  <h2 className="font-heading text-2xl font-bold text-ink sm:text-3xl">
                    Built like an invoice, not a wallet
                  </h2>
                </div>
                <p className="max-w-sm text-base text-ink-muted">
                  Every screen keeps the same rule: plain business language, fixed dollar
                  amounts, and your approval before anything moves.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {PILLARS.map((item, idx) => (
                  <Card
                    key={item.title}
                    className="group space-y-3 rounded-2xl transition-colors duration-300 hover:border-brand-300/45"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-200/70 bg-brand-50 text-brand-300">
                        <Icon name={item.icon} className="h-5 w-5" />
                      </span>
                      <span className="font-mono text-xs text-ink-muted/70">
                        0{idx + 1}
                      </span>
                    </div>
                    <h3 className="font-heading text-base font-semibold text-ink">{item.title}</h3>
                    <p className="text-base leading-relaxed text-ink-muted">{item.body}</p>
                  </Card>
                ))}
              </div>
            </section>

            {/* ------------------------------------------------------------ HOW IT WORKS */}
            <section id="how-it-works" data-animate="section" className="scroll-mt-28 space-y-6">
              <div className="space-y-1">
                <p className="font-mono text-xs uppercase tracking-[0.22em] text-brand-300">
                  Process
                </p>
                <h2 className="font-heading text-2xl font-bold text-ink sm:text-3xl">
                  How ClikPa works
                </h2>
              </div>

              <div className="relative grid grid-cols-1 gap-3 md:grid-cols-3">
                <div
                  aria-hidden="true"
                  className="absolute left-0 right-0 top-11 hidden h-px bg-gradient-to-r from-transparent via-white/15 to-transparent md:block"
                />
                {HOW_IT_WORKS.map((item) => (
                  <Card key={item.step} className="edge-light relative space-y-3 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-full bg-amber px-2 font-heading text-base font-bold text-on-amber shadow-[0_10px_24px_-14px_rgba(255,168,0,0.9)]">
                        {item.step}
                      </span>
                      <Icon name={item.icon} className="h-5 w-5 text-ink-muted" />
                    </div>
                    <h3 className="font-heading text-lg font-semibold text-ink">{item.title}</h3>
                    <p className="text-base leading-relaxed text-ink-muted">{item.body}</p>
                  </Card>
                ))}
              </div>
            </section>

            {/* ------------------------------------------------------------ TRUST PANEL */}
            <section data-animate="section">
              <Card variant="brand" className="edge-light overflow-hidden rounded-3xl">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div className="max-w-2xl space-y-2">
                    <p className="font-mono text-xs uppercase tracking-[0.22em] text-brand-300">
                      Custody
                    </p>
                    <h2 className="font-heading text-xl font-bold text-ink sm:text-2xl">
                      Your money only moves when you approve
                    </h2>
                    <p className="text-base leading-relaxed text-ink-muted">
                      ClikPa never asks for or stores secret recovery words. Even if you recover
                      your ClikPa business profile by email, you alone hold access to any wallet
                      you connect.
                    </p>
                  </div>
                  <Button
                    as={Link}
                    to="/receipt/inv-104"
                    variant="amber"
                    size="lg"
                    className="shrink-0 rounded-full"
                  >
                    Preview sample receipt
                    <Icon name="arrow-right" className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </section>
          </div>
        )}
      </main>

      <footer className="border-t border-white/10 print:hidden">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-6 text-base text-ink-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2.5">
            <Logo to="/" />
          </div>
          <p>Simple dollar invoices for West African businesses.</p>
          <nav aria-label="Footer" className="flex flex-wrap items-center gap-4">
            <a href="#how-it-works" className="hover:text-ink">
              How it works
            </a>
            <Link to="/receipt/inv-104" className="hover:text-ink">
              Sample receipt
            </Link>
            <Link to="/signin" className="hover:text-ink">
              Sign in
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
