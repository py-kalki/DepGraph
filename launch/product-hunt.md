# Product Hunt Launch Assets

## Product Tagline (≤ 60 chars)
Predict dependency abandonment before it breaks your build.

## Product Description (≤ 260 chars)
DepGraph analyzes GitHub activity, npm trends, and OSV vulnerability data to score the health of your open-source dependencies. Catch abandoned packages, bus-factor risks, and supply chain threats directly in your CI pipeline.

## First Comment (Maker's Comment)

Hey Product Hunt! 👋 I'm excited to share DepGraph with you today.

As developers, we blindly trust hundreds of dependencies. But what happens when the solo maintainer of a critical library burns out? Usually, we find out months later when the package breaks or gets hijacked (remember event-stream?). 

I built DepGraph to solve this. It's an early-warning system for your supply chain. 

We analyze 6 key signals:
- **Maintenance activity** (commits, issues)
- **Bus factor** (who actually writes the code?)
- **npm trends** (are downloads tanking?)
- **CVEs** (real-time OSV.dev data)

You can run it right now with `npx depgraph-scanner check` (no installation required), or add our GitHub Action to automatically fail PRs that introduce risky dependencies.

I'd love to hear your feedback! What signals do you look for when evaluating a new library?

## FAQ

**Q: Do you support private repositories?**
A: Yes! Pro and Team plans support private repos and integrate directly with your private GitHub Actions runners.

**Q: Where does the vulnerability data come from?**
A: We integrate directly with OSV.dev (Open Source Vulnerabilities) for real-time CVE data.

**Q: Can I use this locally?**
A: Absolutely. `npx depgraph-scanner check` works locally on any machine with Node.js installed.

**Q: How is the "Bus Factor" calculated?**
A: We look at the GitHub contributor data over the last 12 months. If a single developer accounts for >80% of all commits, that's a bus factor of 1 (high risk).
