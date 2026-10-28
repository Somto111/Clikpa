import { forwardRef } from 'react'
import { cn } from '../../utils/cn'

const CARD_VARIANTS = {
  default: 'bg-surface border border-border-muted shadow-xs',
  muted: 'bg-surface-muted border border-border-muted',
  brand: 'bg-brand-50/70 border border-brand-200',
  amber: 'bg-amber-50 border border-amber',
  danger: 'bg-status-overdue-soft border border-status-overdue-border',
}

export const Card = forwardRef(function Card(
  { variant = 'default', padding = 'md', className, children, ...props },
  ref,
) {
  const padClass =
    padding === 'none'
      ? ''
      : padding === 'sm'
        ? 'p-4'
        : padding === 'lg'
          ? 'p-6 md:p-8'
          : 'p-4 sm:p-5 md:p-6'

  return (
    <div
      ref={ref}
      className={cn('rounded-2xl', CARD_VARIANTS[variant] || CARD_VARIANTS.default, padClass, className)}
      {...props}
    >
      {children}
    </div>
  )
})
