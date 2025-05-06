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
  // Configure image optimization
  images: {
    domains: ['*'], // Allow all domains for now, can be restricted to specific domains later
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    // Optimize image loading - focus on sizes that matter for this app
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 64, 96, 128, 256],
    minimumCacheTTL: 3600, // Cache images for at least 1 hour to improve performance
    dangerouslyAllowSVG: true, // Allow SVG images
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    contentDispositionType: 'attachment', // Improve loading performance
    disableStaticImages: false, // Keep static image imports
    unoptimized: false, // Ensure images are optimized
  },
  // Optimize performance
  swcMinify: true, // Use SWC minifier for better performance
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
}

module.exports = nextConfig
