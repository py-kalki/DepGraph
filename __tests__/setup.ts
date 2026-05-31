// =============================================================================
// Jest Global Test Setup
// Sets all required env vars so getEnv() doesn't throw during unit tests.
// Tests that make real API calls should be integration tests (not in this file).
// =============================================================================

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io';
process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';
process.env.GITHUB_TOKEN = 'ghp_test_token';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';

