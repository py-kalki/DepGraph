# Hacker News Launch Assets

## Title
Show HN: DepGraph – Predict dependency abandonment before it breaks your build

## Body
Hey HN,

I've always been bothered by how we manage dependencies in JS/TS land. We run `npm install` and hope the packages we rely on will be maintained forever. But they aren't. Maintainers burn out, projects get abandoned, and sometimes they get hijacked.

I built DepGraph to give you an early warning system. It's a CLI tool and GitHub Action that analyzes the health of your entire dependency tree.

It doesn't just look at vulnerabilities (though it does pull real-time CVEs from OSV.dev). It looks at:
- **Bus Factor:** Is 95% of the code written by one person who hasn't committed in 6 months?
- **Issue Health:** Are PRs rotting?
- **npm Trends:** Is the community migrating away from this package?

It boils this down into a 0-100 health score. You can drop it into CI to fail PRs that introduce high-risk dependencies.

**Architecture:**
- CLI built with Node/Commander
- Scoring engine fetches from GitHub API, npm registry, and OSV
- Caching layer built on Redis (Upstash) to avoid rate limits (we cache scores for 24h)
- Web dashboard built with Next.js App Router and Supabase

You can try it immediately with zero config: `npx depgraph-scanner check`

I'd love your feedback on the scoring algorithm. What heuristic do you use to decide if an open-source library is safe to depend on?

Link: https://depgraph.vedanshh.dev
GitHub Action: https://github.com/marketplace/actions/depgraph
