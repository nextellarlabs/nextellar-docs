// import createMDX from '@next/mdx';
import { createContentlayerPlugin } from 'next-contentlayer2';

const nextConfig = {
  // pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  
  // Next.js 16 uses Turbopack by default, adding empty turbopack config to silence warning
  turbopack: {},
  
  // Keep webpack config for backward compatibility when using --webpack flag
  webpack: (config: { cache: boolean }) => {
    config.cache = false;
    return config;
  },
  
  images: {
    remotePatterns: [
      {
        protocol: 'https' as 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },
};

const withContentlayer = createContentlayerPlugin({
  // Additional Contentlayer config options
});

export default withContentlayer(nextConfig);
