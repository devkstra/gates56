import type { NextConfig } from "next";
import path from 'path';

const nextConfig: NextConfig = {
  // Configure webpack for non-Turbopack builds
  webpack: (config, { isServer }) => {
    // Only apply these fallbacks in non-Turbopack mode
    if (!isServer && process.env.TURBOPACK !== '1') {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        os: require.resolve('os-browserify/browser'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
      };
    }

    // Handle model files for face-api.js
    if (process.env.TURBOPACK !== '1') {
      config.module.rules.push(
        {
          test: /\.(bin|weights|json)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'static/[hash][ext][query]'
          }
        },
        {
          test: /\.(wasm)$/,
          type: 'asset/resource',
          generator: {
            filename: 'static/wasm/[name][ext]'
          }
        }
      );
    }

    return config;
  },
  
  // Configure headers for model files
  async headers() {
    return [
      {
        // Match all model files in the public/models directory
        source: '/models/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },

  // Experimental features
  experimental: {
    serverActions: {},
  },
  
  // Enable static exports for the output: 'export' option
  output: 'standalone',
  
  // Configure images
  images: {
    domains: [],
    unoptimized: true, // Required for static exports with Next.js Image
  },
  
  // Configure static files
  staticPageGenerationTimeout: 1000, // Increase timeout for static generation
  
  // Configure TypeScript
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: false,
  },

  // Empty turbopack config to silence webpack migration warning
  turbopack: {},
};

export default nextConfig;
