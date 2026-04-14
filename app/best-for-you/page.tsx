'use client'

import { useState } from 'react'
import Link from 'next/link'

const questions = [
  {
    id: 'framework',
    question: 'What framework are you building with?',
    subtitle: 'This is the most important factor — some libraries have better support for specific frameworks.',
    options: [
      { value: 'react', label: 'React', desc: 'Create React App, Vite, or similar' },
      { value: 'nextjs', label: 'Next.js', desc: 'App Router or Pages Router' },
      { value: 'vue', label: 'Vue 3', desc: 'Vue 3 or Nuxt' },
      { value: 'svelte', label: 'Svelte / SvelteKit', desc: 'Svelte 4, 5 or SvelteKit' },
      { value: 'vanilla', label: 'Vanilla HTML/CSS', desc: 'No framework, just HTML' },
      { value: 'unsure', label: 'Not sure yet', desc: 'Still deciding on the stack' },
    ],
  },
  {
    id: 'style',
    question: 'What icon style fits your design?',
    subtitle: 'Choose based on your overall UI aesthetic — this affects which libraries qualify.',
    options: [
      { value: 'outline', label: 'Outline / Minimal', desc: 'Clean, lightweight, modern feel' },
      { value: 'filled', label: 'Filled / Bold', desc: 'Strong, high-contrast, prominent' },
      { value: 'both', label: 'Both styles', desc: 'I need active and inactive variants' },
      { value: 'duotone', label: 'Duotone', desc: 'Premium two-color effect' },
      { value: 'any', label: 'No preference', desc: 'Whatever looks best' },
    ],
  },
  {
    id: 'volume',
    question: 'How many unique icons do you need?',
    subtitle: 'Be honest — most apps need fewer icons than developers think.',
    options: [
      { value: 'small', label: 'Under 300', desc: 'Basic UI — nav, buttons, forms only' },
      { value: 'medium', label: '300 to 1,500', desc: 'Most apps are covered here' },
      { value: 'large', label: '1,500+', desc: 'Need niche or specialized icons too' },
    ],
  },
  {
    id: 'typescript',
    question: 'Is TypeScript support required?',
    subtitle: 'TypeScript support means autocomplete and typed props in VS Code.',
    options: [
      { value: 'required', label: 'Yes, required', desc: 'I need full autocomplete and type safety' },
      { value: 'nice', label: 'Nice to have', desc: 'Preferred but not blocking' },
      { value: 'no', label: 'No preference', desc: 'Not using TypeScript' },
    ],
  },
  {
    id: 'project',
    question: 'What type of project is this?',
    subtitle: 'Different projects have different icon needs.',
    options: [
      { value: 'saas', label: 'SaaS / Dashboard', desc: 'Admin panels, analytics, management tools' },
      { value: 'marketing', label: 'Marketing / Landing page', desc: 'Product sites, portfolios, promos' },
      { value: 'mobile', label: 'Mobile web / PWA', desc: 'Touch-first, responsive apps' },
      { value: 'devtool', label: 'Developer tool / Docs', desc: 'Technical audience, code-focused' },
      { value: 'ecommerce', label: 'Ecommerce', desc: 'Shopping, payments, product pages' },
      { value: 'personal', label: 'Personal / Portfolio', desc: 'Side project or portfolio site' },
    ],
  },
  {
    id: 'tailwind',
    question: 'Are you using Tailwind CSS?',
    subtitle: 'One library is made specifically by the Tailwind team.',
    options: [
      { value: 'yes', label: 'Yes', desc: 'Tailwind CSS is my styling solution' },
      { value: 'no', label: 'No', desc: 'Using CSS modules, styled-components, or other' },
    ],
  },
]

type Answers = Record<string, string>

type Result = {
  primary: {
    slug: string
    name: string
    reason: string
    installCommand: string
    tags: string[]
  }
  secondary: {
    slug: string
    name: string
    reason: string
  } | null
  summary: string
}

