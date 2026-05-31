// =============================================================================
// DepGraph — Email Template: New CVE Alert
// =============================================================================

import type { NewCvePayload } from '@/lib/types';

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: '#E24B4A',
  HIGH:     '#EF9F27',
  MEDIUM:   '#EAB308',
  LOW:      '#378ADD',
};

export function newCveSubject(p: NewCvePayload): string {
  return `🔴 New ${p.severity} CVE in ${p.packageName} — ${p.projectName}`;
}

export function newCveHtml(p: NewCvePayload): string {
  const badgeColor = SEVERITY_COLORS[p.severity] ?? '#94A3B8';

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>New CVE Alert — DepGraph</title></head>
<body style="margin:0;padding:0;background:#0A0C10;font-family:Inter,system-ui,sans-serif;color:#E2E8F0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0C10;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#111318;border-radius:12px;border:1px solid #1A1D24;overflow:hidden;">
        <tr><td style="background:${badgeColor};padding:4px 24px;">
          <p style="margin:0;font-size:11px;font-weight:600;color:#fff;letter-spacing:0.05em;font-family:monospace;">NEW CVE DETECTED — ${p.severity}</p>
        </td></tr>
        <tr><td style="padding:32px 40px;">
          <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#F1F5F9;">New vulnerability in <code style="background:#1A1D24;padding:2px 8px;border-radius:4px;font-size:18px;">${p.packageName}</code></h1>
          <p style="margin:0 0 24px;font-size:15px;color:#94A3B8;">Affecting project: <strong style="color:#E2E8F0;">${p.projectName}</strong></p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#1A1D24;border-radius:8px;padding:20px 24px;margin-bottom:24px;">
            <tr><td>
              <p style="margin:0 0 8px;font-size:12px;color:#64748B;text-transform:uppercase;letter-spacing:0.05em;">CVE ID</p>
              <p style="margin:0 0 16px;font-size:16px;font-weight:700;color:#F1F5F9;font-family:monospace;">${p.cveId}</p>
              <p style="margin:0 0 8px;font-size:12px;color:#64748B;text-transform:uppercase;letter-spacing:0.05em;">Description</p>
              <p style="margin:0;font-size:14px;color:#CBD5E1;line-height:1.6;">${p.description}</p>
            </td></tr>
          </table>
          <a href="${p.shareUrl}" style="display:inline-block;background:#378ADD;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600;">View Affected Dependencies →</a>
        </td></tr>
        <tr><td style="padding:16px 40px;border-top:1px solid #1A1D24;">
          <p style="margin:0;font-size:12px;color:#475569;">CVE alerts are a Pro plan feature. <a href="${p.shareUrl}/settings/notifications" style="color:#378ADD;">Manage preferences</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export function newCveText(p: NewCvePayload): string {
  return `New ${p.severity} CVE Alert — ${p.projectName}

CVE ID: ${p.cveId}
Package: ${p.packageName}
Severity: ${p.severity}
Description: ${p.description}

View report: ${p.shareUrl}`;
}
