// =============================================================================
// DepGraph — GET /api/billing/invoice/[paymentId]
// Premium white invoice — print-safe, correct logo, auto-triggers Save as PDF.
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getRazorpay } from '@/lib/services/razorpay/client';

interface Props {
  params: Promise<{ paymentId: string }>;
}

export async function GET(req: NextRequest, { params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { paymentId } = await params;
  const noprint = req.nextUrl.searchParams.get('noprint') === '1';

  let payment: Record<string, unknown>;
  try {
    const razorpay = getRazorpay();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payment = await (razorpay.payments as any).fetch(paymentId) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
  }

  const amountPaise = (payment.amount as number) ?? 0;
  const amount      = (amountPaise / 100).toFixed(2);
  const currency    = (payment.currency as string) ?? 'INR';
  const symbol      = currency === 'INR' ? '₹' : currency;
  const createdTs   = (payment.created_at as number) ?? Date.now() / 1000;
  const date        = new Date(createdTs * 1000);
  const dateStr     = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const method      = ((payment.method as string) ?? 'Online');
  const methodLabel = method.charAt(0).toUpperCase() + method.slice(1);
  const email       = (payment.email as string) ?? session.user?.email ?? '';
  const contact     = (payment.contact as string) ?? '';
  const invoiceNum  = `INV-${paymentId.slice(-8).toUpperCase()}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${invoiceNum} — DepGraph Invoice</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'JetBrains Mono', 'Courier New', monospace;
      background: #f5f5f5;
      color: #000000;
      padding: 2rem;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .page {
      background: #ffffff;
      max-width: 740px;
      margin: 0 auto;
      padding: 3.5rem 3.5rem 3rem;
      border: 1px solid #e0e0e0;
    }

    /* ── HEADER ─────────────────────────── */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 3rem;
    }

    /* Logo: exact match to depGraph wordmark */
    .logo {
      display: inline-flex;
      align-items: baseline;
      background: #000000;
      padding: 0.45rem 0.75rem;
      line-height: 1;
    }
    .logo-dep {
      font-size: 1.25rem;
      font-weight: 400;
      color: #ffffff;
      letter-spacing: -0.03em;
    }
    .logo-graph {
      font-size: 1.25rem;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.03em;
    }

    .header-right {
      text-align: right;
    }
    .invoice-title {
      font-size: 0.6rem;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: #999999;
      margin-bottom: 0.4rem;
    }
    .invoice-num {
      font-size: 1.5rem;
      font-weight: 800;
      letter-spacing: -0.04em;
      color: #000000;
    }
    .invoice-date {
      font-size: 0.75rem;
      color: #888888;
      margin-top: 0.25rem;
    }

    /* ── DIVIDER ─────────────────────────── */
    hr { border: none; border-top: 2px solid #000000; margin: 0 0 2.5rem; }
    hr.thin { border-top-width: 1px; border-color: #e0e0e0; margin: 0 0 2rem; }

    /* ── PAID BADGE ──────────────────────── */
    .paid-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 2.5rem;
    }
    .paid-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4rem 0.875rem;
      background: #000000;
      color: #ffffff;
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
    }
    .paid-badge::before {
      content: '';
      display: inline-block;
      width: 7px; height: 7px;
      border-radius: 50%;
      background: #1D9E75;
    }
    .paid-payment-id {
      font-size: 0.7rem;
      color: #aaaaaa;
    }

    /* ── PARTIES ─────────────────────────── */
    .parties {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      margin-bottom: 2.5rem;
    }
    .party-label {
      font-size: 0.6rem;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: #aaaaaa;
      margin-bottom: 0.6rem;
    }
    .party-name {
      font-size: 0.9375rem;
      font-weight: 700;
      color: #000000;
      margin-bottom: 0.35rem;
    }
    .party-detail {
      font-size: 0.75rem;
      color: #666666;
      line-height: 1.9;
    }

    /* ── LINE ITEMS TABLE ────────────────── */
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 0;
    }
    .items-table thead tr {
      background: #000000;
    }
    .items-table thead th {
      padding: 0.75rem 1rem;
      text-align: left;
      font-size: 0.6rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #ffffff;
    }
    .items-table thead th:last-child { text-align: right; }
    .items-table tbody tr {
      border-bottom: 1px solid #eeeeee;
    }
    .items-table tbody td {
      padding: 1.25rem 1rem;
      font-size: 0.8125rem;
      color: #000000;
      vertical-align: top;
    }
    .items-table tbody td:last-child { text-align: right; font-weight: 700; }
    .item-name { font-weight: 700; margin-bottom: 0.2rem; }
    .item-desc { font-size: 0.7rem; color: #888888; line-height: 1.6; }

    /* ── TOTALS ──────────────────────────── */
    .totals {
      border-top: 2px solid #000;
      padding-top: 1.25rem;
      margin-bottom: 2.5rem;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.5rem;
    }
    .total-line {
      display: flex;
      gap: 4rem;
      font-size: 0.8125rem;
      color: #666;
    }
    .total-line.grand {
      font-size: 1rem;
      font-weight: 800;
      color: #000;
      padding-top: 0.5rem;
      border-top: 1px solid #e0e0e0;
      margin-top: 0.25rem;
    }
    .total-line .lbl { min-width: 80px; text-align: right; }
    .total-line .val { min-width: 80px; text-align: right; }

    /* ── PAYMENT INFO ────────────────────── */
    .info-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      border: 1px solid #e0e0e0;
      margin-bottom: 2.5rem;
    }
    .info-cell {
      padding: 1rem 1.25rem;
      border-right: 1px solid #e0e0e0;
    }
    .info-cell:last-child { border-right: none; }
    .info-label {
      font-size: 0.6rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #aaaaaa;
      margin-bottom: 0.4rem;
    }
    .info-value {
      font-size: 0.8125rem;
      font-weight: 600;
      color: #000;
    }
    .info-value.paid { color: #1D9E75; }

    /* ── FOOTER ──────────────────────────── */
    .footer {
      border-top: 1px solid #eeeeee;
      padding-top: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .footer-note {
      font-size: 0.7rem;
      color: #aaaaaa;
      line-height: 1.8;
    }
    .footer-brand {
      text-align: right;
      font-size: 0.65rem;
      color: #cccccc;
      line-height: 1.8;
    }

    @media print {
      body { background: #fff; padding: 0; }
      .page { border: none; padding: 2rem 2.5rem; max-width: 100%; }
      @page { margin: 1.5cm; size: A4; }
    }
  </style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="header">
    <div class="logo">
      <span class="logo-dep">dep</span><span class="logo-graph">Graph</span>
    </div>
    <div class="header-right">
      <div class="invoice-title">Invoice</div>
      <div class="invoice-num">${invoiceNum}</div>
      <div class="invoice-date">${dateStr}</div>
    </div>
  </div>

  <hr/>

  <!-- Paid badge -->
  <div class="paid-row">
    <span class="paid-badge">Payment confirmed</span>
    <span class="paid-payment-id">${paymentId}</span>
  </div>

  <!-- Parties -->
  <div class="parties">
    <div>
      <div class="party-label">From</div>
      <div class="party-name">DepGraph</div>
      <div class="party-detail">
        depgraph.vedanshh.dev<br/>
        support@vedanshh.dev<br/>
        Razorpay Payments
      </div>
    </div>
    <div>
      <div class="party-label">Billed To</div>
      <div class="party-name">${email || session.user?.name || 'Customer'}</div>
      <div class="party-detail">
        ${email ? email + '<br/>' : ''}${contact || ''}
      </div>
    </div>
  </div>

  <!-- Items -->
  <table class="items-table">
    <thead>
      <tr>
        <th>Description</th>
        <th style="text-align:center">Qty</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <div class="item-name">DepGraph Pro — Monthly</div>
          <div class="item-desc">Unlimited projects · Private repos · Real-time alerts · SBOM export · Migration paths</div>
        </td>
        <td style="text-align:center;vertical-align:middle">1</td>
        <td>${symbol}${amount}</td>
      </tr>
    </tbody>
  </table>

  <!-- Totals -->
  <div class="totals">
    <div class="total-line">
      <span class="lbl">Subtotal</span>
      <span class="val">${symbol}${amount}</span>
    </div>
    <div class="total-line">
      <span class="lbl">Tax</span>
      <span class="val">—</span>
    </div>
    <div class="total-line grand">
      <span class="lbl">Total paid</span>
      <span class="val">${symbol}${amount}</span>
    </div>
  </div>

  <!-- Payment info -->
  <div class="info-grid">
    <div class="info-cell">
      <div class="info-label">Payment method</div>
      <div class="info-value">${methodLabel}</div>
    </div>
    <div class="info-cell">
      <div class="info-label">Currency</div>
      <div class="info-value">${currency}</div>
    </div>
    <div class="info-cell">
      <div class="info-label">Status</div>
      <div class="info-value paid">Paid ✓</div>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <div class="footer-note">
      This is a computer-generated invoice.<br/>
      No signature required. Thank you for subscribing to DepGraph Pro.
    </div>
    <div class="footer-brand">
      depgraph.vedanshh.dev<br/>
      Secured by Razorpay
    </div>
  </div>

</div>

${!noprint ? `<script>
  window.addEventListener('load', function() {
    setTimeout(function() { window.print(); }, 500);
  });
</script>` : ''}
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `inline; filename="${invoiceNum}.html"`,
    },
  });
}
