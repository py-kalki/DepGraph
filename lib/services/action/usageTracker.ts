// =============================================================================
// DepGraph — Service: Usage Tracker (Week 6)
// Records usage_events rows on every action execution.
// =============================================================================

import { insertUsageEvent, type UsageEventType } from '@/lib/db/queries/usageEvents';
import type { GateResult } from '../action/gate';

export async function trackActionRun(params: {
  userId:        string;
  githubRepo:    string;
  prNumber:      number;
  overallScore:  number | null;
  criticalCount: number;
  highCount:     number;
  gateResult:    GateResult;
}): Promise<void> {
  try {
    await insertUsageEvent({
      userId:     params.userId,
      eventType:  'action_run' as UsageEventType,
      githubRepo: params.githubRepo,
      metadata: {
        pr_number:      params.prNumber,
        overall_score:  params.overallScore,
        critical_count: params.criticalCount,
        high_count:     params.highCount,
        gate_result:    params.gateResult,
      },
    });
  } catch (err) {
    // Usage tracking is non-fatal — log but do not fail the action
    console.warn('[UsageTracker] Failed to record action_run event:', err);
  }
}

export async function trackApiScan(params: {
  userId:     string;
  githubRepo: string | null;
  packCount:  number;
}): Promise<void> {
  try {
    await insertUsageEvent({
      userId:     params.userId,
      eventType:  'api_scan' as UsageEventType,
      githubRepo: params.githubRepo,
      metadata:   { package_count: params.packCount },
    });
  } catch (err) {
    console.warn('[UsageTracker] Failed to record api_scan event:', err);
  }
}

export async function trackApiCompare(params: {
  userId:     string;
  githubRepo: string | null;
  addedCount: number;
}): Promise<void> {
  try {
    await insertUsageEvent({
      userId:     params.userId,
      eventType:  'api_compare' as UsageEventType,
      githubRepo: params.githubRepo,
      metadata:   { added_count: params.addedCount },
    });
  } catch (err) {
    console.warn('[UsageTracker] Failed to record api_compare event:', err);
  }
}