function getResult(answers: Answers): Result {
  const { framework, style, volume, typescript, project, tailwind } = answers

  // Tailwind + Heroicons match
  if (tailwind === 'yes' && (style === 'outline' || style === 'both' || style === 'any') && volume !== 'large') {
    return {
      primary: {
        slug: 'heroicons',
        name: 'Heroicons',
        reason: 'You are using Tailwind CSS and Heroicons is made by the exact same team. The design language matches perfectly and it integrates seamlessly with Tailwind utility classes. It is the natural first choice for any Tailwind project.',
        installCommand: 'npm install @heroicons/react',
        tags: ['Made by Tailwind team', 'TypeScript', 'Tree-shakable', 'MIT License'],
      },
      secondary: {
        slug: 'lucide-icons',
        name: 'Lucide Icons',
        reason: 'If you need more than 292 icons, Lucide Icons is the best Tailwind-compatible alternative with 1,400+ icons and the same className API.',
      },
      summary: 'Tailwind CSS + Heroicons is the most natural pairing in the React ecosystem. The same team built both.',
    }
  }

  // Duotone → Phosphor
  if (style === 'duotone') {
    return {
      primary: {
        slug: 'phosphor-icons',
        name: 'Phosphor Icons',
        reason: 'You specifically need duotone icons. Phosphor Icons is the only major free icon library that offers duotone as a built-in weight variant. No other library on this list supports this style natively.',
        installCommand: 'npm install @phosphor-icons/react',
        tags: ['6 weight variants', 'Duotone', 'TypeScript', 'MIT License'],
      },
      secondary: {
        slug: 'tabler-icons',
        name: 'Tabler Icons',
        reason: 'If duotone is not strictly necessary, Tabler Icons offers both outline and filled styles with 5,500+ icons.',
      },
      summary: 'For duotone icons, Phosphor Icons is the only serious option in the free tier.',
    }
  }

  // Svelte → Lucide Svelte
  if (framework === 'svelte') {
    return {
      primary: {
        slug: 'lucide-icons',
        name: 'Lucide Icons',
        reason: 'For Svelte and SvelteKit, Lucide Icons has the most polished official Svelte package — lucide-svelte. It is the only major icon library with a dedicated, actively maintained Svelte package with TypeScript support.',
        installCommand: 'npm install lucide-svelte',
        tags: ['Official Svelte package', 'TypeScript', 'Tree-shakable', 'ISC License'],
      },
      secondary: {
        slug: 'tabler-icons',
        name: 'Tabler Icons',
        reason: 'Tabler Icons also has an official Svelte package with 5,500+ icons if you need a larger selection.',
      },
      summary: 'Lucide Svelte is the gold standard for icon libraries in the Svelte ecosystem.',
    }
  }

  // Vue → Lucide Vue Next
  if (framework === 'vue') {
    return {
      primary: {
        slug: 'lucide-icons',
        name: 'Lucide Icons',
        reason: 'For Vue 3, Lucide Vue Next is the top recommendation. It has an official package with full TypeScript support, tree-shaking, and active maintenance. It covers the vast majority of Vue projects perfectly.',
        installCommand: 'npm install lucide-vue-next',
        tags: ['Official Vue package', 'TypeScript', 'Tree-shakable', 'ISC License'],
      },
      secondary: {
        slug: 'tabler-icons',
        name: 'Tabler Icons',
        reason: 'For Vue projects needing 5,500+ icons, Tabler Icons Vue is the best alternative.',
      },
      summary: 'Lucide Vue Next is the most popular and well-maintained icon library for Vue 3.',
    }
  }

  // Large volume → Tabler
  if (volume === 'large') {
    return {
      primary: {
        slug: 'tabler-icons',
        name: 'Tabler Icons',
        reason: 'You need 1,500+ icons. Tabler Icons is the clear winner here with 5,500+ icons — the largest free icon library available. It covers everything from common UI symbols to highly specialized icons for medicine, finance, weather, and more.',
        installCommand: 'npm install @tabler/icons-react',
        tags: ['5,500+ icons', 'Outline + Filled', 'TypeScript', 'MIT License'],
      },
      secondary: {
        slug: 'phosphor-icons',
        name: 'Phosphor Icons',
        reason: 'If you need multiple weights including duotone alongside a large collection, Phosphor Icons with 1,248 icons in 6 weights is a strong alternative.',
      },
      summary: 'When icon volume is the priority, Tabler Icons is unmatched in the free tier.',
    }
  }

  // Developer tool → Lucide or Radix
  if (project === 'devtool') {
    return {
      primary: {
        slug: 'lucide-icons',
        name: 'Lucide Icons',
        reason: 'Developer tools need clean, precise, monochrome icons that communicate technical concepts clearly. Lucide Icons is the community standard for developer-facing React applications in 2026. Its minimal style matches the aesthetic expectations of a technical audience.',
        installCommand: 'npm install lucide-react',
        tags: ['Community standard', 'TypeScript', 'Tree-shakable', 'ISC License'],
      },
      secondary: {
        slug: 'radix-icons',
        name: 'Radix Icons',
        reason: 'For dense technical UIs like code editors and toolbars, Radix Icons at 15x15 are specifically designed for high-density developer interfaces.',
      },
      summary: 'Lucide Icons is the default choice for developer tools in the React ecosystem.',
    }
  }

  // TypeScript required + small/medium → Lucide
  if (typescript === 'required' && volume !== 'large') {
    return {
      primary: {
        slug: 'lucide-icons',
        name: 'Lucide Icons',
        reason: 'You require TypeScript support and your volume is within Lucide\'s 1,400 icon range. Lucide has first-class TypeScript definitions with full autocomplete — type any icon name in VS Code and it appears instantly. It is the best overall TypeScript icon experience available for free.',
        installCommand: 'npm install lucide-react',
        tags: ['First-class TypeScript', 'Tree-shakable', '1,400+ icons', 'ISC License'],
      },
      secondary: {
        slug: 'heroicons',
        name: 'Heroicons',
        reason: 'If you are on Tailwind CSS, Heroicons offers the same TypeScript quality with tighter Tailwind integration.',
      },
      summary: 'For TypeScript-first projects with standard icon needs, Lucide Icons is the clear winner.',
    }
  }

  // Filled style only → Tabler or Phosphor
  if (style === 'filled') {
    return {
      primary: {
        slug: 'tabler-icons',
        name: 'Tabler Icons',
        reason: 'You specifically need filled icons. Tabler Icons offers both outline and filled variants for most of its 5,500+ icons — more filled icons than any other free library. The filled variants are named consistently with their outline counterparts.',
        installCommand: 'npm install @tabler/icons-react',
        tags: ['Outline + Filled', '5,500+ icons', 'TypeScript', 'MIT License'],
      },
      secondary: {
        slug: 'phosphor-icons',
        name: 'Phosphor Icons',
        reason: 'Phosphor Icons also has a fill weight alongside 5 other styles. Its duotone weight is unique if you want to go beyond standard filled icons.',
      },
      summary: 'For filled icon styles, Tabler Icons has the largest selection of any free library.',
    }
  }

  // Vanilla HTML → Remix Icon or Bootstrap Icons
  if (framework === 'vanilla') {
    return {
      primary: {
        slug: 'bootstrap-icons',
        name: 'Bootstrap Icons',
        reason: 'For vanilla HTML and CSS projects without a JavaScript framework, Bootstrap Icons is the most practical choice. The CSS font approach means you add one CSS import and use class names directly in HTML — no build step, no JavaScript, no npm required.',
        installCommand: 'npm install bootstrap-icons',
        tags: ['CSS font approach', '1,800+ icons', 'Outline + Filled', 'MIT License'],
      },
      secondary: {
        slug: 'remix-icon',
        name: 'Remix Icon',
        reason: 'Remix Icon also works well in vanilla HTML with its CSS font approach and offers 2,800+ icons.',
      },
      summary: 'For vanilla HTML projects, CSS font icon libraries work better than SVG component libraries.',
    }
  }

  // Default → Lucide
  return {
    primary: {
      slug: 'lucide-icons',
      name: 'Lucide Icons',
      reason: 'Based on your answers, Lucide Icons is the best all-around choice. It is the most popular free icon library for React and Next.js in 2026, with 1,400+ icons, full TypeScript support, tree-shaking, and active maintenance. It hits the sweet spot between icon count, design quality, and developer experience.',
      installCommand: 'npm install lucide-react',
      tags: ['Most popular in 2026', 'TypeScript', 'Tree-shakable', 'ISC License'],
    },
    secondary: {
      slug: 'heroicons',
      name: 'Heroicons',
      reason: 'If you are using Tailwind CSS, Heroicons by the Tailwind team is an excellent alternative with tighter design system integration.',
    },
    summary: 'For most React and Next.js projects in 2026, Lucide Icons is the safe default recommendation.',
  }
}

