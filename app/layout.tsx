import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { PostHogProvider } from '@/components/analytics/PostHogProvider';
import './globals.css';
import { SessionProvider } from '@/components/auth/SessionProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://depgraph.com'),
  title: 'DepGraph — Dependency Intelligence',
  description:
    'Real-time health scores, abandonment risk forecasts, and supply-chain integrity signals for every open-source library in your project.',
  keywords: ['dependency intelligence', 'npm security', 'supply chain integrity', 'open source', 'vulnerability scanner'],
  authors: [{ name: 'Vedansh Danot', url: 'https://www.vedanshh.dev' }],
  creator: 'Vedansh Danot',
  openGraph: {
    title: 'DepGraph — Dependency Intelligence',
    description: 'Real-time health scores, abandonment risk forecasts, and supply-chain integrity signals.',
    url: 'https://depgraph.com',
    siteName: 'DepGraph',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DepGraph — Dependency Intelligence',
    description: 'Real-time health scores, abandonment risk forecasts, and supply-chain integrity signals.',
    creator: '@vedanshh',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
