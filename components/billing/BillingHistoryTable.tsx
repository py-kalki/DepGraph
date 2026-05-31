import type { DbInvoice } from '@/lib/types';

interface BillingHistoryTableProps {
  invoices: DbInvoice[];
}

function formatAmount(paise: number, currency: string): string {
  const amount = paise / 100;
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount);
}

export default function BillingHistoryTable({ invoices }: BillingHistoryTableProps) {
  if (invoices.length === 0) {
    return (
      <div className="empty-state" role="status">
        <p className="empty-state-text">No invoices yet.</p>
      </div>
    );
  }

  return (
    <div className="billing-history-table-wrapper" role="region" aria-label="Billing history">
      <table className="billing-history-table">
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Amount</th>
            <th scope="col">Status</th>
            <th scope="col">Invoice</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id}>
              <td>
                {inv.paid_at
                  ? new Date(inv.paid_at).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })
                  : '—'}
              </td>
              <td className="billing-amount">
                {formatAmount(inv.amount_paise, inv.currency)}
              </td>
              <td>
                <span
                  className={`billing-status billing-status--${inv.status}`}
                  aria-label={`Payment status: ${inv.status}`}
                >
                  {inv.status}
                </span>
              </td>
              <td>
                {inv.pdf_url ? (
                  <a
                    href={inv.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="billing-pdf-link"
                    aria-label="Download invoice PDF"
                  >
                    Download PDF
                  </a>
                ) : (
                  <span className="text-muted">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
