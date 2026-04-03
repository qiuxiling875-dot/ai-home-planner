/** @type {import('next').NextConfig} */
const nextConfig = {
  // 允许加载AI API返回的远程图片
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // 实验性功能：Server Actions（用于后续支付回调等）
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // 支持上传大图
    },
  },
};

module.exports = nextConfig;
