/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure server-only modules are not bundled for the client
  serverExternalPackages: ['@supabase/supabase-js'],
};

export default nextConfig;
