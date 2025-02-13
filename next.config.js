/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? 'https://mathildamadaboutme.netlify.app' : '',
  env: {
    NEXT_PUBLIC_BASE_URL: process.env.NODE_ENV === 'production' ? 'https://mathildamadaboutme.netlify.app' : 'http://localhost:3000'
  }
}

module.exports = nextConfig 