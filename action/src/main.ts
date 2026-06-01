// =============================================================================
// depgraph/action — main.ts
// Entry point: orchestrates the full DepGraph action execution flow.
// =============================================================================

import * as core from '@actions/core';
import * as fs from 'fs';
import * as path from 'path';

import { readInputs } from './inputs';
import { setOutputs } from './outputs';
import { DepGraphApiClient } from './api';
import { parsePackageJson, packageFilesChanged, readBaseFile } from './diff';
import { getOctokit, getPrContext, upsertPrComment } from './github';

async function run(): Promise<void> {
  const startMs = Date.now();

  try {
    // 1. Read and validate inputs
    const inputs  = readInputs();
    const api     = new DepGraphApiClient(inputs.apiUrl, inputs.apiKey);

    core.info('DepGraph — Dependency Health Check');
    core.info(`fail-on: ${inputs.failOn} | post-comment: ${inputs.postComment}`);

    // 2. Get PR context from GitHub Actions event
    const { owner, repo, prNumber, baseSha, headSha } = getPrContext();
    const githubRepo = `${owner}/${repo}`;

    core.info(`PR #${prNumber} on ${githubRepo} (${baseSha.slice(0, 7)} → ${headSha.slice(0, 7)})`);

    // 3. Check if package files changed
    const changed = packageFilesChanged(baseSha, headSha);
    if (!changed) {
      core.notice('No package.json or package-lock.json changes detected — skipping scan');
      setOutputs({ overallScore: 100, criticalCount: 0, highCount: 0, reportUrl: '' });
      return;
    }

    // 4. Read base and head package.json
    const headPkgRaw  = fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8');
    const basePkgRaw  = readBaseFile(baseSha, 'package.json') ?? headPkgRaw; // fallback to head if base not available

    // 5. Compare dep trees
    core.info('Comparing dependency trees...');
    const compareResult = await api.compare({
      base:       basePkgRaw,
      head:       headPkgRaw,
      githubRepo,
      prNumber,
      baseSha,
      headSha,
    });

    core.info(`Score: ${compareResult.base_score} → ${compareResult.head_score} (delta: ${compareResult.score_delta > 0 ? '+' : ''}${compareResult.score_delta})`);
    core.info(`New deps: ${compareResult.added.length} added, ${compareResult.removed.length} removed, ${compareResult.updated.length} updated`);
    core.info(`Risk: ${compareResult.critical_count} critical, ${compareResult.high_count} high`);

    // 6. Get CI gate decision
    const decision = await api.decision({
      criticalCount: compareResult.critical_count,
      highCount:     compareResult.high_count,
      mediumCount:   compareResult.medium_count,
      scoreDelta:    compareResult.score_delta,
      failOn:        inputs.failOn,
    });

    core.info(`CI Gate: ${decision.result.toUpperCase()} — ${decision.reason}`);

    // 7. Generate PR comment
    let reportUrl = '';
    if (inputs.postComment) {
      const summaryResult = await api.summary({
        baseScore:     compareResult.base_score,
        headScore:     compareResult.head_score,
        scoreDelta:    compareResult.score_delta,
        added:         compareResult.added,
        removed:       compareResult.removed,
        updated:       compareResult.updated,
        criticalCount: compareResult.critical_count,
        highCount:     compareResult.high_count,
        gateResult:    decision.result,
        gateReason:    decision.reason,
        reportUrl:     '', // will be set after scan
        githubRepo,
        prNumber,
      });

      // 8. Post/update PR comment
      try {
        const octokit   = getOctokit();
        const commentId = await upsertPrComment(octokit, owner, repo, prNumber, summaryResult.markdown);
        core.info(`PR comment ${commentId > 0 ? 'updated' : 'posted'}: #${commentId}`);
      } catch (commentErr) {
        core.warning(`Failed to post PR comment: ${commentErr}`);
        // Non-fatal — do not block CI gate result
      }
    }

    // 9. Set action outputs
    setOutputs({
      overallScore:  compareResult.head_score,
      criticalCount: compareResult.critical_count,
      highCount:     compareResult.high_count,
      reportUrl,
    });

    const executionMs = Date.now() - startMs;
    core.info(`DepGraph completed in ${executionMs}ms`);

    // 10. Apply exit code
    if (decision.exit_code === 1) {
      core.setFailed(`DepGraph: ${decision.reason}`);
    }

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    // Classify error
    if (message.includes('Invalid API key') || message.includes('401')) {
      core.setFailed('Invalid DEPGRAPH_API_KEY — check your repository secret');
    } else if (message.includes('403') || message.includes('Pro or Team')) {
      core.setFailed('GitHub Action requires a DepGraph Pro or Team plan — upgrade at depgraph.vedanshh.dev/pricing');
    } else if (message.includes('rate limited')) {
      core.warning(`DepGraph: ${message} — skipping health gate`);
      // Don't fail build on rate limits
    } else {
      core.setFailed(`DepGraph: ${message}`);
    }
  }
}

run();
