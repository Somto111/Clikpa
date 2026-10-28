import { Link } from 'react-router-dom'
import { cn } from '../utils/cn'

export function Logo({ to = '/', className }) {
  return (
    <Link
      to={to}
      className={cn(
        'inline-flex items-center gap-2.5 rounded-xl py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
        className,
      )}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-surface shadow-xs print:border print:border-black print:bg-white print:text-black">
        <svg viewBox="0 0 32 32" className="h-5 w-5" fill="none" aria-hidden="true">
          <path
            d="M20.5 10.5C19.1 9 17.1 8.2 14.9 8.2C10.5 8.2 7 11.7 7 16C7 20.3 10.5 23.8 14.9 23.8C17.1 23.8 19.1 23 20.5 21.5"
            stroke="currentColor"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <circle cx="22" cy="16" r="3.4" className="fill-amber print:fill-black" />
        </svg>
      </span>
      <span className="font-heading text-xl font-bold tracking-tight text-ink print:text-black">
        ClikPa
      </span>
    </Link>
  )
}
