// =============================================================================
// DepGraph — GET /api/billing/invoice/[paymentId]
// Generates a styled HTML invoice matching the DepGraph brutalist black theme.
// Auto-triggers browser print dialog for "Save as PDF".
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

  // Fetch payment details from Razorpay
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
  const invoiceYear = date.getFullYear();

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${invoiceNum} — DepGraph Invoice</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --black: #000000;
      --white: #FFFFFF;
      --gray-900: #111111;
      --gray-800: #1a1a1a;
      --gray-700: #222222;
      --gray-500: #555555;
      --gray-400: #888888;
      --gray-300: #aaaaaa;
      --green: #1D9E75;
      --border: rgba(255,255,255,0.1);
    }

    body {
      font-family: 'JetBrains Mono', 'Courier New', monospace;
      background: var(--black);
      color: var(--white);
      min-height: 100vh;
      padding: 0;
      margin: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .invoice-page {
      max-width: 720px;
      margin: 0 auto;
      padding: 3.5rem 3rem;
      position: relative;
    }

    /* Grid background */
    .invoice-page::before {
      content: '';
      position: fixed;
      inset: 0;
      background-image:
        linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px);
      background-size: 60px 60px;
      pointer-events: none;
      z-index: 0;
    }

    .invoice-page > * { position: relative; z-index: 1; }

    /* ── Header ─────────────────────────────────────── */
    .header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding-bottom: 2.5rem;
      border-bottom: 1px solid var(--border);
      margin-bottom: 2.5rem;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.625rem;
    }

    .logo-mark {
      width: 32px;
      height: 32px;
    }

    .logo-text {
      font-size: 1.375rem;
      font-weight: 800;
      letter-spacing: -0.04em;
      color: var(--white);
    }

    .logo-text span { font-weight: 400; color: var(--gray-400); }

    .invoice-meta { text-align: right; }

    .invoice-number {
      font-size: 1.25rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      color: var(--white);
      margin-bottom: 0.25rem;
    }

    .invoice-date {
      font-size: 0.75rem;
      color: var(--gray-400);
    }

    /* ── Status strip ───────────────────────────────── */
    .status-strip {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      padding: 0.75rem 1rem;
      border: 1px solid var(--green);
      margin-bottom: 2.5rem;
      background: rgba(29,158,117,0.06);
    }

    .status-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      background: var(--green);
      flex-shrink: 0;
    }

    .status-text {
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--green);
    }

    .status-id {
      margin-left: auto;
      font-size: 0.7rem;
      color: var(--gray-500);
    }

    /* ── Parties ────────────────────────────────────── */
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
      color: var(--gray-500);
      margin-bottom: 0.75rem;
    }

    .party-name {
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--white);
      margin-bottom: 0.25rem;
    }

    .party-detail {
      font-size: 0.75rem;
      color: var(--gray-400);
      line-height: 1.8;
    }

    /* ── Line items ─────────────────────────────────── */
    .line-items {
      border: 1px solid var(--border);
      margin-bottom: 2.5rem;
    }

    .line-items-header {
      display: grid;
      grid-template-columns: 1fr auto auto;
      gap: 1.5rem;
      padding: 0.75rem 1.25rem;
      border-bottom: 1px solid var(--border);
      background: rgba(255,255,255,0.03);
    }

    .col-label {
      font-size: 0.6rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--gray-500);
    }

    .col-label:not(:first-child) { text-align: right; }

    .line-item {
      display: grid;
      grid-template-columns: 1fr auto auto;
      gap: 1.5rem;
      padding: 1.25rem;
      border-bottom: 1px solid var(--border);
    }

    .line-item:last-child { border-bottom: none; }

    .item-name {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--white);
      margin-bottom: 0.2rem;
    }

    .item-desc {
      font-size: 0.7rem;
      color: var(--gray-400);
    }

    .item-qty, .item-price {
      font-size: 0.875rem;
      color: var(--white);
      text-align: right;
      font-weight: 500;
      align-self: center;
    }

    /* ── Totals ─────────────────────────────────────── */
    .totals {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.5rem;
      margin-bottom: 2.5rem;
    }

    .total-row {
      display: flex;
      gap: 3rem;
      font-size: 0.8125rem;
      color: var(--gray-400);
    }

    .total-row.total-final {
      font-size: 1rem;
      font-weight: 800;
      color: var(--white);
      padding-top: 0.75rem;
      border-top: 1px solid var(--border);
      margin-top: 0.25rem;
    }

    .total-label { min-width: 100px; text-align: right; }
    .total-value { min-width: 80px; text-align: right; font-weight: 600; }

    /* ── Payment info ───────────────────────────────── */
    .payment-info {
      border: 1px solid var(--border);
      padding: 1.25rem;
      margin-bottom: 2.5rem;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
    }

    .info-label {
      font-size: 0.6rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--gray-500);
      margin-bottom: 0.4rem;
    }

    .info-value {
      font-size: 0.8125rem;
      color: var(--white);
      font-weight: 500;
    }

    /* ── Footer ─────────────────────────────────────── */
    .footer {
      border-top: 1px solid var(--border);
      padding-top: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }

    .footer-note {
      font-size: 0.7rem;
      color: var(--gray-500);
      line-height: 1.8;
    }

    .footer-tagline {
      font-size: 0.65rem;
      color: var(--gray-700);
      text-align: right;
      letter-spacing: 0.05em;
    }

    /* ── Print ──────────────────────────────────────── */
    @media print {
      body { background: #000; }
      .invoice-page { padding: 2rem; }
      .invoice-page::before { position: absolute; }
      @page { margin: 1cm; size: A4; }
    }

    /* ── Screen centering ───────────────────────────── */
    @media screen {
      body {
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding: 2rem 0;
      }
      .invoice-page {
        border: 1px solid var(--border);
        min-height: calc(100vh - 4rem);
      }
    }
  </style>
</head>
<body>
  <div class="invoice-page">

    <!-- Header -->
    <div class="header">
      <div class="logo">
        <!-- SVG logo mark matching DepGraph's triangle icon -->
        <svg class="logo-mark" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="32" height="32" fill="#000"/>
          <path d="M16 6L28 26H4L16 6Z" fill="white"/>
          <path d="M16 6L28 26H4L16 6Z" stroke="rgba(255,255,255,0.2)" stroke-width="0.5"/>
        </svg>
        <span class="logo-text">dep<span>Graph</span></span>
      </div>
      <div class="invoice-meta">
        <div class="invoice-number">${invoiceNum}</div>
        <div class="invoice-date">${dateStr} · ${invoiceYear}</div>
      </div>
    </div>

    <!-- Paid status strip -->
    <div class="status-strip">
      <div class="status-dot"></div>
      <span class="status-text">Payment confirmed</span>
      <span class="status-id">${paymentId}</span>
    </div>

    <!-- Parties -->
    <div class="parties">
      <div>
        <div class="party-label">From</div>
        <div class="party-name">DepGraph</div>
        <div class="party-detail">
          depgraph.vedanshh.dev<br/>
          support@vedanshh.dev<br/>
          Payments via Razorpay
        </div>
      </div>
      <div>
        <div class="party-label">Billed To</div>
        <div class="party-name">${email || 'Customer'}</div>
        <div class="party-detail">
          ${email ? email + '<br/>' : ''}
          ${contact ? contact : ''}
        </div>
      </div>
    </div>

    <!-- Line items -->
    <div class="line-items">
      <div class="line-items-header">
        <span class="col-label">Description</span>
        <span class="col-label">Qty</span>
        <span class="col-label">Amount</span>
      </div>
      <div class="line-item">
        <div>
          <div class="item-name">DepGraph Pro Plan</div>
          <div class="item-desc">Monthly subscription · Unlimited projects, private repos, real-time alerts, SBOM export</div>
        </div>
        <div class="item-qty">1</div>
        <div class="item-price">${symbol}${amount}</div>
      </div>
    </div>

    <!-- Totals -->
    <div class="totals">
      <div class="total-row">
        <span class="total-label">Subtotal</span>
        <span class="total-value">${symbol}${amount}</span>
      </div>
      <div class="total-row">
        <span class="total-label">Tax</span>
        <span class="total-value">—</span>
      </div>
      <div class="total-row total-final">
        <span class="total-label">Total paid</span>
        <span class="total-value">${symbol}${amount}</span>
      </div>
    </div>

    <!-- Payment info -->
    <div class="payment-info">
      <div>
        <div class="info-label">Method</div>
        <div class="info-value">${methodLabel}</div>
      </div>
      <div>
        <div class="info-label">Currency</div>
        <div class="info-value">${currency}</div>
      </div>
      <div>
        <div class="info-label">Status</div>
        <div class="info-value" style="color: #1D9E75;">Paid ✓</div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-note">
        This is a computer-generated invoice.<br/>
        No signature required. Thank you for subscribing to DepGraph Pro.
      </div>
      <div class="footer-tagline">
        depgraph.vedanshh.dev<br/>
        Powered by Razorpay
      </div>
    </div>

  </div>

  ${!noprint ? `<script>
    window.addEventListener('load', function() {
      setTimeout(function() { window.print(); }, 400);
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
