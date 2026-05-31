// =============================================================================
// DepGraph — DB Queries: projects
// CRUD for the `projects` table (user's saved repos).
// PRD §F-04: Free tier — up to 3 saved projects, public repos only.
// =============================================================================

import { getDbClient } from '@/lib/db/client';
import type { DbProject } from '@/lib/types';

/**
 * Fetch all projects belonging to a user.
 * Ordered by most recently created first.
 */
export async function getUserProjects(userId: string): Promise<DbProject[]> {
  const db = getDbClient();

  const { data, error } = await db
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`[DB] getUserProjects failed: ${error.message}`);
  return (data ?? []) as DbProject[];
}

/**
 * Fetch a single project by ID.
 * Returns null if not found OR if the project doesn't belong to the given user.
 * Enforces ownership — never returns another user's project.
 */
export async function getProjectById(
  projectId: string,
  userId: string
): Promise<DbProject | null> {
  const db = getDbClient();

  const { data, error } = await db
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;
  return data as DbProject;
}

/**
 * Create a new project.
 * Free tier limit (up to 3 projects) is enforced at the API route level.
 */
export async function createProject(
  userId: string,
  name: string,
  githubRepo: string | null
): Promise<DbProject> {
  const db = getDbClient();

  const { data, error } = await db
    .from('projects')
    .insert({
      user_id: userId,
      name,
      github_repo: githubRepo,
    })
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(`[DB] createProject failed: ${error?.message}`);
  }

  return data as DbProject;
}

/**
 * Update a project's cached score and last_scanned timestamp.
 * Called after a scan completes to keep the projects table up-to-date.
 */
export async function updateProjectScore(
  projectId: string,
  score: number
): Promise<void> {
  const db = getDbClient();

  const { error } = await db
    .from('projects')
    .update({ score, last_scanned: new Date().toISOString() })
    .eq('id', projectId);

  if (error) {
    throw new Error(`[DB] updateProjectScore failed: ${error.message}`);
  }
}

/**
 * Update a project's name and/or github_repo.
 * Ownership must be verified before calling.
 */
export async function updateProject(
  projectId: string,
  userId: string,
  updates: { name?: string; githubRepo?: string | null },
): Promise<DbProject> {
  const db = getDbClient();
  const payload: Record<string, unknown> = {};
  if (updates.name !== undefined)      payload.name = updates.name;
  if (updates.githubRepo !== undefined) payload.github_repo = updates.githubRepo;

  const { data, error } = await db
    .from('projects')
    .update(payload)
    .eq('id', projectId)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error || !data) throw new Error(`[DB] updateProject failed: ${error?.message}`);
  return data as DbProject;
}

/**
 * Soft-delete a project (is_active = false).
 * Hard delete is handled by ON DELETE CASCADE on scan_reports.
 * We soft-delete to keep scan history accessible for a short grace period.
 */
export async function deleteProject(
  projectId: string,
  userId: string,
): Promise<void> {
  const db = getDbClient();

  // Hard delete — ON DELETE CASCADE handles scan_reports, score_history
  const { error } = await db
    .from('projects')
    .delete()
    .eq('id', projectId)
    .eq('user_id', userId);

  if (error) throw new Error(`[DB] deleteProject failed: ${error.message}`);
}

/**
 * Get all projects eligible for daily refresh.
 * is_active=true, refresh_enabled=true, last_scanned > 23 hours ago (or never).
 */
export async function getProjectsDueForRefresh(): Promise<DbProject[]> {
  const db = getDbClient();
  const cutoff = new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString();

  const { data, error } = await db
    .from('projects')
    .select('*')
    .eq('is_active', true)
    .eq('refresh_enabled', true)
    .not('github_repo', 'is', null)
    .or(`last_scanned.is.null,last_scanned.lt.${cutoff}`);

  if (error) throw new Error(`[DB] getProjectsDueForRefresh failed: ${error.message}`);
  return (data ?? []) as DbProject[];
}
