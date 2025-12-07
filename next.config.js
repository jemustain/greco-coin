/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // Enable static export for immutable historical data
  output: 'export',
  trailingSlash: true,
}

module.exports = nextConfig
