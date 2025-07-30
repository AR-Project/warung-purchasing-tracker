/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  serverExternalPackages: ["@node-rs/argon2"]
};

export default nextConfig;
