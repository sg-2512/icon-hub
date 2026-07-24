'use client'

import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import AuthModal from '@/app/components/AuthModal'
import { createClient } from '@/lib/supabase'

type Entitlement = {
  id: string
  product:
    | 'vscode'
    | 'figma'
    | 'chrome'
    | 'framer'
    | 'raycast'
    | 'mcp'
    | 'jetbrains'
    | 'storybook'
    | 'canva'
    | 'tailwind'
    | 'webflow'
    | 'adobe'
  tier: 'free' | 'founder'
  status: 'active' | 'revoked'
  founder_number: number | null
}

const products = [
  { id: 'vscode', label: 'VS Code extension' },
  { id: 'figma', label: 'Figma plugin' },
  { id: 'chrome', label: 'Chrome extension' },
  { id: 'framer', label: 'Framer plugin' },
  { id: 'webflow', label: 'Webflow extension' },
  { id: 'adobe', label: 'Adobe Express plugin' },
  { id: 'raycast', label: 'Raycast extension' },
  { id: 'mcp', label: 'MCP server' },
  { id: 'jetbrains', label: 'JetBrains plugin' },
  { id: 'storybook', label: 'Storybook addon' },
  { id: 'canva', label: 'Canva app' },
  { id: 'tailwind', label: 'Tailwind plugin' },
] as const

export default function AccountClient() {
  const [user, setUser] = useState<User | null>(null)
  const [entitlements, setEntitlements] = useState<Entitlement[]>([])
  const [loading, setLoading] = useState(true)
  const [showAuth, setShowAuth] = useState(false)

  const load = async () => {
    const supabase = await createClient()
    if (!supabase) {
      setLoading(false)
      return
    }

    const { data: userData } = await supabase.auth.getUser()
    setUser(userData.user)
    if (userData.user) {
      const { data } = await supabase
        .from('entitlements')
        .select('id,product,tier,status,founder_number')
        .order('product')
      setEntitlements((data || []) as Entitlement[])
    } else {
      setEntitlements([])
    }
    setLoading(false)
  }

  useEffect(() => {
    // Account state is loaded from the external Supabase session.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load()
  }, [])

  const signOut = async () => {
    const supabase = await createClient()
    await supabase?.auth.signOut()
    setUser(null)
    setEntitlements([])
  }

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '56px 32px', minHeight: '70vh' }}>
      <div style={{ color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', letterSpacing: '0.16em', marginBottom: '12px' }}>
        {'// ACCOUNT'}
      </div>
      <h1 style={{ fontSize: 'clamp(34px, 6vw, 56px)', margin: '0 0 14px' }}>Your IconSearch access</h1>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading account...</p>
      ) : !user ? (
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Sign in to view your products</h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
            One account connects the website, VS Code extension, Figma plugin, Chrome extension, Framer plugin, Raycast extension, MCP server, JetBrains plugin, Storybook addon, Canva app, and Tailwind plugin.
          </p>
          <button suppressHydrationWarning type="button" onClick={() => setShowAuth(true)} style={buttonStyle}>
            Sign in or sign up
          </button>
        </div>
      ) : (
        <>
          <div style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>SIGNED IN AS</div>
              <strong>{user.email}</strong>
            </div>
            <button suppressHydrationWarning type="button" onClick={signOut} style={secondaryButtonStyle}>Sign out</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginTop: '18px' }}>
            {products.map((product) => {
              const entitlement = entitlements.find((item) => item.product === product.id)
              return (
                <div key={product.id} style={cardStyle}>
                  <div style={{ color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', textTransform: 'uppercase' }}>
                    {product.id}
                  </div>
                  <h2 style={{ margin: '8px 0 10px' }}>
                    {product.label}
                  </h2>
                  {entitlement ? (
                    <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
                      <strong style={{ color: 'var(--text)' }}>
                        {entitlement.tier === 'founder' ? `Founder #${entitlement.founder_number}` : 'Free'}
                      </strong>
                      <br />
                      Status: {entitlement.status}
                    </p>
                  ) : (
                    <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
                      Not claimed yet. Start sign-in from this product to claim access.
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onAuthSuccess={() => {
          setShowAuth(false)
          void load()
        }}
        redirectTo="/account"
      />
    </main>
  )
}

const cardStyle: React.CSSProperties = {
  border: '1px solid var(--border)',
  borderRadius: '14px',
  background: 'var(--bg-card)',
  padding: '24px',
}

const buttonStyle: React.CSSProperties = {
  border: 0,
  borderRadius: '9px',
  background: 'var(--accent)',
  color: '#fff',
  cursor: 'pointer',
  fontWeight: 800,
  padding: '11px 16px',
}

const secondaryButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  border: '1px solid var(--border)',
  background: 'transparent',
  color: 'var(--text)',
}
