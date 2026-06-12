import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getApiKeysByUserId } from '@/lib/db/queries/apiKeys';
import ApiKeyManager from '@/components/settings/ApiKeyManager';

export const metadata = {
  title: 'API Keys — DepGraph',
  description: 'Manage your DepGraph API keys for GitHub Action integration.',
};

export default async function ApiSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.userId) redirect('/login');

  const plan = (session as { plan?: string }).plan ?? 'free';
  const keys = await getApiKeysByUserId(session.userId);
  // Strip key_hash before passing to client
  const safeKeys = keys.map(({ key_hash: _h, ...rest }) => rest);

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>API Keys</h1>
        <p className="settings-subtitle">
          Authenticate the <code>depgraph/action</code> GitHub Action with a personal API key.
        </p>
      </div>

      <ApiKeyManager initialKeys={safeKeys} plan={plan} />

      <div className="settings-section">
        <h2>Quick Setup</h2>
        <p>Add this to your GitHub repository workflow:</p>
        <pre className="code-block">{`# .github/workflows/depgraph.yml
name: Dependency Health Check

on: [pull_request]

jobs:
  depgraph:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: py-kalki/depgraph-action@v1
        with:
          api-key: \${{ secrets.DEPGRAPH_API_KEY }}
          fail-on: critical
          post-comment: true`}
        </pre>
        <p className="settings-hint">
          Add <code>DEPGRAPH_API_KEY</code> to your repository secrets with the key above.
        </p>
      </div>
    </div>
  );
}
