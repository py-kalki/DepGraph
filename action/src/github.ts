// =============================================================================
// depgraph/action — github.ts
// GitHub API interactions: get PR info, post/update PR comments.
// =============================================================================

import * as github from '@actions/github';
import * as core from '@actions/core';

export type OctokitClient = ReturnType<typeof github.getOctokit>;

const COMMENT_MARKER = '<!-- depgraph-comment -->';

/** Get Octokit client using the GITHUB_TOKEN from context. */
export function getOctokit(): OctokitClient {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN is not available in environment');
  return github.getOctokit(token);
}

/** Get PR context from the GitHub Actions event. */
export function getPrContext(): {
  owner:     string;
  repo:      string;
  prNumber:  number;
  baseSha:   string;
  headSha:   string;
} {
  const { owner, repo } = github.context.repo;
  const pr = github.context.payload.pull_request;
  if (!pr) throw new Error('Action must be triggered by a pull_request event');

  return {
    owner,
    repo,
    prNumber: pr.number as number,
    baseSha:  pr.base.sha as string,
    headSha:  pr.head.sha as string,
  };
}

/**
 * Find an existing DepGraph comment on the PR.
 * Searches by the hidden marker in the comment body.
 */
export async function findExistingComment(
  octokit: OctokitClient,
  owner: string,
  repo: string,
  prNumber: number,
): Promise<number | null> {
  try {
    const { data: comments } = await octokit.rest.issues.listComments({
      owner, repo, issue_number: prNumber, per_page: 100,
    });
    const existing = comments.find((c) => c.body?.includes(COMMENT_MARKER));
    return existing?.id ?? null;
  } catch (err) {
    core.debug(`Could not list PR comments: ${err}`);
    return null;
  }
}

/** Post a new PR comment. Returns the comment ID. */
export async function postComment(
  octokit: OctokitClient,
  owner: string,
  repo: string,
  prNumber: number,
  body: string,
): Promise<number> {
  const { data } = await octokit.rest.issues.createComment({
    owner, repo, issue_number: prNumber, body,
  });
  return data.id;
}

/** Update an existing PR comment. */
export async function updateComment(
  octokit: OctokitClient,
  owner: string,
  repo: string,
  commentId: number,
  body: string,
): Promise<void> {
  await octokit.rest.issues.updateComment({
    owner, repo, comment_id: commentId, body,
  });
}

/**
 * Post or update the DepGraph comment on the PR.
 * Returns the GitHub comment ID.
 */
export async function upsertPrComment(
  octokit: OctokitClient,
  owner: string,
  repo: string,
  prNumber: number,
  markdown: string,
): Promise<number> {
  const existingId = await findExistingComment(octokit, owner, repo, prNumber);

  if (existingId) {
    core.info(`Updating existing DepGraph comment #${existingId}`);
    await updateComment(octokit, owner, repo, existingId, markdown);
    return existingId;
  }

  core.info('Posting new DepGraph comment');
  return postComment(octokit, owner, repo, prNumber, markdown);
}
