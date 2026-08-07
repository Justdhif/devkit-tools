/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@devkit/shared',
    '@devkit/tool-core',
    '@devkit/json-tools',
    '@devkit/jwt-tools',
    '@devkit/crypto-tools',
    '@devkit/regex-tools',
  ],
};

module.exports = nextConfig;
