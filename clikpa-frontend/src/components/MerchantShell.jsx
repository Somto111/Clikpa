import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { cn } from '../utils/cn'
import { Logo } from './Logo'
import { Icon } from './Icons'
import { Button } from './ui'
import { PillHeader, pillNavClass } from './PillHeader'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Invoices', icon: 'doc', end: true },
  { to: '/invoices/new', label: 'New invoice', icon: 'plus', end: true },
  { to: '/wallet', label: 'Wallet', icon: 'wallet', end: true },
  { to: '/withdraw', label: 'Withdraw', icon: 'bank', end: true },
]

export function MerchantShell({ children }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = () => {
    signOut()
    navigate('/signin')
  }

  return (
    <div className="flex min-h-screen flex-col pb-24 md:pb-10">
      <PillHeader>
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          <Logo to="/dashboard" />
          <nav aria-label="Merchant navigation" className="hidden items-center gap-0.5 md:flex">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => pillNavClass(isActive)}
              >
                <Icon name={item.icon} className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1.5">
          {user?.businessName && (
            <span className="hidden max-w-48 truncate text-base font-medium text-ink-muted lg:inline-block">
              {user.businessName}
            </span>
          )}
          <Button variant="ghost" size="md" onClick={handleSignOut} className="px-3">
            Sign out
          </Button>
        </div>
      </PillHeader>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 md:py-10">
        {children}
      </main>

      {/* Floating glass tab bar on mobile */}
      <nav
        aria-label="Mobile merchant navigation"
        className="fixed inset-x-3 bottom-3 z-30 md:hidden print:hidden"
      >
        <div className="pill-header grid grid-cols-4 gap-1 rounded-3xl px-1.5 py-1.5">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-2xl px-1 py-1 text-center font-medium',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300',
                  isActive
                    ? 'bg-brand-50 text-ink font-semibold shadow-[inset_0_0_0_1px_rgba(122,167,255,0.35)]'
                    : 'text-ink-muted hover:text-ink',
                )
              }
            >
              <Icon name={item.icon} className="h-5 w-5" />
              <span className="text-xs leading-tight">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
