import type { Metadata } from 'next'
import './globals.css'
import AppShell from './components/AppShell'
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
  description: `Search ${SEARCHABLE_ICON_COUNT.toLocaleString('en-US')} free SVG icons from ${NAMED_LIBRARY_COUNT} named libraries and ${ICONIFY_COLLECTION_COUNT} Iconify collections. Compare ${NAMED_LIBRARY_COUNT} React icon libraries by size, stars, and license.`,
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
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=G-T75PM4NWBD`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-T75PM4NWBD');
          `}
        </Script>
      </head>
      <body suppressHydrationWarning>
        <AppShell>{children}</AppShell>
        <Analytics />
      </body>
    </html>
  )
}
