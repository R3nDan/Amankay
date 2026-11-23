/** @type {import('next').NextConfig} */
const configuredApiOrigin = process.env.AMANKAY_API_ORIGIN ?? "http://127.0.0.1:8081";
const apiOrigin = /^https?:\/\//i.test(configuredApiOrigin)
  ? configuredApiOrigin.replace(/\/+$/, "")
  : `https://${configuredApiOrigin.replace(/\/+$/, "")}`;

const config = {
  agentRules: false,
  turbopack: { root: import.meta.dirname },
  devIndicators: false,
  async rewrites() {
    return [{ source: "/api/v1/:path*", destination: `${apiOrigin}/api/v1/:path*` }];
  },
};
export default config;
