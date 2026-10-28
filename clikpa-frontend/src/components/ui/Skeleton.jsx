import { cn } from '../../utils/cn'

export function Skeleton({ className }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-pulse motion-reduce:animate-none rounded-xl bg-white/[0.075] ring-1 ring-inset ring-white/[0.04]',
        className,
      )}
    />
  )
}

export function PageSkeleton({ lines = 4 }) {
  return (
    <div role="status" aria-label="Loading content" className="space-y-4">
      <span className="sr-only">Loading content...</span>
      <div className="glass-panel rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-8 w-28 rounded-full" />
        </div>
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      {Array.from({ length: lines }).map((_, idx) => (
        <div key={idx} className="glass-panel rounded-2xl p-5 space-y-3">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  )
}
