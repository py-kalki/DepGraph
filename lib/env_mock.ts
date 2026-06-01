import { getEnv } from './env';

// Allow testing to set process.env.ADMIN_EMAILS without needing a local .env file.
if (!process.env.ADMIN_EMAILS) {
  process.env.ADMIN_EMAILS = 'admin@depgraph.vedanshh.dev';
}
