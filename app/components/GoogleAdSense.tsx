'use client'

import { useEffect } from 'react'

export default function GoogleAdSense({ client }: { client: string }) {
  useEffect(() => {
    if (document.querySelector('script[src*="pagead2.googlesyndication.com"]')) return
    const script = document.createElement('script')
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`
    script.async = true
    script.crossOrigin = 'anonymous'
    document.head.appendChild(script)
  }, [client])

  return null
}
