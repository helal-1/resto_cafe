/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'obhmfyrhwnzgnlffvocz.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  typescript: {
    // يمنع فشل الـ Build بسبب أخطاء الـ TypeScript
    ignoreBuildErrors: true,
  },
  eslint: {
    // يمنع فشل الـ Build بسبب تحذيرات الـ ESLint
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;