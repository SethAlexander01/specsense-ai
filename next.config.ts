import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // pdf-parse uses Node.js APIs only available server-side
  serverExternalPackages: ['pdf-parse'],
  experimental: {},
}

export default nextConfig
