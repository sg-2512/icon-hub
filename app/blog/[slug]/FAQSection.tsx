'use client'

import { useState } from 'react'

type FAQ = { q: string; a: string }

function FAQItem({ q, a }: FAQ) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      overflow: 'hidden',
      marginBottom: '8px',
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          padding: '18px 20px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          textAlign: 'left',
        }}
      >
        <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text)', lineHeight: 1.4 }}>
          <span style={{ color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', marginRight: '8px', fontSize: '13px' }}>Q.</span>
          {q}
        </span>
        <span style={{
          color: 'var(--accent)',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '20px',
          flexShrink: 0,
          transition: 'transform 0.2s',
          transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
          display: 'inline-block',
        }}>
          +
        </span>
      </button>
      {open && (
        <div style={{ padding: '0 20px 18px', borderTop: '1px solid var(--border)' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.8, marginTop: '14px' }}>
            <span style={{ color: 'var(--green)', fontFamily: 'JetBrains Mono, monospace', marginRight: '8px', fontSize: '13px' }}>A.</span>
            {a}
          </p>
        </div>
      )}
    </div>
  )
}

export default function FAQSection({ faqs }: { faqs: FAQ[] }) {
  return (
    <div>
      {faqs.map((faq, i) => (
        <FAQItem key={i} q={faq.q} a={faq.a} />
      ))}
    </div>
  )
}