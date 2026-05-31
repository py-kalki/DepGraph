// =============================================================================
// DepGraph — Email Template: Abandonment Risk Alert
// =============================================================================

import type { AbandonmentRiskPayload } from '@/lib/types';

export function abandonmentSubject(p: AbandonmentRiskPayload): string {
  return `⚡ Abandonment risk detected: ${p.packageName} in ${p.projectName}`;
}

export function abandonmentHtml(p: AbandonmentRiskPayload): string {
  const lastCommit = p.lastCommitDate
    ? new Date(p.lastCommitDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Unknown';

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Abandonment Risk Alert — DepGraph</title></head>
<body style="margin:0;padding:0;background:#0A0C10;font-family:Inter,system-ui,sans-serif;color:#E2E8F0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0C10;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#111318;border-radius:12px;border:1px solid #1A1D24;overflow:hidden;">
        <tr><td style="background:#EF9F27;padding:4px 24px;">
          <p style="margin:0;font-size:11px;font-weight:600;color:#fff;letter-spacing:0.05em;font-family:monospace;">ABANDONMENT RISK DETECTED</p>
        </td></tr>
        <tr><td style="padding:32px 40px;">
          <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#F1F5F9;"><code style="background:#1A1D24;padding:2px 8px;border-radius:4px;font-size:18px;">${p.packageName}</code> may be abandoned</h1>
          <p style="margin:0 0 28px;font-size:15px;color:#94A3B8;">In project: <strong style="color:#E2E8F0;">${p.projectName}</strong></p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#1A1D24;border-radius:8px;margin-bottom:28px;">
            <tr>
              <td style="padding:20px 24px;border-right:1px solid #252830;">
                <p style="margin:0 0 4px;font-size:11px;color:#64748B;text-transform:uppercase;letter-spacing:0.05em;">Health Score</p>
                <p style="margin:0;font-size:28px;font-weight:700;color:#E24B4A;font-family:monospace;">${p.score}</p>
              </td>
              <td style="padding:20px 24px;">
                <p style="margin:0 0 4px;font-size:11px;color:#64748B;text-transform:uppercase;letter-spacing:0.05em;">Last Commit</p>
                <p style="margin:0;font-size:15px;font-weight:600;color:#CBD5E1;">${lastCommit}</p>
              </td>
            </tr>
          </table>
          <p style="margin:0 0 24px;font-size:14px;color:#94A3B8;line-height:1.6;">This package shows signs of abandonment: no recent commits, declining downloads, and low bus factor. Consider migrating to an actively maintained alternative.</p>
          <a href="${p.shareUrl}" style="display:inline-block;background:#378ADD;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600;">View Migration Options →</a>
        </td></tr>
        <tr><td style="padding:16px 40px;border-top:1px solid #1A1D24;">
          <p style="margin:0;font-size:12px;color:#475569;"><a href="${p.shareUrl}/settings/notifications" style="color:#378ADD;">Manage alert preferences</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export function abandonmentText(p: AbandonmentRiskPayload): string {
  return `Abandonment Risk Alert — ${p.projectName}

Package: ${p.packageName}
Health Score: ${p.score}/100
Last Commit: ${p.lastCommitDate ?? 'Unknown'}

This package shows signs of abandonment. Consider migrating to an actively maintained alternative.

View report: ${p.shareUrl}`;
}
