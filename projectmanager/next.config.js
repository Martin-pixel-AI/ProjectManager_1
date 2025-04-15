/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  // Позволяем серверу обрабатывать запросы через API
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig; 