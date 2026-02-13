import {
  MonthlyData,
  InvoiceData,
  calculateInvoiceSummary,
  calculateMonthlyData,
  calculateMonthlyCollectionRate,
  calculateMonthlyAverageValue,
  MonthlyCollectionRate,
  MonthlyAverageValue,
} from './dashboard-calculations';

/**
 * Helper to create a MonthlyData fixture
 */
function makeMonthlyData(overrides: Partial<MonthlyData> & { month: string }): MonthlyData {
  return {
    monthLabel: overrides.month,
    totalInvoiced: 0,
    totalPaid: 0,
    totalPending: 0,
    countTotal: 0,
    countPaid: 0,
    countPending: 0,
    ...overrides,
  };
}

/**
 * Helper to create an InvoiceData fixture
 */
function makeInvoice(overrides: Partial<InvoiceData> & { id: string }): InvoiceData {
  return {
    invoice_date: '2025-01-15T00:00:00Z',
    total_amount: 100,
    iva_amount: 21,
    paid: false,
    ...overrides,
  };
}

describe('calculateMonthlyData – paid_at dual-date grouping', () => {
  it('should return empty array for empty input', () => {
    expect(calculateMonthlyData([])).toEqual([]);
  });

  it('should group paid invoice totalPaid/countPaid by paid_at month', () => {
    const invoices: InvoiceData[] = [
      makeInvoice({
        id: '1',
        invoice_date: '2025-01-10T00:00:00Z',
        total_amount: 500,
        paid: true,
        paid_at: '2025-03-05T12:00:00Z', // paid two months later
      }),
    ];
    const result = calculateMonthlyData(invoices, 'en-US');

    // Jan should have totalInvoiced=500, countTotal=1, but NO paid amount
    const jan = result.find((m) => m.month === '2025-01')!;
    expect(jan.totalInvoiced).toBe(500);
    expect(jan.countTotal).toBe(1);
    expect(jan.totalPaid).toBe(0);
    expect(jan.countPaid).toBe(0);

    // Mar should have totalPaid=500, countPaid=1, but NO invoiced amount
    const mar = result.find((m) => m.month === '2025-03')!;
    expect(mar.totalPaid).toBe(500);
    expect(mar.countPaid).toBe(1);
    expect(mar.totalInvoiced).toBe(0);
    expect(mar.countTotal).toBe(0);
  });

  it('should group unpaid invoice totalPending/countPending by invoice_date month', () => {
    const invoices: InvoiceData[] = [
      makeInvoice({
        id: '1',
        invoice_date: '2025-02-20T00:00:00Z',
        total_amount: 300,
        paid: false,
      }),
    ];
    const result = calculateMonthlyData(invoices, 'en-US');

    const feb = result.find((m) => m.month === '2025-02')!;
    expect(feb.totalPending).toBe(300);
    expect(feb.countPending).toBe(1);
    expect(feb.totalPaid).toBe(0);
    expect(feb.countPaid).toBe(0);
    expect(feb.totalInvoiced).toBe(300);
    expect(feb.countTotal).toBe(1);
  });

  it('should fall back to invoice_date when paid_at is missing', () => {
    const invoices: InvoiceData[] = [
      makeInvoice({
        id: '1',
        invoice_date: '2025-04-10T00:00:00Z',
        total_amount: 200,
        paid: true,
        // paid_at intentionally omitted
      }),
    ];
    const result = calculateMonthlyData(invoices, 'en-US');

    const apr = result.find((m) => m.month === '2025-04')!;
    expect(apr.totalInvoiced).toBe(200);
    expect(apr.countTotal).toBe(1);
    expect(apr.totalPaid).toBe(200);
    expect(apr.countPaid).toBe(1);
  });

  it('should expand month range to include paid_at months', () => {
    const invoices: InvoiceData[] = [
      makeInvoice({
        id: '1',
        invoice_date: '2025-01-15T00:00:00Z',
        total_amount: 100,
        paid: true,
        paid_at: '2025-06-01T00:00:00Z',
      }),
    ];
    const result = calculateMonthlyData(invoices, 'en-US');

    // Should have months from Jan to Jun (6 months)
    const months = result.map((m) => m.month);
    expect(months).toEqual([
      '2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06',
    ]);
  });

  it('should handle mixed paid and unpaid invoices across months', () => {
    const invoices: InvoiceData[] = [
      // Invoiced in Jan, paid in Feb
      makeInvoice({
        id: '1',
        invoice_date: '2025-01-05T00:00:00Z',
        total_amount: 1000,
        paid: true,
        paid_at: '2025-02-10T00:00:00Z',
      }),
      // Invoiced in Jan, still unpaid
      makeInvoice({
        id: '2',
        invoice_date: '2025-01-20T00:00:00Z',
        total_amount: 500,
        paid: false,
      }),
      // Invoiced in Feb, paid in Feb
      makeInvoice({
        id: '3',
        invoice_date: '2025-02-15T00:00:00Z',
        total_amount: 800,
        paid: true,
        paid_at: '2025-02-20T00:00:00Z',
      }),
    ];
    const result = calculateMonthlyData(invoices, 'en-US');

    const jan = result.find((m) => m.month === '2025-01')!;
    expect(jan.totalInvoiced).toBe(1500); // 1000 + 500
    expect(jan.countTotal).toBe(2);
    expect(jan.totalPaid).toBe(0);        // both payments land in Feb
    expect(jan.countPaid).toBe(0);
    expect(jan.totalPending).toBe(500);
    expect(jan.countPending).toBe(1);

    const feb = result.find((m) => m.month === '2025-02')!;
    expect(feb.totalInvoiced).toBe(800);  // only inv #3 invoiced in Feb
    expect(feb.countTotal).toBe(1);
    expect(feb.totalPaid).toBe(1800);     // 1000 (inv#1) + 800 (inv#3)
    expect(feb.countPaid).toBe(2);
    expect(feb.totalPending).toBe(0);
    expect(feb.countPending).toBe(0);
  });

  it('should handle paid invoice where paid_at is in the same month as invoice_date', () => {
    const invoices: InvoiceData[] = [
      makeInvoice({
        id: '1',
        invoice_date: '2025-05-01T00:00:00Z',
        total_amount: 750,
        paid: true,
        paid_at: '2025-05-15T00:00:00Z',
      }),
    ];
    const result = calculateMonthlyData(invoices, 'en-US');

    expect(result.length).toBe(1);
    const may = result[0]!;
    expect(may.month).toBe('2025-05');
    expect(may.totalInvoiced).toBe(750);
    expect(may.countTotal).toBe(1);
    expect(may.totalPaid).toBe(750);
    expect(may.countPaid).toBe(1);
  });
});

