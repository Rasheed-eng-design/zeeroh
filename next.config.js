/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  images: {
    domains: ['res.cloudinary.com', 'images.unsplash.com'],
  },
}

module.exports = nextConfig
