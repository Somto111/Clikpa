import { useEffect } from 'react'
import gsap from 'gsap'

export function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Animates screen sections marked with data-animate="section" using GSAP refs only (no Tailwind transition-*).
export function useScreenReveal(containerRef, triggerKey = '') {
  useEffect(() => {
    const el = containerRef?.current
    if (!el) return undefined

    if (prefersReducedMotion()) {
      gsap.set(el.querySelectorAll('[data-animate="section"]'), { opacity: 1, y: 0 })
      return undefined
    }

    const ctx = gsap.context(() => {
      const targets = el.querySelectorAll('[data-animate="section"]')
      if (targets.length > 0) {
        gsap.fromTo(
          targets,
          { opacity: 0, y: 12 },
          {
            opacity: 1,
            y: 0,
            duration: 0.36,
            stagger: 0.05,
            ease: 'power2.out',
            clearProps: 'transform',
          },
        )
      } else {
        gsap.fromTo(
          el,
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out', clearProps: 'transform' },
        )
      }
    }, el)

    return () => ctx.revert()
  }, [containerRef, triggerKey])
}

// Smoothly animates an SVG progress ring's strokeDashoffset via GSAP ref.
export function useProgressRingAnimation(circleRef, ratio, circumference) {
  useEffect(() => {
    const circle = circleRef?.current
    if (!circle || !circumference) return undefined

    const clamped = Math.max(0, Math.min(1, ratio))
    const targetOffset = circumference * (1 - clamped)

    if (prefersReducedMotion()) {
      gsap.set(circle, { strokeDashoffset: targetOffset })
      return undefined
    }

    const tween = gsap.to(circle, {
      strokeDashoffset: targetOffset,
      duration: 0.45,
      ease: 'power1.out',
      overwrite: 'auto',
    })

    return () => tween.kill()
  }, [circleRef, ratio, circumference])
}

// Subtle breathing pulse on live waiting/processing indicators via GSAP timeline.
export function useLiveDotPulse(dotRef, isActive) {
  useEffect(() => {
    const dot = dotRef?.current
    if (!dot) return undefined

    if (!isActive || prefersReducedMotion()) {
      gsap.set(dot, { scale: 1, opacity: 1 })
      return undefined
    }

    const tl = gsap.timeline({ repeat: -1, yoyo: true })
    tl.to(dot, {
      scale: 1.35,
      opacity: 0.55,
      duration: 0.85,
      ease: 'sine.inOut',
    })

    return () => {
      tl.kill()
      gsap.set(dot, { scale: 1, opacity: 1 })
    }
  }, [dotRef, isActive])
}

export function popElement(ref) {
  const el = ref?.current
  if (!el || prefersReducedMotion()) return
  gsap.fromTo(
    el,
    { scale: 0.92, opacity: 0.75 },
    { scale: 1, opacity: 1, duration: 0.24, ease: 'back.out(2)', clearProps: 'transform' },
  )
}
