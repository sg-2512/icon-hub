export const metadata = {
  title: 'Privacy Policy — IconHub',
  description: 'Privacy policy for IconHub. Learn how we collect, use and protect your data.',
}

export default function PrivacyPolicyPage() {
  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 48px' }}>

      <section style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: '12px', color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '12px' }}>
          // LEGAL
        </div>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, lineHeight: 1.1, marginBottom: '16px' }}>
          Privacy Policy
        </h1>
        <p style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px' }}>
          Last updated: March 31, 2026
        </p>
      </section>

      <article style={{ maxWidth: '720px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {[
          {
            title: '1. Introduction',
            content: 'Welcome to IconHub ("we", "our", or "us"). IconHub is an independent resource site that helps developers compare and discover open source icon libraries. This Privacy Policy explains how we collect, use, and protect information when you visit iconhub.dev.'
          },
          {
            title: '2. Information We Collect',
            content: 'We collect minimal data necessary to operate the site. This includes: anonymous usage data via Google Analytics (page views, time on site, referral sources), and data from Google AdSense for serving relevant advertisements. We do not collect your name, email, or any personal information unless you contact us directly.'
          },
          {
            title: '3. Google Analytics',
            content: 'We use Google Analytics to understand how visitors use our site. Google Analytics uses cookies to collect anonymous information such as how many people visit our site, which pages they visit, and where they came from. This data is aggregated and cannot be used to identify you personally. You can opt out of Google Analytics by installing the Google Analytics Opt-out Browser Add-on.'
          },
          {
            title: '4. Google AdSense',
            content: 'We use Google AdSense to display advertisements on our site. Google AdSense uses cookies to serve ads based on your prior visits to our website or other websites. You may opt out of personalized advertising by visiting Google\'s Ads Settings. We do not control the data collected by Google for advertising purposes.'
          },
          {
            title: '5. Cookies',
            content: 'Our site uses cookies from Google Analytics and Google AdSense. These cookies help us understand site usage and serve relevant advertisements. You can disable cookies in your browser settings, though this may affect the functionality of some features.'
          },
          {
            title: '6. Third Party Links',
            content: 'IconHub contains links to external websites including GitHub repositories, npm packages, and official documentation sites. We are not responsible for the privacy practices of these external sites. We recommend reviewing their privacy policies before providing any personal information.'
          },
          {
            title: '7. Data Security',
            content: 'IconHub is a static website with no user accounts or database. We do not store any personal data on our servers. All analytics and advertising data is processed by Google according to their privacy policy.'
          },
          {
            title: '8. Children\'s Privacy',
            content: 'IconHub is not directed at children under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us immediately.'
          },
          {
            title: '9. Changes to This Policy',
            content: 'We may update this Privacy Policy from time to time. We will notify you of any changes by updating the "Last updated" date at the top of this page. Your continued use of IconHub after any changes constitutes your acceptance of the new Privacy Policy.'
          },
          {
            title: '10. Contact Us',
            content: 'If you have any questions about this Privacy Policy, please contact us at: privacy@iconhub.dev'
          },
        ].map(section => (
          <div key={section.title}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: 'var(--text)', fontFamily: 'JetBrains Mono, monospace' }}>
              {section.title}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.8 }}>
              {section.content}
            </p>
          </div>
        ))}
      </article>

    </main>
  )
}