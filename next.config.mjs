import withBundleAnalyzer from '@next/bundle-analyzer';

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@refinedev/antd"],
  output: "standalone",
  experimental: {
    optimizePackageImports: ['@ant-design/icons', 'antd', '@refinedev/antd', '@refinedev/core'],
  },
};

export default bundleAnalyzer(nextConfig);
