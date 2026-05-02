'use client'

import { useEffect, useRef, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface ScrollRevealProps {
  children: ReactNode
  /** Delay in ms before the reveal animation runs once visible */
  delay?: number
  /** IntersectionObserver threshold (0..1) */
  threshold?: number
  className?: string
}

/**
 * Wraps children in a div that fades + slides in once it scrolls into view.
 * Pairs with the [data-reveal] CSS in app/globals.css.
 */
export function ScrollReveal({
  children,
  delay = 0,
  threshold = 0.15,
  className,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    // If IntersectionObserver isn't supported, just reveal immediately.
    if (typeof IntersectionObserver === 'undefined') {
      node.dataset.revealed = 'true'
      return
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement
            window.setTimeout(() => {
              target.dataset.revealed = 'true'
            }, delay)
            obs.unobserve(target)
          }
        }
      },
      { threshold, rootMargin: '0px 0px -10% 0px' }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [delay, threshold])

  return (
    <div ref={ref} data-reveal="" className={cn(className)}>
      {children}
    </div>
  )
}
