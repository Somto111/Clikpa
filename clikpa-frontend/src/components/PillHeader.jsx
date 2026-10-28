import { cn } from '../utils/cn'

/**
 * Floating pill header shared across public and merchant surfaces.
 * Keeps a soft midnight scrim behind the glass so the 1px hairline stays crisp.
 */
export function PillHeader({ children, width = 'max-w-5xl', className, innerClassName }) {
  return (
    <header className="sticky top-0 z-40 print:hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#050A16] via-[#050A16]/85 to-transparent"
      />
      <div className="relative px-3 pt-3 sm:px-6 sm:pt-4">
        <div
          className={cn(
            'pill-header mx-auto flex w-full items-center justify-between gap-2 rounded-full px-2.5 py-2 sm:gap-3 sm:px-4',
            width,
            innerClassName,
          )}
        >
          {children}
        </div>
      </div>
    </header>
  )
}

export const PILL_NAV_LINK =
  'inline-flex min-h-11 items-center gap-2 rounded-full px-3.5 py-2 text-base font-medium text-ink-muted hover:bg-white/[0.07] hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-muted'

export function pillNavClass(isActive) {
  return cn(
    PILL_NAV_LINK,
    isActive &&
      'bg-brand-50 text-ink font-semibold shadow-[inset_0_0_0_1px_rgba(122,167,255,0.35)]',
  )
}
