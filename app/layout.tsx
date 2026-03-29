import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'IconHub — Best Free Icon Libraries for Developers',
  description: 'Compare and find the best free open source icon libraries for React, Next.js, Vue and more.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="border-b px-6 py-4 flex items-center justify-between">
          <a href="/" className="font-bold text-xl">IconHub</a>
          <div className="flex gap-6 text-sm text-gray-600">
            <a href="/free-svg-icons">Browse</a>
            <a href="/react-icons">React</a>
            <a href="/nextjs-icons">Next.js</a>
          </div>
        </nav>
        {children}
        <footer className="border-t px-6 py-8 text-center text-sm text-gray-500 mt-16">
          IconHub is an independent resource not affiliated with any icon library project.
        </footer>
      </body>
    </html>
  )
}