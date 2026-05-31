// =============================================================================
// DepGraph — Email Template: Weekly Digest
// PRD §9 F-04: "Email alerts: weekly digest only" for free tier
// =============================================================================

import type { WeeklyDigestPayload } from '@/lib/types';

function riskColor(score: number): string {
  if (score < 20) return '#E24B4A';
  if (score < 40) return '#EF9F27';
  if (score < 60) return '#EAB308';
  if (score < 80) return '#378ADD';
  return '#1D9E75';
}

function deltaStr(delta: number): string {
  if (delta > 0) return `<span style="color:#1D9E75;">↑${delta}</span>`;
  if (delta < 0) return `<span style="color:#E24B4A;">↓${Math.abs(delta)}</span>`;
  return `<span style="color:#64748B;">—</span>`;
}

export function weeklyDigestSubject(p: WeeklyDigestPayload): string {
  return `📊 Your DepGraph weekly summary — ${p.weekStart}`;
}

export function weeklyDigestHtml(p: WeeklyDigestPayload): string {
  const projectRows = p.projects
    .map(
      (proj) => `
      <tr style="border-top:1px solid #1A1D24;">
        <td style="padding:14px 16px;font-size:14px;color:#E2E8F0;font-weight:500;">${proj.name}</td>
        <td style="padding:14px 16px;font-size:16px;font-weight:700;color:${riskColor(proj.score)};font-family:monospace;">${proj.score}</td>
        <td style="padding:14px 16px;font-size:14px;">${deltaStr(proj.delta)}</td>
        <td style="padding:14px 16px;font-size:13px;color:#94A3B8;">${proj.criticalCount > 0 ? `<span style="color:#E24B4A;">${proj.criticalCount} critical</span>` : '—'}</td>
        <td style="padding:14px 16px;"><a href="${proj.shareUrl}" style="color:#378ADD;font-size:13px;text-decoration:none;">View →</a></td>
      </tr>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Weekly Digest — DepGraph</title></head>
<body style="margin:0;padding:0;background:#0A0C10;font-family:Inter,system-ui,sans-serif;color:#E2E8F0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0C10;padding:40px 0;">
    <tr><td align="center">
      <table width="640" cellpadding="0" cellspacing="0" style="background:#111318;border-radius:12px;border:1px solid #1A1D24;overflow:hidden;">
        <tr><td style="padding:28px 40px 24px;border-bottom:1px solid #1A1D24;">
          <h1 style="margin:0 0 6px;font-size:20px;font-weight:700;color:#F1F5F9;">Your weekly dependency health summary</h1>
          <p style="margin:0;font-size:14px;color:#64748B;">Week of ${p.weekStart} — ${p.weekEnd} · Hi, ${p.userName}</p>
        </td></tr>
        <tr><td style="padding:0 40px 28px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
            <thead>
              <tr style="background:#0A0C10;">
                <th style="padding:10px 16px;font-size:11px;font-weight:600;color:#64748B;text-align:left;text-transform:uppercase;letter-spacing:0.05em;">Project</th>
                <th style="padding:10px 16px;font-size:11px;font-weight:600;color:#64748B;text-align:left;text-transform:uppercase;letter-spacing:0.05em;">Score</th>
                <th style="padding:10px 16px;font-size:11px;font-weight:600;color:#64748B;text-align:left;text-transform:uppercase;letter-spacing:0.05em;">Change</th>
                <th style="padding:10px 16px;font-size:11px;font-weight:600;color:#64748B;text-align:left;text-transform:uppercase;letter-spacing:0.05em;">Issues</th>
                <th style="padding:10px 16px;font-size:11px;font-weight:600;color:#64748B;text-align:left;text-transform:uppercase;letter-spacing:0.05em;"></th>
              </tr>
            </thead>
            <tbody>${projectRows}</tbody>
          </table>
        </td></tr>
        <tr><td style="padding:20px 40px;background:#0D1017;border-top:1px solid #1A1D24;">
          <p style="margin:0;font-size:12px;color:#475569;">You're receiving this weekly digest because you have it enabled. <a href="/settings/notifications" style="color:#378ADD;">Manage preferences</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export function weeklyDigestText(p: WeeklyDigestPayload): string {
  const lines = p.projects.map(
    (proj) =>
      `${proj.name}: ${proj.score}/100 (${proj.delta >= 0 ? '+' : ''}${proj.delta}) | ${proj.criticalCount} critical | ${proj.shareUrl}`,
  );
  return `Your DepGraph Weekly Summary — ${p.weekStart}

Hi ${p.userName},

${lines.join('\n')}

Manage preferences: /settings/notifications`;
}
