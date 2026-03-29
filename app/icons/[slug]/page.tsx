import { icons, getIconBySlug } from '../../../lib/icons'
import Link from 'next/link'

export async function generateStaticParams() {
  return icons.map(icon => ({ slug: icon.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const icon = getIconBySlug(slug)
  if (!icon) return {}
  return {
    title: `${icon.name} — Installation, Usage & Examples (2026)`,
    description: `Complete guide to ${icon.name}. ${icon.iconCount} icons, ${icon.license} license. Works with ${icon.frameworks.join(', ')}.`,
  }
}

export default async function LibraryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const icon = getIconBySlug(slug)

  if (!icon) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold">Library not found</h1>
        <Link href="/" className="text-blue-500">← Back to home</Link>
      </main>
    )
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 mb-6 block">
        ← Back to all libraries
      </Link>

      <h1 className="text-4xl font-bold mb-3">{icon.name}</h1>
      <p className="text-gray-600 text-lg mb-8">{icon.description}</p>

      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold">{icon.iconCount.toLocaleString()}</div>
          <div className="text-sm text-gray-500">Icons</div>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold">{icon.stars.toLocaleString()}</div>
          <div className="text-sm text-gray-500">GitHub Stars</div>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold">{icon.license}</div>
          <div className="text-sm text-gray-500">License</div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-3">Installation</h2>
      <pre className="bg-gray-900 text-green-400 rounded-lg p-4 mb-8 overflow-x-auto">
        {icon.installCommand}
      </pre>

      <h2 className="text-2xl font-bold mb-3">Usage Example</h2>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-8 overflow-x-auto text-sm">
        {icon.usageExample}
      </pre>

      <div className="grid grid-cols-2 gap-6 mb-10">
        <div>
          <h3 className="font-bold text-green-600 mb-2">Pros</h3>
          <ul className="space-y-1">
            {icon.pros.map(p => (
              <li key={p} className="text-sm text-gray-600">✅ {p}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-red-500 mb-2">Cons</h3>
          <ul className="space-y-1">
            {icon.cons.map(c => (
              <li key={c} className="text-sm text-gray-600">❌ {c}</li>
            ))}
          </ul>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-3">Framework Support</h2>
      <div className="flex gap-2 flex-wrap mb-10">
        {icon.frameworks.map(f => (
          <span key={f} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
            {f}
          </span>
        ))}
      </div>

      <div className="flex gap-4 mb-16">
        <a href={icon.github} target="_blank" className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-50">
          GitHub →
        </a>
        <a href={icon.website} target="_blank" className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-50">
          Official Site →
        </a>
      </div>

      <h2 className="text-2xl font-bold mb-4">Compare {icon.name} With Others</h2>
      <div className="flex gap-3 flex-wrap">
        {icons.filter(i => i.slug !== icon.slug).map(i => (
          <Link
            key={i.slug}
            href={`/compare/${icon.slug}-vs-${i.slug}`}
            className="border rounded-lg px-3 py-2 text-sm hover:bg-gray-50"
          >
            {icon.name} vs {i.name}
          </Link>
        ))}
      </div>
    </main>
  )
}
