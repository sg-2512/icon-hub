'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import AuthModal from '@/app/components/AuthModal'
import { createClient, isSupabaseConfigured } from '@/lib/supabase'

type ConnectClientProps = {
  product: string
  code: string
  authError: string
}

type Approval = {
  product: string
  tier: 'free' | 'founder'
  founderNumber: number | null
}

const productNames: Record<string, string> = {
  vscode: 'VS Code extension',
  figma: 'Figma plugin',
  chrome: 'Chrome extension',
  framer: 'Framer plugin',
  raycast: 'Raycast extension',
  mcp: 'MCP server',
  jetbrains: 'JetBrains plugin',
  storybook: 'Storybook addon',
  canva: 'Canva app',
  tailwind: 'Tailwind plugin',
  webflow: 'Webflow extension',
  adobe: 'Adobe Express plugin',
  wordpress: 'WordPress plugin',
  penpot: 'Penpot plugin',
}

const productShortNames: Record<string, string> = {
  vscode: 'VS Code',
  figma: 'Figma',
  chrome: 'Chrome',
  framer: 'Framer',
  raycast: 'Raycast',
  mcp: 'MCP',
  jetbrains: 'JetBrains',
  storybook: 'Storybook',
  canva: 'Canva',
  tailwind: 'Tailwind',
  webflow: 'Webflow',
  adobe: 'Adobe Express',
  wordpress: 'WordPress',
  penpot: 'Penpot',
}

export default function ConnectClient({ product, code, authError }: ConnectClientProps) {
  const [user, setUser] = useState<User | null>(null)
  const [checkingUser, setCheckingUser] = useState(true)
  const [showAuth, setShowAuth] = useState(false)
  const [approving, setApproving] = useState(false)
  const [error, setError] = useState(authError)
  const [approval, setApproval] = useState<Approval | null>(null)

  const validRequest = Boolean(productNames[product] && code.length >= 20)
  const redirectTo = useMemo(
    () => `/connect?product=${encodeURIComponent(product)}&code=${encodeURIComponent(code)}`,
    [code, product]
  )
  const productLabel = productNames[product] || 'IconSearch app'

  useEffect(() => {
    let unsubscribe = () => {}

    void (async () => {
      const supabase = await createClient()
      if (!supabase) {
        setCheckingUser(false)
        return
      }

      const { data } = await supabase.auth.getUser()
      setUser(data.user)
      setCheckingUser(false)

      const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null)
      })
      unsubscribe = () => subscription.subscription.unsubscribe()
    })()

    return () => unsubscribe()
  }, [])

  const approve = async () => {
    setApproving(true)
    setError('')

    try {
      const response = await fetch('/api/device/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product, code }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Could not approve this device.')

      setApproval({
        product: payload.product,
        tier: payload.tier,
        founderNumber: payload.founderNumber ?? null,
      })
    } catch (approvalError) {
      setError(approvalError instanceof Error ? approvalError.message : 'Could not approve this device.')
    } finally {
      setApproving(false)
    }
  }

  return (
    <main className="connect-page">
      <div className="connect-bg-grid" aria-hidden="true" />
      <div className="connect-bg-orb connect-bg-orb-one" aria-hidden="true" />
      <div className="connect-bg-orb connect-bg-orb-two" aria-hidden="true" />

      <Link href="/" className="connect-brand" aria-label="IconSearch home">
        <span className="connect-brand-mark">IS</span>
        <span>IconSearch</span>
      </Link>

      <section className="connect-card" aria-labelledby="connect-title">
        <div className="connect-card-main">
          <div className="connect-kicker">{'// SECURE DEVICE CONNECTION'}</div>
          <h1 id="connect-title">Connect IconSearch</h1>
          <p className="connect-lede">
            <strong>{productLabel}</strong> is requesting access to your IconSearch account.
            Sign in on the website, approve once, then return to the app.
          </p>

          {!validRequest ? (
            <StatusCard tone="error" title="This connection link is invalid">
              Start sign-in again from the IconSearch extension or plugin. Device links expire after 30 minutes.
            </StatusCard>
          ) : approval ? (
            <StatusCard tone="success" title="Connection approved">
              {approval.tier === 'founder' && approval.founderNumber
                ? `You claimed lifetime Founder access #${approval.founderNumber} for the ${productNames[approval.product]}.`
                : `Your free ${productNames[approval.product]} access is active.`}
              {' '}You can close this browser tab and return to the app.
            </StatusCard>
          ) : (
            <>
              {error && (
                <StatusCard tone="error" title="Could not connect">
                  {error}
                </StatusCard>
              )}

              {!isSupabaseConfigured() ? (
                <StatusCard tone="error" title="Authentication is not configured">
                  Add the Supabase environment variables to the website before testing extension sign-in.
                </StatusCard>
              ) : checkingUser ? (
                <StatusCard tone="neutral" title="Checking your account">
                  One moment while IconSearch verifies your browser session.
                </StatusCard>
              ) : user ? (
                <div className="connect-action-stack">
                  <div className="connect-account-box">
                    <span>Signed in as</span>
                    <strong>{user.email}</strong>
                  </div>
                  <button suppressHydrationWarning
                    type="button"
                    onClick={approve}
                    disabled={approving}
                    className="connect-primary-button"
                  >
                    {approving ? 'Approving...' : `Approve ${productLabel}`}
                  </button>
                </div>
              ) : (
                <div className="connect-action-stack">
                  <button suppressHydrationWarning type="button" onClick={() => setShowAuth(true)} className="connect-primary-button">
                    Sign in or create a free account
                  </button>
                  <p className="connect-founder-note">
                    The first 500 verified users of each product receive lifetime Founder access.
                  </p>
                </div>
              )}
            </>
          )}

          <div className="connect-disclosure">
            Approving shares only your account email, product entitlement, and an opaque revocable session token.
            {' '}Read the <Link href="/privacy-policy">Privacy Policy</Link> and <Link href="/terms">Terms</Link>.
          </div>
        </div>

        <div className="connect-side-panel">
          <div className="connect-product-pill">
            <span>{productShortNames[product] || 'App'}</span>
            <strong>Free launch</strong>
          </div>
          <div className="connect-step-list">
            <div>
              <span>1</span>
              <p>Sign in securely on iconsearch.info.</p>
            </div>
            <div>
              <span>2</span>
              <p>Approve this short-lived device link.</p>
            </div>
            <div>
              <span>3</span>
              <p>Return to the app and start searching live icons.</p>
            </div>
          </div>
          <div className="connect-security-note">
            Your password never enters the extension or plugin. The app stores only a revocable session token.
          </div>
        </div>
      </section>

      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onAuthSuccess={(signedInUser) => {
          setUser(signedInUser)
          setShowAuth(false)
        }}
        redirectTo={redirectTo}
      />
    </main>
  )
}

function StatusCard({
  tone,
  title,
  children,
}: {
  tone: 'success' | 'error' | 'neutral'
  title: string
  children: React.ReactNode
}) {
  const colors = {
    success: { border: 'rgba(16,185,129,.45)', bg: 'rgba(16,185,129,.1)', text: '#6ee7b7' },
    error: { border: 'rgba(244,63,94,.45)', bg: 'rgba(244,63,94,.1)', text: '#fda4af' },
    neutral: { border: 'var(--border)', bg: 'rgba(148,163,184,.06)', text: 'var(--text-muted)' },
  }[tone]

  return (
    <div className="connect-status-card" style={{ borderColor: colors.border, background: colors.bg }}>
      <strong>{title}</strong>
      <span style={{ color: colors.text }}>{children}</span>
    </div>
  )
}
