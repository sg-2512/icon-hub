export const metadata = {
  title: 'Terms and Conditions — IconHub',
  description: 'Terms and conditions governing your use of IconHub. Read our policies on intellectual property, disclaimers, and liability.',
}

export default function TermsPage() {
  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 48px' }}>

      <section style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: '12px', color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '12px' }}>
          // LEGAL
        </div>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, lineHeight: 1.1, marginBottom: '16px' }}>
          Terms and Conditions
        </h1>
        <p style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px' }}>
          Last updated: March 31, 2026
        </p>
      </section>

      <article style={{ maxWidth: '720px', display: 'flex', flexDirection: 'column', gap: '32px' }}>

        <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.8, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px' }}>
          Welcome to IconHub ("we", "our", or "us"). These Terms and Conditions govern your use of our website located at iconhub.dev. By accessing or using this website, you agree to comply with and be bound by these Terms. If you do not agree with any part of these Terms, please do not use our website.
        </p>

        {[
          {
            title: '1. Use of Website',
            content: `IconHub provides information, guides, tutorials, and comparisons related to open source icon libraries, web development tools, and related developer resources. The information on this website is intended for developers, designers, and technical professionals looking to make informed decisions about the tools they use in their projects.

By using this website you agree to use it only for lawful purposes, not to misuse, disrupt, damage, or interfere with the proper functioning of the website, not to attempt unauthorized access to any part of the website or its infrastructure, not to use automated tools to scrape or mass-download content without permission, and not to engage in any activity that could harm other users or the integrity of the website.

We reserve the right to restrict or terminate access for any user who violates these terms, at our sole discretion and without prior notice.`,
          },
          {
            title: '2. Intellectual Property Rights',
            content: `Unless otherwise stated, all original content on IconHub — including written guides, tutorials, comparisons, code examples, graphics, logos, and design — is owned by or licensed to IconHub. This includes but is not limited to the structure of comparison pages, the written descriptions of icon libraries, and the editorial opinions expressed throughout the site.

You may view and use content for personal, non-commercial, educational purposes, and share links to our content with proper attribution. You may NOT copy, reproduce, or republish substantial portions of our content without explicit written permission, sell or commercially exploit content from this website, present our content as your own original work, or systematically reproduce our comparison data or guides on competing websites.

Icon libraries referenced on this site are the intellectual property of their respective owners and are governed by their individual open source licenses. IconHub makes no claim of ownership over any icon library, its icons, or associated trademarks.`,
          },
          {
            title: '3. Accuracy of Information',
            content: `IconHub strives to maintain accurate, up-to-date information about all featured icon libraries including star counts, icon quantities, license types, framework support, and other technical specifications. However, the open source ecosystem moves quickly and data may become outdated between updates.

We do not guarantee the accuracy, completeness, or timeliness of any information on this website. Icon library statistics such as GitHub stars and weekly npm downloads are approximate and sourced from publicly available data at the time of writing. Version numbers and feature availability may change with new library releases.

If you notice any inaccurate information, we encourage you to contact us at errors@iconhub.dev so we can investigate and correct it promptly.`,
          },
          {
            title: '4. Third-Party Links and Services',
            content: `IconHub contains links to third-party websites including GitHub repositories, npm package pages, official documentation sites, Figma community pages, and other developer resources. These links are provided for your convenience and informational purposes only.

We do not control, endorse, or take responsibility for the content, privacy practices, accuracy, or availability of any third-party website. The inclusion of a link does not imply our endorsement of the linked site or its operator. Your use of any third-party website is entirely at your own risk and subject to that site's own terms and conditions.`,
          },
          {
            title: '5. Disclaimer of Warranties',
            content: `All information, content, and resources on IconHub are provided on an "as is" and "as available" basis without warranties of any kind, either express or implied.

We make no warranties or representations regarding the accuracy, reliability, completeness, or suitability of information for any particular purpose. We do not warrant that the website will be uninterrupted, error-free, or free of viruses or other harmful components. Content on this website is for informational purposes only and does not constitute professional technical, legal, or business advice. You should independently verify any information before making technical decisions based on it.`,
          },
          {
            title: '6. Limitation of Liability',
            content: `To the fullest extent permitted by applicable law, IconHub, its operators, contributors, and affiliates shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use this website.

This includes but is not limited to loss of data, revenue, profits, or business opportunities, technical issues arising from following guides or tutorials on this website, decisions made based on comparisons or recommendations on this website, and any interruption or discontinuation of the website or its content.

This limitation applies regardless of the cause of action or the theory of liability, even if IconHub has been advised of the possibility of such damages.`,
          },
          {
            title: '7. Advertising and Affiliate Disclosure',
            content: `IconHub displays advertisements through Google AdSense. These ads are served automatically by Google based on the content of our pages and, where permitted, your browsing behavior. We do not personally select or control the specific ads displayed.

We may also participate in affiliate marketing programs in the future. If we do, we will clearly disclose affiliate relationships on relevant pages. Any affiliate commissions we earn do not influence our editorial opinions, comparisons, or recommendations — we maintain editorial independence regardless of commercial relationships.

You can manage your ad personalization preferences through Google's Ad Settings at adssettings.google.com.`,
          },
          {
            title: '8. Privacy Policy',
            content: `Your use of IconHub is also governed by our Privacy Policy, which is incorporated into these Terms by reference. The Privacy Policy explains in detail how we collect, use, store, and protect any information obtained through your use of this website. Please review our Privacy Policy carefully before using the site.`,
          },
          {
            title: '9. User Submissions and Feedback',
            content: `If you submit feedback, suggestions, error reports, or any other content to us via email or any other channel, you grant IconHub a non-exclusive, worldwide, royalty-free license to use, reproduce, and incorporate such feedback for the purpose of improving the website and its content.

You are solely responsible for any content you submit and must ensure it does not violate any laws, infringe any third-party rights including intellectual property rights, contain harmful, misleading, or defamatory information, or include personal information about third parties without their consent.`,
          },
          {
            title: '10. Changes to These Terms',
            content: `We reserve the right to modify, update, or replace these Terms and Conditions at any time at our sole discretion. When we make changes, we will update the "Last updated" date at the top of this page.

Your continued use of IconHub after any changes to these Terms constitutes your acceptance of the updated Terms. If you do not agree with the revised Terms, you must stop using the website. We encourage you to review these Terms periodically to stay informed about your rights and obligations.`,
          },
          {
            title: '11. Governing Law',
            content: `These Terms and Conditions shall be governed by and construed in accordance with the laws of India. Any disputes arising from or relating to these Terms or your use of IconHub shall be subject to the exclusive jurisdiction of the courts of Chandigarh, India.

If any provision of these Terms is found to be unenforceable or invalid under applicable law, that provision will be limited or eliminated to the minimum extent necessary, and the remaining provisions will continue in full force and effect.`,
          },
          {
            title: '12. Contact Information',
            content: `If you have any questions, concerns, or requests regarding these Terms and Conditions, please contact us at:

📧 General: hello@iconhub.dev
📧 Legal: privacy@iconhub.dev
📍 Location: Chandigarh, India

We aim to respond to all enquiries within 48 business hours. By using IconHub, you acknowledge that you have read, understood, and agreed to these Terms and Conditions in their entirety.`,
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