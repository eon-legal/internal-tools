/**
 * Dashboard Calculations
 *
 * Responsibilities:
 * - Calculate invoice statistics (totals, counts, by status)
 * - Aggregate data for charts (monthly breakdown)
 * - Filter invoices by date range
 * - Derive collection rate and average invoice value per month
 *
 * Business Rules:
 * - Total invoiced = sum of all invoice total_amount
 * - Total paid = sum of total_amount where paid = true
 * - Total pending = sum of total_amount where paid = false
 * - Monthly grouping uses dual-date logic:
 *   - totalInvoiced / countTotal → grouped by invoice_date month
 *   - totalPaid / countPaid → grouped by paid_at month (falls back to invoice_date if paid_at is missing)
 *   - totalPending / countPending → grouped by invoice_date month
 * - Collection rate = (countPaid / countTotal) * 100 per month (0 if no invoices)
 * - Average invoice value = totalInvoiced / countTotal per month (0 if no invoices)
 *
 * Dependencies: None (pure TypeScript, framework-agnostic)
 * Side Effects: None (pure functions)
 */

/**
 * Invoice data structure (minimal interface for calculations)
 */
export interface InvoiceData {
  id: string;
  invoice_date: string; // ISO 8601 timestamp
  total_amount: number;
  iva_amount: number;
  paid: boolean;
  paid_at?: string; // ISO 8601 timestamp — when the invoice was marked as paid
}

/**
 * Summary statistics for invoices
 */
export interface InvoiceSummary {
  totalInvoiced: number;
  totalPaid: number;
  totalPending: number;
  totalIva: number;
  countTotal: number;
  countPaid: number;
  countPending: number;
  countWithIva: number; // Number of invoices that have iva_amount > 0
}

/**
 * Monthly data point for time-series charts
 */
export interface MonthlyData {
  month: string; // Format: "YYYY-MM"
  monthLabel: string; // Localized month name
  totalInvoiced: number;
  totalPaid: number;
  totalPending: number;
  countTotal: number;
  countPaid: number;
  countPending: number;
}

/**
 * Date range filter
 */
export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

/**
 * Filters invoices by date range
 *
 * @param invoices - Array of invoices to filter
 * @param dateRange - Date range filter (null dates are ignored)
 * @returns Filtered invoices
 */
