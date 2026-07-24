'use client'

import { useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient, isSupabaseConfigured } from '@/lib/supabase'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onAuthSuccess: (user: User) => void
  redirectTo?: string
}

function getDisplayAuthError(message: string) {
  if (message.toLowerCase().includes('database error saving new user')) {
    return 'Account creation is temporarily unavailable. Please try again shortly.'
  }

  return message
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess, redirectTo }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [infoMsg, setInfoMsg] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const isConfigured = isSupabaseConfigured()

  const getCallbackUrl = () => {
    const next = redirectTo || `${window.location.pathname}${window.location.search}`
    const callback = new URL('/auth/callback', window.location.origin)
    callback.searchParams.set('next', next.startsWith('/') ? next : '/account')
    return callback.toString()
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setInfoMsg('')

    if (!isConfigured) {
      setErrorMsg(
        'Supabase is not configured yet. Please update the environment keys in your local .env.local file to enable database and authentication features.'
      )
      return
    }

    const supabase = await createClient()
    if (!supabase) {
      setErrorMsg('Failed to initialize Supabase client.')
      return
    }

    setLoading(true)

    try {
      if (isSignUp) {
        // Sign Up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: getCallbackUrl(),
          },
        })

        if (error) {
          if (error.message.toLowerCase().includes('already registered') || error.message.toLowerCase().includes('already been registered')) {
            const signInRes = await supabase.auth.signInWithPassword({ email, password })
            if (signInRes.error) {
              setErrorMsg(getDisplayAuthError(signInRes.error.message))
            } else if (signInRes.data?.user) {
              onAuthSuccess(signInRes.data.user)
              onClose()
            }
          } else {
            setErrorMsg(getDisplayAuthError(error.message))
          }
        } else if (data?.user && !data.session) {
          // Typically email verification is enabled by default in Supabase
          setInfoMsg('Registration successful! Please check your email inbox to confirm your account.')
        } else if (data?.session) {
          onAuthSuccess(data.session.user)
          onClose()
        }
      } else {
        // Sign In
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          setErrorMsg(getDisplayAuthError(error.message))
        } else if (data?.user) {
          onAuthSuccess(data.user)
          onClose()
        }
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuth = async (provider: 'google' | 'github') => {
    setErrorMsg('')
    setInfoMsg('')

    if (!isConfigured) {
      setErrorMsg(
        `OAuth via ${provider} requires your Supabase credentials to be configured in .env.local and OAuth enabled in your Supabase project dashboard.`
      )
      return
    }

    const supabase = await createClient()
    if (!supabase) return

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: getCallbackUrl(),
        },
      })
      if (error) {
        setErrorMsg(error.message)
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'An unexpected error occurred during social login.')
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(9, 9, 11, 0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999,
      padding: '20px',
    }}>
      {/* Modal Wrapper */}
      <div style={{
        background: 'rgba(17, 17, 27, 0.75)',
        border: '1px solid rgba(139, 92, 246, 0.3)', // Purple neon border glow
        borderRadius: '16px',
        padding: '32px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 0 30px rgba(139, 92, 246, 0.15), 0 20px 25px -5px rgb(0 0 0 / 0.5)',
        position: 'relative',
        animation: 'modalSlideIn 0.3s ease-out',
        fontFamily: 'Inter, sans-serif',
      }}>
        
        {/* Style definitions for the modal entry keyframes */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes modalSlideIn {
            from { transform: translateY(15px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}} />

        {/* Close Button */}
        <button suppressHydrationWarning 
          onClick={onClose}
          aria-label="Close sign in dialog"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted, #94a3b8)',
            cursor: 'pointer',
            fontSize: '18px',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#f43f5e'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted, #94a3b8)'}
        >
          ✕
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '-0.025em',
            margin: '0 0 8px 0',
            fontFamily: 'JetBrains Mono, monospace',
          }}>
            <span style={{ color: 'rgba(139, 92, 246, 1)' }}>&lt;</span>
            {isSignUp ? 'Join Hub' : 'Welcome Back'}
            <span style={{ color: 'rgba(139, 92, 246, 1)' }}>/&gt;</span>
          </h2>
          <p style={{
            fontSize: '13px',
            color: 'var(--text-muted, #94a3b8)',
            margin: 0,
          }}>
            {isSignUp 
              ? 'Create a cloud account to sync your custom workspaces.' 
              : 'Sign in to access your cloud-saved icon packs and presets.'}
          </p>
        </div>

        {/* Not Configured Alert */}
        {!isConfigured && (
          <div style={{
            background: 'rgba(234, 179, 8, 0.1)',
            border: '1px solid rgba(234, 179, 8, 0.3)',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px',
            fontSize: '12px',
            color: '#fef08a',
            lineHeight: '1.5',
          }}>
            <strong>Notice:</strong> Local-only mode. Provide real Supabase credentials in your <code>.env.local</code> to test live backend syncs.
          </div>
        )}

        {/* Messages */}
        {errorMsg && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px',
            fontSize: '13px',
            color: '#fca5a5',
            lineHeight: '1.4',
          }}>
            {errorMsg}
          </div>
        )}

        {infoMsg && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px',
            fontSize: '13px',
            color: '#a7f3d0',
            lineHeight: '1.4',
          }}>
            {infoMsg}
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-muted, #94a3b8)',
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Email Address
            </label>
            <input suppressHydrationWarning 
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{
                width: '100%',
                background: 'rgba(9, 9, 11, 0.5)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.2s',
              }}
              onFocus={(e) => {
                e.target.style.border = '1px solid rgba(139, 92, 246, 0.7)'
                e.target.style.boxShadow = '0 0 8px rgba(139, 92, 246, 0.3)'
              }}
              onBlur={(e) => {
                e.target.style.border = '1px solid rgba(139, 92, 246, 0.2)'
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-muted, #94a3b8)',
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Password
            </label>
            <input suppressHydrationWarning 
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                background: 'rgba(9, 9, 11, 0.5)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.2s',
              }}
              onFocus={(e) => {
                e.target.style.border = '1px solid rgba(139, 92, 246, 0.7)'
                e.target.style.boxShadow = '0 0 8px rgba(139, 92, 246, 0.3)'
              }}
              onBlur={(e) => {
                e.target.style.border = '1px solid rgba(139, 92, 246, 0.2)'
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>

          <button suppressHydrationWarning
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 10px rgba(139, 92, 246, 0.25)',
              marginTop: '4px',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.opacity = '0.9'
                e.currentTarget.style.boxShadow = '0 6px 15px rgba(139, 92, 246, 0.4)'
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.opacity = '1'
                e.currentTarget.style.boxShadow = '0 4px 10px rgba(139, 92, 246, 0.25)'
              }
            }}
          >
            {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          margin: '20px 0',
        }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
          <span style={{ fontSize: '11px', color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase' }}>or continue with</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
        </div>

        {/* Social Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
          {/* GitHub */}
          <button suppressHydrationWarning
            onClick={() => handleOAuth('github')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '10px',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
              e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
              e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <svg style={{ width: '16px', height: '16px', fill: '#currentColor' }} viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            GitHub
          </button>

          {/* Google */}
          <button suppressHydrationWarning
            onClick={() => handleOAuth('google')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '10px',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
              e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
              e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <svg style={{ width: '16px', height: '16px' }} viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.927h6.6a5.64 5.64 0 0 1-2.44 3.702v3.08h3.94c2.3-2.12 3.645-5.243 3.645-8.639z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.94-3.08c-1.1.74-2.51 1.18-3.99 1.18-3.07 0-5.67-2.08-6.6-4.88H1.36v3.18C3.33 21.3 7.39 24 12 24z"/>
              <path fill="#FBBC05" d="M5.4 14.31A7.16 7.16 0 0 1 5 12c0-.81.14-1.6.4-2.31V6.51H1.36A11.93 11.93 0 0 0 0 12c0 1.92.45 3.74 1.25 5.37l4.15-3.06z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.39 0 3.33 2.7 1.36 6.51l4.04 3.18c.93-2.8 3.53-4.88 6.6-4.88z"/>
            </svg>
            Google
          </button>
        </div>

        {/* Footer Toggle */}
        <div style={{
          textAlign: 'center',
          fontSize: '13px',
          color: 'var(--text-muted, #94a3b8)',
        }}>
          {isSignUp ? 'Already have an account?' : 'New to Icon Hub?'}
          <button suppressHydrationWarning
            onClick={() => {
              setIsSignUp(!isSignUp)
              setErrorMsg('')
              setInfoMsg('')
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(139, 92, 246, 1)',
              fontWeight: 600,
              cursor: 'pointer',
              marginLeft: '6px',
              padding: 0,
              textDecoration: 'underline',
            }}
          >
            {isSignUp ? 'Sign In' : 'Sign Up Free'}
          </button>
        </div>

      </div>
    </div>
  )
}
