'use client';

import { useState } from 'react';
import type { PlanTier } from '@/lib/types';

interface PricingCardProps {
  plan:        PlanTier;
  name:        string;
  price:       string;
  period?:     string;
  description: string;
  features:    string[];
  cta:         string;
  ctaHref:     string;
  highlighted?: boolean;
  badge?:      string;
}

export default function PricingCard({
  plan,
  name,
  price,
  period = '/month',
  description,
  features,
  cta,
  ctaHref,
  highlighted = false,
  badge,
}: PricingCardProps) {
  const [loading, setLoading] = useState(false);

  const handleCta = () => {
    if (ctaHref.startsWith('/')) {
      window.location.href = ctaHref;
    } else {
      setLoading(true);
      window.location.href = ctaHref;
    }
  };

  return (
    <article
      className={`pricing-card ${highlighted ? 'pricing-card--highlighted' : ''}`}
      data-plan={plan}
      aria-label={`${name} plan — ${price}${period}`}
    >
      {badge && (
        <div className="pricing-badge" aria-label="Recommended">
          {badge}
        </div>
      )}

      <header className="pricing-header">
        <h3 className="pricing-plan-name">{name}</h3>
        <div className="pricing-price-row">
          <span className="pricing-price">{price}</span>
          {price !== 'Free' && <span className="pricing-period">{period}</span>}
        </div>
        <p className="pricing-description">{description}</p>
      </header>

      <ul className="pricing-features" aria-label={`${name} plan features`}>
        {features.map((feat) => (
          <li key={feat} className="pricing-feature-item">
            <span className="pricing-check" aria-hidden="true">✓</span>
            {feat}
          </li>
        ))}
      </ul>

      <button
        id={`cta-plan-${plan}`}
        className={`btn ${highlighted ? 'btn-premium' : 'btn-secondary'} pricing-cta`}
        onClick={handleCta}
        disabled={loading}
        aria-busy={loading}
      >
        {loading ? 'Redirecting…' : cta}
      </button>
    </article>
  );
}