export function filterInvoicesByDateRange(
  invoices: InvoiceData[],
  dateRange: DateRange
): InvoiceData[] {
  return invoices.filter((invoice) => {
    const invoiceDate = new Date(invoice.invoice_date);

    if (dateRange.startDate && invoiceDate < dateRange.startDate) {
      return false;
    }

    if (dateRange.endDate) {
      const endOfDay = new Date(dateRange.endDate);
      endOfDay.setHours(23, 59, 59, 999);
      if (invoiceDate > endOfDay) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Calculates invoice summary statistics
 *
 * @param invoices - Array of invoices to summarize
 * @returns Summary statistics
 */
export function calculateInvoiceSummary(invoices: InvoiceData[]): InvoiceSummary {
  const summary: InvoiceSummary = {
    totalInvoiced: 0,
    totalPaid: 0,
    totalPending: 0,
    totalIva: 0,
    countTotal: invoices.length,
    countPaid: 0,
    countPending: 0,
    countWithIva: 0,
  };

  for (const invoice of invoices) {
    summary.totalInvoiced += invoice.total_amount;
    summary.totalIva += invoice.iva_amount;

    if (invoice.iva_amount > 0) {
      summary.countWithIva++;
    }

    if (invoice.paid) {
      summary.totalPaid += invoice.total_amount;
      summary.countPaid++;
    } else {
      summary.totalPending += invoice.total_amount;
      summary.countPending++;
    }
  }

  return summary;
}

/**
 * Gets month key from date (YYYY-MM format)
 */
function getMonthKey(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Gets localized month label
 */
function getMonthLabel(monthKey: string, locale: string = 'es-ES'): string {
  const [year, month] = monthKey.split('-');
  const date = new Date(parseInt(year!), parseInt(month!) - 1, 1);
  return date.toLocaleDateString(locale, { month: 'short', year: 'numeric' });
}

/**
 * Generates all months between two dates
 */
function generateMonthRange(startDate: Date, endDate: Date): string[] {
  const months: string[] = [];
  const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

  while (current <= end) {
    months.push(getMonthKey(current));
    current.setMonth(current.getMonth() + 1);
  }

  return months;
}

/**
 * Calculates monthly breakdown of invoice data
 *
 * Uses dual-date grouping:
 * - totalInvoiced / countTotal → by invoice_date month
 * - totalPaid / countPaid → by paid_at month (fallback: invoice_date)
 * - totalPending / countPending → by invoice_date month
 *
 * @param invoices - Array of invoices
 * @param locale - Locale for month labels (default: 'es-ES')
 * @returns Array of monthly data sorted by date
 */
export function calculateMonthlyData(
  invoices: InvoiceData[],
  locale: string = 'es-ES'
): MonthlyData[] {
  if (invoices.length === 0) {
    return [];
  }

  // Collect all relevant dates to determine the full month range.
  // Include both invoice_date and paid_at so that payments falling
  // outside the invoice-date range still get their own month bucket.
  const allDates: Date[] = [];
  for (const inv of invoices) {
    allDates.push(new Date(inv.invoice_date));
    if (inv.paid && inv.paid_at) {
      allDates.push(new Date(inv.paid_at));
    }
  }

  const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
  const maxDate = new Date(Math.max(...allDates.map((d) => d.getTime())));

  // Generate all months in range
  const monthKeys = generateMonthRange(minDate, maxDate);

  // Initialize monthly data map
  const monthlyMap = new Map<string, MonthlyData>();
  for (const monthKey of monthKeys) {
    monthlyMap.set(monthKey, {
      month: monthKey,
      monthLabel: getMonthLabel(monthKey, locale),
      totalInvoiced: 0,
      totalPaid: 0,
      totalPending: 0,
      countTotal: 0,
      countPaid: 0,
      countPending: 0,
    });
  }

  // Helper: get or create a month bucket (safety net for edge cases)
  const getOrCreate = (key: string): MonthlyData => {
    let entry = monthlyMap.get(key);
    if (!entry) {
      entry = {
        month: key,
        monthLabel: getMonthLabel(key, locale),
        totalInvoiced: 0,
        totalPaid: 0,
        totalPending: 0,
        countTotal: 0,
        countPaid: 0,
        countPending: 0,
      };
      monthlyMap.set(key, entry);
    }
    return entry;
  };

  // Aggregate invoice data using dual-date logic
  for (const invoice of invoices) {
    const invoiceDateMonth = getMonthKey(new Date(invoice.invoice_date));

    // totalInvoiced and countTotal always go to the invoice_date month
    const invoiceBucket = getOrCreate(invoiceDateMonth);
    invoiceBucket.totalInvoiced += invoice.total_amount;
    invoiceBucket.countTotal++;

    if (invoice.paid) {
      // Paid amount/count → paid_at month (fallback to invoice_date)
      const paidMonth = invoice.paid_at
        ? getMonthKey(new Date(invoice.paid_at))
        : invoiceDateMonth;
      const paidBucket = getOrCreate(paidMonth);
      paidBucket.totalPaid += invoice.total_amount;
      paidBucket.countPaid++;
    } else {
      // Pending amount/count → invoice_date month
      invoiceBucket.totalPending += invoice.total_amount;
      invoiceBucket.countPending++;
    }
  }

  // Convert to array and sort by month
  return Array.from(monthlyMap.values()).sort((a, b) =>
    a.month.localeCompare(b.month)
  );
}

/**
 * Gets the default date range: current natural year (Jan 1 → today).
 *
 * @returns Date range from January 1st of the current year to today
 */
export function getDefaultDateRange(): DateRange {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), 0, 1);
  const endDate = now;

  return {
    startDate,
    endDate,
  };
}

/**
 * Formats currency amount for display
 *
 * @param amount - Amount to format
 * @param locale - Locale for formatting (default: 'es-ES')
 * @param currency - Currency code (default: 'EUR')
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  locale: string = 'es-ES',
  currency: string = 'EUR'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Monthly collection rate data point
 */
export interface MonthlyCollectionRate {
  month: string; // Format: "YYYY-MM"
  monthLabel: string; // Localized month name
  collectionRate: number; // 0-100 percentage
}

/**
 * Monthly average invoice value data point
 */
export interface MonthlyAverageValue {
  month: string; // Format: "YYYY-MM"
  monthLabel: string; // Localized month name
  averageValue: number; // totalInvoiced / countTotal
}

/**
 * Calculates monthly collection rate (percentage of invoices paid)
 *
 * @param monthlyData - Array of monthly data from calculateMonthlyData
 * @returns Array of monthly collection rates (0-100%)
 */
export function calculateMonthlyCollectionRate(
  monthlyData: MonthlyData[]
): MonthlyCollectionRate[] {
  return monthlyData.map((m) => ({
    month: m.month,
    monthLabel: m.monthLabel,
    collectionRate: m.countTotal > 0
      ? Math.round((m.countPaid / m.countTotal) * 10000) / 100
      : 0,
  }));
}

/**
 * Calculates monthly average invoice value (totalInvoiced / countTotal)
 *
 * @param monthlyData - Array of monthly data from calculateMonthlyData
 * @returns Array of monthly average values
 */
export function calculateMonthlyAverageValue(
  monthlyData: MonthlyData[]
): MonthlyAverageValue[] {
  return monthlyData.map((m) => ({
    month: m.month,
    monthLabel: m.monthLabel,
    averageValue: m.countTotal > 0
      ? Math.round((m.totalInvoiced / m.countTotal) * 100) / 100
      : 0,
  }));
}

