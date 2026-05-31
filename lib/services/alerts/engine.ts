// =============================================================================
// DepGraph — Alert Engine
// Detects score drops, new CVEs, and abandonment risk changes.
// Called by the alert scanner cron job.
// =============================================================================

import type { DbAlertSubscription, DbProject } from '@/lib/types';
import type { SendEmailParams } from '@/lib/services/resend/sender';
import {
  scoreDropSubject,
  scoreDropHtml,
  scoreDropText,
} from '@/lib/services/resend/templates/scoreDrop';
import {
  newCveSubject,
  newCveHtml,
  newCveText,
} from '@/lib/services/resend/templates/newCve';
import {
  abandonmentSubject,
  abandonmentHtml,
  abandonmentText,
} from '@/lib/services/resend/templates/abandonmentRisk';
import { getEnv } from '@/lib/env';

export interface ScoreSnapshot {
  projectId:   string;
  projectName: string;
  score:       number;
  shareToken:  string | null;
}

function buildShareUrl(shareToken: string | null, projectId: string): string {
  const base = getEnv().NEXT_PUBLIC_APP_URL;
  return shareToken
    ? `${base}/report/${shareToken}`
    : `${base}/dashboard`;
}

/**
 * Check if a score drop alert should fire.
 * Returns email params if the alert should be sent, null otherwise.
 */
export function checkScoreDrop(
  alert: DbAlertSubscription,
  current: ScoreSnapshot,
  previous: ScoreSnapshot | null,
): SendEmailParams | null {
  if (alert.alert_type !== 'score_drop') return null;
  if (!previous) return null;

  const delta     = current.score - previous.score;
  const threshold = alert.threshold ?? 10; // Default: alert on ≥10 point drop

  if (delta >= 0 || Math.abs(delta) < threshold) return null; // No significant drop

  const payload = {
    projectName:   current.projectName,
    projectId:     current.projectId,
    previousScore: previous.score,
    currentScore:  current.score,
    delta,
    shareUrl:      buildShareUrl(current.shareToken, current.projectId),
  };

  return {
    userId:              alert.user_id,
    alertSubscriptionId: alert.id,
    emailType:           'score_drop',
    to:                  alert.destination,
    subject:             scoreDropSubject(payload),
    html:                scoreDropHtml(payload),
    text:                scoreDropText(payload),
  };
}

export interface CveSignal {
  packageName: string;
  cveId:       string;
  severity:    'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  isNew:       boolean; // true = discovered since last scan
}

/**
 * Check if a new CVE alert should fire.
 */
export function checkNewCve(
  alert: DbAlertSubscription,
  project: ScoreSnapshot,
  cves: CveSignal[],
): SendEmailParams[] {
  if (alert.alert_type !== 'new_cve') return [];

  const newCves = cves.filter((c) => c.isNew);
  if (newCves.length === 0) return [];

  return newCves.map((cve) => {
    const payload = {
      projectName: project.projectName,
      packageName: cve.packageName,
      cveId:       cve.cveId,
      severity:    cve.severity,
      description: cve.description,
      shareUrl:    buildShareUrl(project.shareToken, project.projectId),
    };
    return {
      userId:              alert.user_id,
      alertSubscriptionId: alert.id,
      emailType:           'new_cve',
      to:                  alert.destination,
      subject:             newCveSubject(payload),
      html:                newCveHtml(payload),
      text:                newCveText(payload),
    };
  });
}

export interface AbandonmentSignal {
  packageName:    string;
  score:          number;
  lastCommitDate: string | null;
  isNewFlag:      boolean; // true = abandonment_risk newly set this scan
}

/**
 * Check if an abandonment risk alert should fire.
 */
export function checkAbandonmentRisk(
  alert: DbAlertSubscription,
  project: ScoreSnapshot,
  signals: AbandonmentSignal[],
): SendEmailParams[] {
  if (alert.alert_type !== 'abandonment_risk') return [];

  const newFlags = signals.filter((s) => s.isNewFlag);
  if (newFlags.length === 0) return [];

  return newFlags.map((sig) => {
    const payload = {
      projectName:    project.projectName,
      packageName:    sig.packageName,
      score:          sig.score,
      lastCommitDate: sig.lastCommitDate,
      shareUrl:       buildShareUrl(project.shareToken, project.projectId),
    };
    return {
      userId:              alert.user_id,
      alertSubscriptionId: alert.id,
      emailType:           'abandonment_risk',
      to:                  alert.destination,
      subject:             abandonmentSubject(payload),
      html:                abandonmentHtml(payload),
      text:                abandonmentText(payload),
    };
  });
}
