'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    dataLayer: unknown[]
  }
}

export default function GoogleAnalytics({ gaId }: { gaId: string }) {
  useEffect(() => {
    let loaded = false

    const loadGA = () => {
      if (loaded || document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) return
      loaded = true

      window.dataLayer = window.dataLayer || []
      function gtag(...args: unknown[]) {
        window.dataLayer.push(args)
      }
      gtag('js', new Date())
      gtag('config', gaId)

      const script = document.createElement('script')
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`
      script.async = true
      document.head.appendChild(script)

      events.forEach(e => window.removeEventListener(e, loadGA))
    }

    const events = ['pointermove', 'scroll', 'touchstart', 'keydown']
    events.forEach(e => window.addEventListener(e, loadGA, { passive: true, once: true }))

    const timer = setTimeout(loadGA, 3500)

    return () => {
      clearTimeout(timer)
      events.forEach(e => window.removeEventListener(e, loadGA))
    }
  }, [gaId])

  return null
}
