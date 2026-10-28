import { forwardRef } from 'react'
import { cn } from '../../utils/cn'

const CARD_VARIANTS = {
  // Default surface: glass bento panel with a 1px translucent hairline
  default: 'glass-panel',
  muted: 'bg-white/[0.03] border border-white/10 backdrop-blur-md',
  brand: 'glass-brand',
  amber: 'glass-amber',
  danger: 'bg-status-failed-bg/60 border border-status-failed-border/60 backdrop-blur-md',
  bare: 'bg-transparent border border-white/10',
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
          ? 'p-5 sm:p-6 md:p-8'
          : 'p-4 sm:p-5 md:p-6'

  return (
    <div
      ref={ref}
      className={cn(
        'relative rounded-2xl',
        CARD_VARIANTS[variant] || CARD_VARIANTS.default,
        padClass,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
})
