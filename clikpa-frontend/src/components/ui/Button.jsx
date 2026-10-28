import { forwardRef } from 'react'
import { cn } from '../../utils/cn'

const BUTTON_VARIANTS = {
  // #0040A8 fill, white label (9.1:1). Subtle inner light keeps the edge crisp on midnight.
  primary:
    'bg-brand text-on-brand border border-brand-300/30 shadow-[0_14px_34px_-18px_rgba(0,64,168,0.95)] hover:bg-brand-500 hover:border-brand-300/45 active:bg-brand-700',
  // Outlined secondary — 1px translucent hairline on glass
  secondary:
    'bg-white/[0.045] text-ink border border-white/20 backdrop-blur-md hover:bg-white/[0.09] hover:border-white/35 active:bg-white/[0.12]',
  // Amber rule: amber fill always uses dark ink text, never amber text on a light surface.
  amber:
    'bg-amber text-on-amber border border-amber-300/50 font-semibold shadow-[0_14px_34px_-18px_rgba(255,168,0,0.85)] hover:bg-amber-400 hover:border-amber-200 active:bg-amber-600',
  ghost:
    'bg-transparent text-link border border-transparent hover:bg-white/[0.07] hover:text-brand-200 active:bg-white/[0.1]',
  danger:
    'bg-status-failed-bg text-status-failed-text border border-status-failed-border/80 hover:bg-[#3A1418] active:bg-[#431619]',
}

const BUTTON_SIZES = {
  md: 'min-h-11 px-4 py-2.5 text-base',
  lg: 'min-h-12 px-6 py-3 text-base font-semibold',
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
        'transition-[background-color,border-color,box-shadow,transform] duration-200 motion-reduce:transition-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-muted',
        'disabled:cursor-not-allowed disabled:opacity-50 print:shadow-none',
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
