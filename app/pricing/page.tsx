// Server Component — safe to export metadata here
import type { Metadata } from 'next';
import PricingPageClient from './PricingPageClient';

export const metadata: Metadata = {
  title: 'Pricing — DepGraph',
  description:
    'Start free with 3 saved projects. Upgrade to Pro for unlimited projects, private repos, and real-time alerts.',
};

export default function PricingPage() {
  return <PricingPageClient />;
}
