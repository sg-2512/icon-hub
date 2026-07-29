import type { Metadata } from 'next'
import './globals.css'
import AppShell from './components/AppShell'
import GoogleAdSense from './components/GoogleAdSense'
import GoogleAnalytics from './components/GoogleAnalytics'
import { JetBrains_Mono, Inter } from 'next/font/google'
import Script from 'next/script'
import { Analytics } from "@vercel/analytics/next"
import { ICONIFY_COLLECTION_COUNT, NAMED_LIBRARY_COUNT, SEARCHABLE_ICON_COUNT } from '../data/library-catalog'

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://iconsearch.info'),
  title: `IconSearch — Find & Compare ${NAMED_LIBRARY_COUNT} Free SVG Icon Libraries (2026)`,
  description: `Search ${SEARCHABLE_ICON_COUNT.toLocaleString('en-US')} free SVG icons across ${NAMED_LIBRARY_COUNT} open-source icon libraries. Compare React icon libraries by size, stars, and license.`,
  twitter: {
    card: 'summary_large_image',
    site: '@IconSearchinfo',
    creator: '@IconSearchinfo',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth" className={`${jetbrainsMono.variable} ${inter.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "IconSearch",
                "alternateName": "IconSearch",
                "url": "https://iconsearch.info",
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": "https://iconsearch.info/icon-search?q={search_term_string}",
                  "query-input": "required name=search_term_string"
                }
              },
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "IconSearch",
                "url": "https://iconsearch.info",
                "logo": "https://iconsearch.info/iconsearch-logo-128.png"
              }
            ])
          }}
        />
        <Script id="strip-extension-hydration-attrs" strategy="beforeInteractive">
          {`
            (function () {
              var attrs = ['fdprocessedid'];
              function clean(root) {
                if (!root || !root.querySelectorAll) return;
                attrs.forEach(function (attr) {
                  if (root.nodeType === 1 && root.hasAttribute && root.hasAttribute(attr)) {
                    root.removeAttribute(attr);
                  }
                  root.querySelectorAll('[' + attr + ']').forEach(function (el) {
                    el.removeAttribute(attr);
                  });
                });
              }
              clean(document);
              if (typeof MutationObserver === 'undefined') return;
              var observer = new MutationObserver(function (mutations) {
                mutations.forEach(function (mutation) {
                  if (mutation.type === 'attributes' && attrs.indexOf(mutation.attributeName) !== -1) {
                    mutation.target.removeAttribute(mutation.attributeName);
                  }
                  mutation.addedNodes.forEach(clean);
                });
              });
              observer.observe(document.documentElement, {
                subtree: true,
                childList: true,
                attributes: true,
                attributeFilter: attrs
              });
              window.addEventListener('load', function () {
                window.setTimeout(function () {
                  observer.disconnect();
                  clean(document);
                }, 1000);
              });
            })();
          `}
        </Script>
        <link rel="preconnect" href="https://fundingchoicesmessages.google.com" />
        <link rel="dns-prefetch" href="https://fundingchoicesmessages.google.com" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      </head>
      <body suppressHydrationWarning>
        <AppShell>{children}</AppShell>
        <GoogleAdSense client="ca-pub-7157745573382727" />
        <GoogleAnalytics gaId="G-T75PM4NWBD" />
        <Analytics />
      </body>
    </html>
  )
}
