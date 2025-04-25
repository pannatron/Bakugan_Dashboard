/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Fix for dynamic server usage error
  output: 'standalone',
  // Configure routes that use cookies to be dynamic
  experimental: {
    serverComponentsExternalPackages: ['mongoose'],
  },
  // Transpile specific packages
  transpilePackages: ['mongoose', 'next-auth'],
  // Disable source maps in production to reduce bundle size
  productionBrowserSourceMaps: false,
}

module.exports = nextConfig
