import { icons } from '../../../lib/icons'
import Link from 'next/link'

export async function generateStaticParams() {
  const pairs = []
  for (let i = 0; i < icons.length; i++) {
    for (let j = i + 1; j < icons.length; j++) {
      pairs.push({ pair: `${icons[i].slug}-vs-${icons[j].slug}` })
    }
  }
  return pairs
}

export async function generateMetadata({ params }: { params: Promise<{ pair: string }> }) {
  const { pair } = await params
  const [slugA, slugB] = pair.split('-vs-')
  const a = icons.find(i => i.slug === slugA)
  const b = icons.find(i => i.slug === slugB)
  if (!a || !b) return {}
  return {
    title: `${a.name} vs ${b.name} (2026) — Which is Better?`,
    description: `Detailed comparison of ${a.name} vs ${b.name}. Icons count, framework support, TypeScript, tree-shaking and more.`,
  }
}

export default async function ComparisonPage({ params }: { params: Promise<{ pair: string }> }) {
  const { pair } = await params
  const [slugA, slugB] = pair.split('-vs-')
  const a = icons.find(i => i.slug === slugA)
  const b = icons.find(i => i.slug === slugB)

  if (!a || !b) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold">Comparison not found</h1>
        <Link href="/" className="text-blue-500">← Back to home</Link>
      </main>
    )
  }

  const rows = [
    { label: 'Total Icons', a: a.iconCount.toLocaleString(), b: b.iconCount.toLocaleString() },
    { label: 'GitHub Stars', a: a.stars.toLocaleString(), b: b.stars.toLocaleString() },
    { label: 'License', a: a.license, b: b.license },
    { label: 'TypeScript', a: a.typescript ? '✅ Yes' : '❌ No', b: b.typescript ? '✅ Yes' : '❌ No' },
    { label: 'Tree Shakable', a: a.treeshakable ? '✅ Yes' : '❌ No', b: b.treeshakable ? '✅ Yes' : '❌ No' },
    { label: 'Figma Plugin', a: a.figmaPlugin ? '✅ Yes' : '❌ No', b: b.figmaPlugin ? '✅ Yes' : '❌ No' },
    { label: 'Styles', a: a.style.join(', '), b: b.style.join(', ') },
    { label: 'Frameworks', a: a.frameworks.join(', '), b: b.frameworks.join(', ') },
  ]

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 mb-6 block">
        ← Back to all libraries
      </Link>

      <h1 className="text-4xl font-bold mb-3">
        {a.name} vs {b.name} (2026)
      </h1>
      <p className="text-gray-600 text-lg mb-10">
        A detailed comparison of {a.name} and {b.name} to help you pick the right icon library for your project.
      </p>

      <table className="w-full border-collapse mb-12">
        <thead>
          <tr className="bg-gray-50">
            <th className="border px-4 py-3 text-left">Feature</th>
            <th className="border px-4 py-3 text-center">{a.name}</th>
            <th className="border px-4 py-3 text-center">{b.name}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.label}>
              <td className="border px-4 py-3 font-medium text-gray-700">{row.label}</td>
              <td className="border px-4 py-3 text-center">{row.a}</td>
              <td className="border px-4 py-3 text-center">{row.b}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="text-2xl font-bold mb-4">Which Should You Choose?</h2>
      <div className="grid grid-cols-2 gap-6 mb-12">
        <div className="border rounded-xl p-6">
          <h3 className="font-bold mb-3">Choose {a.name} if...</h3>
          <ul className="space-y-2">
            {a.pros.map(p => (
              <li key={p} className="text-sm text-gray-600">→ {p}</li>
            ))}
          </ul>
        </div>
        <div className="border rounded-xl p-6">
          <h3 className="font-bold mb-3">Choose {b.name} if...</h3>
          <ul className="space-y-2">
            {b.pros.map(p => (
              <li key={p} className="text-sm text-gray-600">→ {p}</li>
            ))}
          </ul>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4">Installation</h2>
      <div className="grid grid-cols-2 gap-6 mb-12">
        <div>
          <h3 className="font-semibold mb-2">{a.name}</h3>
          <pre className="bg-gray-900 text-green-400 rounded-lg p-4 text-sm overflow-x-auto">
            {a.installCommand}
          </pre>
        </div>
        <div>
          <h3 className="font-semibold mb-2">{b.name}</h3>
          <pre className="bg-gray-900 text-green-400 rounded-lg p-4 text-sm overflow-x-auto">
            {b.installCommand}
          </pre>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4">More Comparisons</h2>
      <div className="flex gap-3 flex-wrap">
        {icons
          .filter(i => i.slug !== a.slug && i.slug !== b.slug)
          .slice(0, 6)
          .map(i => (
            <Link
              key={i.slug}
              href={`/compare/${a.slug}-vs-${i.slug}`}
              className="border rounded-lg px-3 py-2 text-sm hover:bg-gray-50"
            >
              {a.name} vs {i.name}
            </Link>
          ))}
      </div>
    </main>
  )
}
