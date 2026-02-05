/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, 
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },
  webpack: (config) => {
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
      'ssh2': 'commonjs ssh2', 
    })
    return config
  },
};

export default nextConfig;
