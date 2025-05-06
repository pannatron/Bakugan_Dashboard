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
    // Optimize image loading
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60, // Cache images for at least 60 seconds
    dangerouslyAllowSVG: true, // Allow SVG images
    contentDispositionType: 'attachment', // Improve loading performance
    disableStaticImages: false, // Keep static image imports
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
