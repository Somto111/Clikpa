import { Link } from 'react-router-dom'
import { cn } from '../../utils/cn'
import { Icon } from '../Icons'
import { Button } from './Button'

const BANNER_VARIANTS = {
  error: {
    container: 'bg-status-failed-soft border-status-failed-border text-ink',
    iconWrap: 'bg-status-failed-bg text-status-failed-text',
    icon: 'alert',
    buttonVariant: 'secondary',
  },
  warning: {
    // Amber rule: ink text on amber-50 fill, never amber text on white.
    container: 'bg-amber-50 border-amber text-ink',
    iconWrap: 'bg-amber text-ink',
    icon: 'alert',
    buttonVariant: 'secondary',
  },
  info: {
    container: 'bg-brand-50 border-brand-200 text-ink',
    iconWrap: 'bg-brand text-surface',
    icon: 'shield',
    buttonVariant: 'primary',
  },
  success: {
    container: 'bg-status-paid-soft border-status-paid-border text-ink',
    iconWrap: 'bg-status-paid-bg text-status-paid-text',
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
      className={cn('rounded-2xl border p-4 sm:p-5 print:border-black print:bg-white print:text-black', cfg.container, className)}
    >
      <div className="flex items-start gap-3.5">
        <div className={cn('mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', cfg.iconWrap)}>
          <Icon name={cfg.icon} className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          {title && <h3 className="font-heading text-base font-semibold text-ink">{title}</h3>}
          {children && <div className="text-base leading-relaxed text-ink">{children}</div>}
          {reassurance && (
            <p className="text-base font-medium text-ink-muted">{reassurance}</p>
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
