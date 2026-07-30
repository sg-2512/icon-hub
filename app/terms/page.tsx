import { createPageMetadata } from '../../lib/seo'

export const metadata = createPageMetadata({
  title: 'Terms and Conditions — IconSearch',
  description: 'Terms and conditions governing your use of IconSearch. Read our policies on intellectual property, disclaimers, and liability.',
  path: '/terms',
})

export default function TermsPage() {
  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 48px' }}>

      <section style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: '12px', color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '12px' }}>
          {'// LEGAL'}
        </div>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, lineHeight: 1.1, marginBottom: '16px' }}>
          Terms and Conditions
        </h1>
        <p style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px' }}>
          Last updated: July 24, 2026
        </p>
      </section>

      <article style={{ maxWidth: '720px', display: 'flex', flexDirection: 'column', gap: '32px' }}>

        <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.8, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px' }}>
          Welcome to IconSearch (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). These Terms and Conditions govern your use of the website located at iconsearch.info, as well as our official developer integrations, browser extensions, design tool plugins, and API services (collectively, the &quot;Platform&quot;). By accessing or using our Platform, creating an account, or authenticating an integration, you agree to be bound by these Terms in their entirety. If you do not agree with any part of these Terms, please do not use our Platform.
        </p>

        {[
          {
            title: '1. Description of Platform & Services',
            content: `IconSearch is an open-source icon discovery engine and developer productivity platform. We index and serve over 355,000 free SVG icons from 229 open-source icon libraries (including Lucide Icons, Heroicons, Tabler Icons, Phosphor Icons, Bootstrap Icons, Radix Icons, Iconoir, Remix Icon, Feather Icons, and others).

Our Platform provides in-memory fast-path icon search, an interactive SVG customizer (adjusting size, stroke weight, and color palette), code generation (React JSX, Vue, Svelte, SVG, and SVG sprite exports), cloud synchronization of icon packs and style presets, and 18 specialized developer integrations (including VS Code extensions, Figma plugins, Chrome extensions, MCP servers, Raycast extensions, and design tool plugins).`,
          },
          {
            title: '2. User Accounts and Supabase Authentication',
            content: `To access certain features on the Platform — such as saving icon packs to the cloud, persisting customizer style presets across devices, claiming Founder access entitlements, or authorizing developer integrations — you may create an account using Supabase Authentication (including Email/Password and Google OAuth sign-in).

You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately at iconsearchinfo@gmail.com if you suspect any unauthorized access or security breach. We reserve the right to suspend or terminate accounts that violate these Terms or engage in abusive, fraudulent, or automated exploitation of our authentication endpoints.`,
          },
          {
            title: '3. Developer Integrations, Extensions, and Device Authorization',
            content: `IconSearch offers official extensions and plugins for IDEs, design tools, AI tools, and browsers. Device authentication for extensions relies on the RFC 8628 OAuth 2.0 Device Authorization Grant flow.

When connecting an extension or plugin, a temporary 8-character user code and device code are generated. Upon user approval in the browser (/connect or /api/device/approve), an opaque session token is issued to the extension. To ensure security, our servers store only cryptographic SHA-256 hashes of session tokens combined with a secret server-side pepper (DEVICE_TOKEN_PEPPER). Session tokens may be revoked at any time by the user via /api/device/revoke or by signing out.

You agree not to reverse-engineer, attempt to forge device approval signatures, bypass rate limits, or use unauthorized automated scripts to generate mass session tokens.`,
          },
          {
            title: '4. Founder Access and Lifetime Entitlements',
            content: `As part of our platform launch, IconSearch offers limited "Founder Access" entitlements for up to the first 500 verified users across each of our 18 eligible product integrations.

Founder Access eligibility is determined on an atomic, first-claimed basis upon successful user account verification and in-app activation. Founder access is personal, non-transferable, limited to one entitlement claim per user account per product, and strictly subject to fair use. We reserve the right to audit and revoke claims obtained through botting, duplicate accounts, temporary email addresses, or system abuse.

"Lifetime" entitlement means access for as long as IconSearch operates and supports the applicable integration. It does not guarantee perpetual operation of third-party software host environments (e.g. changes to VS Code, Figma, or Chrome Extension APIs beyond our control). Users who register after Founder capacity is reached may be placed on free tier plans with default usage limits.`,
          },
          {
            title: '5. Intellectual Property Rights & Open Source Licensing',
            content: `Platform Content & Software: The IconSearch search engine architecture, design system, website UI, database indexes, API routes, original code, logos, and written documentation are the intellectual property of IconSearch. You may not scrape, clone, resell, or distribute our platform infrastructure, compiled search indices, or backend APIs as a competing commercial icon search engine without explicit written consent.

Indexed Icon Assets: Individual icon SVG files, symbol names, and library brand assets indexed by IconSearch remain the exclusive intellectual property of their respective open-source creators and maintainers. All indexed icon sets are distributed under their individual open-source licenses (such as MIT, Apache 2.0, ISC, CC0 1.0, or CC-BY 4.0). IconSearch provides direct license metadata and links for every indexed library. You are solely responsible for ensuring your use of exported icons complies with the respective library's license terms.`,
          },
          {
            title: '6. Acceptable Use and Rate Limits',
            content: `You agree to use IconSearch solely for lawful developer, design, and technical workflow purposes. You agree NOT to:
- Perform automated, high-frequency scraping or mass automated API requests that bypass or exceed our sliding-window rate limits (120 requests per minute per IP address).
- Attempt to exploit, disrupt, or flood our in-memory search caches, database infrastructure, or Supabase endpoints.
- Submit malicious, fraudulent, or harmful data via cloud pack or preset sync interfaces.
- Impersonate another user or misrepresent your affiliation with an open-source icon project.

We enforce IP-level and account-level rate limiting (HTTP 429 Too Many Requests). Violations may result in temporary IP blocks or permanent account termination.`,
          },
          {
            title: '7. Disclaimer of Warranties',
            content: `The Platform, search indices, SVG exports, code generators, and integration plugins are provided on an "as is" and "as available" basis without warranties of any kind, whether express or implied.

While we take rigorous measures to maintain >99.9% uptime, fast-path search response times (<1ms cache hits), and accurate license information, we do not warrant that the Platform will be uninterrupted, error-free, completely secure, or free of data discrepancies. Technical specifications, package names, and star counts are regularly synchronized from public upstream sources and may occasionally lag behind upstream library releases.`,
          },
          {
            title: '8. Limitation of Liability',
            content: `To the maximum extent permitted by law, IconSearch and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of data, production downtime, software build failures, or commercial losses resulting from your use of or inability to use the Platform or exported icon assets.`,
          },
          {
            title: '9. Advertising and Third-Party Links',
            content: `IconSearch may display contextual advertisements served via Google AdSense and may include links to external developer tools, npm registries, GitHub repositories, and documentation. We do not control or endorse third-party websites and are not responsible for their availability, privacy practices, or content.`,
          },
          {
            title: '10. Modifications to Terms & Service',
            content: `We reserve the right to modify these Terms at any time. Material changes will be posted on this page with an updated "Last updated" date. Continued use of IconSearch after changes are published constitutes acceptance of the modified Terms.`,
          },
          {
            title: '11. Governing Law & Dispute Resolution',
            content: `These Terms are governed by the laws of the State of Delaware, United States. Any disputes shall first be addressed informally by contacting iconsearchinfo@gmail.com. Unresolved disputes shall be settled through binding arbitration in accordance with standard American Arbitration Association rules.`,
          },
          {
            title: '12. Contact Information',
            content: `For legal inquiries, terms clarification, or account requests:

📧 Email: iconsearchinfo@gmail.com
🌐 Web: https://iconsearch.info/contact
📍 Operating from: United States`,
          },
        ].map(section => (
          <div key={section.title}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: 'var(--text)', fontFamily: 'JetBrains Mono, monospace' }}>
              {section.title}
            </h2>
            {section.content.split('\n\n').map((para, i) => (
              <p key={i} style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.8, marginBottom: '12px' }}>
                {para}
              </p>
            ))}
          </div>
        ))}

      </article>

    </main>
  )
}
