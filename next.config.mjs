/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Handle Node.js modules that shouldn't be bundled for the browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        child_process: false,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        util: false,
        url: false,
        assert: false,
        http: false,
        https: false,
        os: false,
        path: false,
        zlib: false,
        buffer: false,
        process: false,
        events: false,
        querystring: false,
        "node:buffer": false,
        "node:process": false,
        "node:events": false,
        "node:util": false,
        "node:stream": false,
        "node:crypto": false,
        "node:os": false,
        "node:path": false,
        "node:fs": false,
        "node:child_process": false,
        "node:net": false,
        "node:tls": false,
        "node:http": false,
        "node:https": false,
        "node:url": false,
        "node:assert": false,
        "node:zlib": false,
      }
    }
    
    // Handle Tavus CVI package - exclude from bundling
    config.externals = config.externals || []
    if (!isServer) {
      config.externals.push({
        '@tavus/cvi-ui': 'TavusCVI'
      })
    }
    
    return config
  },
}

export default nextConfig
