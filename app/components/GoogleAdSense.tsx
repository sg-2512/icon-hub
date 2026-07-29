'use client'

import { useEffect } from 'react'

export default function GoogleAdSense({ client }: { client: string }) {
  useEffect(() => {
    let loaded = false

    const loadScript = () => {
      if (loaded || document.querySelector('script[src*="pagead2.googlesyndication.com"]')) return
      loaded = true

      const script = document.createElement('script')
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`
      script.async = true
      script.crossOrigin = 'anonymous'
      document.head.appendChild(script)

      events.forEach(e => window.removeEventListener(e, loadScript))
    }

    const events = ['pointermove', 'scroll', 'touchstart', 'keydown']
    events.forEach(e => window.addEventListener(e, loadScript, { passive: true, once: true }))

    const timer = setTimeout(loadScript, 3500)

    return () => {
      clearTimeout(timer)
      events.forEach(e => window.removeEventListener(e, loadScript))
    }
  }, [client])

  return null
}
