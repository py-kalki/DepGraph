import type { Metadata } from 'next';
import HeroSection       from '@/components/landing/HeroSection';
import FeaturesSection   from '@/components/landing/FeaturesSection';
import SocialProofSection from '@/components/landing/SocialProofSection';
import PricingSection    from '@/components/landing/PricingSection';
import FooterSection     from '@/components/landing/FooterSection';
import LandingNavbar     from '@/components/landing/LandingNavbar';

export const metadata: Metadata = {
  title: 'DepGraph — Predict dependency abandonment before it breaks your app',
  description:
    'Real-time health scores for every npm package. Spot abandonment risk, supply chain threats, and CVEs before they become production emergencies.',
  openGraph: {
    title: 'DepGraph — Dependency intelligence for developers',
    description: 'Real-time health scores for every npm package.',
    type: 'website',
  },
};

export default function LandingPage() {
  return (
    <>
      <LandingNavbar />
      <main id="main-content" style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="bg-radial-glow"></div>
        <HeroSection />
        <FeaturesSection />
        <SocialProofSection />
        <PricingSection />
        <FooterSection />
      </main>
    </>
  );
}
