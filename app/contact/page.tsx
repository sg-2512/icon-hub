export const metadata = {
  title: 'Contact — IconHub',
  description: 'Get in touch with the IconHub team. We welcome feedback, suggestions, and partnership inquiries.',
}

export default function ContactPage() {
  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 48px' }}>

      <section style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: '12px', color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '12px' }}>
          // CONTACT
        </div>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, lineHeight: 1.1, marginBottom: '16px' }}>
          Get in Touch
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '18px', maxWidth: '500px' }}>
          Have a suggestion, found an error, or want to partner with us? We would love to hear from you.
        </p>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', maxWidth: '900px' }}>

        {/* Contact Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '8px' }}>
            CONTACT DETAILS
          </h2>
          {[
            { label: 'General Enquiries', value: 'hello@iconhub.dev', icon: '✉' },
            { label: 'Privacy & Legal', value: 'privacy@iconhub.dev', icon: '⚖' },
            { label: 'Partnerships', value: 'partners@iconhub.dev', icon: '🤝' },
            { label: 'Report an Error', value: 'errors@iconhub.dev', icon: '🐛' },
          ].map(item => (
            <div key={item.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px 20px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '6px', letterSpacing: '1px' }}>
                {item.icon} {item.label.toUpperCase()}
              </div>
              <a href={`mailto:${item.value}`} style={{ color: 'var(--accent)', textDecoration: 'none', fontFamily: 'JetBrains Mono, monospace', fontSize: '14px' }}>
                {item.value}
              </a>
            </div>
          ))}
        </div>

        {/* Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '8px' }}>
            ABOUT ICONHUB
          </h2>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.8, marginBottom: '16px' }}>
              IconHub is an independent developer resource. We are not affiliated with any of the icon libraries featured on this site.
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.8, marginBottom: '16px' }}>
              We welcome contributions, corrections, and suggestions. If you notice incorrect data about any icon library, please email us and we will update it promptly.
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.8 }}>
              Response time: typically within 48 hours on business days.
            </p>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '12px', letterSpacing: '1px' }}>
              📍 LOCATION
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.8 }}>
              Chandigarh, India<br />
              Operating globally · Remote team
            </p>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '12px', letterSpacing: '1px' }}>
              🕐 RESPONSE TIME
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.8 }}>
              Monday – Friday<br />
              9:00 AM – 6:00 PM IST<br />
              Typically within 48 hours
            </p>
          </div>
        </div>

      </div>

      {/* FAQ */}
      <section style={{ marginTop: '64px', maxWidth: '900px' }}>
        <h2 style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '20px' }}>
          FREQUENTLY ASKED
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { q: 'Can I suggest a new icon library to be added?', a: 'Yes! Email us at hello@iconhub.dev with the library name, GitHub link, and why you think it should be featured. We review all suggestions.' },
            { q: 'I found incorrect data on your site. How do I report it?', a: 'Please email errors@iconhub.dev with the specific page URL and the correct information. We aim to fix errors within 24 hours.' },
            { q: 'Can I advertise on IconHub?', a: 'We currently serve ads through Google AdSense. For direct partnerships or sponsored content enquiries, contact partners@iconhub.dev.' },
            { q: 'Can I use your content on my site?', a: 'Our content is original and copyrighted. You may quote small excerpts with attribution and a link back to the original page. Full reproduction is not permitted.' },
          ].map((faq, i) => (
            <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '10px', color: 'var(--text)' }}>
                <span style={{ color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', marginRight: '8px' }}>Q.</span>
                {faq.q}
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                <span style={{ color: 'var(--green)', fontFamily: 'JetBrains Mono, monospace', marginRight: '8px' }}>A.</span>
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

    </main>
  )
}