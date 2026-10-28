import { useEffect, useRef } from 'react'

// Polls `callback` with exponential backoff on failure and pauses while the browser tab is hidden.
export function usePolling(callback, { enabled = true, intervalMs = 4500, maxBackoffMs = 30000 } = {}) {
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (!enabled) return undefined

    let timer = null
    let cancelled = false
    let inFlight = false
    let failures = 0

    function clearTimer() {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
    }

    function schedule(delay) {
      clearTimer()
      if (cancelled) return
      timer = setTimeout(async () => {
        if (cancelled) return
        if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
          return
        }
        if (inFlight) {
          schedule(intervalMs)
          return
        }
        inFlight = true
        try {
          await savedCallback.current()
          failures = 0
          schedule(intervalMs)
        } catch {
          failures += 1
          const nextDelay = Math.min(maxBackoffMs, intervalMs * Math.pow(1.8, failures))
          schedule(nextDelay)
        } finally {
          inFlight = false
        }
      }, delay)
    }

    schedule(intervalMs)

    function handleVisibility() {
      if (document.visibilityState === 'visible') {
        failures = 0
        schedule(300)
      } else {
        clearTimer()
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      cancelled = true
      clearTimer()
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [enabled, intervalMs, maxBackoffMs])
}
