import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/', // / 들어오면
        destination: '/main', // /main 으로 이동
        permanent: true, // 301 영구 리다이렉트
      },
    ];
  },
};

export default nextConfig;
