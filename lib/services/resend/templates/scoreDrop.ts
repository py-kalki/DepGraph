// =============================================================================
// DepGraph — Email Template: Score Drop Alert
// PRD §8 US-09: "receive email alerts when a dependency's score drops"
// =============================================================================

import type { ScoreDropPayload } from '@/lib/types';

export function scoreDropSubject(p: ScoreDropPayload): string {
  return `⚠️ ${p.projectName} health score dropped to ${p.currentScore}`;
}

export function scoreDropHtml(p: ScoreDropPayload): string {
  const arrow = p.delta < 0 ? '↓' : '↑';
  const color = p.currentScore < 40 ? '#E24B4A' : p.currentScore < 60 ? '#EF9F27' : '#EAB308';

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Score Drop Alert — DepGraph</title></head>
<body style="margin:0;padding:0;background:#0A0C10;font-family:Inter,system-ui,sans-serif;color:#E2E8F0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0C10;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#111318;border-radius:12px;border:1px solid #1A1D24;overflow:hidden;">
        <tr><td style="background:#E24B4A;padding:4px 24px;">
          <p style="margin:0;font-size:11px;font-weight:600;color:#fff;letter-spacing:0.05em;font-family:monospace;">SCORE DROP ALERT</p>
        </td></tr>
        <tr><td style="padding:32px 40px;">
          <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#F1F5F9;">${p.projectName}</h1>
          <p style="margin:0 0 28px;font-size:15px;color:#94A3B8;">Your project health score has dropped significantly.</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#1A1D24;border-radius:8px;margin-bottom:28px;">
            <tr>
              <td style="padding:20px 24px;border-right:1px solid #252830;">
                <p style="margin:0 0 4px;font-size:11px;color:#64748B;text-transform:uppercase;letter-spacing:0.05em;">Previous Score</p>
                <p style="margin:0;font-size:28px;font-weight:700;color:#94A3B8;font-family:monospace;">${p.previousScore}</p>
              </td>
              <td style="padding:20px 24px;border-right:1px solid #252830;">
                <p style="margin:0 0 4px;font-size:11px;color:#64748B;text-transform:uppercase;letter-spacing:0.05em;">Current Score</p>
                <p style="margin:0;font-size:28px;font-weight:700;color:${color};font-family:monospace;">${p.currentScore}</p>
              </td>
              <td style="padding:20px 24px;">
                <p style="margin:0 0 4px;font-size:11px;color:#64748B;text-transform:uppercase;letter-spacing:0.05em;">Change</p>
                <p style="margin:0;font-size:28px;font-weight:700;color:#E24B4A;font-family:monospace;">${arrow}${Math.abs(p.delta)}</p>
              </td>
            </tr>
          </table>
          <a href="${p.shareUrl}" style="display:inline-block;background:#378ADD;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600;">View Full Report →</a>
        </td></tr>
        <tr><td style="padding:16px 40px;border-top:1px solid #1A1D24;">
          <p style="margin:0;font-size:12px;color:#475569;">You're receiving this because you have score drop alerts enabled. <a href="${p.shareUrl}/settings/notifications" style="color:#378ADD;">Manage preferences</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export function scoreDropText(p: ScoreDropPayload): string {
  return `Score Drop Alert — ${p.projectName}

Your project health score dropped from ${p.previousScore} to ${p.currentScore} (${p.delta} points).

View full report: ${p.shareUrl}

Manage alerts: ${p.shareUrl}/settings/notifications`;
}
