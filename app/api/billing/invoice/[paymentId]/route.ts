// =============================================================================
// DepGraph — GET /api/billing/invoice/[paymentId]
// Generates a printable HTML invoice or PDF for a Razorpay payment.
// ?format=html  → returns HTML page (for browser print → Save as PDF)
// default       → returns text/html with print trigger (browser saves as PDF)
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

  // Fetch payment details from Razorpay
  let payment: Record<string, unknown>;
  try {
    const razorpay = getRazorpay();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payment = await (razorpay.payments as any).fetch(paymentId) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
  }

  const amount    = ((payment.amount as number) / 100).toFixed(2);
  const currency  = (payment.currency as string) ?? 'INR';
  const date      = new Date((payment.created_at as number) * 1000).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
  const method    = (payment.method as string) ?? 'Online';
  const email     = (payment.email as string) ?? session.user?.email ?? '';
  const name      = (payment.contact as string) ?? session.user?.name ?? 'Customer';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Invoice — DepGraph</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Courier New', monospace;
      background: #ffffff;
      color: #000000;
      padding: 3rem;
      max-width: 680px;
      margin: 0 auto;
    }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 2rem; margin-bottom: 2rem; }
    .brand { font-size: 1.5rem; font-weight: 900; letter-spacing: -0.04em; }
    .brand span { font-weight: 400; }
    .invoice-label { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #666; }
    .invoice-number { font-size: 1.25rem; font-weight: 700; margin-top: 0.25rem; }
    .section { margin-bottom: 2rem; }
    .section-title { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #888; margin-bottom: 0.5rem; }
    .meta { font-size: 0.875rem; line-height: 1.8; color: #333; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 2rem; }
    th { text-align: left; font-size: 0.65rem; letter-spacing: 0.1em; text-transform: uppercase; color: #888; padding: 0.75rem 0; border-bottom: 1px solid #000; }
    td { padding: 1rem 0; border-bottom: 1px solid #e5e5e5; font-size: 0.875rem; }
    td:last-child { text-align: right; font-weight: 700; }
    .total-row td { border-bottom: 2px solid #000; border-top: 1px solid #000; font-weight: 700; font-size: 1rem; }
    .footer { font-size: 0.75rem; color: #888; text-align: center; border-top: 1px solid #e5e5e5; padding-top: 1.5rem; line-height: 1.8; }
    .paid-badge {
      display: inline-block;
      padding: 0.2rem 0.75rem;
      border: 2px solid #000;
      font-size: 0.65rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
    }
    @media print {
      body { padding: 1rem; }
      @page { margin: 1.5cm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">Dep<span>Graph</span></div>
      <div style="font-size:0.8rem;color:#666;margin-top:0.25rem;">depgraph.vedanshh.dev</div>
    </div>
    <div style="text-align:right;">
      <div class="invoice-label">Tax Invoice</div>
      <div class="invoice-number">#${paymentId.slice(-8).toUpperCase()}</div>
      <div style="font-size:0.8rem;color:#666;margin-top:0.25rem;">${date}</div>
    </div>
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:2rem;margin-bottom:2rem;">
    <div class="section">
      <div class="section-title">Billed To</div>
      <div class="meta">
        ${name}<br/>
        ${email}
      </div>
    </div>
    <div class="section">
      <div class="section-title">Payment Details</div>
      <div class="meta">
        ID: ${paymentId}<br/>
        Method: ${method.charAt(0).toUpperCase() + method.slice(1)}<br/>
        Status: <span class="paid-badge">Paid</span>
      </div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>Period</th>
        <th style="text-align:right;">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>DepGraph Pro Plan</td>
        <td>Monthly subscription</td>
        <td>${currency} ${amount}</td>
      </tr>
      <tr class="total-row">
        <td colspan="2"><strong>Total</strong></td>
        <td>${currency} ${amount}</td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    DepGraph · depgraph.vedanshh.dev · support@vedanshh.dev<br/>
    Payments processed securely by Razorpay · Payment ID: ${paymentId}<br/>
    This is a computer-generated invoice and does not require a signature.
  </div>

  <script>
    // Auto-trigger print dialog so user can Save as PDF
    if (!window.location.search.includes('noprint')) {
      window.addEventListener('load', () => setTimeout(() => window.print(), 300));
    }
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `inline; filename="depgraph-invoice-${paymentId}.html"`,
    },
  });
}
