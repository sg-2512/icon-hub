'use client'

import { useEffect, useState } from 'react'
import styles from './article.module.css'

type ArticleToolsProps = {
  title: string
  url: string
}

export default function ArticleTools({ title, url }: ArticleToolsProps) {
  const [progress, setProgress] = useState(0)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const updateProgress = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      setProgress(maxScroll > 0 ? Math.min(100, Math.max(0, (window.scrollY / maxScroll) * 100)) : 0)
    }

    updateProgress()
    window.addEventListener('scroll', updateProgress, { passive: true })
    window.addEventListener('resize', updateProgress)

    return () => {
      window.removeEventListener('scroll', updateProgress)
      window.removeEventListener('resize', updateProgress)
    }
  }, [])

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: 'Read ' + title, url })
        return
      } catch {
        return
      }
    }

    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      // Sharing is a convenience action; leave the article usable if clipboard access is unavailable.
    }
  }

  return (
    <>
      <div className={styles.progressTrack} aria-hidden="true">
        <span className={styles.progressIndicator} style={{ transform: 'scaleX(' + (progress / 100) + ')' }} />
      </div>
      <button type="button" className={styles.shareButton} onClick={handleShare}>
        <svg className={styles.shareIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="m8.6 10.6 6.8-4.1M8.6 13.4l6.8 4.1" />
        </svg>
        {copied ? 'Link copied' : 'Share guide'}
      </button>
      <span className={styles.srOnly} aria-live="polite">{copied ? 'Article link copied to clipboard' : ''}</span>
    </>
  )
}
