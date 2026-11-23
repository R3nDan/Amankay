/** @type {import('next').NextConfig} */
const config = {
  agentRules: false,
  turbopack: { root: import.meta.dirname },
  devIndicators: false,
  async rewrites() {
    return [{ source: "/api/v1/:path*", destination: "http://127.0.0.1:8081/api/v1/:path*" }];
  },
};
export default config;
