import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
