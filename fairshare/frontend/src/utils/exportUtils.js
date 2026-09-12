/**
 * exportUtils.js
 * Utility functions to export FairShare financial records as CSV or printable PDF statements.
 */

export const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

export const getCurrencySymbol = (currencyCode) => {
  return CURRENCY_SYMBOLS[currencyCode] || '₹';
};

/**
 * Export house expenses to a CSV file and trigger client-side download
 */
export const exportExpensesToCSV = (houseName, expenses = [], currencySymbol = '₹') => {
  const headers = ['Date', 'Description', 'Category', `Amount (${currencySymbol})`, 'Paid By', 'Split Type'];

  let rows = [];
  if (expenses && expenses.length > 0) {
    rows = expenses.map((e) => {
      const date = new Date(e.date || Date.now()).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      const desc = `"${(e.description || e.category || '').replace(/"/g, '""')}"`;
      const category = `"${(e.category || '').replace(/"/g, '""')}"`;
      const amount = Number(e.amount || 0).toFixed(2);
      const paidBy = `"${(e.paidById?.name || e.paidByName || 'Member').replace(/"/g, '""')}"`;
      const splitType = e.splitType ? (e.splitType.charAt(0).toUpperCase() + e.splitType.slice(1)) : 'Equal';

      return [date, desc, category, amount, paidBy, splitType].join(',');
    });
  } else {
    // If no expenses, provide a placeholder template row so download still succeeds
    rows = [
      ['No expenses logged yet', '-', '-', '0.00', '-', '-'].join(','),
    ];
  }

  // Prepend UTF-8 BOM (\uFEFF) for proper rendering in Excel, Windows, and macOS
  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const cleanName = (houseName || 'house').replace(/[^a-zA-Z0-9_-]/g, '_');
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `${cleanName}_expenses_${timestamp}.csv`;

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();

  // Delay revoking the Object URL to allow browser download thread to complete
  setTimeout(() => {
    if (document.body.contains(link)) {
      document.body.removeChild(link);
    }
    URL.revokeObjectURL(url);
  }, 1000);
};

/**
 * Open a styled printable statement dialog for PDF generation
 */
export const printExpenseStatement = (house, expenses = [], balances = [], currencySymbol = '₹') => {
  const printWindow = window.open('', '_blank', 'width=850,height=900');
  if (!printWindow) {
    throw new Error('Popup blocked! Please allow popups to print statements.');
  }

  const houseName = house?.name || 'FairShare House';
  const generatedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const totalSpent = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  const balanceRows = balances.map((b) => {
    const isOwed = b.netBalance >= 0;
    const color = isOwed ? '#16a34a' : '#dc2626';
    const status = isOwed ? `+${currencySymbol}${b.netBalance.toFixed(2)} (owed)` : `-${currencySymbol}${Math.abs(b.netBalance).toFixed(2)} (owes)`;
    return `
      <tr>
        <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;font-weight:600;">${b.name}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;">${currencySymbol}${b.totalPaid.toFixed(2)}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;">${currencySymbol}${b.totalOwed.toFixed(2)}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;font-weight:700;color:${color};">${status}</td>
      </tr>
    `;
  }).join('');

  const expenseRows = expenses.map((e) => {
    const d = new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;color:#4b5563;">${d}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;font-weight:600;color:#1f2937;">${e.description || e.category}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;color:#6b7280;">${e.category}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;color:#374151;">${e.paidById?.name || 'Member'}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;font-weight:700;text-align:right;color:#111827;">${currencySymbol}${e.amount.toFixed(2)}</td>
      </tr>
    `;
  }).join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>FairShare Financial Statement - ${houseName}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1f2937; margin: 30px; }
          .header { border-bottom: 2px solid #6366f1; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
          h1 { margin: 0 0 4px; font-size: 24px; color: #4338ca; }
          .meta { font-size: 12px; color: #6b7280; }
          .section-title { font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #4f46e5; margin: 24px 0 10px; }
          table { width: 100%; border-collapse: collapse; font-size: 14px; }
          th { background: #f9fafb; text-align: left; padding: 10px 14px; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb; }
          .summary-box { background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 8px; padding: 14px 20px; display: inline-block; margin-bottom: 16px; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>🏠 FairShare Statement</h1>
            <div style="font-size:16px;font-weight:700;color:#111827;">${houseName}</div>
            <div class="meta">Statement Date: ${generatedDate}</div>
          </div>
          <div class="summary-box">
            <div style="font-size:11px;color:#4f46e5;font-weight:700;text-transform:uppercase;">Total House Spend</div>
            <div style="font-size:24px;font-weight:800;color:#312e81;">${currencySymbol}${totalSpent.toFixed(2)}</div>
          </div>
        </div>

        <div class="section-title">Current Member Balances</div>
        <table>
          <thead>
            <tr>
              <th>Member</th>
              <th>Total Paid</th>
              <th>Fair Share Owed</th>
              <th>Net Balance</th>
            </tr>
          </thead>
          <tbody>
            ${balanceRows}
          </tbody>
        </table>

        <div class="section-title">Expense History (${expenses.length} records)</div>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Paid By</th>
              <th style="text-align:right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${expenseRows}
          </tbody>
        </table>

        <div style="margin-top:40px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:11px;color:#9ca3af;text-align:center;">
          Generated automatically by FairShare • Shared Roommate Expense Tracker
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
};
