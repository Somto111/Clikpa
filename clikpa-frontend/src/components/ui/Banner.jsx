import { Link } from 'react-router-dom'
import { cn } from '../../utils/cn'
import { Icon } from '../Icons'
import { Button } from './Button'

const BANNER_VARIANTS = {
  error: {
    container: 'bg-status-failed-bg/70 border-status-failed-border/70 text-ink',
    iconWrap: 'bg-status-failed-bg text-status-failed-text border border-status-failed-border/70',
    icon: 'alert',
    buttonVariant: 'secondary',
  },
  warning: {
    // Amber rule: amber icon fill with dark ink glyph, never amber text on a light surface.
    container: 'bg-amber-50 border-amber/45 text-ink',
    iconWrap: 'bg-amber text-on-amber border border-amber-300/50',
    icon: 'alert',
    buttonVariant: 'secondary',
  },
  info: {
    container: 'glass-brand text-ink',
    iconWrap: 'bg-brand text-on-brand border border-brand-300/35',
    icon: 'shield',
    buttonVariant: 'primary',
  },
  success: {
    container: 'bg-status-paid-bg/80 border-status-paid-border/60 text-ink',
    iconWrap: 'bg-status-paid-bg text-status-paid-text border border-status-paid-border/60',
    icon: 'check-circle',
    buttonVariant: 'secondary',
  },
}

export function Banner({
  variant = 'info',
  title,
  reassurance,
  actionLabel,
  onAction,
  actionTo,
  actionLoading = false,
  className,
  children,
}) {
  const cfg = BANNER_VARIANTS[variant] || BANNER_VARIANTS.info

  return (
    <div
      role={variant === 'error' || variant === 'warning' ? 'alert' : 'status'}
      className={cn(
        'rounded-2xl border p-4 sm:p-5 backdrop-blur-md print:border-black print:bg-white print:text-black print:backdrop-blur-none',
        cfg.container,
        className,
      )}
    >
      <div className="flex items-start gap-3.5">
        <div className={cn('mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', cfg.iconWrap)}>
          <Icon name={cfg.icon} className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          {title && <h3 className="font-heading text-base font-semibold text-ink print:text-black">{title}</h3>}
          {children && <div className="text-base leading-relaxed text-ink print:text-black">{children}</div>}
          {reassurance && (
            <p className="text-base font-medium text-ink-muted print:text-black">{reassurance}</p>
          )}
          {actionLabel && (onAction || actionTo) && (
            <div className="pt-1 print:hidden">
              {actionTo ? (
                <Button as={Link} to={actionTo} variant={cfg.buttonVariant}>
                  {actionLabel}
                </Button>
              ) : (
                <Button variant={cfg.buttonVariant} onClick={onAction} loading={actionLoading}>
                  {actionLabel}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
