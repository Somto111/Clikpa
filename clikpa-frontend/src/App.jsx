import { Suspense, lazy, useEffect } from 'react'
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { MerchantShell } from './components/MerchantShell'
import { MockScenarioBar } from './components/MockScenarioBar'
import { PageSkeleton, EmptyState } from './components/ui'
import { LandingPage } from './pages/LandingPage'
import { PayPage } from './pages/PayPage'

const SignIn = lazy(() => import('./pages/SignIn').then((m) => ({ default: m.SignIn })))
const ReceiptPage = lazy(() =>
  import('./pages/ReceiptPage').then((m) => ({ default: m.ReceiptPage })),
)
const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
)
const CreateInvoicePage = lazy(() =>
  import('./pages/CreateInvoicePage').then((m) => ({ default: m.CreateInvoicePage })),
)
const ShareInvoicePage = lazy(() =>
  import('./pages/ShareInvoicePage').then((m) => ({ default: m.ShareInvoicePage })),
)
const InvoiceDetailPage = lazy(() =>
  import('./pages/InvoiceDetailPage').then((m) => ({ default: m.InvoiceDetailPage })),
)
const WalletPage = lazy(() =>
  import('./pages/WalletPage').then((m) => ({ default: m.WalletPage })),
)
const WithdrawPage = lazy(() =>
  import('./pages/WithdrawPage').then((m) => ({ default: m.WithdrawPage })),
)

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function ProtectedMerchantLayout() {
  const { isAuthenticated, loadingProfile } = useAuth()
  const location = useLocation()

  if (loadingProfile) {
    return (
      <MerchantShell>
        <PageSkeleton lines={3} />
      </MerchantShell>
    )
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/signin"
        state={{ from: `${location.pathname}${location.search}` }}
        replace
      />
    )
  }

  return (
    <MerchantShell>
      <Suspense fallback={<PageSkeleton lines={3} />}>
        <Outlet />
      </Suspense>
    </MerchantShell>
  )
}

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-surface-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <EmptyState
          icon="alert"
          title="Page not found"
          description="Check the web address or head back to the ClikPa home page."
          actionLabel="Go to ClikPa home"
          actionTo="/"
        />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Suspense
          fallback={
            <div className="mx-auto max-w-xl p-6">
              <PageSkeleton lines={3} />
            </div>
          }
        >
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/pay/:invoiceId" element={<PayPage />} />
            <Route path="/receipt/:invoiceId" element={<ReceiptPage />} />

            {/* Protected merchant routes */}
            <Route element={<ProtectedMerchantLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/invoices/new" element={<CreateInvoicePage />} />
              <Route path="/invoices/:id/share" element={<ShareInvoicePage />} />
              <Route path="/invoices/:id" element={<InvoiceDetailPage />} />
              <Route path="/wallet" element={<WalletPage />} />
              <Route path="/withdraw" element={<WithdrawPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
        <MockScenarioBar />
      </BrowserRouter>
    </AuthProvider>
  )
}
