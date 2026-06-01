import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { PostHogProvider } from '@/components/analytics/PostHogProvider';
import './globals.css';
import { SessionProvider } from '@/components/auth/SessionProvider';

const inter = Inter({ subsets: ['latin'] });

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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <PostHogProvider>
          <SessionProvider>{children}</SessionProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
