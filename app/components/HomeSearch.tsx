'use client'

import { Search } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SEARCHABLE_ICON_COUNT } from '../../data/library-catalog'
import styles from './home.module.css'

const quickSearches = ['camera', 'home', 'settings', 'arrow', 'user', 'bell', 'heart', 'search']

export default function HomeSearch() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  function openSearch(term: string) {
    router.push(`/icon-search?q=${encodeURIComponent(term.trim())}`)
  }

  function handleSearch(event: React.FormEvent) {
    event.preventDefault()
    if (!query.trim()) return
    openSearch(query)
  }

  return (
    <div className={styles.searchStack}>
      <form className={styles.searchForm} onSubmit={handleSearch}>
        <label className={styles.visuallyHidden} htmlFor="home-icon-search">
          Search the icon catalog
        </label>
        <Search aria-hidden="true" className={styles.searchIcon} size={20} strokeWidth={2} />
        <input
          suppressHydrationWarning
          id="home-icon-search"
          className={styles.searchInput}
          type="search"
          placeholder={`Search ${SEARCHABLE_ICON_COUNT.toLocaleString('en-US')} icons — try “camera” or “settings”`}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button suppressHydrationWarning className={styles.searchButton} type="submit">
          Search
        </button>
      </form>

      <div className={styles.searchChips} aria-label="Popular icon searches">
        {quickSearches.map((term) => (
          <button
            suppressHydrationWarning
            key={term}
            className={styles.searchChip}
            type="button"
            onClick={() => openSearch(term)}
          >
            {term}
          </button>
        ))}
      </div>
    </div>
  )
}
