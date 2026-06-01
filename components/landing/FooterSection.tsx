import Link from 'next/link';

const LINKS = {
  Product: [
    { label: 'Features', href: '/#features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Dashboard', href: '/dashboard' },
  ],
  Resources: [
    { label: 'Documentation', href: '/docs' },
    { label: 'CLI Guide', href: '/docs/cli' },
    { label: 'GitHub Action', href: '/docs/action' },
    { label: 'API Reference', href: '/docs/api' },
  ],
  Company: [
    { label: 'GitHub', href: 'https://github.com/depgraph' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Refund Policy', href: '/refund' },
    { label: 'Contact', href: '/support' },
  ]
};

export default function FooterSection() {
  return (
    <footer className="modern-footer" role="contentinfo">
      <div className="footer-glow-line" />
      
      <div className="footer-container modern-footer-grid">
        <div className="footer-brand-col">
          <Link href="/" className="footer-logo-modern">
            <div className="logo-box"><span>D</span></div>
            DepGraph
          </Link>
          <p className="footer-tagline-modern">
            Dependency intelligence for developers who care about reliability. Catch abandoned packages before they break your build.
          </p>
          <div className="footer-status">
            <span className="status-dot" />
            All Systems Operational
          </div>
        </div>

        <div className="footer-links-col">
          <h3 className="footer-heading">Product</h3>
          <ul>
            {LINKS.Product.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="footer-link-modern">{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-links-col">
          <h3 className="footer-heading">Resources</h3>
          <ul>
            {LINKS.Resources.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="footer-link-modern">{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-links-col">
          <h3 className="footer-heading">Company</h3>
          <ul>
            {LINKS.Company.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="footer-link-modern">{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="modern-footer-bottom">
        <div className="footer-container bottom-flex">
          <p className="footer-copyright">
            © {new Date().getFullYear()} DepGraph. Built in public.
          </p>
          <p className="footer-built-with">
            Scores updated daily <span>·</span> Powered by GitHub API, npm Registry, OSV.dev
          </p>
        </div>
      </div>
    </footer>
  );
}
