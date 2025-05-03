// next.config.ts
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* ... other config */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos', // Keep if you use picsum for placeholders
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'fonts.googleapis.com', // Keep if needed
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com', // Keep for Firebase Storage URLs
        port: '',
        pathname: '/**',
      },
      { // **** ADD THIS FOR GOOGLE PLACES PHOTOS ****
        protocol: 'https',
        hostname: 'maps.googleapis.com',
        port: '',
        pathname: '/maps/api/place/photo**', // Be specific if possible
      },
      // **** ADD HOSTNAME FOR YOUR LOGO CDN IF APPLICABLE ****
      // {
      //   protocol: 'https',
      //   hostname: 'your-logo-cdn.com',
      //   port: '',
      //   pathname: '/**',
      // }
    ],
  },
};

export default nextConfig;
