// =============================================================================
// depgraph/action — inputs.ts
// Read and validate GitHub Action inputs.
// =============================================================================

import * as core from '@actions/core';
import type { ActionInputs, FailOn } from './types';

const VALID_FAIL_ON: FailOn[] = ['none', 'critical', 'high', 'medium'];

export function readInputs(): ActionInputs {
  const apiKey = core.getInput('api-key', { required: true });
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('api-key input is required. Set DEPGRAPH_API_KEY as a repository secret.');
  }
  if (!apiKey.startsWith('dg_live_')) {
    core.warning('api-key does not look like a valid DepGraph API key (expected prefix: dg_live_)');
  }

  const rawFailOn = core.getInput('fail-on') || 'critical';
  if (!VALID_FAIL_ON.includes(rawFailOn as FailOn)) {
    throw new Error(`Invalid fail-on value: "${rawFailOn}". Must be one of: ${VALID_FAIL_ON.join(' | ')}`);
  }

  const postComment = core.getInput('post-comment').toLowerCase() !== 'false';
  const apiUrl      = (core.getInput('api-url') || 'https://depgraph.vedanshh.dev').replace(/\/$/, '');

  return {
    apiKey:      apiKey.trim(),
    failOn:      rawFailOn as FailOn,
    postComment,
    apiUrl,
  };
}
