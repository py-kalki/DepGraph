import type { Metadata } from 'next';
import LandingNavbar      from '@/components/landing/LandingNavbar';
import HoverCardEffect    from '@/components/landing/HoverCardEffect';
import HeroSection        from '@/components/landing/HeroSection';
import SocialProofSection from '@/components/landing/SocialProofSection';
import ProblemSection     from '@/components/landing/ProblemSection';
import FeaturesSection    from '@/components/landing/FeaturesSection';
import CLISection         from '@/components/landing/CLISection';
import ComparisonSection  from '@/components/landing/ComparisonSection';
import PricingSection     from '@/components/landing/PricingSection';
import FAQSection         from '@/components/landing/FAQSection';
import FooterSection      from '@/components/landing/FooterSection';

export const metadata: Metadata = {
  title: 'DepGraph — Predict dependency failures before they reach production',
  description:
    'Real-time health scores for every npm package. Spot abandonment risk, supply chain threats, and CVEs before they become production incidents.',
  keywords: ['predict dependency failures', 'npm package health', 'abandonment risk', 'supply chain threats', 'CVE detection', 'DepGraph'],
  openGraph: {
    title: 'DepGraph — Dependency Intelligence Platform',
    description: 'Real-time health scores for every npm package. Predict failures before production.',
    type: 'website',
    url: 'https://depgraph.vedanshh.dev',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DepGraph — Predict dependency failures',
    description: 'Real-time health scores for every npm package. Spot abandonment risk and CVEs.',
  },
  alternates: {
    canonical: '/',
  },
};

export default function LandingPage() {
  return (
    <div style={{ background: '#0A0A0A', minHeight: '100vh' }}>
      <HoverCardEffect />
      <LandingNavbar />
      <main id="main-content">
        <HeroSection />
        <SocialProofSection />
        <ProblemSection />
        <FeaturesSection />
        <CLISection />

        <ComparisonSection />
        <PricingSection />
        <FAQSection />
        <FooterSection />
      </main>
    </div>
  );
}
