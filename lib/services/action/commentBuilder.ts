// =============================================================================
// DepGraph — Service: PR Comment Builder (Week 6)
// Generates the GitHub PR comment markdown body per PRD §F-05.
// =============================================================================

import type { DepDelta, ScoredDep } from './differ';

export type CommentInput = {
  baseScore:   number | null;
  headScore:   number;
  delta:       DepDelta;
  gateResult:  'pass' | 'warn' | 'fail';
  gateReason:  string;
  reportUrl:   string;
  githubRepo:  string;
  prNumber:    number;
};

const RISK_EMOJI: Record<string, string> = {
  critical: '🔴',
  high:     '🟠',
  medium:   '🟡',
  low:      '🔵',
  healthy:  '🟢',
};

const GATE_BADGE: Record<string, string> = {
  pass: '✅ PASSED',
  warn: '⚠️ WARNING',
  fail: '❌ FAILED',
};

function scoreBar(score: number): string {
  const filled = Math.round(score / 10);
  return '█'.repeat(filled) + '░'.repeat(10 - filled);
}

function scoreDeltaStr(base: number | null, head: number): string {
  if (base === null) return '';
  const diff = head - base;
  if (diff > 0) return ` ↑ ${diff} from ${base}`;
  if (diff < 0) return ` ↓ ${Math.abs(diff)} from ${base}`;
  return ` → unchanged from ${base}`;
}

function depRow(dep: ScoredDep): string {
  const emoji = RISK_EMOJI[dep.riskLevel] ?? '⚪';
  const cve   = dep.cveCount > 0 ? ` · ${dep.cveCount} CVE${dep.cveCount > 1 ? 's' : ''}` : '';
  const aband = dep.abandonmentRisk ? ' · ⚠ Abandonment risk' : '';
  return `| \`${dep.name}\` | ${dep.version} | ${dep.score} | ${emoji} ${dep.riskLevel}${cve}${aband} |`;
}

/**
 * Build the full PR comment markdown.
 * Hidden marker `<!-- depgraph-comment -->` enables update-in-place dedup.
 */
export function buildPrComment(input: CommentInput): string {
  const {
    baseScore, headScore, delta, gateResult, gateReason, reportUrl,
  } = input;

  const lines: string[] = [];

  lines.push('<!-- depgraph-comment -->');
  lines.push('## 🔍 DepGraph Dependency Health');
  lines.push('');

  // Score banner
  lines.push(`**Overall Score: ${headScore}/100** ${scoreBar(headScore)}${scoreDeltaStr(baseScore, headScore)}`);
  lines.push('');
  lines.push(`**CI Gate: ${GATE_BADGE[gateResult]}** — ${gateReason}`);
  lines.push('');

  // New dependencies table
  if (delta.added.length > 0) {
    lines.push('### New Dependencies');
    lines.push('');
    lines.push('| Package | Version | Score | Risk |');
    lines.push('|---------|---------|-------|------|');
    for (const dep of delta.added) {
      lines.push(depRow(dep));
    }
    lines.push('');
  }

  // Updated dependencies
  if (delta.updated.length > 0) {
    lines.push('<details>');
    lines.push(`<summary>Updated Dependencies (${delta.updated.length})</summary>`);
    lines.push('');
    lines.push('| Package | From | To | Score Change |');
    lines.push('|---------|------|----|--------------|');
    for (const u of delta.updated) {
      const change = u.scoreDelta !== null
        ? (u.scoreDelta >= 0 ? `+${u.scoreDelta}` : String(u.scoreDelta))
        : 'N/A';
      lines.push(`| \`${u.name}\` | ${u.fromVersion} | ${u.toVersion} | ${change} |`);
    }
    lines.push('');
    lines.push('</details>');
    lines.push('');
  }

  // Removed dependencies
  if (delta.removed.length > 0) {
    lines.push('<details>');
    lines.push(`<summary>Removed Dependencies (${delta.removed.length})</summary>`);
    lines.push('');
    for (const dep of delta.removed) {
      lines.push(`- \`${dep.name}@${dep.version}\``);
    }
    lines.push('');
    lines.push('</details>');
    lines.push('');
  }

  // Risk breakdown
  const criticals = delta.added.filter((d) => d.riskLevel === 'critical');
  const highs     = delta.added.filter((d) => d.riskLevel === 'high');

  if (criticals.length > 0) {
    lines.push('### 🔴 Critical Findings');
    lines.push('');
    for (const dep of criticals) {
      lines.push(`- **\`${dep.name}\`** (score: ${dep.score}) — ${dep.cveCount > 0 ? `${dep.cveCount} active CVE(s)` : 'Critical risk level'}${dep.abandonmentRisk ? ', abandonment risk detected' : ''}`);
    }
    lines.push('');
  }

  if (highs.length > 0) {
    lines.push('### 🟠 High Risk');
    lines.push('');
    for (const dep of highs) {
      lines.push(`- **\`${dep.name}\`** (score: ${dep.score})${dep.abandonmentRisk ? ' — abandonment risk' : ''}`);
    }
    lines.push('');
  }

  // Recommendations
  if (criticals.length > 0 || highs.length > 0) {
    lines.push('### Recommended Actions');
    lines.push('');
    for (const dep of criticals) {
      lines.push(`- 🔴 Replace \`${dep.name}\` with a healthier alternative`);
    }
    for (const dep of highs) {
      lines.push(`- 🟠 Monitor \`${dep.name}\` — consider alternatives`);
    }
    lines.push('');
  }

  // Report link
  lines.push(`---`);
  lines.push(`[📊 Full Report](${reportUrl}) · [DepGraph](https://depgraph.vedanshh.dev)`);

  return lines.join('\n');
}
