import { Metadata } from 'next'
import BookmarksClient from './BookmarksClient'

export const metadata: Metadata = {
  title: 'Bookmarks & Saved Icons — IconSearch',
  description: 'Access all your saved vector SVG icons and pinned library collections in your personal workspace.',
}

export default function BookmarksPage() {
  return (
    <main>
      <BookmarksClient />
    </main>
  )
}
