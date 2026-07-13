export const metadata = {
  title: 'Terms and Conditions — IconSearch',
  description: 'Terms and conditions governing your use of IconSearch. Read our policies on intellectual property, disclaimers, and liability.',
}

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
          Last updated: June 25, 2026
        </p>
      </section>

      <article style={{ maxWidth: '720px', display: 'flex', flexDirection: 'column', gap: '32px' }}>

        <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.8, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px' }}>
          Welcome to IconSearch (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). These Terms and Conditions govern your use of the website located at iconsearch.info. By accessing or using this website, you agree to be bound by these Terms in their entirety. If you do not agree with any part of these Terms, please do not use our website.
        </p>

        {[
          {
            title: '1. Use of Website',
            content: `IconSearch provides information, guides, tutorials, comparisons, and interactive tools related to open-source SVG icon libraries and front-end web development. The information on this site is intended for developers, designers, and technical professionals seeking to make informed decisions about the tools they use in their projects.

By using this website you agree to use it only for lawful purposes, not to misuse, disrupt, damage, or interfere with the proper functioning of the website or its infrastructure, not to attempt unauthorized access to any part of the website or its hosting environment, not to use automated tools to systematically scrape, mass-download, or reproduce our content without prior written permission, and not to engage in any activity that could harm other users or the integrity of the website.

We reserve the right to restrict or terminate access for any user who violates these terms, at our sole discretion and without prior notice.`,
          },
          {
            title: '2. Intellectual Property Rights',
            content: `Unless otherwise stated, all original content on IconSearch — including written guides, tutorials, comparison pages, blog posts, code examples, graphics, the site logo, and overall design — is owned by or licensed to IconSearch. This includes the structure and editorial content of comparison pages, library guides, use case articles, bundle size benchmark data we have produced, and all written descriptions and recommendations throughout the site.

You may view and use content for personal, non-commercial, educational purposes, and share links to our content with proper attribution. You may NOT copy, reproduce, or republish substantial portions of our original written content without explicit written permission, sell or commercially exploit content from this website, present our content or editorial work as your own, or systematically reproduce our comparison data, benchmark results, or guides on competing websites.

Icon libraries referenced on this site are the intellectual property of their respective owners and are governed by their individual open-source licenses (MIT, ISC, Apache 2.0, CC0, etc.). IconSearch makes no claim of ownership over any icon library, its icons, its trademarks, or associated brand assets. All library names, logos, and trademarks are the property of their respective owners.`,
          },
          {
            title: '3. Accuracy of Information',
            content: `IconSearch strives to maintain accurate, up-to-date information about all featured icon libraries, including GitHub star counts, icon quantities, npm download figures, license types, framework support, TypeScript availability, bundle sizes, and other technical specifications. We update data regularly and clearly label content with publication dates.

However, the open-source ecosystem moves quickly and data may become outdated between our update cycles. We do not guarantee the accuracy, completeness, or timeliness of any information on this website. Icon library statistics such as GitHub stars and weekly npm downloads are approximate and sourced from publicly available data at the time of writing. Version numbers, feature availability, and package names may change with new library releases.

If you notice any inaccurate or outdated information, we encourage you to contact us at iconsearchinfo@gmail.com so we can investigate and correct it promptly. We aim to address confirmed data errors within 24 hours.`,
          },
          {
            title: '4. Third-Party Links and Services',
            content: `IconSearch contains links to third-party websites including GitHub repositories, npm package pages, official library documentation, Figma community pages, and other developer resources. These links are provided for your convenience and informational purposes only.

We do not control, endorse, or take responsibility for the content, privacy practices, accuracy, security, or availability of any third-party website. The inclusion of a link does not imply our endorsement of the linked site or its operators. Your use of any third-party website is entirely at your own risk and subject to that site's own terms and conditions and privacy policies.`,
          },
          {
            title: '5. Disclaimer of Warranties',
            content: `All information, content, tools, and resources on IconSearch are provided on an "as is" and "as available" basis without warranties of any kind, either express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, or non-infringement.

We make no warranties or representations that the information on this site is accurate, reliable, complete, or suitable for any particular purpose. We do not warrant that the website will be uninterrupted, error-free, secure, or free of viruses or other harmful components. All content on this website is for informational purposes only and does not constitute professional technical, legal, business, or financial advice. You should independently verify any information before making technical or business decisions based on it.`,
          },
          {
            title: '6. Limitation of Liability',
            content: `To the fullest extent permitted by applicable law, IconSearch, its operators, contributors, and affiliates shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use this website or its content.

This includes but is not limited to damages arising from reliance on inaccurate or outdated library data, technical issues arising from following guides or tutorials on this website, decisions made based on comparisons or recommendations on this website, any interruption or discontinuation of the website or its content, and any unauthorized access to or alteration of your data or transmissions.

This limitation applies regardless of the theory of liability — whether in contract, tort (including negligence), strict liability, or otherwise — even if IconSearch has been advised of the possibility of such damages.`,
          },
          {
            title: '7. Advertising and Affiliate Disclosure',
            content: `IconSearch displays advertisements through Google AdSense. These ads are served automatically by Google based on the content of our pages and, where permitted by your settings, your browsing behavior. We do not personally select or control the specific ads displayed on the site.

We may also participate in affiliate programs with tool and product providers relevant to front-end development. Where affiliate relationships exist, we clearly disclose them on the relevant pages. Any referral commissions we earn through affiliate relationships do not influence our editorial opinions, library comparisons, rankings, or recommendations. We maintain full editorial independence and our recommendations are based solely on data and technical merit.

You can manage your ad personalization preferences through Google's Ad Settings at adssettings.google.com.`,
          },
          {
            title: '8. Privacy Policy',
            content: `Your use of IconSearch is also governed by our Privacy Policy, which is incorporated into these Terms and Conditions by reference. The Privacy Policy explains in detail how we collect, use, store, and protect information obtained through your use of this website. Please review our Privacy Policy at iconsearch.info/privacy-policy before using the site.`,
          },
          {
            title: '9. User Submissions and Feedback',
            content: `If you submit feedback, suggestions, error reports, corrections, or any other content to us via email or any other channel, you grant IconSearch a non-exclusive, worldwide, royalty-free, perpetual license to use, reproduce, and incorporate such feedback for the purpose of improving the website and its content.

You are solely responsible for any content you submit and must ensure it does not violate any laws, infringe any third-party intellectual property rights, contain harmful, misleading, or defamatory information, or include personal information about third parties without their consent.`,
          },
          {
            title: '10. Accounts, Extensions, and Founder Access',
            content: `IconSearch may provide accounts that connect the website, extensions, and plugins. You are responsible for maintaining the security of your account and connected devices and for promptly signing out or contacting us if you suspect unauthorized access.

The first 500 verified users of each eligible product may receive lifetime Founder access for that product. Founder eligibility is based on successful account verification and an atomic product claim, not download or installation counts. Founder access is personal, non-transferable, limited to one entitlement per user per product, and may be revoked for fraud, automated claiming, abuse, or material violation of these Terms. "Lifetime" means for as long as IconSearch continues to operate and support the applicable product; it does not guarantee perpetual availability of any specific feature.

Users who join after Founder capacity is reached may receive a free plan with different limits. We may change future free or paid plan features, but we will not convert valid Founder access into a recurring paid subscription.`,
          },
          {
            title: '11. Changes to These Terms',
            content: `We reserve the right to modify, update, or replace these Terms and Conditions at any time at our sole discretion. When we make material changes, we will update the "Last updated" date at the top of this page. Your continued use of IconSearch after any changes to these Terms constitutes your acceptance of the updated Terms. If you do not agree with the revised Terms, you must stop using the website. We encourage you to review these Terms periodically.`,
          },
          {
            title: '12. Governing Law and Dispute Resolution',
            content: `These Terms and Conditions shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions.

Any disputes arising from or relating to these Terms or your use of IconSearch shall first be attempted to be resolved informally by contacting us at iconsearchinfo@gmail.com. If informal resolution is not achieved within 30 days, disputes shall be subject to binding arbitration in accordance with the American Arbitration Association rules, or at our election, to the jurisdiction of the courts of the State of Delaware.

If any provision of these Terms is found to be unenforceable or invalid under applicable law, that provision will be limited or eliminated to the minimum extent necessary, and the remaining provisions will continue in full force and effect.`,
          },
          {
            title: '13. Contact Information',
            content: `If you have any questions, concerns, or requests regarding these Terms and Conditions, please contact us:

📧 General: iconsearchinfo@gmail.com
📧 Legal & Privacy: iconsearchinfo@gmail.com
📍 Operating from: United States

We aim to respond to all enquiries within 48 business hours. By using IconSearch, you acknowledge that you have read, understood, and agreed to these Terms and Conditions in their entirety.`,
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
