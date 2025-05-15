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
  // Enhanced image optimization for faster loading
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
    // Reduced number of sizes to improve build time and cache efficiency
    deviceSizes: [640, 828, 1200],
    imageSizes: [32, 64, 128, 256],
    minimumCacheTTL: 86400, // Cache images for 24 hours to improve performance
    dangerouslyAllowSVG: true, // Allow SVG images
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    contentDispositionType: 'attachment', // Improve loading performance
    disableStaticImages: false, // Keep static image imports
    unoptimized: false, // Ensure images are optimized
    // Quality can be set on individual images using the quality prop
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
