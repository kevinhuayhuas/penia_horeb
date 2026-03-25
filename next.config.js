/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Next.js 15: mysql2 corre sólo en el servidor (no se empaqueta para el cliente)
  serverExternalPackages: ["mysql2"],
};

module.exports = nextConfig;