describe('Dashboard Calculations – New Chart Functions', () => {
  // ── calculateMonthlyCollectionRate ──────────────────────────────────

  describe('calculateMonthlyCollectionRate', () => {
    it('should return empty array for empty input', () => {
      expect(calculateMonthlyCollectionRate([])).toEqual([]);
    });

    it('should return 0% when no invoices exist in a month', () => {
      const input: MonthlyData[] = [
        makeMonthlyData({ month: '2025-01', countTotal: 0, countPaid: 0 }),
      ];
      const result = calculateMonthlyCollectionRate(input);
      expect(result.length).toBe(1);
      expect(result[0]!.collectionRate).toBe(0);
    });

    it('should return 100% when all invoices are paid', () => {
      const input: MonthlyData[] = [
        makeMonthlyData({ month: '2025-03', countTotal: 5, countPaid: 5 }),
      ];
      const result = calculateMonthlyCollectionRate(input);
      expect(result[0]!.collectionRate).toBe(100);
    });

    it('should return 0% when no invoices are paid', () => {
      const input: MonthlyData[] = [
        makeMonthlyData({ month: '2025-04', countTotal: 3, countPaid: 0 }),
      ];
      const result = calculateMonthlyCollectionRate(input);
      expect(result[0]!.collectionRate).toBe(0);
    });

    it('should calculate correct percentage for partial payment', () => {
      const input: MonthlyData[] = [
        makeMonthlyData({ month: '2025-05', countTotal: 4, countPaid: 1 }),
      ];
      const result = calculateMonthlyCollectionRate(input);
      expect(result[0]!.collectionRate).toBe(25);
    });

    it('should handle fractional percentages with two-decimal precision', () => {
      const input: MonthlyData[] = [
        makeMonthlyData({ month: '2025-06', countTotal: 3, countPaid: 1 }),
      ];
      const result = calculateMonthlyCollectionRate(input);
      expect(result[0]!.collectionRate).toBe(33.33);
    });

    it('should preserve month and monthLabel from input', () => {
      const input: MonthlyData[] = [
        makeMonthlyData({ month: '2025-07', monthLabel: 'Jul 2025', countTotal: 2, countPaid: 1 }),
      ];
      const result = calculateMonthlyCollectionRate(input);
      expect(result[0]!.month).toBe('2025-07');
      expect(result[0]!.monthLabel).toBe('Jul 2025');
    });

    it('should handle multiple months correctly', () => {
      const input: MonthlyData[] = [
        makeMonthlyData({ month: '2025-01', countTotal: 10, countPaid: 10 }),
        makeMonthlyData({ month: '2025-02', countTotal: 10, countPaid: 5 }),
        makeMonthlyData({ month: '2025-03', countTotal: 10, countPaid: 0 }),
      ];
      const result = calculateMonthlyCollectionRate(input);
      expect(result.map((r) => r.collectionRate)).toEqual([100, 50, 0]);
    });
  });

  // ── calculateMonthlyAverageValue ───────────────────────────────────

  describe('calculateMonthlyAverageValue', () => {
    it('should return empty array for empty input', () => {
      expect(calculateMonthlyAverageValue([])).toEqual([]);
    });

    it('should return 0 when no invoices exist in a month', () => {
      const input: MonthlyData[] = [
        makeMonthlyData({ month: '2025-01', countTotal: 0, totalInvoiced: 0 }),
      ];
      const result = calculateMonthlyAverageValue(input);
      expect(result[0]!.averageValue).toBe(0);
    });

    it('should calculate correct average for a single invoice', () => {
      const input: MonthlyData[] = [
        makeMonthlyData({ month: '2025-02', countTotal: 1, totalInvoiced: 500 }),
      ];
      const result = calculateMonthlyAverageValue(input);
      expect(result[0]!.averageValue).toBe(500);
    });

    it('should calculate correct average for multiple invoices', () => {
      const input: MonthlyData[] = [
        makeMonthlyData({ month: '2025-03', countTotal: 4, totalInvoiced: 1000 }),
      ];
      const result = calculateMonthlyAverageValue(input);
      expect(result[0]!.averageValue).toBe(250);
    });

    it('should round to two decimal places', () => {
      const input: MonthlyData[] = [
        makeMonthlyData({ month: '2025-04', countTotal: 3, totalInvoiced: 1000 }),
      ];
      const result = calculateMonthlyAverageValue(input);
      expect(result[0]!.averageValue).toBe(333.33);
    });

    it('should preserve month and monthLabel from input', () => {
      const input: MonthlyData[] = [
        makeMonthlyData({ month: '2025-05', monthLabel: 'May 2025', countTotal: 2, totalInvoiced: 600 }),
      ];
      const result = calculateMonthlyAverageValue(input);
      expect(result[0]!.month).toBe('2025-05');
      expect(result[0]!.monthLabel).toBe('May 2025');
    });

    it('should handle multiple months correctly', () => {
      const input: MonthlyData[] = [
        makeMonthlyData({ month: '2025-01', countTotal: 2, totalInvoiced: 200 }),
        makeMonthlyData({ month: '2025-02', countTotal: 5, totalInvoiced: 1000 }),
        makeMonthlyData({ month: '2025-03', countTotal: 0, totalInvoiced: 0 }),
      ];
      const result = calculateMonthlyAverageValue(input);
      expect(result.map((r) => r.averageValue)).toEqual([100, 200, 0]);
    });
  });
});


