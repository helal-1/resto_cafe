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
    ignoreBuildErrors: true,
  },
  // تم حذف eslint من هنا لأنه يسبب تحذيراً في الإصدارات الجديدة
};

module.exports = nextConfig;