export default function BestForYouPage() {
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [result, setResult] = useState<Result | null>(null)
  const [selected, setSelected] = useState<string | null>(null)

  const progress = (currentQ / questions.length) * 100

  function handleSelect(value: string) {
    setSelected(value)
  }

  function handleNext() {
    if (!selected) return
    const newAnswers = { ...answers, [questions[currentQ].id]: selected }
    setAnswers(newAnswers)
    setSelected(null)

    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1)
    } else {
      setResult(getResult(newAnswers))
    }
  }

  function handleBack() {
    if (currentQ > 0) {
      setCurrentQ(currentQ - 1)
      setSelected(answers[questions[currentQ - 1].id] || null)
    }
  }

  function handleRestart() {
    setCurrentQ(0)
    setAnswers({})
    setResult(null)
    setSelected(null)
  }

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 48px' }}>

      {/* Header */}
      <section style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: '12px', color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '12px' }}>
          // SELECTOR TOOL
        </div>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, lineHeight: 1.1, marginBottom: '16px' }}>
          Find Your<br />
          <span style={{ color: 'var(--accent)' }}>Perfect Icon Library</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '18px', maxWidth: '500px' }}>
          Answer 6 quick questions and get a personalized recommendation based on your exact stack, style, and project type.
        </p>
      </section>

      {!result ? (
        <div style={{ maxWidth: '720px' }}>

          {/* Progress bar */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                Question {currentQ + 1} of {questions.length}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace' }}>
                {Math.round(progress)}% complete
              </span>
            </div>
            <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'var(--accent)', borderRadius: '2px', width: `${progress}%`, transition: 'width 0.3s ease' }} />
            </div>
          </div>

          {/* Question */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px', lineHeight: 1.3 }}>
              {questions[currentQ].question}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              {questions[currentQ].subtitle}
            </p>
          </div>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
            {questions[currentQ].options.map(option => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                style={{
                  background: selected === option.value ? 'var(--accent-dim)' : 'var(--bg-card)',
                  border: `1px solid ${selected === option.value ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: '10px',
                  padding: '16px 20px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.15s',
                  width: '100%',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '15px', color: selected === option.value ? 'var(--accent)' : 'var(--text)', marginBottom: '3px' }}>
                    {option.label}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    {option.desc}
                  </div>
                </div>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: `2px solid ${selected === option.value ? 'var(--accent)' : 'var(--border)'}`,
                  background: selected === option.value ? 'var(--accent)' : 'transparent',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {selected === option.value && (
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white' }} />
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', gap: '12px' }}>
            {currentQ > 0 && (
              <button
                onClick={handleBack}
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-muted)', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px' }}
              >
                ← Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!selected}
              style={{
                background: selected ? 'var(--accent)' : 'var(--bg-secondary)',
                border: `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                color: selected ? 'white' : 'var(--text-dim)',
                padding: '12px 32px',
                borderRadius: '8px',
                cursor: selected ? 'pointer' : 'not-allowed',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '13px',
                fontWeight: 600,
                transition: 'all 0.15s',
              }}
            >
              {currentQ < questions.length - 1 ? 'Next Question →' : 'Get My Recommendation →'}
            </button>
          </div>

        </div>
      ) : (
        <div style={{ maxWidth: '800px' }}>

          {/* Result header */}
          <div style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent)', borderRadius: '12px', padding: '20px 24px', marginBottom: '32px' }}>
            <div style={{ fontSize: '12px', color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '8px' }}>
              // YOUR RESULT
            </div>
            <p style={{ color: 'var(--text)', fontSize: '16px', lineHeight: 1.7 }}>
              {result.summary}
            </p>
          </div>

          {/* Primary recommendation */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--accent)', borderRadius: '12px', padding: '32px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '8px' }}>
                  ★ PRIMARY RECOMMENDATION
                </div>
                <h2 style={{ fontSize: '32px', fontWeight: 800 }}>{result.primary.name}</h2>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {result.primary.tags.map(tag => (
                  <span key={tag} style={{ fontSize: '11px', color: 'var(--green)', background: '#4ade8015', border: '1px solid var(--green)', padding: '3px 8px', borderRadius: '4px', fontFamily: 'JetBrains Mono, monospace' }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.8, marginBottom: '24px' }}>
              {result.primary.reason}
            </p>

            <pre style={{ background: 'var(--code-bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '14px 18px', fontFamily: 'JetBrains Mono, monospace', fontSize: '14px', color: 'var(--green)', marginBottom: '20px', overflowX: 'auto' }}>
              {result.primary.installCommand}
            </pre>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link href={`/icons/${result.primary.slug}`} style={{ background: 'var(--accent)', color: 'white', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                Full Guide →
              </Link>
              <Link href={`/compare/${result.primary.slug}-vs-${result.secondary?.slug || 'heroicons'}`} style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', border: '1px solid var(--border)', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontFamily: 'JetBrains Mono, monospace' }}>
                Compare with alternatives →
              </Link>
            </div>
          </div>

          {/* Secondary recommendation */}
          {result.secondary && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', marginBottom: '32px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '10px' }}>
                RUNNER UP
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '10px' }}>{result.secondary.name}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.7, marginBottom: '14px' }}>
                {result.secondary.reason}
              </p>
              <Link href={`/icons/${result.secondary.slug}`} style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '13px', fontFamily: 'JetBrains Mono, monospace' }}>
                View {result.secondary.name} guide →
              </Link>
            </div>
          )}

          {/* Your answers summary */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', marginBottom: '32px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '16px' }}>
              YOUR ANSWERS
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {Object.entries(answers).map(([key, value]) => (
                <span key={key} style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '4px 10px', borderRadius: '4px', fontFamily: 'JetBrains Mono, monospace' }}>
                  {key}: {value}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={handleRestart}
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-muted)', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px' }}
            >
              ← Start Over
            </button>
            <Link href="/compare" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-muted)', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px' }}>
              Browse all comparisons →
            </Link>
            <Link href="/stats" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-muted)', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px' }}>
              View stats & rankings →
            </Link>
          </div>

        </div>
      )}

    </main>
  )
}