describe('calculateInvoiceSummary', () => {
  it('should return zeroed summary for empty array', () => {
    const result = calculateInvoiceSummary([]);
    expect(result).toEqual({
      totalInvoiced: 0,
      totalPaid: 0,
      totalPending: 0,
      totalIva: 0,
      countTotal: 0,
      countPaid: 0,
      countPending: 0,
      countWithIva: 0,
    });
  });

  it('should calculate totals for mixed paid and unpaid invoices', () => {
    const invoices: InvoiceData[] = [
      makeInvoice({ id: '1', total_amount: 1000, iva_amount: 210, paid: true }),
      makeInvoice({ id: '2', total_amount: 500, iva_amount: 105, paid: false }),
      makeInvoice({ id: '3', total_amount: 300, iva_amount: 0, paid: true }),
    ];
    const result = calculateInvoiceSummary(invoices);

    expect(result.totalInvoiced).toBe(1800);
    expect(result.totalPaid).toBe(1300);
    expect(result.totalPending).toBe(500);
    expect(result.totalIva).toBe(315);
    expect(result.countTotal).toBe(3);
    expect(result.countPaid).toBe(2);
    expect(result.countPending).toBe(1);
    expect(result.countWithIva).toBe(2);
  });

  it('should count countWithIva only for invoices with iva_amount > 0', () => {
    const invoices: InvoiceData[] = [
      makeInvoice({ id: '1', iva_amount: 0, paid: false }),
      makeInvoice({ id: '2', iva_amount: 0, paid: true }),
      makeInvoice({ id: '3', iva_amount: 50, paid: false }),
      makeInvoice({ id: '4', iva_amount: 100, paid: true }),
    ];
    const result = calculateInvoiceSummary(invoices);
    expect(result.countWithIva).toBe(2);
  });

  it('should return countWithIva=0 when no invoices have IVA', () => {
    const invoices: InvoiceData[] = [
      makeInvoice({ id: '1', iva_amount: 0, paid: false }),
      makeInvoice({ id: '2', iva_amount: 0, paid: true }),
    ];
    const result = calculateInvoiceSummary(invoices);
    expect(result.countWithIva).toBe(0);
    expect(result.totalIva).toBe(0);
  });
});
