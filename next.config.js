import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 성능 최적화 설정
  experimental: {
    // 이미지 최적화
    optimizePackageImports: ['react-icons'],
  },
  
  // 압축 활성화
  compress: true,
  
  // PoweredByHeader 제거 (보안상 좋음)
  poweredByHeader: false,
  
  // Strict Mode 활성화
  reactStrictMode: true,
};

export default withBundleAnalyzer(nextConfig);