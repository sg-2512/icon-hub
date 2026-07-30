import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/icons/react-icons",
        destination: "/react-icons",
        permanent: true,
      },
      {
        source: "/icons/material-icons",
        destination: "/icons/material-symbols",
        permanent: true,
      },
      {
        source: "/icons/font-awesome",
        destination: "/icons/fa7-solid",
        permanent: true,
      },
      {
        source: "/blog/lucide-icons-complete-guide-2026",
        destination: "/icons/lucide-icons",
        permanent: true,
      },
      {
        source: "/blog/how-to-use-svg-icons-in-react",
        destination: "/react-icons",
        permanent: true,
      },
      {
        source: "/blog/react-icons-vs-lucide-react-2026",
        destination: "/react-icons",
        permanent: true,
      },
      {
        source: "/blog/how-to-choose-right-icons-for-ui",
        destination: "/best-for-you",
        permanent: true,
      },
      {
        source: "/blog/tailwind-css-v4-icons-complete-guide-2026",
        destination: "/tailwind-icons",
        permanent: true,
      },
      {
        source: "/blog/svg-icons-dark-mode-react-nextjs-2026",
        destination: "/use-cases/icons-for-dark-mode",
        permanent: true,
      },
      {
        source: "/blog/icon-library-pricing-comparison-2026",
        destination: "/free-svg-icons",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/penpot/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, HEAD, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type" },
          { key: "Cross-Origin-Resource-Policy", value: "cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "no-referrer" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          { key: "Cache-Control", value: "public, max-age=300, must-revalidate" },
        ],
      },
      {
        source: "/penpot/index.html",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src 'self' https://iconsearch.info https://www.iconsearch.info https://cdn.iconsearch.info data:; connect-src https://iconsearch.info https://www.iconsearch.info; base-uri 'none'; object-src 'none'; form-action 'none'; frame-ancestors *",
          },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "*" },
        ],
      },
    ];
  },
};

export default nextConfig;
