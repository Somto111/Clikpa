import { forwardRef } from 'react'
import { cn } from '../../utils/cn'

const BUTTON_VARIANTS = {
  primary:
    'bg-brand text-surface hover:bg-brand-700 active:bg-brand-800 border border-transparent shadow-xs',
  secondary:
    'bg-surface text-ink hover:bg-surface-subtle active:bg-border-muted border border-border-strong',
  // Amber rule: amber fill always uses dark ink text, never amber text on white.
  amber:
    'bg-amber text-ink hover:bg-amber-400 active:bg-amber-600 border border-amber-600/30 font-semibold',
  ghost:
    'bg-transparent text-brand hover:bg-brand-50 active:bg-brand-100 border border-transparent',
  danger:
    'bg-status-failed-bg text-status-failed-text hover:bg-status-overdue-soft border border-status-failed-border',
}

const BUTTON_SIZES = {
  md: 'min-h-11 px-4 py-2.5 text-base',
  lg: 'min-h-12 px-5 py-3 text-base font-semibold',
  icon: 'min-h-11 min-w-11 p-2.5 text-base',
}

export const Button = forwardRef(function Button(
  {
    as: Component = 'button',
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    loading = false,
    disabled = false,
    className,
    children,
    type = 'button',
    ...props
  },
  ref,
) {
  const isDisabled = disabled || loading

  return (
    <Component
      ref={ref}
      type={Component === 'button' ? type : undefined}
      disabled={Component === 'button' ? isDisabled : undefined}
      aria-disabled={Component !== 'button' && isDisabled ? true : undefined}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium leading-snug select-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-55',
        BUTTON_VARIANTS[variant] || BUTTON_VARIANTS.primary,
        BUTTON_SIZES[size] || BUTTON_SIZES.md,
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading && (
        <span
          className="inline-block h-4 w-4 animate-spin motion-reduce:animate-none rounded-full border-2 border-current border-r-transparent"
          aria-hidden="true"
        />
      )}
      {children}
    </Component>
  )
})
