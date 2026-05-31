import type { Metadata } from 'next';
import './globals.css';
import { SessionProvider } from '@/components/auth/SessionProvider';

export const metadata: Metadata = {
  title: 'DepGraph — Dependency Intelligence',
  description:
    'Real-time health scores, abandonment risk forecasts, and supply-chain integrity signals for every open-source library in your project.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
