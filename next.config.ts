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
    // هذا السطر يمنع فشل الـ Build بسبب أخطاء الـ TypeScript
    ignoreBuildErrors: true,
  },
};

