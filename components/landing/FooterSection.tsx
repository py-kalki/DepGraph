import Link from 'next/link';

const LINKS = [
  { label: 'Documentation', href: '/docs' },
  { label: 'GitHub',        href: 'https://github.com/depgraph' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Contact',       href: 'mailto:support@depgraph.dev' },
];

export default function FooterSection() {
  return (
    <footer className="landing-footer" role="contentinfo">
      <div className="footer-container">
        <div className="footer-brand">
          <span className="footer-logo">DepGraph</span>
          <p className="footer-tagline">
            Dependency intelligence for developers who care about reliability.
          </p>
        </div>

        <nav className="footer-nav" aria-label="Footer navigation">
          <ul className="footer-links">
            {LINKS.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="footer-link">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="footer-bottom">
        <p className="footer-copyright">
          © {new Date().getFullYear()} DepGraph. Built in public.
        </p>
        <p className="footer-built-with">
          Scores updated daily · Powered by GitHub API, npm Registry, OSV.dev
        </p>
      </div>
    </footer>
  );
}
