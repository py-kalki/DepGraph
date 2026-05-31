import Link from 'next/link';
import TerminalDemo from './TerminalDemo';

export default function HeroSection() {
  return (
    <section className="hero-section" aria-labelledby="hero-headline">
      <div className="hero-content">
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          Now in beta — free forever for public repos
        </div>

        <h1 id="hero-headline" className="hero-title">
          Know which dependencies
          <br />
          <span className="hero-title-accent">will break before they do</span>
        </h1>

        <p className="hero-description">
          DepGraph gives every npm package a real-time health score — maintenance
          activity, bus factor, download trend, known CVEs — so you can fix risks
          before they become production emergencies.
        </p>

        <div className="hero-actions">
          <Link href="/dashboard" className="btn btn-primary" id="hero-cta-primary">
            Start for free
          </Link>
          <Link href="/pricing" className="btn btn-secondary" id="hero-cta-secondary">
            See pricing →
          </Link>
        </div>

        <p className="hero-meta">
          No install required &nbsp;·&nbsp; Works on any npm project &nbsp;·&nbsp; Results in 30 seconds
        </p>
      </div>

      <div className="hero-terminal" aria-hidden="true">
        <TerminalDemo />
      </div>
    </section>
  );
}
