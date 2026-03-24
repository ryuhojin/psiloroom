/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@psilo/auth", "@psilo/config", "@psilo/contracts", "@psilo/ui"],
};

export default nextConfig;
