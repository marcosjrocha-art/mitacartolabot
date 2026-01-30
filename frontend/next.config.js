/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
  },
  images: {
    domains: ['localhost', 's3.glbimg.com', 'cartola.globo.com'],
  },
  async rewrites() {
    return [
      {
        source: '/ml/:path*',
        destination: `${process.env.ML_SERVICE_URL || 'http://localhost:8000'}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
