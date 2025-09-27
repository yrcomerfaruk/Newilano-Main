/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com'
      },
      {
        protocol: 'https',
        hostname: 'static.nike.com'
      },
      {
        protocol: 'https',
        hostname: 'images.ctfassets.net'
      },
      {
        protocol: 'https',
        hostname: 'assets.adidas.com'
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org'
      }
    ]
  }
};

export default nextConfig;
