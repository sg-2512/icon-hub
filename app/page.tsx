import { icons } from '../lib/icons'
import Link from 'next/link'

export const metadata = {
  title: 'Best Free Icon Libraries for React & Next.js (2026)',
  description: 'Compare the best open source SVG icon libraries — Lucide, Heroicons, Tabler, Phosphor and more.',
}

export default function HomePage() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-4">
        Best Free Icon Libraries for Developers (2026)
      </h1>
      <p className="text-gray-600 text-lg mb-12">
        Compare {icons.length}+ open source SVG icon libraries for React, Next.js, Vue and more. Find the right one for your project.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {icons.map(icon => (
          <Link
            key={icon.slug}
            href={`/icons/${icon.slug}`}
            className="border rounded-xl p-6 hover:shadow-md transition"
          >
            <h2 className="font-semibold text-lg mb-1">{icon.name}</h2>
            <p className="text-gray-500 text-sm mb-3 line-clamp-2">{icon.description}</p>
            <div className="flex gap-4 text-sm text-gray-600">
              <span>⭐ {icon.stars.toLocaleString()}</span>
              <span>🎨 {icon.iconCount.toLocaleString()} icons</span>
            </div>
          </Link>
        ))}
      </div>

      <section className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Popular Comparisons</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            ['lucide-icons', 'heroicons'],
            ['lucide-icons', 'tabler-icons'],
            ['heroicons', 'tabler-icons'],
            ['phosphor-icons', 'lucide-icons'],
            ['feather-icons', 'lucide-icons'],
            ['remix-icon', 'lucide-icons'],
          ].map(([a, b]) => (
            <Link
              key={`${a}-${b}`}
              href={`/compare/${a}-vs-${b}`}
              className="border rounded-lg px-4 py-3 text-sm hover:bg-gray-50 transition"
            >
              {a.replace(/-/g, ' ')} vs {b.replace(/-/g, ' ')} →
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}