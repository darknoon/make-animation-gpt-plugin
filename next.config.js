/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/.well-known/ai-plugin.json',
        destination: '/api/.well-known/ai-plugin.json',
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/.well-known/ai-plugin.json',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'https://chat.openai.com',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'https://chat.openai.com',
          },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
