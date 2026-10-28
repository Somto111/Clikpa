import { Link } from 'react-router-dom'
import { Icon } from '../Icons'
import { Button } from './Button'
import { Card } from './Card'

export function EmptyState({ icon = 'doc', title, description, actionLabel, actionTo, onAction }) {
  return (
    <Card className="py-10 text-center">
      <div className="mx-auto flex max-w-md flex-col items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-200/70 bg-brand-50 text-brand-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <Icon name={icon} className="h-6 w-6" />
        </div>
        <h2 className="font-heading text-lg font-semibold text-ink">{title}</h2>
        {description && <p className="text-base text-ink-muted">{description}</p>}
        {actionLabel && (actionTo || onAction) && (
          <div className="pt-2">
            {actionTo ? (
              <Button as={Link} to={actionTo} variant="primary">
                {actionLabel}
              </Button>
            ) : (
              <Button variant="primary" onClick={onAction}>
                {actionLabel}
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
