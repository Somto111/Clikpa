import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { IS_MOCK_ENABLED, api } from '../api/client'
import { getMockOverrides } from '../api/mock'
import { useAuth } from '../context/AuthContext'
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
} from '../components/ui'
import { useScreenReveal } from '../utils/motion'

const ENV_AUTH_MODE = import.meta.env.VITE_AUTH_MODE === 'password' ? 'password' : 'code'

export function SignIn() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { isAuthenticated, completeSignIn } = useAuth()
  const pageRef = useRef(null)

  const queryMode = searchParams.get('mode')
  const authMode =
    queryMode === 'password' || queryMode === 'code' ? queryMode : ENV_AUTH_MODE

  const [screenLoading, setScreenLoading] = useState(false)
  const [screenEmpty, setScreenEmpty] = useState(false)

  const [email, setEmail] = useState(IS_MOCK_ENABLED ? 'ngozi@adebayofabrics.ng' : '')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [codeStep, setCodeStep] = useState('email') // 'email' | 'verify'
  const [demoHint, setDemoHint] = useState('')

  const [busy, setBusy] = useState(false)
  const [walletBusy, setWalletBusy] = useState(false)
  const [error, setError] = useState(null)
  const [showHelp, setShowHelp] = useState(false)

  const redirectTo = location.state?.from || '/dashboard'

  useScreenReveal(pageRef, `${authMode}-${codeStep}-${screenLoading}`)

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo, { replace: true })
    }
  }, [isAuthenticated, navigate, redirectTo])

  const syncMockScreenState = useCallback(async () => {
    if (!IS_MOCK_ENABLED) return
    const ov = getMockOverrides()
    setScreenEmpty(ov.screenState === 'empty')
    if (ov.screenState === 'loading') {
      setScreenLoading(true)
      const timer = setTimeout(() => setScreenLoading(false), 1800)
      return () => clearTimeout(timer)
    }
    if (ov.screenState === 'error') {
      setError({
        message: 'Sign-in service is temporarily unreachable on your network. Your account and wallet remain safe.',
      })
    } else {
      setError(null)
    }
    setScreenLoading(false)
    return undefined
  }, [])

  useEffect(() => {
    syncMockScreenState()
    const onMockChange = () => syncMockScreenState()
    window.addEventListener('clikpa-mock-change', onMockChange)
    return () => window.removeEventListener('clikpa-mock-change', onMockChange)
  }, [syncMockScreenState])

  const handleRequestCode = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const res = await api.requestCode(email.trim())
      setDemoHint(res?.demoHint || '')
      setCodeStep('verify')
    } catch (err) {
      setError(err)
    } finally {
      setBusy(false)
    }
  }

  const handleVerifyCode = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const res = await api.verifyCode(email.trim(), code.trim())
      completeSignIn(res.token, res.user)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err)
    } finally {
      setBusy(false)
    }
  }

  const handlePasswordLogin = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const res = await api.loginWithPassword(email.trim(), password)
      completeSignIn(res.token, res.user)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err)
    } finally {
      setBusy(false)
    }
  }

  const handleWalletSignIn = async () => {
    setWalletBusy(true)
    setError(null)
    try {
      let walletAddress = '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE'
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
          if (accounts?.[0]) walletAddress = accounts[0]
        } catch {
          // Use non-custodial demo wallet fallback if no extension installed
        }
      }
      const res = await api.loginWithWallet(walletAddress, 'signed-login-challenge')
      completeSignIn(res.token, res.user)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err)
    } finally {
      setWalletBusy(false)
    }
  }

  return (
    <div ref={pageRef} className="flex min-h-screen flex-col">
      <PillHeader width="max-w-md">
        <Logo to="/" />
        {IS_MOCK_ENABLED && (
          <button
            type="button"
            onClick={() =>
              setSearchParams({ mode: authMode === 'code' ? 'password' : 'code' })
            }
            className="min-h-11 rounded-full px-3 text-base font-medium text-link hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:border-brand-300"
          >
            Switch to {authMode === 'code' ? 'password' : 'email code'}
          </button>
        )}
      </PillHeader>

      <main className="mx-auto w-full max-w-md flex-1 space-y-5 px-4 py-8 sm:py-12">
        {/* 1. LOADING */}
        {screenLoading && <PageSkeleton lines={2} />}

        {/* 3. EMPTY */}
        {!screenLoading && screenEmpty && (
          <EmptyState
            icon="mail"
            title="No saved account on this phone yet"
            description="Enter your business email to sign in or create your ClikPa profile."
            actionLabel="Enter email"
            onAction={() => setScreenEmpty(false)}
          />
        )}

        {/* 2. ERROR + 4. SUCCESS FORM */}
        {!screenLoading && !screenEmpty && (
          <>
            {error && (
              <Banner
                variant="error"
                title="Could not sign you in"
                reassurance="Your invoices and any connected wallet remain safe."
                actionLabel="Dismiss and retry"
                onAction={() => setError(null)}
              >
                {error.message}
              </Banner>
            )}

            <Card data-animate="section" padding="lg" className="edge-light space-y-5 rounded-3xl">
              <div className="space-y-2">
                <p className="font-mono text-xs uppercase tracking-[0.22em] text-brand-300">
                  Merchant access
                </p>
                <h1 className="font-heading text-2xl font-bold text-ink">
                  Sign in to ClikPa
                </h1>
                <p className="text-base text-ink-muted">
                  {authMode === 'code'
                    ? 'We will email you a one-time sign-in code.'
                    : 'Enter your business email and password.'}
                </p>
              </div>

              {authMode === 'code' ? (
                codeStep === 'email' ? (
                  <form onSubmit={handleRequestCode} className="space-y-4">
                    <Input
                      label="Business email"
                      type="email"
                      autoComplete="email"
                      placeholder="ngozi@adebayofabrics.ng"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <Button type="submit" variant="primary" size="lg" fullWidth loading={busy}>
                      Email me a sign-in code
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyCode} className="space-y-4">
                    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-base text-ink-muted">
                      Enter the 6-digit code sent to <strong className="text-ink">{email}</strong>.
                      {demoHint && <p className="mt-1 font-medium text-link">{demoHint}</p>}
                    </div>

                    <Input
                      label="6-digit sign-in code"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="123456"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      required
                    />

                    <Button type="submit" variant="primary" size="lg" fullWidth loading={busy}>
                      Verify &amp; open dashboard
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      fullWidth
                      onClick={() => {
                        setCodeStep('email')
                        setCode('')
                      }}
                    >
                      Use a different email
                    </Button>
                  </form>
                )
              ) : (
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  <Input
                    label="Business email"
                    type="email"
                    autoComplete="email"
                    placeholder="ngozi@adebayofabrics.ng"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Input
                    label="Password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    hint={IS_MOCK_ENABLED ? 'Enter any 4+ characters in mock mode.' : undefined}
                    required
                  />
                  <Button type="submit" variant="primary" size="lg" fullWidth loading={busy}>
                    Sign in
                  </Button>
                </form>
              )}

              {/* Matching Help Link: "Trouble signing in?" (code) OR "Forgot password?" (password) */}
              <div className="border-t border-border-muted pt-4 space-y-3">
                <button
                  type="button"
                  onClick={() => setShowHelp((v) => !v)}
                  aria-expanded={showHelp}
                  className="inline-flex min-h-11 items-center rounded-lg text-base font-semibold text-link hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:border-brand-300"
                >
                  {authMode === 'code' ? 'Trouble signing in?' : 'Forgot password?'}
                </button>

                {/* Rule 1: Recovering a ClikPa profile by email must NEVER claim to recover a separately connected wallet */}
                {showHelp && (
                  <div className="rounded-xl border border-border-muted bg-surface-muted p-3.5 space-y-2 text-base text-ink">
                    <p className="font-semibold">
                      {authMode === 'code'
                        ? 'Check your spam folder or request a fresh code after 60 seconds.'
                        : 'Enter your email in code mode to reset your ClikPa profile password.'}
                    </p>
                    <p className="text-ink-muted">
                      Important: Recovering your ClikPa profile by email restores your business profile and invoice history only. It{' '}
                      <strong className="font-semibold text-ink">
                        never recovers a separately connected wallet
                      </strong>{' '}
                      — ClikPa never sees or stores your wallet&apos;s secret key.
                    </p>
                  </div>
                )}

                <Button
                  type="button"
                  variant="secondary"
                  fullWidth
                  onClick={handleWalletSignIn}
                  loading={walletBusy}
                >
                  <Icon name="wallet" className="h-5 w-5" />
                  <span>Sign in with connected wallet</span>
                </Button>
              </div>
            </Card>

            <p className="text-center text-base text-ink-muted">
              We&apos;ll never ask for your secret recovery words.
            </p>
          </>
        )}
      </main>
    </div>
  )
}
