import { forwardRef, useId } from 'react'
import { cn } from '../../utils/cn'

const FIELD_BASE =
  'w-full min-h-11 rounded-xl border bg-white/[0.04] px-3.5 py-2.5 text-base text-ink placeholder:text-ink-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300/70 focus-visible:ring-offset-1 focus-visible:ring-offset-surface-muted focus-visible:border-brand-300 disabled:cursor-not-allowed disabled:bg-white/[0.02] disabled:text-ink-muted'

const FIELD_VARIANTS = {
  default: 'border-white/15 hover:border-white/28',
  error:
    'border-status-failed-border bg-status-failed-bg/45 focus-visible:ring-status-failed-border focus-visible:border-status-failed-border',
}

export const Input = forwardRef(function Input(
  {
    label,
    hint,
    error,
    as = 'input',
    id: propId,
    className,
    containerClassName,
    rightSlot,
    children,
    ...props
  },
  ref,
) {
  const autoId = useId()
  const fieldId = propId || autoId
  const descId = error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined
  const FieldTag = as

  return (
    <div className={cn('flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label htmlFor={fieldId} className="text-base font-medium text-ink">
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        <FieldTag
          ref={ref}
          id={fieldId}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={descId}
          className={cn(
            FIELD_BASE,
            error ? FIELD_VARIANTS.error : FIELD_VARIANTS.default,
            as === 'textarea' && 'min-h-24 resize-y',
            rightSlot && 'pr-20',
            className,
          )}
          {...props}
        >
          {children}
        </FieldTag>
        {rightSlot && <div className="absolute right-2 flex items-center">{rightSlot}</div>}
      </div>

      {error ? (
        <p id={`${fieldId}-error`} role="alert" className="text-base font-medium text-status-failed-text">
          {error}
        </p>
      ) : hint ? (
        <p id={`${fieldId}-hint`} className="text-base text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  )
})
