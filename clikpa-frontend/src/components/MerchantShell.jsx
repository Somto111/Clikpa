import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { cn } from '../utils/cn'
import { Logo } from './Logo'
import { Icon } from './Icons'
import { Button } from './ui'

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
    <div className="min-h-screen bg-surface-muted flex flex-col pb-20 md:pb-8">
      <header className="sticky top-0 z-30 border-b border-border-muted bg-surface/95 backdrop-blur-xs print:hidden">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-6">
            <Logo to="/dashboard" />
            <nav aria-label="Merchant navigation" className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'inline-flex min-h-11 items-center gap-2 rounded-xl px-3.5 py-2 text-base font-medium',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
                      isActive
                        ? 'bg-brand-50 text-brand font-semibold'
                        : 'text-ink-muted hover:bg-surface-subtle hover:text-ink',
                    )
                  }
                >
                  <Icon name={item.icon} className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {user?.businessName && (
              <span className="hidden sm:inline-block truncate max-w-48 text-base font-medium text-ink-muted">
                {user.businessName}
              </span>
            )}
            <Button variant="ghost" size="md" onClick={handleSignOut}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-5 sm:px-6 md:py-8">
        {children}
      </main>

      <nav
        aria-label="Mobile merchant navigation"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border-muted bg-surface md:hidden print:hidden"
      >
        <div className="grid grid-cols-4 gap-1 px-2 py-1.5">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1 text-center font-medium',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
                  isActive ? 'bg-brand-50 text-brand font-semibold' : 'text-ink-muted hover:text-ink',
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
