/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure server-only modules are not bundled for the client
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
};

export default nextConfig;
